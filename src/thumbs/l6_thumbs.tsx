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

const Cover: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const W = portrait ? 1080 : 1280;
  const H = portrait ? 1920 : 720;
  const c = cover(W, H);
  const b = bands(W, H);

  // the key visual, centred in the space LEFT of the house (which bands puts at houseL)
  const S = portrait ? 190 : 150;
  const cx = portrait ? (b.contentL + b.contentR) / 2 : b.houseL / 2 + 30;
  const rowY = portrait ? H * 0.435 : H * 0.44;
  const rowW = S + 14 + S * 1.5;
  const queue = portrait ? S * 0.72 : S * 0.62;
  const queueY = rowY - queue - (portrait ? 40 : 26);
  const queueW = queue * 3 + 24;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Lane b={b} rime="at" />

      {/* headline band gets a soft lift so the ink always reads on the sky */}
      <div style={{
        position: "absolute", left: 0, top: c.head.top - (portrait ? 40 : 30), width: W,
        height: portrait ? H * 0.30 : H * 0.36,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0))",
      }} />

      <div style={{ position: "absolute", ...c.badge, color: palette.ink }}>
        LEVEL 6<br /><span style={c.badgeSub}>81 WORDS</span>
      </div>

      <div style={{
        position: "absolute", left: 0, top: portrait ? c.head.top : 40, width: W, textAlign: "center",
        fontSize: portrait ? c.headSize("FAMILIES".length) : c.headSize("WORD FAMILIES".length),
        fontWeight: c.head.fontWeight, lineHeight: c.head.lineHeight, whiteSpace: "pre-line",
        letterSpacing: c.head.letterSpacing, textShadow: c.head.textShadow, color: palette.ink,
      }}>{portrait ? "WORD\nFAMILIES" : "WORD FAMILIES"}</div>

      {/* the queue of fronts, then the built word: change the front, keep the ending */}
      {["b", "h", "r"].map((ch, i) => (
        <Tile key={ch} ch={ch} x={cx - queueW / 2 + i * (queue + 12)} y={queueY} s={queue} dim />
      ))}
      <Tile ch="c" x={cx - rowW / 2} y={rowY} s={S} />
      <Tile ch="at" x={cx - rowW / 2 + S + 14} y={rowY} s={S} gold />

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
