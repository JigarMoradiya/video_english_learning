import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";
import { FAIR } from "../components/QuizFair";

// ── L6 · Word Families — Practice — covers v1 (1280×720 and 1080×1920) ──────
//   npx remotion still thumb-l6-practice out/thumb_l6_practice/l6_practice.png
//   npx remotion still thumb-l6-practice-916 out/thumb_l6_practice/l6_practice_916.png
//
// Wears the video's own world — the Quiz Fair booth — but the fair's own sky is a dark
// night gradient, and v1 covers run dark ink on a pale ground everywhere else in the
// channel. So this cover shows the fair's WARM elements (the cream ticket, the gold
// correct-answer glow, a red-and-cream awning band) rather than the night sky, the same
// way the real booth counter reads bright even though the fairground around it is dark.
//
// ONE key visual: the game itself. A picture, and the three letter choices from the
// app's own options for that word — the middle one glowing gold, exactly how the board
// marks a correct pick.

const OPTS = ["b", "c", "h"];
const CORRECT = 1; // "c" — cat

const OptionTile: React.FC<{ ch: string; s: number; correct: boolean }> = ({ ch, s, correct }) => (
  <div style={{
    width: s, height: s * 0.86, borderRadius: s * 0.18,
    background: correct ? FAIR.gold : FAIR.cream,
    border: `${Math.max(4, s * 0.045)}px solid ${FAIR.ink}`, boxSizing: "border-box",
    boxShadow: `0 ${s * 0.07}px 0 ${FAIR.ink}`,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    fontFamily: font.family, fontWeight: 800, fontSize: s * 0.44, color: FAIR.ink,
  }}>
    {ch}
    {correct && <div style={{ fontSize: s * 0.24, marginTop: s * 0.02 }}>✓</div>}
  </div>
);

const Cover: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const W = portrait ? 1080 : 1280;
  const H = portrait ? 1920 : 720;
  const c = cover(W, H);

  const pic = portrait ? 300 : 230;
  const optS = portrait ? 190 : 148;
  const optGap = portrait ? 24 : 18;
  const rowW = 3 * optS + 2 * optGap;

  // LANDSCAPE — picture then the three options, one row, under the headline.
  // PORTRAIT — picture on top, options row below it, both centred.
  const rowY = portrait ? 800 : 340;
  const picX = portrait ? (W - pic) / 2 : W * 0.5 - (pic + 60 + rowW) / 2;
  const optX0 = portrait ? (W - rowW) / 2 : picX + pic + 60;
  const optY = portrait ? rowY + pic + 56 : rowY + (pic - optS * 0.86) / 2;

  if (!portrait && optX0 + rowW > W - 150) throw new Error("l6 practice cover: options overflow logo");
  if (portrait && optY + optS * 0.86 > H - 420) throw new Error("l6 practice cover: options overflow mascot");

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: `linear-gradient(160deg, #FFF6E4 0%, #FFE9B8 62%, #FFD98A 100%)`, overflow: "hidden" }}>
      {/* the awning band — the fair's own red-and-cream stripe, up top like real bunting */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: W, height: H * 0.09,
        background: `repeating-linear-gradient(90deg, ${FAIR.awningA} 0 ${W * 0.05}px, ${FAIR.awningB} ${W * 0.05}px ${W * 0.10}px)`,
        borderBottom: `6px solid ${FAIR.ink}`,
      }} />
      {/* warm glow behind the key visual */}
      <div style={{
        position: "absolute", left: 0, top: rowY - 70, width: W, height: pic + 160,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.65), rgba(255,255,255,0))",
      }} />

      <div style={{ position: "absolute", ...c.badge, color: palette.ink }}>
        LEVEL 6<br /><span style={c.badgeSub}>PRACTICE</span>
      </div>
      <div style={{
        position: "absolute", left: 0, top: c.head.top, width: W, textAlign: "center", whiteSpace: "pre-line",
        fontSize: c.headSize(12), fontWeight: c.head.fontWeight, lineHeight: c.head.lineHeight,
        letterSpacing: c.head.letterSpacing, textShadow: c.head.textShadow, color: palette.ink,
      }}>{"FIND THE\nFIRST LETTER"}</div>

      <div style={{
        position: "absolute", left: picX, top: rowY, width: pic, height: pic,
        background: FAIR.cream, borderRadius: pic * 0.16, border: `${pic * 0.045}px solid ${FAIR.ink}`,
        boxSizing: "border-box", boxShadow: `0 ${pic * 0.06}px 0 ${FAIR.ink}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Img src={staticFile("img/l6/cat.png")} style={{ width: "82%", height: "82%", objectFit: "contain" }} />
      </div>

      <div style={{ position: "absolute", left: optX0, top: optY, display: "flex", gap: optGap }}>
        {OPTS.map((ch, i) => <OptionTile key={ch} ch={ch} s={optS} correct={i === CORRECT} />)}
      </div>

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

export const ThumbL6Practice: React.FC = () => <Cover portrait={false} />;
export const ThumbL6PracticePortrait: React.FC = () => <Cover portrait />;
