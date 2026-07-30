import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";
import { darken, hex, tint } from "../data/tokens";

// ── THE KEY SHOP — the world for c / k / ck ──────────────────────────────────
// Chosen because /k/ IS "key" — a pun a four-year-old gets — and the video was already
// reaching for it: its headline says "3 ways to spell /k/! 🔑" and it calls them "the
// /k/ Crew". The concept was latent and never built.
//
// It also makes the rule physical. Three spellings, one sound, chosen by what comes
// before = three different keys that all open the SAME lock. A pegboard is what keys
// hang on, so the wall does that job for free.
//
// PLACEMENT, measured from the finished video rather than guessed. Content occupies
// rows 100…999 and cols 88…1823, so the free margins are only ~88px left, ~97px right
// and ~81px bottom — far tighter than the Paint Studio's letters video. The shop
// therefore lives BEHIND the content as a wall, with only the bench in the bottom band:
//
//   y     0 …   80   above the wash
//   y    80 … 1010   THE WASH — all existing teaching content, untouched
//   y  1004 … 1080   the workbench
//
// Bright-world rule from The Bakery: the wall is pushed back at low contrast and a wash
// sits behind the teaching zone, so the cards read as objects in front of it.
export const WASH_TOP = 80;
export const WASH_BOTTOM = 1010;
// Quoted for a 1080-TALL frame and scaled at render time. As a bare 1004 it landed at
// 52% of a 1920-tall portrait frame, cutting the bench across the middle of the screen —
// the same absolute-band bug the Chirp Wire had.
export const BENCH_FRAC = 1004 / 1080;
export const benchY = (height: number) => height * BENCH_FRAC;

const WALL_A = "#EFE3D2";
const WALL_B = "#E2D2BC";
const BENCH = "#B98A55";

// Background keys hanging on the pegboard. Deterministic so frame 0 is reproducible.
// They sit in the margins and behind the cards, never competing.
const HANGING = [
  { x: 52, y: 250, s: 1.0, ph: 0.0 },
  { x: 1868, y: 210, s: 1.15, ph: 1.2 },
  { x: 1846, y: 560, s: 0.85, ph: 2.4 },
  { x: 44, y: 640, s: 0.95, ph: 0.7 },
  { x: 1878, y: 830, s: 0.8, ph: 1.9 },
];

/** One key, drawn: ring, shaft, teeth. `teeth` = 2 makes the ck key. */
export const Key: React.FC<{
  x: number; y: number; size?: number; color?: string; teeth?: number;
  swing?: number; label?: string;
}> = ({ x, y, size = 1, color = "#C9922E", teeth = 1, swing = 0, label }) => {
  const c = hex(color);
  const L = 96 * size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${size})`}>
      {/* the ring it hangs by */}
      <circle cx={0} cy={0} r={22} fill="none" stroke={c} strokeWidth={11} />
      <circle cx={0} cy={0} r={9} fill={darken(c, 22)} />
      {/* the shaft */}
      <rect x={-6} y={20} width={12} height={L} rx={5} fill={c} />
      {/* the teeth — ck gets TWO, so "two letters, one turn" is visible, not stated */}
      {Array.from({ length: teeth }, (_, i) => (
        <rect key={i} x={6} y={20 + L - 26 - i * 24} width={20} height={12} rx={3} fill={c} />
      ))}
      <rect x={6} y={20 + L - 12} width={13} height={10} rx={3} fill={c} />
      {label && (
        <text x={0} y={-34} textAnchor="middle" fontSize={40} fontWeight={800} fill={c} fontFamily="inherit">
          {label}
        </text>
      )}
    </g>
  );
};

/** The workshop: pegboard wall, hanging keys, the bench, and a keyring that never stops. */
export const ShopWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const BY = benchY(height);
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: `linear-gradient(168deg, ${WALL_A} 0%, ${WALL_B} 72%, #D8C4A8 100%)`,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* pegboard — the reason a key shop wall reads instantly. Very low contrast so
            it is texture, never pattern. */}
        {Array.from({ length: Math.ceil(height / 38) }, (_, r) =>
          Array.from({ length: 48 }, (_, c) => (
            <circle key={`${r}-${c}`} cx={24 + c * 40} cy={24 + r * 38} r={4.5} fill="#B49B78" opacity={0.22} />
          ))
        )}

        {/* keys hanging in the margins, swaying gently out of phase */}
        {HANGING.map((k, i) => (
          <g key={i} opacity={0.3}>
            {/* the hook and its cord */}
            <circle cx={k.x} cy={k.y - 46} r={5} fill="#9A8468" />
            <Key
              x={k.x}
              y={k.y}
              size={k.s * 0.62}
              color="#A98A5E"
              teeth={i % 3 === 0 ? 2 : 1}
              swing={wiggle(frame, fps, 3.4, 4.6 + i * 0.7, k.ph)}
            />
          </g>
        ))}

        {/* the workbench along the bottom band */}
        <rect x={0} y={BY} width={width} height={height - BY} fill={BENCH} />
        <rect x={0} y={BY} width={width} height={10} rx={5} fill={darken(BENCH, 16)} />
        {/* wood grain */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={0} y={BY + 22 + i * 8} width={width} height={2} fill={darken(BENCH, 10)} opacity={0.35} />
        ))}
        {/* key blanks and shavings resting on the bench */}
        {[180, 520, 1180, 1620].map((x, i) => (
          <g key={x} opacity={0.55}>
            <rect x={x} y={BY + 26} width={54} height={9} rx={4.5} fill={darken(BENCH, 30)}
                  transform={`rotate(${i % 2 ? -6 : 5} ${x + 27} ${BY + 30})`} />
          </g>
        ))}

        {/* a keyring hanging from the top edge, swinging — the wall's own motion */}
        <g transform={`translate(${width * 0.5} 0) rotate(${wiggle(frame, fps, 5, 5.4)})`} opacity={0.34}>
          <rect x={-3} y={0} width={6} height={64} fill="#9A8468" />
          <circle cx={0} cy={84} r={26} fill="none" stroke="#A98A5E" strokeWidth={9} />
          <Key x={-14} y={96} size={0.44} color="#A98A5E" swing={-16} />
          <Key x={14} y={96} size={0.44} color="#A98A5E" teeth={2} swing={12} />
        </g>
      </svg>
    </div>
  );
};

