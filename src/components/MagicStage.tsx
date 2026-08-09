import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── THE MAGIC STAGE ──────────────────────────────────────────────────────────
//
// The world for L5 Part 3 (the letter x, and the tricky letter w). Every video wears its
// own: Part 1 had The Word Building Site (daylight blue over tan), Part 2 The Bell Tower
// (sunrise peach over green). This one is a theatre at night — plum curtain, gold
// footlights, a wooden stage — so none of the three can be confused at a glance.
//
// The world is chosen to make the LESSON visible, and the teacher's own words asked for it:
// "the letter w likes to play tricks", "that is the trick the letter w plays", and one of
// the words in the lesson is literally `wand`.
//
//   · THE HAT is the letter x. One `x` goes in; TWO doves come out, /k/ and /s/ — and then
//     they fly back together into one /ks/. The merge matters: x is not two sounds you say
//     apart, it is one sound made of two.
//   · FEED IT `xx` and the hat JAMS — a puff of smoke and a cross. That is "never double
//     the x", shown rather than stated.
//   · THE WAND is the letter w. It zaps the `a` beside it and the card flips to `o`.
//     On `wag` the wand FIZZLES and the `a` stays put — which is the honest half of the
//     lesson, and the half a video is most tempted to skip.
//
// TUX, a rabbit in a bow tie, works the stage: presents the hat, waves the wand, ducks at
// the smoke, shrugs when the wand fizzles, and bows on praise.
//
// ── LAYOUT LAW (carried from Part 2, where it cost ~30 rounds to learn) ──────
//   1. Content lives in ONE box and nothing else may enter it.
//   2. 16:9 and 4:5 do not share a layout, only a world. See `bands`.
//   3. Anything that arrives RESERVES its space, so it can never sweep over a neighbour.
//   4. The screen never restates the caption. If the teacher says it, the screen shows it.

export const STAGE = {
  curtainDark: "#3A1343",
  curtainMid: "#55205F",
  curtainLite: "#6E2C7E",
  backWall: "#2A0E31",
  floor: "#7A4A2E",
  floorLite: "#9C6139",
  gold: "#F5C542",
  goldDark: "#C2951C",
  ink: "#221024",
  x: "#F5C542",        // the letter x — gold, like the footlights
  w: "#3FC7B4",        // the letter w — teal, so it can never be mistaken for x
  vowel: "#5AA8E8",
  good: "#4CC38A",
  bad: "#E0553F",
  cream: "#FFF6E8",
};

export type Tone = "plain" | "x" | "w" | "vowel" | "good" | "bad" | "dim";
const TONE_BG: Record<Tone, string> = {
  plain: "#FFFFFF", x: STAGE.x, w: STAGE.w, vowel: STAGE.vowel,
  good: STAGE.good, bad: STAGE.bad, dim: "#C9BCCE",
};

/**
 * Per-aspect band table. The wide cut puts the stage furniture in side columns; portrait
 * has no side columns, so the curtain simply frames a taller content box and Tux stands
 * on the boards below it.
 */
export const bands = (width: number, height: number) => {
  const wide = width > height;
  return wide
    ? {
        width, height, wide,
        stageTop: Math.round(height * 0.055),   // where the curtain's valance ends
        boards: Math.round(height * 0.735),     // the front edge of the stage floor
        bannerTop: Math.round(height * 0.020),
        contentTop: Math.round(height * 0.118),
        contentH: Math.round(height * 0.590),
        contentL: Math.round(width * 0.105),
        contentR: Math.round(width * 0.895),
        tuxLeft: Math.round(width * 0.030),
        tuxTop: Math.round(height * 0.720),
        tuxSize: Math.round(height * 0.205),
      }
    : {
        width, height, wide,
        stageTop: Math.round(height * 0.048),
        boards: Math.round(height * 0.645),
        bannerTop: Math.round(height * 0.018),
        contentTop: Math.round(height * 0.115),
        contentH: Math.round(height * 0.505),
        contentL: Math.round(width * 0.040),
        contentR: Math.round(width * 0.960),
        tuxLeft: Math.round(width * 0.035),
        tuxTop: Math.round(height * 0.640),
        tuxSize: Math.round(height * 0.160),
      };
};
export type B = ReturnType<typeof bands>;

export const pop = (frame: number, fps: number, at: number, damping = 12) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 140 } });

/** anything absolutely placed goes in here, pinned to the FRAME rather than to whatever
 *  positioned ancestor happens to be nearest — the bug that cost Part 1 a dozen rounds */
export const Fixed: React.FC<{ b: B; children: React.ReactNode }> = ({ b, children }) => (
  <div style={{ position: "fixed", left: 0, top: 0, width: b.width, height: b.height }}>{children}</div>
);

// ── the world ────────────────────────────────────────────────────────────────

const Sparkles: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 26 }).map((_, i) => {
        const fx = ((i * 137) % 100) / 100;
        const speed = 0.22 + (i % 5) * 0.06;
        const y = b.height - ((frame * speed + i * 90) % (b.height + 120));
        const s = 5 + (i % 4) * 4;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((frame + i * 30) / 22));
        return (
          <div key={i} style={{
            position: "absolute", left: fx * b.width, top: y, width: s, height: s,
            background: STAGE.gold, opacity: tw * 0.5,
            clipPath: "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
          }} />
        );
      })}
    </>
  );
};

