import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.summary; // 390

const RELIGIONS = [
  { name: "キリスト教", symbol: "✝", color: "#4A90D9", followers: "約24億人", start: 60  },
  { name: "イスラム教", symbol: "☽", color: "#4CAF50", followers: "約19億人", start: 120 },
  { name: "仏教",       symbol: "☸", color: "#FF8C42", followers: "約5億人",  start: 180 },
];

export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = interpolate(frame, [0, 20, D - 20, D], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });
  const hdgOp = interpolate(frame, [5, 28], [0, 1], { extrapolateRight: "clamp" });

  const msgOp = interpolate(frame, [240, 270], [0, 1], { extrapolateRight: "clamp" });
  const msgY = spring({ frame: frame - 240, fps, from: 20, to: 0, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{
      opacity: sceneOp,
      background: "linear-gradient(160deg, #070516 0%, #100E28 100%)",
      padding: "50px 80px", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* 見出し */}
      <div style={{
        fontSize: 52, fontWeight: 900, color: "#C8B8FF",
        marginBottom: 40, opacity: hdgOp, transform: `translateY(${hdgY}px)`,
        borderLeft: "6px solid #9C60D0", paddingLeft: 20,
      }}>
        まとめ
      </div>

      {/* 3宗教カード */}
      <div style={{ display: "flex", gap: 28, marginBottom: 40 }}>
        {RELIGIONS.map((r) => {
          const sc = spring({ frame: frame - r.start, fps, from: 0, to: 1, config: { damping: 12, stiffness: 90 } });
          const op = interpolate(frame, [r.start, r.start + 20], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={r.name} style={{
              flex: 1,
              background: `${r.color}12`,
              border: `1px solid ${r.color}50`,
              borderTop: `4px solid ${r.color}`,
              borderRadius: 14,
              padding: "24px 20px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              transform: `scale(${sc})`, opacity: op,
            }}>
              <div style={{
                fontSize: 44, color: r.color,
                filter: `drop-shadow(0 0 12px ${r.color}60)`,
              }}>
                {r.symbol}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", textAlign: "center" }}>
                {r.name}
              </div>
              <div style={{
                fontSize: 18, color: r.color, fontWeight: 600,
                background: `${r.color}20`, padding: "4px 14px", borderRadius: 20,
              }}>
                {r.followers}
              </div>
            </div>
          );
        })}
      </div>

      {/* まとめメッセージ */}
      <div style={{
        fontSize: 24, color: "rgba(255,255,255,0.8)",
        lineHeight: 1.8, textAlign: "center",
        opacity: msgOp, transform: `translateY(${msgY}px)`,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, padding: "20px 32px",
      }}>
        それぞれ異なる歴史と教えを持ちながらも<br />
        <span style={{ color: "#C8B8FF", fontWeight: 700 }}>人々の心の拠り所として、世界の文化・社会に深く根付いています</span>
      </div>
    </AbsoluteFill>
  );
};
