import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── GLOSSY BLOCKS ────────────────────────────────────────────────────────────
//
// The second silent reel's world, deliberately NOT the first one's. Where the doubling
// reel is flat sticker on white — thick black outlines, no gradients — this one is
// chunky extruded blocks with a highlight and a coloured shadow, floating on a soft
// pastel sky. Same teaching, different skin, so the two reels never look like a series
// of one idea repeated.
//
// The extrusion is a second copy of the block offset down-right, not a 3D engine: at
// reel sizes it reads as solid and costs nothing to render.

export const SKY_TOP = "#EAF4FF";
export const SKY_BOT = "#FFE9F2";
export const INK = "#2A2440";
export const C = {
  c: "#3D7BFF",
  k: "#FF7A3D",
  ck: "#8B5CF6",
  good: "#22C08A",
  bad: "#FF4D6D",
  sun: "#FFC93C",
};

export const pop = (frame: number, fps: number, at: number, damping = 12) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 130 } });

/** floating pastel bubbles, so a soft background still moves */
const Bubbles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: 26 }).map((_, i) => {
        const s = 60 + (i % 5) * 46;
        const x = ((i * 149) % 100) / 100 * width;
        const y = ((i * 83) % 100) / 100 * height + Math.sin((frame + i * 40) / 46) * 44;
        const tint = ["#FFFFFF", "#FFE0EC", "#DDEBFF", "#FFF3D0"][i % 4];
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%",
            background: tint, opacity: 0.5,
          }} />
        );
      })}
    </>
  );
};

export const Sky: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, #CFE6FF 0%, #FFFFFF 46%, #FFD9E8 100%)` }}>
    <Bubbles />
    {children}
  </AbsoluteFill>
);

/** an extruded block. The second copy behind it is the whole 3D trick. */
export const Block: React.FC<{
  ch: string; size?: number; color?: string; at?: number; seed?: number; dim?: boolean;
}> = ({ ch, size = 160, color = C.c, at = 0, seed = 0, dim = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  const float = Math.sin((frame + seed * 26) / 34) * 6;
  const d = size * 0.11;
  const rgb = parseInt(color.slice(1), 16);
  const lum = 0.299 * ((rgb >> 16) & 255) + 0.587 * ((rgb >> 8) & 255) + 0.114 * (rgb & 255);
  const shade = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (sh: number) => Math.max(0, Math.min(255, ((n >> sh) & 255) + amt));
    return `rgb(${f(16)},${f(8)},${f(0)})`;
  };
  return (
    <div style={{
      position: "relative", width: size, height: size * 1.08,
      transform: `scale(${p}) translateY(${float}px)`, opacity: dim ? 0.34 : 1,
    }}>
      {/* the extrusion */}
      <div style={{
        position: "absolute", left: d, top: d, width: size, height: size * 1.08,
        borderRadius: size * 0.22, background: shade(color, -58),
      }} />
      {/* the face */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: size * 0.22,
        background: `linear-gradient(150deg, ${shade(color, 34)} 0%, ${color} 52%, ${shade(color, -20)} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.family, fontWeight: 800, fontSize: size * 0.62,
        color: lum > 165 ? INK : "#FFFFFF",
        textShadow: lum > 165 ? "none" : `0 ${size * 0.02}px 0 ${shade(color, -50)}`,
      }}>
        {ch}
      </div>
      {/* the highlight that makes it read as glossy */}
      <div style={{
        position: "absolute", left: size * 0.12, top: size * 0.08,
        width: size * 0.5, height: size * 0.22, borderRadius: "50%",
        background: "rgba(255,255,255,0.5)", filter: "blur(2px)",
      }} />
    </div>
  );
};

/**
 * A soft rounded slab behind the hero row. A tall frame holding one centred column reads
 * as empty however big the type is; the slab gives each beat its own block of colour.
 */
export const Band: React.FC<{ color: string; at?: number; top: number; height: number; tilt?: number }> = ({
  color, at = 0, top, height, tilt = -2.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div style={{
      position: "absolute", left: -40, top, width: width + 80, height,
      borderRadius: 54, background: color,
      boxShadow: "0 26px 0 rgba(42,36,64,0.16)",
      transform: `rotate(${tilt}deg) scaleY(${p})`,
    }} />
  );
};

export const Dots: React.FC<{ total: number; on: number; y: number; color: string }> = ({ total, on, y, color }) => {
  const { width } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, top: y, width, display: "flex", justifyContent: "center", gap: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === on ? 38 : 22, height: 22, borderRadius: 999,
          background: i === on ? color : "rgba(42,36,64,0.18)",
          boxShadow: i === on ? `0 5px 0 rgba(42,36,64,0.22)` : "none",
        }} />
      ))}
    </div>
  );
};

export const Word: React.FC<{
  text: string; size?: number; at?: number; colors?: Record<number, string>;
  dimAll?: boolean; gap?: number; stagger?: number;
}> = ({ text, size = 150, at = 0, colors = {}, dimAll = false, gap = 16, stagger = 3 }) => (
  <div style={{ display: "flex", gap, alignItems: "flex-end" }}>
    {text.split("").map((ch, i) => (
      <Block key={i} ch={ch} size={size} color={colors[i] ?? "#FFFFFF"} at={at + i * stagger} seed={i} dim={dimAll} />
    ))}
  </div>
);

export const Title: React.FC<{ text: string; size?: number; at?: number; color?: string }> = ({
  text, size = 92, at = 0, color = INK,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, color,
      textAlign: "center", lineHeight: 1.12, whiteSpace: "pre-line",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 27) * 6}px)`,
      textShadow: "0 4px 0 rgba(42,36,64,0.14)",
    }}>
      {text}
    </div>
  );
};

