import { interpolate, useCurrentFrame } from "remotion";

type NarrationProps = {
  text: string;
  /** 1文字表示するのにかかるフレーム数（小さいほど速い） */
  charFrames?: number;
  startFrame?: number;
};

// タイプライター効果（スキルのベストプラクティス: 文字列スライスを使用）
const getTypedText = (frame: number, text: string, charFrames: number, startFrame: number): string => {
  const localFrame = Math.max(0, frame - startFrame);
  const visible = Math.floor(localFrame / charFrames);
  return text.slice(0, visible);
};

const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame % 30, [0, 15, 30], [1, 0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <span style={{ opacity }}>|</span>;
};

export const Narration: React.FC<NarrationProps> = ({
  text,
  charFrames = 2,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const displayText = getTypedText(frame, text, charFrames, startFrame);
  const isDone = displayText.length >= text.length;

  // フェードイン
  const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px 60px 28px",
        background:
          "linear-gradient(to top, rgba(2,8,24,0.95) 0%, rgba(2,8,24,0.7) 80%, transparent 100%)",
        opacity,
      }}
    >
      <div
        style={{
          color: "rgba(220,240,255,0.95)",
          fontSize: 26,
          fontFamily: "sans-serif",
          lineHeight: 1.7,
          fontWeight: 400,
          letterSpacing: 0.5,
          textShadow: "0 1px 8px rgba(0,0,0,0.8)",
        }}
      >
        {displayText}
        {!isDone && <Cursor frame={frame} />}
      </div>
    </div>
  );
};
