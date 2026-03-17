import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// 星を静的に生成（シード付き疑似ランダム）
const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: seededRandom(i * 3) * 100,
  y: seededRandom(i * 3 + 1) * 65,
  size: seededRandom(i * 3 + 2) * 2 + 0.5,
  delay: Math.floor(seededRandom(i * 5) * 60),
}));

// オーロラのバンド
const AURORA_BANDS = [
  { color: "rgba(0, 180, 120, 0.15)", y: 10, height: 120, speed: 0.4 },
  { color: "rgba(0, 100, 200, 0.12)", y: 20, height: 80, speed: 0.3 },
  { color: "rgba(80, 0, 200, 0.10)", y: 5, height: 100, speed: 0.5 },
];

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #020818 0%, #05142e 50%, #08203f 100%)",
        overflow: "hidden",
      }}
    >
      {/* オーロラ */}
      {AURORA_BANDS.map((band, i) => {
        const wave = Math.sin((frame / 60 + i) * band.speed) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -50,
              right: -50,
              top: `${band.y + wave}%`,
              height: band.height,
              background: `radial-gradient(ellipse 100% 50% at 50% 50%, ${band.color}, transparent)`,
              filter: "blur(20px)",
            }}
          />
        );
      })}

      {/* 星 */}
      {STARS.map((star, i) => {
        const twinkle = interpolate(
          (frame + star.delay) % 90,
          [0, 45, 90],
          [0.3, 1, 0.3],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: "white",
              opacity: twinkle * 0.8,
            }}
          />
        );
      })}

      {/* 下部の氷のグラデーション */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(to top, rgba(140,210,255,0.08) 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
