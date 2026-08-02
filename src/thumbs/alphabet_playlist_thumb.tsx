import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { LETTERS } from "../data/letters";
import { font, hex, letterColorFor, palette } from "../data/tokens";
import { PaintPot, StudioWall, StudioWash } from "../components/PaintStudio";
import { cover } from "./cover";

// ── A–Z Letter Phonics SOUND — playlist cover (1280×720) ─────────────────────
//   npx remotion still thumb-alphabet-az out/thumb_alphabet_az.png
//
// A collection cover for the whole A–Z letter-SOUNDS series. It has to sell the
// SOUND, not just the alphabet: each hero card shows a letter WITH the sound it
// makes (A → "a-a-a") and sound-wave arcs, so a viewer reads "these teach the
// sounds", and the 26-letter tin strip says "all of them". Same Paint Studio
// world as the letter videos, so it reads as one set.
const W = 1280;
const H = 720;
const C = cover(W, H);
const HC = "#2EB8B8"; // hero teal wash, matching the letters cover

// A–Z tin shelf on TWO rows (13 + 13), bigger so the letters read
const POT = 46;
const PER_ROW = 13;
const POT_GAP = 18;
const ROW_GAP = 16;
const STRIP_W = PER_ROW * POT + (PER_ROW - 1) * POT_GAP;
const STRIP_X0 = (W - STRIP_W) / 2;
const STRIP_Y = 502;

const HEAD_SIZE = C.headSize("LETTER SOUNDS".length);
const CARD_W = 208;
const CARD_H = 200;

const col = (i: number) => hex(letterColorFor(LETTERS[i].letter, LETTERS[i].imageColor));

// three right-facing arcs = "it makes a sound"
const Waves: React.FC<{ color: string }> = ({ color }) => (
  <svg width={58} height={58} viewBox="0 0 58 58" style={{ position: "absolute", top: -10, right: -20 }}>
    {[9, 18, 27].map((r, k) => (
      <path key={k} d={`M16 ${29 - r} A ${r} ${r} 0 0 1 16 ${29 + r}`} fill="none" stroke={color} strokeWidth={5.5} strokeLinecap="round" opacity={0.9 - k * 0.22} />
    ))}
  </svg>
);

const SoundCard: React.FC<{ i: number; letter: string }> = ({ i, letter }) => {
  const c = col(i);
  return (
    <div
      style={{
        width: CARD_W, height: CARD_H, background: "#fff", borderRadius: 34,
        border: `10px solid ${c}`, boxShadow: `0 16px 36px ${c}44`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative",
      }}
    >
      <span style={{ fontSize: 96, fontWeight: 800, color: c, lineHeight: 1 }}>
        {letter}
        <span style={{ fontSize: 58 }}>{letter.toLowerCase()}</span>
      </span>
      <span style={{ fontSize: 34, fontWeight: 800, color: c, marginTop: 8, lineHeight: 1 }}>{LETTERS[i].soundToken}</span>
      <Waves color={c} />
    </div>
  );
};

export const ThumbAlphabetPlaylist: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
    <StudioWall splats={false} drips={false} />
    <StudioWash tone={HC} />

    {/* badge — the range + that it's about sounds */}
    <div style={{ position: "absolute", ...C.badge, color: palette.ink }}>
      A → Z<br />
      <span style={C.badgeSub}>26 SOUNDS</span>
    </div>

    <Img src={staticFile("logo.png")} style={{ position: "absolute", ...C.logo, height: "auto" }} />

    {/* headline */}
    <div
      style={{
        position: "absolute", left: 0, top: 52, width: W, textAlign: "center",
        fontSize: HEAD_SIZE, fontWeight: C.head.fontWeight, color: palette.ink,
        letterSpacing: C.head.letterSpacing, lineHeight: C.head.lineHeight, textShadow: C.head.textShadow,
      }}
    >
      LETTER SOUNDS
    </div>

    {/* hero — letters WITH the sound they make: A "a-a-a"  B  C … Z */}
    <div style={{ position: "absolute", left: 0, top: 224, width: W, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <SoundCard i={0} letter="A" />
      <SoundCard i={1} letter="B" />
      <SoundCard i={2} letter="C" />
      <span style={{ fontSize: 92, fontWeight: 800, color: palette.inkSoft, letterSpacing: 8, paddingBottom: 40 }}>…</span>
      <SoundCard i={25} letter="Z" />
    </div>

    {/* A–Z tin shelf, two rows (A–M / N–Z): says "all 26" and now reads at a glance */}
    {LETTERS.map((l, i) => {
      const row = Math.floor(i / PER_ROW);
      const c = i % PER_ROW;
      return (
        <div key={l.letter} style={{ position: "absolute", left: STRIP_X0 + c * (POT + POT_GAP), top: STRIP_Y + row * (POT + ROW_GAP) }}>
          <PaintPot letter={l.letter} color={letterColorFor(l.letter, l.imageColor)} state="done" size={POT} />
        </div>
      );
    })}

    <Img
      src={staticFile("mascot.png")}
      style={{ position: "absolute", left: 6, bottom: 26, width: C.mascot.width, height: "auto", filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))" }}
    />
  </AbsoluteFill>
);
