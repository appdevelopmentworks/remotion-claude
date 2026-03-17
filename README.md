# Remotion Claude

Reactコードで動画を作成するプロジェクトです。
[Remotion](https://www.remotion.dev/) を使って、アニメーション付きのMP4動画をプログラムで生成できます。

---

## はじめに

### 必要なもの

- [Node.js](https://nodejs.org/) バージョン18以上（`node --version` で確認）
- npm（Node.jsと一緒にインストールされます）
- ナレーション付き動画を作る場合は [VOICEVOX](https://voicevox.hiroshiba.jp/)（無料）

### セットアップ

```bash
# 1. このフォルダに移動
cd remotion-claude

# 2. 必要なパッケージをインストール（初回のみ）
npm install
```

---

## 使い方

### Remotion Studio を起動する（プレビュー画面）

```bash
npm start
```

ブラウザが自動で開き、動画のプレビュー画面が表示されます。
コードを編集すると**リアルタイムで反映**されます。

### 動画ファイル（MP4）を書き出す

```bash
# 動画IDを指定してレンダリング
npx remotion render HelloWorld out/HelloWorld.mp4
npx remotion render Religion out/Religion.mp4

# 高速化（並列処理数を増やす）
npx remotion render Religion out/Religion.mp4 --concurrency=4
```

`out/` フォルダにMP4ファイルが生成されます。

---

## 収録コンテンツ

### アニメーションサンプル（`basic` / `animations` フォルダ）

| ID | 内容 | 長さ |
|---|---|---|
| **HelloWorld** | タイトル画面（スプリングアニメーション） | 5秒 |
| **SpringShowcase** | バネ物理の6種類比較 | 6秒 |
| **SequenceDemo** | Remotionのコア概念を順番に紹介 | 8秒 |
| **TextReveal** | 文字ごとに登場するテキストアニメーション | 6秒 |

### ドキュメンタリー動画（`documentary` フォルダ）

| ID | 内容 | 長さ | ナレーター | 字幕 |
|---|---|---|---|---|
| **AntarcticTreaty** | 南極条約の解説 | 48秒 | ずんだもん | なし |
| **CatMicrochip** | 猫とICチップの解説 | 70秒 | ずんだもん | なし |
| **Religion** | 世界三大宗教の解説 | 75秒 | もち子さん | あり（フレーズハイライト付き） |

> **注意**: ドキュメンタリー動画は音声ファイル（WAV）が必要です。
> WAVファイルはgitに含まれていないため、以下の「ナレーション音声の生成手順」を参照してください。

---

## フォルダ構成

```
remotion-claude/
├── src/
│   ├── index.ts              ← エントリーポイント（触らなくてOK）
│   ├── Root.tsx              ← 動画の一覧を定義する場所
│   ├── HelloWorld/           ← タイトル動画（基本サンプル）
│   ├── SpringShowcase/       ← スプリングアニメーション
│   ├── SequenceDemo/         ← シーケンスデモ
│   ├── TextReveal/           ← テキストアニメーション
│   ├── AntarcticTreaty/      ← 南極条約（ドキュメンタリー）
│   ├── CatMicrochip/         ← 猫とICチップ（ドキュメンタリー）
│   │   ├── CatMicrochip.tsx  ← メインコンポーネント
│   │   ├── constants.ts      ← シーン長・音声タイミング定義
│   │   └── scenes/           ← シーンごとのコンポーネント
│   └── Religion/             ← 世界三大宗教（ドキュメンタリー＋字幕）
│       ├── Religion.tsx
│       ├── CaptionOverlay.tsx ← 字幕オーバーレイ
│       ├── constants.ts
│       └── scenes/
├── public/
│   ├── audio/                ← WAV音声ファイル（gitignoreされています）
│   └── captions/             ← 字幕JSONファイル
├── scripts/
│   ├── generate-voicevox.mjs          ← 南極条約 WAV生成
│   ├── merge-narration.mjs            ← 南極条約 WAVマージ
│   ├── generate-cat-voicevox.mjs      ← 猫ICチップ WAV生成
│   ├── merge-cat-narration.mjs        ← 猫ICチップ WAVマージ
│   ├── generate-religion-voicevox.mjs ← 世界三大宗教 WAV生成
│   ├── merge-religion-narration.mjs   ← 世界三大宗教 WAVマージ
│   └── generate-religion-captions.mjs ← 世界三大宗教 字幕JSON生成
├── .agents/skills/                    ← AI向けベストプラクティス
├── out/                      ← 書き出したMP4が保存される場所
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

---

## ナレーション音声の生成手順

WAVファイルはファイルサイズが大きいためgitに含まれていません。
以下の手順で各自の環境で生成してください。

### 事前準備（共通）

1. [VOICEVOX 公式サイト](https://voicevox.hiroshiba.jp/) からアプリをダウンロード・インストール
2. VOICEVOXを起動する（起動したまま以下を実行します）

### 南極条約（AntarcticTreaty）

```bash
# ステップ1: WAVファイルを生成（public/audio/antarctic-*.wav）
npm run voicevox

# ステップ2: 全WAVを1本にマージ（public/audio/antarctic-narration-merged.wav）
npm run merge-audio

# ステップ3: Studio でプレビュー
npm start
```

### 猫とICチップ（CatMicrochip）

```bash
npm run voicevox:cat
npm run merge-audio:cat
npm start
```

### 世界三大宗教（Religion）— 字幕付き

```bash
# ステップ1: WAV生成
npm run voicevox:religion

# ステップ2: WAVマージ
npm run merge-audio:religion

# ステップ3: 字幕JSONを生成（public/captions/religion-captions.json）
npm run captions:religion

# ステップ4: Studio でプレビュー
npm start
```

### ナレーターを変更したい場合

使用可能なスピーカー一覧を確認できます（VOICEVOXを起動した状態で実行）。

```bash
npm run voicevox:speakers          # 南極条約
npm run voicevox:cat:speakers      # 猫ICチップ
npm run voicevox:religion:speakers # 世界三大宗教
```

出力例：
```
  ID   3: ずんだもん (ノーマル)
  ID  13: 青山龍星 (ノーマル)
  ID  20: もち子(cv 明日葉よもぎ) (ノーマル)
```

スピーカーIDを指定して再生成する例：
```bash
node scripts/generate-religion-voicevox.mjs --speaker 13
```

### 音声ファイル一覧

```
public/audio/
├── antarctic-title.wav             ← 南極条約 タイトルシーン
├── antarctic-intro.wav             ← 南極条約 イントロ
├── antarctic-*.wav                 ← 南極条約 各シーン
├── antarctic-narration-merged.wav  ← 南極条約 結合済み（動画が参照）
├── cat-intro.wav                   ← 猫ICチップ 各シーン
├── cat-*.wav
├── cat-narration-merged.wav        ← 猫ICチップ 結合済み
├── religion-title.wav              ← 世界三大宗教 各シーン
├── religion-*.wav
└── religion-narration-merged.wav   ← 世界三大宗教 結合済み

public/captions/
└── religion-captions.json          ← 世界三大宗教 字幕データ
```

---

## 新しいドキュメンタリー動画を作るには

ナレーション付きドキュメンタリー動画を一から作る手順です。
既存の `Religion/` や `CatMicrochip/` を参考にしてください。

### ステップ1：シーン設計（台本・タイミング）

台本を作り、各シーンの長さを決めます。

```
日本語TTS目安: 約6文字/秒（speedScale=1.0 の場合）
シーン長 = 推定発話時間 + 余裕（3〜4秒）

例: 80文字のナレーション
  → 80 ÷ 6 ≈ 13秒 → +4秒余裕 → 17秒 → 510フレーム（30fps）
```

### ステップ2：constants.ts を作る

```ts
// src/MyVideo/constants.ts
export const SCENE_DURATIONS = {
  title:   330,  // 11秒
  scene1:  510,  // 17秒
  scene2:  480,  // 16秒
  summary: 390,  // 13秒
} as const;

type SceneKey = keyof typeof SCENE_DURATIONS;
export const SCENE_STARTS = (
  Object.keys(SCENE_DURATIONS) as SceneKey[]
).reduce((acc, key, i, keys) => {
  acc[key] = i === 0 ? 0 : acc[keys[i - 1]] + SCENE_DURATIONS[keys[i - 1]];
  return acc;
}, {} as Record<SceneKey, number>);

export const MY_VIDEO_TOTAL_FRAMES =
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
```

### ステップ3：シーンコンポーネントを作る

`src/MyVideo/scenes/` 以下に各シーンのReactコンポーネントを作ります。
`useCurrentFrame()` と `spring()` / `interpolate()` でアニメーションを実装します。

### ステップ4：メインコンポーネントを作る

```tsx
// src/MyVideo/MyVideo.tsx
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";

export const MyVideo: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("audio/my-narration-merged.wav")} volume={1} />
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.title}   premountFor={60}>
        <TitleScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene1}  premountFor={60}>
        <Scene1 />
      </Series.Sequence>
      {/* ... */}
    </Series>
  </AbsoluteFill>
);
```

### ステップ5：Root.tsx に登録する

```tsx
// src/Root.tsx に追加
import { MyVideo } from "./MyVideo/MyVideo";
import { MY_VIDEO_TOTAL_FRAMES } from "./MyVideo/constants";

