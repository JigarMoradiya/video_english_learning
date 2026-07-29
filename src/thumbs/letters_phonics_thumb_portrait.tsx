import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { LETTERS } from "../data/letters";
import { font, hex, letterColorFor, palette, tint } from "../data/tokens";

// ── Letter Sounds A–Z thumbnail, PORTRAIT 9:16 ───────────────────────────────
//   npx remotion still thumb-letters-phonics-9x16 out/thumb_letters_phonics_9x16.png
//
// Facebook shows a portrait crop even for a landscape video, so the 16:9 version loses
// the mascot and the logo at the edges. Recomposed for a tall frame rather than cropped:
//
//   · the headline STACKS on two lines instead of shrinking to fit one
//   · the A–Z strip becomes THREE ROWS of 9 / 9 / 8. Twenty-six cells across 1080px
//     would be 41px each and unreadable, and thirteen still filled the frame edge to
//     edge; nine gives 95px cells inside a proper margin. The short last row is centred.
//   · the hero letter sits beside its picture card, as in the video, with the sound
//     spelled out beneath — the tall frame has room for both
//
// Every band is a fraction of the height, and the gaps between them are asserted, so a
// retune cannot silently reopen the dead space this layout exists to avoid.
const GOLD = "#FFC42A";
const HERO = LETTERS[0]; // A · Ant
const HC = hex(letterColorFor(HERO.letter, HERO.imageColor));
const PER_ROW = 9;