/** the curtain: a valance across the top and a drape down each side */
const Curtain: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const drape = Math.round(b.width * (b.wide ? 0.105 : 0.042));
  const fold = (n: number, w: number, left: boolean) =>
    Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{
        position: "absolute", top: 0, height: "100%",
        [left ? "left" : "right"]: (i * w) / n,
        width: w / n,
        background: i % 2 === 0
          ? `linear-gradient(90deg, ${STAGE.curtainDark}, ${STAGE.curtainMid})`
          : `linear-gradient(90deg, ${STAGE.curtainMid}, ${STAGE.curtainLite})`,
        borderRadius: `0 0 ${w / n / 2}px ${w / n / 2}px`,
      } as React.CSSProperties} />
    ));

  return (
    <>
      {/* valance */}
      <div style={{ position: "absolute", left: 0, top: 0, width: b.width, height: b.stageTop + 6 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: (b.width / 14) * i, top: 0,
            width: b.width / 14, height: b.stageTop + 6,
            background: i % 2 === 0
              ? `linear-gradient(180deg, ${STAGE.curtainLite}, ${STAGE.curtainMid})`
              : `linear-gradient(180deg, ${STAGE.curtainMid}, ${STAGE.curtainDark})`,
            borderRadius: `0 0 ${b.width / 28}px ${b.width / 28}px`,
          }} />
        ))}
        <div style={{
          position: "absolute", left: 0, top: b.stageTop - 2, width: b.width, height: 8,
          background: STAGE.gold, opacity: 0.85,
        }} />
      </div>

      {/* side drapes, gently breathing so the stage is never still */}
      {[true, false].map((left) => (
        <div key={String(left)} style={{
          position: "absolute", top: b.stageTop, height: b.boards - b.stageTop,
          [left ? "left" : "right"]: 0,
          width: drape * (1 + 0.012 * Math.sin(frame / 40 + (left ? 0 : 1.6))),
          overflow: "hidden",
        } as React.CSSProperties}>
          {fold(4, drape, left)}
        </div>
      ))}
    </>
  );
};

