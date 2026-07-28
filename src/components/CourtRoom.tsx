import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { hex, palette, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { safeX } from "./LandscapeBeatKit";

// ── The Word Court — the ge/dge set, and the first 3D-styled world ───────────
// Seventh card, seventh world. The card named it: `judge` and `badge` are two of its own
// example words, and the rule IS a verdict — you look at the letter before the sound and
// rule ge or dge. So the set is a courtroom, and the mascot is the judge.
//
// THE 3D LOOK is pure CSS, deliberately not three.js:
//   · `perspective` on the stage container + a small rotateX on the furniture, so the bench
//     and the floor recede
//   · every card is EXTRUDED with stacked hard box-shadows (`slab()`), which reads as a solid
//     slab rather than a flat rectangle and never fails to render
//   · three background layers drift at different speeds for parallax depth
// A three.js scene would add a heavy dependency and a whole new class of render failure for a
// look this technique already gets.
//
// LAYOUT LAW (LandscapeBeatKit): the STAGE band y 300…860 only.
//
//   360 … 560   the word tiles
//   580 … 660   the ↑ label under the letter before
//   664 … 730   the verdict chip
//   742 … 860   the bench and floor

const BENCH_Y = 742;

export const CourtSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (s: number, span: number, p: number) => ((frame * s + p) % (width + span)) - span;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2B1B3D 0%, #462A55 32%, #7A4A63 62%, #C08A6A 100%)" }}>
      {/* PARALLAX LAYER 1 — tall arched windows, slowest */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        {[0.10, 0.32, 0.55, 0.78].map((k, i) => {
          const x = k * width + Math.sin(frame / 240 + i) * 6;
          return (
            <g key={i}>
              <path d={`M${x - 96} 470 L${x - 96} 150 q 96 -120 192 0 L${x + 96} 470 Z`} fill="#F6D9A8" opacity={0.22} />
              <path d={`M${x - 96} 470 L${x - 96} 150 q 96 -120 192 0 L${x + 96} 470 Z`} fill="none" stroke="#F6D9A8" strokeWidth={9} opacity={0.5} />
              <line x1={x} y1={150} x2={x} y2={470} stroke="#F6D9A8" strokeWidth={7} opacity={0.42} />
            </g>
          );
        })}
      </svg>

      {/* PARALLAX LAYER 2 — brass pendant lamps, mid speed */}
      {[0.26, 0.5, 0.74].map((k, i) => {
        const x = k * width;
        const sway = Math.sin(frame / (52 + i * 11) + i) * 9;
        return (
          <svg key={i} width={150} height={330} style={{ position: "absolute", left: x - 75, top: 0 }}>
            <g transform={`rotate(${sway * 0.5} 75 0)`}>
              <line x1={75} y1={0} x2={75} y2={150} stroke="#8D6E63" strokeWidth={5} />
              <path d="M35 150 q 40 -34 80 0 l -14 40 l -52 0 Z" fill="#C89B3C" />
              <ellipse cx={75} cy={196} rx={40} ry={12} fill="#FFE9A8" opacity={0.85} />
              <ellipse cx={75} cy={230} rx={80} ry={44} fill="#FFE9A8" opacity={0.16} />
            </g>
          </svg>
        );
      })}

      {/* PARALLAX LAYER 3 — dust motes in the lamp light, fastest */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 26 }).map((_, i) => {
          const seed = i * 83.7;
          const x = drift(0.28 + (i % 4) * 0.09, 120, seed * 9);
          const y = 180 + ((seed * 3.3) % 460) + Math.sin(frame / 34 + i) * 14;
          return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 4 : 2.6} fill="#FFE9A8" opacity={0.5} />;
        })}
      </svg>

      {/* the bench and floor, in perspective */}
      <div style={{ position: "absolute", left: 0, top: 0, width, height, perspective: 1400, pointerEvents: "none" }}>
        {/* floor plane, tilted away */}
        <div
          style={{
            position: "absolute", left: -200, top: BENCH_Y + 40, width: width + 400, height: 460,
            background: "repeating-linear-gradient(90deg, #6B4A32 0 118px, #7C563A 118px 236px)",
            transform: "rotateX(62deg)", transformOrigin: "top center",
            boxShadow: "inset 0 40px 60px rgba(0,0,0,0.45)",
          }}
        />
        {/* the judge's bench — a slab with a visible top edge */}
        <div
          style={{
            position: "absolute", left: safeX(width) - 40, top: BENCH_Y, width: width - 2 * safeX(width) + 80, height: 128,
            background: "linear-gradient(180deg, #8D5A3B 0%, #6E4429 100%)",
            borderRadius: 12, transform: "rotateX(9deg)", transformOrigin: "top center",
            boxShadow: "0 12px 0 #4E2F1C, 0 26px 44px rgba(10,6,20,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute", left: safeX(width) - 52, top: BENCH_Y - 20, width: width - 2 * safeX(width) + 104, height: 30,
            background: "linear-gradient(180deg, #A9704A 0%, #8D5A3B 100%)", borderRadius: 10,
            boxShadow: "0 8px 0 #6E4429",
          }}
        />
        {/* brass rail along the bench */}
        <div style={{ position: "absolute", left: safeX(width) - 20, top: BENCH_Y - 30, width: width - 2 * safeX(width) + 40, height: 9, borderRadius: 5, background: "linear-gradient(180deg, #F0CE7A, #C89B3C)" }} />
      </div>
    </AbsoluteFill>
  );
};

