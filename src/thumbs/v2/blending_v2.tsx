import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── CV · VC Blending · cover v2 (1280×720) ──────────────────────────────────
//   npx remotion still thumb-v2-blending out/thumb_v2/blending.png
//
// The lesson has exactly one idea and the cover shows exactly that idea: two sounds go
// in, one word comes out. a + t = AT.
//
// The red/blue boxes are not decoration — they are the video's own colour code (red box
// is a vowel, blue box is a consonant, stated at 0:21 and used for the whole runtime).
// A viewer who clicks sees the same two colours doing the same job, so the cover is a
// promise the video keeps.
//
// "AT" is the largest thing in the frame on purpose: the payoff, not the ingredients,
// is what earns the click.

const CARD = 150;
const CARD_R = 30;
const OP = 56;        // the + and = glyphs
const WORD = 210;     // "AT" cap width budget
const GAP = 24;

const ROW_W = CARD + GAP + OP + GAP + CARD + GAP + OP + GAP + WORD;
// Nudged down and right off dead centre: the bear occupies the lower left, so a centred
// row sits closer to it than to the right edge and the frame reads lop-sided. The offset
// is capped by the stage assertion below — 28 leaves 10px of margin at STAGE.right.
const ROW_DX = 28;
const ROW_X = stageCx - ROW_W / 2 + ROW_DX;
const ROW_Y = 322;
assertInStage("blend equation", ROW_X, ROW_X + ROW_W);

// stepped left offsets, so nothing is positioned by eye
const X = (() => {
  let x = ROW_X;
  const a = x; x += CARD + GAP;
  const plus = x; x += OP + GAP;
  const b = x; x += CARD + GAP;
  const eq = x; x += OP + GAP;
  return { a, plus, b, eq, word: x };
})();

const SoundCard: React.FC<{ left: number; colour: string; children: React.ReactNode }> = ({ left, colour, children }) => (
  <div
    style={{
      position: "absolute",
      left,
      top: ROW_Y,
      width: CARD,
      height: CARD,
      boxSizing: "border-box",
      background: "#FFFFFF",
      border: `10px solid ${colour}`,
      borderRadius: CARD_R,
      boxShadow: "0 20px 40px rgba(0,0,0,0.44)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 108,
      fontWeight: 800,
      color: colour,
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);

const Op: React.FC<{ left: number; children: React.ReactNode }> = ({ left, children }) => (
  <div
    style={{
      position: "absolute",
      left,
      top: ROW_Y,
      width: OP,
      height: CARD,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 62,
      fontWeight: 800,
      color: "rgba(255,255,255,0.86)",
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);

export const ThumbV2Blending: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.blending, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: ROW_X - 70,
        top: ROW_Y - 66,
        width: ROW_W + 140,
        height: CARD + 140,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
      }}
    />

    <div style={badge}>
      2 SOUNDS<br />
      <span style={badgeSub}>1 WORD</span>
    </div>

    {/* the lesson's name, small, above the headline. "CV · VC BLENDING" as one line
        shrinks the headline below readable at 210px, so the term rides above it instead
        and the headline keeps its full size. */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 44,
        width: 1280,
        textAlign: "center",
        fontSize: 44,
        fontWeight: 800,
        letterSpacing: 8,
        color: "rgba(255,255,255,0.82)",
        textShadow: "0 4px 14px rgba(0,0,0,0.45)",
      }}
    >
      CV · VC
    </div>

    <div style={{ ...head, top: 104, fontSize: headSize("BLENDING".length) }}>BLENDING</div>

    {/* red = vowel, blue = consonant — the video's own code */}
    <SoundCard left={X.a} colour="#E5453B">a</SoundCard>
    <Op left={X.plus}>+</Op>
    <SoundCard left={X.b} colour="#2D7FE0">t</SoundCard>
    <Op left={X.eq}>=</Op>

    {/* lowercase "at", because that is the word as the video builds it and as a child
        will meet it in print. Centred by flex against the card height rather than by a
        hand-tuned top: lowercase has no ascender, so an eyeballed offset that suited
        "AT" would sit the word visibly high. */}
    <div
      style={{
        position: "absolute",
        left: X.word,
        top: ROW_Y,
        width: WORD,
        height: CARD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 172,
        fontWeight: 800,
        color: "#FFD75E",
        lineHeight: 1,
        textShadow: "0 10px 0 rgba(0,0,0,0.28), 0 20px 40px rgba(0,0,0,0.46)",
      }}
    >
      at
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
