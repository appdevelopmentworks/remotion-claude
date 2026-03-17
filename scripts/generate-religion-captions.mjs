/**
 * generate-religion-captions.mjs
 *
 * @remotion/captions の Caption 形式に準拠した字幕 JSON を生成します。
 *
 * 処理の流れ:
 *  1. 各 WAV ファイルをパースして実際の再生時間（ms）を取得
 *  2. 台本テキストを句読点（。、！？）で分割してフレーズ化
 *  3. フレーズの文字数に比例してタイムスタンプを割り当て
 *  4. 全フレーズをグローバル絶対時刻に変換して JSON として保存
 *
 * 出力: public/captions/religion-captions.json  （Caption[] 形式）
 *
 * Usage: node scripts/generate-religion-captions.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const AUDIO_DIR  = path.join(ROOT, "public", "audio");
const OUTPUT_DIR = path.join(ROOT, "public", "captions");

const FPS = 30;

// constants.ts の RELIGION_AUDIO_TRACKS と完全一致
const TRACKS = [
  {
    id:   "title",
    src:  "religion-title.wav",
    from: 20,
    text: "世界三大宗教。キリスト教、イスラム教、仏教。この3つは世界で最も多くの信者を持つ宗教です。",
  },
  {
    id:   "christianity",
    src:  "religion-christianity.wav",
    from: 345,
    text: "キリスト教は、紀元1世紀にイエス・キリストの教えをもとに始まりました。現在の信者数は約24億人で、世界最大の宗教です。聖典は新約聖書と旧約聖書で、神への愛と救いを中心的な教えとしています。",
  },
  {
    id:   "islam",
    src:  "religion-islam.wav",
    from: 855,
    text: "イスラム教は、7世紀にアラビア半島でムハンマドが開いた宗教です。信者数は約19億人。聖典はクルアーン、いわゆるコーランで、唯一神アッラーへの帰依と、礼拝・断食などの五行が基本とされています。",
  },
  {
    id:   "buddhism",
    src:  "religion-buddhism.wav",
    from: 1395,
    text: "仏教は、紀元前5世紀にインドでゴータマ・ブッダが開いた宗教です。信者数は約5億人。苦しみからの解脱を目指し、慈悲と中道の実践を重んじます。現在はアジアを中心に広く信仰されています。",
  },
  {
    id:   "summary",
    src:  "religion-summary.wav",
    from: 1875,
    text: "3つの宗教はそれぞれ異なる歴史と教えを持ちながらも、人々の心の拠り所として、世界の文化や社会に深い影響を与え続けています。",
  },
];

// ─── WAV から再生時間（ms）を取得 ───────────────────────────────────────
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
  return (dataSize / byteRate) * 1000; // ms
}

// ─── テキストを句読点でフレーズ分割 ─────────────────────────────────────
function splitPhrases(text) {
  // 。、！？ の後ろで分割（区切り文字はフレーズに含める）
  return text.split(/(?<=[。、！？])/).filter((p) => p.trim().length > 0);
}

// ─── フレーズ → Caption[] 変換 ──────────────────────────────────────────
// @remotion/captions の Caption 型:
//   { text, startMs, endMs, timestampMs, confidence }
function toCaptions(phrases, globalStartMs, durationMs) {
  const totalChars = phrases.reduce((s, p) => s + p.length, 0);
  const captions = [];
  let currentMs = globalStartMs;

  for (const phrase of phrases) {
    const ratio       = phrase.length / totalChars;
    const phraseMs    = durationMs * ratio;
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

// ─── メイン ─────────────────────────────────────────────────────────────
function main() {
  console.log("🌍 世界三大宗教 — 字幕 JSON 生成\n");

  const allCaptions = [];

  for (const track of TRACKS) {
    const filePath   = path.join(AUDIO_DIR, track.src);
    const durationMs = getWavDurationMs(filePath);

    if (!durationMs) {
      console.warn(`  ⚠️  スキップ: ${track.src} が見つかりません`);
      console.warn(`     先に 'npm run voicevox:religion' を実行してください`);
      continue;
    }

    // 音声開始の絶対グローバル時刻（ms）
    const globalStartMs = (track.from / FPS) * 1000;

    const phrases  = splitPhrases(track.text);
    const captions = toCaptions(phrases, globalStartMs, durationMs);
    allCaptions.push(...captions);

    console.log(
      `  ✅ ${track.id}: ${phrases.length}フレーズ, ${(durationMs / 1000).toFixed(1)}秒` +
      ` (グローバル開始: ${(globalStartMs / 1000).toFixed(2)}s)`
    );
    phrases.forEach((p, i) => {
      const c = captions[i];
      console.log(`       [${(c.startMs/1000).toFixed(2)}s〜${(c.endMs/1000).toFixed(2)}s] ${p}`);
    });
    console.log();
  }

  if (allCaptions.length === 0) {
    console.error("❌ 字幕を生成できませんでした。WAV ファイルを先に生成してください。");
    process.exit(1);
  }

  // startMs 順にソート
  allCaptions.sort((a, b) => a.startMs - b.startMs);

  // public/captions/ に保存
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, "religion-captions.json");
  fs.writeFileSync(outputPath, JSON.stringify(allCaptions, null, 2), "utf-8");

  console.log(`✨ 字幕生成完了: ${allCaptions.length} フレーズ`);
  console.log(`📁 出力先: public/captions/religion-captions.json`);
  console.log(`\n▶️  次のステップ: npm start → documentary > Religion`);
}

main();