export const StageWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  const glow = 0.82 + 0.18 * Math.sin(frame / 26);

  return (
    <AbsoluteFill style={{ background: STAGE.backWall }}>
      {/* the pool of light the act happens in */}
      <div style={{
        position: "absolute", left: 0, top: 0, width, height: b.boards,
        background: `radial-gradient(${width * 0.70}px ${height * 0.62}px at 50% 44%, rgba(255,222,150,0.46), rgba(255,200,110,0.16) 55%, rgba(58,19,67,0) 78%)`,
      }} />
      <Sparkles b={b} />
      <Curtain b={b} />

      {/* the boards */}
      <div style={{
        position: "absolute", left: 0, top: b.boards, width, height: height - b.boards,
        background: `linear-gradient(${STAGE.floorLite} 0%, ${STAGE.floor} 100%)`,
      }} />
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, top: b.boards + 16 + i * ((height - b.boards) / 9),
          width, height: 2, background: "rgba(0,0,0,0.16)",
        }} />
      ))}

      {/* footlights along the front edge, glowing up into the stage */}
      <div style={{
        position: "absolute", left: 0, top: b.boards - Math.round(height * 0.055), width,
        height: Math.round(height * 0.062),
        background: `linear-gradient(180deg, rgba(245,197,66,0) 0%, rgba(245,197,66,${0.20 * glow}) 100%)`,
      }} />
      {Array.from({ length: 9 }).map((_, i) => {
        const w = width / 9;
        return (
          <div key={i} style={{
            position: "absolute", left: w * i + w * 0.30, top: b.boards - 10,
            width: w * 0.40, height: 20, borderRadius: "50% 50% 8px 8px",
            background: STAGE.gold, opacity: glow,
            boxShadow: `0 -14px ${26 * glow}px rgba(245,197,66,0.55)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ── TUX, who works the stage ─────────────────────────────────────────────────

export type TuxMood = "idle" | "present" | "wave" | "duck" | "shrug" | "bow";

export const Tux: React.FC<{ b: B; mood?: TuxMood; size?: number; x?: number; y?: number }> = ({
  b, mood = "idle", size, x, y,
}) => {
  const frame = useCurrentFrame();
  const S = size ?? b.tuxSize;
  const bob = Math.sin(frame / 27) * 5;
  const body =
    mood === "bow" ? { rot: 18, lift: S * 0.06 }
    : mood === "duck" ? { rot: -6, lift: S * 0.14 }
    : mood === "shrug" ? { rot: Math.sin(frame / 9) * 3, lift: 0 }
    : mood === "present" ? { rot: -4, lift: 0 }
    : { rot: Math.sin(frame / 44) * 2, lift: 0 };
  const armRot =
    mood === "present" ? 52 : mood === "wave" ? 40 + Math.sin(frame / 5) * 26
    : mood === "shrug" ? -28 : mood === "bow" ? 20 : Math.sin(frame / 36) * 7;
  const earRot = Math.sin(frame / 21) * 6 + (mood === "duck" ? -22 : 0);
  const ink = STAGE.ink;
  const bw = Math.max(3, S * 0.024);

  return (
    <div style={{
      position: "absolute", left: x ?? b.tuxLeft, top: (y ?? b.tuxTop) + bob + body.lift,
      width: S, height: S * 1.28, transform: `rotate(${body.rot}deg)`,
    }}>
      {/* ears */}
      {[0.30, 0.52].map((fx, i) => (
        <div key={i} style={{
          position: "absolute", left: S * fx, top: -S * 0.30, width: S * 0.16, height: S * 0.46,
          borderRadius: "50% 50% 40% 40%", background: "#EFE2EC",
          border: `${bw}px solid ${ink}`, boxSizing: "border-box",
          transformOrigin: "50% 100%", transform: `rotate(${earRot * (i ? 1 : -1)}deg)`,
        }}>
          <div style={{ position: "absolute", inset: "16% 26%", borderRadius: "50%", background: "#F3B7C8" }} />
        </div>
      ))}
      {/* body */}
      <div style={{
        position: "absolute", left: S * 0.10, top: S * 0.16, width: S * 0.80, height: S * 0.80,
        borderRadius: "50% 50% 44% 44%", background: "#EFE2EC",
        border: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />
      <div style={{ position: "absolute", left: S * 0.26, top: S * 0.50, width: S * 0.48, height: S * 0.40, borderRadius: "50%", background: "#FFFFFF" }} />
      {/* eyes */}
      {[0.31, 0.57].map((fx, i) => (
        <div key={i} style={{
          position: "absolute", left: S * fx, top: S * 0.34,
          width: S * 0.13, height: mood === "bow" ? S * 0.03 : S * 0.15,
          borderRadius: "50%", background: ink,
        }}>
          {mood !== "bow" && <div style={{ position: "absolute", left: "26%", top: "16%", width: "36%", height: "34%", borderRadius: "50%", background: "#FFF" }} />}
        </div>
      ))}
      {/* nose + whiskers */}
      <div style={{ position: "absolute", left: S * 0.45, top: S * 0.53, width: S * 0.10, height: S * 0.07, borderRadius: "50%", background: "#F3899F" }} />
      {/* bow tie */}
      <div style={{ position: "absolute", left: S * 0.34, top: S * 0.66, width: S * 0.32, height: S * 0.13 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: "42%", height: "100%", borderRadius: "50% 12% 50% 12%", background: STAGE.bad, border: `${bw * 0.8}px solid ${ink}`, boxSizing: "border-box" }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: "42%", height: "100%", borderRadius: "12% 50% 12% 50%", background: STAGE.bad, border: `${bw * 0.8}px solid ${ink}`, boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: "38%", top: "18%", width: "24%", height: "64%", borderRadius: "40%", background: STAGE.gold, border: `${bw * 0.7}px solid ${ink}`, boxSizing: "border-box" }} />
      </div>
      {/* the arm that does the acting */}
      <div style={{
        position: "absolute", left: S * 0.80, top: S * 0.48, width: S * 0.30, height: S * 0.14,
        borderRadius: 999, background: "#EFE2EC", border: `${bw}px solid ${ink}`, boxSizing: "border-box",
        transformOrigin: "6% 50%", transform: `rotate(${-armRot}deg)`,
      }} />
      {/* feet */}
      {[0.20, 0.52].map((fx, i) => (
        <div key={i} style={{
          position: "absolute", left: S * fx, top: S * 1.06, width: S * 0.28, height: S * 0.13,
          borderRadius: "50% 50% 30% 30%", background: "#EFE2EC",
          border: `${bw}px solid ${ink}`, boxSizing: "border-box",
        }} />
      ))}
    </div>
  );
};

// ── THE HAT — the letter x ───────────────────────────────────────────────────

// The doves need room, but ONLY while the trick is running. Reserving it on every beat
// left a 240px hat sitting alone in a 552px box — the same dead space the Bell's rings
// cost Part 2 before they became arcs.
const RESERVE_W = 1.25;   // half-width the doves reach, in hat-widths
const RESERVE_H = 1.20;
const HAT_DY = 0.34;      // where the hat sits inside that box

/**
 * `at` starts the trick. One `x` goes in and two doves come out — /k/ to the left, /s/ to
 * the right — and then they arc back TOGETHER, because /ks/ is one sound.
 * `jam` is the `xx` gag: smoke, a shudder, and no doves at all.
 */
export const Hat: React.FC<{
  b: B; at?: number | null; jam?: boolean; size?: number; inline?: boolean;
}> = ({ b, at = null, jam = false, size = 200, inline = true }) => {
  const frame = useCurrentFrame();
  const since = at === null ? -1 : frame - at;
  const live = since >= 0 && since < 240;
  const wobble = live ? Math.sin(since / 2.6) * (jam ? 9 : 4) * Math.exp(-since / (jam ? 26 : 40)) : Math.sin(frame / 70) * 1.2;

  // the doves: out to the sides, then back together
  const DOVE_OUT = 34, DOVE_HOLD = 26, DOVE_IN = 30;
  const t = since;
  const spread =
    t < 0 ? 0
    : t < DOVE_OUT ? t / DOVE_OUT
    : t < DOVE_OUT + DOVE_HOLD ? 1
    : t < DOVE_OUT + DOVE_HOLD + DOVE_IN ? 1 - (t - DOVE_OUT - DOVE_HOLD) / DOVE_IN
    : 0;
  const merged = t >= DOVE_OUT + DOVE_HOLD + DOVE_IN && t < DOVE_OUT + DOVE_HOLD + DOVE_IN + 46;

  const hat = (
    <>
      {/* the doves, one per sound */}
      {live && !jam && spread > 0.01 && ([-1, 1] as const).map((dir) => (
        <div key={dir} style={{
          position: "absolute",
          left: size * 0.5 + dir * spread * size * 1.02 - size * 0.17,
          top: size * 0.06 - Math.sin(spread * Math.PI) * size * 0.34,
          width: size * 0.34, height: size * 0.34,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.family, fontWeight: 800, fontSize: size * 0.15, color: STAGE.ink,
        }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%", background: STAGE.cream,
            border: `${Math.max(3, size * 0.018)}px solid ${STAGE.ink}`, boxSizing: "border-box",
            transform: `rotate(${Math.sin(frame / 4) * 8}deg)`,
          }} />
          <span style={{ position: "relative" }}>{dir < 0 ? "/k/" : "/s/"}</span>
        </div>
      ))}
      {/* …and the one sound they become */}
      {merged && (
        <div style={{
          position: "absolute", left: size * 0.5 - size * 0.28, top: -size * 0.30,
          width: size * 0.56, height: size * 0.36, borderRadius: size * 0.1,
          background: STAGE.x, border: `${Math.max(4, size * 0.022)}px solid ${STAGE.ink}`, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.family, fontWeight: 800, fontSize: size * 0.19, color: STAGE.ink,
          transform: `scale(${0.9 + 0.1 * Math.sin(frame / 7)})`,
          boxShadow: `0 0 ${size * 0.14}px rgba(245,197,66,0.8)`,
        }}>/ks/</div>
      )}

      {/* smoke, when two x's jam it */}
      {live && jam && [0, 1, 2, 3].map((i) => {
        const p = Math.min(1, Math.max(0, (since - i * 5) / 44));
        if (p <= 0) return null;
        return (
          <div key={i} style={{
            position: "absolute",
            left: size * (0.5 + (i - 1.5) * 0.16) - size * 0.16 * p,
            top: size * 0.04 - p * size * 0.52,
            width: size * 0.34 * (0.5 + p), height: size * 0.34 * (0.5 + p),
            borderRadius: "50%", background: "#D8CBDE", opacity: (1 - p) * 0.75,
          }} />
        );
      })}

      <div style={{ transformOrigin: "50% 92%", transform: `rotate(${wobble}deg)` }}>
        {/* crown */}
        <div style={{
          position: "absolute", left: size * 0.22, top: size * 0.10, width: size * 0.56, height: size * 0.62,
          borderRadius: `${size * 0.06}px ${size * 0.06}px 0 0`,
          background: `linear-gradient(100deg, #4C3157 0%, #6B4468 52%, #38213E 100%)`,
          border: `${Math.max(4, size * 0.026)}px solid ${STAGE.gold}`, boxSizing: "border-box",
        }} />
        {/* band */}
        <div style={{
          position: "absolute", left: size * 0.20, top: size * 0.52, width: size * 0.60, height: size * 0.14,
          background: STAGE.bad, border: `${Math.max(4, size * 0.022)}px solid ${STAGE.ink}`, boxSizing: "border-box",
        }} />
        {/* brim */}
        <div style={{
          position: "absolute", left: 0, top: size * 0.64, width: size, height: size * 0.16,
          borderRadius: 999, background: `linear-gradient(180deg, #6B4468, #38213E)`,
          border: `${Math.max(4, size * 0.026)}px solid ${STAGE.gold}`, boxSizing: "border-box",
        }} />
      </div>
    </>
  );

  if (!inline) return <div style={{ position: "absolute", left: 0, top: 0, width: size, height: size * 0.82 }}>{hat}</div>;
  const running = at !== null;
  const boxW = size * (running ? RESERVE_W * 2 : 1.10);
  const boxH = size * (running ? RESERVE_H : 0.92);
  return (
    <div style={{ position: "relative", width: boxW, height: boxH, flex: "0 0 auto" }}>
      <div style={{
        position: "absolute", left: boxW / 2 - size / 2,
        top: size * (running ? HAT_DY : 0.06), width: size, height: size * 0.82,
      }}>{hat}</div>
    </div>
  );
};

// ── THE WAND — the letter w ──────────────────────────────────────────────────

/**
 * `at` swings it. `fizzle` is the `wag` case: the star sputters out and nothing changes,
 * which is the half of the w lesson that must not be skipped.
 */
export const Wand: React.FC<{ at?: number | null; fizzle?: boolean; size?: number }> = ({
  at = null, fizzle = false, size = 190,
}) => {
  const frame = useCurrentFrame();
  const since = at === null ? -1 : frame - at;
  const live = since >= 0 && since < 200;
  const swing = live ? Math.sin(Math.min(since, 30) / 30 * Math.PI) * (fizzle ? 16 : 34) : Math.sin(frame / 52) * 3;
  const burst = live && !fizzle && since > 12 && since < 60;
  const sput = live && fizzle && since > 12 && since < 70;

  return (
    <div style={{ position: "relative", width: size * 1.05, height: size * 0.8, flex: "0 0 auto" }}>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: size, height: size * 0.8, transformOrigin: "12% 88%", transform: `rotate(${-swing}deg)` }}>
        {/* the stick */}
        <div style={{
          position: "absolute", left: size * 0.06, bottom: size * 0.04, width: size * 0.62, height: size * 0.075,
          borderRadius: 999, background: `linear-gradient(90deg, #F1E3D0, #8A6B52)`,
          border: `2px solid ${STAGE.ink}`, boxSizing: "border-box",
          transformOrigin: "0% 50%", transform: "rotate(-34deg)",
        }} />
        <div style={{
          position: "absolute", left: size * 0.06, bottom: size * 0.04, width: size * 0.16, height: size * 0.085,
          borderRadius: 999, background: STAGE.cream, transformOrigin: "0% 50%", transform: "rotate(-34deg)",
        }} />
        {/* the star */}
        <div style={{
          position: "absolute", left: size * 0.52, top: size * 0.02, width: size * 0.32, height: size * 0.32,
          background: fizzle && sput ? "#9A8FA0" : STAGE.gold,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          filter: `drop-shadow(0 0 ${size * (burst ? 0.13 : 0.05)}px rgba(245,197,66,0.9))`,
          transform: `rotate(${frame * (fizzle ? 0.6 : 2.4)}deg) scale(${burst ? 1.18 : 1})`,
        }} />
      </div>

      {/* what comes off the tip: a clean burst, or a few sad sputters */}
      {burst && [0, 1, 2, 3, 4].map((i) => {
        const p = ((since - 12 + i * 4) % 30) / 30;
        return (
          <div key={i} style={{
            position: "absolute", left: size * 0.70 + Math.cos(i * 1.3) * size * 0.5 * p,
            top: size * 0.14 + Math.sin(i * 1.3) * size * 0.5 * p,
            width: size * 0.09, height: size * 0.09, background: STAGE.gold, opacity: 1 - p,
            clipPath: "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
          }} />
        );
      })}
      {sput && [0, 1, 2].map((i) => {
        const p = ((since - 12 + i * 9) % 34) / 34;
        return (
          <div key={i} style={{
            position: "absolute", left: size * 0.70 + (i - 1) * size * 0.08,
            top: size * 0.14 + p * size * 0.30,
            width: size * 0.06, height: size * 0.06, borderRadius: "50%",
            background: "#9A8FA0", opacity: (1 - p) * 0.8,
          }} />
        );
      })}
    </div>
  );
};

// ── layout ───────────────────────────────────────────────────────────────────

export const Content: React.FC<{ b: B; children: React.ReactNode; gap?: number }> = ({ b, children, gap }) => (
  <div style={{
    position: "absolute", left: b.contentL, top: b.contentTop,
    width: b.contentR - b.contentL, height: b.contentH,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: gap ?? Math.round(b.height * 0.036),
  }}>{children}</div>
);

export const Row: React.FC<{ children: React.ReactNode; gap?: number; align?: "center" | "flex-end" }> = ({
  children, gap = 22, align = "center",
}) => (
  <div style={{ display: "flex", alignItems: align, justifyContent: "center", gap, flexWrap: "wrap", rowGap: 18 }}>
    {children}
  </div>
);

/** a picture and the word it names, grouped tightly so they read as one object */
export const Named: React.FC<{ gap?: number; children: React.ReactNode }> = ({ gap = 6, children }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap }}>{children}</div>
);

