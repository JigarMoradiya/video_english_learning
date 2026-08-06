import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { GROUND, MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── CVC Words · cover v2 (1280×720) ─────────────────────────────────────────
//   npx remotion still thumb-v2-cvc out/thumb_v2/cvc.png
//
// Video 4, and the first one where the child reads a whole real word. So the cover
// shows the whole real word — picture first, then the three sounds that build it.
//
// Deliberately NOT the blending cover's equation. That one is "a + t = at", a sum. This
// one is "here is a cat, and here is how it is spelled" — a picture and its word. Two
// consecutive uploads that both read as an arithmetic row would look like one video.
//
// The vowel tile is red and the consonants blue, which is the colour code the blending
// video establishes and this one continues. A viewer who watched video 3 already knows
// what red means before the narration says a word.

const PIC = 280;
const TILE = 130;
const TGAP = 15;
const MID = 40;
const TILES_W = TILE * 3 + TGAP * 2;
const ROW_W = PIC + MID + TILES_W;
const ROW_X = stageCx - ROW_W / 2;
const ROW_Y = 296;
assertInStage("cat + tiles", ROW_X, ROW_X + ROW_W);

const TILES_X = ROW_X + PIC + MID;
// tiles are shorter than the picture, so centre them against it rather than top-align
const TILES_Y = ROW_Y + (PIC - TILE) / 2;

const LETTERS: { ch: string; colour: string; role: string }[] = [
  { ch: "c", colour: "#2D7FE0", role: "consonant" },
  { ch: "a", colour: "#E5453B", role: "vowel" }, // the vowel — red, as in the blending lesson
  { ch: "t", colour: "#2D7FE0", role: "consonant" },
];

// Role labels sit under their own card, capped to the card width so they align to it.
// "consonant" is the longest at 9 characters: 9 × 0.62 × 20px ≈ 112px, inside TILE's 130.
const ROLE_SIZE = 20;
const ROLE_TOP = TILES_Y + TILE + 12;

export const ThumbV2Cvc: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND.cvc, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: ROW_X - 70,
        top: ROW_Y - 60,
        width: ROW_W + 140,
        height: PIC + 130,
        background: "radial-gradient(closest-side, rgba(255,255,255,0.17), rgba(255,255,255,0))",
      }}
    />

    <div style={badge}>
      25 WORDS<br />
      <span style={badgeSub}>5 VOWELS</span>
    </div>

    <div style={{ ...head, fontSize: headSize("CVC WORDS".length) }}>CVC WORDS</div>

    {/* the picture — a whole word your child can now read, before any letters appear */}
    <div
      style={{
        position: "absolute",
        left: ROW_X,
        top: ROW_Y,
        width: PIC,
        height: PIC,
        background: "#FFFFFF",
        borderRadius: 38,
        boxShadow: "0 22px 44px rgba(0,0,0,0.44)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={staticFile("letters/cat.png")} style={{ width: PIC * 0.8, height: PIC * 0.8, objectFit: "contain" }} />
    </div>

    {/* c · a · t — three sounds, the vowel marked out in the middle. The role labels
        spell out what CVC actually stands for, so the acronym in the headline is
        decoded on the cover rather than assumed. */}
    {LETTERS.map((l, i) => (
      <div
        key={`${l.ch}-role`}
        style={{
          position: "absolute",
          left: TILES_X + i * (TILE + TGAP),
          top: ROLE_TOP,
          width: TILE,
          textAlign: "center",
          fontSize: ROLE_SIZE,
          fontWeight: 800,
          color: "rgba(255,255,255,0.88)",
          letterSpacing: 0.3,
          textShadow: "0 3px 10px rgba(0,0,0,0.5)",
        }}
      >
        {l.role}
      </div>
    ))}

    {LETTERS.map((l, i) => (
      <div
        key={l.ch}
        style={{
          position: "absolute",
          left: TILES_X + i * (TILE + TGAP),
          top: TILES_Y,
          width: TILE,
          height: TILE,
          boxSizing: "border-box",
          background: "#FFFFFF",
          border: `10px solid ${l.colour}`,
          borderRadius: 28,
          boxShadow: "0 18px 36px rgba(0,0,0,0.42)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 96,
          fontWeight: 800,
          color: l.colour,
          lineHeight: 1,
        }}
      >
        {l.ch}
      </div>
    ))}

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
