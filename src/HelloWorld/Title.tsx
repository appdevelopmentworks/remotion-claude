import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type TitleProps = {
  text: string;
  color: string;
};

export const Title: React.FC<TitleProps> = ({ text, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // スプリングで上からスライドイン
  const translateY = spring({
    frame,
    fps,
    from: -80,
    to: 0,
    config: { stiffness: 120, damping: 20 },
  });

  // フェードイン
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <h1
      style={{
        color,
        fontSize: 80,
        fontWeight: 900,
        fontFamily: "sans-serif",
        textAlign: "center",
        margin: 0,
        transform: `translateY(${translateY}px)`,
        opacity,
        textShadow: "0 0 40px rgba(120,80,255,0.8)",
        letterSpacing: -2,
      }}
    >
      {text}
    </h1>
  );
};
