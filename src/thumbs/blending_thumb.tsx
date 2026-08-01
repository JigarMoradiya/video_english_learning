import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Block, WordPlank, WorkshopWorld } from "../components/ToyWorkshop";
import { CONSONANT, VOWEL } from "../components/ToyWorkshop";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";

// ── L3 · 2-Sound Blending thumbnail (1280×720) ───────────────────────────────
//   sh tools/render_still.sh thumb-blending
//
// Wears the video's world (The Toy Workshop) but composed for a thumbnail, not for a
// frame of the lesson. Read at about 120px wide on a phone, so it carries FIVE things
// and no more: headline, the sum, the badge, the logo, the mascot.
//
// The workshop stands ITS bear on the bench at y762 — below a 720-tall frame — so unlike
// the portrait cover this one has to supply its own, and there is no risk of two.
//
// The SUM is the thumbnail. "a + t = at" is the entire lesson in one glance and needs
// no reading — the two coloured cards say vowel and consonant by themselves, and the
// plank says what they make. Everything else is there to frame it.
//
// Dark ink on a bright ground, like short_vowels: the workshop is cream, white text
// would need a heavy outline to survive on it, and a bright thumbnail stands out in a
// row of dark ones.
const W = 1280;
const H = 720;
const C = cover(W, H);

const CARD = 150;          // the a and t blocks
const PLANK = 220;         // the at plank — bigger, because it is the answer
const OP = 76;             // the + and = glyphs
const GAP = 18;

// ROW ARITHMETIC, left to right: card + gap + op + gap + card + gap + op + gap + plank.
// The plank's drawn width is wider than its `size` (two glyphs plus the frame), so it is
// measured at 1.35x — under-measuring it is what pushed earlier rows off the edge.
const PLANK_W = Math.round(PLANK * 1.35);
const ROW_W = CARD + GAP + OP + GAP + CARD + GAP + OP + GAP + PLANK_W;
const ROW_X = Math.round((W - ROW_W) / 2);
const ROW_CY = 430;

const TITLE_TOP = C.head.top;
const TITLE_H = 88;
const MASCOT_W = C.mascot.width;
const MASCOT_X = C.mascot.left;
const MASCOT_BOTTOM = C.mascot.bottom;

if (ROW_X < 40) {
  throw new Error(`thumb: the sum is ${ROW_W}px wide, only ${W - 80}px of safe width`);
}
if (TITLE_TOP + TITLE_H + 24 > ROW_CY - PLANK * 0.5) {
  throw new Error(`thumb: title ends ${TITLE_TOP + TITLE_H}, the sum starts ${ROW_CY - PLANK * 0.5}`);
}
// the mascot stands at the left edge of the bench and must not reach the first card
if (MASCOT_X + MASCOT_W > ROW_X - 12) {
  throw new Error(`thumb: mascot ends ${MASCOT_X + MASCOT_W}, the first card starts ${ROW_X}`);
}

const Op: React.FC<{ glyph: string }> = ({ glyph }) => (
  <div style={{ width: OP, textAlign: "center", fontSize: 66, fontWeight: 800, color: palette.inkSoft, lineHeight: 1 }}>
    {glyph}
  </div>
);

export const ThumbBlending: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <WorkshopWorld />

    {/* badge — the promise, in the corner, tilted so it reads as a sticker */}
    <div
      style={{
        position: "absolute", ...C.badge, color: palette.ink,
      }}
    >
      2 SOUNDS<br /><span style={C.badgeSub}>1 WORD</span>
    </div>

    <div
      style={{
        position: "absolute", left: 0, right: 0, top: TITLE_TOP, textAlign: "center",
        fontSize: C.head.fontSize, fontWeight: C.head.fontWeight,
        lineHeight: C.head.lineHeight, letterSpacing: C.head.letterSpacing, color: palette.ink,
        textShadow: "0 4px 0 rgba(255,255,255,0.9)",
      }}
    >
      CV · VC BLENDING
    </div>

    {/* THE SUM */}
    <div
      style={{
        position: "absolute", left: ROW_X, top: ROW_CY, transform: "translateY(-50%)",
        display: "flex", alignItems: "center", gap: GAP,
      }}
    >
      <Block text="a" vowel size={CARD} lit />
      <Op glyph="+" />
      <Block text="t" vowel={false} size={CARD} lit />
      <Op glyph="=" />
      <WordPlank word="at" size={PLANK} lit />
    </div>

    {/* the two words the colours already teach, small, under their own cards */}
    <div
      style={{
        position: "absolute", left: ROW_X, top: ROW_CY + PLANK * 0.5 + 4,
        display: "flex", alignItems: "flex-start", gap: GAP, fontSize: 26, fontWeight: 800,
      }}
    >
      <div style={{ width: CARD, textAlign: "center", color: VOWEL }}>vowel</div>
      <div style={{ width: OP }} />
      <div style={{ width: CARD, textAlign: "center", color: CONSONANT }}>consonant</div>
    </div>

    <Img
      src={staticFile("mascot.png")}
      style={{ position: "absolute", left: MASCOT_X, bottom: MASCOT_BOTTOM, width: MASCOT_W, height: "auto" }}
    />
    <Img
      src={staticFile("logo.png")}
      style={{ position: "absolute", ...C.logo, right: 232, height: "auto" }}
    />
  </AbsoluteFill>
);
