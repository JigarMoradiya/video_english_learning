import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";
import { darken, hex, slab, tint } from "../data/tokens";
import { Mascot } from "./Mascot";

// ── THE GUMBALL TOWER — the 9:16 world for hard/soft g ───────────────────────
// The 16:9 g video is The Magic Garden, so this shares nothing with it. A gumball
// machine is the right shape for g because *gum* is already this card's hard-g
// example word, and because the tower does the one thing the g rule needs and the
// c rule does not: a gumball can COME OUT A DIFFERENT COLOUR THAN IT LOOKED.
// That is exactly get / give / girl / gift — "every one of them should be soft,
// but it is not" — and it is why g gets a machine and c got a lift.
//
// BANDS, all derived from the dispenser floor. Nothing may cross a boundary:
//
//   y     0 …  200   brand mark (ReelBase draws it)
//   y   210 …  300   headline pill (PHead)
//   y   330 … 1240   THE TUBE — teaching content lives here and only here
//   y  1240 … 1452   dispenser base, the operator, the crank
//   y  1500 +        captions (ReelBase)
export const DISPENSER_FLOOR = 1240;
export const TUBE_TOP = 330;
export const TUBE_X0 = 70;
export const TUBE_X1 = 1010;

// The two exits. Content sits BETWEEN them so neither is ever covered.
// A chute is 96 tall and carries slab(tone, 14), whose extruded face is drawn a
// further 30px BELOW it — so a chute at 1136 reached 1262, i.e. 22px PAST the tube
// (which ends at 1240), leaving its lit bottom edge sitting on the brass base where
// it could not be read. 1080 puts the whole card AND its shadow inside the glass.
export const SOFT_CHUTE = 340;
export const HARD_CHUTE = 1080;

const GLASS_A = "#E8F5E9";
const GLASS_B = "#C8E6C9";
const BRASS = "#C9922E";

// Background gumballs. Fixed positions, gently jostling — the tube must never be
// a still object, and a deterministic layout keeps frame 0 reproducible.
const BALLS = Array.from({ length: 26 }, (_, i) => {
  const r = (s: number) => Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1);
  return {
    x: 120 + r(1) * 800,
    y: TUBE_TOP + 40 + r(2) * (DISPENSER_FLOOR - TUBE_TOP - 120),
    d: 34 + r(3) * 26,
    c: ["#F06292", "#BA68C8", "#4FC3F7", "#81C784", "#FFD54F", "#FF8A65"][i % 6],
    ph: r(4) * 6,
  };
});

/** The glass tube, jostling gumballs, brass base and a crank that always turns. */
export const TowerSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `linear-gradient(180deg, ${GLASS_A} 0%, ${GLASS_B} 60%, #A5D6A7 100%)` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* the tube itself — pushed back with low contrast so cards read in front */}
        <rect x={TUBE_X0} y={TUBE_TOP - 20} width={TUBE_X1 - TUBE_X0} height={DISPENSER_FLOOR - TUBE_TOP + 20}
              rx={70} fill="#FFFFFF" opacity={0.55} />
        <rect x={TUBE_X0} y={TUBE_TOP - 20} width={TUBE_X1 - TUBE_X0} height={DISPENSER_FLOOR - TUBE_TOP + 20}
              rx={70} fill="none" stroke="#8FBF95" strokeWidth={10} opacity={0.5} />

        {/* background gumballs, drifting */}
        {BALLS.map((b, i) => (
          <circle
            key={i}
            cx={b.x + wiggle(frame, fps, 7, 4 + (i % 3), b.ph)}
            cy={b.y + bob(frame, fps, 6, 3.4 + (i % 4) * 0.3, b.ph)}
            r={b.d / 2}
            fill={b.c}
            opacity={0.28}
          />
        ))}

        {/* glass highlight down the left of the tube */}
        <rect x={TUBE_X0 + 34} y={TUBE_TOP + 10} width={26} height={DISPENSER_FLOOR - TUBE_TOP - 60} rx={13} fill="#fff" opacity={0.5} />

        {/* brass base */}
        <rect x={0} y={DISPENSER_FLOOR} width={width} height={height - DISPENSER_FLOOR} fill="#8D6E63" />
        <rect x={TUBE_X0 - 20} y={DISPENSER_FLOOR - 10} width={TUBE_X1 - TUBE_X0 + 40} height={70} rx={22} fill={BRASS} />
        <rect x={TUBE_X0 - 20} y={DISPENSER_FLOOR - 10} width={TUBE_X1 - TUBE_X0 + 40} height={14} rx={7} fill={darken(BRASS, 18)} />

        {/* the crank, always turning */}
        <g transform={`translate(880 ${DISPENSER_FLOOR + 120}) rotate(${(frame / fps) * 52})`}>
          <circle cx={0} cy={0} r={40} fill={BRASS} stroke={darken(BRASS, 26)} strokeWidth={7} />
          <rect x={-9} y={-38} width={18} height={30} rx={7} fill={darken(BRASS, 26)} />
        </g>
        {/* the delivery slot */}
        <rect x={150} y={DISPENSER_FLOOR + 90} width={230} height={78} rx={16} fill={darken("#8D6E63", 26)} />
        <rect x={166} y={DISPENSER_FLOOR + 104} width={198} height={50} rx={10} fill="#2E1F1B" />
      </svg>
    </div>
  );
};

