import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── L5 Spelling Rules · Part 2 · cover v2 (1280×720) ────────────────────────
//   npx remotion still thumb-v2-l5-p2 out/thumb_v2/l5_p2.png
//
// The whole video is one question: does this word end in ng or nk? So the cover asks it,
// with the minimal pair that answers it — ring above rink, identical except the last
// letter, which is the only thing that changes and is therefore the only thing coloured.
//
// A question headline is a deliberate CTR bet: it is answerable in the video and the
// viewer cannot answer it from the tile alone.

const TILE = 130;
const GAP = 14;
const ROW_W = TILE * 4 + GAP * 3;
const ROW_X = stageCx - ROW_W / 2;
const TOP_Y = 288;
const ROW_GAP = 22;
assertInStage("ring / rink", ROW_X, ROW_X + ROW_W);

const INK = "#173A2A";
const NG = "#F2A81C";   // the sound that carries — the bell's gold
const NK = "#E0552B";   // the sound the /k/ stops — the stopper's red
const WORDS: { word: string; endColour: string }[] = [
  { word: "ring", endColour: NG },
  { word: "rink", endColour: NK },
];

export const ThumbV2L5P2: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.l5p2, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: ROW_X - 90, top: TOP_Y - 54,
      width: ROW_W + 180, height: TILE * 2 + ROW_GAP + 108,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
    }} />

    <div style={badge}>LEVEL 5<br /><span style={badgeSub}>PART 2</span></div>
    <div style={{ ...head, top: 134, fontSize: 118 }}>SPELLING RULES</div>

    {WORDS.map((w, r) =>
      w.word.split("").map((ch, i) => {
        const last = i === w.word.length - 1;
        return (
          <div key={`${r}-${i}`} style={{
            position: "absolute",
            left: ROW_X + i * (TILE + GAP),
            top: TOP_Y + r * (TILE + ROW_GAP),
            width: TILE, height: TILE, boxSizing: "border-box",
            background: last ? w.endColour : "#FFFFFF",
            border: `10px solid ${last ? w.endColour : INK}`,
            borderRadius: 26, boxShadow: "0 16px 32px rgba(0,0,0,0.42)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 94, fontWeight: 800, color: last ? "#FFFFFF" : INK, lineHeight: 1,
          }}>{ch}</div>
        );
      })
    )}
  
    {/* the one letter that differs is the one the whole lesson turns on */}
    <div style={{
      position: "absolute", left: ROW_X + 3 * (TILE + GAP) - 9, top: TOP_Y - 9,
      width: TILE + 18, height: TILE * 2 + ROW_GAP + 18,
      border: "7px dashed rgba(255,255,255,0.85)", borderRadius: 34,
    }} />

    <div style={{
      position: "absolute", left: ROW_X, top: TOP_Y + TILE * 2 + ROW_GAP + 12, width: ROW_W,
      textAlign: "center", fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.92)",
      letterSpacing: 0.6, textShadow: "0 3px 10px rgba(0,0,0,0.55)",
    }}>ng or nk ?</div>

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
