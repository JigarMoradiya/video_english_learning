import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CONSONANT, LetterBoard, MergedSandwich, ShopWorld, VOWEL, WordPicture } from "../components/SandwichShop";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";

// ── L4 · CVC Words covers (1280×720 and 1080×1920 from one component) ────────
// Both wear THE SANDWICH SHOP, the 16:9 video's own world — a cover promises what the
// video shows. (The 9:16 cut has a different world, but the channel tile has to match the
// lesson the viewer is being sold, and the Sandwich Shop is the one the long video wears.)
//
// The hero is the lesson in a glance: three sound-boards becoming one word, with its
// picture. Nothing else — this is read at ~120px in a grid.
//
// EVERY block gets an explicit TOP, and the hero's top is asserted to sit below the
// headline's bottom. A cover cannot get away with an overlap the way a moving frame can.
const WORD = "cat";
const PIC = "letters/cat.png";

/** The hero row's real width at scale 1 — MEASURED off the rendered 16:9, not summed from
 *  the props. MergedSandwich draws wider than its `size` (it is a sandwich, not a square),
 *  so adding the numbers up gave 890 and both ends of the portrait row ran off the frame. */
const HERO_W = 1020;

const Hero: React.FC<{ W: number; top: number; scale: number }> = ({ W, top, scale }) => {
  const board = 150 * scale;
  const gap = 16 * scale;
  const arrow = 58 * scale;
  const merged = 168 * scale;
  const pic = 150 * scale;
  return (
    <div
      style={{
        position: "absolute", left: 0, top, width: W,
        display: "flex", alignItems: "center", justifyContent: "center", gap,
      }}
    >
      {WORD.split("").map((ch) => (
        <LetterBoard key={ch} letter={ch} vowel={"aeiou".includes(ch)} size={board} lit />
      ))}
      <span style={{ fontSize: arrow, fontWeight: 800, color: palette.ink, lineHeight: 1,
                     textShadow: "0 4px 0 #FFFFFF" }}>→</span>
      <MergedSandwich word={WORD} size={merged} lit />
      <WordPicture pic={PIC} size={pic} />
    </div>
  );
};

const Frame: React.FC<{ W: number; H: number; portrait: boolean }> = ({ W, H, portrait }) => {
  const c = cover(W, H);
  const headSize = c.headSize("CVC WORDS".length);
  const headBottom = c.head.top + headSize * c.head.lineHeight * (portrait ? 2 : 1);
  // the hero clears the headline's last line by a real margin, never by luck
  // SCALED TO FIT, not guessed: at 1.55 the portrait row was 1165px wide in a 1080 frame
  // and both ends ran off the edge.
  const heroScale = Math.min(1.0, (W - (portrait ? 76 : 150)) / HERO_W);
  const heroTop = portrait ? H * 0.375 : headBottom + 40;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* the video's own world, with its keeper off — cover.ts draws the one mascot */}
      <ShopWorld activeGroup={0} doneGroups={0} leftFree={false} mascot="off" menu={false} />

      {/* 1 · the gold badge */}
      <div style={{ position: "absolute", ...c.badge, color: palette.ink }}>
        LEVEL 4
        <div style={c.badgeSub}>PHONICS</div>
      </div>

      {/* 2 · the headline */}
      <div
        style={{
          position: "absolute", left: 0, top: c.head.top, width: W, textAlign: "center",
          color: palette.ink, fontSize: headSize, fontWeight: c.head.fontWeight,
          lineHeight: c.head.lineHeight, letterSpacing: c.head.letterSpacing,
          textShadow: c.head.textShadow,
        }}
      >
        {portrait ? (<>CVC<br />WORDS</>) : "CVC WORDS"}
      </div>

      {/* 3 · the one key visual */}
      <Hero W={W} top={heroTop} scale={heroScale} />

      {/* the promise under it, small — three sounds, one word */}
      <div
        style={{
          position: "absolute", left: 0, top: heroTop + 200 * heroScale, width: W,
          textAlign: "center", fontSize: (portrait ? H * 0.031 : 44),
          fontWeight: 800, color: palette.ink, textShadow: "0 4px 0 #FFFFFF",
        }}
      >
        <span style={{ color: CONSONANT }}>3 sounds</span> ·{" "}
        <span style={{ color: VOWEL }}>1 word</span>
      </div>

      {/* 4 · the mascot */}
      <Img
        src={staticFile("mascot.png")}
        style={{ position: "absolute", left: c.mascot.left, bottom: c.mascot.bottom,
                 width: c.mascot.width, height: c.mascot.width * c.mascot.aspect }}
      />

      {/* 5 · the logo */}
      <Img
        src={staticFile("logo.png")}
        style={{ position: "absolute", right: c.logo.right, bottom: c.logo.bottom, width: c.logo.width }}
      />
    </AbsoluteFill>
  );
};

export const ThumbCvc169: React.FC = () => <Frame W={1280} H={720} portrait={false} />;
export const ThumbCvc916: React.FC = () => <Frame W={1080} H={1920} portrait />;
