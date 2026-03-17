---
name: voicevox
description: Adding Japanese TTS narration to Remotion compositions using VOICEVOX (local API, free, no API key required)
metadata:
  tags: voicevox, audio, tts, japanese, narration, wav, merge
---

# VOICEVOX narration for Remotion

Use the free local VOICEVOX application to generate Japanese TTS narration, merge per-scene WAVs into a single file, and play it back in Remotion with a single `<Audio>` component.

## Prerequisites

1. Install [VOICEVOX](https://voicevox.hiroshiba.jp/) desktop app
2. Launch VOICEVOX (it starts a local API server at `http://localhost:50021`)
3. Keep VOICEVOX running while the generation script executes

Alternatively, run the VOICEVOX Engine as a Docker container:
```bash
docker run --rm -it -p 50021:50021 voicevox/voicevox_engine
```

## How the workflow works

```
台本テキスト
    ↓ scripts/generate-*-voicevox.mjs
public/audio/scene-01.wav, scene-02.wav, ...
    ↓ scripts/merge-*-narration.mjs
public/audio/narration-merged.wav
    ↓ Remotion component
<Audio src={staticFile("audio/narration-merged.wav")} />
```

## Recommended speakers (speaker IDs)

Check available speakers with `--list-speakers`. Common ones:
- `3`  : ずんだもん（ノーマル）
- `8`  : 春日部つむぎ（ノーマル）
- `13` : 青山龍星（ノーマル）— calm male voice
- `20` : もち子(cv 明日葉よもぎ)（ノーマル）— warm female voice

## Speech rate estimate

Japanese TTS with VOICEVOX at `speedScale: 1.0` ≈ **6 characters/second**.
Use this to estimate scene durations before generating audio:
- 40 chars → ~7 seconds → 210 frames at 30fps
- 80 chars → ~13 seconds → 390 frames at 30fps
- 100 chars → ~17 seconds → 510 frames at 30fps

Always add 3–4 seconds of buffer per scene so visuals finish after speech.

## Generating WAV files: generate script template

```js
// scripts/generate-my-voicevox.mjs
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "public", "audio");
const VOICEVOX_URL = "http://localhost:50021";

const args = process.argv.slice(2);
const speakerArg = args.indexOf("--speaker");
const SPEAKER_ID = speakerArg !== -1 ? Number(args[speakerArg + 1]) : 3;
const LIST_SPEAKERS = args.includes("--list-speakers");

// Define narration texts per scene
const NARRATIONS = [
  { id: "my-video-intro",  text: "ナレーションテキストその1。" },
  { id: "my-video-scene1", text: "ナレーションテキストその2。" },
  { id: "my-video-outro",  text: "ナレーションテキストその3。" },
];

async function checkVoicevox() {
  try {
    const res = await fetch(`${VOICEVOX_URL}/version`);
    const version = await res.text();
    console.log(`✅ VOICEVOX OK (version: ${version.trim()})`);
    return true;
  } catch {
    console.error("❌ VOICEVOX に接続できません。アプリを起動してください。");
    return false;
  }
}

async function listSpeakers() {
  const res = await fetch(`${VOICEVOX_URL}/speakers`);
  const speakers = await res.json();
  for (const speaker of speakers) {
    for (const style of speaker.styles) {
      console.log(`  ID ${String(style.id).padStart(3)}: ${speaker.name} (${style.name})`);
    }
  }
}

async function synthesize(text, speakerId) {
  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    { method: "POST" }
  );
  if (!queryRes.ok) throw new Error(`audio_query failed: ${queryRes.status}`);
  const query = await queryRes.json();

  // Adjust voice parameters as needed
  query.speedScale      = 1.0;  // 0.5–2.0
  query.volumeScale     = 1.0;
  query.pitchScale      = 0.0;
  query.intonationScale = 1.0;

  const synthRes = await fetch(`${VOICEVOX_URL}/synthesis?speaker=${speakerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!synthRes.ok) throw new Error(`synthesis failed: ${synthRes.status}`);
  return Buffer.from(await synthRes.arrayBuffer());
}

async function main() {
  const ok = await checkVoicevox();
  if (!ok) process.exit(1);

  if (LIST_SPEAKERS) { await listSpeakers(); return; }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  let success = 0, failed = 0;

  for (const narration of NARRATIONS) {
    const outputPath = join(OUTPUT_DIR, `${narration.id}.wav`);
    process.stdout.write(`  生成中: ${narration.id}.wav ... `);
    try {
      const audio = await synthesize(narration.text, SPEAKER_ID);
      writeFileSync(outputPath, audio);
      console.log(`✅ (${(audio.length / 1024).toFixed(1)} KB / ${narration.text.length}文字)`);
      success++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }
  console.log(`\n✨ ${success}件成功 / ${failed}件失敗`);
  console.log(`▶️  次: npm run merge-audio:my-video`);
}

main().catch(console.error);
```

## Merging WAV files: merge script template

Allocate a zero-filled buffer for the full video duration and copy each track's PCM at its absolute byte offset.

```js
// scripts/merge-my-narration.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_AUDIO = path.join(__dirname, "..", "public", "audio");

const FPS = 30;
const TOTAL_FRAMES = 900; // total video length in frames

// from = frame at which each narration should start playing
// Must match the `from` values in constants.ts / AUDIO_TRACKS
const AUDIO_TRACKS = [
  { id: "intro",  src: "my-video-intro.wav",  from:  20 },
  { id: "scene1", src: "my-video-scene1.wav", from: 120 },
  { id: "outro",  src: "my-video-outro.wav",  from: 600 },
];

function parseWav(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("Not RIFF");
  let offset = 12, fmt = null, dataOffset = -1, dataSize = -1;
  while (offset < buf.length - 8) {
    const chunkId   = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const chunkData = offset + 8;
    if (chunkId === "fmt ") {
      fmt = {
        numChannels:  buf.readUInt16LE(chunkData + 2),
        sampleRate:   buf.readUInt32LE(chunkData + 4),
        byteRate:     buf.readUInt32LE(chunkData + 8),
        blockAlign:   buf.readUInt16LE(chunkData + 12),
        bitsPerSample: buf.readUInt16LE(chunkData + 14),
      };
    } else if (chunkId === "data") {
      dataOffset = chunkData;
      dataSize   = chunkSize;
    }
    offset = chunkData + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  if (!fmt || dataOffset < 0) throw new Error("Invalid WAV");
  return { fmt, pcm: buf.slice(dataOffset, dataOffset + dataSize) };
}

function buildWavHeader(fmt, dataSize) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + dataSize, 4);
  h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20);
  h.writeUInt16LE(fmt.numChannels, 22); h.writeUInt32LE(fmt.sampleRate, 24);
  h.writeUInt32LE(fmt.byteRate, 28);    h.writeUInt16LE(fmt.blockAlign, 32);
  h.writeUInt16LE(fmt.bitsPerSample, 34);
  h.write("data", 36); h.writeUInt32LE(dataSize, 40);
  return h;
}

