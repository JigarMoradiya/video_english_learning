import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Block, RocketWorld, WordCapsule } from "../components/RocketTower";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";

// ── L3 · CV·VC Blending thumbnail, portrait (1080×1920) ──────────────────────
//   npx remotion still src/index.ts thumb-blending-9x16 out/…/thumb_l3_blending_9x16.png
//
// Mounts the REAL world so the rocket, gantry and deck are the ones in the video — a cover
// that redraws them promises a video that does not exist. `bare` drops only the two pieces
// that belong to a lesson frame and not to a cover: the small mascot on the deck (a cover
// carries ONE big one in the corner) and the CV·VC key.
//
// The only thing drawn over the world is the sun: the world's is a flat pale disc, and a
// cover wants it to read as a sun at 120px.
//
// Positions, sizes and weights follow shortvowels_thumb_portrait so the channel's covers
// look like a set: badge top-left at -11deg, mascot bottom-left, logo bottom-right, all
// expressed as fractions of the frame.
const W = 1080;
const H = 1920;

// the world already puts its sun here; this one replaces it in the same place
const SUN_X = W - 150;
const SUN_Y = 126;
const SUN_R = 62;

const PAD_Y = 1320;             // RocketWorld's own deck line

const C = cover(W, H);
const GANTRY_R = 196;                 // gantry + rocket fins own x0…196
const HEAD_L = GANTRY_R + 14;
const HEAD_W = W - HEAD_L - 30;
const HEAD_LIFT = 66;                 // the stacked sum below needs the room
const HEAD_TOP = C.head.top - HEAD_LIFT;
const HEAD_SIZE = C.head.fontSize;
const HEAD_H = HEAD_SIZE * 2 * 1.04;

const CARD = 240;
const CAPSULE = 300;
const PAIR_GAP = 34;
const PAIR_TOP = H * 0.385;
const ARROW = 92;
const ARROW_TOP = PAIR_TOP + CARD + 10;
const CAP_TOP = ARROW_TOP + ARROW + 6;
const CAP_H = Math.round(CAPSULE * 0.62);

// mascot.png is 923×1063 with ~7px of bottom padding, so its feet are the last pixel row
const MASCOT_W = C.mascot.width;
const MASCOT_H = MASCOT_W * C.mascot.aspect;
const MASCOT_BOTTOM = C.mascot.bottom;

if (HEAD_TOP + HEAD_H + H * 0.02 > PAIR_TOP) {
  throw new Error(`thumb: headline ends ${HEAD_TOP + HEAD_H}, the pair starts ${PAIR_TOP}`);
}
if (CAP_TOP + CAP_H + 30 > PAD_Y) {
  throw new Error(`thumb: the word ends ${CAP_TOP + CAP_H}, the deck is at ${PAD_Y}`);
}
if (H - MASCOT_BOTTOM - MASCOT_H < CAP_TOP + CAP_H) {
  throw new Error(`thumb: mascot top ${H - MASCOT_BOTTOM - MASCOT_H} rises into the word card`);
}
if (HEAD_W < 760) {
  throw new Error(`thumb: headline zone is ${HEAD_W}px, "BLENDING" needs about 800`);
}
if (2 * CARD + PAIR_GAP > HEAD_W) {
  throw new Error(`thumb: the pair is ${2 * CARD + PAIR_GAP}px wide in a ${HEAD_W}px clear zone`);
}


const Sun: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <radialGradient id="tbSunCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="46%" stopColor="#FFF6CE" />
        <stop offset="100%" stopColor="#FFD860" />
      </radialGradient>
      <radialGradient id="tbSunHaze" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#FFF3D2" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="tbRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFDD72" stopOpacity={0.8} />
        <stop offset="100%" stopColor="#FFD055" stopOpacity={0.08} />
      </linearGradient>
    </defs>
    <circle cx={SUN_X} cy={SUN_Y} r={SUN_R * 3} fill="url(#tbSunHaze)" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI * 2) / 12 - Math.PI / 2;
      const inner = SUN_R * 1.16;
      const outer = SUN_R * (i % 2 === 0 ? 1.98 : 1.56);
      const half = 0.05;
      const p = (r: number, ang: number) => `${SUN_X + Math.cos(ang) * r},${SUN_Y + Math.sin(ang) * r}`;
      return <path key={i} d={`M${p(inner, a - half)} L${p(outer, a)} L${p(inner, a + half)} Z`} fill="url(#tbRay)" />;
    })}
    <circle cx={SUN_X} cy={SUN_Y} r={SUN_R} fill="url(#tbSunCore)" />
  </svg>
);

export const ThumbBlendingPortrait: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <RocketWorld bare />
    <Sun />

    <div
      style={{
        position: "absolute", ...C.badge, color: palette.ink,
      }}
    >
      2 SOUNDS<br /><span style={C.badgeSub}>1 WORD</span>
    </div>

    {/* the headline STACKS in portrait — one line would have to shrink to fit */}
    <div
      style={{
        position: "absolute", left: HEAD_L, top: HEAD_TOP, width: HEAD_W, textAlign: "center",
        fontSize: C.head.fontSize, fontWeight: C.head.fontWeight,
        lineHeight: C.head.lineHeight, letterSpacing: C.head.letterSpacing, color: palette.ink,
        textShadow: C.head.textShadow,
      }}
    >
      CV · VC<br />BLENDING
    </div>

    <div
      style={{
        position: "absolute", left: HEAD_L, top: PAIR_TOP, width: HEAD_W,
        display: "flex", justifyContent: "center", alignItems: "center", gap: PAIR_GAP,
      }}
    >
      <Block text="a" vowel size={CARD} lit />
      <Block text="t" vowel={false} size={CARD} lit />
    </div>

    <div
      style={{
        position: "absolute", left: HEAD_L, top: ARROW_TOP, width: HEAD_W, textAlign: "center",
        fontSize: ARROW, fontWeight: 800, color: palette.inkSoft, lineHeight: 1,
      }}
    >
      ↓
    </div>

    <div style={{ position: "absolute", left: HEAD_L, top: CAP_TOP, width: HEAD_W, display: "flex", justifyContent: "center" }}>
      <WordCapsule word="at" size={CAPSULE} lit />
    </div>

    <Img
      src={staticFile("mascot.png")}
      style={{ position: "absolute", left: C.mascot.left, bottom: MASCOT_BOTTOM, width: MASCOT_W, height: "auto" }}
    />
    <Img
      src={staticFile("logo.png")}
      style={{ position: "absolute", ...C.logo, height: "auto" }}
    />
  </AbsoluteFill>
);
