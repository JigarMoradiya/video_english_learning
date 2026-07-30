import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";
import { darken, hex, tint } from "../data/tokens";

// ── THE CHIRP WIRE — the world for the Short Vowels lesson ───────────────────
// Chosen because a chirp IS the rule. Short vowels make a QUICK sound, never the
// letter's long name, and a bird's chirp is the shortest sound a child already
// knows. Five birds, one per vowel colour, sit on the telephone line and the one
// whose sound is playing opens its beak and throws out sound rings.
//
// PLACEMENT. Every scene in this lesson fills the middle of the frame — the vowel
// scenes use two full-height columns, practice runs from y 140 to 711, listen from
// 150 to 920 — so a wire across the middle would cross the teaching content. The
// only band free in all eight scenes is the bottom, so that is where the world
// lives, with the sky and clouds behind everything else:
//
//   y     0 …   20   above the wash
//   y    20 …  930   THE WASH — all existing teaching content, untouched
//   y   948 … 1020   the birds, perched
//   y   985 … 1080   rooftops (BEHIND the wire, so the birds read in front)
//   y  1020          the wire itself
// Every band below is quoted for a 1080-TALL frame and scaled by `k` at render time, so
// the 4:5 cut keeps the same proportions and the published 16:9 is bit-identical (k = 1).
export const bandK = (height: number) => height / 1080;
export const WASH_TOP = 100;
export const WASH_BOTTOM = 930;
export const WIRE_Y = 1028;
export const ROOF_TOP = 985;
export const BIRD_H = 80;
// The sun sits in the top-RIGHT corner, inset from the edge so the whole disc and
// its beams are on screen. Resolved from `width` at render time rather than hardcoded.
export const SUN_INSET = 268;
export const SUN_Y = 182;
export const SUN_R = 92;

if (WASH_BOTTOM + 18 > WIRE_Y - BIRD_H) {
  throw new Error(`ChirpWire: wash ends ${WASH_BOTTOM}, birds start ${WIRE_Y - BIRD_H}`);
}

// Deterministic clouds — frame 0 is the upload thumbnail and must be reproducible.
const CLOUDS = Array.from({ length: 6 }, (_, i) => {
  const r = (s: number) => Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1);
  return { x: r(1), y: 80 + r(2) * 460, s: 0.6 + r(3) * 0.8, sp: 0.004 + r(4) * 0.006 };
});

// Both wash layers fade to nothing at their own top and bottom edges.
const FADE = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 84%, rgba(0,0,0,0) 100%)";

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
    <ellipse cx={0} cy={12} rx={96} ry={38} fill="#CFE0F2" />
    <ellipse cx={0} cy={0} rx={92} ry={40} fill="#fff" />
    <ellipse cx={-64} cy={14} rx={56} ry={30} fill="#fff" />
    <ellipse cx={62} cy={16} rx={62} ry={28} fill="#fff" />
    <ellipse cx={-10} cy={-26} rx={54} ry={32} fill="#fff" />
  </g>
);

