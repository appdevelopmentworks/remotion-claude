import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.title; // 240

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // シーン全体のフェードイン / フェードアウト
  const sceneOpacity = interpolate(
    frame,
    [0, 20, D - 20, D],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 猫アイコン — バウンスしながら登場
  const catScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 80 },
  });

  // タイトル — スライドアップ
  const titleY = spring({
    frame: frame - 15,
    fps,
    from: 50,
    to: 0,
    config: { damping: 200 },
  });
  const titleOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  // サブタイトル — フェードイン
  const subOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 装飾ライン — 伸びる
  const lineWidth = interpolate(frame, [60, 110], [0, 420], {
    extrapolateRight: "clamp",
  });

  // 背景の浮遊ドット
  const dots = Array.from({ length: 14 }, (_, i) => ({
    x: ((i * 137 + 60) % 1150) + 65,
    y: ((i * 97 + 40) % 580) + 70,
    r: 3 + (i % 4) * 3,
    drift: 1 + (i % 3) * 0.5,
  }));

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        background: "linear-gradient(160deg, #0D0B1E 0%, #1E1035 55%, #0F1B35 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* 背景ドット */}
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y - interpolate(frame, [0, D], [0, d.drift * 20], { extrapolateRight: "clamp" }),
            width: d.r,
            height: d.r,
            borderRadius: "50%",
            background: `rgba(255, 140, 66, ${0.06 + (i % 5) * 0.025})`,
          }}
        />
      ))}

      {/* グロー リング */}
      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          border: "1.5px solid rgba(255, 140, 66, 0.15)",
          transform: `scale(${interpolate(frame, [0, 60], [0.4, 1], { extrapolateRight: "clamp" })})`,
          opacity: interpolate(frame, [0, 60], [0, 0.8], { extrapolateRight: "clamp" }),
        }}
      />

      {/* 猫アイコン */}
      <div
        style={{
          fontSize: 96,
          transform: `scale(${catScale})`,
          lineHeight: 1,
          marginBottom: 20,
          filter: "drop-shadow(0 0 24px rgba(255,140,66,0.5))",
        }}
      >
        🐱
      </div>

      {/* メインタイトル */}
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: "#FFFFFF",
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          letterSpacing: "0.05em",
          textShadow: "0 0 40px rgba(255,140,66,0.5)",
          lineHeight: 1.1,
        }}
      >
        猫とICチップ
      </div>

      {/* 装飾ライン */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: "linear-gradient(90deg, #FF8C42, #FF6B6B)",
          borderRadius: 2,
          marginTop: 22,
          marginBottom: 22,
        }}
      />

      {/* サブタイトル */}
      <div
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.7)",
          opacity: subOpacity,
          letterSpacing: "0.15em",
        }}
      >
        大切な家族を守るために
      </div>
    </AbsoluteFill>
  );
};
