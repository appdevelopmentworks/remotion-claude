import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

type AudioNarrationProps = {
  /** public/audio/ 以下のファイル名（例: "antarctic-intro.wav"） */
  filename: string;
  /** 再生開始までの遅延フレーム数（デフォルト: 15フレーム = 0.5秒） */
  delayFrames?: number;
  /** 音量 0〜1 */
  volume?: number;
};

/**
 * VOICEVOXで生成したナレーション音声を再生するコンポーネント。
 *
 * 音声ファイルが存在しない場合は何も表示されません（エラーにはなりません）。
 * 先に scripts/generate-voicevox.mjs を実行して音声を生成してください。
 */
export const AudioNarration: React.FC<AudioNarrationProps> = ({
  filename,
  delayFrames = 15,
  volume = 1,
}) => {
  return (
    <Sequence from={delayFrames} layout="none">
      <Audio
        src={staticFile(`audio/${filename}`)}
        volume={volume}
      />
    </Sequence>
  );
};
