---
name: voicevox-captions
description: Generating synchronized caption JSON from VOICEVOX WAV files and script text (without Whisper), for display with @remotion/captions
metadata:
  tags: voicevox, captions, subtitles, japanese, caption-sync, wav-duration
---

# Generating captions from VOICEVOX narration (no Whisper required)

When using VOICEVOX for Japanese TTS, you already have the exact script text that was spoken. Instead of running Whisper to transcribe, generate caption timing by:
1. Reading the actual duration of each WAV file from its RIFF header
2. Splitting the script text at sentence boundaries (。、！？)
3. Assigning timestamps proportional to character count within each WAV's duration

This approach is more reliable for Japanese than Whisper because the script text is exact.

## Prerequisites

- WAV files already generated (see [voicevox.md](./voicevox.md))
- `@remotion/captions` installed (`npx remotion add @remotion/captions`)
- `public/captions/` directory (created automatically by the script)

## Caption generation script template

```js
// scripts/generate-my-captions.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const AUDIO_DIR  = path.join(ROOT, "public", "audio");
const OUTPUT_DIR = path.join(ROOT, "public", "captions");

const FPS = 30;

// Must match AUDIO_TRACKS in constants.ts exactly (same src and from values)
const TRACKS = [
  {
    id:   "intro",
    src:  "my-video-intro.wav",
    from: 20,   // frame at which audio starts
    text: "イントロのナレーションテキスト。文章はここに書く。",
  },
  {
    id:   "scene1",
    src:  "my-video-scene1.wav",
    from: 120,
    text: "シーン1のナレーションテキスト。複数の文があってもよい。",
  },
  {
    id:   "outro",
    src:  "my-video-outro.wav",
    from: 600,
    text: "アウトロのテキスト。",
  },
];

// Read actual playback duration from WAV RIFF header (no external dependency)
function getWavDurationMs(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
  let offset = 12, byteRate = null, dataSize = null;
  while (offset < buf.length - 8) {
    const chunkId   = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === "fmt ")  byteRate = buf.readUInt32LE(offset + 12);
    if (chunkId === "data")  { dataSize = chunkSize; break; }
    offset = offset + 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  if (!byteRate || !dataSize) return null;
  return (dataSize / byteRate) * 1000; // milliseconds
}

// Split Japanese text at sentence boundaries.
// The delimiter is kept at the end of each phrase.
function splitPhrases(text) {
  return text.split(/(?<=[。、！？])/).filter((p) => p.trim().length > 0);
}

// Convert phrases to Caption[] with timing proportional to character count.
// @remotion/captions Caption type: { text, startMs, endMs, timestampMs, confidence }
function toCaptions(phrases, globalStartMs, durationMs) {
  const totalChars = phrases.reduce((s, p) => s + p.length, 0);
  const captions = [];
  let currentMs = globalStartMs;

  for (const phrase of phrases) {
    const ratio    = phrase.length / totalChars;
    const phraseMs = durationMs * ratio;
    captions.push({
      text:        phrase,
      startMs:     Math.round(currentMs),
      endMs:       Math.round(currentMs + phraseMs),
      timestampMs: Math.round(currentMs),
      confidence:  null,
    });
    currentMs += phraseMs;
  }
  return captions;
}

function main() {
  console.log("字幕 JSON 生成\n");

  const allCaptions = [];

  for (const track of TRACKS) {
    const filePath   = path.join(AUDIO_DIR, track.src);
    const durationMs = getWavDurationMs(filePath);

    if (!durationMs) {
      console.warn(`  ⚠️  スキップ: ${track.src} が見つかりません`);
      console.warn(`     先に voicevox スクリプトを実行してください`);
      continue;
    }

    // Absolute global start time in ms (frame position → milliseconds)
    const globalStartMs = (track.from / FPS) * 1000;
    const phrases       = splitPhrases(track.text);
    const captions      = toCaptions(phrases, globalStartMs, durationMs);
    allCaptions.push(...captions);

    console.log(`  ✅ ${track.id}: ${phrases.length}フレーズ, ${(durationMs/1000).toFixed(1)}秒`);
    phrases.forEach((p, i) => {
      const c = captions[i];
      console.log(`     [${(c.startMs/1000).toFixed(2)}s〜${(c.endMs/1000).toFixed(2)}s] ${p}`);
    });
  }

  if (allCaptions.length === 0) {
    console.error("❌ WAV ファイルが見つかりません。voicevox スクリプトを先に実行してください。");
    process.exit(1);
  }

  allCaptions.sort((a, b) => a.startMs - b.startMs);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, "my-video-captions.json");
  fs.writeFileSync(outputPath, JSON.stringify(allCaptions, null, 2), "utf-8");

  console.log(`\n✨ ${allCaptions.length} フレーズ → ${outputPath}`);
  console.log(`▶️  次: npm start → Studio でプレビュー`);
}

main();
```

