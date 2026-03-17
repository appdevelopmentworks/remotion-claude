# Remotion Claude

Reactコードで動画を作成するプロジェクトです。
[Remotion](https://www.remotion.dev/) を使って、アニメーション付きのMP4動画をプログラムで生成できます。

---

## はじめに

### 必要なもの

- [Node.js](https://nodejs.org/) バージョン18以上（`node --version` で確認できます）
- npmはNode.jsと一緒にインストールされます

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
# HelloWorld を書き出す場合
npx remotion render HelloWorld out/HelloWorld.mp4

# TextReveal を書き出す場合
npx remotion render TextReveal out/TextReveal.mp4
```

`out/` フォルダにMP4ファイルが生成されます。

---

## 収録コンテンツ

| ID | 内容 | 長さ |
|---|---|---|
| **HelloWorld** | タイトル画面（スプリングアニメーション） | 5秒 |
| **SpringShowcase** | バネ物理の6種類比較 | 6秒 |
| **SequenceDemo** | Remotionのコア概念を順番に紹介 | 8秒 |
| **TextReveal** | 文字ごとに登場するテキストアニメーション | 6秒 |

---

## フォルダ構成

```
remotion-claude/
├── src/
│   ├── index.ts          ← エントリーポイント（触らなくてOK）
│   ├── Root.tsx          ← 動画の一覧を定義する場所
│   ├── HelloWorld/       ← タイトル動画
│   ├── SpringShowcase/   ← スプリングアニメーション
│   ├── SequenceDemo/     ← シーケンスデモ
│   └── TextReveal/       ← テキストアニメーション
├── public/               ← 画像・音声などの素材を置く場所
├── out/                  ← 書き出したMP4が保存される場所
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

---

## 新しい動画を作るには

### 手順1：コンポーネントファイルを作る

`src/` の中に新しいフォルダとファイルを作ります。

```tsx
// src/MyVideo/MyVideo.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame(); // 現在のフレーム番号（0始まり）

  // frameに応じて透明度を変化させる（0〜30フレームでフェードイン）
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ background: "black", justifyContent: "center", alignItems: "center" }}
    >
      <h1 style={{ color: "white", opacity, fontSize: 80 }}>
        はじめての動画！
      </h1>
    </AbsoluteFill>
  );
};
```

### 手順2：Root.tsx に登録する

`src/Root.tsx` を開き、新しいコンポーネントを追加します。

```tsx
import { MyVideo } from "./MyVideo/MyVideo";

// <> の中に追加
<Composition
  id="MyVideo"          // ← 動画のID（英数字とハイフンのみ）
  component={MyVideo}
  durationInFrames={90} // ← フレーム数（30fps × 3秒 = 90）
  fps={30}
  width={1280}
  height={720}
/>
```

### 手順3：Studio で確認する

`npm start` を実行してブラウザで確認。左のサイドバーに `MyVideo` が追加されているはずです。

---

## よく使うRemotionの機能

### `useCurrentFrame()`
現在のフレーム番号を取得します。最初のフレームは `0` です。

```tsx
const frame = useCurrentFrame(); // 例: 0, 1, 2, ..., 149
```

### `interpolate()`
フレーム番号を別の値（透明度・位置・サイズなど）に変換します。

```tsx
// フレーム0〜30の間で、opacity が 0→1 に変化する
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp", // 範囲外に出ないように制限
});
```

### `spring()`
物理ベースのバネアニメーションを作ります。弾むような自然な動きに。

```tsx
import { spring, useVideoConfig } from "remotion";

const { fps } = useVideoConfig();
const scale = spring({
  frame,
  fps,
  from: 0,  // 開始値
  to: 1,    // 終了値
  config: { stiffness: 100, damping: 10 },
});
```

### `<Sequence>`
コンテンツの表示タイミングをずらします。

```tsx
// 30フレーム目から表示する
<Sequence from={30}>
  <MyComponent />
</Sequence>
```

### `<AbsoluteFill>`
動画の全画面に広がるコンテナです。背景や全画面レイアウトに使います。

```tsx
<AbsoluteFill style={{ background: "blue" }}>
  {/* ここに内容を書く */}
</AbsoluteFill>
```

---

## フレーム数の計算

```
フレーム数 = 秒数 × fps
```

| 秒数 | 30fps | 60fps |
|---|---|---|
| 1秒 | 30 | 60 |
| 3秒 | 90 | 180 |
| 5秒 | 150 | 300 |
| 10秒 | 300 | 600 |

---

## AI ツールと連携する

このプロジェクトには **Remotion ベストプラクティス スキル** が導入されています。
Cursor、GitHub Copilot、Claude Code などのAIツールでこのフォルダを開くと、
AIが Remotion の正しい書き方を理解した上でコードを生成してくれます。

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

### `<Folder name>` でエラーが出る
フォルダ名に使える文字は **英数字とハイフン（-）のみ** です。日本語は使えません。

```tsx
// NG
<Folder name="アニメーション">

// OK
<Folder name="animations">
```

### 動画の書き出しが遅い
Remotionのレンダリングはフレームごとにブラウザで描画するため、長い動画ほど時間がかかります。
まずは短い動画（5秒以内）でテストするのがおすすめです。

---

## 参考リンク

- [Remotion 公式ドキュメント](https://www.remotion.dev/docs)
- [Remotion GitHub](https://github.com/remotion-dev/remotion)
- [Remotion Discord コミュニティ](https://remotion.dev/discord)
