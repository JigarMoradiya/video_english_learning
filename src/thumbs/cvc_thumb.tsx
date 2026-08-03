import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { bands, CONSONANT, LetterBoard, MergedSandwich, ShopWorld, VOWEL, WordPicture } from "../components/SandwichShop";
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

/** 16:9 — one row: c a t → cat 🐱. Its width is MEASURED off the render, not summed from
 *  the props (MergedSandwich draws wider than its `size`, so the sum said 890 and both
 *  ends of the portrait row ran off the frame). */
const HERO_W = 1020;

const HeroRow: React.FC<{ W: number; top: number; scale: number }> = ({ W, top, scale }) => (
  <div style={{ position: "absolute", left: 0, top, width: W, display: "flex",
                alignItems: "center", justifyContent: "center", gap: 16 * scale }}>
    {WORD.split("").map((ch) => (
      <LetterBoard key={ch} letter={ch} vowel={"aeiou".includes(ch)} size={150 * scale} lit />
    ))}
    <span style={{ fontSize: 58 * scale, fontWeight: 800, color: palette.ink, lineHeight: 1,
                   textShadow: "0 4px 0 #FFFFFF" }}>→</span>
    <MergedSandwich word={WORD} size={168 * scale} lit />
    <WordPicture pic={PIC} size={150 * scale} />
  </div>
);

/** 9:16 — the same idea STACKED. A tall frame laid out as one wide row leaves two thick
 *  empty bands above and below it; down the frame, the three sounds becoming one word is
 *  also the direction the eye already travels. */
const HeroColumn: React.FC<{ W: number; top: number; s: number }> = ({ W, top, s }) => (
  <div style={{ position: "absolute", left: 0, top, width: W, display: "flex",
                flexDirection: "column", alignItems: "center", gap: 14 * s }}>
    {WORD.split("").map((ch) => (
      <LetterBoard key={ch} letter={ch} vowel={"aeiou".includes(ch)} size={148 * s} lit />
    ))}
    <span style={{ fontSize: 62 * s, fontWeight: 800, color: palette.ink, lineHeight: 0.9,
                   textShadow: "0 4px 0 #FFFFFF" }}>↓</span>
    <div style={{ display: "flex", alignItems: "center", gap: 18 * s }}>
      <MergedSandwich word={WORD} size={184 * s} lit />
      <WordPicture pic={PIC} size={152 * s} />
    </div>
  </div>
);

const Frame: React.FC<{ W: number; H: number; portrait: boolean }> = ({ W, H, portrait }) => {
  const c = cover(W, H);
  const headSize = c.headSize("CVC WORDS".length);
  const headBottom = c.head.top + headSize * c.head.lineHeight;
  // the hero clears the headline's last line by a real margin, never by luck
  const B = bands(W, H);
  const heroScale = Math.min(1.0, (W - 150) / HERO_W);
  // The column's height at s=1, so the portrait cover can size it to the room it HAS —
  // between the headline and the mascot's head — instead of being left as a stamp in the
  // middle of a tall frame.
  const COL_H = 3 * 148 + 2 * 14 + 62 + 14 + 184 * 1.12;
  const heroTop = portrait ? H * 0.25 : headBottom + 40;
  const colS = portrait ? Math.min(1.6, (H * 0.70 - heroTop) / COL_H) : 1;
  const colBottom = heroTop + COL_H * colS;

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
        {/* one line in both: two lines cost ~190px of the very room the column needs */}
        CVC WORDS
      </div>

      {/* 3 · the one key visual */}
      {portrait
        ? <HeroColumn W={W} top={heroTop} s={colS} />
        : <HeroRow W={W} top={heroTop} scale={heroScale} />}

      {/* the promise under it, small — three sounds, one word */}
      <div
        style={{
          // 16:9 — down ON the counter. Above it the line sat among the plates, cones and
          // jars standing on the counter top and could not be read cleanly.
          position: "absolute", left: 0, width: W,
          top: portrait ? colBottom + 18 : B.counterY + 30,
          textAlign: "center", fontSize: (portrait ? H * 0.033 : 46),
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