export const Card: React.FC<{
  ch: string; size?: number; tone?: Tone; at?: number; seed?: number; hot?: boolean;
  w?: number; from?: "left" | "right" | "up" | "down";
  /** flip the card over to reveal a different letter — this is what the wand does to `a` */
  flipTo?: string; flipAt?: number;
}> = ({ ch, size = 170, tone = "plain", at = 0, seed = 0, hot = false, w, from, flipTo, flipAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 17);
  const slide = from ? (1 - Math.min(1, p)) * size * 1.15 : 0;
  const dx = from === "left" ? -slide : from === "right" ? slide : 0;
  const dy = from === "up" ? -slide : from === "down" ? slide : 0;

  // the flip: half a turn hides the swap, exactly like turning a card over
  const fp = flipAt === undefined ? 0 : Math.max(0, Math.min(1, (frame - flipAt) / 16));
  const flipped = fp >= 0.5 && flipTo !== undefined;
  const face = flipped ? flipTo! : ch;
  const faceTone: Tone = flipped ? "vowel" : tone;

  const bg = TONE_BG[faceTone];
  const n = parseInt(bg.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);

  return (
    <div style={{
      width: w, minWidth: w ?? size * 0.74, height: size, padding: `0 ${size * 0.12}px`,
      borderRadius: size * 0.2, background: bg,
      border: `${Math.max(4, size * 0.04)}px solid ${STAGE.ink}`, boxSizing: "border-box",
      boxShadow: hot ? `0 ${size * 0.05}px 0 ${STAGE.ink}, 0 0 0 ${size * 0.038}px rgba(245,197,66,0.65)` : `0 ${size * 0.05}px 0 ${STAGE.ink}`,
      display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.58,
      color: lum > 168 ? STAGE.ink : "#FFFFFF",
      transform: `translate(${dx}px, ${dy + Math.sin((frame + seed * 22) / 42) * 4 - (hot ? size * 0.07 : 0)}px) `
        + `scale(${p}) rotateY(${fp > 0 && fp < 1 ? (fp < 0.5 ? fp * 180 : 180 - fp * 180) : 0}deg)`,
      whiteSpace: "nowrap", opacity: faceTone === "dim" ? 0.62 : 1,
    }}>{face}</div>
  );
};

