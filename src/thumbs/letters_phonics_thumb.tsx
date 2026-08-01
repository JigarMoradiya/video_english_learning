import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { LETTERS } from "../data/letters";
import { font, hex, letterColorFor, palette } from "../data/tokens";
import { PaintPot, StudioWall, StudioWash } from "../components/PaintStudio";
import { cover } from "./cover";

// ── Letter Sounds A–Z thumbnail (1280×720) ───────────────────────────────────
//   npx remotion still thumb-letters-phonics out/thumb_letters_phonics.png
//
// Built from what the VIDEO actually looks like, not from a generic template. That
// lesson has no "world" the way the phonics comparison videos do — its identity is
// three things, and all three are here:
//   · the whole frame floods with the CURRENT LETTER'S colour (A is teal, C purple…)
//   · the big traced letter pair beside its picture card, with "A for Ant" beneath
//   · the A–Z progress strip along the bottom — the single most recognisable element
//
// The strip also does the selling: 26 cells in 26 colours reads as "the whole
// alphabet" even at 120px wide, where individual letters are only a colour bar.
//
// The video wears THE PAINT STUDIO in every aspect now, so the cover does too — paper
// wall, the hero letter's colour arriving as a wash, and the 26 paint tins as the strip.
// (The old flat-gradient version promised a video that no longer exists.) No brush jar:
// it is pinned to a taller frame and a cover carries five elements anyway.
const W = 1280;
const H = 720;
const GOLD = "#FFC42A";

const HERO = LETTERS[0]; // A · Ant
const HC = hex(letterColorFor(HERO.letter, HERO.imageColor));

const C = cover(W, H);

// A–Z tin shelf. Starts right of the mascot, ends before the bottom-right logo.
const STRIP_X0 = 250;
const STRIP_X1 = 1128;
const STRIP_Y = 576;
const CELL_W = 30;
const CELL_GAP = (STRIP_X1 - STRIP_X0 - 26 * CELL_W) / 25;

// mascot.png carries only 7px of bottom padding, so its feet are effectively the last
// pixel row: bottom:0 leaves them flush with the frame edge and reads as cropped.
const MASCOT_W = C.mascot.width;
const MASCOT_BOTTOM = 26;
const MASCOT_H = Math.round(MASCOT_W * (1063 / 923));
if (H - MASCOT_BOTTOM - MASCOT_H > STRIP_Y) {
  throw new Error("thumb: mascot sits below the strip; it will look detached");
}

const Backdrop: React.FC = () => (
  <>
    <StudioWall />
    <StudioWash tone={HC} />
  </>
);

export const ThumbLettersPhonics: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
    <Backdrop />

    {/* hook, in the channel's rotated gold badge (a different claim from
        thumb-phonics-a's "ALL 26 SOUNDS", so the two never read as duplicates) */}
    <div
      style={{
        position: "absolute", ...C.badge, color: palette.ink,
      }}
    >
      ALL 26<br /><span style={C.badgeSub}>LETTERS</span>
    </div>

    <Img src={staticFile("logo.png")} style={{ position: "absolute", ...C.logo, height: "auto" }} />

    <div
      style={{
        position: "absolute", left: 0, top: 44, width: W, textAlign: "center",
        fontSize: C.head.fontSize, fontWeight: C.head.fontWeight, color: palette.ink,
        letterSpacing: C.head.letterSpacing, lineHeight: C.head.lineHeight,
        textShadow: "0 6px 0 #FFFFFF, 0 10px 26px rgba(30,36,56,0.22)",
      }}
    >
      LETTER SOUNDS
    </div>

    {/* the hero pair + picture card — the video's own composition, scaled up */}
    <div
      style={{
        position: "absolute", left: 0, top: 178, width: W,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 46,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", color: HC, fontWeight: 800, lineHeight: 0.9 }}>
        <span style={{ fontSize: 232, textShadow: `0 14px 30px ${HC}44` }}>{HERO.letter}</span>
        <span style={{ fontSize: 168, textShadow: `0 14px 30px ${HC}44` }}>{HERO.letter.toLowerCase()}</span>
      </div>
      <div
        style={{
          width: 214, height: 214, background: "#fff", borderRadius: 34,
          border: `9px solid ${HC}`, boxShadow: `0 18px 40px ${HC}44`,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18, boxSizing: "border-box",
        }}
      >
        <Img src={staticFile(`letters/${HERO.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>
      {/* the sound, said three times, exactly as the video shows it */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: "#6B5B86" }}>says</span>
        <span style={{ fontSize: 72, fontWeight: 800, color: HC, lineHeight: 1 }}>{HERO.soundToken}!</span>
      </div>
    </div>

    <div
      style={{
        position: "absolute", left: 0, top: 434, width: W, textAlign: "center",
        fontSize: 52, fontWeight: 800, color: palette.ink,
      }}
    >
      {HERO.letter} for {HERO.word}
    </div>

    {/* the A–Z tin shelf: the video's signature, and what says "all 26" at any size */}
    {LETTERS.map((l, i) => (
      <div key={l.letter} style={{ position: "absolute", left: STRIP_X0 + i * (CELL_W + CELL_GAP), top: STRIP_Y }}>
        <PaintPot letter={l.letter} color={letterColorFor(l.letter, l.imageColor)} state="done" size={CELL_W} />
      </div>
    ))}

    <Img
      src={staticFile("mascot.png")}
      style={{
        position: "absolute", left: 6, bottom: MASCOT_BOTTOM, width: MASCOT_W, height: "auto",
        filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))",
      }}
    />
  </AbsoluteFill>
);
