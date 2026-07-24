import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PhonicsComparison } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { DrawWord } from "../components/DrawWord";
import { WordIllustration } from "../components/WordIllustration";
import { Stage } from "../components/Stage";
import { bob, wiggle } from "../lib/motion";
import { hex, tint } from "../data/tokens";

// ⑤ "But y is brave — y loves being last! So ay always ends the word."
export const BraveY: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ay = data.teams[1];
  const c = hex(ay.colorHex);

  // 27–29 "y is brave" · 29–31.5 "loves being last" · 31.5s "ay goes at the end"
  const yIn = spring({ frame, fps, config: { damping: 11 } });
  const zoneIn = spring({ frame: frame - 135, fps, config: { damping: 12 } });

  return (
    <Stage caption="y is brave 💪" captionColor={c} gap={46}>
      <div
        style={{
          transform: `translateX(${interpolate(yIn, [0, 1], [-500, 0])}px) rotate(${wiggle(
            frame,
            fps,
            3,
            1.4
          )}deg)`,
          position: "relative",
        }}
      >
        <LetterBuddy text="y" colorHex={ay.colorHex} size={175} />
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -40,
            transform: `translateY(${bob(frame, fps, 8, 1.8)}px)`,
            fontSize: 90,
          }}
        >
          🏁
        </div>
      </div>

      <div
        style={{
          opacity: zoneIn,
          transform: `scale(${zoneIn})`,
          background: tint(ay.colorHex, 0.86),
          border: `8px solid ${c}`,
          borderRadius: 999,
          padding: "16px 44px",
          fontSize: 60,
          fontWeight: 600,
          color: c,
        }}
      >
        🏁 loves being LAST
      </div>

      <div style={{ opacity: zoneIn }}>
        <WordIllustration word="day" size={260} delay={140} />
      </div>

      <div style={{ opacity: zoneIn }}>
        <DrawWord blanked="d__" team={ay} size={165} startAt={150} drawFrames={42} />
      </div>
    </Stage>
  );
};
