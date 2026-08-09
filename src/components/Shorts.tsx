import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { picFor } from "../data/word_pics";
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
        // fade before the title band (y96-250) so nothing floats behind the rule pill
        const clear = Math.max(0, Math.min(1, (y - 250) / 150));
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: clear, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 100%" }}>
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
        const y = height * (0.165 + (i % 4) * 0.055);   // 0.05 put two clouds inside the title band
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


// ── COMMITTED WORLDS ────────────────────────────────────────────────────────
// The first five themes were tints with a motif floating in them. These are places: a
// layered ground, its own light, and something in the distance. Each one is built the way
// the chalkboard/blueprint/neon/papercut worlds are — the ones that read as designed.

const Meadow: React.FC = () => {                    // ai · ay
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFE9B8 0%, #FFD08A 30%, #F7A96B 60%, #E98C63 100%)" }}>
      <div style={{ position: "absolute", left: W * 0.58, top: H * 0.12, width: 210, height: 210, borderRadius: "50%", background: "#FFF3C4", opacity: 0.9, boxShadow: "0 0 120px 60px rgba(255,243,196,0.55)" }} />
      {[{ c: "#7BAE6A", t: 0.60, r: "50% 50% 0 0" }, { c: "#5E9457", t: 0.70, r: "44% 56% 0 0" }, { c: "#456F42", t: 0.82, r: "56% 44% 0 0" }].map((h, i) => (
        <div key={i} style={{ position: "absolute", left: -80 + i * 40, top: H * h.t, width: W + 200, height: H * 0.5, background: h.c, borderRadius: h.r }} />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: `${(i * 149) % 100}%`, top: `${58 + ((i * 37) % 38)}%`, width: 7, height: 7, borderRadius: "50%", background: "#FFF6C9", opacity: 0.5 + 0.5 * Math.abs(Math.sin((f + i * 17) / 26)), boxShadow: "0 0 12px #FFF0A8" }} />
      ))}
    </AbsoluteFill>
  );
};

const Depths: React.FC = () => {                    // oa · ow
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0A5E86 0%, #084C71 38%, #05334F 72%, #031F32 100%)" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: -100, top: H * (0.10 + i * 0.1), width: W + 200, height: 3, background: "rgba(180,235,255,0.22)", transform: `translateX(${Math.sin((f + i * 60) / 70) * 40}px)` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(48% 30% at 50% 6%, rgba(190,240,255,0.34), rgba(0,0,0,0) 70%)" }} />
      {Array.from({ length: 26 }).map((_, i) => {
        const y = (H + 120 - ((f * (1.1 + (i % 3) * 0.5) + i * 173) % (H + 240)));
        return <div key={i} style={{ position: "absolute", left: `${(i * 137) % 96}%`, top: y, width: 8 + (i % 4) * 5, height: 8 + (i % 4) * 5, borderRadius: "50%", border: "2px solid rgba(200,240,255,0.5)", opacity: 0.7 }} />;
      })}
    </AbsoluteFill>
  );
};

const BigTop: React.FC = () => {                    // oi · oy
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#FFF3E2", overflow: "hidden" }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: W / 2, top: -H * 0.16, width: 150, height: H * 1.5, background: i % 2 ? "#E14B4B" : "#FFD9C2", transformOrigin: "50% 0%", transform: `rotate(${(i - 7) * 13.5}deg)`, opacity: 0.9 }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(82% 40% at 50% 43%, rgba(255,250,242,0.97) 40%, rgba(255,250,242,0.75) 68%, rgba(255,250,242,0) 88%)" }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: `${i * 8.6}%`, top: H * 0.035 + Math.sin((f + i * 40) / 34) * 7, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `34px solid ${["#F7C948", "#3FA7D6", "#E14B4B", "#59B36A"][i % 4]}` }} />
      ))}
    </AbsoluteFill>
  );
};

