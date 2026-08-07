import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── THE SHORTS KIT ───────────────────────────────────────────────────────────
//
// One layout engine, many skins. The five vowel-pair shorts share their structure — hook,
// rule, examples, contrast, remember, download — but each wears its own THEME: its own
// background world, its own plate under the centre content, its own accents.
//
// Sharing the engine is deliberate. Every layout bug we hit on the earlier reels (text
// cut at the frame edge, a label landing under the logo, two beats sharing the frame)
// was a positioning mistake made once per file. Here it can only be made once.
//
// The rules these shorts teach are POSITION rules — the first spelling in the middle of a
// word, the second at the end — which hold for every example used. `oo` is deliberately
// absent from that pattern: it has no position rule, so it gets its own treatment.

export const INK = "#22203A";

export type Theme = {
  name: string;
  /** the full-frame background */
  bg: React.FC;
  /** the plate the centre content sits on */
  plate: { bg: string; border?: string; radius: number; shadow: string };
  a: string;          // accent for the FIRST spelling (middle)
  b: string;          // accent for the SECOND spelling (end)
  warn: string;
  tagBg: string;
  ink: string;
};

export const pop = (frame: number, fps: number, at: number, damping = 12) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 130 } });

// ── backgrounds, one per short ───────────────────────────────────────────────

const Lined: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#FFF6DF" }}>
      {Array.from({ length: 26 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: 60 + i * 72, width, height: 3, background: "#E7D3A6" }} />
      ))}
      <div style={{ position: "absolute", left: width * 0.13, top: 0, width: 5, height, background: "#F3B9C4" }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: ((i * 151) % 90 + 5) / 100 * width,
          top: ((i * 97) % 90 + 5) / 100 * height + Math.sin((frame + i * 40) / 52) * 20,
          width: 54, height: 54, borderRadius: 14, background: ["#FFD9A0", "#BFE3D0", "#FFC3CE"][i % 3], opacity: 0.7,
          transform: `rotate(${i * 37}deg)`,
        }} />
      ))}
    </AbsoluteFill>
  );
};

const Sea: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#CFEBFF 0%, #EAF7FF 44%, #FFF4DC 100%)" }}>
      {[0.66, 0.74, 0.82].map((fy, i) => (
        <div key={fy} style={{
          position: "absolute", left: -80, top: height * fy + Math.sin((frame + i * 50) / 40) * 12,
          width: width + 160, height: 90, borderRadius: "50%",
          background: ["#8FD3F4", "#6FC3EC", "#4FB0E0"][i], opacity: 0.55,
        }} />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: ((i * 173) % 80 + 8) / 100 * width,
          top: height * (0.06 + i * 0.05) + Math.sin((frame + i * 60) / 64) * 14,
          width: 150, height: 52, borderRadius: 999, background: "#FFFFFF", opacity: 0.85,
        }} />
      ))}
    </AbsoluteFill>
  );
};

const Party: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(150deg, #BFF0DC 0%, #FFFFFF 50%, #FFD3EC 100%)" }}>
      {Array.from({ length: 11 }).map((_, i) => {
        const c = ["#FFD3E2", "#D9D2FA", "#C7EFDF", "#FFE9B8"][i % 4];
        // the balloons FLY: each rises at its own speed and loops back in from below,
        // swaying as it goes. They used to bob on the spot, which read as static.
        // ~60–105 px/s: a balloon crosses the frame inside the reel, so it reads as
        // flying rather than drifting. At 0.9 it took over a minute to cross.
        const speed = 2.0 + (i % 4) * 0.5;
        const span = height + 420;
        const y = height + 140 - ((frame * speed + i * 197) % span);
        const sway = Math.sin((frame + i * 55) / 58) * 30;
        const x = ((i * 139) % 86 + 6) / 100 * width + sway;
        const tilt = Math.sin((frame + i * 55) / 58) * 7;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 100%" }}>
            <div style={{ width: 78, height: 96, borderRadius: "50% 50% 46% 46%", background: c, opacity: 0.9 }} />
            <div style={{ width: 0, height: 0, marginLeft: 33, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `12px solid ${c}`, opacity: 0.9 }} />
            <div style={{ width: 3, height: 74, marginLeft: 38, background: c, opacity: 0.75 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#D8C7FF 0%, #FFFFFF 54%, #BFDCFF 100%)" }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const w = 190 + (i % 3) * 90;
        const x = (((i * 167) % 100) / 100) * (width + 300) - 150 + Math.sin((frame + i * 70) / 90) * 30;
        const y = height * (0.05 + (i % 4) * 0.055);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: w * 0.30 }}>
            <div style={{ position: "absolute", left: 0, bottom: 0, width: w, height: w * 0.2, borderRadius: 999, background: "#FFFFFF" }} />
            <div style={{ position: "absolute", left: w * 0.2, bottom: w * 0.08, width: w * 0.42, height: w * 0.28, borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const TwoDoors: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: width / 2, height, background: "linear-gradient(#FFE9CC, #FFF7EA)" }} />
      <div style={{ position: "absolute", left: width / 2, top: 0, width: width / 2, height, background: "linear-gradient(#D9EEFF, #EFF8FF)" }} />
      <div style={{ position: "absolute", left: width / 2 - 3, top: 0, width: 6, height, background: "rgba(34,32,58,0.10)" }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: ((i * 157) % 92 + 4) / 100 * width,
          top: ((i * 71) % 88 + 6) / 100 * height + Math.sin((frame + i * 36) / 50) * 22,
          width: 40, height: 40, borderRadius: "50%",
          background: i % 2 ? "#FFC98A" : "#9FCDF5", opacity: 0.55,
        }} />
      ))}
    </AbsoluteFill>
  );
};