/** a whole word, with one letter picked out — the x, or the a the wand is after */
export const Word: React.FC<{
  text: string; hi?: string; tone?: Tone; size?: number; at?: number; dim?: boolean;
  flipTo?: string; flipAt?: number;
}> = ({ text, hi, tone = "x", size = 170, at = 0, dim = false, flipTo, flipAt }) => (
  <>
    {text.split("").map((c, i) => {
      const isHi = hi !== undefined && c.toLowerCase() === hi.toLowerCase();
      return (
        <Card
          key={i} ch={c} size={size} at={at + i * 3} seed={i}
          tone={isHi ? tone : dim ? "dim" : "plain"}
          flipTo={isHi && flipTo ? flipTo : undefined}
          flipAt={isHi && flipTo ? flipAt : undefined}
        />
      );
    })}
  </>
);

/**
 * (3) Several words on one line ran together — `fox box six` read as one long word.
 * A gap is not enough when every letter is already a separate card, so the words are
 * separated by a mark that is clearly not a letter.
 */
export const WordList: React.FC<{
  words: string[]; hi?: string; tone?: Tone; size?: number; at?: number; dim?: boolean;
}> = ({ words, hi, tone = "x", size = 110, at = 0, dim = false }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: size * 0.10, flexWrap: "wrap", rowGap: size * 0.2 }}>
    {words.map((w, wi) => (
      <React.Fragment key={w}>
        {wi > 0 && (
          <div style={{
            width: size * 0.14, height: size * 0.14, borderRadius: "50%",
            background: STAGE.gold, opacity: 0.85, flex: "0 0 auto",
            margin: `0 ${size * 0.16}px`,
          }} />
        )}
        <div style={{ display: "flex", gap: size * 0.10 }}>
          <Word text={w} hi={hi} tone={tone} size={size} at={at + wi * 5} dim={dim} />
        </div>
      </React.Fragment>
    ))}
  </div>
);

