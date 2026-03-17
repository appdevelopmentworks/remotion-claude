import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { Narration } from "../Narration";
import { SceneHeading } from "../SceneHeading";

const NARRATION =
  "冷戦の緊張が高まる中、1957〜58年の国際地球観測年をきっかけに、" +
  "12カ国の科学者たちが南極での協力を推進。1959年12月1日、ワシントンD.C.で歴史的な条約が署名されました。";

const ORIGINAL_COUNTRIES = [
  { name: "🇦🇷 アルゼンチン", delay: 60 },
  { name: "🇦🇺 オーストラリア", delay: 75 },
  { name: "🇧🇪 ベルギー", delay: 90 },
  { name: "🇨🇱 チリ", delay: 105 },
  { name: "🇫🇷 フランス", delay: 120 },
  { name: "🇯🇵 日本", delay: 135 },
  { name: "🇳🇿 ニュージーランド", delay: 150 },
  { name: "🇳🇴 ノルウェー", delay: 165 },
  { name: "🇿🇦 南アフリカ", delay: 180 },
  { name: "🇷🇺 ソビエト連邦", delay: 195 },
  { name: "🇬🇧 イギリス", delay: 210 },
  { name: "🇺🇸 アメリカ", delay: 225 },
];

const CountryTag: React.FC<{ name: string; delay: number }> = ({ name, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    from: 0,
    to: 1,
    config: { stiffness: 180, damping: 20 },
    durationInFrames: 25,
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        background: "rgba(100,200,255,0.1)",
        border: "1px solid rgba(100,200,255,0.25)",
        color: "rgba(220,240,255,0.9)",
        fontSize: 18,
        fontFamily: "sans-serif",
        transform: `scale(${scale})`,
        opacity,
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </div>
  );
};

// タイムラインイベント
const TimelineEvent: React.FC<{
  year: string;
  label: string;
  desc: string;
  delay: number;
  accent: string;
}> = ({ year, label, desc, delay, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const x = spring({
    frame: frame - delay,
    fps,
    from: -50,
    to: 0,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        transform: `translateX(${x}px)`,
        opacity,
      }}
    >
      {/* ドット */}
      <div
        style={{
          marginTop: 6,
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: accent,
          boxShadow: `0 0 12px ${accent}`,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            color: accent,
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          {year}
        </div>
        <div
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "sans-serif",
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: "rgba(180,210,255,0.7)",
            fontSize: 17,
            fontFamily: "sans-serif",
            marginTop: 2,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
};

const timeline = [
  { year: "1957-58", label: "国際地球観測年（IGY）", desc: "12カ国が南極で科学協力を実施", delay: 20, accent: "#64C8FF" },
  { year: "1959年12月1日", label: "条約署名", desc: "ワシントンD.C.で12カ国が署名", delay: 40, accent: "#00E5A0" },
  { year: "1961年6月23日", label: "条約発効", desc: "12カ国すべてが批准し正式に発効", delay: 60, accent: "#FFD700" },
];

export const HistoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const outerOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // タイムラインの縦線のアニメーション
  const lineHeight = interpolate(frame, [15, 80], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: outerOpacity }}>
      <Background />
      <SceneHeading label="History" title="成立の歴史" icon="📜" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 80,
          paddingTop: 60,
          paddingBottom: 100,
        }}
      >
        {/* 左: タイムライン */}
        <div style={{ display: "flex", flexDirection: "row", gap: 20, alignItems: "flex-start" }}>
          {/* 縦線 */}
          <div
            style={{
              width: 2,
              height: lineHeight,
              background: "linear-gradient(to bottom, #64C8FF, #00E5A0, #FFD700)",
              marginTop: 10,
              borderRadius: 2,
            }}
          />
          {/* イベント */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {timeline.map((t, i) => (
              <TimelineEvent key={i} {...t} />
            ))}
          </div>
        </div>

        {/* 右: 原署名12カ国 */}
        <div>
          <div
            style={{
              color: "rgba(100,200,255,0.9)",
              fontSize: 16,
              fontFamily: "sans-serif",
              letterSpacing: 3,
              marginBottom: 16,
              textAlign: "center",
              opacity: interpolate(frame, [50, 70], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ORIGINAL 12 SIGNATORIES
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {ORIGINAL_COUNTRIES.map((c, i) => (
              <CountryTag key={i} name={c.name} delay={c.delay} />
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <Narration text={NARRATION} charFrames={2} startFrame={20} />
    </AbsoluteFill>
  );
};