async function main() {
  let masterFmt = null;
  const trackData = [];

  for (const track of AUDIO_TRACKS) {
    const filePath = path.join(PUBLIC_AUDIO, track.src);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  スキップ: ${track.src} が見つかりません`);
      trackData.push(null);
      continue;
    }
    const wav = parseWav(fs.readFileSync(filePath));
    if (!masterFmt) masterFmt = wav.fmt;
    trackData.push({ track, wav });
    console.log(`  ✅ ${track.src}`);
  }

  if (!masterFmt) throw new Error("有効な WAV が見つかりません");

  const bytesPerSample = masterFmt.bitsPerSample / 8;
  const totalBytes = Math.ceil((TOTAL_FRAMES / FPS) * masterFmt.sampleRate)
    * masterFmt.numChannels * bytesPerSample;
  const mergedPcm = Buffer.alloc(totalBytes, 0);

  for (const item of trackData) {
    if (!item) continue;
    const { track, wav } = item;
    const startByte = Math.floor((track.from / FPS) * masterFmt.sampleRate)
      * masterFmt.numChannels * bytesPerSample;
    const endByte = startByte + wav.pcm.length;
    wav.pcm.copy(mergedPcm, startByte, 0, Math.min(wav.pcm.length, totalBytes - startByte));
    console.log(`  🔊 ${track.id}: ${(track.from/FPS).toFixed(2)}s 〜 ${(endByte/masterFmt.byteRate).toFixed(2)}s`);
  }

  const outputPath = path.join(PUBLIC_AUDIO, "my-narration-merged.wav");
  const out = fs.createWriteStream(outputPath);
  out.write(buildWavHeader(masterFmt, totalBytes));
  out.write(mergedPcm);
  out.end();
  await new Promise((res, rej) => { out.on("finish", res); out.on("error", rej); });

  console.log(`✨ マージ完了: ${outputPath}`);
  console.log(`▶️  次: npm run captions:my-video  または  npm start`);
}

main().catch(console.error);
```

## Using the merged WAV in Remotion

Place a single `<Audio>` at the top level of the composition. Do **not** use multiple `<Audio>` components (causes multiple audio bars in Studio timeline).

```tsx
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Series } from "remotion";

export const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Single merged audio track for the entire video */}
      <Audio src={staticFile("audio/my-narration-merged.wav")} volume={1} />

      <Series>
        <Series.Sequence durationInFrames={300} premountFor={60}>
          <IntroScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600} premountFor={60}>
          <MainScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
```

## constants.ts pattern

Keep frame numbers in a central constants file. The `from` values must be **identical** in both the merge script and the component.

```ts
// src/MyVideo/constants.ts
export const SCENE_DURATIONS = {
  intro:  300,  // 10秒 (音声7秒 + 余裕3秒)
  main:   600,  // 20秒
  outro:  300,  // 10秒
} as const;

type SceneKey = keyof typeof SCENE_DURATIONS;
export const SCENE_STARTS = Object.keys(SCENE_DURATIONS).reduce(
  (acc, key, i, keys) => {
    acc[key as SceneKey] = i === 0 ? 0
      : acc[keys[i - 1] as SceneKey] + SCENE_DURATIONS[keys[i - 1] as SceneKey];
    return acc;
  },
  {} as Record<SceneKey, number>
);

export const MY_VIDEO_TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

// Audio tracks — from = SCENE_STARTS[key] + offset
// (offset of 15–20 frames gives a brief visual lead-in before speech)
export const MY_VIDEO_AUDIO_TRACKS = [
  { id: "intro",  src: "my-video-intro.wav",  from: SCENE_STARTS.intro  + 20 },
  { id: "main",   src: "my-video-main.wav",   from: SCENE_STARTS.main   + 15 },
  { id: "outro",  src: "my-video-outro.wav",  from: SCENE_STARTS.outro  + 15 },
] as const;
```

## Adding scripts to package.json

```json
{
  "scripts": {
    "voicevox:my-video": "node scripts/generate-my-voicevox.mjs",
    "voicevox:my-video:speakers": "node scripts/generate-my-voicevox.mjs --list-speakers",
    "merge-audio:my-video": "node scripts/merge-my-narration.mjs"
  }
}
```
