import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── L5 Spelling Rules · Part 1 · cover v2 (1280×720) ────────────────────────
//   npx remotion still thumb-v2-l5-p1 out/thumb_v2/l5_p1.png
//
// Part 1 teaches TWO rules and the cover shows both, one per row:
//   row 1  the Floss rule — `buzz`, with a bracket over the two z's so the doubling is
//          something you SEE rather than something you have to read
//   row 2  the c / k / ck rule — the three spellings of one sound
//
// Two rows rather than one crowded line: at a 210px tile a single row of seven tiles is
// grey mush, whereas two rows of four read as two facts.
//
// Headline kept SHORT: the badge occupies x0–213 and the headline is centred across the
// full 1280, so anything past ~11 characters runs underneath it.

const TILE = 110;
const GAP = 12;
const WIDE = 160;                       // `ck` is two glyphs, so its tile is wider
const R1_W = TILE * 4 + GAP * 3;
const R2_W = TILE * 2 + GAP * 2 + WIDE;
const R1_X = stageCx - R1_W / 2;
const R2_X = stageCx - R2_W / 2;
const R1_Y = 348;   // headline ends 257, ×2 268-314, bracket 318-344
const R2_Y = 512;
const LBL = 30;                         // the name of each rule, under its own row
assertInStage("buzz", R1_X, R1_X + R1_W);
assertInStage("c k ck", R2_X, R2_X + R2_W);

const BLUE = "#2D7FE0";
const GOLD_T = "#F2A81C";
const ROW1 = [
  { ch: "b", c: BLUE }, { ch: "u", c: BLUE }, { ch: "z", c: GOLD_T }, { ch: "z", c: GOLD_T },
];
const ROW2 = [
  { ch: "c", c: BLUE, w: TILE }, { ch: "k", c: BLUE, w: TILE }, { ch: "ck", c: GOLD_T, w: WIDE },
];

/** names the rule that row is showing — the user's own words for it */
const RuleName: React.FC<{ x: number; w: number; y: number; text: string }> = ({ x, w, y, text }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, textAlign: "center",
    fontSize: LBL, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: 0.6,
    textShadow: "0 3px 10px rgba(0,0,0,0.55)",
  }}>{text}</div>
);

const Tile: React.FC<{ ch: string; c: string; x: number; y: number; w: number }> = ({ ch, c, x, y, w }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, height: TILE, boxSizing: "border-box",
    background: "#FFFFFF", border: `10px solid ${c}`, borderRadius: 26,
    boxShadow: "0 16px 32px rgba(0,0,0,0.42)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: ch.length > 1 ? 74 : 90, fontWeight: 800, color: c, lineHeight: 1,
  }}>{ch}</div>
);

export const ThumbV2L5P1: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.l5p1, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: R1_X - 90, top: R1_Y - 92, width: R1_W + 180, height: TILE * 2 + 260,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
    }} />

    <div style={badge}>LEVEL 5<br /><span style={badgeSub}>PART 1</span></div>
    <div style={{ ...head, top: 134, fontSize: 118 }}>SPELLING RULES</div>

    {/* the bracket that ties the two z's together — the doubling, drawn */}
    <div style={{
      position: "absolute", left: R1_X + (TILE + GAP) * 2 - 10, top: R1_Y - 30,
      width: TILE * 2 + GAP + 20, height: 26,
      borderTop: `9px solid ${GOLD_T}`, borderLeft: `9px solid ${GOLD_T}`, borderRight: `9px solid ${GOLD_T}`,
      borderRadius: "16px 16px 0 0",
    }} />
    <div style={{
      position: "absolute", left: R1_X + (TILE + GAP) * 2 - 10, top: R1_Y - 80,
      width: TILE * 2 + GAP + 20, textAlign: "center",
      fontSize: 46, fontWeight: 800, color: GOLD_T, textShadow: "0 5px 0 rgba(0,0,0,0.35)",
    }}>×2</div>

    {ROW1.map((t, i) => <Tile key={`a${i}`} ch={t.ch} c={t.c} x={R1_X + i * (TILE + GAP)} y={R1_Y} w={TILE} />)}
    <RuleName x={R1_X} w={R1_W} y={R1_Y + TILE + 10} text="DOUBLE IT" />
    <RuleName x={R2_X} w={R2_W} y={R2_Y + TILE + 10} text="c · k · ck" />
    {ROW2.map((t, i) => {
      const x = R2_X + ROW2.slice(0, i).reduce((s, p) => s + p.w + GAP, 0);
      return <Tile key={`b${i}`} ch={t.ch} c={t.c} x={x} y={R2_Y} w={t.w} />;
    })}

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
