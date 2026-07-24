import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { palette } from "../data/tokens";

// A short caption pill (a few words max — voice does the teaching).
// Flows inside <Stage> beneath the content, so it stays in the safe zone.
export const Caption: React.FC<{ text: string; color?: string; delay?: number }> = ({
  text,
  color = palette.ink,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        marginTop: 20,
        transform: `translateY(${bob(frame, fps, 6, 2.6)}px) scale(${s})`,
        background: "rgba(255,255,255,0.92)",
        color,
        fontSize: 58,
        fontWeight: 600,
        padding: "20px 46px",
        borderRadius: 999,
        boxShadow: `0 14px 34px ${palette.cardShadow}`,
      }}
    >
      {text}
    </div>
  );
};
