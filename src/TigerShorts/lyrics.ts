// ============================================================
// 歌詞タイミング設定
//
// Studio (npm start) でプレビューしながら startSec を調整してください。
// 再生ヘッドを動かして、実際の音楽に合わせて微調整するだけでOKです。
//
// 【前奏について】
//   この曲は冒頭 14 秒が前奏（歌詞なし）のため、
//   最初の歌詞を 14.5 秒目から開始しています。
// ============================================================

export type Lyric = {
  text: string;
  startSec: number;           // 何秒目にこの歌詞を表示するか
  section?: string;           // "Verse 1" | "Chorus" | "Verse 2" など
};

// 前奏の長さ（秒）。曲が変わったらここだけ変更してください。
const INTRO_SEC = 14.5;

export const LYRICS: Lyric[] = [
  // ── [Verse 1] ──────────────────────────────────────────
  { text: "技術というのはさ、もちろん、あるよ。", startSec: INTRO_SEC +  0.0, section: "Verse 1" },
  { text: "すごいいっぱいある。",                  startSec: INTRO_SEC +  4.0 },
  { text: "今日覚えて欲しい。",                    startSec: INTRO_SEC +  6.5 },
  { text: "今回の合宿で。",                        startSec: INTRO_SEC +  9.0 },
  { text: "それから精神的な事。",                  startSec: INTRO_SEC + 11.5 },
  { text: "これも、技術のうち。いい？",            startSec: INTRO_SEC + 14.5 },

  // ── [Chorus] ───────────────────────────────────────────
  { text: "自分で高める事。",                      startSec: INTRO_SEC + 19.0, section: "Chorus" },
  { text: "自分でやる気になる事。",                startSec: INTRO_SEC + 22.5 },
  { text: "これも技術のうち。",                    startSec: INTRO_SEC + 26.0 },
  { text: "な？",                                  startSec: INTRO_SEC + 29.5 },

  // ── [Verse 2] ──────────────────────────────────────────
  { text: "おっけー！！",                          startSec: INTRO_SEC + 34.0, section: "Verse 2" },
  { text: "これさぁ、自分達でやって欲しいのコレ。",startSec: INTRO_SEC + 36.5 },
  { text: "その俺は手助けするだけだから。",        startSec: INTRO_SEC + 41.0 },
  { text: "わかるかな？",                          startSec: INTRO_SEC + 45.5 },

  // ── [Chorus] ───────────────────────────────────────────
  { text: "ドーパミンを自分で上げてけ、自分で。",  startSec: INTRO_SEC + 50.0, section: "Chorus" },
  { text: "自分で上げてく。",                      startSec: INTRO_SEC + 55.5 },
  { text: "分かった？",                            startSec: INTRO_SEC + 59.0 },
];
