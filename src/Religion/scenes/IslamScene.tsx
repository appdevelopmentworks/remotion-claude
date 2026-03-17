import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.islam; // 540
const ACCENT = "#4CAF50";
const GOLD = "#F4C430";

const FACTS = [
  { label: "信者数",   value: "約 19億人",    note: "（世界第2位の宗教）",   start: 80  },
  { label: "起源",     value: "7世紀",         note: "アラビア半島・ムハンマド", start: 160 },
  { label: "聖典",     value: "クルアーン",    note: "（コーラン）",          start: 240 },
  { label: "五行",     value: "信仰・礼拝・喜捨・断食・巡礼", note: "",       start: 320 },
  { label: "中心的教え", value: "唯一神アッラーへの帰依", note: "",           start: 400 },
];

export const IslamScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = interpolate(frame, [0, 20, D - 20, D], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });
  const hdgOp = interpolate(frame, [5, 28], [0, 1], { extrapolateRight: "clamp" });

  const symSc = spring({ frame: frame - 25, fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });
  const symOp = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      opacity: sceneOp,
      background: "linear-gradient(160deg, #030E05 0%, #061810 100%)",
      padding: "50px 70px", overflow: "hidden",
    }}>
      {/* 見出し */}
      <div style={{
        fontSize: 52, fontWeight: 900, color: ACCENT,
        marginBottom: 30, opacity: hdgOp, transform: `translateY(${hdgY}px)`,
        borderLeft: `6px solid ${ACCENT}`, paddingLeft: 20,
      }}>
        イスラム教
      </div>

      <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
        {/* 三日月シンボル */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, minWidth: 140, transform: `scale(${symSc})`, opacity: symOp,
          flexShrink: 0,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `${ACCENT}18`, border: `2px solid ${ACCENT}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 50, color: GOLD,
            boxShadow: `0 0 30px ${ACCENT}40`,
          }}>
            ☽
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 }}>
            主な地域<br />
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>中東・東南アジア・アフリカ</span>
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
