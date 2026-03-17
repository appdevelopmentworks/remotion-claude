/**
 * VOICEVOX ナレーション生成スクリプト
 *
 * 使い方:
 *   1. VOICEVOX アプリを起動する（http://localhost:50021 が必要）
 *   2. node scripts/generate-voicevox.mjs
 *
 * スピーカー一覧を確認:
 *   node scripts/generate-voicevox.mjs --list-speakers
 *
 * スピーカーを指定:
 *   node scripts/generate-voicevox.mjs --speaker 13
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(ROOT, "public", "audio");

const VOICEVOX_URL = "http://localhost:50021";

// ============================================================
// スピーカーID設定
// VOICEVOX を起動後に --list-speakers で一覧確認できます
// 推奨: 3=ずんだもん, 13=青山龍星(落ち着いた男性), 8=春日部つむぎ
// ============================================================
const args = process.argv.slice(2);
const speakerArg = args.indexOf("--speaker");
const SPEAKER_ID = speakerArg !== -1 ? Number(args[speakerArg + 1]) : 3;
const LIST_SPEAKERS = args.includes("--list-speakers");

// ============================================================
// ナレーションテキスト定義
// ============================================================
const NARRATIONS = [
  {
    id: "antarctic-title",
    text: "南極条約。1959年12月1日に署名された、地球を守る国際条約です。",
  },
  {
    id: "antarctic-intro",
    text: "南極大陸とその周辺海域を、平和的目的のみに使用することを定めた国際条約です。科学的研究と国際協力を促進し、地球最後の秘境を守り続けています。",
  },
  {
    id: "antarctic-history",
    text: "冷戦の緊張が高まる中、1957年から1958年の国際地球観測年をきっかけに、12カ国の科学者たちが南極での協力を推進。1959年12月1日、ワシントンD.C.で歴史的な条約が署名されました。",
  },
  {
    id: "antarctic-provision-1",
    text: "南極大陸は平和のためだけに使われます。軍事基地・演習・兵器実験はすべて禁止。この原則は条約の根幹です。",
  },
  {
    id: "antarctic-provision-2",
    text: "南極は地球最大の自然実験室です。どの国も自由に科学調査ができ、得られたデータは全人類で共有されます。",
  },
  {
    id: "antarctic-provision-3",
    text: "7カ国が領土を主張する南極大陸。しかし条約は領土紛争を凍結し、どの国も新たな主張を行えなくしています。",
  },
  {
    id: "antarctic-provision-4",
    text: "南極は完全な非核地帯です。核実験も放射性廃棄物の廃棄も厳しく禁じられ、清浄な環境が守られています。",
  },
  {
    id: "antarctic-status",
    text: "現在、54カ国が南極条約に参加。うち29カ国が意思決定に参加できる協議国です。毎年開かれる南極条約協議国会議で、環境保護や資源管理のルールが更新されています。",
  },
  {
    id: "antarctic-outro",
    text: "1959年に生まれた国際協力の精神は、今も南極大陸を守り続けています。",
  },
];

// ============================================================
// VOICEVOX 接続確認
// ============================================================
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
    console.error(`   または Docker: docker run --rm -it -p 50021:50021 voicevox/voicevox_engine`);
    return false;
  }
}

// ============================================================
// スピーカー一覧表示
// ============================================================
async function listSpeakers() {
  const res = await fetch(`${VOICEVOX_URL}/speakers`);
  const speakers = await res.json();
  console.log("\n📢 利用可能なスピーカー:\n");
  for (const speaker of speakers) {
    for (const style of speaker.styles) {
      console.log(`  ID ${String(style.id).padStart(3)}: ${speaker.name} (${style.name})`);
    }
  }
  console.log(`\n使い方: node scripts/generate-voicevox.mjs --speaker <ID>`);
}

// ============================================================
// 音声合成（VOICEVOX 2ステップAPI）
// ============================================================
async function synthesize(text, speakerId) {
  // Step 1: audio_query
  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    { method: "POST" }
  );
  if (!queryRes.ok) {
    throw new Error(`audio_query failed: ${queryRes.status} ${await queryRes.text()}`);
  }
  const query = await queryRes.json();

  // 話速・音量を調整（必要に応じて変更）
  query.speedScale = 1.0;    // 話速（0.5〜2.0）
  query.volumeScale = 1.0;   // 音量
  query.pitchScale = 0.0;    // ピッチ
  query.intonationScale = 1.0; // 抑揚

  // Step 2: synthesis
  const synthRes = await fetch(
    `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    }
  );
  if (!synthRes.ok) {
    throw new Error(`synthesis failed: ${synthRes.status} ${await synthRes.text()}`);
  }

  return Buffer.from(await synthRes.arrayBuffer());
}

// ============================================================
// メイン処理
// ============================================================
async function main() {
  console.log("🎙️  VOICEVOX ナレーション生成スクリプト\n");

  const ok = await checkVoicevox();
  if (!ok) process.exit(1);

  if (LIST_SPEAKERS) {
    await listSpeakers();
    return;
  }

  // スピーカー名を取得
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
      console.log(`✅ (${kb} KB)`);
      success++;
    } catch (err) {
      console.log(`❌ エラー: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✨ 完了: ${success}件成功 / ${failed}件失敗`);
  console.log(`📁 出力先: public/audio/`);
  if (success > 0) {
    console.log(`\n▶️  次のステップ: npm start で Remotion Studio を起動してください`);
  }
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
