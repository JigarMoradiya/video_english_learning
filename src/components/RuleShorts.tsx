import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── RULE SHORTS · the kit for the four remaining Level 5 rules ───────────────
//
// Sisters to rule_double (flat sticker on white) and rule_ck (glossy blocks on pastel
// sky), and like them SILENT — no narration, so the text is not a caption repeating a
// voice, it IS the teaching.
//
// Four worlds, one per rule, none of them reusing a world this channel already ships:
//
//   chalk      ng   a school board, chalk on dark green
//   blueprint  nk   white line-work on navy, drafting grid
//   neon       x    glowing tubes on near-black
//   papercut   w    layered craft paper, warm, hard-edged shadows
//
// THREE RULES THIS FILE ENFORCES, because they are what the last shorts got wrong:
//
//   1. ONE COLUMN. Every beat's content goes in `Stack`, which is a centred flex column
//      inside a declared band. Nothing is positioned by hand, so nothing can overlap.
//   2. THE BAND IS THE BACKGROUND. Each beat paints a full-width band behind its own
//      content, so content is never sitting on bare world.
//   3. WIDTH IS ASSERTED, not eyeballed — `fit()` throws if a row of tiles cannot fit
//      the frame, at build time rather than in a render nobody looks at closely.

export const FPS = 30;
export const S = (sec: number) => Math.round(sec * FPS);
export const W = 1080;
export const H = 1920;

export type Theme = {
  key: string;
  Bg: React.FC;
  ink: string;      // text on the world
  paper: string;    // a tile's face
  tileInk: string;  // text on a tile
  a: string;        // accent 1 — the thing being taught
  b: string;        // accent 2 — its partner
  good: string;
  bad: string;
  pill: string;     // the persistent rule pill
  pillInk: string;
  band: string[];   // per-beat band colours, cycled
};

const grain = (n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => ({
    x: ((i * 137 + seed * 31) % 100) / 100,
    y: ((i * 79 + seed * 17) % 100) / 100,
    s: 2 + ((i * 53) % 5),
  }));

// ── the four worlds ─────────────────────────────────────────────────────────

const ChalkBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, background: "#22403A" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 45% at 50% 30%, rgba(255,255,255,0.09), rgba(255,255,255,0) 70%)" }} />
      {grain(70, 3).map((g, i) => (
        <div key={i} style={{
          position: "absolute", left: `${g.x * 100}%`, top: `${g.y * 100}%`,
          width: g.s, height: g.s, borderRadius: "50%", background: "rgba(255,255,255,0.16)",
          transform: `translateY(${Math.sin((frame + i * 9) / 40) * 3}px)`,
        }} />
      ))}
    </div>
  );
};

const BlueprintBg: React.FC = () => {
  const frame = useCurrentFrame();
  const step = 78;
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #06213E 0%, #0B2E52 52%, #103A65 100%)" }}>
      {Array.from({ length: Math.ceil(H / step) }).map((_, i) => (
        <div key={`h${i}`} style={{ position: "absolute", left: 0, top: i * step, width: "100%", height: 1, background: "rgba(255,255,255,0.10)" }} />
      ))}
      {Array.from({ length: Math.ceil(W / step) }).map((_, i) => (
        <div key={`v${i}`} style={{ position: "absolute", top: 0, left: i * step, width: 1, height: "100%", background: "rgba(255,255,255,0.10)" }} />
      ))}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(55% 40% at 50% 34%, rgba(120,200,255,0.14), rgba(0,0,0,0) 72%)",
        opacity: 0.7 + 0.3 * Math.sin(frame / 46),
      }} />
    </div>
  );
};

const NeonBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0A0712" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 42% at 50% 32%, rgba(255,60,160,0.20), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(46% 34% at 50% 72%, rgba(60,220,255,0.16), rgba(0,0,0,0) 72%)" }} />
      {grain(34, 7).map((g, i) => (
        <div key={i} style={{
          position: "absolute", left: `${g.x * 100}%`, top: `${g.y * 100}%`,
          width: g.s + 1, height: g.s + 1, borderRadius: "50%",
          background: i % 2 ? "rgba(255,90,180,0.55)" : "rgba(90,230,255,0.5)",
          boxShadow: `0 0 ${10 + (i % 4) * 4}px ${i % 2 ? "rgba(255,90,180,0.8)" : "rgba(90,230,255,0.8)"}`,
          opacity: 0.45 + 0.55 * Math.abs(Math.sin((frame + i * 13) / 22)),
        }} />
      ))}
    </div>
  );
};

const PapercutBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF1E1" }}>
      {[
        { c: "#F7D9B8", top: 0.00, h: 0.30, r: "0 0 46% 40%" },
        { c: "#EFC9A6", top: 0.62, h: 0.42, r: "44% 38% 0 0" },
      ].map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: -40, width: W + 80, top: H * p.top, height: H * p.h,
          background: p.c, borderRadius: p.r, boxShadow: "0 10px 0 rgba(30,24,16,0.07)",
        }} />
      ))}
      {grain(26, 11).map((g, i) => (
        <div key={i} style={{
          position: "absolute", left: `${g.x * 100}%`, top: `${g.y * 100}%`,
          width: g.s * 3, height: g.s * 3, borderRadius: 4,
          background: i % 3 === 0 ? "#E8B48A" : i % 3 === 1 ? "#F3DCC2" : "#DFA97C",
          transform: `rotate(${(i * 37) % 90}deg) translateY(${Math.sin((frame + i * 11) / 36) * 4}px)`,
          opacity: 0.55,
        }} />
      ))}
    </div>
  );
};

