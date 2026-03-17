import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type StepCardProps = {
  title: string;
  description: string;
  color: string;
  icon: string;
};

const StepCard: React.FC<StepCardProps> = ({ title, description, color, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { stiffness: 120, damping: 18 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 600,
          padding: 48,
          borderRadius: 24,
          backgroundColor: `${color}22`,
          border: `3px solid ${color}`,
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
          boxShadow: `0 20px 60px ${color}40`,
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>{icon}</div>
        <h2
          style={{
            color: color,
            fontSize: 48,
            fontWeight: "bold",
            fontFamily: "sans-serif",
            margin: "0 0 16px 0",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 24,
            fontFamily: "sans-serif",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// プログレスバーコンポーネント
const ProgressBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: "rgba(255,255,255,0.2)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          backgroundColor: "#7C3AED",
          transition: "width 0.1s",
        }}
      />
    </div>
  );
};

const steps = [
  {
    title: "Composition",
    description: "動画の解像度・FPS・長さを定義する",
    color: "#FF6B6B",
    icon: "🎬",
  },
  {
    title: "useCurrentFrame",
    description: "現在のフレーム番号を取得してアニメーションを制御",
    color: "#4ECDC4",
    icon: "🎯",
  },
  {
    title: "interpolate",
    description: "フレーム→値のマッピングで滑らかな変化を表現",
    color: "#45B7D1",
    icon: "📐",
  },
  {
    title: "spring",
    description: "物理ベースのスプリングアニメーション",
    color: "#FFEAA7",
    icon: "🌀",
  },
];

const STEP_DURATION = 60; // 各ステップ60フレーム

export const SequenceDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // タイトルのフェードイン
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0d0d1a 0%, #1a0d2e 100%)",
      }}
    >
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          fontSize: 36,
          fontWeight: "bold",
          fontFamily: "sans-serif",
          opacity: titleOpacity,
          letterSpacing: 3,
        }}
      >
        Remotion Core Concepts
      </div>

      {/* ステップをSequenceで順番に表示 */}
      {steps.map((step, i) => (
        <Sequence
          key={i}
          from={i * STEP_DURATION}
          durationInFrames={STEP_DURATION + 10}
        >
          <StepCard {...step} />
        </Sequence>
      ))}

      <ProgressBar total={steps.length} />
    </AbsoluteFill>
  );
};
