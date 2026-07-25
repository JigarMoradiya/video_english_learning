import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { REC_LETTERS } from "../data/recognition";
import { letterColorFor, font } from "../data/tokens";

// Persistent 26-letter game board (left side), vertically centred. Rows of 7·6·7·6 (=26,
// no empty cells), each row centred horizontally. Fills up A→Z: past = filled + ✓,
// current = orange (app parity), upcoming = faint blue. Exports pixel geometry so the
// spotlight + panel fly-in can target exact cell centres.
const ROWS = [7, 6, 7, 6];

const LAYOUT = (() => {
  const gap = 16;
  const areaX = 56, areaW = 852; // left column (panel starts at 1000)
  const maxCols = Math.max(...ROWS);
  const cell = (areaW - (maxCols - 1) * gap) / maxCols;
  const blockH = ROWS.length * cell + (ROWS.length - 1) * gap;
  const originY = (1080 - blockH) / 2; // vertically centred in the frame
  const items: { x: number; y: number }[] = [];
  let idx = 0;
  ROWS.forEach((count, row) => {
    const rowW = count * cell + (count - 1) * gap;
    const rowStartX = areaX + (areaW - rowW) / 2; // each row centred horizontally
    for (let col = 0; col < count; col++) {
      items[idx++] = {
        x: rowStartX + col * (cell + gap) + cell / 2,
        y: originY + row * (cell + gap) + cell / 2,
      };
    }
  });
  return { cell, items };
})();

export const GRID = { cell: LAYOUT.cell };
export const cellCenter = (i: number) => LAYOUT.items[i];

export const LetterGrid: React.FC<{ active: number; activeDone?: boolean }> = ({ active, activeDone = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cell = GRID.cell;

  return (
    <>
      {REC_LETTERS.map((l, i) => {
        const { x, y } = cellCenter(i);
        const appear = spring({ frame: frame - 8 - i * 2, fps, config: { damping: 13 } });
        const done = i < active || (i === active && activeDone); // checks off during its own celebration
        const current = i === active && !activeDone;
        const wc = letterColorFor(l.letter, l.imageColor);
        const idle = Math.sin(frame / fps * 1.6 + i) * 2;
        const isVowel = "AEIOU".includes(l.letter);
        const GRAY = "rgba(56,86,190,0.1)"; // shared consonant background (never fills with colour)

        // Vowels: warm-tint when upcoming, solid ORANGE (like the selected tile) once done — pop hard.
        // Consonants: background stays GRAY always; only the letter's TEXT colour changes when done.
        const bg = current ? "#FF9F43" : done ? (isVowel ? "#FF9F43" : GRAY) : isVowel ? "rgba(255,159,67,0.18)" : GRAY;
        const fg = current ? "#fff" : done ? (isVowel ? "#fff" : wc) : isVowel ? "#E67E22" : "rgba(30,36,56,0.5)";
        const scale = (current ? 1.12 : 1) * appear;

        return (
          <div
            key={l.letter}
            style={{
              position: "absolute",
              left: x - cell / 2,
              top: y - cell / 2,
              width: cell,
              height: cell,
              borderRadius: 16,
              background: bg,
              boxShadow: current ? "0 10px 26px rgba(255,140,0,0.55), 0 0 0 6px rgba(255,159,67,0.28)" : done ? "0 4px 12px rgba(30,36,56,0.08)" : "none",
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
