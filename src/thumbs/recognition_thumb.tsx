import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { REC_LETTERS } from "../data/recognition";
import { AquariumWorld } from "../components/Aquarium";
import { font, hex, letterColorFor, palette } from "../data/tokens";
import { cover } from "./cover";

// ── Letter Recognition covers (1280×720 and 1080×1920 from one component) ────
// Wears THE AQUARIUM — recognition's own world — with the board mid-game (five done,
// F lit) and the "F says fff" hero moment. Cover rules from cover.ts.
//
// EVERY block gets an explicit TOP and an assertion. The first version centred the hero
// on a point, which let its top edge run under the headline — the exact class of overlap
// a still can never get away with.
const GOLD_TILE = "#FF9F43";
const ROWS = [7, 6, 7, 6];
const HERO = REC_LETTERS[5]; // F · Fish
const HC = hex(letterColorFor(HERO.letter, HERO.imageColor));
const GAP = 10;

const boardGeom = (areaW: number) => {
  const cell = (areaW - 6 * GAP) / 7;
  return { cell, h: 4 * cell + 3 * GAP };
};

const Board: React.FC<{ x: number; w: number; y: number }> = ({ x, w, y }) => {
  const { cell } = boardGeom(w);
  let idx = 0;
  return (
    <>
      {ROWS.map((count, row) => {
        const rowW = count * cell + (count - 1) * GAP;
        const rowX = x + (w - rowW) / 2;
        return Array.from({ length: count }, (_, col) => {
          const i = idx++;
          const l = REC_LETTERS[i];
          const done = i < 5;
          const current = i === 5;
          const isVowel = "AEIOU".includes(l.letter);
          const wc = letterColorFor(l.letter, l.imageColor);
          const bg = current ? "#8E24AA" : done && isVowel ? GOLD_TILE : isVowel ? "rgba(255,159,67,0.18)" : "rgba(56,86,190,0.1)";
          const fg = current ? "#fff" : done ? (isVowel ? "#fff" : wc) : isVowel ? "#E67E22" : "rgba(30,36,56,0.5)";
          return (
            <div
              key={l.letter}
              style={{
                position: "absolute", left: rowX + col * (cell + GAP), top: y + row * (cell + GAP),
                width: cell, height: cell, borderRadius: cell * 0.18,
                background: bg, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: current ? "0 8px 22px rgba(142,36,170,0.45), 0 0 0 5px rgba(142,36,170,0.28)" : "none",
                fontFamily: font.family, transform: current ? "scale(1.12)" : undefined,
              }}
            >
              <span style={{ fontSize: cell * 0.56, fontWeight: 800, color: fg, lineHeight: 1 }}>{l.letter}</span>
            </div>
          );
        });
      })}
    </>
  );
};

