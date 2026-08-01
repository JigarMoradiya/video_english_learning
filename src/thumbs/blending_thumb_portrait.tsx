import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Block, WordCapsule } from "../components/RocketTower";
import { font, palette } from "../data/tokens";

// ── L3 · CV·VC Blending thumbnail, portrait (1080×1920) ──────────────────────
//   npx remotion still src/index.ts thumb-blending-9x16 out/…/thumb_l3_blending_9x16.png
//
// Draws its OWN sky rather than mounting <RocketWorld/>, for the same reason
// shortvowels_thumb_portrait draws its own and only borrows <Bird/>: a world is composed
// for a lesson frame, so it brings its own small mascot on the launch deck and its own
// CV·VC key, and a cover needs neither — it needs ONE big mascot in the corner. Mounting
// the world put two bears on screen and clipped the one that mattered.
//
// Positions, sizes and weights follow shortvowels_thumb_portrait so the channel's covers
// look like a set: badge top-left at -11deg, mascot bottom-left, logo bottom-right, all
// expressed as fractions of the frame.
const W = 1080;
const H = 1920;
const GOLD = "#FFC42A";

const SUN_X = W * 0.845;
const SUN_Y = H * 0.085;
const SUN_R = W * 0.072;

const PAD_Y = H * 0.775;          // the launch-pad deck
const GROUND_Y = H * 0.90;

const HEAD_TOP = H * 0.175;
const HEAD_SIZE = H * 0.062;
const HEAD_H = HEAD_SIZE * 2 * 1.04;

const CARD = 292;
const CAPSULE = 392;
const PAIR_GAP = 34;
const PAIR_TOP = H * 0.335;
const ARROW = 92;
const ARROW_TOP = PAIR_TOP + CARD + 10;
const CAP_TOP = ARROW_TOP + ARROW + 6;
const CAP_H = Math.round(CAPSULE * 0.62);

// mascot.png is 923×1063 with ~7px of bottom padding, so its feet are the last pixel row
const MASCOT_W = W * 0.34;
const MASCOT_H = MASCOT_W * (1063 / 923);
const MASCOT_BOTTOM = H * 0.022;

if (HEAD_TOP + HEAD_H + H * 0.02 > PAIR_TOP) {
  throw new Error(`thumb: headline ends ${HEAD_TOP + HEAD_H}, the pair starts ${PAIR_TOP}`);
}
if (CAP_TOP + CAP_H + 30 > PAD_Y) {
  throw new Error(`thumb: the word ends ${CAP_TOP + CAP_H}, the deck is at ${PAD_Y}`);
}
if (H - MASCOT_BOTTOM - MASCOT_H < CAP_TOP + CAP_H) {
  throw new Error(`thumb: mascot top ${H - MASCOT_BOTTOM - MASCOT_H} rises into the word card`);
}
if (2 * CARD + PAIR_GAP > W - 120) {
  throw new Error(`thumb: the pair is ${2 * CARD + PAIR_GAP}px wide in a ${W}px frame`);
}

const STEEL = "#9FB3C8";
const STEEL_D = "#6B7F94";

