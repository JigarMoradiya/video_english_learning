import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";

// ── A picture for a word ─────────────────────────────────────────────────────
//
// The rule this file obeys: a picture must show the WORD, not something the word is
// merely associated with. `cage` is not a bird. So words with no honest picture get
// NO picture — a wrong image teaches a wrong meaning, and a missing one teaches nothing.
//
// Seven words have real app artwork; those win over emoji, because the child meets the
// same drawing inside the app.

const APP_ART = new Set(["cat", "key", "king", "duck", "leaf", "tall", "bee"]);

/**
 * A word that borrows another word's artwork. `buzz` is what a bee does, and the app
 * already draws a bee — so the child meets the same picture here as in the app.
 */
const ALIAS: Record<string, string> = { buzz: "bee" };

/** Only words a picture can honestly show. Everything else is deliberately absent. */
const EMOJI: Record<string, string> = {
  fizz: "🥤",
  check: "✅",
  bell: "🔔",
  shell: "🐚",
  dress: "👗",
  grass: "🌿",
  cliff: "⛰️",
  sail: "⛵",
  tool: "🔧",
  cup: "☕",
  cod: "🐟",
  cot: "🛏️",
  cab: "🚕",
  cut: "✂️",
  kit: "🧰",
  rock: "🪨",
  luck: "🍀",
  pack: "🎒",
  sock: "🧦",
  block: "🧱",
  city: "🏙️",
  travel: "✈️",
  pencil: "✏️",
  floss: "🧵",
};

/** Every word in this video now has a picture. Nothing is left showing letters alone. */
export const NO_PICTURE: string[] = [];

/**
 * Words no emoji shows honestly, so they are DRAWN. Each shows the word itself, not a
 * thing the word is merely near: `off` is the state of a lamp, `miss` is the dart that
 * landed outside, `kick` is the foot meeting the ball, `thick` is thickness compared with
 * thinness, `back` is the direction, `pool` is the pool, `feel` is a hand touching.
 */
