import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld/HelloWorld";
import { SpringShowcase } from "./SpringShowcase/SpringShowcase";
import { SequenceDemo } from "./SequenceDemo/SequenceDemo";
import { TextReveal } from "./TextReveal/TextReveal";

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
    </>
  );
};
