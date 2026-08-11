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
const ROW_Y = 284;
const ROW_W = LETTERS.length * S + (LETTERS.length - 1) * GAP;
const ROW_X = stageCx - ROW_W / 2;
const AT_Y = ROW_Y + S + 56;   // 284+116+56+210 = 666, inside the 686 floor
const AT_W = AT * 1.35;
const AT_X = stageCx - AT_W / 2;
assertInStage("letter row", ROW_X, ROW_X + ROW_W);
assertInStage("at card", AT_X, AT_X + AT_W);
if (AT_Y + AT > 720 - 34) throw new Error("v2 l6: at card too low");

const Tile: React.FC<{ ch: string; x: number; y: number; s: number; gold?: boolean }> =
  ({ ch, x, y, s, gold = false }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: s * (ch.length > 1 ? 1.35 : 1), height: s,
      borderRadius: s * 0.2, background: gold ? "#F4C33F" : "#FFF8E9",
      border: `${Math.max(5, s * 0.055)}px solid #142A18`, boxSizing: "border-box",
      boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: s * 0.56, color: "#142A18",
    }}>{ch}</div>
  );

const Join: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return <div style={{ position: "absolute", left: x1, top: y1 - 4, width: len, height: 8, borderRadius: 8,
    background: "rgba(255,248,233,0.75)", transformOrigin: "0 50%", transform: `rotate(${ang}deg)` }} />;
};

export const ThumbV2L6: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND_L6, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: ROW_X - 110, top: ROW_Y - 56, width: ROW_W + 220, height: S + 64 + AT + 110,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
    }} />
    <div style={badge}>LEVEL 6<br /><span style={badgeSub}>81 WORDS</span></div>
    <div style={{ ...head, top: 84, left: 40, fontSize: 118 }}>WORD FAMILIES</div>

    {LETTERS.map((_, i) => (
      <Join key={i} x1={ROW_X + i * (S + GAP) + S / 2} y1={ROW_Y + S} x2={stageCx} y2={AT_Y + 8} />
    ))}
    {LETTERS.map((ch, i) => <Tile key={ch} ch={ch} x={ROW_X + i * (S + GAP)} y={ROW_Y} s={S} />)}
    <Tile ch="at" x={AT_X} y={AT_Y} s={AT} gold />

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
