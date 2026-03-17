/**
 * generate-religion-voicevox.mjs
 *
 * 「世界三大宗教」動画のナレーション WAV を VOICEVOX（もち子さん）で生成します。
 *
 * 使い方:
 *   1. VOICEVOX アプリを起動する
 *   2. npm run voicevox:religion
 *
 * スピーカー一覧を確認:
 *   npm run voicevox:religion:speakers
 *
 * スピーカーを指定:
 *   node scripts/generate-religion-voicevox.mjs --speaker 20
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(ROOT, "public", "audio");
const VOICEVOX_URL = "http://localhost:50021";

const args = process.argv.slice(2);
const speakerArg = args.indexOf("--speaker");
// もち子(cv 明日葉よもぎ) ノーマル = ID 20
// ※ バージョンにより異なる場合は --list-speakers で確認してください
const SPEAKER_ID = speakerArg !== -1 ? Number(args[speakerArg + 1]) : 20;
const LIST_SPEAKERS = args.includes("--list-speakers");

// ─────────────────────────────────────────────────────────────────────────
// ナレーションテキスト（台本）
//
// シーン別の読み上げ時間目安 (もち子さん ≈ 6文字/秒):
//  religion-title:        ~43文字 → ~7秒  (シーン11秒 = 余裕4秒)
//  religion-christianity: ~83文字 → ~14秒 (シーン17秒 = 余裕3秒)
//  religion-islam:        ~95文字 → ~16秒 (シーン18秒 = 余裕2秒)
//  religion-buddhism:     ~80文字 → ~13秒 (シーン16秒 = 余裕3秒)
//  religion-summary:      ~57文字 → ~10秒 (シーン13秒 = 余裕3秒)
// ─────────────────────────────────────────────────────────────────────────
const NARRATIONS = [
  {
    id: "religion-title",
    text: "世界三大宗教。キリスト教、イスラム教、仏教。この3つは世界で最も多くの信者を持つ宗教です。",
  },
  {
    id: "religion-christianity",
    text: "キリスト教は、紀元1世紀にイエス・キリストの教えをもとに始まりました。現在の信者数は約24億人で、世界最大の宗教です。聖典は新約聖書と旧約聖書で、神への愛と救いを中心的な教えとしています。",
  },
  {
    id: "religion-islam",
    text: "イスラム教は、7世紀にアラビア半島でムハンマドが開いた宗教です。信者数は約19億人。聖典はクルアーン、いわゆるコーランで、唯一神アッラーへの帰依と、礼拝・断食などの五行が基本とされています。",
  },
  {
    id: "religion-buddhism",
    text: "仏教は、紀元前5世紀にインドでゴータマ・ブッダが開いた宗教です。信者数は約5億人。苦しみからの解脱を目指し、慈悲と中道の実践を重んじます。現在はアジアを中心に広く信仰されています。",
  },
  {
    id: "religion-summary",
    text: "3つの宗教はそれぞれ異なる歴史と教えを持ちながらも、人々の心の拠り所として、世界の文化や社会に深い影響を与え続けています。",
  },
];

// ─── VOICEVOX 接続確認 ────────────────────────────────────────────────────
async function checkVoicevox() {
  try {
    const res = await fetch(`${VOICEVOX_URL}/version`);
    const version = await res.text();
    console.log(`✅ VOICEVOX 接続OK (version: ${version.trim()})`);
    return true;
  } catch {
    console.error(`❌ VOICEVOX に接続できません。`);
    console.error(`   VOICEVOX アプリ: https://voicevox.hiroshiba.jp/`);
    return false;
  }
}

// ─── スピーカー一覧表示 ───────────────────────────────────────────────────
async function listSpeakers() {
  const res = await fetch(`${VOICEVOX_URL}/speakers`);
  const speakers = await res.json();
  console.log("\n📢 利用可能なスピーカー:\n");
  for (const speaker of speakers) {
    for (const style of speaker.styles) {
      console.log(`  ID ${String(style.id).padStart(3)}: ${speaker.name} (${style.name})`);
    }
  }
  console.log(`\n使い方: node scripts/generate-religion-voicevox.mjs --speaker <ID>`);
}

// ─── 音声合成 ─────────────────────────────────────────────────────────────
async function synthesize(text, speakerId) {
  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    { method: "POST" },
  );
  if (!queryRes.ok) throw new Error(`audio_query failed: ${queryRes.status}`);
  const query = await queryRes.json();

  query.speedScale      = 1.0;
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

// ─── メイン ───────────────────────────────────────────────────────────────
async function main() {
  console.log("🌍 世界三大宗教 — VOICEVOX ナレーション生成\n");

  const ok = await checkVoicevox();
  if (!ok) process.exit(1);

  if (LIST_SPEAKERS) {
    await listSpeakers();
    return;
  }

  // スピーカー名を表示
  const speakersRes = await fetch(`${VOICEVOX_URL}/speakers`);
  const speakers = await speakersRes.json();
  let speakerName = `ID ${SPEAKER_ID}`;
  for (const s of speakers) {
    for (const style of s.styles) {
      if (style.id === SPEAKER_ID) speakerName = `${s.name}（${style.name}）`;
    }
  }
  console.log(`🗣️  スピーカー: ${speakerName}`);
  console.log(`   ※ もち子さんが見つからない場合は --list-speakers で ID を確認してください\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const narration of NARRATIONS) {
    const outputPath = join(OUTPUT_DIR, `${narration.id}.wav`);
    process.stdout.write(`  生成中: ${narration.id}.wav ... `);
    try {
      const audio = await synthesize(narration.text, SPEAKER_ID);
      writeFileSync(outputPath, audio);
      const kb = (audio.length / 1024).toFixed(1);
      const chars = narration.text.length;
      console.log(`✅ (${kb} KB / ${chars}文字)`);
      success++;
    } catch (err) {
      console.log(`❌ エラー: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✨ 完了: ${success}件成功 / ${failed}件失敗`);
  console.log(`📁 出力先: public/audio/religion-*.wav`);
  if (success > 0) {
    console.log(`\n▶️  次のステップ: npm run merge-audio:religion`);
  }
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