/**
 * The lock the keys open. `open` 0→1 turns the key and springs the shackle: this is the
 * cause-and-effect the video currently lacks, where the answer simply appeared.
 */
export const Lock: React.FC<{ x: number; y: number; size?: number; open: number; tone?: string }> = ({
  x, y, size = 1, open, tone = "C9922E",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  const lift = open * 26;
  const jiggle = open > 0 && open < 1 ? wiggle(frame, fps, 3, 0.4) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${size}) rotate(${jiggle})`}>
      {/* shackle — springs up and tilts when it opens */}
      <path
        d={`M-34 -6 v-26 a34 34 0 0 1 68 0 v26`}
        fill="none" stroke="#9AA3AD" strokeWidth={16} strokeLinecap="round"
        transform={`translate(${open * 16} ${-lift}) rotate(${open * 16} -34 -6)`}
      />
      <rect x={-52} y={-8} width={104} height={86} rx={16} fill={c} />
      <rect x={-52} y={-8} width={104} height={86} rx={16} fill="none" stroke={darken(c, 26)} strokeWidth={5} />
      {/* the keyhole, turning as it opens */}
      <g transform={`rotate(${open * 90} 0 34)`}>
        <circle cx={0} cy={28} r={11} fill={darken(c, 40)} />
        <rect x={-5} y={32} width={10} height={22} rx={4} fill={darken(c, 40)} />
      </g>
      {open >= 1 && (
        <g opacity={Math.min(1, (open - 1) * 4 + 1)}>
          {[0, 1, 2, 3].map((i) => {
            const a = (-0.6 - i * 0.5);
            const r = 74 + 8 * Math.sin((frame / fps) * 6 + i);
            return <circle key={i} cx={Math.cos(a) * r} cy={-30 + Math.sin(a) * r * 0.5} r={5} fill="#FFD54F" />;
          })}
        </g>
      )}
    </g>
  );
};

/**
 * The light panel the teaching content sits on. Feathered at its own edges — a
 * hard-edged wash cut a visible line across the frame when this was first done for the
 * Chirp Wire, and covering the full width erased the world it was meant to reveal.
 */
const FADE = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)";

export const ShopWash: React.FC<{ tone?: string; strength?: number }> = ({ tone, strength = 1 }) => (
  <>
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: WASH_TOP, height: WASH_BOTTOM - WASH_TOP,
        background:
          "radial-gradient(58% 80% at 50% 48%, rgba(255,255,255,0.92) 0%, " +
          "rgba(255,255,255,0.80) 44%, rgba(255,255,255,0.44) 74%, rgba(255,255,255,0) 100%)",
        maskImage: FADE, WebkitMaskImage: FADE,
        opacity: strength,
      }}
    />
    {tone && (
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: WASH_TOP, height: WASH_BOTTOM - WASH_TOP,
          background: `radial-gradient(50% 62% at 50% 42%, ${tint(tone, 0.7)} 0%, rgba(255,255,255,0) 76%)`,
          maskImage: FADE, WebkitMaskImage: FADE,
          opacity: 0.45 * strength,
        }}
      />
    )}
  </>
);