export const THEMES: Record<string, Theme> = {
  notebook: { name: "notebook", bg: Lined, plate: { bg: "#FFFFFF", border: "6px solid #22203A", radius: 40, shadow: "0 14px 0 rgba(34,32,58,0.20)" }, a: "#E4572E", b: "#17838C", warn: "#D7263D", tagBg: "#22203A", ink: INK },
  sea:      { name: "sea",      bg: Sea,   plate: { bg: "#FFF6E3", border: "6px solid #1B5E8C", radius: 46, shadow: "0 14px 0 rgba(27,94,140,0.28)" }, a: "#1B5E8C", b: "#F0803C", warn: "#D7263D", tagBg: "#1B5E8C", ink: INK },
  party:    { name: "party",    bg: Party, plate: { bg: "#FFFBEA", border: "6px solid #6C4BD8", radius: 52, shadow: "0 14px 0 rgba(108,75,216,0.26)" }, a: "#6C4BD8", b: "#E23E8C", warn: "#D7263D", tagBg: "#6C4BD8", ink: INK },
  sky:      { name: "sky",      bg: Sky,   plate: { bg: "#FFFFFF", border: "6px solid #3F3D9E", radius: 60, shadow: "0 14px 0 rgba(63,61,158,0.22)" }, a: "#3F3D9E", b: "#F2A007", warn: "#D7263D", tagBg: "#3F3D9E", ink: INK },
  doors:    { name: "doors",    bg: TwoDoors, plate: { bg: "#FFFFFF", border: "6px solid #22203A", radius: 44, shadow: "0 14px 0 rgba(34,32,58,0.18)" }, a: "#E07B24", b: "#2E86C8", warn: "#D7263D", tagBg: "#22203A", ink: INK },
};

// ── pieces ───────────────────────────────────────────────────────────────────

export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children}</>;
};

/** the one column everything lives in — nothing is positioned by hand */
export const Stack: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 44 }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{
      position: "absolute", left: width * 0.05, top: height * 0.155,
      width: width * 0.90, height: height * 0.66,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap,
    }}>
      {children}
    </div>
  );
};

/** the plate under the centre content — its look is the theme's */
export const Plate: React.FC<{ t: Theme; at?: number; children: React.ReactNode; pad?: number }> = ({
  t, at = 0, children, pad = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div style={{
      padding: `${pad}px ${pad * 1.35}px`, borderRadius: t.plate.radius,
      background: t.plate.bg, border: t.plate.border, boxShadow: t.plate.shadow,
      display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12,
      maxWidth: "100%", flexWrap: "wrap", rowGap: 14,
      transform: `scale(${0.95 + 0.05 * p})`,
    }}>
      {children}
    </div>
  );
};

