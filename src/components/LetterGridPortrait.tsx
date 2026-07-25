import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { REC_LETTERS } from "../data/recognition";
import { font } from "../data/tokens";

// Portrait 26-letter board — same 7·6·7·6 rows as the 16:9 grid (no empty cells) but sized
// for a 1080-wide frame and parked in the UPPER band, with the letter panel below it.
// On the pink theme the tiles are frosted white; the current tile goes solid warm, done
// tiles keep a soft fill. Exports cell geometry so the panel can fly the letter out of it.
const ROWS = [7, 6, 7, 6];
export const GRID_TOP = 206;

const LAYOUT = (() => {
  const gap = 13;
  const areaX = 78, areaW = 924; // ~78px side safe margin
  const maxCols = Math.max(...ROWS);
  const cell = (areaW - (maxCols - 1) * gap) / maxCols; // ~130px
  const items: { x: number; y: number }[] = [];
  let idx = 0;
  ROWS.forEach((count, row) => {
    const rowW = count * cell + (count - 1) * gap;
    const rowStartX = areaX + (areaW - rowW) / 2;
    for (let col = 0; col < count; col++) {
      items[idx++] = { x: rowStartX + col * (cell + gap) + cell / 2, y: GRID_TOP + row * (cell + gap) + cell / 2 };
    }
  });
  return { cell, items, height: ROWS.length * cell + (ROWS.length - 1) * gap };
})();

export const PGRID = { cell: LAYOUT.cell, height: LAYOUT.height, bottom: GRID_TOP + LAYOUT.height };
export const pCellCenter = (i: number) => LAYOUT.items[i];

export const LetterGridPortrait: React.FC<{ active: number; activeDone?: boolean }> = ({ active, activeDone = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cell = PGRID.cell;

  return (
    <>
      {REC_LETTERS.map((l, i) => {
        const { x, y } = pCellCenter(i);
        const appear = spring({ frame: frame - 8 - i * 2, fps, config: { damping: 13 } });
        const done = i < active || (i === active && activeDone);
        const current = i === active && !activeDone;
        const idle = Math.sin((frame / fps) * 1.6 + i) * 2;
        const isVowel = "AEIOU".includes(l.letter);

        // VOWELS stay emphasised the whole way (like the 16:9): warm-tinted while upcoming,
        // then solid ORANGE once done so they pop off the pink. Consonants: faint → frosted white.
        // Current letter is the brightest (gold + glow ring) so it still out-reads a done vowel.
        const bg = current ? "#FFC24A"
          : done ? (isVowel ? "#FF8A2B" : "rgba(255,255,255,0.72)")
          : isVowel ? "rgba(255,138,43,0.34)" : "rgba(255,255,255,0.13)";
        const fg = current ? "#6E2038"
          : done ? (isVowel ? "#fff" : "#7A2A4C")
          : isVowel ? "#FFD3A6" : "rgba(255,255,255,0.6)";
        const scale = (current ? 1.16 : done && isVowel ? 1.05 : 1) * appear;

        return (
          <div
            key={l.letter}
            style={{
              position: "absolute",
              left: x - cell / 2,
              top: y - cell / 2,
              width: cell,
              height: cell,
              borderRadius: 20,
              background: bg,
              boxShadow: current ? "0 10px 30px rgba(255,170,40,0.65), 0 0 0 7px rgba(255,194,74,0.34)" : done ? (isVowel ? "0 8px 20px rgba(255,138,43,0.5)" : "0 4px 12px rgba(0,0,0,0.14)") : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${idle}px) scale(${scale})`,
              opacity: appear,
              fontFamily: font.family,
            }}
          >
            <span style={{ fontSize: cell * 0.56, fontWeight: 800, color: fg, lineHeight: 1 }}>{l.letter}</span>
          </div>
        );
      })}
    </>
  );
};
