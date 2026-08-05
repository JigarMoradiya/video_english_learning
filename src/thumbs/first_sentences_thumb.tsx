import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { bands, sizes, StonesWorld, WordStone } from "../components/SteppingStones";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";

// ── MILESTONE · Read Your First Sentences — covers (1280×720 and 1080×1920) ──
//
// Both wear THE STEPPING STONES, the 16:9 video's world. A cover promises what the video
// shows, and the 9:16 cut wears the pond — but the tile has to sell the lesson the long
// video teaches, so both covers use the stream, exactly as L4's two covers both wear the
// Sandwich Shop even though its short is the Smoothie Bar.
//
// The hero is the lesson at a glance: a whole sentence standing in the water, with the one
// picture it means. Nothing else — this is read at ~120px in a grid.
//
// EVERY block gets an explicit TOP, and the hero's top is asserted below the headline's
// bottom. A cover cannot get away with an overlap the way a moving frame can.
const SENTENCE = ["The", "cat", "sat", "on", "a", "mat."];
const HELPERS = new Set(["the", "on", "a"]);

/** The app's own cat, on the mat it sat on. Both covers show it under the sentence, so a
 *  glance gets the line AND what it means. */
const CatOnMat: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <div
      style={{
        position: "absolute", left: "50%", bottom: -size * 0.07,
        width: size * 1.34, height: size * 0.33, marginLeft: -size * 0.67,
        borderRadius: size * 0.05,
        background: "repeating-linear-gradient(90deg, #C77B3C 0 7%, #E09A5A 7% 14%)",
        border: `${Math.max(2, size * 0.02)}px solid #A25E28`,
        boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
        transform: "perspective(420px) rotateX(56deg)",
      }}
    />
    <Img
      src={staticFile("letters/cat.png")}
      style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }}
    />
  </div>
);

/** 16:9 — the sentence in ONE row, which is how a sentence is read. */
const HeroRow: React.FC<{ W: number; top: number; scale: number }> = ({ W, top, scale }) => (
  <div
    style={{
      position: "absolute", left: 0, top, width: W,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * scale,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 * scale }}>
      {SENTENCE.map((w, i) => (
        <WordStone
          key={i}
          word={w}
          helper={HELPERS.has(w.toLowerCase().replace(/[^a-z]/g, ""))}
          state={i === 2 ? "lit" : "idle"}
          seed={i}
          size={62 * scale}
          pond={false}
        />
      ))}
    </div>
    <CatOnMat size={132 * scale} />
  </div>
);

/**
 * 9:16 — the SAME single row, only smaller, plus the picture beneath it.
 * The letters of a sentence never stack: a sentence turned down the frame stops being a
 * sentence, which is the whole thing this milestone teaches. So it is the PICTURE that
 * moves below the row, not the words.
 */
const HeroColumn: React.FC<{ W: number; top: number; scale: number }> = ({ W, top, scale }) => (
  <div
    style={{
      position: "absolute", left: 0, top, width: W,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 26 * scale,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 * scale }}>
      {SENTENCE.map((w, i) => (
        <WordStone
          key={i}
          word={w}
          helper={HELPERS.has(w.toLowerCase().replace(/[^a-z]/g, ""))}
          state={i === 2 ? "lit" : "idle"}
          seed={i}
          size={44 * scale}
          pond={false}
        />
      ))}
    </div>
    <CatOnMat size={196 * scale} />
  </div>
);

const Cover: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const W = portrait ? 1080 : 1280;
  const H = portrait ? 1920 : 720;
  const c = cover(W, H);
  const scale = portrait ? W / 1280 : W / 1280;

  const title = portrait ? ["READ YOUR", "FIRST", "SENTENCES"] : ["READ YOUR FIRST", "SENTENCES"];
  const headSize = c.headSize(Math.max(...title.map((l) => l.length)));
  // the hero sits BELOW the headline's last line — asserted, never assumed
  const headBottom = c.head.top + headSize * 1.04 * title.length;
  const heroTop = headBottom + (portrait ? H * 0.055 : 34);

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* the waterline is pushed below the headline, so the whole title reads on sky.
          The tall cover's default line sat at y 653 with the title running to y 876. */}
      <StonesWorld skin="stream" waterFrac={portrait ? 0.50 : undefined} />


      {/* badge */}
      <div style={{ position: "absolute", ...c.badge, color: palette.ink }}>
        MILESTONE
        <div style={c.badgeSub}>after Level 4</div>
      </div>

      {/* headline */}
      <div
        style={{
          position: "absolute", left: 0, top: c.head.top, width: W,
          textAlign: "center", color: palette.ink,
          fontSize: headSize, fontWeight: c.head.fontWeight,
          lineHeight: c.head.lineHeight, letterSpacing: c.head.letterSpacing,
          textShadow: c.head.textShadow,
        }}
      >
        {title.map((l) => <div key={l}>{l}</div>)}
      </div>

      {portrait
        // 1.55 put the row within 28px of both frame edges — a cover cannot run that
        // close. 1.30 leaves 95px each side and still reads at tile size.
        ? <HeroColumn W={W} top={heroTop} scale={scale * 1.30} />
        : <HeroRow W={W} top={heroTop} scale={scale} />}

      {/* mascot + logo */}
      {/* the wide cover lifts the mascot off the very bottom edge — flush against it, it
          read as standing on the frame rather than on the bank */}
      <Img
        src={staticFile("mascot.png")}
        style={{
          position: "absolute", left: c.mascot.left,
          bottom: portrait ? c.mascot.bottom : 34,
          width: c.mascot.width, height: c.mascot.width * c.mascot.aspect,
        }}
      />
      <Img
        src={staticFile("logo.png")}
        style={{ position: "absolute", right: c.logo.right, bottom: c.logo.bottom, width: c.logo.width }}
      />
    </AbsoluteFill>
  );
};

export const ThumbFirstSentences169: React.FC = () => <Cover portrait={false} />;
export const ThumbFirstSentences916: React.FC = () => <Cover portrait />;
