/**
 * CaptionOverlay.tsx
 *
 * @remotion/captions の Skills パターンを使ったテロップ表示
 *
 * Skills の流れ:
 *  1. public/captions/religion-captions.json を fetch（useDelayRender で待機）
 *  2. createTikTokStyleCaptions() でページ（表示単位）に分割
 *  3. 各ページを <Sequence> にマッピング
 *  4. 現在しゃべっているフレーズをゴールドでハイライト
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
} from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";

// ページの切り替わり間隔（ms）。大きいほど1ページに多くのフレーズが乗る
const SWITCH_CAPTIONS_EVERY_MS = 3000;

const HIGHLIGHT_COLOR = "#FFD700"; // 現在フレーズ：ゴールド
const TEXT_COLOR = "#FFFFFF";       // その他：白

// ─── CaptionPage: 1ページ分のテロップを描画 ────────────────────────────
const CaptionPage: React.FC<{ page: TikTokPage; fps: number }> = ({ page, fps }) => {
  // Sequence の中なので frame は 0 から始まるローカル時刻
  const frame = useCurrentFrame();
  const localMs = (frame / fps) * 1000;
  const absoluteMs = page.startMs + localMs; // グローバル絶対時刻

  return (
    <AbsoluteFill style={{
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: 72,
      pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0, 0, 0, 0.72)",
        padding: "12px 36px",
        borderRadius: 10,
        maxWidth: 1080,
        textAlign: "center",
        whiteSpace: "pre-wrap",
        // フォントは日本語対応のためシステムフォールバックに任せる
      }}>
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteMs && token.toMs > absoluteMs;
          return (
            <span
              key={token.fromMs}
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: isActive ? HIGHLIGHT_COLOR : TEXT_COLOR,
                lineHeight: 1.6,
                transition: "color 0.05s",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── CaptionOverlay: 字幕JSONを読み込み全Sequence を配置 ────────────────
export const CaptionOverlay: React.FC = () => {
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[] | null>(null);

  // delayRender でレンダリングを保留しながら JSON をフェッチ
  const [handle] = useState(() => delayRender("Loading captions"));

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(staticFile("captions/religion-captions.json"));
      if (!res.ok) {
        // ファイルが未生成の場合は空配列で続行（クラッシュしない）
        setCaptions([]);
      } else {
        const data: Caption[] = await res.json();
        setCaptions(data);
      }
    } catch {
      // ネットワークエラーなどは空配列で続行
      setCaptions([]);
    }
    continueRender(handle);
  }, [handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const { pages } = useMemo(() => {
    if (!captions || captions.length === 0) return { pages: [] };
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    });
  }, [captions]);

  if (!captions) return null; // フェッチ完了まで何も描画しない

  return (
    <>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = Math.floor((page.startMs / 1000) * fps);
        const endFrame = Math.min(
          nextPage ? Math.floor((nextPage.startMs / 1000) * fps) : Infinity,
          startFrame + Math.ceil((SWITCH_CAPTIONS_EVERY_MS / 1000) * fps),
        );
        const durationInFrames = endFrame - startFrame;
        if (durationInFrames <= 0) return null;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <CaptionPage page={page} fps={fps} />
          </Sequence>
        );
      })}
    </>
  );
};
