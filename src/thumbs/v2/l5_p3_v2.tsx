import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── L5 Spelling Rules · Part 3 · cover v2 (1280×720) ────────────────────────
//   npx remotion still thumb-v2-l5-p3 out/thumb_v2/l5_p3.png
//
// Part 3 teaches TWO things and the cover shows both, one per row:
//   row 1  x is ONE letter that makes TWO sounds
//   row 2  w changes the a next to it into an /o/
//
// Both rows are the same shape — a thing on the left, an arrow, what it becomes — so the
// pair reads as "two transformations" without a word of explanation.
//
// Headline kept SHORT: the badge occupies x0–213 and the headline is centred across the
// full 1280, so anything past ~11 characters runs underneath it.

const T = 120;
const GAP = 12;
const ARROW = 46;
const BIG = 150;

const R1_W = BIG + ARROW + T * 2 + GAP;             // x  →  /k/ /s/
const R2_W = T * 2 + GAP + ARROW + T;               // w a  →  o
const R1_X = stageCx - R1_W / 2;
const R2_X = stageCx - R2_W / 2;
const R1_Y = 292;
const R2_Y = 494;
const LBL = 30;                         // the name of each rule, under its own row
assertInStage("x = two sounds", R1_X, R1_X + R1_W);
assertInStage("w a -> o", R2_X, R2_X + R2_W);

const INK = "#2A0730";
const XG = "#F5C542";     // the letter x — gold, the stage's footlights
const WT = "#3FC7B4";     // the letter w — teal, so it can never be mistaken for x
const VOW = "#5AA8E8";

const Tile: React.FC<{ ch: string; bg: string; fg: string; x: number; y: number; s: number; fs: number }> =
  ({ ch, bg, fg, x, y, s, fs }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: s, height: s, boxSizing: "border-box",
      background: bg, border: `10px solid ${bg === "#FFFFFF" ? fg : INK}`, borderRadius: 28,
      boxShadow: "0 16px 34px rgba(0,0,0,0.44)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 800, color: bg === "#FFFFFF" ? fg : INK, lineHeight: 1,
    }}>{ch}</div>
  );

/** names the rule that row is showing */
const RuleName: React.FC<{ x: number; w: number; y: number; text: string }> = ({ x, w, y, text }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, textAlign: "center",
    fontSize: LBL, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: 0.6,
    textShadow: "0 3px 10px rgba(0,0,0,0.55)",
  }}>{text}</div>
);

const Arrow: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: ARROW, textAlign: "center",
    fontSize: 56, fontWeight: 800, color: "#FFFFFF", textShadow: "0 5px 0 rgba(0,0,0,0.35)",
  }}>→</div>
);

export const ThumbV2L5P3: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.l5p3, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: R1_X - 86, top: R1_Y - 56, width: R1_W + 172, height: BIG + T + 216,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.17), rgba(255,255,255,0))",
    }} />

    <div style={badge}>LEVEL 5<br /><span style={badgeSub}>PART 3</span></div>
    <div style={{ ...head, top: 134, fontSize: 118 }}>SPELLING RULES</div>

    {/* one letter → two sounds */}
    <Tile ch="x" bg={XG} fg={INK} x={R1_X} y={R1_Y} s={BIG} fs={112} />
    <Arrow x={R1_X + BIG} y={R1_Y + BIG / 2 - 34} />
    <Tile ch="/k/" bg="#FFFFFF" fg={INK} x={R1_X + BIG + ARROW} y={R1_Y + (BIG - T) / 2} s={T} fs={50} />
    <Tile ch="/s/" bg="#FFFFFF" fg={INK} x={R1_X + BIG + ARROW + T + GAP} y={R1_Y + (BIG - T) / 2} s={T} fs={50} />
    <RuleName x={R1_X} w={R1_W} y={R1_Y + BIG + 10} text="x = 2 SOUNDS" />

    {/* w changes the a beside it */}
    <Tile ch="w" bg={WT} fg={INK} x={R2_X} y={R2_Y} s={T} fs={80} />
    <Tile ch="a" bg={VOW} fg={INK} x={R2_X + T + GAP} y={R2_Y} s={T} fs={80} />
    <Arrow x={R2_X + T * 2 + GAP} y={R2_Y + T / 2 - 34} />
    <Tile ch="o" bg={WT} fg={INK} x={R2_X + T * 2 + GAP + ARROW} y={R2_Y} s={T} fs={80} />
    <RuleName x={R2_X} w={R2_W} y={R2_Y + T + 10} text="w CHANGES a" />

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