/**
 * (1) A rule number with the rule's own short name under it. A bare digit tells a child
 * nothing about which rule it is.
 */
export const NumCard: React.FC<{
  n: number; label: string; tone?: Tone; size?: number; at?: number; seed?: number;
}> = ({ n, label, tone = "good", size = 150, at = 0, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.10, flex: "0 0 auto" }}>
      <Card ch={String(n)} size={size} tone={tone} at={at} seed={seed} />
      <div style={{
        padding: `${size * 0.07}px ${size * 0.16}px`, borderRadius: 999,
        background: "rgba(255,246,232,0.14)", border: `${Math.max(2, size * 0.02)}px solid ${STAGE.gold}`,
        fontFamily: font.family, fontWeight: 800, fontSize: size * 0.21, color: STAGE.cream,
        whiteSpace: "nowrap", transform: `scale(${p})`,
      }}>{label}</div>
    </div>
  );
};

export const Plate: React.FC<{ children: React.ReactNode; at?: number; pad?: number }> = ({ children, at = 0, pad = 32 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div style={{
      padding: `${pad}px ${pad * 1.3}px`, borderRadius: 38,
      background: STAGE.cream, border: `6px solid ${STAGE.ink}`, boxShadow: `0 13px 0 rgba(0,0,0,0.35)`,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 22, flexWrap: "wrap", rowGap: 18,
      maxWidth: "100%", transform: `scale(${0.95 + 0.05 * p})`,
    }}>{children}</div>
  );
};

export const Banner: React.FC<{ b: B; text: string; tone?: string }> = ({ b, text, tone = STAGE.curtainDark }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      position: "absolute", left: b.contentL, top: b.bannerTop,
      width: b.contentR - b.contentL, display: "flex", justifyContent: "center",
    }}>
      <div style={{
        padding: "14px 38px", borderRadius: 18, background: tone, color: STAGE.gold,
        border: `6px solid ${STAGE.gold}`, boxShadow: `0 9px 0 rgba(0,0,0,0.4)`,
        fontFamily: font.family, fontWeight: 800, fontSize: Math.round(b.height * 0.040), letterSpacing: 1,
        transform: `translateY(${Math.sin(frame / 32) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

/** (13) keeps a thing alive on screen — a call to action that sits perfectly still reads
 *  as a static image, not as something to press */
export const Wiggle: React.FC<{
  children: React.ReactNode; amp?: number; speed?: number; phase?: number;
}> = ({ children, amp = 9, speed = 9, phase = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / speed + phase;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto",
      transform: `rotate(${Math.sin(t) * amp}deg) translateY(${Math.cos(t * 0.8) * amp * 0.5}px) `
        + `scale(${1 + 0.05 * Math.abs(Math.sin(t * 0.7))})`,
    }}>{children}</div>
  );
};

export const Tag: React.FC<{ text: string; tone?: string; at?: number; size?: number }> = ({
  text, tone = STAGE.bad, at = 0, size = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{
      padding: `${size * 0.28}px ${size * 0.7}px`, borderRadius: 999, background: tone, color: "#FFFFFF",
      border: `4px solid ${STAGE.ink}`, boxShadow: `0 6px 0 rgba(0,0,0,0.4)`,
      fontFamily: font.family, fontWeight: 800, fontSize: size, letterSpacing: 2,
      transform: `scale(${p})`, whiteSpace: "nowrap", flex: "0 0 auto",
    }}>{text}</div>
  );
};

export const Line: React.FC<{ text: string; size?: number; at?: number; color?: string }> = ({
  text, size = 80, at = 0, color = STAGE.cream,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, color, textAlign: "center",
      lineHeight: 1.14, whiteSpace: "pre-line", maxWidth: "100%",
      textShadow: "0 3px 0 rgba(0,0,0,0.35)",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 30) * 4}px)`,
    }}>{text}</div>
  );
};

