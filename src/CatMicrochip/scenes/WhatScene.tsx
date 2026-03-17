import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.what; // 420
const TEAL = "#4ECDC4";

// ICチップを模したCSS描画
const ChipVisual: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <div
    style={{
      width: 130,
      height: 100,
      background: "linear-gradient(145deg, #C8D8DE, #90A4AE)",
      borderRadius: 10,
      border: "2px solid rgba(255,255,255,0.35)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      padding: "10px 12px",
      transform: `scale(${scale})`,
      opacity,
      boxShadow: `0 0 32px rgba(78,205,196,0.4), 0 4px 20px rgba(0,0,0,0.4)`,
    }}
  >
    {[0, 1, 2].map((row) => (
      <div key={row} style={{ display: "flex", justifyContent: "space-around" }}>
        {[0, 1, 2, 3, 4].map((col) => (
          <div
            key={col}
            style={{
              width: 14,
              height: 9,
              background: "rgba(20, 10, 50, 0.75)",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

// ファクトカード
const FactCard: React.FC<{
  icon: string;
  title: string;
  sub: string;
  x: number;
  opacity: number;
}> = ({ icon, title, sub, x, opacity }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.06)",
      border: `1px solid ${TEAL}35`,
      borderLeft: `5px solid ${TEAL}`,
      borderRadius: 12,
      padding: "16px 24px",
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      gap: 18,
      transform: `translateX(${x}px)`,
      opacity,
    }}
  >
    <span style={{ fontSize: 38, lineHeight: 1 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#FFFFFF" }}>{title}</div>
      <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

export const WhatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(
    frame,
    [0, 20, D - 20, D],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 見出し
  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });
  const hdgOp = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });

  // チップ画像
  const chipScale = spring({ frame: frame - 35, fps, from: 0, to: 1, config: { damping: 10, stiffness: 90 } });
  const chipOp = interpolate(frame, [35, 60], [0, 1], { extrapolateRight: "clamp" });

  // ファクトカード 3枚
  const mkCard = (start: number) => ({
    x: spring({ frame: frame - start, fps, from: 60, to: 0, config: { damping: 200 } }),
    op: interpolate(frame, [start, start + 20], [0, 1], { extrapolateRight: "clamp" }),
  });
  const c1 = mkCard(90);
  const c2 = mkCard(170);
  const c3 = mkCard(250);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        background: "linear-gradient(160deg, #080B1A 0%, #131040 100%)",
        padding: "55px 80px",
        overflow: "hidden",
      }}
    >
      {/* 見出し */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: TEAL,
          marginBottom: 40,
          opacity: hdgOp,
          transform: `translateY(${hdgY}px)`,
          borderLeft: `6px solid ${TEAL}`,
          paddingLeft: 20,
        }}
      >
        ICチップとは？
      </div>

      <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
        {/* チップ図解 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            minWidth: 150,
          }}
        >
          <ChipVisual scale={chipScale} opacity={chipOp} />
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.75)",
              opacity: chipOp,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            実際のサイズ
            <br />
            <span style={{ fontSize: 32, fontWeight: 700, color: TEAL }}>約 2mm</span>
          </div>
        </div>

        {/* ファクトカード */}
        <div style={{ flex: 1 }}>
          <FactCard icon="💠" title="極小マイクロチップ" sub="米粒より小さな直径 約2mm のチップ" x={c1.x} opacity={c1.op} />
          <FactCard icon="🔢" title="15桁の固有番号" sub="世界に1つだけの識別コードを記録" x={c2.x} opacity={c2.op} />
          <FactCard icon="📡" title="専用リーダーで読み取り" sub="動物病院・保健所・警察などで確認可能" x={c3.x} opacity={c3.op} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
