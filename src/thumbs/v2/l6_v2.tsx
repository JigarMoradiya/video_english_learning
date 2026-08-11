import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── L6 · Word Families · cover v2 (1280×720) ────────────────────────────────
//   npx remotion still thumb-v2-l6 out/thumb_v2/l6.png
//
// Deep sage ground (nothing else in the v2 set is green), white headline, and ONE giant
// key visual: c + at with b and h queueing — the whole mechanism in a glance.

const GROUND_L6 = "linear-gradient(105deg, #12351C 0%, #1F5A31 46%, #2F8A4A 100%)";
const LETTERS = ["c", "b", "h", "r"];
const S = 116, GAP = 16, AT = 210;
const COL_X = 420;
const COL_H = LETTERS.length * S + (LETTERS.length - 1) * GAP;
const MID_Y = 214 + (720 - 34 - 214) / 2;
const COL_Y = MID_Y - COL_H / 2;
const AT_X = 800, AT_W = AT * 1.35;
assertInStage("letter column", COL_X, COL_X + S);
assertInStage("at card", AT_X, AT_X + AT_W);

const Join: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return <div style={{ position: "absolute", left: x1, top: y1 - 4, width: len, height: 8, borderRadius: 8,
    background: "rgba(255,248,233,0.75)", transformOrigin: "0 50%", transform: `rotate(${ang}deg)` }} />;
};

export const ThumbV2L6: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND_L6, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: COL_X - 90, top: COL_Y - 60, width: AT_X + AT_W - COL_X + 180, height: COL_H + 120,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
    }} />
    <div style={badge}>LEVEL 6<br /><span style={badgeSub}>81 WORDS</span></div>
    <div style={{ ...head, top: 134, fontSize: 118 }}>WORD FAMILIES</div>

    {LETTERS.map((_, i) => (
      <Join key={i} x1={COL_X + S} y1={COL_Y + i * (S + GAP) + S / 2} x2={AT_X + 8} y2={MID_Y} />
    ))}
    {LETTERS.map((ch, i) => <Tile key={ch} ch={ch} x={COL_X} y={COL_Y + i * (S + GAP)} s={S} />)}
    <Tile ch="at" x={AT_X} y={MID_Y - AT / 2} s={AT} gold />

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
