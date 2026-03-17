import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.law; // 390
const GOLD = "#FFB347";

const LAW_POINTS = [
  {
    icon: "📋",
    title: "ペット販売業者への義務",
    sub: "ブリーダー・ペットショップが対象",
    color: "#FF8C42",
    start: 140,
  },
  {
    icon: "💉",
    title: "ICチップ装着と登録が必須",
    sub: "販売前にマイクロチップを装着・登録",
    color: "#4ECDC4",
    start: 215,
  },
];

export const LawScene: React.FC = () => {
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

  // "2022" 大文字スプリング
  const yearScale = spring({
    frame: frame - 45,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 80 },
  });
  const yearOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });

  // "年6月 施行"
  const monthY = spring({ frame: frame - 95, fps, from: 20, to: 0, config: { damping: 200 } });
  const monthOp = interpolate(frame, [95, 115], [0, 1], { extrapolateRight: "clamp" });

  // 注釈
  const noteOp = interpolate(frame, [300, 330], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        background: "linear-gradient(160deg, #100800 0%, #231400 100%)",
        padding: "55px 80px",
        overflow: "hidden",
      }}
    >
      {/* 見出し */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: GOLD,
          marginBottom: 28,
          opacity: hdgOp,
          transform: `translateY(${hdgY}px)`,
          borderLeft: `6px solid ${GOLD}`,
          paddingLeft: 20,
        }}
      >
        日本の法律（義務化）
      </div>

      {/* 年 + 月 */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 28 }}>
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            color: GOLD,
            lineHeight: 1,
            transform: `scale(${yearScale})`,
            transformOrigin: "left center",
            opacity: yearOp,
            textShadow: `0 0 50px ${GOLD}55`,
          }}
        >
          2022
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            opacity: monthOp,
            transform: `translateY(${monthY}px)`,
          }}
        >
          年6月 施行
        </div>
      </div>

      {/* 法律ポイント */}
      {LAW_POINTS.map((p) => {
        const x = spring({ frame: frame - p.start, fps, from: 50, to: 0, config: { damping: 200 } });
        const op = interpolate(frame, [p.start, p.start + 22], [0, 1], { extrapolateRight: "clamp" });

        return (
          <div
            key={p.title}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${p.color}40`,
              borderLeft: `5px solid ${p.color}`,
              borderRadius: 12,
              padding: "16px 24px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 18,
              transform: `translateX(${x}px)`,
              opacity: op,
            }}
          >
            <span style={{ fontSize: 38, lineHeight: 1 }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#FFFFFF" }}>{p.title}</div>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{p.sub}</div>
            </div>
          </div>
        );
      })}

      {/* 補足 */}
      <div
        style={{
          marginTop: 18,
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          opacity: noteOp,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 16,
        }}
      >
        💡 ペットショップで購入した猫にはすでに装着済みのケースが多いです
      </div>
    </AbsoluteFill>
  );
};
