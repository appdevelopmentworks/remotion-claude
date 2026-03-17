import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type BallProps = {
  delay: number;
  color: string;
  x: number;
  label: string;
  stiffness: number;
  damping: number;
};

const Ball: React.FC<BallProps> = ({
  delay,
  color,
  x,
  label,
  stiffness,
  damping,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const translateY = spring({
    frame: frame - delay,
    fps,
    from: -300,
    to: 0,
    config: { stiffness, damping },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: "50%",
        transform: `translateY(calc(-50% + ${translateY}px))`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 8px 32px ${color}80`,
        }}
      />
      <div
        style={{
          color: "white",
          fontFamily: "monospace",
          fontSize: 14,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>{label}</div>
        <div>stiffness: {stiffness}</div>
        <div>damping: {damping}</div>
      </div>
    </div>
  );
};

export const SpringShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  // タイトルのフェードイン
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const balls = [
    { delay: 0, color: "#FF6B6B", x: 120, label: "Bouncy", stiffness: 200, damping: 8 },
    { delay: 10, color: "#4ECDC4", x: 300, label: "Default", stiffness: 100, damping: 10 },
    { delay: 20, color: "#45B7D1", x: 480, label: "Smooth", stiffness: 60, damping: 12 },
    { delay: 30, color: "#96CEB4", x: 660, label: "Stiff", stiffness: 300, damping: 20 },
    { delay: 40, color: "#FFEAA7", x: 840, label: "Soft", stiffness: 40, damping: 8 },
    { delay: 50, color: "#DDA0DD", x: 1020, label: "Heavy", stiffness: 80, damping: 15 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          fontSize: 48,
          fontWeight: "bold",
          fontFamily: "sans-serif",
          opacity: titleOpacity,
        }}
      >
        Spring Physics Showcase
      </div>

      {/* ボール */}
      {balls.map((ball, i) => (
        <Ball key={i} {...ball} />
      ))}

      {/* 地面のライン */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 80,
          right: 80,
          height: 2,
          background: "rgba(255,255,255,0.2)",
        }}
      />
    </AbsoluteFill>
  );
};
