import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { hex } from "../data/tokens";

// ── THE AQUARIUM — letter_recognition's own world ────────────────────────────
// Every video wears its own world, and recognition's game is a SEARCH: a spotlight hops
// a 26-tile board until every letter is found. Underwater, that spotlight is a diver's
// torch — so the room is a bright, pastel aquarium: sun shafts through the water,
// bubbles rising (the constant motion), seaweed and coral in the margins, a sandy floor.
// The active letter's colour arrives as a soft light-pool in the water, crossfaded by
// the reel exactly like a wash.
//
// Distinct from every shipped world by inventory check: Paint Studio (letters), Chirp
// Wire (short_vowels), Big Stage (ge/dge 9:16 — took the theatre spotlight), Claw
// Machine, Metro, Dig Site, Snow Slope, Moonlit House, Toy Workshop, Rocket Tower.
//
// LIGHT, deliberately: the beats draw dark navy ink, and a dark sea would kill it —
// the same lesson the Dig Site's strata taught.
const WATER_A = "#E9F8FC";
const WATER_B = "#D3EFF6";
const WATER_C = "#C2E8F2";
const SAND = "#FBEBC4";
const SAND_D = "#EDD9A8";

export const AquariumWorld: React.FC<{ dim?: number; tone?: string }> = ({ dim = 1, tone }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const portrait = height > width;
  const sandY = height - (portrait ? 150 : 120);

  // bubbles: three columns per side, looping upward on offset phases
  const bubbles = Array.from({ length: 14 }, (_, i) => {
    const left = i % 2 === 0;
    const lane = (i % 3) * (portrait ? 26 : 34);
    const x = left ? 34 + lane : width - 60 - lane;
    const span = height * 0.8;
    const p = ((t * (0.05 + (i % 5) * 0.012) + i * 0.13) % 1);
    const y = height - 60 - span * p;
    const r = 5 + (i % 4) * 3;
    return { x: x + Math.sin(t * 1.4 + i) * 7, y, r, o: 0.5 * (1 - p) + 0.12 };
  });

  return (
    <AbsoluteFill style={{ opacity: dim, background: `linear-gradient(178deg, ${WATER_A} 0%, ${WATER_B} 52%, ${WATER_C} 100%)` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="aqShaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="aqPool" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor={tone ? hex(tone) : "#FFFFFF"} stopOpacity={tone ? 0.16 : 0.0} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* sun shafts angling through the water, swaying very slowly */}
        {[0.18, 0.44, 0.72].map((fx, i) => (
          <polygon
            key={i}
            points={`${width * fx - 60},0 ${width * fx + 60},0 ${width * fx + 190},${height} ${width * fx - 10},${height}`}
            fill="url(#aqShaft)"
            opacity={0.5 + 0.2 * Math.sin(t * 0.5 + i * 2)}
            transform={`translate(${Math.sin(t * 0.3 + i) * 24} 0)`}
          />
        ))}

        {/* the active letter's light-pool in the water */}
        <rect x={0} y={0} width={width} height={height} fill="url(#aqPool)" />

        {/* sandy floor with a darker lip */}
        <path d={`M0 ${sandY} Q ${width * 0.25} ${sandY - 18} ${width * 0.5} ${sandY} T ${width} ${sandY} L ${width} ${height} L 0 ${height} Z`} fill={SAND} />
        <path d={`M0 ${sandY + 6} Q ${width * 0.25} ${sandY - 12} ${width * 0.5} ${sandY + 6} T ${width} ${sandY + 6}`} stroke={SAND_D} strokeWidth={5} fill="none" opacity={0.7} />

        {/* seaweed, swaying — left pair and right pair, kept inside the margins */}
        {[
          { x: 46, h: 210, c: "#7FD1AE", ph: 0 }, { x: 84, h: 150, c: "#5FBF9B", ph: 1.2 },
          { x: width - 52, h: 230, c: "#7FD1AE", ph: 2.1 }, { x: width - 92, h: 160, c: "#5FBF9B", ph: 3.3 },
        ].map((w, i) => {
          const sway = Math.sin(t * 1.1 + w.ph) * 14;
          return (
            <path
              key={i}
              d={`M${w.x} ${sandY + 8} C ${w.x - 12} ${sandY - w.h * 0.4}, ${w.x + 12 + sway} ${sandY - w.h * 0.7}, ${w.x + sway} ${sandY - w.h}`}
              stroke={w.c} strokeWidth={13} strokeLinecap="round" fill="none" opacity={0.8}
            />
          );
        })}

        {/* coral + starfish on the sand */}
        <g transform={`translate(${portrait ? 120 : 150} ${sandY + 26})`} opacity={0.9}>
          <path d="M0 0 C -6 -34, -26 -30, -24 -58 M0 0 C 4 -40, 22 -36, 20 -66 M0 0 C -2 -22, 10 -20, 8 -44" stroke="#F4A28C" strokeWidth={10} strokeLinecap="round" fill="none" />
        </g>
        <g transform={`translate(${width - (portrait ? 130 : 170)} ${sandY + 40}) rotate(${8 + Math.sin(t * 0.8) * 4})`}>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} cx={0} cy={-16} rx={9} ry={20} fill="#F7B84B" transform={`rotate(${i * 72})`} />
          ))}
          <circle r={10} fill="#F3A93C" />
        </g>

        {/* a little fish crossing the frame, flipping direction each lap */}
        {(() => {
          const lap = 34; // seconds per crossing
          const p = (t % lap) / lap;
          const forward = Math.floor(t / lap) % 2 === 0;
          const fx = forward ? width * (p * 1.2 - 0.1) : width * (1.1 - p * 1.2);
          const fy = height * (portrait ? 0.56 : 0.6) + Math.sin(t * 2) * 16;
          return (
            <g transform={`translate(${fx} ${fy}) scale(${forward ? 1 : -1} 1)`} opacity={0.85}>
              <ellipse cx={0} cy={0} rx={26} ry={15} fill="#FF9F68" />
              <path d="M-22 0 L-40 -12 L-40 12 Z" fill="#F8854B" />
              <circle cx={12} cy={-4} r={3} fill="#333" />
            </g>
          );
        })()}

        {/* bubbles */}
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={b.o} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
