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
  "現在、54カ国が南極条約に参加。うち29カ国が意思決定に参加できる協議国です。" +
  "毎年開かれる南極条約協議国会議（ATCM）で、環境保護や資源管理のルールが更新されています。";

// カウントアップアニメーション
const CountUp: React.FC<{
  target: number;
  suffix?: string;
  color: string;
  label: string;
  delay: number;
}> = ({ target, suffix = "", color, label, delay }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame - delay, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const value = Math.round(progress * target);

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity,
      }}
    >
      <div
        style={{
          color,
          fontSize: 80,
          fontWeight: 900,
          fontFamily: "monospace",
          textShadow: `0 0 40px ${color}80`,
          lineHeight: 1,
        }}
      >
        {value}
        {suffix}
      </div>
      <div
        style={{
          color: "rgba(180,220,255,0.8)",
          fontSize: 18,
          fontFamily: "sans-serif",
          letterSpacing: 1,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ステータスバー
const StatusBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  delay: number;
}> = ({ label, value, max, color, delay }) => {
  const frame = useCurrentFrame();

  const width = interpolate(frame - delay, [0, 50], [0, (value / max) * 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            color: "rgba(220,240,255,0.8)",
            fontSize: 18,
            fontFamily: "sans-serif",
          }}
        >
          {label}
        </span>
        <span
          style={{
            color,
            fontSize: 18,
            fontFamily: "monospace",
            fontWeight: 700,
          }}
        >
          {value}カ国
        </span>
      </div>
      <div
        style={{
          width: 380,
          height: 10,
          borderRadius: 5,
          backgroundColor: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            borderRadius: 5,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>
    </div>
  );
};

const statusBars = [
  { label: "締約国（総数）", value: 54, max: 54, color: "#64C8FF", delay: 80 },
  { label: "うち協議国（議決権あり）", value: 29, max: 54, color: "#00E5A0", delay: 100 },
  { label: "うち非協議国", value: 25, max: 54, color: "#FFD700", delay: 120 },
];

// 関連協定リスト
const RelatedAgreements: React.FC = () => {
  const frame = useCurrentFrame();

  const agreements = [
    { name: "環境保護に関する議定書 (1991)", icon: "🌿", delay: 130 },
    { name: "南極の海洋生物資源保存条約 (1980)", icon: "🐧", delay: 150 },
    { name: "南極海豹保護条約 (1972)", icon: "🦭", delay: 170 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          color: "rgba(100,200,255,0.7)",
          fontSize: 14,
          fontFamily: "sans-serif",
          letterSpacing: 3,
          marginBottom: 4,
          opacity: interpolate(frame, [120, 135], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        RELATED AGREEMENTS
      </div>
      {agreements.map((a, i) => {
        const opacity = interpolate(frame - a.delay, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = interpolate(frame - a.delay, [0, 20], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity,
              transform: `translateX(${x}px)`,
            }}
          >
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <span
              style={{
                color: "rgba(200,230,255,0.75)",
                fontSize: 17,
                fontFamily: "sans-serif",
              }}
            >
              {a.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const CurrentStatusScene: React.FC = () => {
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
      <SceneHeading label="Current Status" title="現在の状況" icon="🌐" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 80,
          paddingTop: 80,
          paddingBottom: 110,
        }}
      >
        {/* 左: カウント */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          <CountUp
            target={54}
            suffix="カ国"
            color="#64C8FF"
            label="南極条約 締約国数"
            delay={20}
          />
          <CountUp
            target={64}
            suffix="年"
            color="#00E5A0"
            label="条約発効からの年数"
            delay={40}
          />
        </div>

        {/* 区切り */}
        <div
          style={{
            width: 1,
            height: 260,
            background: "linear-gradient(to bottom, transparent, rgba(100,200,255,0.3), transparent)",
          }}
        />

        {/* 右: バー + 関連協定 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {statusBars.map((s, i) => (
            <StatusBar key={i} {...s} />
          ))}
          <div style={{ marginTop: 8 }}>
            <RelatedAgreements />
          </div>
        </div>
      </AbsoluteFill>

      <Narration text={NARRATION} charFrames={2} startFrame={20} />
    </AbsoluteFill>
  );
};
