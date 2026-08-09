import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── MILESTONE · Read Your First Sentences · cover v2 (1280×720) ─────────────
//   npx remotion still thumb-v2-first-sentences out/thumb_v2/first_sentences.png
//
// The milestone is the first time a child reads a whole SENTENCE, so the cover is a whole
// sentence — short enough to actually be read at a 210px tile, which "The cat sat on a
// mat." is not. Three words and the picture they mean.
//
// The headline is the child's line rather than the lesson's name: "I CAN READ!" is what
// the parent is being sold, and "FIRST SENTENCES" at 15 characters would run under the
// badge anyway (the badge owns x0–213 and the headline is centred across the full 1280).

const PIC = 230;
const MID = 40;
const CHIP_H = 132;
const CHIPS: { w: string; width: number }[] = [
  { w: "The", width: 150 }, { w: "cat", width: 150 }, { w: "sat.", width: 170 },
];
const CGAP = 14;
const CHIPS_W = CHIPS.reduce((s, c) => s + c.width, 0) + CGAP * (CHIPS.length - 1);
const ROW_W = PIC + MID + CHIPS_W;
const ROW_X = stageCx - ROW_W / 2;
const ROW_Y = 300;
assertInStage("cat + sentence", ROW_X, ROW_X + ROW_W);

const CHIPS_X = ROW_X + PIC + MID;
const CHIPS_Y = ROW_Y + (PIC - CHIP_H) / 2;
const INK = "#04302E";
// the two helper words are quieter than the word that carries the meaning
const HELPER = new Set(["The"]);

export const ThumbV2FirstSentences: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.sentences, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: ROW_X - 80, top: ROW_Y - 66, width: ROW_W + 160, height: PIC + 132,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.17), rgba(255,255,255,0))",
    }} />

    <div style={badge}>MILESTONE<br /><span style={badgeSub}>FIRST SENTENCES</span></div>
    <div style={{ ...head, fontSize: headSize("I CAN READ!".length, 112) }}>I CAN READ!</div>

    {/* what the sentence means, before a word of it is read */}
    <div style={{
      position: "absolute", left: ROW_X, top: ROW_Y, width: PIC, height: PIC,
      background: "#FFFFFF", borderRadius: 36, boxShadow: "0 22px 44px rgba(0,0,0,0.44)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Img src={staticFile("letters/cat.png")} style={{ width: PIC * 0.8, height: PIC * 0.8, objectFit: "contain" }} />
    </div>

    {/* …and the sentence itself, as separate words, because that is how it is read */}
    {CHIPS.map((c, i) => {
      const x = CHIPS_X + CHIPS.slice(0, i).reduce((s, p) => s + p.width + CGAP, 0);
      const quiet = HELPER.has(c.w);
      return (
        <div key={c.w} style={{
          position: "absolute", left: x, top: CHIPS_Y, width: c.width, height: CHIP_H, boxSizing: "border-box",
          background: quiet ? "#DCEFEA" : "#FFFFFF",
          border: `9px solid ${quiet ? "#8FBDB4" : "#F2A81C"}`, borderRadius: 26,
          boxShadow: "0 16px 32px rgba(0,0,0,0.40)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 62, fontWeight: 800, color: INK, lineHeight: 1,
        }}>{c.w}</div>
      );
    })}

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
