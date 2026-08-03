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

/** 9:16 — the same three-into-one, turned down the frame instead of across it. The LETTERS
 *  stay in one row, which is how a word is read; it is the ARROW that goes vertical, so the
 *  row and the word it becomes stack instead of running off a 1080-wide frame. */
const HeroColumn: React.FC<{ W: number; top: number; s: number; sub: React.ReactNode }> = ({ W, top, s, sub }) => (
  <div style={{ position: "absolute", left: 0, top, width: W, display: "flex",
                flexDirection: "column", alignItems: "center", gap: 12 * s }}>
    {/* the rule names the boards, so in portrait it introduces them from above */}
    <div style={{ marginBottom: 6 * s }}>{sub}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
      {WORD.split("").map((ch) => (
        <LetterBoard key={ch} letter={ch} vowel={"aeiou".includes(ch)} size={148 * s} lit />
      ))}
    </div>
    <span style={{ fontSize: 62 * s, fontWeight: 800, color: palette.ink, lineHeight: 0.9,
                   textShadow: "0 4px 0 #FFFFFF" }}>↓</span>
    <div style={{ display: "flex", alignItems: "center", gap: 18 * s }}>
      <MergedSandwich word={WORD} size={168 * s} lit />
      <WordPicture pic={PIC} size={140 * s} />
    </div>
  </div>
);

/** The rule line, worded exactly as the video says it. "Consonant · Vowel · Consonant" is
 *  28 characters against "3 sounds · 1 word"'s 17, so portrait takes a smaller size or the
 *  line runs past 1080. Coloured initials, the same C/V/C the boards below it wear. */
const Sub: React.FC<{ W: number; H: number; portrait: boolean; top?: number }> = ({ W, H, portrait, top }) => (
  <div
    style={{
      // 16:9 — down ON the counter, below the boards. Between them and it sit the plates,
      // cones and jars standing on the counter top, which the line cannot be read across.
      ...(portrait ? {} : { position: "absolute" as const, left: 0, top, width: W }),
      textAlign: "center", fontSize: portrait ? H * 0.026 : 42,
      fontWeight: 800, color: palette.ink, letterSpacing: 0.5,
      textShadow: "0 4px 0 #FFFFFF",
    }}
  >
    <span style={{ color: CONSONANT }}>C</span>onsonant ·{" "}
    <span style={{ color: VOWEL }}>V</span>owel ·{" "}
    <span style={{ color: CONSONANT }}>C</span>onsonant
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
  // one board row + arrow + the merged row, each at s=1
  const COL_H = 148 * 1.12 + 12 + 62 * 0.9 + 12 + 168 * 1.12;
  // BOTH derived from the headline's bottom. Portrait was a fixed H*0.25 = 480 while the
  // headline ran to 496, so the row overlapped the title by construction — a fraction of
  // the frame cannot know where the type ends.
  const heroTop = headBottom + (portrait ? H * 0.055 : 40);
  // capped on WIDTH too: three 148 boards and two gaps must fit 1080 with a margin
  const colS = portrait
    ? Math.min((W - 190) / (3 * 148 + 2 * 14), (H * 0.72 - heroTop) / COL_H)
    : 1;
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
        ? <HeroColumn W={W} top={heroTop} s={colS} sub={<Sub W={W} H={H} portrait />} />
        : <HeroRow W={W} top={heroTop} scale={heroScale} />}

      {!portrait && <Sub W={W} H={H} portrait={false} top={B.counterY + 30} />}

      {/* 4 · the mascot. A LOCAL trim at 16:9, not a change to cover.ts — that 184 is the
             channel rule and every other landscape cover keeps it. This world is the
             reason: the Sandwich Shop's counter line sits at 507 in a 720 frame, so at
             184 the bear filled the wood band top to bottom and read bigger here than he
             does on the other covers. Smaller, he stands IN the band like the others. */}
      <Img
        src={staticFile("mascot.png")}
        style={{ position: "absolute", left: c.mascot.left,
                 // ...and lifted off the very bottom row at 16:9, part of the same local
                 // exception: he stands ON this world's counter rather than on the frame edge
                 bottom: portrait ? c.mascot.bottom : 30,
                 width: portrait ? c.mascot.width : 158,
                 height: (portrait ? c.mascot.width : 158) * c.mascot.aspect }}
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