export const THEMES: Record<string, Theme> = {
  chalk: {
    key: "chalk", Bg: ChalkBg, ink: "#F6F3E7", paper: "#F6F3E7", tileInk: "#22403A",
    a: "#FFD34E", b: "#7BE0C0", good: "#7BE0C0", bad: "#FF7A6B",
    pill: "#F6F3E7", pillInk: "#22403A",
    band: ["rgba(255,211,78,0.22)", "rgba(123,224,192,0.22)", "rgba(255,255,255,0.14)"],
  },
  blueprint: {
    key: "blueprint", Bg: BlueprintBg, ink: "#EAF6FF", paper: "#EAF6FF", tileInk: "#06213E",
    a: "#63D3FF", b: "#FFC861", good: "#5CE3A7", bad: "#FF7E7E",
    pill: "#EAF6FF", pillInk: "#06213E",
    band: ["rgba(99,211,255,0.22)", "rgba(255,200,97,0.20)", "rgba(255,255,255,0.13)"],
  },
  neon: {
    key: "neon", Bg: NeonBg, ink: "#FFFFFF", paper: "#160F22", tileInk: "#FFFFFF",
    a: "#FF3FA4", b: "#3FE0FF", good: "#4BE58F", bad: "#FF5A5A",
    pill: "#FF3FA4", pillInk: "#12081A",
    band: ["rgba(255,63,164,0.24)", "rgba(63,224,255,0.22)", "rgba(255,255,255,0.11)"],
  },
  papercut: {
    key: "papercut", Bg: PapercutBg, ink: "#3A2A18", paper: "#FFFFFF", tileInk: "#3A2A18",
    a: "#E2703A", b: "#3E8E7E", good: "#3E8E7E", bad: "#D14B3F",
    pill: "#3A2A18", pillInk: "#FBF1E1",
    band: ["rgba(226,112,58,0.34)", "rgba(62,142,126,0.30)", "rgba(58,42,24,0.15)"],
  },
};

// ── primitives ──────────────────────────────────────────────────────────────

export const pop = (frame: number, fps: number, at: number, damping = 13) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 150 } });

export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children}</>;
};

/** Throws rather than shipping a row that runs off the frame. */
export const fit = (label: string, width: number, margin = 60) => {
  if (width > W - margin * 2) {
    throw new Error(`rule short: ${label} is ${Math.round(width)}px wide, frame allows ${W - margin * 2}`);
  }
  return width;
};

/** The band IS the background for a beat — content never sits on bare world. */
export const Band: React.FC<{ color: string; top: number; height: number; at?: number; skew?: number }> = ({
  color, top, height, at = 0, skew = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 16);
  return (
    <div style={{
      position: "absolute", left: -30, top, width: W + 60, height,
      background: color, transform: `skewY(${skew}deg) scaleY(${0.9 + 0.1 * p})`,
    }} />
  );
};

/** One centred column. Every beat uses this, so two things cannot share a spot. */
export const Stack: React.FC<{ top: number; height: number; gap?: number; children: React.ReactNode }> = ({
  top, height, gap = 26, children,
}) => (
  <div style={{
    position: "absolute", left: 60, top, width: W - 120, height,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap,
  }}>{children}</div>
);

export const Row: React.FC<{ gap?: number; children: React.ReactNode }> = ({ gap = 14, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap, flexWrap: "nowrap" }}>{children}</div>
);

