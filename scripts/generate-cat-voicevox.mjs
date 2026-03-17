/**
 * generate-cat-voicevox.mjs
 *
 * 「猫とICチップ」動画のナレーション WAV ファイルを VOICEVOX で生成します。
 *
 * 使い方:
 *   1. VOICEVOX アプリを起動する（http://localhost:50021 が必要）
 *   2. npm run voicevox:cat
 *
 * スピーカー一覧を確認:
 *   npm run voicevox:cat:speakers
 *
 * スピーカーを指定:
 *   node scripts/generate-cat-voicevox.mjs --speaker 13
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
const SPEAKER_ID = speakerArg !== -1 ? Number(args[speakerArg + 1]) : 3;
const LIST_SPEAKERS = args.includes("--list-speakers");

// ─────────────────────────────────────────────────────────────────────────
// ナレーションテキスト定義
//
// シーン別の読み上げ時間目安 (VOICEVOX デフォルト速度 ≈ 6文字/秒):
//  cat-title   : ~28文字 → ~5秒  (シーン 8秒 = 余裕 3秒)
//  cat-what    : ~62文字 → ~10秒 (シーン14秒 = 余裕 4秒)
//  cat-why     : ~57文字 → ~10秒 (シーン13秒 = 余裕 3秒)
//  cat-how     : ~53文字 → ~9秒  (シーン12秒 = 余裕 3秒)
//  cat-law     : ~58文字 → ~10秒 (シーン13秒 = 余裕 3秒)
//  cat-summary : ~43文字 → ~7秒  (シーン10秒 = 余裕 3秒)
// ─────────────────────────────────────────────────────────────────────────
const NARRATIONS = [
  {
    id: "cat-title",
    text: "猫とICチップ。大切な家族を守る、小さな技術のお話です。",
  },
  {
    id: "cat-what",
    text: "ICチップとは、直径2ミリほどの小さなマイクロチップです。チップには15桁の固有番号が記録されていて、専用のリーダーで読み取ることができます。",
  },
  {
    id: "cat-why",
    text: "猫が迷子になっても、ICチップがあれば飼い主を特定できます。首輪や迷子札と違い、外れる心配がありません。災害時でも身元確認ができます。",
  },
  {
    id: "cat-how",
    text: "装着は獣医師が行います。注射器で首の後ろの皮膚の下に埋め込みます。痛みは注射程度で、麻酔は不要。一度入れれば一生涯機能します。",
  },
  {
    id: "cat-law",
    text: "2022年6月、日本でペット販売業者へのICチップ装着と登録が義務化されました。ペットショップで買った猫には、すでに装着済みが多いです。",
  },
  {
    id: "cat-summary",
    text: "ICチップは大切な猫を守る、小さな安心です。まだの場合は、かかりつけの獣医師に相談してみてください。",
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
    console.error(`   http://localhost:50021 が起動しているか確認してください。`);
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
  console.log(`\n使い方: node scripts/generate-cat-voicevox.mjs --speaker <ID>`);
}

// ─── 音声合成 (VOICEVOX 2ステップ API) ────────────────────────────────────
async function synthesize(text, speakerId) {
  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    { method: "POST" }
  );
  if (!queryRes.ok) throw new Error(`audio_query failed: ${queryRes.status}`);
  const query = await queryRes.json();

  query.speedScale     = 1.0;
  query.volumeScale    = 1.0;
  query.pitchScale     = 0.0;
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
  console.log("🐱 猫とICチップ — VOICEVOX ナレーション生成\n");

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
  console.log(`🗣️  スピーカー: ${speakerName}\n`);

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
  console.log(`📁 出力先: public/audio/cat-*.wav`);
  if (success > 0) {
    console.log(`\n▶️  次のステップ: npm run merge-audio:cat`);
  }
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