export const Mark: React.FC<{ kind: "yes" | "no"; at: number; size?: number }> = ({ kind, at, size = 128 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flex: "0 0 auto",
      background: kind === "yes" ? STAGE.good : STAGE.bad,
      border: `${Math.max(4, size * 0.05)}px solid #FFFFFF`, boxSizing: "border-box",
      boxShadow: `0 ${size * 0.07}px 0 ${STAGE.ink}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.55, color: "#FFFFFF",
      transform: `scale(${p}) rotate(${Math.sin(frame / 26) * 5}deg)`,
    }}>{kind === "yes" ? "✓" : "✕"}</div>
  );
};

/** a connector, so the next thing is JOINED to what is already on stage */
export const Link: React.FC<{ kind?: "arrow" | "plus" | "equals"; at?: number; size?: number; tone?: string }> = ({
  kind = "arrow", at = 0, size = 72, tone = STAGE.cream,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  if (kind !== "arrow") {
    return (
      <div style={{
        fontFamily: font.family, fontWeight: 800, fontSize: size, color: tone,
        transform: `scale(${p})`, flex: "0 0 auto", textShadow: "0 3px 0 rgba(0,0,0,0.35)",
      }}>{kind === "plus" ? "+" : "="}</div>
    );
  }
  const t = ((frame - at) % 42) / 42;
  return (
    <div style={{ position: "relative", width: size * 1.45, height: size * 0.5, flex: "0 0 auto", transform: `scale(${p})` }}>
      <div style={{ position: "absolute", left: 0, top: size * 0.19, width: size * 1.02, height: size * 0.12, borderRadius: 99, background: tone }} />
      <div style={{
        position: "absolute", left: size * 0.98, top: size * 0.03, width: 0, height: 0,
        borderTop: `${size * 0.22}px solid transparent`, borderBottom: `${size * 0.22}px solid transparent`,
        borderLeft: `${size * 0.34}px solid ${tone}`,
      }} />
      <div style={{
        position: "absolute", left: t * size * 0.92, top: size * 0.15, width: size * 0.2, height: size * 0.2,
        borderRadius: "50%", background: STAGE.gold, opacity: 0.55 + 0.45 * Math.sin(t * Math.PI),
      }} />
    </div>
  );
};

/** a chevron that points AT the thing above it — "look here", with no words in it */
export const Point: React.FC<{ at?: number; size?: number; tone?: string }> = ({
  at = 0, size = 74, tone = STAGE.gold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  const bob = Math.sin((frame - at) / 7) * size * 0.14;
  return (
    <div style={{ position: "relative", width: size, height: size * 0.72, flex: "0 0 auto", transform: `scale(${p}) translateY(${bob}px)` }}>
      <div style={{ position: "absolute", left: size * 0.34, top: 0, width: size * 0.32, height: size * 0.34, background: tone, borderRadius: 5 }} />
      <div style={{
        position: "absolute", left: 0, top: size * 0.30, width: 0, height: 0,
        borderLeft: `${size * 0.5}px solid transparent`, borderRight: `${size * 0.5}px solid transparent`,
        borderTop: `${size * 0.42}px solid ${tone}`,
      }} />
    </div>
  );
};

/** an ear with the sound arriving at it */
export const Ear: React.FC<{ at?: number; size?: number; tone?: string }> = ({
  at = 0, size = 230, tone = STAGE.gold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  const lean = Math.sin(frame / 16) * 7;
  const beat = 0.5 + 0.5 * Math.sin(frame / 11);
  return (
    <div style={{
      position: "relative", width: size * 1.72, height: size, flex: "0 0 auto",
      display: "flex", alignItems: "center", justifyContent: "flex-end", transform: `scale(${p})`,
    }}>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 15) % 45) / 45;
        const r = size * (0.92 - t * 0.42);
        return (
          <div key={i} style={{
            position: "absolute", right: size * 0.34 - r, top: size * 0.5 - r,
            width: r * 2, height: r * 2, borderRadius: "50%",
            border: `${Math.max(4, size * 0.035)}px solid transparent`,
            borderLeftColor: tone, boxSizing: "border-box", opacity: Math.sin(t * Math.PI) * 0.85,
          }} />
        );
      })}
      <div style={{
        fontSize: size * 0.78, lineHeight: 1,
        transform: `rotate(${lean}deg) scale(${1 + beat * 0.055})`,
        filter: `drop-shadow(0 0 ${size * 0.06 * beat}px rgba(245,197,66,0.9))`,
      }}>{"\u{1F442}"}</div>
    </div>
  );
};

/** the held moment where the child answers */
export const Thinking: React.FC<{ at: number; size?: number }> = ({ at, size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{ display: "flex", gap: size * 0.7, alignItems: "center", transform: `scale(${p})`, flex: "0 0 auto" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: size, height: size, borderRadius: "50%", background: STAGE.gold,
          transform: `translateY(${Math.sin((frame - at) / 6 - i * 0.9) * size * 0.5}px)`,
          opacity: 0.55 + 0.45 * Math.max(0, Math.sin((frame - at) / 6 - i * 0.9)),
        }} />
      ))}
    </div>
  );
};

/** what a good reader actually does with a `w a` word — a loop, not a statement */
export const TryLoop: React.FC<{ step: 0 | 1 | 2 | 3; at?: number; scale?: number }> = ({ step, at = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const box = (text: string, bg: string, on: boolean, fg = STAGE.ink) => (
    <div style={{
      padding: `${20 * scale}px ${34 * scale}px`, borderRadius: 20, background: bg, color: fg,
      border: `5px solid ${STAGE.ink}`, boxShadow: `0 8px 0 rgba(0,0,0,0.4)`,
      fontFamily: font.family, fontWeight: 800, fontSize: 50 * scale, whiteSpace: "nowrap",
      opacity: on ? 1 : 0.26, transform: `scale(${on ? 1 : 0.94})`,
    }}>{text}</div>
  );
  const arm = (on: boolean) => (
    <div style={{ width: 62 * scale, height: 9, borderRadius: 5, background: STAGE.cream, opacity: on ? 1 : 0.22 }} />
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 * scale, transform: `scale(${p})`, flex: "0 0 auto" }}>
      {box("try /o/", STAGE.w, step >= 0)}
      {arm(step >= 1)}
      {box("real word?", STAGE.cream, step >= 1)}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 * scale }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
          {arm(step >= 2)}{box("YES ✓", STAGE.good, step >= 2, "#FFFFFF")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
          {arm(step >= 3)}{box("NO → try /a/", STAGE.bad, step >= 3, "#FFFFFF")}
        </div>
      </div>
    </div>
  );
};

// ── pictures ─────────────────────────────────────────────────────────────────

const APP_ART = new Set(["fox", "watch", "swan", "wand", "cat", "egg"]);
const EMOJI: Record<string, string> = {
  box: "📦", mix: "🥣", fix: "🔧", wax: "🕯️", want: "🎁", wash: "🧼", wag: "🐕",
  bike: "🚲", toys: "🧸", flour: "🌾", bird: "🐦", lake: "🌊", tail: "🐕", hands: "🤲",
  star: "⭐", idea: "💡", ear: "👂", write: "✍️", hat: "🎩", magic: "✨",
};

/** `six` is drawn, not written: the line is "I can count to six", so six things you can
 *  count teach it and the numeral 6 does not. */
const SixPips: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.16, background: STAGE.cream,
      border: `${Math.max(4, size * 0.035)}px solid ${STAGE.ink}`, boxSizing: "border-box",
      display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr",
      padding: size * 0.13, gap: size * 0.06,
    }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{
          borderRadius: "50%", background: STAGE.x, border: `${Math.max(2, size * 0.018)}px solid ${STAGE.ink}`,
          transform: `scale(${0.86 + 0.14 * Math.abs(Math.sin((frame + i * 9) / 20))})`,
        }} />
      ))}
    </div>
  );
};

export const hasPic = (w: string) => APP_ART.has(w) || w in EMOJI || w === "six";

export const Pic: React.FC<{ word: string; size?: number; seed?: number; at?: number }> = ({
  word, size = 195, seed = 0, at,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = word.toLowerCase();
  const p = at === undefined ? 1 : pop(frame, fps, at, 14);
  if (!hasPic(w)) return null;
  return (
    <div style={{
      width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
      transform: `scale(${p}) translateY(${Math.sin((frame + seed * 24) / 34) * 6}px) rotate(${Math.sin((frame + seed * 30) / 46) * 3}deg)`,
    }}>
      {w === "six" ? <SixPips size={size * 0.9} />
        : APP_ART.has(w)
          ? <Img src={staticFile(`img/p3/${w}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          : <div style={{ fontSize: size * 0.82, lineHeight: 1 }}>{EMOJI[w]}</div>}
    </div>
  );
};

