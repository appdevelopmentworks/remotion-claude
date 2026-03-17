/**
 * merge-cat-narration.mjs
 *
 * 「猫とICチップ」の個別 WAV ファイルを絶対フレーム位置に配置して
 * 1本の WAV ファイル（cat-narration-merged.wav）に結合します。
 *
 * ※ CatMicrochip.tsx の CAT_AUDIO_TRACKS と from の値を完全一致させること
 *
 * Usage: node scripts/merge-cat-narration.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_AUDIO = path.join(__dirname, "..", "public", "audio");

// ─── 動画パラメータ ─────────────────────────────────────────────
const FPS = 30;
const TOTAL_FRAMES = 2100; // 70秒

// SCENE_STARTS (constants.ts と一致) :
//   title:   0,   what: 240,  why:  660,
//   how:  1050,   law: 1410,  summary: 1800
//
// ※ from = SCENE_STARTS[key] + offset (title=20, others=15)
const AUDIO_TRACKS = [
  { id: "title",   src: "cat-title.wav",   from: 0    + 20 }, //  20
  { id: "what",    src: "cat-what.wav",    from: 240  + 15 }, // 255
  { id: "why",     src: "cat-why.wav",     from: 660  + 15 }, // 675
  { id: "how",     src: "cat-how.wav",     from: 1050 + 15 }, // 1065
  { id: "law",     src: "cat-law.wav",     from: 1410 + 15 }, // 1425
  { id: "summary", src: "cat-summary.wav", from: 1800 + 15 }, // 1815
];

// ─── WAV ヘッダー解析 ───────────────────────────────────────────
function parseWav(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("Not a RIFF file");
  if (buf.toString("ascii", 8, 12) !== "WAVE") throw new Error("Not a WAVE file");

  let offset = 12;
  let fmt = null;
  let dataOffset = -1;
  let dataSize = -1;

  while (offset < buf.length - 8) {
    const chunkId   = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const chunkData = offset + 8;

    if (chunkId === "fmt ") {
      fmt = {
        audioFormat:   buf.readUInt16LE(chunkData),
        numChannels:   buf.readUInt16LE(chunkData + 2),
        sampleRate:    buf.readUInt32LE(chunkData + 4),
        byteRate:      buf.readUInt32LE(chunkData + 8),
        blockAlign:    buf.readUInt16LE(chunkData + 12),
        bitsPerSample: buf.readUInt16LE(chunkData + 14),
      };
    } else if (chunkId === "data") {
      dataOffset = chunkData;
      dataSize   = chunkSize;
    }

    offset = chunkData + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }

  if (!fmt) throw new Error("fmt chunk が見つかりません");
  if (dataOffset < 0) throw new Error("data chunk が見つかりません");

  return { fmt, pcm: buf.slice(dataOffset, dataOffset + dataSize) };
}

// ─── WAV ヘッダー書き込み ────────────────────────────────────────
function buildWavHeader(fmt, dataSize) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);                       // PCM
  header.writeUInt16LE(fmt.numChannels, 22);
  header.writeUInt32LE(fmt.sampleRate, 24);
  header.writeUInt32LE(fmt.byteRate, 28);
  header.writeUInt16LE(fmt.blockAlign, 32);
  header.writeUInt16LE(fmt.bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return header;
}

// ─── メイン処理 ─────────────────────────────────────────────────
async function main() {
  console.log("🐱 猫とICチップ — WAV マージ処理を開始します...\n");

  let masterFmt = null;
  const trackData = [];

  for (const track of AUDIO_TRACKS) {
    const filePath = path.join(PUBLIC_AUDIO, track.src);

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  スキップ: ${track.src} が見つかりません`);
      trackData.push(null);
      continue;
    }

    const buf = fs.readFileSync(filePath);
    const wav = parseWav(buf);

    if (!masterFmt) {
      masterFmt = wav.fmt;
      console.log(`📊 音声フォーマット:`);
      console.log(`   サンプルレート: ${masterFmt.sampleRate} Hz`);
      console.log(`   チャンネル数:   ${masterFmt.numChannels}`);
      console.log(`   ビット深度:     ${masterFmt.bitsPerSample} bit\n`);
    }

    // フォーマット不一致チェック
    if (
      wav.fmt.sampleRate    !== masterFmt.sampleRate    ||
      wav.fmt.numChannels   !== masterFmt.numChannels   ||
      wav.fmt.bitsPerSample !== masterFmt.bitsPerSample
    ) {
      throw new Error(`${track.src} のフォーマットが不一致`);
    }

    trackData.push({ track, wav });
    const sec = (wav.pcm.length / masterFmt.byteRate).toFixed(2);
    console.log(`  ✅ ${track.src} (開始フレーム: ${track.from}, 長さ: ${sec}秒)`);
  }

  if (!masterFmt) {
    throw new Error(
      "有効な WAV ファイルが1つも見つかりません。先に `npm run voicevox:cat` を実行してください。"
    );
  }

  // 動画全体分（70秒）のバッファをゼロ（無音）で初期化
  const totalSamples = Math.ceil((TOTAL_FRAMES / FPS) * masterFmt.sampleRate);
  const bytesPerSample = masterFmt.bitsPerSample / 8;
  const totalBytes = totalSamples * masterFmt.numChannels * bytesPerSample;
  const mergedPcm = Buffer.alloc(totalBytes, 0);

  console.log(`\n📼 マージバッファ: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   総サンプル数: ${totalSamples.toLocaleString()}\n`);

  // 各トラックを絶対フレーム位置に配置
  for (const item of trackData) {
    if (!item) continue;
    const { track, wav } = item;

    const startSample = Math.floor((track.from / FPS) * masterFmt.sampleRate);
    const startByte   = startSample * masterFmt.numChannels * bytesPerSample;
    const endByte     = startByte + wav.pcm.length;

    if (endByte > totalBytes) {
      console.warn(`  ⚠️  ${track.src}: バッファ末尾を超えるためクリップします`);
      wav.pcm.copy(mergedPcm, startByte, 0, totalBytes - startByte);
    } else {
      wav.pcm.copy(mergedPcm, startByte);
    }

    const startSec = (track.from / FPS).toFixed(2);
    const endSec   = ((track.from / FPS) + wav.pcm.length / masterFmt.byteRate).toFixed(2);
    console.log(`  🔊 ${track.id}: ${startSec}s 〜 ${endSec}s に配置`);
  }

  // WAV として書き出し
  const header     = buildWavHeader(masterFmt, totalBytes);
  const outputPath = path.join(PUBLIC_AUDIO, "cat-narration-merged.wav");
  const outStream  = fs.createWriteStream(outputPath);
  outStream.write(header);
  outStream.write(mergedPcm);
  outStream.end();

  await new Promise((resolve, reject) => {
    outStream.on("finish", resolve);
    outStream.on("error", reject);
  });

  const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n✨ マージ完了!`);
  console.log(`   出力先: public/audio/cat-narration-merged.wav`);
  console.log(`   ファイルサイズ: ${sizeMB} MB`);
  console.log(`\n▶️  次のステップ: npm start で Remotion Studio を起動してください`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