/** Sunrise sky, drifting clouds, rooftops, poles and the wire. Pushed back on purpose. */
export const MorningSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = bandK(height);
  const wireY = WIRE_Y * k;
  const roofTop = ROOF_TOP * k;
  const sunX = width - SUN_INSET;
  const sunY = SUN_Y * k;
  const sag = 26; // the wire dips in the middle
  const wireD = `M0 ${wireY - 14} Q ${width / 2} ${wireY + sag + wiggle(frame, fps, 4, 5.2)} ${width} ${wireY - 14}`;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #FFE9C9 0%, #FFF3DC 26%, #E9F3FF 62%, #DCEBFF 100%)",
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* THE SUN — light, not a cartoon badge. The first version was flat circles
            with hard triangular spikes, which read as a sticker. Real sunlight has no
            edges, so this is built entirely from gradients: a white-hot core bleeding
            to warm orange, a wide atmospheric haze, and beams that fade out with
            distance (one radial fill serves every beam, since they all radiate from
            the same point). Nothing here is opaque, so it stays behind the content. */}
        <defs>
          <radialGradient id="cwSunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <stop offset="30%" stopColor="#FFF6D0" stopOpacity={0.98} />
            <stop offset="62%" stopColor="#FFDD92" stopOpacity={0.85} />
            <stop offset="88%" stopColor="#FFC96F" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#FFC46B" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="cwSunHaze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE0A8" stopOpacity={0.5} />
            <stop offset="45%" stopColor="#FFE7BC" stopOpacity={0.24} />
            <stop offset="75%" stopColor="#FFEFD2" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#FFF3DC" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="cwRay" gradientUnits="userSpaceOnUse" cx={sunX} cy={sunY} r={SUN_R + 250}>
            <stop offset="0%" stopColor="#FFEFC0" stopOpacity={0.55} />
            <stop offset="42%" stopColor="#FFE6AC" stopOpacity={0.34} />
            <stop offset="100%" stopColor="#FFE6AC" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* haze first, so the beams sit inside the glow */}
        <circle cx={sunX} cy={sunY} r={SUN_R + 250} fill="url(#cwSunHaze)" />

        {/* beams: soft, uneven lengths, turning slowly */}
        <g transform={`rotate(${t * 3.2} ${sunX} ${sunY})`}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            // uneven lengths + a slow breath, so it never reads as a mechanical star
            const len = (i % 4 === 0 ? 246 : i % 2 === 0 ? 176 : 124) * (1 + 0.05 * Math.sin(t * 1.1 + i));
            const r0 = SUN_R - 6;
            const half = 0.13 - 0.055 * (i % 2); // radians; wide enough to read as a shaft, not a scratch
            const pt = (rr: number, aa: number) => `${sunX + Math.cos(aa) * rr} ${sunY + Math.sin(aa) * rr}`;
            return (
              <path
                key={i}
                d={`M${pt(r0, a - half)} Q ${pt(r0 + len * 0.6, a)} ${pt(r0 + len, a)} Q ${pt(r0 + len * 0.6, a)} ${pt(r0, a + half)} Z`}
                fill="url(#cwRay)"
              />
            );
          })}
        </g>

        {/* the disc */}
        <circle cx={sunX} cy={sunY} r={SUN_R * (1 + 0.02 * Math.sin(t * 1.2))} fill="url(#cwSunCore)" />

        {CLOUDS.map((c, i) => {
          // wrap around so the sky never runs out of clouds
          const x = ((c.x + t * c.sp) % 1.3) * (width + 420) - 210;
          return <Cloud key={i} x={x} y={c.y + bob(frame, fps, 7, 6 + i, i)} s={c.s} />;
        })}

        {/* a distant bird pair, drifting — motion in the empty upper sky */}
        {[0, 1].map((k) => {
          const p = ((t * 0.02 + k * 0.12) % 1.2) * (width + 300) - 150;
          const y = 150 + k * 46 + Math.sin(t * 0.9 + k) * 12;
          return (
            <path
              key={k}
              d={`M${p} ${y} q 13 ${-9 - 3 * Math.sin(t * 4 + k)} 26 0 M${p + 26} ${y} q 13 ${-9 - 3 * Math.sin(t * 4 + k)} 26 0`}
              fill="none" stroke="#9BB4CF" strokeWidth={4} strokeLinecap="round" opacity={0.5}
            />
          );
        })}

        {/* a treeline behind the rooftops for depth */}
        <g opacity={0.42}>
          {Array.from({ length: 15 }, (_, i) => (
            <ellipse key={i} cx={i * 138 + 30} cy={roofTop - 6 + (i % 3) * 12} rx={78} ry={44} fill="#9FC49A" />
          ))}
        </g>

        {/* rooftops BEHIND the wire, low contrast so they never fight the cards */}
        <g opacity={0.62}>
          {Array.from({ length: 9 }, (_, i) => {
            const w = 210 + (i % 3) * 60;
            const x = i * 224 - 40;
            const top = roofTop + (i % 2 ? 26 : 0);
            return (
              <g key={i}>
                <path d={`M${x} ${top + 34} L${x + w / 2} ${top} L${x + w} ${top + 34} Z`} fill="#B4C6DC" />
                <rect x={x + 10} y={top + 34} width={w - 20} height={height - top - 34} fill="#C6D6E8" />
                <rect x={x + w / 2 - 18} y={top + 56} width={36} height={40} rx={6} fill="#E4EDF7" />
              </g>
            );
          })}
        </g>

        {/* the poles, at the very edges so they never enter the teaching area */}
        {[46, width - 46].map((x) => (
          <g key={x}>
            <rect x={x - 13} y={wireY - 92} width={26} height={height - wireY + 92} fill="#A8845F" />
            <rect x={x - 74} y={wireY - 78} width={148} height={16} rx={8} fill="#96744F" />
          </g>
        ))}

        {/* two lines: the birds' wire in front, a slack one behind for depth */}
        <path d={`M0 ${wireY - 62} Q ${width / 2} ${wireY - 62 + sag * 1.5} ${width} ${wireY - 62}`}
              fill="none" stroke="#8B98A8" strokeWidth={4} opacity={0.4} />
        <path d={wireD} fill="none" stroke="#5C6875" strokeWidth={7} opacity={0.85} />
      </svg>
    </div>
  );
};

