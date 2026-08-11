import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";
import { LANE, Lane, bands } from "../components/WordLane";

// ── L6 · Word Families — covers v1 (1280×720 and 1080×1920) ─────────────────
//   npx remotion still thumb-l6 out/thumb_l6/l6.png
//   npx remotion still thumb-l6-916 out/thumb_l6/l6_916.png
//
// Wears the video's own world — Word Family Lane, the real component, house and
// doorplate included — with the channel's v1 geometry from cover(): gold badge, dark-ink
// headline with the house stroke, mascot bottom-left, logo bottom-right.
//
// ONE key visual: the mechanism. The ending `at` bolted to a big tile, the front letter
// `c` beside it, and `b` `h` `r` queueing above — change the front, keep the ending.
// Five elements, readable at 120px.

const Tile: React.FC<{ ch: string; x: number; y: number; s: number; gold?: boolean; dim?: boolean }> =
  ({ ch, x, y, s, gold = false, dim = false }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: s * (ch.length > 1 ? 1.5 : 1), height: s,
      borderRadius: s * 0.2, background: gold ? LANE.door : dim ? "rgba(255,248,233,0.6)" : LANE.cream,
      border: `${Math.max(4, s * 0.05)}px solid ${LANE.ink}`, boxSizing: "border-box",
      boxShadow: `0 ${s * 0.05}px 0 ${LANE.ink}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: s * 0.58, color: LANE.ink,
    }}>{ch}</div>
  );

/** a line from a letter card to the ending card — the join the user drew */
const Join: React.FC<{ x1: number; y1: number; x2: number; y2: number; w?: number }> = ({ x1, y1, x2, y2, w = 7 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <div style={{
      position: "absolute", left: x1, top: y1 - w / 2, width: len, height: w,
      borderRadius: w, background: LANE.doorDark,
      transformOrigin: "0 50%", transform: `rotate(${ang}deg)`,
    }} />
  );
};

const Cover: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const W = portrait ? 1080 : 1280;
  const H = portrait ? 1920 : 720;
  const c = cover(W, H);
  const b = bands(W, H);
  const LETTERS = ["c", "b", "h", "r"];

  // PORTRAIT — the fan: letters in a column (down + left per review), ending card right.
  // LANDSCAPE — top row of letters, the ending card centred BELOW, joins running down;
  // the whole diagram centred between the headline and the mascot.
  const S = portrait ? 150 : 110;
  const GAP = portrait ? 26 : 24;
  const AT = portrait ? 195 : 180;
  const atW = AT * 1.35;

  // portrait fan geometry
  const colX = W * 0.065;
  const colH = LETTERS.length * S + (LETTERS.length - 1) * GAP;
  const midY = H * 0.535;
  const colY = midY - colH / 2;
  const atX = W * 0.310;
  // landscape rake geometry
  const rowW = LETTERS.length * S + (LETTERS.length - 1) * GAP;
  const rowX = (W - rowW) / 2;
  const rowY = 245;
  const atY2 = rowY + S + 70;
  const atX2 = (W - atW) / 2;
  if (portrait && atX + atW > b.contentR - 12) throw new Error("l6 cover: portrait at-card overflows");
  if (!portrait && atY2 + AT > H - 40) throw new Error("l6 cover: landscape at-card overflows");

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Lane b={b} rime="at" noMark />
      <div style={{
        position: "absolute", left: 0, top: (portrait ? colY : rowY) - 60,
        width: W, height: (portrait ? colH : AT + S + 70) + 120,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.6), rgba(255,255,255,0))",
      }} />

      <div style={{ position: "absolute", ...c.badge, color: palette.ink }}>
        LEVEL 6<br /><span style={c.badgeSub}>81 WORDS</span>
      </div>
      <div style={{
        position: "absolute", left: 0, top: portrait ? c.head.top - 60 : 40, width: W, textAlign: "center",
        fontSize: portrait ? c.headSize("FAMILIES".length) : c.headSize("WORD FAMILIES".length),
        fontWeight: c.head.fontWeight, lineHeight: c.head.lineHeight, whiteSpace: "pre-line",
        letterSpacing: c.head.letterSpacing, textShadow: c.head.textShadow, color: palette.ink,
      }}>{portrait ? "WORD\nFAMILIES" : "WORD FAMILIES"}</div>

      {portrait ? (
        <>
          {LETTERS.map((_, i) => (
            <Join key={i} x1={colX + S} y1={colY + i * (S + GAP) + S / 2} x2={atX + 6} y2={midY} w={9} />
          ))}
          {LETTERS.map((ch, i) => <Tile key={ch} ch={ch} x={colX} y={colY + i * (S + GAP)} s={S} />)}
          <Tile ch="at" x={atX} y={midY - AT / 2} s={AT} gold />
        </>
      ) : (
        <>
          {LETTERS.map((_, i) => (
            <Join key={i} x1={rowX + i * (S + GAP) + S / 2} y1={rowY + S} x2={W / 2} y2={atY2 + 6} w={7} />
          ))}
          {LETTERS.map((ch, i) => <Tile key={ch} ch={ch} x={rowX + i * (S + GAP)} y={rowY} s={S} />)}
          <Tile ch="at" x={atX2} y={atY2} s={AT} gold />
        </>
      )}

      <Img src={staticFile("mascot.png")} style={{
        position: "absolute", left: c.mascot.left, bottom: c.mascot.bottom, width: c.mascot.width, height: "auto",
        filter: "drop-shadow(0 14px 26px rgba(0,0,0,0.4))",
      }} />
      <Img src={staticFile("logo.png")} style={{
        position: "absolute", right: c.logo.right, bottom: c.logo.bottom, width: c.logo.width, height: "auto",
      }} />
    </AbsoluteFill>
  );
};

export const ThumbL6: React.FC = () => <Cover portrait={false} />;
export const ThumbL6Portrait: React.FC = () => <Cover portrait />;
