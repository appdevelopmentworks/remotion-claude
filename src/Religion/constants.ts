/**
 * 世界三大宗教 — 動画設計定数
 *
 * ナレーション目安: VOICEVOX もち子さん ≒ 6文字/秒 (@30fps = 5f/文字)
 * 各シーンに 3〜4 秒のバッファを加えて設定
 *
 *  title:        ~43文字 → ~7s  → scene: 330f (11s)
 *  christianity: ~83文字 → ~14s → scene: 510f (17s)
 *  islam:        ~95文字 → ~16s → scene: 540f (18s)
 *  buddhism:     ~80文字 → ~13s → scene: 480f (16s)
 *  summary:      ~57文字 → ~10s → scene: 390f (13s)
 */

export const SCENE_DURATIONS = {
  title:        330,
  christianity: 510,
  islam:        540,
  buddhism:     480,
  summary:      390,
} as const;

const S = SCENE_DURATIONS;

export const SCENE_STARTS = {
  title:        0,
  christianity: S.title,
  islam:        S.title + S.christianity,
  buddhism:     S.title + S.christianity + S.islam,
  summary:      S.title + S.christianity + S.islam + S.buddhism,
} as const;

export const RELIGION_TOTAL_FRAMES =
  S.title + S.christianity + S.islam + S.buddhism + S.summary; // 2250

// 音声トラック（merge-religion-narration.mjs の AUDIO_TRACKS と完全一致）
// from = SCENE_STARTS[key] + offset  (title: +20, others: +15)
export const RELIGION_AUDIO_TRACKS = [
  { id: "title",        src: "audio/religion-title.wav",        from: SCENE_STARTS.title        + 20 }, //   20
  { id: "christianity", src: "audio/religion-christianity.wav", from: SCENE_STARTS.christianity + 15 }, //  345
  { id: "islam",        src: "audio/religion-islam.wav",        from: SCENE_STARTS.islam        + 15 }, //  870
  { id: "buddhism",     src: "audio/religion-buddhism.wav",     from: SCENE_STARTS.buddhism     + 15 }, // 1395
  { id: "summary",      src: "audio/religion-summary.wav",      from: SCENE_STARTS.summary      + 15 }, // 1890
] as const;
