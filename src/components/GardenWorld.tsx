import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { safeX } from "./LandscapeBeatKit";

// ── The Magic Garden — the hard g / soft g world ────────────────────────────
// Bright, like the Bakery, because dark grounds fight the cards (see BakeryWorld). But a
// different place: outdoors, green and blue, where the Bakery was a warm cream interior.
//
// It holds BOTH halves of this card's word list, which is why it beats a prettier idea:
//   hard g — goat, green, glad, flag, wagon      → the garden itself
//   soft g — gem, giant, magic                   → the giant beanstalk and its sparkles
//
// Same three rules as the Bakery, and they are now the standing ones:
//   1. background is atmosphere, pushed back to low contrast
//   2. a light wash behind the teaching zone
//   3. cards fully opaque, strong border, slab extrusion
//
// LAYOUT: the rows are derived in the beats file from FENCE_Y; nothing is typed by feel.

export const FENCE_Y = 856;

// ── the hill, and the ground level under any x ───────────────────────────────
// The treeline used to sit at a fixed y while the hill was a curve, so trees floated above the
// ground on the rises and sank into it in the dips. Both the path and the trees now come from
// the same two quadratic segments.
const seg = (t: number, p0: number, c: number, p1: number) =>
  (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * c + t * t * p1;

export const hillPath = (w: number, h: number) =>
  `M0 470 q ${w * 0.28} -120 ${w * 0.52} -10 q ${w * 0.26} 104 ${w * 0.48} -26 L${w} ${h} L0 ${h} Z`;

export const hillY = (x: number, w: number): number => {
  // segment 1: (0,470) ctrl (0.28w,350) → (0.52w,460)   segment 2: → (w,434)
  const A = { x0: 0, cx: w * 0.28, x1: w * 0.52, y0: 470, cy: 350, y1: 460 };
  const B = { x0: w * 0.52, cx: w * 0.78, x1: w, y0: 460, cy: 564, y1: 434 };
  const s = x <= A.x1 ? A : B;
  // walk t to find the sample whose x matches — cheap and exact enough at this scale
  let best = 0, bestD = Infinity;
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const d = Math.abs(seg(t, s.x0, s.cx, s.x1) - x);
    if (d < bestD) { bestD = d; best = t; }
  }
  return seg(best, s.y0, s.cy, s.y1);
};