export const Tile: React.FC<{
  t: Theme; ch: string; size?: number; at?: number; tone?: "plain" | "a" | "b" | "good" | "bad" | "dim";
  seed?: number; glow?: boolean;
}> = ({ t, ch, size = 150, at = 0, tone = "plain", seed = 0, glow = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  const bg = tone === "plain" ? t.paper
    : tone === "a" ? t.a : tone === "b" ? t.b
    : tone === "good" ? t.good : tone === "bad" ? t.bad : "rgba(255,255,255,0.22)";
  const fg = tone === "plain" ? t.tileInk : t.key === "neon" ? "#12081A" : "#FFFFFF";
  return (
    <div style={{
      minWidth: size * 0.78, height: size, padding: `0 ${size * 0.13}px`,
      borderRadius: size * 0.22, background: bg,
      border: t.key === "neon" ? `5px solid ${tone === "plain" ? t.a : "rgba(255,255,255,0.5)"}` : "none",
      boxShadow: glow
        ? `0 0 ${size * 0.3}px ${tone === "a" ? t.a : t.b}`
        : t.key === "papercut" ? `0 ${size * 0.06}px 0 rgba(58,42,24,0.18)` : "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.62, color: fg,
      transform: `scale(${p}) translateY(${Math.sin((frame + seed * 20) / 40) * 3}px)`,
      whiteSpace: "nowrap", flex: "0 0 auto",
    }}>{ch}</div>
  );
};

/** a word, with its rule-bearing ending picked out */
/** A word with the rule-bearing part picked out: `end` for a suffix (‑ng, ‑nk, x),
 *  `hi` for a letter in the middle (the a that w changes). */
export const Word: React.FC<{
  t: Theme; text: string; end?: string; hi?: string; size?: number; at?: number; dim?: boolean;
}> = ({ t, text, end, hi, size = 140, at = 0, dim = false }) => {
  const cut = end && text.endsWith(end) ? text.length - end.length : text.length;
  const head = text.slice(0, cut).split("");
  const gap = Math.round(size * 0.09);
  const hiAt = hi ? text.indexOf(hi) : -1;
  fit(`word ${text}`, head.length * size * 0.95 + (end ? size * 1.5 : 0) + gap * text.length);
  return (
    <Row gap={gap}>
      {head.map((c, i) => (
        <Tile key={i} t={t} ch={c} size={size} at={at + i * 2} seed={i}
          tone={i === hiAt ? "a" : dim ? "dim" : "plain"} glow={i === hiAt} />
      ))}
      {end && text.endsWith(end) && (
        <Tile t={t} ch={end} size={size} at={at + head.length * 2} seed={9} tone="a" glow />
      )}
    </Row>
  );
};

/**
 * A picture for a word. A value starting with `img/` is real app artwork; anything else
 * is an emoji. Both maps are the ones the Part 2 and Part 3 lessons already use, so a
 * child meets the same picture for `ring` or `fox` in the short and in the lesson.
 */
export const Pic: React.FC<{ src: string; size?: number; at?: number; seed?: number }> = ({
  src, size = 230, at = 0, seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  const drift = `translateY(${Math.sin((frame + seed * 22) / 34) * 7}px) rotate(${Math.sin((frame + seed * 28) / 44) * 3}deg)`;
  return (
    <div style={{
      width: size, height: size, flex: "0 0 auto",
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${p}) ${drift}`,
    }}>
      {src.startsWith("img/")
        ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : <div style={{ fontSize: size * 0.84, lineHeight: 1 }}>{src}</div>}
    </div>
  );
};

/** `icon` puts a single emoji in front of the words. A heading that names what you are
 *  about to do — LISTEN, REMEMBER, READ — reads faster with a picture of the verb. */
export const Line: React.FC<{
  t: Theme; text: string; size?: number; at?: number; color?: string; icon?: string;
}> = ({ t, text, size = 74, at = 0, color, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  if (icon) {
    return (
      // stacked, not side by side: an icon beside the words pushes the text off centre,
      // which measured as 12-55px of drift across the set
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: size * 0.16, transform: `scale(${p})`,
      }}>
        <div style={{
          fontSize: size * 2.2, lineHeight: 1,
          transform: `translateY(${Math.sin(frame / 26) * 5}px) rotate(${Math.sin(frame / 34) * 5}deg)`,
        }}>{icon}</div>
        <div style={{
          fontFamily: font.family, fontWeight: 800, fontSize: size, lineHeight: 1.08,
          color: color ?? t.ink, textAlign: "center", whiteSpace: "pre-line",
          textShadow: t.key === "neon" ? `0 0 26px ${color ?? t.a}` : "none",
        }}>{text}</div>
      </div>
    );
  }
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, lineHeight: 1.08,
      color: color ?? t.ink, textAlign: "center", whiteSpace: "pre-line", maxWidth: W - 140,
      textShadow: t.key === "neon" ? `0 0 26px ${color ?? t.a}` : "none",
      transform: `scale(${p})`,
    }}>{text}</div>
  );
};

export const Stamp: React.FC<{ t: Theme; kind: "yes" | "no"; at: number; size?: number }> = ({
  t, kind, at, size = 132,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 9);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flex: "0 0 auto",
      background: kind === "yes" ? t.good : t.bad,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.56, color: "#FFFFFF",
      transform: `scale(${p}) rotate(${Math.sin(frame / 24) * 5}deg)`,
    }}>{kind === "yes" ? "✓" : "✕"}</div>
  );
};

/** The rule, on screen from frame 1, sized to CLEAR the corner logo. */
export const RulePill: React.FC<{ t: Theme; text: string }> = ({ t, text }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: H * 0.055, width: "76%", display: "flex", justifyContent: "center" }}>
      <div style={{
        padding: "18px 36px", borderRadius: 999, background: t.pill, color: t.pillInk,
        fontFamily: font.family, fontWeight: 800, fontSize: 46, letterSpacing: 0.6,
        transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

export const Dots: React.FC<{ t: Theme; total: number; on: number; y: number }> = ({ t, total, on, y }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: "100%", display: "flex", justifyContent: "center", gap: 14 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: i === on ? 30 : 14, height: 14, borderRadius: 999,
        background: i === on ? t.a : "rgba(255,255,255,0.35)",
      }} />
    ))}
  </div>
);