/**
 * The light panel the teaching content sits on. This is the bright-world rule from
 * The Bakery: with a busy background, cards only read as objects in front of it if
 * there is a wash behind the teaching zone. `tone` carries the current vowel's
 * colour so each vowel still owns its scene without the sky cutting to a new world.
 */
export const Wash: React.FC<{ tone?: string; strength?: number; bottom?: number }> = ({ tone, strength = 1, bottom }) => {
  const { height } = useVideoConfig();
  const k = bandK(height);
  const top = WASH_TOP * k;
  const bot = (bottom ?? WASH_BOTTOM) * k;
  return (
  <>
    {/* FEATHERED, not a panel. The first version was an opaque rounded rectangle
        covering x 40..1880 · y 20..930 — 85% of the frame — which hid the very sky
        it was added to show off. Almost everything here already sits on its own
        opaque card (the mouth circle, the hint pill, the word chips, the picture
        cards) and the rest is high-contrast ink, so the wash only has to lift the
        middle and can fade to nothing at the edges. */}
    <div
      style={{
        position: "absolute", left: 0, right: 0, top, height: bot - top,
        background:
          "radial-gradient(108% 82% at 50% 48%, rgba(255,255,255,0.82) 0%, " +
          "rgba(255,255,255,0.70) 40%, rgba(255,255,255,0.38) 70%, rgba(255,255,255,0) 100%)",
        // The radial is still ~55% opaque where the DIV ends, so without this the wash
        // cut a hard horizontal line across the sky at its own top edge (measured: the
        // blue channel jumped 20 levels in a single row at y=100). The mask forces the
        // wash to reach zero at both its own edges, so there is no seam anywhere.
        maskImage: FADE, WebkitMaskImage: FADE,
        opacity: strength,
      }}
    />
    {/* the vowel's colour, as a breath of tint rather than a background swap */}
    {tone && (
      <div
        style={{
          position: "absolute", left: 0, right: 0, top, height: bot - top,
          background: `radial-gradient(88% 68% at 50% 40%, ${tint(tone, 0.66)} 0%, rgba(255,255,255,0) 74%)`,
          maskImage: FADE, WebkitMaskImage: FADE,
          opacity: 0.45 * strength,
        }}
      />
    )}
    </>
  );
};

