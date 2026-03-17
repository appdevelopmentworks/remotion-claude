import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // メインタイトル: スプリングでスケールイン
  const titleScale = spring({
    frame,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 200 },
    durationInFrames: 50,
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // サブタイトル: 遅れてフェードイン
  const subOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [30, 55], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // 年号: さらに遅れて
  const yearOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // フェードアウト (最後15フレーム)
  const outerOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 地球アイコン: ゆっくり回転
  const globeRotate = interpolate(frame, [0, durationInFrames], [0, 20]);

  return (
    <AbsoluteFill style={{ opacity: outerOpacity }}>
      <Background />

      {/* 中央コンテンツ */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* 地球アイコン */}
        <div
          style={{
            fontSize: 100,
            marginBottom: 24,
            filter: "drop-shadow(0 0 30px rgba(100,200,255,0.6))",
            transform: `rotate(${globeRotate}deg)`,
            opacity: titleOpacity,
          }}
        >
          🌍
        </div>

        {/* メインタイトル */}
        <h1
          style={{
            color: "#FFFFFF",
            fontSize: 100,
            fontWeight: 900,
            fontFamily: "sans-serif",
            margin: 0,
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            textShadow:
              "0 0 60px rgba(100,200,255,0.5), 0 0 120px rgba(100,200,255,0.2)",
            letterSpacing: -2,
          }}
        >
          南極条約
        </h1>

        {/* 英語サブタイトル */}
        <p
          style={{
            color: "rgba(150,220,255,0.9)",
            fontSize: 34,
            fontFamily: "sans-serif",
            margin: "16px 0 0 0",
            fontWeight: 300,
            letterSpacing: 6,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
          }}
        >
          The Antarctic Treaty
        </p>

        {/* 区切り線 */}
        <div
          style={{
            width: interpolate(frame, [55, 80], [0, 400], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(100,200,255,0.6), transparent)",
            margin: "24px 0",
          }}
        />

        {/* 署名年 */}
        <p
          style={{
            color: "rgba(180,230,255,0.7)",
            fontSize: 22,
            fontFamily: "sans-serif",
            margin: 0,
            letterSpacing: 4,
            opacity: yearOpacity,
          }}
        >
          1959年12月1日 署名 ／ 1961年6月23日 発効
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
