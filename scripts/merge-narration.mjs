/**
 * merge-narration.mjs
 *
 * 各シーンの VOICEVOX WAV ファイルを絶対フレーム位置に配置して
 * 1本の WAV ファイル（antarctic-narration-merged.wav）に結合します。
 *
 * Usage: node scripts/merge-narration.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_AUDIO = path.join(__dirname, "..", "public", "audio");

// ─── 動画パラメータ ─────────────────────────────────────────────
const FPS = 30;
const TOTAL_FRAMES = 1440; // 48秒

// AntarcticTreaty.tsx の AUDIO_TRACKS と完全一致させる
const AUDIO_TRACKS = [
  { id: "title",      src: "antarctic-title.wav",       from: 0    + 20 },
  { id: "intro",      src: "antarctic-intro.wav",       from: 90   + 15 },
  { id: "history",    src: "antarctic-history.wav",     from: 330  + 15 },
  { id: "provision1", src: "antarctic-provision-1.wav", from: 600  + 15 },
  { id: "provision2", src: "antarctic-provision-2.wav", from: 705  + 15 },
  { id: "provision3", src: "antarctic-provision-3.wav", from: 810  + 15 },
  { id: "provision4", src: "antarctic-provision-4.wav", from: 915  + 15 },
  { id: "status",     src: "antarctic-status.wav",      from: 1020 + 15 },
  { id: "outro",      src: "antarctic-outro.wav",       from: 1290 + 20 },
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
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const chunkData = offset + 8;

    if (chunkId === "fmt ") {
      fmt = {
        audioFormat:   buf.readUInt16LE(chunkData),      // 1=PCM
        numChannels:   buf.readUInt16LE(chunkData + 2),
        sampleRate:    buf.readUInt32LE(chunkData + 4),
        byteRate:      buf.readUInt32LE(chunkData + 8),
        blockAlign:    buf.readUInt16LE(chunkData + 12),
        bitsPerSample: buf.readUInt16LE(chunkData + 14),
      };
    } else if (chunkId === "data") {
      dataOffset = chunkData;
      dataSize = chunkSize;
    }

    offset = chunkData + chunkSize;
    if (chunkSize % 2 !== 0) offset++; // word alignment
  }

  if (!fmt) throw new Error("No fmt chunk found");
  if (dataOffset < 0) throw new Error("No data chunk found");

  return { fmt, dataOffset, dataSize, pcm: buf.slice(dataOffset, dataOffset + dataSize) };
}

// ─── WAV ヘッダー書き込み ────────────────────────────────────────
function buildWavHeader(fmt, dataSize) {
  const header = Buffer.alloc(44);
  const fileSize = 36 + dataSize;

  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);                      // fmt chunk size
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
  console.log("🎵 WAV マージ処理を開始します...\n");

  // 最初の有効なファイルからフォーマットを取得
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
      wav.fmt.sampleRate !== masterFmt.sampleRate ||
      wav.fmt.numChannels !== masterFmt.numChannels ||
      wav.fmt.bitsPerSample !== masterFmt.bitsPerSample
    ) {
      throw new Error(
        `${track.src} のフォーマットが一致しません: ` +
        `${wav.fmt.sampleRate}Hz/${wav.fmt.numChannels}ch/${wav.fmt.bitsPerSample}bit ` +
        `vs ${masterFmt.sampleRate}Hz/${masterFmt.numChannels}ch/${masterFmt.bitsPerSample}bit`
      );
    }

    trackData.push({ track, wav });
    const durationSec = wav.pcm.length / (masterFmt.byteRate);
    console.log(`  ✅ ${track.src} (開始フレーム: ${track.from}, 長さ: ${durationSec.toFixed(2)}秒)`);
  }

  if (!masterFmt) {
    throw new Error("有効な WAV ファイルが1つも見つかりませんでした。先に `npm run voicevox` を実行してください。");
  }

  // 動画全体の長さ分のバッファをゼロで初期化
  const totalSamples = Math.ceil((TOTAL_FRAMES / FPS) * masterFmt.sampleRate);
  const bytesPerSample = masterFmt.bitsPerSample / 8;
  const totalBytes = totalSamples * masterFmt.numChannels * bytesPerSample;
  const mergedPcm = Buffer.alloc(totalBytes, 0); // silence = 0

  console.log(`\n📼 マージバッファ: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   総サンプル数: ${totalSamples.toLocaleString()}\n`);

  // 各トラックを絶対フレーム位置に配置
  for (const item of trackData) {
    if (!item) continue;
    const { track, wav } = item;

    // フレーム→バイトオフセット計算
    const startSample = Math.floor((track.from / FPS) * masterFmt.sampleRate);
    const startByte = startSample * masterFmt.numChannels * bytesPerSample;

    // バッファ範囲チェック
    const endByte = startByte + wav.pcm.length;
    if (endByte > totalBytes) {
      console.warn(`  ⚠️  ${track.src}: 音声がバッファ末尾を超えます（${endByte} > ${totalBytes}）— クリップします`);
      wav.pcm.copy(mergedPcm, startByte, 0, totalBytes - startByte);
    } else {
      wav.pcm.copy(mergedPcm, startByte);
    }

    const startSec = (track.from / FPS).toFixed(2);
    const endSec = ((track.from / FPS) + wav.pcm.length / masterFmt.byteRate).toFixed(2);
    console.log(`  🔊 ${track.id}: ${startSec}s 〜 ${endSec}s に配置`);
  }

  // WAV ファイルとして書き出し
  const header = buildWavHeader(masterFmt, totalBytes);
  const outputPath = path.join(PUBLIC_AUDIO, "antarctic-narration-merged.wav");
  const outStream = fs.createWriteStream(outputPath);
  outStream.write(header);
  outStream.write(mergedPcm);
  outStream.end();

  await new Promise((resolve, reject) => {
    outStream.on("finish", resolve);
    outStream.on("error", reject);
  });

  const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n✨ マージ完了!`);
  console.log(`   出力先: public/audio/antarctic-narration-merged.wav`);
  console.log(`   ファイルサイズ: ${fileSizeMB} MB`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
