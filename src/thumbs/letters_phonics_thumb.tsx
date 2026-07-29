import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { LETTERS } from "../data/letters";
import { font, hex, letterColorFor, palette, tint } from "../data/tokens";

// ── Letter Sounds A–Z thumbnail (1280×720) ───────────────────────────────────
//   npx remotion still thumb-letters-phonics out/thumb_letters_phonics.png
//
// Built from what the VIDEO actually looks like, not from a generic template. That
// lesson has no "world" the way the phonics comparison videos do — its identity is
// three things, and all three are here:
//   · the whole frame floods with the CURRENT LETTER'S colour (A is teal, C purple…)
//   · the big traced letter pair beside its picture card, with "A for Ant" beneath
//   · the A–Z progress strip along the bottom — the single most recognisable element
//
// The strip also does the selling: 26 cells in 26 colours reads as "the whole
// alphabet" even at 120px wide, where individual letters are only a colour bar.
//
// The existing thumb-phonics-a/b/c are the dark gold-on-navy house style; this one is
// deliberately the video's own bright palette so the click and the content match.
const W = 1280;
const H = 720;
const GOLD = "#FFC42A";

const HERO = LETTERS[0]; // A · Ant
const HC = hex(letterColorFor(HERO.letter, HERO.imageColor));

// A–Z strip. Starts right of the mascot so neither has to sit on top of the other.
const STRIP_X0 = 250;
const STRIP_X1 = 1250;
const STRIP_Y = 566;
const CELL_W = 30;
const CELL_H = 52;
const CELL_GAP = (STRIP_X1 - STRIP_X0 - 26 * CELL_W) / 25; // 8.8

// mascot.png carries only 7px of bottom padding, so its feet are effectively the last
// pixel row: bottom:0 leaves them flush with the frame edge and reads as cropped.
const MASCOT_W = 200;
const MASCOT_BOTTOM = 26;
const MASCOT_H = Math.round(MASCOT_W * (1063 / 923));
if (H - MASCOT_BOTTOM - MASCOT_H > STRIP_Y) {
  throw new Error("thumb: mascot sits below the strip; it will look detached");
}

// The video's background carries drifting soft shapes; a still keeps a few, fixed.
const SHAPES: { x: number; y: number; s: number; star: boolean; li: number }[] = [
  { x: 62, y: 96, s: 1.0, star: false, li: 8 },
  { x: 1180, y: 300, s: 1.25, star: true, li: 2 },
  { x: 150, y: 430, s: 0.8, star: true, li: 14 },
  { x: 1050, y: 96, s: 0.7, star: false, li: 20 },
  { x: 640, y: 500, s: 0.6, star: false, li: 11 },
];

const Backdrop: React.FC = () => (
  <>
    {/* the letter's colour flooding the frame — exactly what LetterScene does */}
    <AbsoluteFill style={{ background: `linear-gradient(155deg, ${tint(HC, 0.8)} 0%, #FFFFFF 64%)` }} />
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      {SHAPES.map((sh, i) => {
        const l = LETTERS[sh.li];
        const c = hex(letterColorFor(l.letter, l.imageColor));
        if (sh.star) {
          const pts = Array.from({ length: 10 }, (_, k) => {
            const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
            const r = (k % 2 ? 40 : 92) * sh.s;
            return `${sh.x + Math.cos(a) * r},${sh.y + Math.sin(a) * r}`;
          }).join(" ");
          return <polygon key={i} points={pts} fill={c} opacity={0.13} />;
        }
        const w = 168 * sh.s;
        return (
          <rect
            key={i} x={sh.x - w / 2} y={sh.y - w / 2} width={w} height={w} rx={38 * sh.s}
            fill={c} opacity={0.12} transform={`rotate(${i % 2 ? 14 : -12} ${sh.x} ${sh.y})`}
          />
        );
      })}
    </svg>
  </>
);

export const ThumbLettersPhonics: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
    <Backdrop />

    {/* hook, in the channel's rotated gold badge (a different claim from
        thumb-phonics-a's "ALL 26 SOUNDS", so the two never read as duplicates) */}
    <div
      style={{
        position: "absolute", left: 20, top: 18, transform: "rotate(-11deg)",
        background: GOLD, color: palette.ink, borderRadius: 20, padding: "8px 20px",
        fontSize: 34, fontWeight: 800, lineHeight: 1.05, textAlign: "center",
        boxShadow: "0 10px 24px rgba(30,36,56,0.30)",
      }}
    >
      ALL 26<br /><span style={{ fontSize: 24 }}>LETTERS</span>
    </div>

    <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 22, top: 14, width: 94, height: "auto" }} />

    <div
      style={{
        position: "absolute", left: 0, top: 44, width: W, textAlign: "center",
        fontSize: 96, fontWeight: 800, color: palette.ink, letterSpacing: 1,
        textShadow: "0 6px 0 #FFFFFF, 0 10px 26px rgba(30,36,56,0.22)",
      }}
    >
      LETTER SOUNDS
    </div>

    {/* the hero pair + picture card — the video's own composition, scaled up */}
    <div
      style={{
        position: "absolute", left: 0, top: 178, width: W,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 46,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", color: HC, fontWeight: 800, lineHeight: 0.9 }}>
        <span style={{ fontSize: 232, textShadow: `0 14px 30px ${HC}44` }}>{HERO.letter}</span>
        <span style={{ fontSize: 168, textShadow: `0 14px 30px ${HC}44` }}>{HERO.letter.toLowerCase()}</span>
      </div>
      <div
        style={{
          width: 214, height: 214, background: "#fff", borderRadius: 34,
          border: `9px solid ${HC}`, boxShadow: `0 18px 40px ${HC}44`,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18, boxSizing: "border-box",
        }}
      >
        <Img src={staticFile(`letters/${HERO.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>
      {/* the sound, said three times, exactly as the video shows it */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: "#6B5B86" }}>says</span>
        <span style={{ fontSize: 72, fontWeight: 800, color: HC, lineHeight: 1 }}>{HERO.soundToken}!</span>
      </div>
    </div>

    <div
      style={{
        position: "absolute", left: 0, top: 434, width: W, textAlign: "center",
        fontSize: 52, fontWeight: 800, color: palette.ink,
      }}
    >
      {HERO.letter} for {HERO.word}
    </div>

    {/* the A–Z strip: the video's signature, and what says "all 26" at any size */}
    {LETTERS.map((l, i) => {
      const c = hex(letterColorFor(l.letter, l.imageColor));
      return (
        <div
          key={l.letter}
          style={{
            position: "absolute", left: STRIP_X0 + i * (CELL_W + CELL_GAP), top: STRIP_Y,
            width: CELL_W, height: CELL_H, borderRadius: 9, background: c,
            boxShadow: `0 6px 14px ${c}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 21, fontWeight: 800, color: "#fff",
          }}
        >
          {l.letter}
        </div>
      );
    })}

    <Img
      src={staticFile("mascot.png")}
      style={{
        position: "absolute", left: 6, bottom: MASCOT_BOTTOM, width: MASCOT_W, height: "auto",
        filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))",
      }}
    />
  </AbsoluteFill>
);
