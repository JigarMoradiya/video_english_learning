import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PhonicsComparison } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { Stage } from "../components/Stage";
import { bob, pulse } from "../lib/motion";
import { hex, palette } from "../data/tokens";

// ② "They both say… /ā/! Like in rain… and play!"
export const SameSound: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ai, ay] = data.teams;
  // 7–8 "they both say" · 8 "ayyy!" (/ā/) · 8.8 "rain" · 9.6 "play"
  const soundIn = spring({ frame: frame - 30, fps, config: { damping: 10 } });

  return (
    <Stage caption="same sound! 🔊" gap={80}>
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <LetterBuddy text={ai.marker} colorHex={ai.colorHex} size={230} phase={0} />
        <div
          style={{
            transform: `scale(${soundIn * pulse(frame, fps, 0.06, 0.9)})`,
            fontSize: 200,
            fontWeight: 700,
            color: palette.ink,
          }}
        >
          /ā/
        </div>
        <LetterBuddy text={ay.marker} colorHex={ay.colorHex} size={230} phase={1.5} />
      </div>

      <Mouth open={soundIn} />

      <div style={{ display: "flex", gap: 40 }}>
        <WordChip text="rain" color={hex(ai.colorHex)} delay={58} />
        <WordChip text="play" color={hex(ay.colorHex)} delay={82} />
      </div>
    </Stage>
  );
};

// An open mouth "saying" the long-A: opens wide with a talking wobble.
const Mouth: React.FC<{ open: number }> = ({ open }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const talk = 0.7 + 0.3 * Math.abs(Math.sin((frame / fps) * Math.PI * 3.2));
  const h = 30 + open * talk * 130;
  return (
    <div
      style={{
        width: 190,
        height: 180,
        borderRadius: "50%",
        background: "#F2A9A0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 30px rgba(30,36,56,0.18)",
        transform: `scale(${open})`,
        overflow: "hidden",
      }}
    >
      {/* open mouth cavity */}
      <div
        style={{
          width: 130,
          height: h,
          background: "#6B1F22",
          borderRadius: "50%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* teeth */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 16, background: "#fff", borderRadius: "0 0 40% 40%" }} />
        {/* tongue */}
        <div style={{ position: "absolute", bottom: -10, left: "20%", right: "20%", height: 34, background: "#E8607A", borderRadius: "50% 50% 40% 40%" }} />
      </div>
    </div>
  );
};

const WordChip: React.FC<{ text: string; color: string; delay: number }> = ({ text, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11 } });
  return (
    <div
      style={{
        transform: `translateY(${interpolate(s, [0, 1], [40, 0]) + bob(frame, fps, 6, 2.2)}px) scale(${s})`,
        opacity: s,
        background: color,
        color: "#fff",
        fontSize: 64,
        fontWeight: 600,
        padding: "16px 44px",
        borderRadius: 999,
      }}
    >
      {text}
    </div>
  );
};