export const ThumbLettersPhonicsPortrait: React.FC = () => {
  const { width: W, height: H } = useVideoConfig();

  const headTop = H * 0.115;
  const headSize = H * 0.080;
  const headEnd = headTop + headSize * 2.08;

  // The sound line sits ABOVE the letter + picture and the naming line BELOW it, which
  // is the order the video itself uses. Each band is derived from the one above, so the
  // rhythm holds if any single size changes.
  const lineSize = H * 0.044;
  const GAP = H * 0.022;

  const saysTop = headEnd + GAP;
  const saysEnd = saysTop + lineSize * 1.2;

  const heroTop = saysEnd + GAP;
  const cardSize = W * 0.30;
  const heroEnd = heroTop + cardSize;

  const forTop = heroEnd + GAP;
  const forEnd = forTop + lineSize * 1.2;

  // The grid must total 88% of the frame INCLUDING its gaps. Dividing the width by 13
  // first and adding gaps afterwards made it exactly 1080 wide, so the strip ran
  // edge to edge with no margin: cellW * (13 + 12 * 0.12) = W * 0.88.
  const cellW = (W * 0.88) / (PER_ROW + (PER_ROW - 1) * 0.12);
  const cellH = cellW * 0.86;
  const cellGap = cellW * 0.12;
  const ROWS = Math.ceil(LETTERS.length / PER_ROW);
  // each row is centred on its OWN width, so the short final row (8 of 9) sits centred
  // instead of hanging left with a gap on the right
  const rowLeft = (n: number) => (W - (n * cellW + (n - 1) * cellGap)) / 2;
  const rowCount = (r: number) => Math.min(PER_ROW, LETTERS.length - r * PER_ROW);
  const stripTop = forEnd + GAP;
  const stripEnd = stripTop + ROWS * cellH + (ROWS - 1) * cellGap;

  const mascotH = H * 0.17;
  const mascotW = mascotH * (923 / 1063);
  // mascot.png has ~7px of bottom padding on 1063, so its feet are effectively the last
  // pixel row: anything <= 0 reads as cropped. Give it real clearance.
  const mascotBottom = H * 0.02;
  const mascotTop = H - mascotBottom - mascotH;

  // the gaps this layout exists to control
  if (saysTop - headEnd < H * 0.02) throw new Error(`portrait: headline ${headEnd} crowds the sound line ${saysTop}`);
  if (heroTop - saysEnd < H * 0.02) throw new Error(`portrait: sound line ${saysEnd} crowds the hero ${heroTop}`);
  if (stripTop - forEnd < H * 0.02) throw new Error(`portrait: naming line ${forEnd} crowds the strip ${stripTop}`);
  if (mascotTop - stripEnd < H * 0.02) throw new Error(`portrait: strip ${stripEnd} crowds the mascot ${mascotTop}`);

  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      {/* the letter's own colour flooding the frame, exactly as LetterScene does */}
      <AbsoluteFill style={{ background: `linear-gradient(168deg, ${tint(HC, 0.78)} 0%, #FFFFFF 58%, ${tint(HC, 0.9)} 100%)` }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {[
          { x: W * 0.1, y: H * 0.075, s: 1.1, star: false, li: 8 },
          { x: W * 0.92, y: H * 0.2, s: 1.3, star: true, li: 2 },
          { x: W * 0.08, y: H * 0.55, s: 0.9, star: true, li: 14 },
          { x: W * 0.9, y: H * 0.72, s: 1.0, star: false, li: 20 },
        ].map((sh, i) => {
          const l = LETTERS[sh.li];
          const c = hex(letterColorFor(l.letter, l.imageColor));
          const k = (W / 1280) * sh.s;
          if (sh.star) {
            const pts = Array.from({ length: 10 }, (_, q) => {
              const a = (q / 10) * Math.PI * 2 - Math.PI / 2;
              const r = (q % 2 ? 40 : 92) * k;
              return `${sh.x + Math.cos(a) * r},${sh.y + Math.sin(a) * r}`;
            }).join(" ");
            return <polygon key={i} points={pts} fill={c} opacity={0.13} />;
          }
          const bw = 168 * k;
          return (
            <rect
              key={i} x={sh.x - bw / 2} y={sh.y - bw / 2} width={bw} height={bw} rx={38 * k}
              fill={c} opacity={0.12} transform={`rotate(${i % 2 ? 14 : -12} ${sh.x} ${sh.y})`}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute", left: W * 0.028, top: H * 0.015, transform: "rotate(-11deg)",
          background: GOLD, color: palette.ink, borderRadius: W * 0.02,
          padding: `${H * 0.0075}px ${W * 0.022}px`,
          fontSize: H * 0.03, fontWeight: 800, lineHeight: 1.05, textAlign: "center",
          boxShadow: "0 10px 24px rgba(30,36,56,0.30)",
        }}
      >
        ALL 26<br /><span style={{ fontSize: H * 0.021 }}>LETTERS</span>
      </div>


      <div
        style={{
          position: "absolute", left: 0, top: headTop, width: W, textAlign: "center",
          fontSize: headSize, fontWeight: 800, color: palette.ink, lineHeight: 1.04,
          textShadow: "0 6px 0 #FFFFFF, 0 10px 26px rgba(30,36,56,0.22)",
        }}
      >
        LETTER<br />SOUNDS
      </div>

      {/* the sound, above the letter — and lowercase, which is how the sound is written */}
      <div
        style={{
          position: "absolute", left: 0, top: saysTop, width: W, textAlign: "center",
          fontSize: lineSize, fontWeight: 800, color: palette.ink, lineHeight: 1.2,
        }}
      >
        {HERO.letter} says <span style={{ color: HC }}>{HERO.soundToken.toLowerCase()}!</span>
      </div>

      {/* the hero pair beside its picture card — the video's own composition */}
      <div
        style={{
          position: "absolute", left: 0, top: heroTop, width: W, height: cardSize,
          display: "flex", alignItems: "center", justifyContent: "center", gap: W * 0.045,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", color: HC, fontWeight: 800, lineHeight: 0.9 }}>
          <span style={{ fontSize: cardSize * 0.86, textShadow: `0 14px 30px ${HC}44` }}>{HERO.letter}</span>
          <span style={{ fontSize: cardSize * 0.62, textShadow: `0 14px 30px ${HC}44` }}>{HERO.letter.toLowerCase()}</span>
        </div>
        <div
          style={{
            width: cardSize, height: cardSize, background: "#fff", borderRadius: W * 0.036,
            border: `${W * 0.009}px solid ${HC}`, boxShadow: `0 18px 40px ${HC}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: cardSize * 0.09, boxSizing: "border-box",
          }}
        >
          <Img src={staticFile(`letters/${HERO.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
      </div>

      <div
        style={{
          position: "absolute", left: 0, top: forTop, width: W, textAlign: "center",
          fontSize: lineSize, fontWeight: 800, color: palette.ink, lineHeight: 1.2,
        }}
      >
        {HERO.letter} for {HERO.word}
      </div>

      {/* the A–Z strip: three rows of 9/9/8, each row centred on its own width */}
      {LETTERS.map((l, i) => {
        const c = hex(letterColorFor(l.letter, l.imageColor));
        const row = Math.floor(i / PER_ROW);
        const col = i % PER_ROW;
        return (
          <div
            key={l.letter}
            style={{
              position: "absolute",
              left: rowLeft(rowCount(row)) + col * (cellW + cellGap),
              top: stripTop + row * (cellH + cellGap),
              width: cellW, height: cellH, borderRadius: cellW * 0.24, background: c,
              boxShadow: `0 6px 14px ${c}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: cellH * 0.6, fontWeight: 800, color: "#fff",
            }}
          >
            {l.letter}
          </div>
        );
      })}

      <Img
        src={staticFile("mascot.png")}
        style={{
          position: "absolute", left: W * 0.02, bottom: mascotBottom, width: mascotW, height: "auto",
          filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))",
        }}
      />
      {/* bottom-right, not top-right: this frame has no world to fill its lower third,
          so the logo balances the mascot instead of leaving that corner empty */}
      <Img src={staticFile("logo.png")} style={{ position: "absolute", right: W * 0.05, bottom: H * 0.045, width: W * 0.17, height: "auto" }} />
    </AbsoluteFill>
  );
};
