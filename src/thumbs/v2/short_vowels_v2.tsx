import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VOWELS } from "../../data/shortvowels";
import { font, hex } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── Short Vowels · cover v2 (1280×720) ──────────────────────────────────────
//   npx remotion still thumb-v2-short-vowels out/thumb_v2/short_vowels.png
//
// v1 draws five 156×172 cards on a pale sky, plus five birds, plus a subtitle — three
// things competing at a size where none survive.
//
// The first v2 attempt kept five separate cards and made them bigger. The stage
// assertion rejected it: five cards at 196 wide need 1068px and the stage is 794. That
// was the right rejection for the right reason — five cards is five objects, and this
// cover set exists because v1 had too many objects.
//
// So the five letters live on ONE white bar. At 210px that reads as a single bright
// block with letters in it, which is exactly the goal: one subject, unmissable. The
// per-vowel colours from the lesson (A red, E orange, I purple, O green, U blue) stay
// exact, on white, so the colour code the video teaches survives intact.

const BAR_W = 780;
const BAR_H = 214;
const BAR_X = stageCx - BAR_W / 2;
const BAR_Y = 268;
assertInStage("vowel bar", BAR_X, BAR_X + BAR_W);

const SLOT = BAR_W / 5;

export const ThumbV2ShortVowels: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.vowels, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: BAR_X - 70,
        top: BAR_Y - 66,
        width: BAR_W + 140,
        height: BAR_H + 140,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.15), rgba(255,255,255,0))",
      }}
    />

    <div style={badge}>
      QUICK<br />
      <span style={badgeSub}>SOUND!</span>
    </div>

    <div style={{ ...head, fontSize: headSize("SHORT VOWELS".length) }}>SHORT VOWELS</div>

    {/* ONE white block, five letters inside it */}
    <div
      style={{
        position: "absolute",
        left: BAR_X,
        top: BAR_Y,
        width: BAR_W,
        height: BAR_H,
        background: "#FFFFFF",
        borderRadius: 46,
        boxShadow: "0 22px 46px rgba(0,0,0,0.46)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {VOWELS.map((v) => {
        const c = hex(v.color);
        return (
          <div
            key={v.letter}
            style={{
              width: SLOT,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 132, fontWeight: 800, color: c, lineHeight: 1 }}>{v.letter}</span>
            {/* a colour bar under each letter — carries the code at sizes where the
                letter's own colour starts to wash out */}
            <span style={{ width: SLOT * 0.44, height: 10, borderRadius: 5, background: c }} />
          </div>
        );
      })}
    </div>

    <Img
      src={staticFile("mascot.png")}
      style={{
        position: "absolute",
        left: MASCOT.left,
        bottom: MASCOT.bottom,
        width: MASCOT.width,
        height: "auto",
        filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
      }}
    />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
