import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { Narration } from "../Narration";
import { SceneHeading } from "../SceneHeading";

const NARRATION =
  "南極大陸とその周辺海域を、平和的目的のみに使用することを定めた国際条約です。" +
  "科学的研究と国際協力を促進し、地球最後の秘境を守り続けています。";

// 南極大陸のCSS表現
const AntarcticaShape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 200 },
    durationInFrames: 50,
    delay: 20,
  });

  const glow = interpolate(
    Math.sin((frame / 60) * Math.PI),
    [-1, 1],
    [0.3, 0.7]
  );

  return (
    <div
      style={{
        position: "relative",
        width: 280,
        height: 260,
        transform: `scale(${scale})`,
      }}
    >
      {/* メイン大陸 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 240,
          height: 220,
          borderRadius: "50% 45% 55% 40% / 40% 55% 45% 60%",
          background: `radial-gradient(ellipse at 45% 40%, rgba(220,240,255,${glow}) 0%, rgba(160,200,240,0.6) 50%, rgba(100,160,220,0.3) 100%)`,
          boxShadow: `0 0 40px rgba(100,200,255,0.3), inset 0 0 30px rgba(200,230,255,0.2)`,
        }}
      />
      {/* 氷床テクスチャ */}
      {[
        { x: 60, y: 50, w: 80, h: 30 },
        { x: 100, y: 90, w: 100, h: 25 },
        { x: 40, y: 130, w: 70, h: 20 },
        { x: 130, y: 140, w: 90, h: 25 },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.w,
            height: s.h,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
          }}
        />
      ))}
      {/* 南極点マーカー */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#FF6B6B",
          boxShadow: "0 0 15px rgba(255,100,100,0.8)",
        }}
      />
    </div>
  );
};

// ファクトカード
const FactCard: React.FC<{
  icon: string;
  text: string;
  delay: number;
}> = ({ icon, text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const x = spring({
    frame: frame - delay,
    fps,
    from: 60,
    to: 0,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 24px",
        borderRadius: 12,
        background: "rgba(100,200,255,0.08)",
        border: "1px solid rgba(100,200,255,0.2)",
        transform: `translateX(${x}px)`,
        opacity,
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span
        style={{
          color: "rgba(220,240,255,0.9)",
          fontSize: 22,
          fontFamily: "sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const facts = [
  { icon: "📍", text: "対象地域：南緯60度以南の南極地域", delay: 60 },
  { icon: "🤝", text: "目的：平和的利用と国際協力の促進", delay: 80 },
  { icon: "🌡️", text: "意義：地球環境・気候研究の拠点保護", delay: 100 },
];

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const outerOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: outerOpacity }}>
      <Background />
      <SceneHeading label="Overview" title="南極条約とは？" icon="❄️" />

      {/* 左：南極大陸 / 右：ファクト */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 80,
          paddingTop: 80,
          paddingBottom: 120,
        }}
      >
        <AntarcticaShape />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {facts.map((f, i) => (
            <FactCard key={i} {...f} />
          ))}
        </div>
      </AbsoluteFill>

      <Narration text={NARRATION} charFrames={2} startFrame={20} />
    </AbsoluteFill>
  );
};
