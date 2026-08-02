import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Block, WordPlank, WorkshopWorld } from "../components/ToyWorkshop";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";

// ── L3 · CV·VC Blending thumbnail, portrait (1080×1920) — WORKSHOP theme ──────
//   npx remotion still thumb-blending-9x16-new out/thumb_l3_blending_9x16_new.png
//
// The old thumb-blending-9x16 wears The Rocket Tower (the 9:16 VIDEO's world). This one
// wears The Toy Workshop — the SAME world as the 16:9 thumb and the 4:5 video — so the
// blending covers read as one theme.
//
// EVERYTHING is centred on the frame's vertical axis (x=540): headline, the pair, the
// arrow, the word. The headline is sized so that, centred, it clears the toy shelf on the
// right — that is what keeps it aligned with the blocks instead of shoved left.
const W = 1080;
const H = 1920;
const C = cover(W, H);

const SHELF_L = 946;                                  // world's portrait shelf starts here
const HEAD_MAXW = 2 * (SHELF_L - 24 - W / 2);         // widest centred line that clears the shelf → 764
const HEAD_SIZE = Math.min(C.head.fontSize, HEAD_MAXW / (8 * 0.62)); // fits "BLENDING"
const HEAD_TOP = 236;
const HEAD_H = HEAD_SIZE * 2 * C.head.lineHeight;

// THE SUM (stacked): a + t  →  at, all centred on x=540. The 9:16 bench is at y1330,
// so the pair floats in the stage and the finished word drops down to rest on the bench.
const CARD = 250;
const PAIR_GAP = 46;
const PAIR_TOP = 630;
const ARROW = 108;
const PLANK = 340;
const PLANK_H = Math.round(PLANK * 0.62);
const PLANK_TOP = 1010;
const ARROW_TOP = (PAIR_TOP + CARD + PLANK_TOP) / 2 - ARROW / 2; // centred in the gap

// the ground line the ladder's feet touch; mascot + logo sit below it with a gap.
// Raised up so the floor has some height and the mascot doesn't crowd the line.
const BASE_Y = 1390;

const MASCOT_H = C.mascot.width * C.mascot.aspect;
const MASCOT_TOP = H - C.mascot.bottom - MASCOT_H;

// guardrails
if (HEAD_TOP + HEAD_H + 24 > PAIR_TOP) {
  throw new Error(`thumb: headline ends ${HEAD_TOP + HEAD_H}, the pair starts ${PAIR_TOP}`);
}
if (PLANK_TOP + PLANK_H + 24 > MASCOT_TOP) {
  throw new Error(`thumb: the word ends ${PLANK_TOP + PLANK_H}, mascot top is ${Math.round(MASCOT_TOP)}`);
}
if (2 * CARD + PAIR_GAP > W - 100) {
  throw new Error(`thumb: the pair is ${2 * CARD + PAIR_GAP}px wide in a ${W - 100}px frame`);
}

export const ThumbBlendingPortraitNew: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <WorkshopWorld bare />

    {/* badge — the promise, tilted like a sticker */}
    <div style={{ position: "absolute", ...C.badge, color: palette.ink }}>
      2 SOUNDS<br />
      <span style={C.badgeSub}>1 WORD</span>
    </div>

    {/* headline — centred on the frame */}
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: HEAD_TOP, textAlign: "center",
        fontSize: HEAD_SIZE, fontWeight: C.head.fontWeight, lineHeight: C.head.lineHeight,
        letterSpacing: C.head.letterSpacing, color: palette.ink, textShadow: C.head.textShadow,
      }}
    >
      CV · VC<br />BLENDING
    </div>

    {/* the pair — colour teaches vowel (red) + consonant (blue) */}
    <div style={{ position: "absolute", left: 0, right: 0, top: PAIR_TOP, display: "flex", justifyContent: "center", alignItems: "center", gap: PAIR_GAP }}>
      <Block text="a" vowel size={CARD} lit />
      <Block text="t" vowel={false} size={CARD} lit />
    </div>

    {/* they snap into one word */}
    <div style={{ position: "absolute", left: 0, right: 0, top: ARROW_TOP, textAlign: "center", fontSize: ARROW, fontWeight: 800, color: palette.inkSoft, lineHeight: 1 }}>
      ↓
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: PLANK_TOP, display: "flex", justifyContent: "center" }}>
      <WordPlank word="at" size={PLANK} lit />
    </div>

    {/* the base line + soft floor: the ladder stands on it, mascot + logo sit below it */}
    <div style={{ position: "absolute", left: 0, right: 0, top: BASE_Y, bottom: 0, background: "linear-gradient(180deg,#F3D9AE 0%,#ECCB94 100%)", opacity: 0.5 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: BASE_Y, height: 46, background: "linear-gradient(180deg, rgba(140,100,55,0.12), rgba(140,100,55,0))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: BASE_Y - 2, height: 6, borderRadius: 3, background: "#E3BE86", opacity: 0.8 }} />

    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: C.mascot.left, bottom: C.mascot.bottom, width: C.mascot.width, height: "auto" }} />
    <Img src={staticFile("logo.png")} style={{ position: "absolute", ...C.logo, height: "auto" }} />
  </AbsoluteFill>
);
