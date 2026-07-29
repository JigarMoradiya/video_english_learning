import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";
import { darken, hex, slab, tint } from "../data/tokens";
import { Mascot } from "./Mascot";

// ── THE LIFT — the 9:16 world for hard/soft c ────────────────────────────────
// The 16:9 c video is The Bakery, so this cannot be a re-crop of it. The lift is
// chosen because it says the rule out loud: a lift only moves once you press a
// button, and the button here is THE LETTER AFTER THE C. Two landings, one sound
// each — the snake floor (/s/) at the top, the drum floor (/k/) below — so
// "which sound?" becomes "which floor?", a question a four-year-old already owns.
//
// BANDS, all derived from the lobby floor. Nothing may cross a boundary:
//
//   y     0 …  200   brand mark (ReelBase draws it)
//   y   210 …  300   headline pill (PHead)
//   y   330 … 1240   THE SHAFT — teaching content lives here and only here
//   y  1240 … 1452   lobby floor, operator, button panel
//   y  1500 +        captions (ReelBase)
//
// Bright-world rule (learned on The Bakery): the background is pushed BACK with
// low contrast and a light wash behind the teaching zone, so cards read as
// objects in front of it rather than competing with it.
export const LOBBY_FLOOR = 1240;
export const SHAFT_TOP = 330;
export const SHAFT_X0 = 70;
export const SHAFT_X1 = 1010;

// The two landings. Content sits BETWEEN them, so neither sign is ever covered.
// Same correction as the gumball tower: a sign is 96 tall plus a 30px slab face, so
// 1136 reached 1262 and spilled 22px past the light wash that ends at the floor line.
export const SOFT_LANDING = 340;
export const HARD_LANDING = 1080;

const WALL_A = "#F3E6FF";
const WALL_B = "#E2CDF7";
const RAIL = "#B79BD8";

/** Lobby wall, shaft rails, travelling indicator lamps, swaying cable. */
export const LobbySky: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // lamps chase down the rail forever, so the frame is never fully static
  const chase = (frame / fps) * 1.6;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `linear-gradient(180deg, ${WALL_A} 0%, ${WALL_B} 62%, #D3B9EE 100%)` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* wallpaper stripes — very low contrast so they never fight the cards */}
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={i * 80 + 10} y={0} width={34} height={height} fill="#ffffff" opacity={0.16} />
        ))}

        {/* the light wash behind the whole teaching zone */}
        <rect x={SHAFT_X0} y={SHAFT_TOP - 16} width={SHAFT_X1 - SHAFT_X0} height={LOBBY_FLOOR - SHAFT_TOP + 16}
              rx={40} fill="#FFFFFF" opacity={0.62} />

        {/* shaft rails */}
        {[SHAFT_X0 + 26, SHAFT_X1 - 26].map((x) => (
          <g key={x}>
            <rect x={x - 11} y={SHAFT_TOP} width={22} height={LOBBY_FLOOR - SHAFT_TOP} rx={11} fill={RAIL} opacity={0.5} />
            {Array.from({ length: 22 }, (_, i) => (
              <rect key={i} x={x - 20} y={SHAFT_TOP + 24 + i * 40} width={40} height={7} rx={3.5} fill={RAIL} opacity={0.34} />
            ))}
          </g>
        ))}

        {/* indicator lamps travelling down the left rail */}
        {Array.from({ length: 18 }, (_, i) => {
          const phase = (chase + i * 0.14) % 1;
          const y = SHAFT_TOP + 30 + i * 48;
          const on = Math.max(0, Math.sin(phase * Math.PI));
          return <circle key={i} cx={SHAFT_X0 + 26} cy={y} r={9} fill="#FFB74D" opacity={0.18 + on * 0.7} />;
        })}

        {/* the cable, swaying */}
        <path d={`M540 ${SHAFT_TOP - 30} Q ${540 + wiggle(frame, fps, 9, 3.4)} ${(SHAFT_TOP + LOBBY_FLOOR) / 2} 540 ${LOBBY_FLOOR - 40}`}
              stroke={RAIL} strokeWidth={5} fill="none" opacity={0.32} />

        {/* lobby floor */}
        <rect x={0} y={LOBBY_FLOOR} width={width} height={height - LOBBY_FLOOR} fill="#C7A6E8" />
        <rect x={0} y={LOBBY_FLOOR} width={width} height={12} fill={darken("#C7A6E8", 22)} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={i * 128} y={LOBBY_FLOOR + 12} width={116} height={26} rx={8} fill="#ffffff" opacity={0.2} />
        ))}
      </svg>
    </div>
  );
};

