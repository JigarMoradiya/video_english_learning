import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, H, MASCOT, STAGE, W, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── Letter Sounds A–Z · cover v2 (1280×720) ─────────────────────────────────
//   npx remotion still thumb-v2-letters-phonics out/thumb_v2/letters_phonics.png
//
// v1 of this cover carries eight elements including a full A–Z tile strip along the
// bottom. At feed size that strip is a grey smear — it cannot be read, it cannot be
// counted, and it costs a fifth of the canvas. It is gone here.
//
// What is left is the promise in one glance: the letter, the sound it makes, and the
// thing it stands for. "Aa" and the ant are the subject; everything else is furniture.

const ANT = 336;          // the ant card — the single largest object in the frame
const GLYPH = 250;        // "Aa" cap height budget
const GAP = 52;
const CARD_R = 40;

// laid out as one row, centred in the stage, so the pair reads as a unit
const ROW_W = GLYPH * 1.28 + GAP + ANT;
const ROW_X = stageCx - ROW_W / 2;
const ROW_Y = 250;
assertInStage("Aa + ant row", ROW_X, ROW_X + ROW_W);

export const ThumbV2LettersPhonics: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.letters, overflow: "hidden" }}>
    {/* a soft light behind the subject so it lifts off the ground without a stroke */}
    <div
      style={{
        position: "absolute",
        left: ROW_X - 60,
        top: ROW_Y - 70,
        width: ROW_W + 120,
        height: ANT + 150,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
      }}
    />

    <div style={badge}>
      ALL 26<br />
      <span style={badgeSub}>LETTERS</span>
    </div>

    <div style={{ ...head, fontSize: headSize("LETTER SOUNDS".length) }}>LETTER SOUNDS</div>

    {/* "Aa" — one letter stands for all 26; showing every one is what killed v1 */}
    <div
      style={{
        position: "absolute",
        left: ROW_X,
        top: ROW_Y + 26,
        width: GLYPH * 1.28,
        textAlign: "center",
        fontSize: GLYPH,
        fontWeight: 800,
        color: "#FFD75E",
        lineHeight: 1,
        textShadow: "0 10px 0 rgba(0,0,0,0.26), 0 20px 40px rgba(0,0,0,0.42)",
      }}
    >
      Aa
    </div>

    {/* the ant on a white card — white is the strongest contrast available on this
        ground, and the card edge is what makes the subject legible at 210px */}
    <div
      style={{
        position: "absolute",
        left: ROW_X + GLYPH * 1.28 + GAP,
        top: ROW_Y,
        width: ANT,
        height: ANT,
        background: "#FFFFFF",
        borderRadius: CARD_R,
        boxShadow: "0 22px 44px rgba(0,0,0,0.42)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={staticFile("letters/ant.png")} style={{ width: ANT * 0.8, height: ANT * 0.8, objectFit: "contain" }} />
    </div>

    {/* the sound, under its picture — white so it reads as the answer rather than
        competing with the gold "Aa", which is the question */}
    <div
      style={{
        position: "absolute",
        left: ROW_X + GLYPH * 1.28 + GAP,
        top: ROW_Y + ANT + 14,
        width: ANT,
        textAlign: "center",
        fontSize: 58,
        fontWeight: 800,
        color: "#FFFFFF",
        lineHeight: 1,
        textShadow: "0 5px 0 rgba(0,0,0,0.26), 0 10px 22px rgba(0,0,0,0.4)",
      }}
    >
      aaa
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
