import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Title } from "./Title";
import { Subtitle } from "./Subtitle";

type HelloWorldProps = {
  titleText: string;
  titleColor: string;
};

export const HelloWorld: React.FC<HelloWorldProps> = ({
  titleText,
  titleColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 背景のグラデーション色をフレームに応じて変化させる
  const hue = interpolate(frame, [0, durationInFrames], [240, 300]);
  const bgColor = `hsl(${hue}, 70%, 15%)`;

  // フェードアウト (最後の30フレーム)
  const opacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // スプリングで画面全体をスケールイン
  const scale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { stiffness: 80, damping: 15 },
  });

  return (
    <AbsoluteFill
      style={{
        background: bgColor,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* 光のエフェクト */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(120,80,255,0.3) 0%, transparent 70%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <Title text={titleText} color={titleColor} />
        <Subtitle />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
