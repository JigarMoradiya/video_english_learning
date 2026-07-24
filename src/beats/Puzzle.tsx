import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { Mascot } from "../components/Mascot";
import { Stage } from "../components/Stage";
import { bob, pulse, wiggle } from "../lib/motion";

// ③ "But if they sound the same… how do you know which one to use?"
export const Puzzle: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ai, ay] = data.teams;
  // 11–13 "if they sound the same" · 13s "how do you know?" → ? bounces in
  const qIn = spring({ frame: frame - 60, fps, config: { damping: 9 } });

  return (
    <Stage caption="which one? 🤷" gap={50}>
      <div style={{ display: "flex", gap: 80 }}>
        <div style={{ transform: `rotate(${-8 + wiggle(frame, fps, 4, 1.4)}deg)` }}>
          <LetterBuddy text={ai.marker} colorHex={ai.colorHex} size={220} phase={0} />
        </div>
        <div style={{ transform: `rotate(${8 + wiggle(frame, fps, 4, 1.4, 1)}deg)` }}>
          <LetterBuddy text={ay.marker} colorHex={ay.colorHex} size={220} phase={2} />
        </div>
      </div>

      <div
        style={{
          transform: `scale(${qIn * pulse(frame, fps, 0.08, 0.8)}) translateY(${bob(frame, fps, 14, 1.6)}px)`,
          fontSize: 220,
        }}
      >
        🤔
      </div>

      <Mascot size={230} flip />
    </Stage>
  );
};
