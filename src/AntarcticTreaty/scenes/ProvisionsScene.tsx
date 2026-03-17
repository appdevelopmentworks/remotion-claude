import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { Narration } from "../Narration";

// 各条文の定義
const PROVISIONS = [
  {
    article: "第1条",
    icon: "☮️",
    title: "平和的利用の原則",
    color: "#FF6B6B",
    audioFile: "antarctic-provision-1.wav",
    points: [
      "軍事基地・軍事演習の禁止",
      "兵器実験の禁止",
      "平和的目的のみ許可",
    ],
    narration:
      "南極大陸は平和のためだけに使われます。軍事基地・演習・兵器実験はすべて禁止。この原則は条約の根幹です。",
  },
  {
    article: "第2条",
    icon: "🔬",
    title: "科学的調査の自由",
    color: "#4ECDC4",
    audioFile: "antarctic-provision-2.wav",
    points: [
      "すべての締約国が科学調査を実施可能",
      "調査結果・データの自由な共有",
      "研究基地の相互訪問権",
    ],
    narration:
      "南極は地球最大の自然実験室です。どの国も自由に科学調査ができ、得られたデータは全人類で共有されます。",
  },
  {
    article: "第4条",
    icon: "🗺️",
    title: "領土権の凍結",
    color: "#45B7D1",
    audioFile: "antarctic-provision-3.wav",
    points: [
      "既存の領土権主張を凍結",
      "新たな領土権主張を禁止",
      "条約有効中は領土問題を棚上げ",
    ],
    narration:
      "7カ国が領土を主張する南極大陸。しかし条約は領土紛争を凍結し、どの国も新たな主張を行えなくしています。",
  },
  {
    article: "第5条",
    icon: "☢️",
    title: "核活動の禁止",
    color: "#FFD700",
    audioFile: "antarctic-provision-4.wav",
    points: [
      "核爆発実験の全面禁止",
      "放射性廃棄物の投棄禁止",
      "核の平和的利用も制限",
    ],
    narration:
      "南極は完全な非核地帯です。核実験も放射性廃棄物の廃棄も厳しく禁じられ、清浄な環境が守られています。",
  },
];

const PROVISION_DURATION = 105; // 各条文 3.5秒 × 4 = 14秒

// 箇条書きアイテム
const BulletPoint: React.FC<{ text: string; delay: number; color: string }> = ({
  text,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const x = spring({
    frame: frame - delay,
    fps,
    from: 30,
    to: 0,
    config: { damping: 200 },
    durationInFrames: 25,
  });

  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        transform: `translateX(${x}px)`,
        opacity,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: "rgba(220,240,255,0.9)",
          fontSize: 24,
          fontFamily: "sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// 1つの条文カード
const ProvisionCard: React.FC<(typeof PROVISIONS)[0]> = ({
  article,
  icon,
  title,
  color,
  points,
  narration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [PROVISION_DURATION - 12, PROVISION_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: opacity * fadeOut,
        transform: `scale(${scale})`,
      }}
    >
      {/* カード */}
      <div
        style={{
          width: 820,
          padding: "40px 52px",
          borderRadius: 24,
          background: `linear-gradient(135deg, ${color}18 0%, rgba(5,20,46,0.9) 100%)`,
          border: `2px solid ${color}50`,
          boxShadow: `0 0 60px ${color}20`,
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 56 }}>{icon}</span>
          <div>
            <div
              style={{
                color: color,
                fontSize: 16,
                fontFamily: "sans-serif",
                fontWeight: 600,
                letterSpacing: 3,
              }}
            >
              {article}
            </div>
            <h2
              style={{
                color: "white",
                fontSize: 40,
                fontWeight: 800,
                fontFamily: "sans-serif",
                margin: 0,
                textShadow: `0 0 30px ${color}60`,
              }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* 区切り線 */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(to right, ${color}80, transparent)`,
            marginBottom: 24,
          }}
        />

        {/* 箇条書き */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {points.map((p, i) => (
            <BulletPoint key={i} text={p} delay={25 + i * 12} color={color} />
          ))}
        </div>
      </div>

      <Narration text={narration} charFrames={2} startFrame={30} />
    </AbsoluteFill>
  );
};

export const ProvisionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 条文番号インジケーター
  const currentProvision = Math.min(
    Math.floor(frame / PROVISION_DURATION),
    PROVISIONS.length - 1
  );

  return (
    <AbsoluteFill>
      <Background />

      {/* 上部ラベル */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "rgba(100,200,255,0.8)",
            fontSize: 16,
            fontFamily: "sans-serif",
            letterSpacing: 4,
          }}
        >
          TREATY PROVISIONS
        </div>

        {/* ページインジケーター */}
        <div style={{ display: "flex", gap: 8 }}>
          {PROVISIONS.map((p, i) => (
            <div
              key={i}
              style={{
                width: i === currentProvision ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === currentProvision ? PROVISIONS[i].color : "rgba(255,255,255,0.2)",
                transition: "width 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* 各条文を Sequence で順番に表示 */}
      {PROVISIONS.map((provision, i) => (
        <Sequence
          key={i}
          from={i * PROVISION_DURATION}
          durationInFrames={PROVISION_DURATION + 10}
          premountFor={fps}
        >
          <ProvisionCard {...provision} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
