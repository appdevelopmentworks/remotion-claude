import { interpolate, useCurrentFrame } from "remotion";

export const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();

  // 少し遅れてフェードイン
  const opacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [20, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <p
      style={{
        color: "rgba(255,255,255,0.7)",
        fontSize: 32,
        fontFamily: "sans-serif",
        textAlign: "center",
        margin: 0,
        opacity,
        transform: `translateY(${translateY}px)`,
        letterSpacing: 2,
      }}
    >
      Create videos with React & TypeScript
    </p>
  );
};