/** an example sentence with the taught word picked out, beside its picture */
export const Sentence: React.FC<{
  text: string; target: string; pic?: string; at?: number; size?: number; picSize?: number;
}> = ({ text, target, pic, at = 0, size = 58, picSize = 170 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const parts = text.split(new RegExp(`(\\b${target}\\b)`, "i"));
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 22, maxWidth: "100%", flex: "0 0 auto",
      padding: "16px 30px", borderRadius: 30, background: STAGE.cream,
      border: `5px solid ${STAGE.ink}`, boxShadow: `0 10px 0 rgba(0,0,0,0.35)`,
      transform: `scale(${0.96 + 0.04 * p}) translateY(${Math.sin(frame / 36) * 3}px)`,
    }}>
      {pic && <Pic word={pic} size={picSize} seed={3} />}
      <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: size, color: STAGE.ink, lineHeight: 1.2 }}>
        {parts.map((s, i) =>
          s.toLowerCase() === target.toLowerCase()
            ? <span key={i} style={{ color: "#B0430F", fontWeight: 800, textDecoration: "underline", textDecorationThickness: 5, textUnderlineOffset: 7 }}>{s}</span>
            : <span key={i}>{s}</span>
        )}
      </div>
    </div>
  );
};

export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <>{children}</>;
};
