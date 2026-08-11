import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── WORD FAMILY LANE ────────────────────────────────────────────────────────
//
// The world for L6. It replaces a workshop bench that showed the SAME frame for nine
// minutes and printed each caption on screen as its own "visual". Both were failures of
// the same rule: every narration line gets its own visual change, and a chip repeating
// the caption is not a visual.
//
// Built to the shape that works for this channel: many settings, a named rig, TWO
// characters, and a device that IS the metaphor.
//
//   · THIRTEEN SETTINGS — one per family, so the screen changes shape when the family
//     changes, not once in nine minutes.
//   · RIG_LANE — sage timber, cream walls, sunny yellow doors. Nothing in the series is
//     sage-and-cream.
//   · MO sits on the doorstep and NEVER moves. He is the ending.
//     ZIP arrives at every door carrying a different letter. He is the front.
//     A child reads the rule off the characters before the teacher explains it.
//   · THE DOORPLATE — the ending is screwed to the door and cannot leave; the front letter
//     slots into a bracket in front of it.
//   · THE WASHING LINE — each family's words peg up as they are read, so the list stays on
//     screen instead of a counter of blank boxes.

export const LANE = {
  sky: ["#BFE3F2", "#DFF1E4", "#F7F0D8"],
  sage: "#6E8F6B",
  sageDark: "#4E6B4C",
  cream: "#FFF8E9",
  door: "#F4C33F",
  doorDark: "#D19E1C",
  ink: "#2A3A2C",
  path: "#E3D3AE",
  pathDark: "#CBB98F",
  rose: "#E8756A",
  sky2: "#8FC7DE",
  night: "#2B3B57",
};

/** the thirteen places, one per family — the screen changes shape when the family does */
export const SETTINGS: Record<string, { name: string; hue: string; accent: string }> = {
  at:  { name: "garden gate", hue: "#CFE8C6", accent: "#7FBF6A" },
  an:  { name: "duck pond",   hue: "#C3E4EE", accent: "#5FB4CF" },
  ap:  { name: "bakery",      hue: "#F6DCC0", accent: "#E0A063" },
  en:  { name: "hen coop",    hue: "#F3E3B8", accent: "#D9B441" },
  ig:  { name: "hilltop",     hue: "#D6E9BE", accent: "#8CC05C" },
  it:  { name: "toy shop",    hue: "#EBD5EF", accent: "#B274C4" },
  in:  { name: "workshop",    hue: "#D9DFE9", accent: "#7C90AE" },
  og:  { name: "kennel yard", hue: "#E3D6C2", accent: "#B08C63" },
  ot:  { name: "kitchen",     hue: "#F7D6CE", accent: "#E0796A" },
  op:  { name: "hill slope",  hue: "#CDE6DE", accent: "#63B39B" },
  un:  { name: "sunny field", hue: "#FBE7B4", accent: "#EFB93C" },
  ug:  { name: "bug garden",  hue: "#DCEBC4", accent: "#8FBF52" },
  all: { name: "lantern lane", hue: "#C9CFE6", accent: "#7C86BE" },
};

export const bands = (width: number, height: number) => {
  const wide = width > height;
  return {
    width, height, wide,
    bannerTop: Math.round(height * 0.024),
    horizon: Math.round(height * 0.585),
    // the lesson lives in front of the house; the washing line hangs above it
    lineY: Math.round(height * 0.125),   // clear of the roof: the house starts at 0.30H
    contentTop: Math.round(height * 0.300),
    contentH: Math.round(height * 0.375),
    contentL: Math.round(width * 0.035),
    contentR: Math.round(width * (wide ? 0.670 : 0.965)),   // clears the house, which starts at 0.700W
    contentRFull: Math.round(width * 0.965),                 // when there is no house yet
    moX: Math.round(width * (wide ? 0.085 : 0.10)),
    zipX: Math.round(width * (wide ? 0.845 : 0.78)),
    charY: Math.round(height * 0.615),
    charH: Math.round(height * 0.185),
  };
};
export type B = ReturnType<typeof bands>;

export const pop = (frame: number, fps: number, at: number, damping = 13) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 150 } });

