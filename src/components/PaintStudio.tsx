import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";
import { darken, hex, letterColorFor, tint } from "../data/tokens";
import { LETTERS } from "../data/letters";

// ── THE PAINT STUDIO — the world for Letter Sounds A–Z ───────────────────────
// Chosen because it EXPLAINS what the video already does. Every letter floods the
// whole frame with its own colour, and in a paint studio that is not a transition,
// it is a new pot of paint being opened. The A–Z progress strip becomes 26 paint
// pots that fill in as the alphabet is worked through, so the video's single most
// recognisable element belongs to the world instead of sitting on top of it.
//
// PLACEMENT, measured from the finished video rather than guessed. The teaching
// content occupies y 43…975 and x ~200…1420 (wider readings are confetti), so the
// studio lives in the margins that are genuinely free:
//
//   x     0 …  190   the brush jar
//   x   200 … 1420   TEACHING CONTENT — nothing of the world may enter
//   x  1435 … 1920   the paint shelf and palette
//   y  1000 … 1070   the 26 pots (the progress strip, reskinned)
//
// Bright-world rule from The Bakery: the wall is pushed back at low contrast and a
// wash sits behind the teaching zone, so the cards read as objects in front of it.
export const CONTENT_X0 = 200;
export const CONTENT_X1 = 1420;
export const WASH_TOP = 24;
export const WASH_BOTTOM = 990;

const WALL_A = "#FBF7F0";
const WALL_B = "#EFE6D9";

// Splashes sit only in the margins. Deterministic so frame 0 is reproducible.
const SPLASHES = [
  { x: 96, y: 210, r: 74, li: 4 },
  { x: 1700, y: 168, r: 96, li: 11 },
  { x: 1560, y: 620, r: 66, li: 17 },
  { x: 120, y: 690, r: 58, li: 22 },
  { x: 1820, y: 880, r: 80, li: 8 },
];

/** A paint splat: a blob with a few flung droplets. */
const Splash: React.FC<{ x: number; y: number; r: number; color: string; op?: number }> = ({ x, y, r, color, op = 0.24 }) => {
  const c = hex(color);
  return (
    <g opacity={op}>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.82} fill={c} />
      <ellipse cx={x + r * 0.72} cy={y - r * 0.5} rx={r * 0.3} ry={r * 0.26} fill={c} />
      <circle cx={x - r * 0.9} cy={y + r * 0.42} r={r * 0.17} fill={c} />
      <circle cx={x + r * 0.5} cy={y + r * 0.85} r={r * 0.12} fill={c} />
    </g>
  );
};

/** The studio wall: canvas texture, splashes in the margins, and a drip that never stops. */
export const StudioWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: `linear-gradient(158deg, ${WALL_A} 0%, ${WALL_B} 68%, #E6DACA 100%)`,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* canvas weave — barely there, so it reads as texture and never as pattern */}
        {Array.from({ length: 46 }, (_, i) => (
          <rect key={`h${i}`} x={0} y={i * 24} width={width} height={1} fill="#B9A88E" opacity={0.13} />
        ))}
        {Array.from({ length: 80 }, (_, i) => (
          <rect key={`v${i}`} x={i * 24} y={0} width={1} height={height} fill="#B9A88E" opacity={0.10} />
        ))}

        {SPLASHES.map((s, i) => (
          <Splash key={i} x={s.x} y={s.y} r={s.r} color={letterColorFor(LETTERS[s.li].letter, LETTERS[s.li].imageColor)} />
        ))}

        {/* a drip running down the left margin, looping — the wall's own motion */}
        {[0, 1].map((k) => {
          const span = 260;
          const p = ((t * 0.06 + k * 0.5) % 1);
          const y0 = 300 + k * 380;
          const len = span * p;
          const c = hex(letterColorFor(LETTERS[k === 0 ? 13 : 20].letter, LETTERS[k === 0 ? 13 : 20].imageColor));
          return (
            <g key={k} opacity={0.2 * (1 - p * 0.5)}>
              <rect x={62 + k * 40} y={y0} width={7} height={len} rx={3.5} fill={c} />
              <circle cx={65.5 + k * 40} cy={y0 + len} r={9} fill={c} />
            </g>
          );
        })}

        {/* wet-paint sheen drifting across the wall */}
        <rect
          x={-400 + ((t * 26) % (width + 800))} y={0} width={300} height={height}
          fill="#FFFFFF" opacity={0.05} transform="skewX(-12)"
        />
      </svg>
    </div>
  );
};

