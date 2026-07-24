import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PhonicsComparison } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { Mascot } from "../components/Mascot";
import { Stage } from "../components/Stage";
import { bob, pulse } from "../lib/motion";

// ① 0–7s "Meet ai … and ay … — two best friends who make the same sound!"
// ai enters (~1s) → ay enters (~2.3s) → "best friends" moment (~3.8s).
export const Hook: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ai, ay] = data.teams;

  const aiIn = spring({ frame: frame - 25, fps, config: { damping: 12 } });
  const ayIn = spring({ frame: frame - 70, fps, config: { damping: 12 } });
  // "two best friends" — cards lean together + a heart pops between them.
  const friends = spring({ frame: frame - 115, fps, config: { damping: 10 } });
  const lean = friends * 26; // px the cards nudge toward each other

  return (
    <Stage caption="best friends! 🤝" captionDelay={120} gap={70}>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div
          style={{
            transform: `translateX(${interpolate(aiIn, [0, 1], [-750, 0]) + lean}px)`,
            opacity: aiIn,
          }}
        >
          <LetterBuddy text={ai.marker} colorHex={ai.colorHex} phase={0} />
        </div>

        {/* heart that appears at the "best friends" beat */}
        <div
          style={{
            width: friends > 0.01 ? "auto" : 0,
            transform: `scale(${friends * pulse(frame, fps, 0.12, 0.8)})`,
            fontSize: 120,
          }}
        >
          💛
        </div>

        <div
          style={{
            transform: `translateX(${interpolate(ayIn, [0, 1], [750, 0]) - lean}px)`,
            opacity: ayIn,
          }}
        >
          <LetterBuddy text={ay.marker} colorHex={ay.colorHex} phase={1.5} />
        </div>
      </div>

      <Mascot size={280} />
    </Stage>
  );
};