export const Fixed: React.FC<{ b: B; children: React.ReactNode }> = ({ b, children }) => (
  <div style={{ position: "fixed", left: 0, top: 0, width: b.width, height: b.height }}>{children}</div>
);

// ── the place ───────────────────────────────────────────────────────────────

/** The house for one family. Its colour, its props and its light all change with the
 *  family, so the frame is visibly a different place every time. */
export const Lane: React.FC<{ b: B; rime: string; dusk?: boolean; noHouse?: boolean }> = ({ b, rime, dusk = false, noHouse = false }) => {
  const frame = useCurrentFrame();
  const set = SETTINGS[rime] ?? SETTINGS.at;
  const sky = dusk
    ? `linear-gradient(${LANE.night} 0%, #4A5B7E 46%, #C98F73 100%)`
    : `linear-gradient(${LANE.sky[0]} 0%, ${set.hue} 52%, ${LANE.sky[2]} 100%)`;
  const H = b.height, W = b.width;
  return (
    <AbsoluteFill style={{ background: sky }}>
      {/* sun or lanterns */}
      {dusk
        ? [0.18, 0.5, 0.82].map((fx, i) => (
            <div key={i} style={{
              position: "absolute", left: W * fx, top: H * 0.13, width: 34, height: 44, borderRadius: 8,
              background: "#FFD98A", border: `4px solid ${LANE.ink}`, boxSizing: "border-box",
              boxShadow: "0 0 46px 18px rgba(255,217,138,0.5)",
              transform: `rotate(${Math.sin((frame + i * 40) / 40) * 5}deg)`,
            }} />
          ))
        : <div style={{
            position: "absolute", left: W * 0.80, top: H * 0.07, width: H * 0.10, height: H * 0.10,
            borderRadius: "50%", background: "#FFE07A", boxShadow: "0 0 70px 26px rgba(255,224,122,0.45)",
          }} />}

      {/* hills, tinted by the setting */}
      {[[0.00, 0.10, 0.32], [0.46, 0.13, 0.22], [0.74, 0.09, 0.4]].map(([fx, fh, op], i) => (
        <div key={i} style={{
          position: "absolute", left: W * (fx as number) - 90, top: b.horizon - H * (fh as number),
          width: W * 0.62, height: H * ((fh as number) + 0.10), borderRadius: "50% 50% 0 0",
          background: set.accent, opacity: op as number,
        }} />
      ))}

      {/* the house — only once a family is being taught */}
      {!noHouse && <House b={b} rime={rime} />}

      {/* ground and path */}
      <div style={{ position: "absolute", left: 0, top: b.horizon, width: W, height: H - b.horizon,
        background: `linear-gradient(${set.accent}, ${LANE.sageDark})`, opacity: 0.9 }} />
      <div style={{
        position: "absolute", left: 0, top: b.horizon + H * 0.075, width: W, height: H * 0.055,
        background: LANE.path, borderTop: `5px solid ${LANE.pathDark}`, borderBottom: `5px solid ${LANE.pathDark}`,
      }} />
      {Array.from({ length: 26 }).map((_, i) => (
        <div key={`t${i}`} style={{
          position: "absolute", left: ((i * 149) % 100) / 100 * W,
          top: b.horizon + 10 + ((i * 53) % 60) / 100 * (H - b.horizon - 40),
          width: 8, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.16)",
          transform: `rotate(${Math.sin((frame + i * 27) / 46) * 9}deg)`,
        }} />
      ))}
    </AbsoluteFill>
  );
};

