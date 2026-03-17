import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.buddhism; // 480
const ACCENT = "#FF8C42";

const FACTS = [
  { label: "信者数",     value: "約 5億人",     note: "（世界第4位）",            start: 80  },
  { label: "起源",       value: "紀元前 5世紀",  note: "インド・ゴータマ・ブッダ",  start: 155 },
  { label: "聖典",       value: "三蔵",          note: "（律蔵・経蔵・論蔵）",      start: 230 },
  { label: "主な教え",   value: "解脱・慈悲・中道", note: "苦しみからの開放を目指す", start: 305 },
  { label: "主な地域",   value: "アジア全域",    note: "日本・中国・タイ・ミャンマー", start: 380 },
];

export const BuddhismScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = interpolate(frame, [0, 20, D - 20, D], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });
  const hdgOp = interpolate(frame, [5, 28], [0, 1], { extrapolateRight: "clamp" });

  const symSc = spring({ frame: frame - 25, fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });
  const symOp = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp" });

  // 法輪のゆっくり回転
  const rotate = interpolate(frame, [0, D], [0, 60], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      opacity: sceneOp,
      background: "linear-gradient(160deg, #120600 0%, #1E0D00 100%)",
      padding: "50px 70px", overflow: "hidden",
    }}>
      {/* 見出し */}
      <div style={{
        fontSize: 52, fontWeight: 900, color: ACCENT,
        marginBottom: 30, opacity: hdgOp, transform: `translateY(${hdgY}px)`,
        borderLeft: `6px solid ${ACCENT}`, paddingLeft: 20,
      }}>
        仏教
      </div>

      <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
        {/* 法輪シンボル */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, minWidth: 140, transform: `scale(${symSc})`, opacity: symOp,
          flexShrink: 0,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `${ACCENT}18`, border: `2px solid ${ACCENT}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 50, color: ACCENT,
            transform: `rotate(${rotate}deg)`,
            boxShadow: `0 0 30px ${ACCENT}40`,
          }}>
            ☸
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 }}>
            主な地域<br />
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>アジア全域</span>
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
                borderRadius: 10, padding: "12px 20px", marginBottom: 13,
                display: "flex", alignItems: "center", gap: 16,
                transform: `translateX(${x}px)`, opacity: op,
              }}>
                <div style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", minWidth: 90, flexShrink: 0 }}>{f.label}</div>
                <div>
                  <span style={{ fontSize: 23, fontWeight: 700, color: "#FFFFFF" }}>{f.value}</span>
                  {f.note && <span style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", marginLeft: 10 }}>{f.note}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