export const GardenSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #DFF3FF 0%, #EAF8FF 30%, #F3FBEF 58%, #DCF0C8 100%)" }}>
      {/* the light wash behind the teaching area — the brightest part of the frame */}
      <div
        style={{
          position: "absolute", left: 0, top: 180, width, height: 660,
          background: "radial-gradient(ellipse 62% 78% at 50% 45%, rgba(255,255,255,0.95), rgba(255,255,255,0))",
        }}
      />

      {/* BACKGROUND, deliberately low-contrast: rolling hills, with the treeline STANDING ON
          the hill rather than floating at a fixed height. hillY() samples the same two bezier
          segments the path is drawn from, so a tree's base is always the ground under it. */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.30 }}>
        <path d={hillPath(width, height)} fill="#7FB05A" />
        {Array.from({ length: 11 }).map((_, i) => {
          const x = 70 + i * ((width - 140) / 10);
          const ground = hillY(x, width);
          const h = 74 + ((i * 53) % 40);
          return (
            <g key={i}>
              <rect x={x - 7} y={ground - h * 0.5} width={14} height={h * 0.5} fill="#8D6E63" />
              <ellipse cx={x} cy={ground - h * 0.5 - 34} rx={52} ry={44} fill="#6FA24E" />
            </g>
          );
        })}
      </svg>

      {/* the sun, top-left and clear of the brand mark */}
      <svg width={240} height={240} style={{ position: "absolute", left: 46, top: 30, opacity: 0.75 }}>
        <g transform="translate(120 120)">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 + frame * 0.2) * (Math.PI / 180);
            return <line key={i} x1={Math.cos(a) * 76} y1={Math.sin(a) * 76} x2={Math.cos(a) * 102} y2={Math.sin(a) * 102} stroke="#FFD54F" strokeWidth={9} strokeLinecap="round" opacity={0.75} />;
          })}
          <circle cx={0} cy={0} r={64} fill="#FFE082" />
        </g>
      </svg>

      {/* A real tree on the right, rooted at the fence.
          THE CROWN IS ONE SILHOUETTE, not a pile of ellipses. Overlapping ellipses in two
          alternating greens showed every edge where they crossed, so it read as stacked
          circles rather than foliage. crownPath() walks lobes around one outline, and a
          slightly larger copy sits behind it as shading — so there is exactly one edge.
          The trunk and roots are STATIC and run 70px below the fence, where the grass covers
          them: rotating the whole tree opened a gap at the ground, and a real tree bends at
          the crown anyway. No triangular flares — the taper does that job. */}
      {(() => {
        const TX = 232;
        const base = FENCE_Y + 70;
        const top = 330;
        const BW = 38, TW = 16;
        const sway = Math.sin(frame / 62) * 3.4;
        // one lumpy outline: lobes bulge outward from an ellipse, each breathing on its own phase
        const crownPath = (cx: number, cy: number, rx: number, ry: number, lobes: number) => {
          let d = "";
          for (let i = 0; i < lobes; i++) {
            const a0 = (i / lobes) * Math.PI * 2;
            const a1 = ((i + 1) / lobes) * Math.PI * 2;
            const am = (a0 + a1) / 2;
            const bulge = 1.3 + 0.09 * Math.sin(frame / 44 + i * 1.7);
            const x0 = cx + Math.cos(a0) * rx, y0 = cy + Math.sin(a0) * ry;
            const x1 = cx + Math.cos(a1) * rx, y1 = cy + Math.sin(a1) * ry;
            const cxp = cx + Math.cos(am) * rx * bulge, cyp = cy + Math.sin(am) * ry * bulge;
            if (i === 0) d += `M${x0.toFixed(1)} ${y0.toFixed(1)}`;
            d += ` Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
          }
          return d + " Z";
        };
        const CY = top + 76;
        return (
          <svg width={460} height={height} style={{ position: "absolute", right: -40, top: 0, overflow: "visible" }}>
            {/* STATIC trunk, tapered, buried in the grass */}
            <g>
              <path
                d={`M${TX - BW} ${base}
                    C ${TX - BW + 8} ${base - (base - top) * 0.45}, ${TX - TW - 6} ${base - (base - top) * 0.7}, ${TX - TW} ${top + 96}
                    L ${TX + TW} ${top + 96}
                    C ${TX + TW + 6} ${base - (base - top) * 0.7}, ${TX + BW - 8} ${base - (base - top) * 0.45}, ${TX + BW} ${base} Z`}
                fill="#C2A288"
              />
              <path d={`M${TX - 5} ${base - 60} C ${TX - 12} ${base - 280}, ${TX + 5} ${base - 420}, ${TX - 2} ${top + 120}`} fill="none" stroke="#B08F76" strokeWidth={7} strokeLinecap="round" />
            </g>
            {/* SWAYING crown: shading copy behind, lit silhouette in front */}
            <g transform={`rotate(${sway} ${TX} ${top + 120})`}>
              <path d={`M${TX - TW + 2} ${top + 104} q -44 -20 -62 -50`} fill="none" stroke="#C2A288" strokeWidth={11} strokeLinecap="round" />
              <path d={`M${TX + TW - 2} ${top + 88} q 42 -18 60 -46`} fill="none" stroke="#C2A288" strokeWidth={11} strokeLinecap="round" />
              <path d={crownPath(TX, CY + 12, 150, 104, 9)} fill="#96C97A" />
              <path d={crownPath(TX, CY, 140, 96, 9)} fill="#B4DC98" />
            </g>
          </svg>
        );
      })()}

      {/* sparkles drifting off the beanstalk — the frame is never still */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const seed = i * 71.9;
          const y = FENCE_Y - ((frame * (0.32 + (i % 4) * 0.15) + seed * 12) % 760);
          const x = 150 + ((seed * 6.3) % (width - 300)) + Math.sin(frame / 42 + i) * 20;
          return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 5 : 3} fill="#FFFFFF" opacity={0.75} />;
        })}
      </svg>

      {/* the fence and the grass the whole lesson stands on */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={FENCE_Y} width={width} height={height - FENCE_Y} fill="#8FBF63" />
        <rect x={0} y={FENCE_Y} width={width} height={16} rx={8} fill="#A6D178" />
        {/* pickets */}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = i * (width / 26);
          return (
            <g key={i}>
              <rect x={x + 10} y={FENCE_Y - 74} width={30} height={78} rx={7} fill="#FFFDF6" stroke="#C9B79E" strokeWidth={4} />
              <path d={`M${x + 10} ${FENCE_Y - 74} l 15 -18 l 15 18 Z`} fill="#FFFDF6" stroke="#C9B79E" strokeWidth={4} />
            </g>
          );
        })}
        <rect x={0} y={FENCE_Y - 54} width={width} height={12} rx={6} fill="#FFFDF6" opacity={0.9} />
        {/* a few blades of grass, waving */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = 20 + i * (width / 30);
          const s = Math.sin(frame / 26 + i) * 5;
          return <path key={i} d={`M${x} ${height} q ${6 + s} -34 ${16 + s} -46`} fill="none" stroke="#6FA24E" strokeWidth={6} strokeLinecap="round" opacity={0.55} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── the gardener, at the left end of the fence ──────────────────────────────
export const Gardener: React.FC<{ cheerAt?: number[] }> = ({ cheerAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  let last = -1;
  for (const c of cheerAt) if (frame >= c) last = c;
  const t = last >= 0 ? frame - last : 999;
  const hop = t < 20 ? Math.abs(Math.sin((t / 20) * Math.PI)) * -22 : 0;
  const W = 196;
  const H = Math.round(W * (1063 / 923)); // mascot.png is 923×1063 with no bottom padding
  return (
    <div style={{ position: "absolute", left: safeX(width) - 12, top: FENCE_Y - H + 16, width: W + 40 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ width: W, transform: `translateY(${hop + bob(frame, fps, 3.4, 3)}px) rotate(${wiggle(frame, fps, 2.4, 2.2)}deg)` }}
      />
    </div>
  );
};

// this world's chip — dark ink on white, which reads on a bright ground with no plate
export const GardenChip: React.FC<{ tone: string; children: React.ReactNode; size?: number }> = ({ tone, children, size = 36 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
  <div
    style={{
      transform: `translateY(${bob(frame, fps, 4, 2.6)}px)`,
      background: "#FFFFFF", border: `6px solid ${tone}`, borderRadius: 999,
      padding: "10px 32px", fontSize: size, fontWeight: 700, color: palette.ink,
      fontFamily: font.family, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12,
      boxShadow: slab(tone.replace("#", ""), 10),
    }}
  >
    {children}
  </div>
  );
};
