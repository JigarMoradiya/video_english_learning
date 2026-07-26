import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../data/tokens";

// ── Image-poll OPTION tiles, A→Z (1080×1080) ─────────────────────────────────
// Render one:   npx remotion still poll-letter-q out/poll_letters/Q.png
// Render all:   npm run render:poll_letters
//
// For a YouTube Community "image poll": the QUESTION is text (it carries the sound) and the
// OPTIONS are images — these tiles. They render small in the feed, so each is just one huge
// letter pair on its own colour: readable at a glance, nothing else to decode.
//
// Colours come from a golden-angle hue spread, so all 26 are distinct AND no group of
// letters shares a colour — otherwise the palette itself would hint at the answer.
export const AZ_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const hsl = (h: number, s: number, l: number): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const hx = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
};

const tileColors = (i: number): [string, string] => {
  const h = (i * 137.5) % 360; // golden angle → maximally separated hues
  return [hsl(h, 0.62, 0.34), hsl(h, 0.66, 0.54)];
};

const Stars: React.FC<{ seed: number }> = ({ seed }) => {
  const rnd = (k: number) => { const x = Math.sin(k * 91.7 + seed * 47.3) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: 11 }).map((_, i) => {
        const r = 12 + rnd(i) * 22;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: rnd(i + 30) * 1000, top: rnd(i + 60) * 1000, opacity: 0.13 + rnd(i + 90) * 0.12 }}><polygon points={pts} fill="#fff" /></svg>;
      })}
    </>
  );
};

export const LetterTile: React.FC<{ letter: string }> = ({ letter }) => {
  const [a, b] = tileColors(AZ_LETTERS.indexOf(letter.toUpperCase()));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(150deg, ${a} 0%, ${b} 100%)`, fontFamily: font.family, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Stars seed={letter.charCodeAt(0)} />
      {/* one huge letter pair — poll options render small, so nothing competes with it */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, transform: "translateY(-24px)" }}>
        <span style={{ fontSize: 500, fontWeight: 800, color: "#fff", lineHeight: 0.9, textShadow: "0 20px 44px rgba(0,0,0,0.32)" }}>{letter.toUpperCase()}</span>
        <span style={{ fontSize: 344, fontWeight: 800, color: "rgba(255,255,255,0.82)", lineHeight: 0.9, textShadow: "0 20px 44px rgba(0,0,0,0.3)" }}>{letter.toLowerCase()}</span>
      </div>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 28, bottom: 26, width: 128, height: "auto", opacity: 0.95 }} />
    </AbsoluteFill>
  );
};

// one composition per letter: poll-letter-a … poll-letter-z
export const LETTER_TILE_ENTRIES = AZ_LETTERS.map((l) => ({
  id: `poll-letter-${l.toLowerCase()}`,
  component: () => <LetterTile letter={l} />,
}));