/**
 * An exit chute — where a gumball of this colour comes out. Same role as the lift's
 * landing sign but a different object, so the two videos never read as re-crops.
 */
export const Chute: React.FC<{
  at: number; top: number; tone: string; sound: string; name: string;
  dim?: boolean; still?: boolean;
}> = ({ at, top, tone, sound, name, dim = false, still = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = still ? 1 : spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(tone);
  return (
    <div
      style={{
        position: "absolute", top, left: TUBE_X0 + 58, width: TUBE_X1 - TUBE_X0 - 116,
        display: "flex", alignItems: "center", gap: 22, boxSizing: "border-box",
        background: "#fff", border: `7px solid ${c}`, borderRadius: 26, padding: "12px 24px",
        boxShadow: slab(tone, 14), opacity: dim ? 0.4 : 1,
        transform: `scale(${0.9 + 0.1 * s}) translateY(${dim ? 0 : bob(frame, fps, 4, 2.8)}px)`,
      }}
    >
      {/* a real gumball, not an emoji — the colour IS the teaching */}
      <div style={{ width: 60, height: 60, borderRadius: 999, background: c, boxShadow: `inset -6px -6px 0 ${darken(c, 20)}, inset 8px 8px 0 ${tint(tone, 0.45)}`, flexShrink: 0, transform: `scale(${dim ? 1 : 1 + 0.05 * Math.sin((frame / fps) * 5)})` }} />
      <span style={{ fontSize: 54, fontWeight: 800, color: c, letterSpacing: 1 }}>{sound}</span>
      <span style={{ marginLeft: "auto", fontSize: 24, fontWeight: 800, color: "#7A8B7C", letterSpacing: 2, whiteSpace: "nowrap" }}>{name}</span>
    </div>
  );
};

/** A gumball that can be one colour and turn out to be another. */
export const Gumball: React.FC<{ tone: string; size?: number; flipAt?: number; flipTo?: string }> = ({ tone, size = 56, flipAt, flipTo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flipped = flipAt !== undefined && frame >= flipAt && flipTo;
  const c = hex(flipped ? (flipTo as string) : tone);
  // a quick squash on the flip, so the colour change is felt and not just seen
  const t = flipAt !== undefined ? frame - flipAt : -1;
  const squash = t >= 0 && t < 12 ? 1 + 0.22 * Math.sin((t / 12) * Math.PI) : 1;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 999, background: c, flexShrink: 0,
        boxShadow: `inset -6px -6px 0 ${darken(c, 20)}, inset 8px 8px 0 ${tint(c, 0.45)}`,
        transform: `scale(${squash}) translateY(${bob(frame, fps, 3, 2.7)}px)`,
      }}
    />
  );
};

/** A small labelled chip. Always bobs — a chip with no idle motion froze whole lines on g. */
export const TowerChip: React.FC<{ tone: string; children: React.ReactNode; size?: number; at?: number }> = ({ tone, children, size = 38, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const c = hex(tone);
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 10, background: "#fff",
        border: `5px solid ${c}`, borderRadius: 999, padding: "8px 22px",
        fontSize: size, fontWeight: 800, color: c, boxShadow: slab(tone, 10),
        transform: `scale(${0.86 + 0.14 * s}) translateY(${bob(frame, fps, 4, 2.6)}px)`,
      }}
    >
      {children}
    </span>
  );
};

/**
 * The operator at the machine, BELOW the base — the tube is the teaching area and
 * nothing may enter it. `pressAt` thumps the crank where a verdict lands.
 */
export const Operator: React.FC<{ pressAt?: number[] }> = ({ pressAt = [] }) => {
  const frame = useCurrentFrame();
  const W = 205;
  const press = pressAt.reduce((acc, p) => {
    const d = frame - p;
    return d >= 0 && d < 12 ? Math.max(acc, Math.sin((d / 12) * Math.PI)) : acc;
  }, 0);
  return (
    <div
      style={{
        position: "absolute", left: 430, top: DISPENSER_FLOOR + 34, width: W,
        transform: `translateY(${press * -8}px)`,
      }}
    >
      <Mascot size={W} />
    </div>
  );
};

export const G_TONES = {
  SOFT: "8E24AA",  // the /j/ gumball
  HARD: "2E7D32",  // the /g/ gumball
  DEC: "F57C00",   // the deciding letter
  TRICK: "D81B60", // the gumballs that lie
};