// ── the judge, and the gavel that bangs on cue ──────────────────────────────
// The gavel stands on the bench NEXT TO the mascot, not in its paw. Drawing it as held meant
// guessing where the art's paw is: the handle came out of the bear's foot and the head floated
// off to one side. A gavel resting on its own sound block reads correctly and swings cleanly.
export const Judge: React.FC<{ bangAt?: number[] }> = ({ bangAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  // the most recent bang, so the gavel swings once per cue rather than continuously
  let last = -1;
  for (const b of bangAt) if (frame >= b) last = b;
  const t = last >= 0 ? frame - last : 999;
  // the head rests raised at ~-33° from the pivot, so +30 is the angle that lands it on the
  // block: wind up, strike, bounce, settle
  const swing = t < 26 ? interpolate(t, [0, 5, 11, 17, 26], [0, -22, 30, 12, 0]) : 0;
  const hit = t >= 11 && t < 19;
  const x = safeX(width) - 6;
  return (
    <div style={{ position: "absolute", left: x, top: BENCH_Y - 250, width: 400 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ width: 182, transform: `translateY(${bob(frame, fps, 3.4, 3)}px) rotate(${wiggle(frame, fps, 2.4, 2.2)}deg)` }}
      />
      {/* The gavel and its sound block, on the bench lip just right of the mascot. Kept inside
          x 250…360 (absolute) because the family beat's first podium starts at 390, and drawn
          in BRASS — the first pass was bench-brown on a bench and read as a dropped stick. */}
      <svg width={210} height={150} style={{ position: "absolute", left: 168, top: 132, overflow: "visible", transform: "scale(0.86)", transformOrigin: "left bottom" }}>
        {/* sound block first, so the head lands ON it */}
        <rect x={50} y={98} width={100} height={22} rx={10} fill="#4E2F1C" />
        <rect x={58} y={91} width={84} height={13} rx={7} fill="#7C563A" />
        <g transform={`rotate(${swing} 16 94)`}>
          <line x1={16} y1={94} x2={94} y2={42} stroke="#5D4037" strokeWidth={14} strokeLinecap="round" />
          <circle cx={16} cy={94} r={10} fill="#4E2F1C" />
          <rect x={72} y={18} width={68} height={48} rx={13} fill="#E8B84B" stroke="#8D6E63" strokeWidth={6} />
          <rect x={72} y={35} width={68} height={11} fill="#A9704A" opacity={0.7} />
        </g>
        {/* a shock ring off the block on the strike */}
        {hit && <circle cx={100} cy={96} r={12 + (t - 11) * 6} fill="none" stroke="#FFE9A8" strokeWidth={6} opacity={1 - (t - 11) / 8} />}
      </svg>
    </div>
  );
};

// ── a 3D verdict placard, used by the ge/dge beats ──────────────────────────
export const Placard: React.FC<{
  children: React.ReactNode; colorHex: string; at?: number; size?: number; depth?: number; lit?: boolean;
}> = ({ children, colorHex, at = 0, size = 58, depth = 12, lit = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(colorHex);
  return (
    <div
      style={{
        background: lit ? "#FFFDF6" : "#FFFDF6CC", border: `7px solid ${c}`, borderRadius: 24,
        padding: "14px 32px", fontSize: size, fontWeight: 700, color: palette.ink,
        fontFamily: font.family, whiteSpace: "nowrap",
        boxShadow: slab(colorHex, depth),
        transform: `perspective(900px) rotateX(7deg) scale(${0.78 + 0.22 * s}) translateY(${bob(frame, fps, 6, 2.4)}px)`,
      }}
    >
      {children}
    </div>
  );
};