const Sky: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="tbSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DCEEFB" />
        <stop offset="42%" stopColor="#EAF4FC" />
        <stop offset="82%" stopColor="#FFF3DF" />
        <stop offset="100%" stopColor="#FFE9C9" />
      </linearGradient>
      {/* a real sun: white core -> yellow -> orange rim, with a warm haze around it */}
      <radialGradient id="tbSunCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="30%" stopColor="#FFEFA8" />
        <stop offset="68%" stopColor="#FFC93F" />
        <stop offset="100%" stopColor="#FF9E2C" />
      </radialGradient>
      <radialGradient id="tbSunHaze" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD37A" stopOpacity={0.55} />
        <stop offset="55%" stopColor="#FFE3AC" stopOpacity={0.22} />
        <stop offset="100%" stopColor="#FFF0D2" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="tbRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFC24A" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#FFA531" stopOpacity={0.12} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#tbSky)" />

    {/* SUN — haze, then 12 tapered rays alternating long/short, then the disc */}
    <circle cx={SUN_X} cy={SUN_Y} r={SUN_R * 3.1} fill="url(#tbSunHaze)" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI * 2) / 12 - Math.PI / 2;
      const inner = SUN_R * 1.18;
      const outer = SUN_R * (i % 2 === 0 ? 2.05 : 1.62);
      const half = 0.055;
      const p = (r: number, ang: number) => `${SUN_X + Math.cos(ang) * r},${SUN_Y + Math.sin(ang) * r}`;
      return <path key={i} d={`M${p(inner, a - half)} L${p(outer, a)} L${p(inner, a + half)} Z`} fill="url(#tbRay)" />;
    })}
    <circle cx={SUN_X} cy={SUN_Y} r={SUN_R} fill="url(#tbSunCore)" />

    <g fill="#FFFFFF" opacity={0.85}>
      <ellipse cx={W * 0.2} cy={H * 0.14} rx={104} ry={30} />
      <ellipse cx={W * 0.28} cy={H * 0.135} rx={72} ry={24} />
      <ellipse cx={W * 0.72} cy={H * 0.245} rx={86} ry={26} />
    </g>

    {/* gantry + rocket down the LEFT edge, so the centre stays clear for the sum */}
    <g>
      <rect x={54} y={H * 0.115} width={16} height={PAD_Y - H * 0.115} fill={STEEL} />
      <rect x={150} y={H * 0.115} width={16} height={PAD_Y - H * 0.115} fill={STEEL} />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={54} y={H * 0.13 + i * ((PAD_Y - H * 0.13) / 11)} width={112} height={8} fill={STEEL_D} opacity={0.7} />
      ))}
      <rect x={92} y={H * 0.16} width={36} height={PAD_Y - H * 0.16 - 10} rx={8} fill="#F5C243" />
    </g>
    <g>
      <path d={`M110 ${PAD_Y - 470} q 52 96 52 232 l 0 232 l -104 0 l 0 -232 q 0 -136 52 -232 z`} fill="#FFFFFF" stroke="#D9E2EC" strokeWidth={3} />
      <path d={`M110 ${PAD_Y - 470} q 34 66 44 152 l -88 0 q 10 -86 44 -152 z`} fill="#E8514B" />
      <circle cx={110} cy={PAD_Y - 210} r={26} fill="#CFE6F7" stroke="#9EC5E0" strokeWidth={5} />
      <path d={`M58 ${PAD_Y - 66} l 0 -104 l -34 104 z`} fill="#4E8FD1" />
      <path d={`M162 ${PAD_Y - 66} l 0 -104 l 34 104 z`} fill="#4E8FD1" />
    </g>

    {/* deck, hazard strip, sand */}
    <rect x={0} y={PAD_Y} width={W} height={GROUND_Y - PAD_Y} fill="#8FA3B6" />
    <rect x={0} y={PAD_Y} width={W} height={10} fill="#7C90A4" />
    {Array.from({ length: Math.ceil(W / 52) }, (_, i) => (
      <path key={i} d={`M${i * 52} ${GROUND_Y - 34} l 26 0 l -26 34 l -26 0 z`} fill={i % 2 ? "#FFC94D" : STEEL_D} opacity={0.55} />
    ))}
    <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="#F3DCB6" opacity={0.8} />
  </svg>
);

export const ThumbBlendingPortrait: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <Sky />

    <div
      style={{
        position: "absolute", left: W * 0.024, top: H * 0.016, transform: "rotate(-11deg)",
        background: GOLD, color: palette.ink, borderRadius: W * 0.019,
        padding: `${H * 0.008}px ${W * 0.021}px`,
        fontSize: H * 0.032, fontWeight: 800, lineHeight: 1.05, textAlign: "center",
        boxShadow: "0 10px 24px rgba(30,36,56,0.30)",
      }}
    >
      2 SOUNDS<br /><span style={{ fontSize: H * 0.023 }}>1 WORD</span>
    </div>

    {/* the headline STACKS in portrait — one line would have to shrink to fit */}
    <div
      style={{
        position: "absolute", left: 0, top: HEAD_TOP, width: W, textAlign: "center",
        fontSize: HEAD_SIZE, fontWeight: 800, color: palette.ink, lineHeight: 1.04,
      }}
    >
      CV · VC<br />BLENDING
    </div>

    <div
      style={{
        position: "absolute", left: 0, top: PAIR_TOP, width: W,
        display: "flex", justifyContent: "center", alignItems: "center", gap: PAIR_GAP,
      }}
    >
      <Block text="a" vowel size={CARD} lit />
      <Block text="t" vowel={false} size={CARD} lit />
    </div>

    <div
      style={{
        position: "absolute", left: 0, top: ARROW_TOP, width: W, textAlign: "center",
        fontSize: ARROW, fontWeight: 800, color: palette.inkSoft, lineHeight: 1,
      }}
    >
      ↓
    </div>

    <div style={{ position: "absolute", left: 0, top: CAP_TOP, width: W, display: "flex", justifyContent: "center" }}>
      <WordCapsule word="at" size={CAPSULE} lit />
    </div>

    <Img
      src={staticFile("mascot.png")}
      style={{ position: "absolute", left: W * 0.005, bottom: MASCOT_BOTTOM, width: MASCOT_W, height: "auto" }}
    />
    <Img
      src={staticFile("logo.png")}
      style={{ position: "absolute", right: W * 0.022, bottom: H * 0.018, width: W * 0.13, height: "auto" }}
    />
  </AbsoluteFill>
);