/** One bird. Drawn, not an emoji: an emoji bird is unreadable at 72px and cannot open its beak. */
export const Bird: React.FC<{ x: number; color: string; letter: string; open: number; phase: number; active: boolean; y?: number; scale?: number; still?: boolean }> = ({ x, color, letter, open, phase, active, y, scale = 1, still = false }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const c = hex(color);
  // the wire's y scales with the frame, so an unspecified y follows it
  const yy = y ?? WIRE_Y * bandK(height);
  // every bird hops gently; the active one lifts and leans into its chirp
  // `still` pins the bird on the wire. The hop is mid-cycle at frame 0, so in a STILL
  // (the thumbnail) each bird sat at a different height and the row looked sloppy;
  // in motion that same offset is what makes them look alive.
  const hop = still ? 0 : bob(frame, fps, active ? 7 : 4, active ? 1.5 : 2.6, phase);
  const lean = active ? -6 * open : 0;
  const beak = 5 + open * 15; // degrees the beak gapes
  return (
    <g transform={`translate(${x} ${yy + hop}) rotate(${lean}) scale(${scale})`}>
      {/* feet gripping the wire */}
      <path d="M-9 0 l-3 -13 M9 0 l3 -13" stroke={darken(c, 34)} strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* Tail — a two-feather fan that tucks BEHIND the body (drawn before it).
          The first version was a narrow triangle, `M-27 -33 l-25 7 l23 13 Z`, which
          read as a detached arrowhead stuck to the bird's side rather than a tail:
          too thin to look like feathers, and angled down so it fought the body's
          curve. This sweeps back and slightly UP from the flank, with a notch
          between two points, so it reads as a tail at any size. */}
      <path
        d="M-18 -41 C-36 -50 -50 -53 -63 -49 L-53 -40 L-60 -31 C-44 -27 -30 -28 -18 -30 Z"
        fill={darken(c, 18)}
      />
      {/* body */}
      <ellipse cx={0} cy={-33} rx={29} ry={25} fill={c} />
      {/* wing, fluttering when active */}
      <path
        d={`M-5 -37 q 22 ${-7 - (active ? 6 * open : 0)} 29 9 q -18 9 -29 ${-2 - (active ? 3 * open : 0)} Z`}
        fill={tint(color, 0.45)}
      />
      {/* head */}
      <circle cx={18} cy={-58} r={18} fill={c} />
      {/* beak — two halves that gape apart, so the chirp is visibly a MOUTH */}
      <g transform="translate(34 -56)">
        <path d={`M0 0 L18 ${-2} L0 ${-6} Z`} fill="#F9A825" transform={`rotate(${-beak / 2})`} />
        <path d={`M0 0 L18 2 L0 6 Z`} fill="#E58E12" transform={`rotate(${beak / 2})`} />
      </g>
      <circle cx={24} cy={-63} r={3.6} fill="#2A2A33" />
      {/* the vowel it owns, worn on its chest — lowercase, which is the form a
          child meets inside words (the cards above already show the capital) */}
      <circle cx={-7} cy={-31} r={14.5} fill="#fff" opacity={0.94} />
      <text x={-7} y={-24} textAnchor="middle" fontSize={21} fontWeight={800} fill={c} fontFamily="inherit">{letter.toLowerCase()}</text>
    </g>
  );
};

/**
 * The five birds. `activeIdx` is which vowel is sounding right now (-1 for none) and
 * `open` is how wide that bird's beak is, so the chirp lands on the audio rather
 * than on a guessed offset.
 */
export const WireBirds: React.FC<{
  vowels: { letter: string; color: string }[];
  activeIdx: number;
  open: number;
}> = ({ vowels, activeIdx, open }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const wireY = WIRE_Y * bandK(height);
  const t = frame / fps;
  // spread across the middle of the wire, clear of both poles
  const span = width - 2 * 300;
  const xs = vowels.map((_, i) => 300 + (span / (vowels.length - 1)) * i);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* sound rings out of the active bird's beak */}
      {activeIdx >= 0 && [0, 1, 2].map((k) => {
        const ph = ((t * 1.4) - k * 0.33) % 1;
        const p = ph < 0 ? ph + 1 : ph;
        const r = 16 + p * 54;
        return (
          <path
            key={k}
            d={`M${xs[activeIdx] + 52} ${wireY - 56 - r * 0.9} a${r} ${r} 0 0 1 0 ${r * 1.8}`}
            fill="none" stroke={hex(vowels[activeIdx].color)} strokeWidth={5} strokeLinecap="round"
            opacity={0.7 * (1 - p) * Math.min(1, open * 1.6)}
          />
        );
      })}
      {vowels.map((v, i) => (
        <Bird
          key={v.letter}
          x={xs[i]}
          color={v.color}
          letter={v.letter}
          open={i === activeIdx ? open : 0}
          phase={i * 1.1}
          active={i === activeIdx}
        />
      ))}
    </svg>
  );
};

/** Turn a list of {from, to, idx} spans into the active bird + beak openness. */
export const chirpAt = (spans: { from: number; to: number; idx: number }[], frame: number) => {
  for (const s of spans) {
    if (frame >= s.from - 4 && frame <= s.to + 10) {
      const open = interpolate(frame, [s.from - 4, s.from + 4, s.to, s.to + 10], [0, 1, 1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      return { idx: s.idx, open };
    }
  }
  return { idx: -1, open: 0 };
};
