import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";

// A big rounded letter-card, always subtly alive (bob + wiggle + breathe).
// No faces — the letters stay clean; personification is done via animation.
export const LetterBuddy: React.FC<{
  text: string;
  colorHex: string;
  size?: number;
  phase?: number;
  extraStyle?: React.CSSProperties;
}> = ({ text, colorHex, size = 300, phase = 0, extraStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(colorHex);

  return (
    <div
      style={{
        transform: `translateY(${bob(frame, fps, 10, 2.2, phase)}px) rotate(${wiggle(
          frame,
          fps,
          2,
          1.8,
          phase
        )}deg) scale(${pulse(frame, fps, 0.025, 1.6, phase)})`,
        background: palette.card,
        border: `10px solid ${c}`,
        borderRadius: size * 0.22,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 22px 50px ${palette.cardShadow}`,
        ...extraStyle,
      }}
    >
      <span style={{ fontSize: size * 0.5, fontWeight: 600, color: c, lineHeight: 1 }}>{text}</span>
    </div>
  );
};
