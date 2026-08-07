import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── THE STICKER BOARD ────────────────────────────────────────────────────────
//
// The world for the silent 9:16 rule reels. Measured off the user's own reference
// images, which are:
//
//   · 36–56% near-white          → a WHITE ground, not a scene
//   · 7–8% pure black            → heavy black outlines and lettering
//   · top-10 colours cover 73–79% → flat vector, essentially no gradients
//   · spot accents               → orange #E08020, blue #2060A0, warm yellow
//
// So everything here is a flat shape with a thick black outline and one job. There is
// no narration, so the visuals carry the whole lesson: bigger type, slower beats, and a
// single idea on screen at a time.

export const INK = "#141414";
export const PAPER = "#FFFDF7";
export const ORANGE = "#FF7A1A";
export const BLUE = "#1E6FD9";
export const RED = "#E5342A";
export const GREEN = "#2FA84F";
export const YELLOW = "#FFC61A";

const OUT = (w: number) => `${w}px solid ${INK}`;

/** springy pop, the workhorse of every entrance */
export const pop = (frame: number, fps: number, at: number, damping = 11) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.7, stiffness: 140 } });

/** flat confetti, so a white frame is never dead */
export const Confetti: React.FC<{ n?: number }> = ({ n = 30 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        // PALE tints, not the accent colours. At full strength these read as content and
        // fought the word they were meant to sit behind.
        const c = ["#FFE2C7", "#D6E6FF", "#FFF0BF", "#D8F1DF", "#FFDCD8"][i % 5];
        const x = ((i * 137) % 100) / 100 * width;
        const y = ((i * 61) % 100) / 100 * height;
        const r = (i * 47) % 360;
        const drift = Math.sin((frame + i * 24) / 30) * 26;
        const sq = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x, top: y + drift,
              width: sq ? 30 : 40, height: sq ? 30 : 15,
              borderRadius: sq ? 6 : 999,
              background: c, opacity: 0.85,
              transform: `rotate(${r + Math.sin((frame + i * 11) / 60) * 12}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

export const Board: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: PAPER }}>
    <Confetti />
    {children}
  </AbsoluteFill>
);

/**
 * A colour band across the frame, behind the hero word. A 1080x1920 canvas holding one
 * centred column of type reads as empty no matter how big the type is — the band is what
 * gives each beat its own identity and fills the frame.
 */
export const Panel: React.FC<{
  color: string; at?: number; top: number; height: number; skew?: number;
}> = ({ color, at = 0, top, height, skew = -3 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div
      style={{
        position: "absolute", left: -60, top, width: width + 120, height,
        background: color, border: OUT(7),
        transform: `rotate(${skew}deg) scaleY(${p})`,
        transformOrigin: "center",
      }}
    />
  );
};

/** small dots showing how far through the examples we are */
export const Dots: React.FC<{ total: number; on: number; y: number }> = ({ total, on, y }) => {
  const { width } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, top: y, width, display: "flex", justifyContent: "center", gap: 18 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === on ? 34 : 20, height: 20, borderRadius: 999,
          background: i === on ? INK : "#FFFFFF", border: OUT(5),
        }} />
      ))}
    </div>
  );
};

/** one letter, on a card with a heavy outline */
export const Tile: React.FC<{
  ch: string; size?: number; tone?: "plain" | "orange" | "blue" | "red" | "green" | "yellow";
  at?: number; shake?: boolean; seed?: number;
}> = ({ ch, size = 150, tone = "plain", at = 0, shake = false, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = { plain: "#FFFFFF", orange: ORANGE, blue: BLUE, red: RED, green: GREEN, yellow: YELLOW }[tone];
  const fg = tone === "plain" || tone === "yellow" ? INK : "#FFFFFF";
  const p = pop(frame, fps, at);
  const wob = shake ? Math.sin(frame / 2.2) * 4 : Math.sin((frame + seed * 30) / 52) * 1.6;
  return (
    <div
      style={{
        width: size, height: size * 1.12, borderRadius: size * 0.18,
        background: bg, border: OUT(Math.max(6, size * 0.055)),
        boxShadow: `0 ${size * 0.06}px 0 ${INK}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.family, fontWeight: 800, fontSize: size * 0.68, color: fg,
        transform: `scale(${p}) rotate(${wob}deg)`,
      }}
    >
      {ch}
    </div>
  );
};

/** a whole word, its letters entering one after another */
export const Word: React.FC<{
  text: string; size?: number; at?: number; stagger?: number;
  tones?: Record<number, "plain" | "orange" | "blue" | "red" | "green" | "yellow">;
  gap?: number;
}> = ({ text, size = 150, at = 0, stagger = 3, tones = {}, gap = 14 }) => (
  <div style={{ display: "flex", gap, alignItems: "flex-end" }}>
    {text.split("").map((c, i) => (
      <Tile key={i} ch={c} size={size} tone={tones[i] ?? "plain"} at={at + i * stagger} seed={i} />
    ))}
  </div>
);

/** the rule, in words — silent reels are watched muted, so the text does real work */
export const Line: React.FC<{
  text: string; size?: number; at?: number; tone?: string; boxed?: boolean;
}> = ({ text, size = 76, at = 0, tone = INK, boxed = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div
      style={{
        fontFamily: font.family, fontWeight: 800, fontSize: size, color: boxed ? "#FFFFFF" : tone,
        background: boxed ? tone : "transparent",
        border: boxed ? OUT(6) : "none",
        borderRadius: boxed ? 20 : 0,
        padding: boxed ? `${size * 0.16}px ${size * 0.34}px` : 0,
        textAlign: "center", lineHeight: 1.1, letterSpacing: 0.5,
        transform: `scale(${p}) translateY(${Math.sin((frame + at) / 26) * 5}px) rotate(${Math.sin((frame + at) / 41) * 0.5}deg)`,
        whiteSpace: "pre-line",
      }}
    >
      {text}
    </div>
  );
};

/** a big tick or cross stamped over a beat */
export const Stamp: React.FC<{ kind: "yes" | "no"; at: number; size?: number }> = ({ kind, at, size = 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 9);
  const c = kind === "yes" ? GREEN : RED;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.24,
        background: c, border: OUT(7), boxShadow: `0 ${size * 0.05}px 0 ${INK}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.family, fontWeight: 800, fontSize: size * 0.6, color: "#FFFFFF",
        transform: `scale(${p}) translateY(${Math.sin(frame / 22) * 6}px) rotate(${-8 + 5 * Math.sin(frame / 15)}deg)`,
      }}
    >
      {kind === "yes" ? "✓" : "✕"}
    </div>
  );
};

/** everything on screen sits in this column, so nothing can ever overlap */
export const Stack: React.FC<{ children: React.ReactNode; gap?: number; top?: number }> = ({
  children, gap = 60, top,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute", left: width * 0.06, top: top ?? height * 0.14,
        width: width * 0.88, height: top !== undefined ? undefined : height * 0.72,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap,
      }}
    >
      {children}
    </div>
  );
};

/** wipes the frame between sections so two beats can never share it */
export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children}</>;
};

export const fadeIn = (frame: number, at: number, len = 8) =>
  interpolate(frame - at, [0, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
