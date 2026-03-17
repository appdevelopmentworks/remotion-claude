import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type TextRevealProps = {
  message: string;
};

// 1文字ずつアニメーションするコンポーネント
type CharProps = {
  char: string;
  index: number;
  totalChars: number;
};

const AnimatedChar: React.FC<CharProps> = ({ char, index, totalChars }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * 3; // 各文字に3フレームの遅延

  const translateY = spring({
    frame: frame - delay,
    fps,
    from: 60,
    to: 0,
    config: { stiffness: 200, damping: 20 },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 各文字に少しランダムな色を付ける
  const hue = (index / totalChars) * 60 + 200; // 200〜260 (青〜紫)
  const color = `hsl(${hue}, 80%, 75%)`;

  if (char === " ") {
    return <span style={{ display: "inline-block", width: 20 }} />;
  }

  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${translateY}px)`,
        opacity,
        color,
        textShadow: `0 0 20px ${color}`,
      }}
    >
      {char}
    </span>
  );
};

// パーティクルエフェクト
type ParticleProps = {
  x: number;
  y: number;
  delay: number;
  color: string;
};

const Particle: React.FC<ParticleProps> = ({ x, y, delay, color }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame - delay, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [0, -120]);
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0]);
  const scale = interpolate(progress, [0, 0.3, 1], [0, 1, 0.5]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        boxShadow: `0 0 10px ${color}`,
      }}
    />
  );
};

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: Math.sin(i * 137.5 * (Math.PI / 180)) * 500 + 640,
  y: Math.cos(i * 137.5 * (Math.PI / 180)) * 200 + 360,
  delay: i * 8 + 60,
  color: `hsl(${(i / 20) * 360}, 80%, 70%)`,
}));

export const TextReveal: React.FC<TextRevealProps> = ({ message }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 背景のパルス効果
  const bgPulse = interpolate(
    Math.sin((frame / 30) * Math.PI),
    [-1, 1],
    [0.05, 0.15]
  );

  // 全体のフェードアウト
  const outerOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const chars = message.split("");

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(60,20,120,${bgPulse}) 0%, #050510 70%)`,
        opacity: outerOpacity,
      }}
    >
      {/* パーティクル */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* メインテキスト */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            fontFamily: "sans-serif",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {chars.map((char, i) => (
            <AnimatedChar
              key={i}
              char={char}
              index={i}
              totalChars={chars.length}
            />
          ))}
        </div>

        {/* サブテキスト */}
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 24,
            fontFamily: "monospace",
            opacity: interpolate(frame, [60, 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            letterSpacing: 4,
          }}
        >
          powered by Remotion
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