/** the family's house, with the ending SCREWED to the door */
const House: React.FC<{ b: B; rime: string }> = ({ b, rime }) => {
  const set = SETTINGS[rime] ?? SETTINGS.at;
  const w = Math.round(b.width * (b.wide ? 0.20 : 0.30));
  const h = Math.round(w * 0.95);
  const left = Math.round(b.width * (b.wide ? 0.700 : 0.55));
  const top = b.horizon - h;
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h }}>
      <div style={{ position: "absolute", left: -w * 0.10, top: 0, width: 0, height: 0,
        borderLeft: `${w * 0.60}px solid transparent`, borderRight: `${w * 0.60}px solid transparent`,
        borderBottom: `${h * 0.34}px solid ${LANE.rose}` }} />
      <div style={{ position: "absolute", left: 0, top: h * 0.32, width: w, height: h * 0.68,
        background: LANE.cream, border: `7px solid ${LANE.ink}`, boxSizing: "border-box" }} />
      {/* window */}
      <div style={{ position: "absolute", left: w * 0.10, top: h * 0.44, width: w * 0.28, height: w * 0.24,
        background: set.hue, border: `6px solid ${LANE.sage}`, boxSizing: "border-box", borderRadius: 6 }} />
      {/* the door, and the doorplate that never leaves it */}
      <div style={{ position: "absolute", left: w * 0.52, top: h * 0.44, width: w * 0.34, height: h * 0.56,
        background: LANE.door, border: `7px solid ${LANE.ink}`, boxSizing: "border-box", borderRadius: "10px 10px 0 0" }}>
        <div style={{
          position: "absolute", left: "50%", top: "16%", marginLeft: -w * 0.13, width: w * 0.26, height: w * 0.13,
          background: LANE.cream, border: `4px solid ${LANE.ink}`, boxSizing: "border-box", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.family, fontWeight: 800, fontSize: w * 0.085, color: LANE.ink,
        }}>{rime}</div>
        <div style={{ position: "absolute", right: w * 0.05, top: "56%", width: w * 0.05, height: w * 0.05,
          borderRadius: "50%", background: LANE.doorDark, border: `3px solid ${LANE.ink}`, boxSizing: "border-box" }} />
      </div>
    </div>
  );
};

// ── the two characters, who ARE the lesson ──────────────────────────────────