<Composition
  id="MyVideo"
  component={MyVideo}
  durationInFrames={MY_VIDEO_TOTAL_FRAMES}
  fps={30}
  width={1280}
  height={720}
/>
```

### ステップ6：VOICEVOX スクリプトを作る

`scripts/generate-voicevox.mjs` をコピーして台本テキストを書き換えます。
`scripts/merge-narration.mjs` をコピーして `TOTAL_FRAMES` と `AUDIO_TRACKS` を更新します。

詳細は `.agents/skills/remotion-best-practices/rules/voicevox.md` を参照。

### ステップ7（任意）：字幕を追加する

`scripts/generate-religion-captions.mjs` をコピーして台本テキストを書き換えます。
字幕コンポーネントは `src/Religion/CaptionOverlay.tsx` をコピーして使います。

詳細は `.agents/skills/remotion-best-practices/rules/voicevox-captions.md` を参照。

---

## 基本的な新しい動画を作るには

アニメーションのみ（ナレーションなし）の動画を作る手順です。

### 手順1：コンポーネントファイルを作る

```tsx
// src/MyVideo/MyVideo.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "black", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "white", opacity, fontSize: 80 }}>
        はじめての動画！
      </h1>
    </AbsoluteFill>
  );
};
```

### 手順2：Root.tsx に登録する

```tsx
import { MyVideo } from "./MyVideo/MyVideo";

