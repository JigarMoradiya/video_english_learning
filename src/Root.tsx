import React from "react";
import { Composition } from "remotion";
import { FPS, WIDTH, HEIGHT } from "./data/tokens";
import { REELS } from "./reels";

// One composition per reel (id = card id). Render a card with:
//   npx remotion render <id> out/<id>.mp4     e.g.  npx remotion render ai_ay out/ai_ay.mp4
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {REELS.map((r) => (
        <Composition
          key={r.id}
          id={r.id}
          component={r.component}
          durationInFrames={r.durationInFrames}
          fps={FPS}
          width={r.width ?? WIDTH}
          height={r.height ?? HEIGHT}
        />
      ))}
    </>
  );
};