/** one letter. A light tile takes dark letters, a dark tile takes light ones. */
export const Tile: React.FC<{ ch: string; size?: number; color?: string; at?: number; seed?: number }> = ({
  ch, size = 150, color = "#FFFFFF", at = 0, seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  const n = parseInt(color.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return (
    <div style={{
      minWidth: size * 0.72, height: size, padding: `0 ${size * 0.13}px`,
      borderRadius: size * 0.2, background: color,
      border: `${Math.max(4, size * 0.04)}px solid ${INK}`,
      boxShadow: `0 ${size * 0.055}px 0 ${INK}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.62,
      color: lum > 168 ? INK : "#FFFFFF",
      transform: `scale(${p}) translateY(${Math.sin((frame + seed * 26) / 40) * 4}px)`,
      whiteSpace: "nowrap",
    }}>
      {ch}
    </div>
  );
};

/** a word, with the target spelling highlighted wherever it appears */
export const Word: React.FC<{
  text: string; target: string; color: string; size?: number; at?: number;
}> = ({ text, target, color, size = 140, at = 0 }) => {
  const i = text.indexOf(target);
  const parts: { s: string; hit: boolean }[] = i < 0
    ? text.split("").map((c) => ({ s: c, hit: false }))
    : [
        ...text.slice(0, i).split("").map((c) => ({ s: c, hit: false })),
        { s: target, hit: true },
        ...text.slice(i + target.length).split("").map((c) => ({ s: c, hit: false })),
      ];
  return (
    <>
      {parts.map((p, k) => (
        <Tile key={k} ch={p.s} size={p.hit ? size * 1.06 : size} color={p.hit ? color : "#FFFFFF"} at={at + k * 2} seed={k} />
      ))}
    </>
  );
};

export const Tag: React.FC<{ t: Theme; text: string; at?: number; size?: number }> = ({ t, text, at = 0, size = 44 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div style={{
      padding: `${size * 0.24}px ${size * 0.7}px`, borderRadius: 999,
      background: t.tagBg, color: "#FFFFFF",
      fontFamily: font.family, fontWeight: 800, fontSize: size, letterSpacing: 2,
      boxShadow: "0 7px 0 rgba(34,32,58,0.28)",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 33) * 4}px)`, whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

export const Pill: React.FC<{ text: string; color: string; size?: number; at?: number; light?: boolean }> = ({
  text, color, size = 58, at = 0, light = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div style={{
      padding: `${size * 0.26}px ${size * 0.6}px`, borderRadius: 999,
      background: light ? "#FFFFFF" : color, color: light ? color : "#FFFFFF",
      border: light ? `5px solid ${color}` : "none",
      fontFamily: font.family, fontWeight: 800, fontSize: size,
      boxShadow: `0 ${size * 0.15}px 0 rgba(34,32,58,0.22)`,
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 31) * 5}px)`,
      whiteSpace: "nowrap", maxWidth: "96%", textAlign: "center",
    }}>{text}</div>
  );
};

export const Title: React.FC<{ text: string; size?: number; at?: number; color?: string }> = ({
  text, size = 84, at = 0, color = INK,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, color,
      textAlign: "center", lineHeight: 1.12, whiteSpace: "pre-line",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 28) * 5}px)`,
    }}>{text}</div>
  );
};

export const Icon: React.FC<{ glyph: string; at?: number; size?: number }> = ({ glyph, at = 0, size = 140 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 11);
  return (
    <div style={{
      fontSize: size, lineHeight: 1,
      transform: `scale(${p}) translateY(${Math.sin(frame / 25) * 8}px) rotate(${Math.sin(frame / 39) * 5}deg)`,
    }}>{glyph}</div>
  );
};

export const Mark: React.FC<{ kind: "yes" | "no"; at: number; size?: number }> = ({ kind, at, size = 110 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 9);
  const col = kind === "yes" ? "#2FA84F" : "#D7263D";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: col,
      border: `${Math.max(4, size * 0.055)}px solid #FFFFFF`, boxSizing: "border-box",
      boxShadow: `0 ${size * 0.08}px 0 rgba(34,32,58,0.24)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.55, color: "#FFFFFF",
      transform: `scale(${p}) translateY(${Math.sin(frame / 22) * 6}px)`,
    }}>{kind === "yes" ? "✓" : "✕"}</div>
  );
};

/** the rule strip that names the short, centred clear of the corner logo */
export const RuleBadge: React.FC<{ t: Theme; text: string }> = ({ t, text }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, top: height * 0.05, width: "76%", display: "flex", justifyContent: "center" }}>
      <div style={{
        padding: "13px 26px", borderRadius: 999, background: t.tagBg, color: "#FFFFFF",
        fontFamily: font.family, fontWeight: 800, fontSize: 33, letterSpacing: 0.8,
        transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};
