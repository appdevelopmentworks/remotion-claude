import { AbsoluteFill, Audio, Series, staticFile, useVideoConfig } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { IntroScene } from "./scenes/IntroScene";
import { HistoryScene } from "./scenes/HistoryScene";
import { ProvisionsScene } from "./scenes/ProvisionsScene";
import { CurrentStatusScene } from "./scenes/CurrentStatusScene";
import { OutroScene } from "./scenes/OutroScene";

/**
 * 南極条約 説明動画
 *
 * 合計: 1440フレーム (48秒 @ 30fps)
 *
 * シーン開始フレーム（絶対位置）:
 *  1. TitleScene       0f  →  90f
 *  2. IntroScene      90f  → 330f
 *  3. HistoryScene   330f  → 600f
 *  4. ProvisionsScene 600f → 1020f  (各条文 105f)
 *     - 第1条: 600f ~ 705f
 *     - 第2条: 705f ~ 810f
 *     - 第4条: 810f ~ 915f
 *     - 第5条: 915f ~ 1020f
 *  5. CurrentStatus  1020f → 1290f
 *  6. OutroScene     1290f → 1440f
 *
 * 音声ナレーション: VOICEVOX で生成した WAV を merge-narration.mjs で
 * 1本にまとめた antarctic-narration-merged.wav を使用
 * 音声生成: npm run voicevox && npm run merge-audio
 */

export const AntarcticTreaty: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* ─── 音声レイヤー（マージ済み1ファイル） ─── */}
      <Audio src={staticFile("audio/antarctic-narration-merged.wav")} volume={1} />

      {/* ─── ビジュアルレイヤー ─── */}
      <Series>
        <Series.Sequence durationInFrames={90} premountFor={fps}>
          <TitleScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={240} premountFor={fps}>
          <IntroScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={270} premountFor={fps}>
          <HistoryScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={420} premountFor={fps}>
          <ProvisionsScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={270} premountFor={fps}>
          <CurrentStatusScene />
        </Series.Sequence>

        <Series.Sequence durationInFrames={150} premountFor={fps}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
