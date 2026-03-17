import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";

const KEYWORDS = [
  { text: "平和", icon: "☮️", color: "#FF6B6B", x: 320, y: 280 },
  { text: "科学", icon: "🔬", color: "#4ECDC4", x: 640, y: 200 },
  { text: "協力", icon: "🤝", color: "#45B7D1", x: 960, y: 280 },
  { text: "自然", icon: "🌿", color: "#00E5A0", x: 480, y: 400 },
  { text: "未来", icon: "✨", color: "#FFD700", x: 800, y: 400 },
];

const KeywordBubble: React.FC<{
  text: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  delay: number;
}> = ({ text, icon, color, x, y, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    from: 0,
    to: 1,
    config: { stiffness: 150, damping: 12 },
    durationInFrames: 35,
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 浮遊アニメーション
  const floatY = Math.sin(((frame + delay * 7) / 45) * Math.PI) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}30 0%, ${color}10 70%, transparent 100%)`,
        border: `2px solid ${color}60`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        transform: `scale(${scale}) translateY(${floatY}px)`,
        opacity,
        boxShadow: `0 0 30px ${color}40`,
      }}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span
        style={{
          color: "white",
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // メインタイトル
  const titleScale = spring({
    frame,
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // サブテキスト
  const subOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 最終フェードアウト
  const outerOpacity = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: outerOpacity }}>
      <Background />

      {/* キーワードバブル */}
      {KEYWORDS.map((k, i) => (
        <KeywordBubble key={i} {...k} delay={40 + i * 12} />
      ))}

      {/* 中央コンテンツ */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 64,
            filter: "drop-shadow(0 0 20px rgba(100,200,255,0.6))",
            opacity: titleOpacity,
          }}
        >
          ❄️
        </div>

        <h1
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 900,
            fontFamily: "sans-serif",
            margin: 0,
            textAlign: "center",
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            textShadow: "0 0 60px rgba(100,200,255,0.5)",
          }}
        >
          南極条約が守る地球
        </h1>

        {/* 区切り線 */}
        <div
          style={{
            width: interpolate(frame, [30, 60], [0, 500], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(100,200,255,0.6), transparent)",
          }}
        />

        <p
          style={{
            color: "rgba(180,220,255,0.8)",
            fontSize: 24,
            fontFamily: "sans-serif",
            textAlign: "center",
            margin: 0,
            opacity: subOpacity,
            lineHeight: 1.7,
          }}
        >
          1959年に生まれた国際協力の精神は
          <br />
          今も南極大陸を守り続けています。
        </p>

        {/* 年号 */}
        <p
          style={{
            color: "rgba(100,200,255,0.6)",
            fontSize: 18,
            fontFamily: "monospace",
            margin: "8px 0 0",
            letterSpacing: 4,
            opacity: interpolate(frame, [60, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Antarctic Treaty System · Since 1961
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
