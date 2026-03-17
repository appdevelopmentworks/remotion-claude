import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.christianity; // 510
const ACCENT = "#4A90D9";
const GOLD = "#FFD700";

const FACTS = [
  { label: "信者数",   value: "約 24億人", note: "（世界最大の宗教）", start: 80  },
  { label: "起源",     value: "紀元 1世紀",   note: "イエス・キリストの教え", start: 150 },
  { label: "聖典",     value: "聖書",         note: "旧約聖書・新約聖書", start: 220 },
  { label: "中心的教え", value: "神の愛と救い", note: "三位一体・永遠の命",   start: 290 },
];

export const ChristianityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = interpolate(frame, [0, 20, D - 20, D], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // 見出し
  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });
  const hdgOp = interpolate(frame, [5, 28], [0, 1], { extrapolateRight: "clamp" });

  // 十字架シンボル
  const crossSc = spring({ frame: frame - 25, fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });
  const crossOp = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      opacity: sceneOp,
      background: "linear-gradient(160deg, #05101E 0%, #0A1A35 100%)",
      padding: "50px 70px", overflow: "hidden",
    }}>
      {/* 見出し */}
      <div style={{
        fontSize: 52, fontWeight: 900, color: ACCENT,
        marginBottom: 36, opacity: hdgOp, transform: `translateY(${hdgY}px)`,
        borderLeft: `6px solid ${ACCENT}`, paddingLeft: 20,
      }}>
        キリスト教
      </div>

      <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
        {/* 十字架シンボル */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, minWidth: 140, transform: `scale(${crossSc})`, opacity: crossOp,
          flexShrink: 0,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `${ACCENT}18`, border: `2px solid ${ACCENT}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 54, color: GOLD,
            boxShadow: `0 0 30px ${ACCENT}40`,
          }}>
            ✝
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 }}>
            主な地域<br />
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>ヨーロッパ・南北アメリカ</span>
          </div>
        </div>

        {/* ファクトカード */}
        <div style={{ flex: 1 }}>
          {FACTS.map((f) => {
            const x = spring({ frame: frame - f.start, fps, from: 60, to: 0, config: { damping: 200 } });
            const op = interpolate(frame, [f.start, f.start + 20], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={f.label} style={{
                background: "rgba(255,255,255,0.055)",
                border: `1px solid ${ACCENT}30`,
                borderLeft: `5px solid ${ACCENT}`,
                borderRadius: 10, padding: "14px 22px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 20,
                transform: `translateX(${x}px)`, opacity: op,
              }}>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", minWidth: 90 }}>{f.label}</div>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 700, color: "#FFFFFF" }}>{f.value}</span>
                  <span style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", marginLeft: 10 }}>{f.note}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
