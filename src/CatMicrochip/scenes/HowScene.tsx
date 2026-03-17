import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_DURATIONS } from "../constants";

const D = SCENE_DURATIONS.how; // 360
const TEAL = "#4ECDC4";

const STEPS = [
  { title: "動物病院を受診",         desc: "かかりつけの獣医師に気軽に相談",  start: 50  },
  { title: "首の後ろに皮下注射",      desc: "専用の注射器でチップを皮膚の下へ", start: 120 },
  { title: "麻酔不要・痛みは少ない", desc: "処置時間はわずか数秒",             start: 190 },
  { title: "一度装着すれば一生機能", desc: "バッテリー不要・電源なしで動作",   start: 260 },
];

export const HowScene: React.FC = () => {
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

  // タイムラインの縦線
  const lineH = interpolate(frame, [50, 290], [0, 310], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        background: "linear-gradient(160deg, #060E1A 0%, #0D1830 100%)",
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
          marginBottom: 36,
          opacity: hdgOp,
          transform: `translateY(${hdgY}px)`,
          borderLeft: `6px solid ${TEAL}`,
          paddingLeft: 20,
        }}
      >
        装着の流れ
      </div>

      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* タイムライン縦線 */}
        <div
          style={{
            position: "absolute",
            left: 27,
            top: 28,
            width: 2,
            height: lineH,
            background: `linear-gradient(180deg, ${TEAL}, rgba(78,205,196,0.2))`,
          }}
        />

        {STEPS.map((step, i) => {
          const x = spring({
            frame: frame - step.start,
            fps,
            from: 50,
            to: 0,
            config: { damping: 200 },
          });
          const op = interpolate(frame, [step.start, step.start + 20], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 30,
                transform: `translateX(${x}px)`,
                opacity: op,
              }}
            >
              {/* ステップ番号バッジ */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: TEAL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#06101A",
                  flexShrink: 0,
                  boxShadow: `0 0 18px rgba(78,205,196,0.4)`,
                }}
              >
                {i + 1}
              </div>

              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 21, color: "rgba(255,255,255,0.6)" }}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
