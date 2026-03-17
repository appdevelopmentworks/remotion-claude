import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useVideoConfig } from "remotion";
import { SCENE_DURATIONS, CAT_TOTAL_FRAMES } from "./constants";
import { TitleScene } from "./scenes/TitleScene";
import { WhatScene } from "./scenes/WhatScene";
import { WhyScene } from "./scenes/WhyScene";
import { HowScene } from "./scenes/HowScene";
import { LawScene } from "./scenes/LawScene";
import { SummaryScene } from "./scenes/SummaryScene";

/**
 * 猫とICチップ — 説明動画
 *
 * 合計: 2100フレーム (70秒 @ 30fps)
 *
 * シーン構成:
 *  1. TitleScene    0f    ~ 240f   (8秒)  タイトル
 *  2. WhatScene     240f  ~ 660f   (14秒) ICチップとは
 *  3. WhyScene      660f  ~ 1050f  (13秒) なぜ必要なの？
 *  4. HowScene      1050f ~ 1410f  (12秒) 装着の流れ
 *  5. LawScene      1410f ~ 1800f  (13秒) 日本の法律
 *  6. SummaryScene  1800f ~ 2100f  (10秒) まとめ
 *
 * 音声生成:
 *   npm run voicevox:cat        ← WAVを生成
 *   npm run merge-audio:cat     ← 1本にマージ
 */

// 型チェック用（constants.ts と Root.tsx の値が一致するか確認）
const _check: number = CAT_TOTAL_FRAMES; // 2100
void _check;

const S = SCENE_DURATIONS;

export const CatMicrochip: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* 音声レイヤー（マージ済み 1ファイル） */}
      <Audio src={staticFile("audio/cat-narration-merged.wav")} volume={1} />

      {/* ビジュアルレイヤー */}
      <Series>
        <Series.Sequence durationInFrames={S.title} premountFor={fps}>
          <TitleScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.what} premountFor={fps}>
          <WhatScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.why} premountFor={fps}>
          <WhyScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.how} premountFor={fps}>
          <HowScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.law} premountFor={fps}>
          <LawScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.summary} premountFor={fps}>
          <SummaryScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
