import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.summary; // 300
const ACCENT = "#FF8C42";

export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(
    frame,
    [0, 20, D - 20, D],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const hdgOp = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
  const hdgY = spring({ frame: frame - 5, fps, from: -30, to: 0, config: { damping: 200 } });

  // 猫アイコン — バウンス
  const catScale = spring({ frame: frame - 45, fps, from: 0, to: 1, config: { damping: 8, stiffness: 80 } });
  const catOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });

  // 脈動 (ゆっくり上下)
  const pulse = 1 + Math.sin((frame * Math.PI * 2) / 45) * 0.025;

  // メッセージ
  const msgOp = interpolate(frame, [85, 115], [0, 1], { extrapolateRight: "clamp" });
  const msgY = spring({ frame: frame - 85, fps, from: 20, to: 0, config: { damping: 200 } });

  // CTAボックス
  const ctaOp = interpolate(frame, [145, 175], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 145, fps, from: 0.85, to: 1, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        background: "linear-gradient(160deg, #0D0B1E 0%, #1E1035 55%, #0F1B35 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* 背景グロー */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,66,0.06) 0%, transparent 70%)",
        }}
      />

      {/* 見出し */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: ACCENT,
          marginBottom: 20,
          opacity: hdgOp,
          transform: `translateY(${hdgY}px)`,
          letterSpacing: "0.12em",
        }}
      >
        まとめ
      </div>

      {/* 猫 + ハート */}
      <div
        style={{
          fontSize: 94,
          transform: `scale(${catScale * pulse})`,
          opacity: catOp,
          marginBottom: 22,
          filter: "drop-shadow(0 0 22px rgba(255,140,66,0.45))",
        }}
      >
        🐱❤️
      </div>

      {/* キーメッセージ */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.65,
          maxWidth: 860,
          opacity: msgOp,
          transform: `translateY(${msgY}px)`,
        }}
      >
        ICチップは大切な猫を守る
        <span style={{ color: ACCENT }}> 「小さな安心」</span>
        です
      </div>

      {/* CTAボックス */}
      <div
        style={{
          marginTop: 38,
          padding: "20px 50px",
          background: "rgba(255,140,66,0.12)",
          border: `2px solid ${ACCENT}`,
          borderRadius: 18,
          fontSize: 26,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.7,
          opacity: ctaOp,
          transform: `scale(${ctaScale})`,
        }}
      >
        未装着の場合は
        <br />
        <span style={{ fontWeight: 700, color: ACCENT }}>
          かかりつけの獣医師にご相談を 🏥
        </span>
      </div>
    </AbsoluteFill>
  );
};