const DRAWN: Record<string, (size: number) => React.ReactNode> = {
  // composed from the app's own leg and ball art, laid out side-on so it reads as a KICK
  kick: (size) => (
    <div style={{ position: "relative", width: size, height: size }}>
      <Img src={staticFile("img/l5/leg.png")} style={{ position: "absolute", left: 0, top: size * 0.10, width: size * 0.56, height: size * 0.80, objectFit: "contain", transform: "rotate(-16deg)" }} />
      <Img src={staticFile("img/l5/ball.png")} style={{ position: "absolute", left: size * 0.56, top: size * 0.42, width: size * 0.42, height: size * 0.42, objectFit: "contain" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: size * (0.50 - i * 0.06), top: size * (0.30 - i * 0.06), width: size * 0.20, height: size * 0.045, borderRadius: 4, background: "#F9A825", transform: "rotate(-28deg)", opacity: 1 - i * 0.3 }} />
      ))}
    </div>
  ),
  thick: (size) => (
    <div style={{ position: "relative", width: size, height: size, display: "flex", flexDirection: "column", justifyContent: "center", gap: size * 0.10 }}>
      <div style={{ width: size * 0.86, height: size * 0.34, borderRadius: size * 0.08, background: "#F9A825", border: `${size * 0.04}px solid #B26A00` }} />
      <div style={{ width: size * 0.86, height: size * 0.09, borderRadius: size * 0.04, background: "#CFC7B7", border: `${size * 0.02}px solid #A49B8A` }} />
    </div>
  ),
  back: (size) => (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: size * 0.20, top: size * 0.26, width: size * 0.62, height: size * 0.40, borderRadius: `${size * 0.31}px ${size * 0.31}px 0 0`, border: `${size * 0.12}px solid #1565C0`, borderBottom: "none" }} />
      <div style={{ position: "absolute", left: size * 0.06, top: size * 0.60, width: 0, height: 0, borderLeft: `${size * 0.15}px solid transparent`, borderRight: `${size * 0.15}px solid transparent`, borderTop: `${size * 0.24}px solid #1565C0` }} />
    </div>
  ),
  pool: (size) => (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: 0, top: size * 0.24, width: size, height: size * 0.56, borderRadius: size * 0.12, background: "#4FA8DC", border: `${size * 0.06}px solid #E8E2D4` }} />
      {[0.40, 0.56, 0.72].map((fy, i) => (
        <div key={fy} style={{ position: "absolute", left: size * (0.14 + i * 0.04), top: size * fy, width: size * (0.62 - i * 0.10), height: size * 0.05, borderRadius: 999, background: "rgba(255,255,255,0.72)" }} />
      ))}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: size * (0.72 + i * 0.10), top: size * 0.14, width: size * 0.05, height: size * 0.24, borderRadius: 3, background: "#B0BEC5" }} />
      ))}
      <div style={{ position: "absolute", left: size * 0.72, top: size * 0.22, width: size * 0.15, height: size * 0.05, borderRadius: 3, background: "#B0BEC5" }} />
    </div>
  ),
  feel: (size) => (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: size * 0.26, top: size * 0.34, width: size * 0.44, height: size * 0.40, borderRadius: `${size * 0.14}px ${size * 0.14}px ${size * 0.08}px ${size * 0.08}px`, background: "#F2C08A", border: `${size * 0.035}px solid #C08A4E" ` .replace('"', "") }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: size * (0.29 + i * 0.11), top: size * 0.16, width: size * 0.09, height: size * 0.24, borderRadius: 999, background: "#F2C08A", border: `${size * 0.03}px solid #C08A4E` }} />
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: size * 0.10, top: size * (0.80 + i * 0.06), width: size * (0.76 - i * 0.16), height: size * 0.045, borderRadius: 999, background: "#00897B", opacity: 1 - i * 0.3 }} />
      ))}
    </div>
  ),
  off: (size) => (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: size * 0.22, top: size * 0.06, width: size * 0.56, height: size * 0.56, borderRadius: "50%", background: "#C9C4B6", border: `${size * 0.05}px solid #8E887A` }} />
      <div style={{ position: "absolute", left: size * 0.36, top: size * 0.58, width: size * 0.28, height: size * 0.16, background: "#8E887A", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: size * 0.34, top: size * 0.74, width: size * 0.32, height: size * 0.14, background: "#6F6A5E", borderRadius: 3 }} />
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: size * 0.16, top: size * 0.30, width: size * 0.68, height: size * 0.08, borderRadius: 4, background: "#E53935", transform: `rotate(${i ? -38 : 38}deg)` }} />
      ))}
    </div>
  ),
  miss: (size) => (
    <div style={{ position: "relative", width: size, height: size }}>
      {[1, 0.68, 0.36].map((f, i) => (
        <div
          key={f}
          style={{
            position: "absolute", left: size * (0.5 - f * 0.34), top: size * (0.5 - f * 0.34),
            width: size * f * 0.68, height: size * f * 0.68, borderRadius: "50%",
            background: i % 2 ? "#FFFFFF" : "#E53935", border: `${size * 0.03}px solid #B71C1C`,
          }}
        />
      ))}
      {/* the dart, stuck in the ground well outside the board */}
      <div style={{ position: "absolute", left: size * 0.70, top: size * 0.64, width: size * 0.36, height: size * 0.09, borderRadius: 3, background: "#5D6B77", transform: "rotate(38deg)" }} />
      <div style={{ position: "absolute", left: size * 0.98, top: size * 0.80, width: 0, height: 0, borderLeft: `${size * 0.09}px solid transparent`, borderRight: `${size * 0.09}px solid transparent`, borderBottom: `${size * 0.14}px solid #F9A825`, transform: "rotate(128deg)" }} />
    </div>
  ),
};

export const hasPicture = (word: string) => {
  const w = ALIAS[word] ?? word;
  return APP_ART.has(w) || w in EMOJI || word in DRAWN;
};

/**
 * The picture for a word, or nothing at all. `size` is the box it must fit inside —
 * the art is sized FROM the box, so it can never draw past it.
 */
export const WordPic: React.FC<{ word: string; size?: number; seed?: number; still?: boolean }> = ({
  word, size = 96, seed = 0, still = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = word.toLowerCase();
  if (!hasPicture(raw)) return null;
  const w = ALIAS[raw] ?? raw;

  const motion = still
    ? undefined
    : `translateY(${bob(frame, fps, 5, 2.3, seed)}px) rotate(${wiggle(frame, fps, 3, 3.1, seed)}deg)`;

  return (
    <div
      style={{
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: motion,
      }}
    >
      {raw in DRAWN ? (
        DRAWN[raw](size)
      ) : APP_ART.has(w) ? (
        <Img
          src={staticFile(`img/l5/${w}.png`)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <div style={{ fontSize: size * 0.82, lineHeight: 1 }}>{EMOJI[w]}</div>
      )}
    </div>
  );
};