/** a soft pill behind a rule, so the words read against the pastel sky */
export const Pill: React.FC<{
  text: string; color: string; size?: number; at?: number;
  /** on a SOLID band the pill inverts — white plate, coloured text — or colour lands on colour */
  onBand?: boolean;
}> = ({ text, color, size = 66, at = 0, onBand = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div style={{
      padding: `${size * 0.26}px ${size * 0.62}px`, borderRadius: 999,
      background: onBand ? "#FFFFFF" : color, color: onBand ? color : "#FFFFFF",
      fontFamily: font.family, fontWeight: 800, fontSize: size,
      boxShadow: `0 ${size * 0.14}px 0 rgba(42,36,64,0.22)`,
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 31) * 6}px) rotate(${Math.sin((frame + at) / 47) * 0.6}deg)`, whiteSpace: "nowrap",
    }}>
      {text}
    </div>
  );
};

/**
 * A small dark chip for a section number. As plain white text the "RULE 1" label had no
 * ground of its own and drifted over the top edge of the band it belonged to.
 */
/**
 * A light plate the hero word sits on. The word needs a surface of its OWN, distinct from
 * the section band — letters straight onto a solid colour band never separate cleanly,
 * whatever colour the blocks are.
 */
export const Plate: React.FC<{ children: React.ReactNode; at?: number; pad?: number }> = ({
  children, at = 0, pad = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div style={{
      padding: `${pad}px ${pad * 1.4}px`, borderRadius: 46,
      background: "rgba(255,255,255,0.92)",
      boxShadow: "0 16px 0 rgba(42,36,64,0.14)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16,
      transform: `scale(${0.94 + 0.06 * p})`,
    }}>
      {children}
    </div>
  );
};

/** a big emoji, popped in and idling — used to head a section */
export const Icon: React.FC<{ glyph: string; at?: number; size?: number }> = ({ glyph, at = 0, size = 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 11);
  return (
    <div style={{
      fontSize: size, lineHeight: 1,
      transform: `scale(${p}) translateY(${Math.sin(frame / 24) * 8}px) rotate(${Math.sin(frame / 38) * 5}deg)`,
    }}>
      {glyph}
    </div>
  );
};

export const Tag: React.FC<{ text: string; at?: number; size?: number }> = ({ text, at = 0, size = 46 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div style={{
      padding: `${size * 0.22}px ${size * 0.66}px`, borderRadius: 999,
      background: INK, color: "#FFFFFF",
      fontFamily: font.family, fontWeight: 800, fontSize: size, letterSpacing: 2,
      boxShadow: "0 7px 0 rgba(42,36,64,0.30)",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 33) * 4}px)`,
      whiteSpace: "nowrap",
    }}>
      {text}
    </div>
  );
};

export const Mark: React.FC<{ kind: "yes" | "no"; at: number; size?: number }> = ({ kind, at, size = 130 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 9);
  const col = kind === "yes" ? C.good : C.bad;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: col,
      // a white ring, so the mark still separates when it lands on a band of its own
      // colour — the red cross on the red NEVER band had disappeared entirely
      border: `${Math.max(4, size * 0.055)}px solid #FFFFFF`, boxSizing: "border-box",
      boxShadow: `0 ${size * 0.09}px 0 rgba(42,36,64,0.25)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.56, color: "#FFFFFF",
      transform: `scale(${p}) translateY(${Math.sin(frame / 21) * 7}px) rotate(${Math.sin(frame / 33) * 6}deg)`,
    }}>
      {kind === "yes" ? "✓" : "✕"}
    </div>
  );
};

export const Stack: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 56 }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{
      position: "absolute", left: width * 0.06, top: height * 0.13,
      width: width * 0.88, height: height * 0.74,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap,
    }}>
      {children}
    </div>
  );
};

export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children}</>;
};
