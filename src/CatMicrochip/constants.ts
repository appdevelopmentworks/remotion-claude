/**
 * 猫とICチップ — 動画設計定数
 *
 * ナレーション目安: VOICEVOX デフォルト速度 ≒ 6文字/秒 (@30fps = 5f/文字)
 * 各シーンに3〜4秒のバッファを加えて設定
 *
 *  title:   "猫とICチップ。大切な家族を守る…" ≈ 28文字 → ~5s = 150f → scene: 240f
 *  what:    "ICチップとは、直径…"               ≈ 62文字 → ~10s= 300f → scene: 420f
 *  why:     "猫が迷子になっても…"               ≈ 57文字 → ~10s= 285f → scene: 390f
 *  how:     "装着は獣医師が行います…"           ≈ 53文字 → ~9s = 265f → scene: 360f
 *  law:     "2022年6月…"                        ≈ 58文字 → ~10s= 290f → scene: 390f
 *  summary: "ICチップは大切な猫を守る…"         ≈ 43文字 → ~7s = 215f → scene: 300f
 */

export const SCENE_DURATIONS = {
  title:   240, //  8秒
  what:    420, // 14秒
  why:     390, // 13秒
  how:     360, // 12秒
  law:     390, // 13秒
  summary: 300, // 10秒
} as const;

const S = SCENE_DURATIONS;

// 各シーンの絶対開始フレーム
export const SCENE_STARTS = {
  title:   0,
  what:    S.title,
  why:     S.title + S.what,
  how:     S.title + S.what + S.why,
  law:     S.title + S.what + S.why + S.how,
  summary: S.title + S.what + S.why + S.how + S.law,
} as const;

export const CAT_TOTAL_FRAMES =
  S.title + S.what + S.why + S.how + S.law + S.summary; // 2100

// 音声トラック（マージスクリプトと完全一致）
// from = 各シーンの絶対開始フレーム + ナレーション開始オフセット
export const CAT_AUDIO_TRACKS = [
  { id: "title",   src: "audio/cat-title.wav",   from: SCENE_STARTS.title   + 20 }, //  20
  { id: "what",    src: "audio/cat-what.wav",    from: SCENE_STARTS.what    + 15 }, // 255
  { id: "why",     src: "audio/cat-why.wav",     from: SCENE_STARTS.why     + 15 }, // 675
  { id: "how",     src: "audio/cat-how.wav",     from: SCENE_STARTS.how     + 15 }, // 1065
  { id: "law",     src: "audio/cat-law.wav",     from: SCENE_STARTS.law     + 15 }, // 1425
  { id: "summary", src: "audio/cat-summary.wav", from: SCENE_STARTS.summary + 15 }, // 1815
] as const;
