import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.why; // 390
const ACCENT = "#FF8C42";

const REASONS = [
  {
    icon: "🐾",
    title: "迷子になっても大丈夫",
    desc: "飼い主の名前・連絡先をすぐ特定できる",
    color: "#FF8C42",
    start: 50,
  },
  {
    icon: "🔗",
    title: "外れる心配がない",
    desc: "首輪・迷子札と違い、一生体から外れない",
    color: "#4ECDC4",
    start: 140,
  },
  {
    icon: "🆘",
    title: "災害時でも身元確認",
    desc: "大規模災害で離れ離れになっても安心",
    color: "#FF6B6B",
    start: 230,
  },
];

export const WhyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(
    frame,
    [0, 20, D - 20, D],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });
  const hdgOp = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        background: "linear-gradient(160deg, #0D1020 0%, #1A1535 100%)",
        padding: "55px 80px",
        overflow: "hidden",
      }}
    >
      {/* 見出し */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: ACCENT,
          marginBottom: 40,
          opacity: hdgOp,
          transform: `translateY(${hdgY}px)`,
          borderLeft: `6px solid ${ACCENT}`,
          paddingLeft: 20,
        }}
      >
        なぜ必要なの？
      </div>

      {/* 理由カード */}
      {REASONS.map((r) => {
        const y = spring({ frame: frame - r.start, fps, from: 40, to: 0, config: { damping: 200 } });
        const op = interpolate(frame, [r.start, r.start + 20], [0, 1], { extrapolateRight: "clamp" });

        return (
          <div
            key={r.title}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${r.color}40`,
              borderLeft: `6px solid ${r.color}`,
              borderRadius: 14,
              padding: "22px 30px",
              marginBottom: 22,
              display: "flex",
              alignItems: "center",
              gap: 22,
              transform: `translateY(${y}px)`,
              opacity: op,
            }}
          >
            <span style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>
                {r.title}
              </div>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.65)" }}>{r.desc}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