const Storm: React.FC = () => {                     // ou · ow
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#3C4A63 0%, #55647F 34%, #7C8AA3 66%, #A6B2C4 100%)" }}>
      {[{ y: 0.30, w: 0.74, o: 0.5, s: 70 }, { y: 0.46, w: 0.9, o: 0.38, s: 95 }, { y: 0.66, w: 0.66, o: 0.3, s: 58 }].map((c, i) => (
        <div key={i} style={{ position: "absolute", left: `${-8 + i * 6}%`, top: H * c.y, width: `${c.w * 100}%`, height: H * 0.13, borderRadius: 999, background: `rgba(240,244,252,${c.o})`, filter: "blur(26px)", transform: `translateX(${Math.sin((f + i * 80) / c.s) * 36}px)` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(50% 32% at 50% 16%, rgba(255,246,200,0.30), rgba(0,0,0,0) 72%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(84% 62% at 50% 44%, rgba(0,0,0,0), rgba(18,24,40,0.34) 100%)" }} />
    </AbsoluteFill>
  );
};

const NightSky: React.FC = () => {                  // oo
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#131B3E 0%, #1E2A5C 40%, #2E3F7A 72%, #46589B 100%)" }}>
      <div style={{ position: "absolute", left: W * 0.66, top: H * 0.08, width: 190, height: 190, borderRadius: "50%", background: "#FFF6D8", boxShadow: "0 0 90px 34px rgba(255,246,216,0.42)" }} />
      <div style={{ position: "absolute", left: W * 0.70, top: H * 0.085, width: 168, height: 168, borderRadius: "50%", background: "#1E2A5C" }} />
      {Array.from({ length: 46 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: `${(i * 149) % 100}%`, top: `${(i * 83) % 78}%`, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: "50%", background: "#FFFDF0", opacity: 0.35 + 0.65 * Math.abs(Math.sin((f + i * 23) / 30)) }} />
      ))}
      {[0, 1].map((i) => (
        <div key={`h${i}`} style={{ position: "absolute", left: -60, top: H * (0.80 + i * 0.09), width: W + 120, height: H * 0.4, borderRadius: "50% 50% 0 0", background: i ? "#0E1430" : "#182046" }} />
      ))}
    </AbsoluteFill>
  );
};

export const THEMES: Record<string, Theme> = {
  notebook: { name: "notebook", bg: Meadow, plate: { bg: "#FFFFFF", border: "6px solid #22203A", radius: 40, shadow: "0 14px 0 rgba(34,32,58,0.20)" }, a: "#123A6B", b: "#7A1F12", warn: "#D7263D", tagBg: "#123A6B", ink: INK },
  sea:      { name: "sea",      bg: Depths, plate: { bg: "#FFF6E3", border: "6px solid #1B5E8C", radius: 46, shadow: "0 14px 0 rgba(27,94,140,0.28)" }, a: "#FFC24A", b: "#FF8A5B", warn: "#D7263D", tagBg: "#FFC24A", ink: "#FFFFFF" },
  party:    { name: "party",    bg: BigTop, plate: { bg: "#FFFBEA", border: "6px solid #6C4BD8", radius: 52, shadow: "0 14px 0 rgba(108,75,216,0.26)" }, a: "#6C4BD8", b: "#1B7F5A", warn: "#D7263D", tagBg: "#6C4BD8", ink: INK },
  sky:      { name: "sky",      bg: Storm,  plate: { bg: "#FFFFFF", border: "6px solid #3F3D9E", radius: 60, shadow: "0 14px 0 rgba(63,61,158,0.22)" }, a: "#FFD34E", b: "#FF9E7A", warn: "#D7263D", tagBg: "#FFD34E", ink: "#FFFFFF" },
  doors:    { name: "doors",    bg: NightSky, plate: { bg: "#FFFFFF", border: "6px solid #22203A", radius: 44, shadow: "0 14px 0 rgba(34,32,58,0.18)" }, a: "#FFD34E", b: "#4BE5C0", warn: "#D7263D", tagBg: "#FFD34E", ink: "#FFFFFF" },
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
      position: "absolute", left: width * 0.05, top: height * 0.170,
      width: width * 0.90, height: height * 0.52,
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
      background: t.tagBg,
      // ink follows the tag, not the other way round. On a DARK world the tag has to be
      // light to separate from the ground, and light-on-light is unreadable — so the
      // lettering flips instead of the tag being forced dark and vanishing.
      color: (() => {
        const n = parseInt(t.tagBg.slice(1), 16);
        const l = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
        return l > 150 ? "#141414" : "#FFFFFF";
      })(),
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
/**
 * A depth pass laid over any of the five theme backgrounds. The themes themselves are
 * fine as places; what they lacked was the light that makes a place look built — a warm
 * pool where the lesson sits and a vignette that closes the edges. One component so all
 * five gain it identically, rather than five separate rewrites that drift.
 */
export const Depth: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{
        position: "absolute", left: "-14%", top: "2%", width: "128%", height: "58%",
        background: "radial-gradient(closest-side, rgba(255,255,255,0.34), rgba(255,255,255,0) 74%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(80% 58% at 50% 38%, rgba(0,0,0,0), rgba(18,24,44,0.20) 100%)",
      }} />
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${((i * 149) % 100)}%`, top: `${((i * 83) % 100)}%`,
          width: 6 + (i % 4) * 3, height: 6 + (i % 4) * 3, borderRadius: "50%",
          background: "rgba(255,255,255,0.30)", pointerEvents: "none",
          transform: `translateY(${Math.sin((frame + i * 21) / 38) * 10}px)`,
        }} />
      ))}
    </>
  );
};

export const RuleBadge: React.FC<{ t: Theme; text: string }> = ({ t, text }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, top: height * 0.05, width: "76%", display: "flex", justifyContent: "center" }}>
      <div style={{
        padding: "18px 36px", borderRadius: 999, background: t.tagBg, color: "#FFFFFF",
        fontFamily: font.family, fontWeight: 800, fontSize: 46, letterSpacing: 0.6,
        transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

/** A picture for a word, from the channel's one shared map: real app artwork where it
 *  exists, an emoji otherwise. Returns null for a word with no picture, so a caller can
 *  simply drop it in without guarding. */
export const WordPic: React.FC<{ word: string; size?: number; at?: number; seed?: number }> = ({
  word, size = 190, at = 0, seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = picFor(word);
  const p = pop(frame, fps, at, 12);
  if (!src) return null;
  return (
    <div style={{
      width: size, height: size, flex: "0 0 auto",
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${p}) translateY(${Math.sin((frame + seed * 21) / 30) * 7}px) rotate(${Math.sin((frame + seed * 27) / 41) * 4}deg)`,
    }}>
      {src.startsWith("img/")
        ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : <div style={{ fontSize: size * 0.86, lineHeight: 1 }}>{src}</div>}
    </div>
  );
};