/** MO sits on the doorstep and never moves. He is the ENDING. */
export const Mo: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const s = b.charH;
  const breathe = 1 + Math.sin(frame / 46) * 0.012;   // breathing only — he never travels
  return (
    <div style={{ position: "absolute", left: b.moX, top: b.charY, width: s * 0.8, height: s,
      transform: `scale(${breathe})`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: s * 0.06, top: s * 0.30, width: s * 0.68, height: s * 0.66,
        borderRadius: "46% 46% 40% 40%", background: "#F0C56A", border: `6px solid ${LANE.ink}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: s * 0.20, top: s * 0.44, width: s * 0.40, height: s * 0.34,
        borderRadius: "50%", background: "#FFF0C8" }} />
      {[0.26, 0.48].map((fx, i) => (
        <div key={i} style={{ position: "absolute", left: s * fx, top: s * 0.44, width: s * 0.07, height: s * 0.09,
          borderRadius: "50%", background: LANE.ink }} />
      ))}
      <div style={{ position: "absolute", left: s * 0.34, top: s * 0.56, width: s * 0.12, height: s * 0.07,
        borderRadius: "0 0 50% 50%", background: "#E08A4A" }} />
      {[0.02, 0.62].map((fx, i) => (
        <div key={`e${i}`} style={{ position: "absolute", left: s * fx, top: s * 0.24, width: s * 0.19, height: s * 0.26,
          borderRadius: "50% 50% 40% 40%", background: "#E0AE52", border: `5px solid ${LANE.ink}`, boxSizing: "border-box" }} />
      ))}
    </div>
  );
};

/** ZIP arrives at the door with a different letter each time. He is the FRONT. */
export const Zip: React.FC<{ b: B; letter: string; at: number }> = ({ b, letter, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const s = b.charH * 0.92;
  const walk = (1 - p) * b.width * 0.10;              // he walks in from the right
  const bounce = Math.abs(Math.sin(frame / 7)) * s * 0.05;
  return (
    <div style={{ position: "absolute", left: b.zipX + walk, top: b.charY + b.charH - s - bounce, width: s * 0.8, height: s }}>
      <div style={{ position: "absolute", left: s * 0.06, top: s * 0.28, width: s * 0.66, height: s * 0.68,
        borderRadius: "48% 48% 42% 42%", background: "#8FD3E8", border: `6px solid ${LANE.ink}`, boxSizing: "border-box" }} />
      {[0.24, 0.46].map((fx, i) => (
        <div key={i} style={{ position: "absolute", left: s * fx, top: s * 0.42, width: s * 0.07, height: s * 0.09,
          borderRadius: "50%", background: LANE.ink }} />
      ))}
      <div style={{ position: "absolute", left: s * 0.30, top: s * 0.56, width: s * 0.16, height: s * 0.08,
        borderRadius: "0 0 50% 50%", background: "#3E7C8C" }} />
      {/* the letter he is carrying — the whole point of him */}
      <div style={{
        position: "absolute", left: -s * 0.22, top: s * 0.36, width: s * 0.46, height: s * 0.46,
        background: LANE.cream, border: `6px solid ${LANE.ink}`, boxSizing: "border-box", borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.family, fontWeight: 800, fontSize: s * 0.30, color: LANE.ink,
        transform: `rotate(${-8 + Math.sin(frame / 12) * 4}deg)`,
        boxShadow: `0 ${s * 0.03}px 0 ${LANE.ink}`,
      }}>{letter}</div>
    </div>
  );
};

// ── the washing line: the family's words, pegged up as they are read ─────────

export const WashingLine: React.FC<{ b: B; words: string[]; shown: number; rime: string }> = ({
  b, words, shown, rime,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = words.length;
  const span = b.width * 0.86;
  const x0 = b.width * 0.07;
  const cw = Math.min(span / Math.max(n, 1) - 10, b.width * 0.088);
  return (
    <div style={{ position: "absolute", left: 0, top: b.lineY, width: b.width, height: b.height * 0.10 }}>
      <div style={{ position: "absolute", left: x0, top: 6, width: span, height: 5, borderRadius: 3, background: LANE.ink, opacity: 0.55 }} />
      {words.map((w, i) => {
        if (i >= shown) return null;
        const p = pop(frame, fps, 0, 14);
        const x = x0 + (span / n) * i + (span / n - cw) / 2;
        const sway = Math.sin((frame + i * 30) / 40) * 3;
        return (
          <div key={w} style={{
            position: "absolute", left: x, top: 10, width: cw, height: cw * 0.62,
            background: LANE.cream, border: `4px solid ${LANE.ink}`, boxSizing: "border-box", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.family, fontWeight: 800, fontSize: cw * 0.30, color: LANE.ink,
            transform: `rotate(${sway}deg)`, transformOrigin: "50% 0%",
            boxShadow: `0 4px 0 rgba(0,0,0,0.18)`,
          }}>{w}</div>
        );
      })}
    </div>
  );
};

/**
 * The five short vowels, in a FIXED place for the whole video — a strip on the fence.
 * They used to appear in the middle of the frame on one line in four, which is confusing:
 * a thing that means "the vowel" has to live somewhere and stay there, so a child can
 * glance at it. Only the LIT one changes.
 */
export const VowelStrip: React.FC<{ b: B; lit?: string }> = ({ b, lit }) => {
  const frame = useCurrentFrame();
  const s = Math.round(b.height * 0.055);
  return (
    <div style={{
      position: "absolute", left: b.width * 0.035, top: b.height * 0.235,
      display: "flex", gap: s * 0.22, alignItems: "center",
    }}>
      {["a", "e", "i", "o", "u"].map((v) => {
        const on = v === lit;
        return (
          <div key={v} style={{
            width: s, height: s, borderRadius: s * 0.22,
            background: on ? LANE.door : "rgba(255,248,233,0.55)",
            border: `${Math.max(3, s * 0.06)}px solid ${LANE.ink}`, boxSizing: "border-box",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.family, fontWeight: 800, fontSize: s * 0.56, color: LANE.ink,
            transform: on ? `scale(${1.12 + Math.sin(frame / 14) * 0.04})` : "scale(1)",
          }}>{v}</div>
        );
      })}
    </div>
  );
};

/**
 * RAIL — the family, as the user specified it (2026-08-11):
 * front letters in a vertical LIST on the left; a connector to the ending card in the
 * middle; a connector onward to the completed word + picture on the right, arriving one
 * word at a time. Each element pops ONCE on its own reveal — the circle version re-popped
 * the whole diagram on every word, which read as blinking.
 */
export const Rail: React.FC<{
  b: B; rime: string; words: string[]; k: number; wordAt: number;
}> = ({ b, rime, words, k, wordAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = b.contentR - b.contentL, H = b.contentH;
  const n = words.length;
  const cell = Math.min(H / n - 6, H * 0.155);
  const cy = H / 2;
  const midX = W * 0.42, wordX = W * 0.66;
  const word = words[k];
  const letter = word.slice(0, word.length - rime.length);
  const arrive = pop(frame, fps, wordAt, 14);       // ONLY the changing pieces use this
  const curY = (H - n * (cell + 6)) / 2 + k * (cell + 6) + cell / 2;
  return (
    <div style={{ position: "relative", width: W, height: H, fontFamily: font.family }}>
      {/* the letter list — fixed; each row lit only when its word is on */}
      {words.map((w, i) => {
        const l = w.slice(0, w.length - rime.length);
        const y = (H - n * (cell + 6)) / 2 + i * (cell + 6);
        const on = i === k, done = i < k;
        return (
          <div key={w} style={{
            position: "absolute", left: 0, top: y, width: cell, height: cell,
            borderRadius: cell * 0.2,
            background: on ? LANE.door : done ? LANE.cream : "rgba(255,248,233,0.42)",
            border: `4px solid ${LANE.ink}`, boxSizing: "border-box",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: cell * 0.5, color: done || on ? LANE.ink : "rgba(42,58,44,0.5)",
            transform: on ? `scale(${0.9 + 0.2 * arrive})` : "scale(1)",
            boxShadow: on ? `0 0 0 ${cell * 0.07}px rgba(244,195,63,0.45)` : "none",
          }}>{l}</div>
        );
      })}
      {/* connector: current letter -> ending. Only its VERTICAL attachment moves. */}
      <div style={{ position: "absolute", left: cell + 4, top: curY - 3, width: midX - cell - 14, height: 6,
        borderRadius: 3, background: LANE.doorDark, transform: `scaleX(${arrive})`, transformOrigin: "0 50%" }} />
      {/* the ending card — mounted ONCE, never re-popped */}
      <div style={{
        position: "absolute", left: midX, top: cy - cell * 0.75, width: cell * 1.7, height: cell * 1.5,
        borderRadius: cell * 0.22, background: LANE.door, border: `6px solid ${LANE.ink}`, boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: cell * 0.66, color: LANE.ink, boxShadow: `0 ${cell * 0.06}px 0 ${LANE.ink}`,
      }}>{rime}</div>
      {/* connector: ending -> the finished word */}
      <div style={{ position: "absolute", left: midX + cell * 1.7 + 6, top: cy - 3, width: wordX - midX - cell * 1.7 - 16, height: 6,
        borderRadius: 3, background: LANE.doorDark, transform: `scaleX(${arrive})`, transformOrigin: "0 50%" }} />
      {/* the finished word + its picture, arriving */}
      <div style={{
        position: "absolute", left: wordX, top: cy - cell * 1.05,
        display: "flex", flexDirection: "column", alignItems: "center", gap: cell * 0.14,
        transform: `scale(${arrive})`, transformOrigin: "0 50%",
      }}>
        <div style={{
          padding: `${cell * 0.16}px ${cell * 0.3}px`, borderRadius: cell * 0.2,
          background: LANE.cream, border: `5px solid ${LANE.ink}`, boxSizing: "border-box",
          fontWeight: 800, fontSize: cell * 0.62, color: LANE.ink, boxShadow: `0 ${cell * 0.05}px 0 ${LANE.ink}`,
        }}>
          <span style={{ color: LANE.rose }}>{letter}</span>{rime}
        </div>
      </div>
    </div>
  );
};

/**
 * WORD WITH ITS ENDING LIT — for the analysis lines ("Look at the end of the word",
 * "the last two letters are a and t"): the WHOLE word stays, the front dims, and the
 * ending grows and lights INSIDE it. Never the ending alone.
 */
export const WordLit: React.FC<{ word: string; rime: string; size?: number; at?: number; dimFront?: boolean }> = ({
  word, rime, size = 170, at = 0, dimFront = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  const front = word.slice(0, word.length - rime.length);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.08 }}>
      {front.split("").map((c, i) => (
        <Tile key={i} ch={c} size={size} tone={dimFront ? "dim" : "front"} seed={i} />
      ))}
      <div style={{ transform: `scale(${1 + 0.22 * p})`, transformOrigin: "50% 100%" }}>
        <Tile ch={rime} size={size} tone="ending" w={size * (rime.length > 2 ? 1.5 : 1.2)} hot />
      </div>
    </div>
  );
};

/** LEVEL above a big 6 — the L5 covers' treatment, as asked */
export const LevelSix: React.FC<{ b: B; at?: number }> = ({ b, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  const s = Math.round(b.contentH * 0.52);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s * 0.10, transform: `scale(${p})` }}>
      <div style={{
        padding: `${s * 0.05}px ${s * 0.18}px`, borderRadius: 999, background: LANE.sage, color: LANE.cream,
        border: `5px solid ${LANE.ink}`, fontFamily: font.family, fontWeight: 800, fontSize: s * 0.17, letterSpacing: 2,
      }}>LEVEL</div>
      <Tile ch="6" size={s} tone="ending" />
    </div>
  );
};

export const Content: React.FC<{ b: B; children: React.ReactNode; gap?: number }> = ({ b, children, gap }) => (
  <div style={{
    position: "absolute", left: b.contentL, top: b.contentTop,
    width: b.contentR - b.contentL, height: b.contentH,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: gap ?? Math.round(b.height * 0.026), overflow: "hidden",
  }}>{children}</div>
);

export const Row: React.FC<{ gap?: number; children: React.ReactNode }> = ({ gap = 14, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap, flexWrap: "wrap", rowGap: gap }}>{children}</div>
);

export const Tile: React.FC<{
  ch: string; size?: number; at?: number; tone?: "front" | "ending" | "dim"; seed?: number; hot?: boolean; w?: number;
}> = ({ ch, size = 150, at = 0, tone = "front", seed = 0, hot = false, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  const face = tone === "ending" ? LANE.door : tone === "dim" ? "rgba(255,248,233,0.35)" : LANE.cream;
  return (
    <div style={{
      width: w, minWidth: w ?? size * 0.80, height: size, padding: `0 ${size * 0.12}px`,
      borderRadius: size * 0.18, background: face,
      border: `${Math.max(4, size * 0.045)}px solid ${LANE.ink}`, boxSizing: "border-box",
      boxShadow: `0 ${size * 0.05}px 0 ${LANE.ink}${hot ? `, 0 0 0 ${size * 0.05}px rgba(244,195,63,0.55)` : ""}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.58, color: LANE.ink,
      transform: `scale(${p}) translateY(${tone === "ending" ? 0 : Math.sin((frame + seed * 19) / 44) * 3}px)`,
      whiteSpace: "nowrap", flex: "0 0 auto",
    }}>{ch}</div>
  );
};

export const Line: React.FC<{ text: string; size?: number; at?: number; color?: string }> = ({
  text, size = 64, at = 0, color = LANE.ink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, color, textAlign: "center",
      lineHeight: 1.12, whiteSpace: "pre-line", maxWidth: "100%",
      textShadow: "0 3px 0 rgba(255,255,255,0.55)",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 32) * 3}px)`,
    }}>{text}</div>
  );
};

export const Banner: React.FC<{ b: B; text: string }> = ({ b, text }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: b.bannerTop, width: b.width, display: "flex", justifyContent: "center" }}>
      <div style={{
        padding: `${b.height * 0.011}px ${b.width * 0.020}px`, borderRadius: 999,
        background: LANE.sage, color: LANE.cream,
        border: `6px solid ${LANE.ink}`, boxShadow: `0 8px 0 ${LANE.ink}`,
        fontFamily: font.family, fontWeight: 800, fontSize: Math.round(b.height * 0.034), letterSpacing: 1,
        transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children}</>;
};
