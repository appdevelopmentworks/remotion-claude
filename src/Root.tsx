import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld/HelloWorld";
import { SpringShowcase } from "./SpringShowcase/SpringShowcase";
import { SequenceDemo } from "./SequenceDemo/SequenceDemo";
import { TextReveal } from "./TextReveal/TextReveal";
import { AntarcticTreaty } from "./AntarcticTreaty/AntarcticTreaty";
import { CatMicrochip } from "./CatMicrochip/CatMicrochip";
import { CAT_TOTAL_FRAMES } from "./CatMicrochip/constants";
import { Religion } from "./Religion/Religion";
import { RELIGION_TOTAL_FRAMES } from "./Religion/constants";
import { TigerShorts, calculateMetadata as tigerShortsMetadata } from "./TigerShorts/TigerShorts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="basic">
        <Composition
          id="HelloWorld"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          width={1280}
          height={720}
          defaultProps={{
            titleText: "Hello, Remotion!",
            titleColor: "#FFFFFF",
          }}
        />
      </Folder>

      <Folder name="animations">
        <Composition
          id="SpringShowcase"
          component={SpringShowcase}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={720}
        />

        <Composition
          id="SequenceDemo"
          component={SequenceDemo}
          durationInFrames={240}
          fps={30}
          width={1280}
          height={720}
        />

        <Composition
          id="TextReveal"
          component={TextReveal}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={720}
          defaultProps={{
            message: "Remotionで動画をコードで作ろう",
          }}
        />
      </Folder>

      <Folder name="shorts">
        <Composition
          id="TigerShorts"
          component={TigerShorts}
          calculateMetadata={tigerShortsMetadata}
          durationInFrames={90 * 30} // fallback: 90秒（MP3から自動取得）
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="documentary">
        <Composition
          id="AntarcticTreaty"
          component={AntarcticTreaty}
          durationInFrames={1440}
          fps={30}
          width={1280}
          height={720}
        />

        <Composition
          id="CatMicrochip"
          component={CatMicrochip}
          durationInFrames={CAT_TOTAL_FRAMES}
          fps={30}
          width={1280}
          height={720}
        />

        <Composition
          id="Religion"
          component={Religion}
          durationInFrames={RELIGION_TOTAL_FRAMES}
          fps={30}
          width={1280}
          height={720}
        />
      </Folder>
    </>
  );
};