/** The jar of brushes in the left margin. Handles sway out of phase with each other. */
export const BrushJar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const JAR_Y = height - 350;   // clear of the tin shelf in every aspect (1000 at 4:5)
  const BRUSHES = [
    { x: 58, h: 300, li: 2 },
    { x: 92, h: 356, li: 9 },
    { x: 126, h: 274, li: 16 },
    { x: 158, h: 330, li: 23 },
  ];
  return (
    <svg width={200} height={1080} viewBox="0 0 200 1080" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {BRUSHES.map((b, i) => {
        const c = hex(letterColorFor(LETTERS[b.li].letter, LETTERS[b.li].imageColor));
        const lean = wiggle(frame, fps, 2.2, 4.2 + i * 0.6, i);
        const topY = JAR_Y - 120 - b.h;
        return (
          <g key={i} transform={`rotate(${lean} ${b.x} ${JAR_Y - 90})`}>
            <rect x={b.x - 7} y={topY} width={14} height={b.h} rx={7} fill="#C89B6A" />
            <rect x={b.x - 9} y={topY - 34} width={18} height={38} rx={5} fill="#9AA3AD" />
            {/* the bristles, tipped with this brush's colour */}
            <path d={`M${b.x - 9} ${topY - 34} Q ${b.x} ${topY - 74} ${b.x + 9} ${topY - 34} Z`} fill={c} />
          </g>
        );
      })}
      {/* the jar, with paint water in it */}
      <rect x={34} y={JAR_Y - 120} width={140} height={120} rx={16} fill="#DCE8F0" opacity={0.85} />
      <rect x={34} y={JAR_Y - 66} width={140} height={66} rx={14} fill="#BFD8E8" opacity={0.9} />
      <rect x={34} y={JAR_Y - 120} width={140} height={120} rx={16} fill="none" stroke="#A9BECC" strokeWidth={5} />
      <ellipse cx={104} cy={JAR_Y - 66} rx={66} ry={7 + 1.5 * Math.sin((frame / fps) * 2.2)} fill="#EAF3F8" opacity={0.85} />
    </svg>
  );
};

/** Paint tubes and a palette in the right margin. */
export const PaintShelf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const X = 1440;
  const TUBES = [0, 1, 2, 3].map((i) => ({ y: 250 + i * 96, li: 3 + i * 6 }));
  return (
    <svg width={480} height={1080} viewBox="0 0 480 1080" style={{ position: "absolute", left: X, top: 0, pointerEvents: "none" }}>
      <g opacity={0.9}>
        {TUBES.map((tb, i) => {
          const c = hex(letterColorFor(LETTERS[tb.li].letter, LETTERS[tb.li].imageColor));
          const y = tb.y + bob(frame, fps, 3, 3.4 + i * 0.4, i);
          return (
            <g key={i}>
              <rect x={40} y={y} width={210} height={54} rx={20} fill="#E9EDF2" />
              <rect x={40} y={y} width={210} height={54} rx={20} fill="none" stroke="#C4CCD6" strokeWidth={4} />
              <rect x={54} y={y + 12} width={150} height={30} rx={12} fill={c} opacity={0.85} />
              <rect x={244} y={y + 14} width={30} height={26} rx={7} fill={darken(c, 20)} />
            </g>
          );
        })}
      </g>
      {/* the palette, with a wet blob for each of six letters */}
      <g transform={`translate(120 700) rotate(${wiggle(frame, fps, 1.4, 5)})`}>
        <path d="M0 0 Q 130 -46 236 24 Q 268 118 176 168 Q 60 210 -14 132 Q -46 60 0 0 Z" fill="#E3CFAE" stroke="#B0956E" strokeWidth={7} />
        <circle cx={150} cy={104} r={24} fill="#D6BE99" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const l = LETTERS[(i * 4 + 1) % 26];
          const c = hex(letterColorFor(l.letter, l.imageColor));
          const a = -0.5 + i * 0.44;
          const cx = 108 + Math.cos(a) * 92;
          const cy = 62 + Math.sin(a) * 62;
          return <circle key={i} cx={cx} cy={cy} r={21 + 1.5 * Math.sin((frame / fps) * 2 + i)} fill={c} opacity={0.9} />;
        })}
      </g>
    </svg>
  );
};

