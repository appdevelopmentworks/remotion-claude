/**
 * merge-religion-narration.mjs
 *
 * 「世界三大宗教」の個別 WAV を絶対フレーム位置に配置して
 * 1本の religion-narration-merged.wav に結合します。
 *
 * ※ constants.ts の RELIGION_AUDIO_TRACKS と from の値を必ず一致させること
 *
 * Usage: node scripts/merge-religion-narration.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_AUDIO = path.join(__dirname, "..", "public", "audio");

const FPS = 30;
const TOTAL_FRAMES = 2250; // 75秒

// constants.ts の RELIGION_AUDIO_TRACKS と完全一致
// from = SCENE_STARTS[key] + offset
//   title:        0    + 20 =   20
//   christianity: 330  + 15 =  345
//   islam:        840  + 15 =  855  ← islam は SCENE_STARTS.islam(330+510=840)
//   buddhism:     1380 + 15 = 1395  ← buddhism は 840+540=1380
//   summary:      1860 + 15 = 1875  ← summary は 1380+480=1860
const AUDIO_TRACKS = [
  { id: "title",        src: "religion-title.wav",        from:  20 },
  { id: "christianity", src: "religion-christianity.wav", from: 345 },
  { id: "islam",        src: "religion-islam.wav",        from: 855 },
  { id: "buddhism",     src: "religion-buddhism.wav",     from: 1395 },
  { id: "summary",      src: "religion-summary.wav",      from: 1875 },
];

// ─── WAV 解析 ───────────────────────────────────────────────────────────
function parseWav(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("Not a RIFF file");
  if (buf.toString("ascii", 8, 12) !== "WAVE") throw new Error("Not a WAVE file");
  let offset = 12, fmt = null, dataOffset = -1, dataSize = -1;
  while (offset < buf.length - 8) {
    const chunkId   = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const chunkData = offset + 8;
    if (chunkId === "fmt ") {
      fmt = {
        numChannels: buf.readUInt16LE(chunkData + 2),
        sampleRate:  buf.readUInt32LE(chunkData + 4),
        byteRate:    buf.readUInt32LE(chunkData + 8),
        blockAlign:  buf.readUInt16LE(chunkData + 12),
        bitsPerSample: buf.readUInt16LE(chunkData + 14),
      };
    } else if (chunkId === "data") {
      dataOffset = chunkData;
      dataSize   = chunkSize;
    }
    offset = chunkData + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  if (!fmt) throw new Error("fmt chunk なし");
  if (dataOffset < 0) throw new Error("data chunk なし");
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

// ─── メイン ─────────────────────────────────────────────────────────────
async function main() {
  console.log("🌍 世界三大宗教 — WAV マージ処理を開始します...\n");

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
    if (!masterFmt) {
      masterFmt = wav.fmt;
      console.log(`📊 音声フォーマット: ${masterFmt.sampleRate}Hz / ${masterFmt.numChannels}ch / ${masterFmt.bitsPerSample}bit\n`);
    }
    trackData.push({ track, wav });
    console.log(`  ✅ ${track.src} (開始: frame${track.from} = ${(track.from/FPS).toFixed(2)}s, 長さ: ${(wav.pcm.length/masterFmt.byteRate).toFixed(2)}s)`);
  }

  if (!masterFmt) {
    throw new Error("有効な WAV が見つかりません。先に `npm run voicevox:religion` を実行してください。");
  }

  const totalSamples  = Math.ceil((TOTAL_FRAMES / FPS) * masterFmt.sampleRate);
  const bytesPerSample = masterFmt.bitsPerSample / 8;
  const totalBytes    = totalSamples * masterFmt.numChannels * bytesPerSample;
  const mergedPcm     = Buffer.alloc(totalBytes, 0);

  console.log(`\n📼 マージバッファ: ${(totalBytes / 1024 / 1024).toFixed(2)} MB\n`);

  for (const item of trackData) {
    if (!item) continue;
    const { track, wav } = item;
    const startByte = Math.floor((track.from / FPS) * masterFmt.sampleRate) * masterFmt.numChannels * bytesPerSample;
    const endByte   = startByte + wav.pcm.length;
    if (endByte > totalBytes) {
      wav.pcm.copy(mergedPcm, startByte, 0, totalBytes - startByte);
    } else {
      wav.pcm.copy(mergedPcm, startByte);
    }
    const s = (track.from / FPS).toFixed(2);
    const e = ((track.from / FPS) + wav.pcm.length / masterFmt.byteRate).toFixed(2);
    console.log(`  🔊 ${track.id}: ${s}s 〜 ${e}s に配置`);
  }

  const header     = buildWavHeader(masterFmt, totalBytes);
  const outputPath = path.join(PUBLIC_AUDIO, "religion-narration-merged.wav");
  const out        = fs.createWriteStream(outputPath);
  out.write(header);
  out.write(mergedPcm);
  out.end();
  await new Promise((res, rej) => { out.on("finish", res); out.on("error", rej); });

  console.log(`\n✨ マージ完了! → public/audio/religion-narration-merged.wav`);
  console.log(`   サイズ: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n▶️  次のステップ: npm run captions:religion`);
}

main().catch((err) => { console.error("❌ エラー:", err.message); process.exit(1); });