<Composition
  id="MyVideo"
  component={MyVideo}
  durationInFrames={90}  // 30fps × 3秒 = 90フレーム
  fps={30}
  width={1280}
  height={720}
/>
```

### 手順3：Studio で確認する

```bash
npm start
```

左サイドバーに `MyVideo` が表示されます。

---

## よく使うRemotionの機能

### `useCurrentFrame()`
現在のフレーム番号（0始まり）を取得します。

```tsx
const frame = useCurrentFrame(); // 0, 1, 2, ..., N-1
```

### `interpolate()`
フレーム番号を別の値に変換します。

```tsx
// 0〜30フレームで opacity が 0→1
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});
```

### `spring()`
物理ベースのバネアニメーション。

```tsx
import { spring, useVideoConfig } from "remotion";

const { fps } = useVideoConfig();
const scale = spring({ frame, fps, from: 0, to: 1,
  config: { stiffness: 100, damping: 10 },
});
```

### `<Series>` と `<Series.Sequence>`
シーンを順番に並べます（`premountFor` で事前レンダリングを有効化）。

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={300} premountFor={60}>
    <Scene1 />
  </Series.Sequence>
  <Series.Sequence durationInFrames={300} premountFor={60}>
    <Scene2 />
  </Series.Sequence>
</Series>
```

### `<Audio>`
音声ファイルを再生します。

```tsx
import { Audio, staticFile } from "remotion";

<Audio src={staticFile("audio/narration-merged.wav")} volume={1} />
```

> **重要**: 複数の `<Audio>` を使うとタイムライン上に複数の音声バーが表示されます。
> ナレーションは必ず1本にマージしてから単一の `<Audio>` で使用してください。

---

## フレーム数の計算

```
フレーム数 = 秒数 × fps
```

| 秒数 | 30fps | 例 |
|---|---|---|
| 5秒 | 150 | 短いシーン |
| 10秒 | 300 | 標準シーン |
| 17秒 | 510 | 長いナレーション |
| 75秒 | 2250 | 動画全体（Religion） |

---

## AI ツールと連携する

このプロジェクトには **Remotion ベストプラクティス スキル** が導入されています。
Claude Code などのAIツールでこのフォルダを開くと、AIが正しい書き方を理解してコードを生成します。

カバーされている主なトピック：
- アニメーション・スプリング・シーケンス
- 音声・ナレーション（ElevenLabs / **VOICEVOX**）
- 字幕・テロップ（Whisper不要の**VOICEVOX字幕同期**も含む）
- トランジション・テキストアニメーション
- 画像・動画・GIF・Lottie埋め込み

```bash
# スキルの更新
npx skills add remotion-dev/skills --yes
```

---

## トラブルシューティング

### `npm start` でエラーが出る

```bash
npm install  # パッケージを再インストール
```

### 動画を開くと音声が出ない（ドキュメンタリー）

WAVファイルが生成されていません。「ナレーション音声の生成手順」を実行してください。

```bash
npm run voicevox:religion  # 例: Religion の場合
npm run merge-audio:religion
```

### VOICEVOX に接続できない

```
❌ VOICEVOX に接続できません。
```

VOICEVOXアプリが起動しているか確認してください（`http://localhost:50021` が必要）。
Dockerを使う場合：

```bash
docker run --rm -it -p 50021:50021 voicevox/voicevox_engine
```

### 字幕が表示されない（Religion）

字幕JSONが生成されていません。

```bash
npm run captions:religion
```

### `<Folder name>` でエラーが出る

フォルダ名は**英数字とハイフン（-）のみ**です。日本語は使えません。

```tsx
// NG: <Folder name="アニメーション">
// OK: <Folder name="animations">
```

### 動画の書き出しが遅い

```bash
# 並列処理数を増やして高速化
npx remotion render Religion out/Religion.mp4 --concurrency=4
```

---

## 参考リンク

- [Remotion 公式ドキュメント](https://www.remotion.dev/docs)
- [VOICEVOX 公式サイト](https://voicevox.hiroshiba.jp/)
- [Remotion GitHub](https://github.com/remotion-dev/remotion)
- [Remotion Discord コミュニティ](https://remotion.dev/discord)