export const ThumbRecognition: React.FC<{ width: number; height: number }> = ({ width: W, height: H }) => {
  const C = cover(W, H);
  const portrait = H > W;

  // ── COLUMN ARITHMETIC, all tops explicit ──
  const HEAD_TOP = portrait ? 190 : 54;
  const HEAD_SIZE = C.headSize(portrait ? "RECOGNITION".length : "LETTER RECOGNITION".length);
  const HEAD_H = (portrait ? 2 : 1) * HEAD_SIZE * 1.04;

  const B = portrait
    ? { x: 90, w: W - 180, y: 610 }
    : { x: 210, w: 600, y: 200 };
  const G = boardGeom(B.w);

  // hero: letter row + card + says line, explicit top
  const HERO_TOP = portrait ? 1150 : 200;
  const CARD = portrait ? 320 : 250;
  const LETTER_F = portrait ? 170 : 132;
  const SAYS_F = portrait ? 56 : 42;
  const heroH = LETTER_F * 0.95 + 12 + CARD + 10 + SAYS_F * 1.2;
  const heroCX = portrait ? W / 2 : 1068;

  if (HEAD_TOP + HEAD_H + 20 > (portrait ? B.y : Math.min(B.y, HERO_TOP))) {
    throw new Error(`thumb: headline ends ${HEAD_TOP + HEAD_H}, content starts ${portrait ? B.y : Math.min(B.y, HERO_TOP)}`);
  }
  if (portrait && B.y + G.h + 30 > HERO_TOP) {
    throw new Error(`thumb: board ends ${B.y + G.h}, hero starts ${HERO_TOP}`);
  }
  if (!portrait && B.x + B.w + 90 > heroCX - CARD / 2 - 40) {
    throw new Error(`thumb: board ends ${B.x + B.w}, hero column starts ${heroCX - CARD / 2}`);
  }
  // the mascot (bottom-left, cover-sized) must clear the hero column horizontally in
  // portrait and the board vertically in landscape
  const mascotW = portrait ? C.mascot.width * 0.86 : C.mascot.width; // portrait: a touch under the shared rule
  const mascotH = mascotW * C.mascot.aspect;
  if (portrait && mascotW + 10 > heroCX - CARD / 2) {
    throw new Error(`thumb: mascot ends ${mascotW}, hero card starts ${heroCX - CARD / 2}`);
  }
  if (!portrait && C.mascot.left + mascotW > B.x - 8) {
    throw new Error(`thumb: mascot ends ${C.mascot.left + mascotW}, the board starts ${B.x}`);
  }

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <AquariumWorld tone={HC} />

      <div style={{ position: "absolute", ...C.badge, color: palette.ink }}>
        FIND THE<br /><span style={C.badgeSub}>LETTER!</span>
      </div>

      <div
        style={{
          position: "absolute", left: portrait ? 0 : 200, top: HEAD_TOP, width: portrait ? W : 956, textAlign: "center", whiteSpace: portrait ? undefined : "nowrap",
          fontSize: HEAD_SIZE, fontWeight: C.head.fontWeight, lineHeight: C.head.lineHeight,
          letterSpacing: C.head.letterSpacing, color: palette.ink,
          textShadow: "0 6px 0 rgba(255,255,255,0.9), 0 10px 26px rgba(30,36,56,0.22)",
        }}
      >
        {portrait ? <>LETTER<br />RECOGNITION</> : "LETTER RECOGNITION"}
      </div>

      <Board x={B.x} w={B.w} y={B.y} />

      {/* hero: explicit top, stacked down from there */}
      <div
        style={{
          position: "absolute", left: heroCX, top: HERO_TOP, transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, color: HC, fontWeight: 800, lineHeight: 0.9 }}>
          <span style={{ fontSize: LETTER_F }}>{HERO.letter}</span>
          <span style={{ fontSize: LETTER_F * 0.74 }}>{HERO.letter.toLowerCase()}</span>
        </div>
        <div
          style={{
            width: CARD, height: CARD, background: "#fff", borderRadius: 28,
            border: `8px solid ${HC}`, boxShadow: `0 16px 36px ${HC}44`,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 14, boxSizing: "border-box",
          }}
        >
          <Img src={staticFile(`letters/${HERO.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: SAYS_F, fontWeight: 800 }}>
          <span style={{ color: "#6B5B86" }}>says </span>
          <span style={{ color: HC }}>{HERO.sound}!</span>
        </div>
      </div>

      <Img
        src={staticFile("mascot.png")}
        style={{ position: "absolute", left: C.mascot.left, bottom: C.mascot.bottom, width: mascotW, height: "auto" }}
      />
      <Img
        src={staticFile("logo.png")}
        style={
          portrait
            ? { position: "absolute", ...C.logo, height: "auto" }
            : { position: "absolute", right: C.logo.right, top: 16, width: C.logo.width, height: "auto" }
        }
      />
    </AbsoluteFill>
  );
};

export const ThumbRecognition169: React.FC = () => <ThumbRecognition width={1280} height={720} />;
export const ThumbRecognition916: React.FC = () => <ThumbRecognition width={1080} height={1920} />;
