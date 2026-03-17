import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.title; // 330

const ICONS = [
  { symbol: "✝", color: "#4A90D9", label: "キリスト教" },
  { symbol: "☽", color: "#4CAF50", label: "イスラム教" },
  { symbol: "☸", color: "#FF8C42", label: "仏教" },
];

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = interpolate(frame, [0, 20, D - 20, D], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // タイトルスプリング
  const titleY = spring({ frame: frame - 10, fps, from: 40, to: 0, config: { damping: 200 } });
  const titleOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });

  // サブタイトル
  const subOp = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp" });

  // 装飾ライン
  const lineW = interpolate(frame, [55, 100], [0, 460], { extrapolateRight: "clamp" });

  // アイコン3つ（順番に登場）
  const iconStarts = [90, 130, 170];

  return (
    <AbsoluteFill style={{
      opacity: sceneOp,
      background: "linear-gradient(160deg, #070516 0%, #120E3A 50%, #0A0D22 100%)",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      overflow: "hidden",
    }}>
      {/* 背景グロー */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(100,80,200,0.08) 0%, transparent 70%)",
      }} />

      {/* タイトル */}
      <div style={{
        fontSize: 80, fontWeight: 900, color: "#FFFFFF",
        opacity: titleOp, transform: `translateY(${titleY}px)`,
        textAlign: "center", letterSpacing: "0.06em",
        textShadow: "0 0 40px rgba(160,140,255,0.5)",
      }}>
        世界三大宗教
      </div>

      {/* 装飾ライン */}
      <div style={{
        width: lineW, height: 2,
        background: "linear-gradient(90deg, #4A90D9, #9C60D0, #FF8C42)",
        borderRadius: 2, marginTop: 20, marginBottom: 20,
      }} />

      {/* サブタイトル */}
      <div style={{
        fontSize: 26, color: "rgba(255,255,255,0.65)",
        opacity: subOp, letterSpacing: "0.2em", marginBottom: 48,
      }}>
        人類を導く3つの教え
      </div>

      {/* 3宗教アイコン */}
      <div style={{ display: "flex", gap: 60 }}>
        {ICONS.map((icon, i) => {
          const sc = spring({ frame: frame - iconStarts[i], fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });
          const op = interpolate(frame, [iconStarts[i], iconStarts[i] + 20], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              transform: `scale(${sc})`, opacity: op,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `${icon.color}22`, border: `2px solid ${icon.color}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 38, color: icon.color,
                boxShadow: `0 0 20px ${icon.color}44`,
              }}>
                {icon.symbol}
              </div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em" }}>
                {icon.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
