import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type SceneHeadingProps = {
  label: string;   // 上の小ラベル (例: "第1条")
  title: string;   // メインタイトル
  icon?: string;   // 絵文字アイコン
};

export const SceneHeading: React.FC<SceneHeadingProps> = ({ label, title, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideY = spring({
    frame,
    fps,
    from: -40,
    to: 0,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `translateY(${slideY}px)`,
        opacity,
      }}
    >
      {/* 上部ラベル */}
      <div
        style={{
          color: "rgba(100,200,255,0.9)",
          fontSize: 18,
          fontFamily: "sans-serif",
          fontWeight: 600,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      {/* 区切り線 */}
      <div
        style={{
          width: 60,
          height: 2,
          background: "linear-gradient(to right, transparent, #64C8FF, transparent)",
        }}
      />

      {/* タイトル行 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {icon && <span style={{ fontSize: 48 }}>{icon}</span>}
        <h2
          style={{
            color: "#FFFFFF",
            fontSize: 52,
            fontWeight: 800,
            fontFamily: "sans-serif",
            margin: 0,
            textShadow: "0 0 40px rgba(100,200,255,0.4)",
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
};
