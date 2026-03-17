import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useVideoConfig } from "remotion";
import { SCENE_DURATIONS, RELIGION_TOTAL_FRAMES } from "./constants";
import { TitleScene } from "./scenes/TitleScene";
import { ChristianityScene } from "./scenes/ChristianityScene";
import { IslamScene } from "./scenes/IslamScene";
import { BuddhismScene } from "./scenes/BuddhismScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CaptionOverlay } from "./CaptionOverlay";

/**
 * 世界三大宗教 — 説明動画
 *
 * 合計: 2250フレーム (75秒 @ 30fps)
 *
 * シーン構成:
 *  1. TitleScene        0f    ~ 330f   (11秒) タイトル
 *  2. ChristianityScene 330f  ~ 840f   (17秒) キリスト教
 *  3. IslamScene        840f  ~ 1380f  (18秒) イスラム教
 *  4. BuddhismScene     1380f ~ 1860f  (16秒) 仏教
 *  5. SummaryScene      1860f ~ 2250f  (13秒) まとめ
 *
 * 音声生成:   npm run voicevox:religion
 * WAVマージ:  npm run merge-audio:religion
 * 字幕生成:   npm run captions:religion
 */

const _check: number = RELIGION_TOTAL_FRAMES;
void _check;

const S = SCENE_DURATIONS;

export const Religion: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* 音声レイヤー（マージ済み 1ファイル） */}
      <Audio src={staticFile("audio/religion-narration-merged.wav")} volume={1} />

      {/* ビジュアルレイヤー */}
      <Series>
        <Series.Sequence durationInFrames={S.title} premountFor={fps}>
          <TitleScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.christianity} premountFor={fps}>
          <ChristianityScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.islam} premountFor={fps}>
          <IslamScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.buddhism} premountFor={fps}>
          <BuddhismScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={S.summary} premountFor={fps}>
          <SummaryScene />
        </Series.Sequence>
      </Series>

      {/* テロップ（字幕）オーバーレイ — 全シーン共通 */}
      <CaptionOverlay />
    </AbsoluteFill>
  );
};
