import { useCallback, useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Img,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";
import { LYRICS } from "./lyrics";

// ============================================================
// 定数
// ============================================================

const PHOTOS = [
  "photos/tiger1.png",
  "photos/tiger2.png",
  "photos/tiger3.png",
  "photos/tiger4.png",
];

const MUSIC_SRC = "audio/技術のうち.mp3";
const FPS = 30;
const PHOTO_FADE_FRAMES = 25; // 写真の切り替えフェード時間（フレーム）

// Ken Burns: 写真ごとに異なるズーム・パン方向
const KEN_BURNS = [
  { fromScale: 1.0,  toScale: 1.12, fromX:   0, toX: -30, fromY:  0, toY:  20 },
  { fromScale: 1.12, toScale: 1.0,  fromX:  30, toX:   0, fromY:  0, toY: -20 },
  { fromScale: 1.0,  toScale: 1.1,  fromX: -20, toX:  20, fromY: 20, toY:   0 },
  { fromScale: 1.08, toScale: 1.0,  fromX:   0, toX:   0, fromY:-20, toY:  20 },
];

// セクションラベルの色
const SECTION_COLORS: Record<string, string> = {
  "Verse 1": "#4A90D9",
  "Verse 2": "#4A90D9",
  "Chorus":  "#E8820C",
};

// ============================================================
// calculateMetadata: MP3の長さに合わせて動画長を自動設定
// ============================================================
export const calculateMetadata: CalculateMetadataFunction = async () => {
  const src = staticFile(MUSIC_SRC);
  try {
    const input = new Input({
      formats: ALL_FORMATS,
      source: new UrlSource(src, { getRetryDelay: () => null }),
    });
    const durationInSeconds = await input.computeDuration();
    return { durationInFrames: Math.ceil(durationInSeconds * FPS) };
  } catch {
    // 取得失敗時のフォールバック（90秒）
    return { durationInFrames: 90 * FPS };
  }
};

// ============================================================
// PhotoBackground: Ken Burns + クロスフェード切り替え
// ============================================================
const PhotoBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const photoDuration = durationInFrames / PHOTOS.length;

  return (
    <>
      {PHOTOS.map((photo, i) => {
        const photoStart = i * photoDuration;
        const photoEnd   = (i + 1) * photoDuration;
        const kb = KEN_BURNS[i];

        // クロスフェード透明度
        const opacity = interpolate(
          frame,
          [
            photoStart - PHOTO_FADE_FRAMES,
            photoStart,
            photoEnd - PHOTO_FADE_FRAMES,
            photoEnd,
          ],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (opacity <= 0) return null;

        // Ken Burns アニメーション
        const progress = Math.max(
          0,
          Math.min(1, (frame - photoStart) / photoDuration)
        );
        const scale = interpolate(progress, [0, 1], [kb.fromScale, kb.toScale]);
        const tx    = interpolate(progress, [0, 1], [kb.fromX,    kb.toX]);
        const ty    = interpolate(progress, [0, 1], [kb.fromY,    kb.toY]);

        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            <Img
              src={staticFile(photo)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
                transformOrigin: "center center",
              }}
            />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// ============================================================
// LyricLine: 1行の歌詞を表示（フェードイン・アウト付き）
// ============================================================
const LyricLine: React.FC<{
  text: string;
  section?: string;
  durationFrames: number;
  isImpact: boolean; // 短いインパクトワード（"な？" など）
}> = ({ text, section, durationFrames, isImpact }) => {
  const frame = useCurrentFrame();
  const FADE_IN  = 8;
  const FADE_OUT = 8;

  const opacity = interpolate(
    frame,
    [0, FADE_IN, durationFrames - FADE_OUT, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(frame, [0, FADE_IN], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // インパクトワードはスケールアニメーション
  const impactScale = isImpact
    ? interpolate(frame, [0, 6, 12], [0.6, 1.15, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const fontSize = isImpact ? 96 : 52;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 130,
      }}
    >
      {/* セクションラベル（Verse / Chorus）*/}
      {section && (
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 44,
            background: SECTION_COLORS[section] ?? "#555",
            color: "#fff",
            fontSize: 30,
            fontWeight: "bold",
            fontFamily: "sans-serif",
            padding: "6px 22px",
            borderRadius: 24,
            opacity,
            letterSpacing: "0.04em",
          }}
        >
          {section}
        </div>
      )}

      {/* 歌詞テキスト */}
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${impactScale})`,
          textAlign: "center",
          paddingLeft: 50,
          paddingRight: 50,
          maxWidth: 980,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: "900",
            color: "#FFFFFF",
            fontFamily: "sans-serif",
            lineHeight: 1.5,
            textShadow:
              "0 0 20px rgba(0,0,0,0.9), 0 3px 10px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.7)",
            display: "inline-block",
            wordBreak: "break-all",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// TitleCard: 前奏中（〜14秒）に表示するタイトル
// ============================================================
const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const SHOW_UNTIL = 13 * 30; // 13秒まで表示し、14秒目には消える

  const opacity = interpolate(frame, [0, 10, SHOW_UNTIL - 10, SHOW_UNTIL], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Sequence from={0} durationInFrames={SHOW_UNTIL} layout="none">
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "900",
              color: "#FFFFFF",
              textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              letterSpacing: "0.1em",
            }}
          >
            技術のうち
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 32,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.15em",
            }}
          >
            ─────
          </div>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

// ============================================================
// TigerShorts: メインコンポジション
// ============================================================
export const TigerShorts: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  // インパクトワード判定（4文字以下 または "！" 含む）
  const isImpactWord = (text: string) =>
    text.replace(/[！！\s]/g, "").length <= 4 || text.includes("！");

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 写真背景（Ken Burns + クロスフェード） */}
      <PhotoBackground />

      {/* 下部グラデーションオーバーレイ（文字の可読性向上） */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, " +
            "transparent 30%, " +
            "rgba(0,0,0,0.35) 60%, " +
            "rgba(0,0,0,0.75) 80%, " +
            "rgba(0,0,0,0.92) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* タイトルカード（冒頭のみ） */}
      <TitleCard />

      {/* 歌詞 */}
      {LYRICS.map((lyric, index) => {
        const nextLyric = LYRICS[index + 1];
        const startFrame = Math.round(lyric.startSec * fps);
        const endFrame   = nextLyric
          ? Math.round(nextLyric.startSec * fps)
          : durationInFrames;
        const duration   = Math.max(1, endFrame - startFrame);

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={duration}
            layout="none"
          >
            <LyricLine
              text={lyric.text}
              section={lyric.section}
              durationFrames={duration}
              isImpact={isImpactWord(lyric.text)}
            />
          </Sequence>
        );
      })}

      {/* BGM */}
      <Audio src={staticFile(MUSIC_SRC)} volume={1} />
    </AbsoluteFill>
  );
};
