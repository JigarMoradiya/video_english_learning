import React from "react";
import strokeData from "../data/letterStrokes.json";

// Per-letter sampled stroke polylines (normalized 0–1), dumped from the app's
// LetterSkeleton geometry (tools/dump_letter_strokes.sh). Keyed by the exact
// character, e.g. "A" and "a".
const STROKES = strokeData as Record<string, number[][][]>;

export const hasGlyph = (ch: string) => STROKES[ch] != null;

// A letter that "draws itself" the way the app's AutoTracePreviewView does:
// a faint base skeleton, then the colored stroke fills in point-by-point (glow +
// main), with a finger dot riding the tip. `progress` (0–1) covers ALL strokes
// laid end-to-end, so the whole letter is drawn once progress reaches 1.
export const TraceGlyph: React.FC<{
  char: string;
  color: string;
  box: number; // square px size
  progress: number; // 0..1 across the whole letter
  showDot?: boolean;
  touch?: boolean; // render the tip as a fingertip "touch" (glow ring + white core)
  pad?: number; // fraction of box kept as margin
}> = ({ char, color, box, progress, showDot = true, touch = false, pad = 0.12 }) => {
  const strokes = STROKES[char];
  if (!strokes || strokes.length === 0) return null;

  // fit the glyph's bounding box into the square, preserving aspect ratio
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes) for (const [x, y] of s) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const bw = maxX - minX || 1, bh = maxY - minY || 1;
  const inner = box * (1 - 2 * pad);
  const s = inner / Math.max(bw, bh);
  const ox = box * pad + (inner - bw * s) / 2;
  const oy = box * pad + (inner - bh * s) / 2;
  const tx = (x: number) => ox + (x - minX) * s;
  const ty = (y: number) => oy + (y - minY) * s;

  const px = strokes.map((st) => st.map(([x, y]) => [tx(x), ty(y)] as [number, number]));
  const total = px.reduce((a, st) => a + st.length, 0);
  const revealed = progress * total;

  const main = box * 0.1;
  const glow = box * 0.17;
  const dotR = box * 0.055;
  const d = (pts: [number, number][]) =>
    pts.length < 2 ? "" : "M " + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ");

  // how many points of each stroke are revealed, in order
  let rev = revealed;
  const drawn = px.map((st) => {
    const take = Math.max(0, Math.min(st.length, rev));
    rev -= st.length;
    return st.slice(0, Math.round(take));
  });
  // finger-dot tip = last point of the stroke currently being drawn
  let tip: [number, number] | null = null;
  if (progress < 1) {
    for (let i = 0; i < px.length; i++) {
      if (drawn[i].length > 0 && drawn[i].length < px[i].length) { tip = drawn[i][drawn[i].length - 1]; break; }
      if (drawn[i].length > 0 && (i === px.length - 1 || drawn[i + 1].length === 0)) { tip = drawn[i][drawn[i].length - 1]; }
    }
  }

  return (
    <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} style={{ overflow: "visible" }}>
      {/* base skeleton */}
      {px.map((st, i) => (
        <path key={`b${i}`} d={d(st)} fill="none" stroke="rgba(30,36,56,0.16)" strokeWidth={main} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* colored draw: glow behind, main in front */}
      {drawn.map((st, i) => st.length >= 2 && (
        <path key={`g${i}`} d={d(st)} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={glow} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {drawn.map((st, i) => st.length >= 2 && (
        <path key={`m${i}`} d={d(st)} fill="none" stroke={color} strokeWidth={main} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {showDot && tip && (touch ? (
        <g>
          <circle cx={tip[0]} cy={tip[1]} r={dotR * 2.2} fill={color} opacity={0.22} />
          <circle cx={tip[0]} cy={tip[1]} r={dotR * 1.35} fill="#fff" />
          <circle cx={tip[0]} cy={tip[1]} r={dotR * 0.82} fill={color} />
        </g>
      ) : (
        <circle cx={tip[0]} cy={tip[1]} r={dotR} fill={color} />
      ))}
    </svg>
  );
};