/**
 * A single pot in the bottom shelf — the progress strip's cell, reskinned.
 * `state`: "todo" is a closed unpainted tin, "done" carries its letter's colour,
 * "active" is open with a brush standing in it.
 */
export const PaintPot: React.FC<{ letter: string; color: string; state: "todo" | "done" | "active"; size: number }> = ({ letter, color, state, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const lift = state === "active" ? -6 + bob(frame, fps, 3, 1.6) : 0;
  const body = state === "todo" ? "#E4DACB" : tint(color, state === "done" ? 0.42 : 0);
  const ink = state === "todo" ? "rgba(30,36,56,0.34)" : "#fff";
  return (
    <div
      style={{
        width: size, height: size, position: "relative",
        transform: `translateY(${lift}px) scale(${state === "active" ? 1.16 : 1})`,
      }}
    >
      {/* the tin */}
      <div
        style={{
          position: "absolute", left: 0, top: size * 0.18, width: size, height: size * 0.82,
          borderRadius: `${size * 0.16}px ${size * 0.16}px ${size * 0.22}px ${size * 0.22}px`,
          background: body,
          border: `${Math.max(2, size * 0.06)}px solid ${state === "todo" ? "#CBBEA9" : c}`,
          boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.46, fontWeight: 800, color: ink,
          boxShadow: state === "active" ? `0 ${size * 0.16}px ${size * 0.3}px ${c}66` : "none",
        }}
      >
        {letter}
      </div>
      {/* the lid: on for todo, tipped back for done, off and brushed for active */}
      {state !== "active" && (
        <div
          style={{
            position: "absolute", left: size * 0.08, top: state === "done" ? 0 : size * 0.06,
            width: size * 0.84, height: size * 0.2, borderRadius: size * 0.1,
            background: state === "todo" ? "#D6C9B4" : c,
            transform: state === "done" ? `rotate(-14deg)` : "none",
          }}
        />
      )}
      {state === "active" && (
        <div
          style={{
            position: "absolute", left: size * 0.42, top: -size * 0.5,
            width: size * 0.16, height: size * 0.72, borderRadius: size * 0.08,
            background: "#C89B6A",
            transform: `rotate(${wiggle(frame, fps, 5, 1.8)}deg)`, transformOrigin: "bottom center",
          }}
        />
      )}
    </div>
  );
};

/**
 * The light panel behind the teaching content. `tone` carries the current letter's
 * colour, so each letter still owns its scene without the wall cutting to a new world.
 * Feathered at its own edges — a hard-edged wash cut a visible line across the frame
 * when this was first done for the Chirp Wire.
 */
const FADE = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)";

export const StudioWash: React.FC<{ tone?: string }> = ({ tone }) => (
  <>
    <div
      style={{
        // ONLY over the content zone. Spanning the full width whitened the margins the
        // studio lives in — the brush jar, the shelf and the palette all came out ghosted.
        // The 50% horizontal radius makes it reach zero exactly at this box's own edges,
        // so there is no vertical seam either.
        position: "absolute", left: CONTENT_X0, width: CONTENT_X1 - CONTENT_X0 + 20,
        top: WASH_TOP, height: WASH_BOTTOM - WASH_TOP,
        background:
          "radial-gradient(50% 78% at 50% 46%, rgba(255,255,255,0.94) 0%, " +
          "rgba(255,255,255,0.84) 44%, rgba(255,255,255,0.46) 74%, rgba(255,255,255,0) 100%)",
        maskImage: FADE, WebkitMaskImage: FADE,
      }}
    />
    {tone && (
      <div
        style={{
          position: "absolute", left: CONTENT_X0, width: CONTENT_X1 - CONTENT_X0 + 20,
          top: WASH_TOP, height: WASH_BOTTOM - WASH_TOP,
          background: `radial-gradient(48% 64% at 50% 40%, ${tint(tone, 0.62)} 0%, rgba(255,255,255,0) 76%)`,
          maskImage: FADE, WebkitMaskImage: FADE,
          opacity: 0.5,
        }}
      />
    )}
  </>
);