/** A landing sign — the floor a word is being sent to. Always visible, never covered. */
export const FloorSign: React.FC<{
  at: number; top: number; tone: string; sound: string; emoji: string; name: string;
  dim?: boolean; still?: boolean;
}> = ({ at, top, tone, sound, emoji, name, dim = false, still = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = still ? 1 : spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(tone);
  return (
    <div
      style={{
        position: "absolute", top, left: SHAFT_X0 + 58, width: SHAFT_X1 - SHAFT_X0 - 116,
        display: "flex", alignItems: "center", gap: 20, boxSizing: "border-box",
        background: "#fff", border: `7px solid ${c}`, borderRadius: 26, padding: "12px 24px",
        boxShadow: slab(c, 14), opacity: dim ? 0.4 : 1,
        transform: `scale(${0.9 + 0.1 * s}) translateY(${dim ? 0 : bob(frame, fps, 4, 2.8)}px)`,
      }}
    >
      <span style={{ fontSize: 64, lineHeight: 0, display: "flex", alignItems: "center" }}>{emoji}</span>
      <span style={{ fontSize: 54, fontWeight: 800, color: c, letterSpacing: 1 }}>{sound}</span>
      <span style={{ marginLeft: "auto", fontSize: 26, fontWeight: 800, color: "#8B7BA8", letterSpacing: 2 }}>{name}</span>
    </div>
  );
};

/**
 * The car. Rides between the two landings; `to` is 0 for the soft floor (up) and
 * 1 for the hard floor (down). Doors slide apart on arrival so the reveal is the
 * arrival, not a separate fade.
 */
export const LiftCar: React.FC<{
  at: number; to: number; tone: string; children: React.ReactNode;
  top?: number; height?: number; openAt?: number;
}> = ({ at, to, tone, children, top = 470, height = 300, openAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const c = hex(tone);
  const travel = spring({ frame: frame - at, fps, config: { damping: 18, mass: 1.4 } });
  const y = top + travel * to * 150;
  const open = openAt === undefined ? 1
    : interpolate(frame - openAt, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const W = SHAFT_X1 - SHAFT_X0 - 140;
  return (
    <div
      style={{
        position: "absolute", left: SHAFT_X0 + 70, top: y, width: W, height,
        borderRadius: 28, background: "#fff", border: `8px solid ${c}`,
        boxShadow: slab(c, 18), overflow: "hidden", boxSizing: "border-box",
        transform: `translateY(${bob(frame, fps, 3, 3.2)}px)`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
      {/* doors */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute", top: 0, height: "100%", width: "50%",
            [i ? "right" : "left"]: 0,
            background: `linear-gradient(180deg, ${tint(c, 0.42)}, ${tint(c, 0.2)})`,
            borderRight: i ? "none" : `3px solid ${darken(c, 12)}`,
            transform: `translateX(${(i ? 1 : -1) * open * 100}%)`,
          }}
        />
      ))}
    </div>
  );
};

/** A small labelled chip. Always bobs — a chip with no idle motion froze whole lines on g. */
export const LiftChip: React.FC<{ tone: string; children: React.ReactNode; size?: number; at?: number }> = ({ tone, children, size = 38, at = 0 }) => {
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
        fontSize: size, fontWeight: 800, color: c, boxShadow: slab(c, 10),
        transform: `scale(${0.86 + 0.14 * s}) translateY(${bob(frame, fps, 4, 2.6)}px)`,
      }}
    >
      {children}
    </span>
  );
};

/**
 * The operator on the lobby floor with the two-button panel. `pressAt` thumps the
 * panel; `litAt` lights a button — index 0 = soft, 1 = hard — so the button lights
 * on the line that names the floor rather than on a guessed offset.
 */
export const Operator: React.FC<{ pressAt?: number[]; softLitAt?: number; hardLitAt?: number }> = ({
  pressAt = [], softLitAt, hardLitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 210;
  const H = Math.round(W * (1063 / 923)); // mascot.png has no bottom padding: feet are the last row
  const press = pressAt.reduce((acc, p) => {
    const d = frame - p;
    return d >= 0 && d < 12 ? Math.max(acc, Math.sin((d / 12) * Math.PI)) : acc;
  }, 0);
  const lit = (a?: number) => a !== undefined && frame >= a;
  return (
    <>
      {/* BELOW the floor line, not above it. Standing the operator with its feet ON
          LOBBY_FLOOR put it inside the shaft, where it covered the hard landing sign
          and the note band in every single beat. The shaft is the teaching area and
          nothing may enter it; the lobby floor below is where the character lives. */}
      <div style={{ position: "absolute", left: 96, top: LOBBY_FLOOR + 10, width: W, height: H }}>
        <Mascot size={W} />
      </div>
      {/* button panel, on the floor beside the operator */}
      <div
        style={{
          position: "absolute", left: 96 + W + 30, top: LOBBY_FLOOR + 52,
          width: 132, padding: "12px 0", borderRadius: 22, background: "#fff",
          border: "6px solid #9575CD", boxShadow: slab("#9575CD", 12),
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          transform: `translateY(${press * -6}px)`,
        }}
      >
        {[{ k: "S", on: lit(softLitAt), c: "#D81B60" }, { k: "K", on: lit(hardLitAt), c: "#2E7D32" }].map((b) => (
          <div
            key={b.k}
            style={{
              width: 62, height: 62, borderRadius: 999, border: `5px solid ${b.c}`,
              background: b.on ? b.c : "#F3EDFA", color: b.on ? "#fff" : "#B3A5C9",
              fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: b.on ? `0 0 0 8px ${b.c}33` : "none",
              transform: `scale(${b.on ? 1 + 0.05 * Math.sin((frame / fps) * 6) : 1})`,
            }}
          >
            {b.k}
          </div>
        ))}
      </div>
    </>
  );
};

/** Two words shown as a "same letter, two floors" pair for the hook. */
export const TwoFloors: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: SHAFT_X0 + 40, top: 560, width: SHAFT_X1 - SHAFT_X0 - 80, display: "flex", justifyContent: "space-between", gap: 30, transform: `scale(${0.9 + 0.1 * s})` }}>
      {children}
    </div>
  );
};

export const LIFT_TONES = {
  SOFT: "D81B60",  // the snake floor
  HARD: "2E7D32",  // the drum floor
  DEC: "F57C00",   // the deciding letter
  SH: "6A1B9A",    // the /sh/ family
};
