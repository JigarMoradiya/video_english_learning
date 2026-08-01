import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Block, CONSONANT, RocketWorld, VOWEL, WordCapsule } from "../components/RocketTower";
import { font, palette } from "../data/tokens";

// ── L3 · 2-Sound Blending thumbnail, portrait (1080×1920) ────────────────────
//   sh tools/render_still.sh thumb-blending-9x16
//
// The 9:16 lesson wears a different world from the 16:9 — The Rocket Tower — so its
// thumbnail does too, or the cover would promise a video that does not exist.
//
// The world supplies the mascot; the thumbnail must not add a second one.
//
// Same elements as the landscape one, restacked: the sum runs DOWN instead of
// across, because a 1080-wide frame cannot hold card + card + plank on one line at a
// size that survives a 120px grid tile.
const W = 1080;
const H = 1920;

const CARD = 300;
const CAPSULE = 400;
const ARROW = 96;

// COLUMN ARITHMETIC, top to bottom. The pair row is CARD tall, then the arrow, then the
// capsule, whose drawn height is about 0.62 of its `size`.
const PAIR_TOP = 590;
const PAIR_GAP = 34;
const ARROW_TOP = PAIR_TOP + CARD + 12;
const CAP_TOP = ARROW_TOP + ARROW + 8;
const CAP_H = Math.round(CAPSULE * 0.62);

const TITLE_TOP = 320;
const TITLE_H = 210;             // two lines at 104
const MASCOT_W = 250;
const PAD_Y = 1320;              // the world's bear stands on the deck from here down

if (TITLE_TOP + TITLE_H + 30 > PAIR_TOP) {
  throw new Error(`thumb: title ends ${TITLE_TOP + TITLE_H}, the pair starts ${PAIR_TOP}`);
}
if (CAP_TOP + CAP_H + 40 > PAD_Y) {
  throw new Error(`thumb: the word ends ${CAP_TOP + CAP_H}, the deck is at ${PAD_Y}`);
}
// two cards plus the gap must fit the frame with a margin either side
if (2 * CARD + PAIR_GAP > W - 120) {
  throw new Error(`thumb: the pair is ${2 * CARD + PAIR_GAP}px wide in a ${W}px frame`);
}

export const ThumbBlendingPortrait: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <RocketWorld />

    <div
      style={{
        position: "absolute", left: 44, top: 150, transform: "rotate(-7deg)",
        background: "#FFC42A", color: palette.ink, borderRadius: 24,
        padding: "18px 32px", fontSize: 52, fontWeight: 900, lineHeight: 1.06,
        letterSpacing: 0.5, textAlign: "center", boxShadow: "0 10px 0 #E0A400",
      }}
    >
      2 SOUNDS<br />1 WORD
    </div>

    <div
      style={{
        position: "absolute", left: 0, right: 0, top: TITLE_TOP, textAlign: "center",
        fontSize: 104, fontWeight: 900, color: palette.ink, letterSpacing: -2, lineHeight: 1.02,
        textShadow: "0 5px 0 rgba(255,255,255,0.92)",
      }}
    >
      2-SOUND<br />BLENDING
    </div>

    {/* THE SUM, stacked */}
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: PAIR_TOP,
        display: "flex", justifyContent: "center", alignItems: "center", gap: PAIR_GAP,
      }}
    >
      <Block text="a" vowel size={CARD} lit />
      <Block text="t" vowel={false} size={CARD} lit />
    </div>

    <div
      style={{
        position: "absolute", left: 0, right: 0, top: ARROW_TOP, textAlign: "center",
        fontSize: ARROW, fontWeight: 800, color: palette.inkSoft, lineHeight: 1,
      }}
    >
      ↓
    </div>

    <div style={{ position: "absolute", left: 0, right: 0, top: CAP_TOP, display: "flex", justifyContent: "center" }}>
      <WordCapsule word="at" size={CAPSULE} lit />
    </div>

    {/* which card is which — the colours already say it, these name it */}
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: PAIR_TOP + CARD + 2,
        display: "flex", justifyContent: "center", gap: PAIR_GAP,
        fontSize: 40, fontWeight: 800, opacity: 0,
      }}
    >
      <div style={{ width: CARD, textAlign: "center", color: VOWEL }}>vowel</div>
      <div style={{ width: CARD, textAlign: "center", color: CONSONANT }}>consonant</div>
    </div>

    <Img
      src={staticFile("logo.png")}
      style={{ position: "absolute", right: 40, top: 150, width: 200, height: "auto", opacity: 0.95 }}
    />
  </AbsoluteFill>
);
