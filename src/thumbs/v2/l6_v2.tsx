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
const TILE = 170;
const GAP = 18;
const ROW_W = TILE + GAP + TILE * 1.5;
const ROW_X = stageCx - ROW_W / 2;
const ROW_Y = 320;
assertInStage("c + at", ROW_X, ROW_X + ROW_W);
const Q = 110;
const QUEUE_W = Q * 3 + 28;
const Q_X = stageCx - QUEUE_W / 2;
const Q_Y = ROW_Y - Q - 34;
assertInStage("queue", Q_X, Q_X + QUEUE_W);

const Tile: React.FC<{ ch: string; x: number; y: number; s: number; gold?: boolean; dim?: boolean }> =
  ({ ch, x, y, s, gold = false, dim = false }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: s * (ch.length > 1 ? 1.5 : 1), height: s,
      borderRadius: s * 0.2, background: gold ? "#F4C33F" : dim ? "rgba(255,255,255,0.34)" : "#FFF8E9",
      border: `${Math.max(5, s * 0.055)}px solid #142A18`, boxSizing: "border-box",
      boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: s * 0.58, color: "#142A18",
    }}>{ch}</div>
  );

export const ThumbV2L6: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND_L6, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: ROW_X - 110, top: Q_Y - 60, width: ROW_W + 220, height: ROW_Y - Q_Y + TILE + 120,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.18), rgba(255,255,255,0))",
    }} />
    <div style={badge}>LEVEL 6<br /><span style={badgeSub}>81 WORDS</span></div>
    <div style={{ ...head, top: 134, fontSize: 118 }}>WORD FAMILIES</div>

    {["b", "h", "r"].map((ch, i) => <Tile key={ch} ch={ch} x={Q_X + i * (Q + 14)} y={Q_Y} s={Q} dim />)}
    <Tile ch="c" x={ROW_X} y={ROW_Y} s={TILE} />
    <Tile ch="at" x={ROW_X + TILE + GAP} y={ROW_Y} s={TILE} gold />

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