## CaptionOverlay component

Create a separate `CaptionOverlay.tsx` component. Overlay it on top of all scenes in the main composition.

```tsx
// src/MyVideo/CaptionOverlay.tsx
import { useState, useEffect, useCallback } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
  cancelRender,
} from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";

// How many ms of captions to show on one page (higher = more words per page)
const COMBINE_MS = 3000;

export const CaptionOverlay: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("loading captions"));

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(staticFile("captions/my-video-captions.json"));
      const data: Caption[] = await res.json();
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle]);

  useEffect(() => { fetchCaptions(); }, [fetchCaptions]);

  if (!captions) return null;

  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: COMBINE_MS,
  });

  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = nextPage
          ? Math.round((nextPage.startMs / 1000) * fps)
          : startFrame + Math.round((COMBINE_MS / 1000) * fps);
        const durationInFrames = endFrame - startFrame;
        if (durationInFrames <= 0) return null;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // absoluteMs: convert local frame to absolute video time
  const absoluteMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 60,
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: "bold",
          color: "#FFFFFF",
          textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
          textAlign: "center",
          whiteSpace: "pre",
          maxWidth: "80%",
          lineHeight: 1.5,
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteMs && token.toMs > absoluteMs;
          return (
            <span
              key={token.fromMs}
              style={{ color: isActive ? "#FFD700" : "#FFFFFF" }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

## Using CaptionOverlay in the main composition

```tsx
// src/MyVideo/MyVideo.tsx
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { CaptionOverlay } from "./CaptionOverlay";

export const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/my-narration-merged.wav")} volume={1} />

      {/* Scene content */}
      <Series>
        <Series.Sequence durationInFrames={300} premountFor={60}>
          <IntroScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600} premountFor={60}>
          <MainScene />
        </Series.Sequence>
      </Series>

      {/* Captions overlay — on top of everything */}
      <CaptionOverlay />
    </AbsoluteFill>
  );
};
```

## Complete workflow

```bash
# 1. Generate WAV files (VOICEVOX must be running)
npm run voicevox:my-video

# 2. Merge WAVs into one timeline-aligned file
npm run merge-audio:my-video

# 3. Generate caption JSON from WAV durations + script text
npm run captions:my-video

# 4. Preview in Studio
npm start
```

Add to package.json:
```json
{
  "scripts": {
    "voicevox:my-video":   "node scripts/generate-my-voicevox.mjs",
    "merge-audio:my-video": "node scripts/merge-my-narration.mjs",
    "captions:my-video":   "node scripts/generate-my-captions.mjs"
  }
}
```

## Timing accuracy notes

- Character-proportional timing is approximate. Pauses at sentence boundaries are not modeled.
- Longer sentences will feel slightly fast; short exclamatory sentences slightly slow.
- For higher accuracy, consider splitting the NARRATIONS array into shorter phrases before passing to VOICEVOX (one caption phrase per synthesis call), which gives a 1:1 mapping between audio segment and caption.
