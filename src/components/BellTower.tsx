import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── THE BELL TOWER ───────────────────────────────────────────────────────────
//
// The world for L5 Part 2 (‑ng and ‑nk). Every video wears its own: Part 1 had The Word
// Building Site, blue sky over tan ground. This one is a sunrise clocktower, so the two
// cannot be confused at a glance.
//
// The world is chosen to make the LESSON visible, not to be scenery:
//
//   · `ng` RINGS  — the bell swings and a ring of light expands outward and keeps going,
//     because the /ng/ sound carries on;
//   · `nk` STOPS  — the same bell, the same swing, but a wooden stopper snaps against it
//     and the ring is cut off dead. That block is the /k/.
//
// A child sees the difference before the teacher explains it, which is the whole point of
// the minimal-pair section (ring/rink, sing/sink, bang/bank).
//
// PIP, the bell-keeper, is not decoration. Pip pulls the rope when a word is read, cups a
// wing during the listening pauses, is knocked back by the stopper, and cheers on praise.
//
// ── LAYOUT LAW ───────────────────────────────────────────────────────────────
// Part 1 cost roughly thirty rounds of "this is overlapping". The cause every single time
// was an absolutely-positioned element sharing space with the content column. So here:
//
//   1. Content lives in ONE box (`Content`) and nothing else may enter it.
//   2. The tower, Pip and the banner sit in bands the content box does not reach.
//   3. A ringing bell RESERVES the space its rings will need (`Bell inline`), so an
//      expanding ring can never sweep across a neighbour. That is why the ring factors
//      below are modest — the contrast between ng and nk is carried by how LONG the ring
//      lives and by the stopper block, not by how far it travels.

export const TOWER = {
  skyTop: "#FFD9A8",
  skyMid: "#FFF1DC",
  skyBot: "#CFE9F5",
  // ONE green ramp for the whole landscape. Measured on the first cut, the near hill sat
  // at #A6D8A0 and the ground began at #91D087 and fell to #6DB466 — a visible step at the
  // horizon and a foreground dull enough to read as a different material. The ground now
  // STARTS on the hill's own colour and deepens by a third of what it did.
  hillFar: "#ADDAA4",
  hillNear: "#A6D8A0",
  groundTop: "#A6D8A0",
  groundBot: "#8FCB89",
  grass: "rgba(72,132,80,0.30)",
  stone: "#3E6B7A",
  stoneDark: "#2C5261",
  wood: "#B5793C",
  brass: "#F2B33D",
  brassDark: "#C98A1E",
  ink: "#22303A",
  ring: "#FFC24A",     // ng — the sound that carries
  stop: "#E0552B",     // nk — the sound that stops
  vowel: "#3F9BD4",
  good: "#37A66B",
  bad: "#D94A3D",
  cream: "#FFF8EC",
};

/**
 * Per-aspect band table.
 *
 * 16:9 and 4:5 do NOT share a layout, they only share a world. In the wide cut the tower
 * stands in its own column to the RIGHT of the content; in portrait there is no such
 * column, so the tower drops into the ground band beside Pip and the content takes the
 * full width. Scaling the wide layout down instead is what made Part 1's portrait cut
 * read as "everything is too small" — the fix is to re-arrange, not to shrink.
 */
export const bands = (width: number, height: number) => {
  const wide = width > height;
  return wide
    ? {
        width, height, wide,
        horizon: Math.round(height * 0.72),
        towerL: Math.round(width * 0.766),
        towerW: Math.round(width * 0.208),
        towerTop: Math.round(height * 0.018),
        towerH: Math.round(height * 0.778),
        bannerTop: Math.round(height * 0.022),
        contentTop: Math.round(height * 0.111),
        contentH: Math.round(height * 0.593),
        contentL: Math.round(width * 0.031),
        contentR: Math.round(width * 0.735),
        pipTop: Math.round(height * 0.720),
        pipSize: Math.round(height * 0.205),
      }
    : {
        width, height, wide,
        horizon: Math.round(height * 0.630),
        // the tower is a landmark in the ground band, entirely BELOW the content box
        towerL: Math.round(width * 0.775),
        towerW: Math.round(width * 0.150),
        towerTop: Math.round(height * 0.625),
        towerH: Math.round(height * 0.247),
        bannerTop: Math.round(height * 0.020),
        // content owns the whole width, and gets more height than the wide cut has
        contentTop: Math.round(height * 0.096),
        contentH: Math.round(height * 0.489),
        contentL: Math.round(width * 0.037),
        contentR: Math.round(width * 0.963),
        pipTop: Math.round(height * 0.652),
        pipSize: Math.round(height * 0.150),
      };
};
export type B = ReturnType<typeof bands>;

export const pop = (frame: number, fps: number, at: number, damping = 12) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 140 } });

/** anything absolutely placed must sit in here, so it is pinned to the FRAME and not to
 *  whatever positioned ancestor happens to be nearest. */
export const Fixed: React.FC<{ b: B; children: React.ReactNode }> = ({ b, children }) => (
  <div style={{ position: "fixed", left: 0, top: 0, width: b.width, height: b.height }}>{children}</div>
);

// ── the world ────────────────────────────────────────────────────────────────

const Birds: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 260) % 900) / 900;
        const x = b.width + 60 - t * (b.width + 160);
        const y = b.height * (0.10 + i * 0.030) + Math.sin(frame / (18 + i * 5)) * 12;
        const flap = Math.sin(frame / (3.4 + i * 0.4)) * 15;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 44, height: 20, opacity: 0.75 }}>
            <div style={{ position: "absolute", left: 0, top: 9, width: 23, height: 5, borderRadius: 4, background: "#5E7A88", transformOrigin: "right center", transform: `rotate(${-flap}deg)` }} />
            <div style={{ position: "absolute", left: 21, top: 9, width: 23, height: 5, borderRadius: 4, background: "#5E7A88", transformOrigin: "left center", transform: `rotate(${flap}deg)` }} />
          </div>
        );
      })}
    </>
  );
};

/**
 * The clocktower — scenery, planted in the ground and running the full height of the frame.
 *
 * It holds a CLOCK, not a bell. There is exactly one bell in this video and it lives in the
 * content column where the lesson is; a second one up here would split a child's attention
 * between two identical objects and make the ring/stop contrast harder, not easier.
 */
export const Tower: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const W = b.towerW;
  const top = b.towerTop;
  const H = b.towerH;
  const shaftTop = W * 0.36;
  const span = H - shaftTop;   // the stone the clock, window and door are mounted on

  return (
    <div style={{ position: "absolute", left: b.towerL, top, width: W, height: H }}>
      {/* spire and weather-vane */}
      <div style={{ position: "absolute", left: W * 0.465, top: -W * 0.20, width: W * 0.045, height: W * 0.22, background: TOWER.ink, borderRadius: 3 }} />
      <div style={{ position: "absolute", left: W * 0.40, top: -W * 0.25, width: W * 0.18, height: W * 0.09, background: TOWER.brass, border: `4px solid ${TOWER.ink}`, boxSizing: "border-box", borderRadius: 3 }} />

      {/* roof */}
      <div style={{
        position: "absolute", left: -W * 0.12, top: 0, width: 0, height: 0,
        borderLeft: `${W * 0.62}px solid transparent`, borderRight: `${W * 0.62}px solid transparent`,
        borderBottom: `${W * 0.38}px solid ${TOWER.stop}`,
      }} />
      <div style={{ position: "absolute", left: -W * 0.12, top: W * 0.34, width: W * 1.24, height: W * 0.06, borderRadius: 4, background: "#B33F1C" }} />

      {/* shaft, standing on the ground */}
      <div style={{
        position: "absolute", left: 0, top: shaftTop, width: W, height: H - shaftTop,
        background: `linear-gradient(100deg, ${TOWER.stone} 0%, #4C7E8E 46%, ${TOWER.stoneDark} 100%)`,
        border: `6px solid ${TOWER.ink}`, boxSizing: "border-box",
      }} />
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: 8, top: shaftTop + 30 + i * ((H - shaftTop - 46) / 11),
          width: W - 16, height: 3, background: "rgba(0,0,0,0.14)",
        }} />
      ))}

      {/* the clock face, mounted on the stone, hands actually turning */}
      <div style={{
        position: "absolute", left: W * 0.19, top: shaftTop + span * 0.08, width: W * 0.62, height: W * 0.62,
        borderRadius: "50%", background: TOWER.cream, border: `7px solid ${TOWER.ink}`, boxSizing: "border-box",
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: "48.5%", top: "5%", width: "3%", height: "9%", background: TOWER.ink,
            transformOrigin: "50% 500%", transform: `rotate(${i * 30}deg)`, opacity: i % 3 === 0 ? 1 : 0.45,
          }} />
        ))}
        <div style={{ position: "absolute", left: "48%", top: "20%", width: "4%", height: "32%", background: TOWER.ink, borderRadius: 3, transformOrigin: "50% 100%", transform: `rotate(${frame * 0.9}deg)` }} />
        <div style={{ position: "absolute", left: "46.5%", top: "30%", width: "6%", height: "22%", background: TOWER.stop, borderRadius: 3, transformOrigin: "50% 100%", transform: `rotate(${frame * 0.14}deg)` }} />
        <div style={{ position: "absolute", left: "45%", top: "44%", width: "10%", height: "10%", borderRadius: "50%", background: TOWER.ink }} />
      </div>

      {/* an arched window below it */}
      <div style={{
        position: "absolute", left: W * 0.24, top: shaftTop + span * 0.46, width: W * 0.52, height: span * 0.24,
        borderRadius: `${W * 0.26}px ${W * 0.26}px 8px 8px`,
        background: "#1E3A46", border: `6px solid ${TOWER.ink}`, boxSizing: "border-box",
      }} />

      {/* and a door on the ground */}
      <div style={{
        position: "absolute", left: W * 0.33, top: H - span * 0.20, width: W * 0.34, height: span * 0.20,
        borderRadius: `${W * 0.17}px ${W * 0.17}px 0 0`,
        background: TOWER.wood, border: `6px solid ${TOWER.ink}`, boxSizing: "border-box",
      }} />
    </div>
  );
};

const Clouds: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[[0.16, 0.10, 1.0], [0.46, 0.055, 0.7], [0.62, 0.16, 0.85]].map(([fx, fy, sc], i) => {
        const x = (((fx as number) * b.width + frame * 0.22) % (b.width + 460)) - 230;
        const s = (sc as number) * b.width * 0.10;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: (fy as number) * b.height, opacity: 0.72 }}>
            {[[0, 0.22, 1], [0.5, 0, 1.3], [1.05, 0.26, 0.9]].map(([ox, oy, os], j) => (
              <div key={j} style={{
                position: "absolute", left: (ox as number) * s, top: (oy as number) * s,
                width: s * (os as number), height: s * (os as number) * 0.72,
                borderRadius: "50%", background: "#FFFFFF",
              }} />
            ))}
          </div>
        );
      })}
    </>
  );
};

/** `bare` omits the clocktower. The L5 Part 2 cover needs the world without its landmark
 *  because at 1280×720 the tower stands at x980–1246, straight through the lesson band —
 *  the cover then draws its own smaller one, clear of the content. */
export const TowerWorld: React.FC<{ bare?: boolean }> = ({ bare = false }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${TOWER.skyTop} 0%, ${TOWER.skyMid} 42%, ${TOWER.skyBot} 100%)` }}>
      {/* the sun, low and warm */}
      <div style={{ position: "absolute", left: width * 0.045, top: height * 0.05, width: width * 0.115, height: width * 0.115, borderRadius: "50%", background: "#FFC65C", opacity: 0.75 }} />
      <div style={{ position: "absolute", left: width * 0.028, top: height * 0.05 - width * 0.017, width: width * 0.149, height: width * 0.149, borderRadius: "50%", background: "#FFD98A", opacity: 0.35 }} />
      <Clouds b={b} />
      {!bare && <Birds b={b} />}

      {/* far hills */}
      {[[0.00, 0.10, TOWER.hillFar], [0.42, 0.13, TOWER.hillNear], [0.74, 0.09, TOWER.hillFar]].map(([fx, fh, c], i) => (
        <div key={i} style={{
          position: "absolute", left: width * (fx as number) - 80, top: b.horizon - height * (fh as number),
          width: width * 0.55, height: height * ((fh as number) + 0.08), borderRadius: "50% 50% 0 0", background: c as string,
        }} />
      ))}

      {/* ground */}
      <div style={{
        position: "absolute", left: 0, top: b.horizon, width, height: height - b.horizon,
        background: `linear-gradient(${TOWER.groundTop} 0%, ${TOWER.groundBot} 100%)`,
      }} />
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: ((i * 137) % 100) / 100 * width,
          top: b.horizon + 18 + ((i * 53) % 100) / 100 * (height - b.horizon - 40),
          width: 7, height: 16, borderRadius: 3, background: TOWER.grass,
          transform: `rotate(${Math.sin((frame + i * 30) / 44) * 8}deg)`,
        }} />
      ))}
      {!bare && <Tower b={b} />}
    </AbsoluteFill>
  );
};

// ── the bell, which IS the lesson ────────────────────────────────────────────

// how far a ring travels, as a multiple of the bell's size. Deliberately small: the
// ng/nk contrast is carried by ring LIFETIME and by the stopper, and a big travel would
// mean an expanding ring sweeping over the words beside it.
// Sound is drawn as ARCS beside the bell, not as full expanding circles.
//
// The first cut used concentric rings travelling 2.65× the bell's width. Reserving room for
// them meant a 170px bell sat inside a 476px empty square, so the lesson read as a postage
// stamp in the corner of the frame. Arcs need a third of the space, which buys back enough
// room to make the bell — and every letter beside it — properly big.
const ARC_R = (k: number, t: number) => 0.58 + k * 0.15 + t * 0.08;   // max 0.96
const RESERVE_W = 0.96;                                              // half-width, in size units
const RESERVE_H = 1.38;                                              // full height, in size units
const BELL_DY = 0.13;                                                // where the bell sits inside it

/**
 * `ringAt` starts a swing. `stopped` puts the wooden block against it, which is what
 * turns /ng/ into /ngk/ — the ring is cut off instead of carrying on.
 *
 * `inline` makes the bell a normal flow element that RESERVES room for its own rings, so
 * it can be dropped straight into the content column with no chance of an overlap.
 */
export const Bell: React.FC<{
  b: B; ringAt?: number | null; stopped?: boolean; size?: number;
  x?: number; y?: number; inline?: boolean;
}> = ({ b, ringAt = null, stopped = false, size = 210, x, y, inline = false }) => {
  const frame = useCurrentFrame();
  const since = ringAt === null ? -1 : frame - ringAt;
  const active = since >= 0 && since < 200;
  // the swing dies away; a stopped bell dies away much faster
  const decay = stopped ? 14 : 46;
  const swing = active ? Math.sin(since / 3.4) * 18 * Math.exp(-since / decay) : Math.sin(frame / 70) * 1.5;

  const bell = (
    <>
      {/* the sound, as arcs either side of the bell. They keep pulsing for ng, and are
          killed inside a few frames for nk — that difference IS the lesson. */}
      {active && [0, 1, 2].map((k) => {
        const life = stopped ? 26 : 88;
        const t = (since - k * (stopped ? 5 : 14)) / life;
        if (t < 0 || t > 1) return null;
        const r = size * ARC_R(k, t);
        const w = Math.max(3, size * 0.030);
        // ng keeps breathing while it sounds; nk just fades out fast
        const fade = stopped
          ? (1 - t) * 0.85
          : (0.45 + 0.55 * Math.abs(Math.sin(since / 8))) * (1 - t * 0.55);
        const box: React.CSSProperties = {
          position: "absolute", left: size * 0.5 - r, top: size * 0.55 - r,
          width: r * 2, height: r * 2, borderRadius: "50%",
          border: `${w}px solid transparent`, boxSizing: "border-box", opacity: fade,
        };
        const col = stopped ? TOWER.stop : TOWER.ring;
        return (
          <React.Fragment key={k}>
            <div style={{ ...box, borderRightColor: col }} />
            <div style={{ ...box, borderLeftColor: col }} />
          </React.Fragment>
        );
      })}

      <div style={{ position: "absolute", left: size * 0.46, top: 0, width: size * 0.08, height: size * 0.16, background: TOWER.wood, borderRadius: 4 }} />
      <div style={{ transformOrigin: "50% 8%", transform: `rotate(${swing}deg)` }}>
        <div style={{
          position: "absolute", left: size * 0.12, top: size * 0.14, width: size * 0.76, height: size * 0.68,
          borderRadius: `${size * 0.38}px ${size * 0.38}px ${size * 0.12}px ${size * 0.12}px`,
          background: `linear-gradient(150deg, #FFDE9A 0%, ${TOWER.brass} 48%, ${TOWER.brassDark} 100%)`,
          border: `${Math.max(4, size * 0.026)}px solid ${TOWER.ink}`,
        }} />
        <div style={{ position: "absolute", left: size * 0.06, top: size * 0.78, width: size * 0.88, height: size * 0.11, borderRadius: 999, background: TOWER.brassDark, border: `${Math.max(4, size * 0.026)}px solid ${TOWER.ink}` }} />
        <div style={{ position: "absolute", left: size * 0.45, top: size * 0.86, width: size * 0.1, height: size * 0.12, borderRadius: "50%", background: TOWER.ink }} />
      </div>

      {/* the STOPPER — this block is the /k/ */}
      {stopped && (
        <div style={{
          position: "absolute", left: size * 0.84, top: size * 0.36,
          width: size * 0.26, height: size * 0.36, borderRadius: 9,
          background: TOWER.stop, border: `${Math.max(4, size * 0.026)}px solid ${TOWER.ink}`,
          boxShadow: `0 ${size * 0.03}px 0 ${TOWER.ink}`,
          transform: `translateX(${active && since < 12 ? -size * 0.10 : 0}px)`,
        }} />
      )}
    </>
  );

  if (inline) {
    // exactly the room the widest arc needs — no more, so the bell reads big
    const boxW = size * RESERVE_W * 2;
    const boxH = size * RESERVE_H;
    return (
      <div style={{ position: "relative", width: boxW, height: boxH, flex: "0 0 auto" }}>
        <div style={{ position: "absolute", left: boxW / 2 - size / 2, top: size * BELL_DY, width: size, height: size * 1.25 }}>
          {bell}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute",
      left: x ?? b.width * 0.5 - size * 0.5,
      top: y ?? b.height * 0.30,
      width: size, height: size * 1.25,
    }}>{bell}</div>
  );
};

// ── Pip, the bell-keeper ─────────────────────────────────────────────────────

export type PipMood = "idle" | "pull" | "listen" | "bump" | "cheer";

export const Pip: React.FC<{ b: B; mood?: PipMood; size?: number; x?: number; y?: number }> = ({
  b, mood = "idle", size, x, y,
}) => {
  const frame = useCurrentFrame();
  const S = size ?? b.pipSize;
  const bobY = Math.sin(frame / 26) * 6;
  const flap = Math.sin(frame / 5) * 22;

  const body =
    mood === "cheer" ? { rot: Math.sin(frame / 6) * 10, lift: -Math.abs(Math.sin(frame / 9)) * 26 }
    : mood === "bump" ? { rot: -14, lift: 10 }
    : mood === "pull" ? { rot: 6, lift: 8 }
    : { rot: Math.sin(frame / 40) * 2, lift: 0 };

  const wingRot = mood === "cheer" ? flap : mood === "listen" ? -46 : mood === "pull" ? 40 : Math.sin(frame / 34) * 8;

  return (
    <div style={{
      position: "absolute", left: x ?? b.contentL, top: (y ?? b.pipTop) + bobY + body.lift,
      width: S, height: S * 1.22,
      transform: `rotate(${body.rot}deg)`,
    }}>
      {/* legs and feet, so Pip STANDS on the grass instead of hovering as a blob */}
      {[0.34, 0.58].map((fx, i) => (
        <div key={`leg${i}`} style={{
          position: "absolute", left: S * fx, top: S * 0.86, width: S * 0.055, height: S * 0.20,
          background: "#F08B24", borderRadius: 4,
          transformOrigin: "50% 0%",
          transform: `rotate(${mood === "cheer" ? Math.sin(frame / 7 + i * 2) * 12 : 0}deg)`,
        }} />
      ))}
      {[0.24, 0.48].map((fx, i) => (
        <div key={`foot${i}`} style={{
          position: "absolute", left: S * fx, top: S * 1.04, width: S * 0.22, height: S * 0.075,
          background: "#F08B24", borderRadius: `${S * 0.05}px ${S * 0.05}px ${S * 0.02}px ${S * 0.02}px`,
          border: `${Math.max(3, S * 0.02)}px solid ${TOWER.ink}`, boxSizing: "border-box",
        }} />
      ))}

      {/* tail feathers */}
      <div style={{
        position: "absolute", left: S * 0.74, top: S * 0.46, width: S * 0.30, height: S * 0.20,
        borderRadius: "10% 60% 60% 10%", background: "#F2A93B",
        border: `${Math.max(3, S * 0.022)}px solid ${TOWER.ink}`, boxSizing: "border-box",
        transformOrigin: "0% 50%", transform: `rotate(${-12 + Math.sin(frame / 30) * 6}deg)`,
      }} />

      {/* body */}
      <div style={{
        position: "absolute", left: S * 0.10, top: S * 0.20, width: S * 0.80, height: S * 0.74,
        borderRadius: "50% 50% 46% 46%", background: "#FFC44D",
        border: `${Math.max(4, S * 0.028)}px solid ${TOWER.ink}`, boxSizing: "border-box",
      }} />
      <div style={{ position: "absolute", left: S * 0.26, top: S * 0.50, width: S * 0.48, height: S * 0.38, borderRadius: "50%", background: "#FFF0C4" }} />

      {/* crest */}
      <div style={{
        position: "absolute", left: S * 0.42, top: S * 0.06, width: S * 0.09, height: S * 0.20,
        borderRadius: "50% 50% 20% 20%", background: TOWER.stop,
        border: `${Math.max(3, S * 0.02)}px solid ${TOWER.ink}`, boxSizing: "border-box",
        transformOrigin: "50% 100%", transform: `rotate(${Math.sin(frame / 18) * 9}deg)`,
      }} />

      {/* eyes — big, with a highlight, and they squeeze shut when Pip cheers */}
      {[0.30, 0.56].map((fx, i) => (
        <div key={i} style={{
          position: "absolute", left: S * fx, top: S * 0.34,
          width: S * 0.14, height: mood === "cheer" ? S * 0.035 : S * 0.16,
          borderRadius: "50%", background: TOWER.ink,
        }}>
          {mood !== "cheer" && (
            <div style={{ position: "absolute", left: "26%", top: "16%", width: "36%", height: "34%", borderRadius: "50%", background: "#FFFFFF" }} />
          )}
        </div>
      ))}

      {/* beak */}
      <div style={{
        position: "absolute", left: S * 0.42, top: S * 0.54, width: 0, height: 0,
        borderLeft: `${S * 0.08}px solid transparent`, borderRight: `${S * 0.08}px solid transparent`,
        borderTop: `${S * 0.13}px solid #F08B24`,
      }} />

      {/* the wing that does the acting */}
      <div style={{
        position: "absolute", left: S * 0.00, top: S * 0.44, width: S * 0.32, height: S * 0.24,
        borderRadius: "50% 40% 50% 50%", background: "#F2A93B",
        border: `${Math.max(3, S * 0.022)}px solid ${TOWER.ink}`, boxSizing: "border-box",
        transformOrigin: "90% 30%", transform: `rotate(${wingRot}deg)`,
      }} />

      {/* the cupped ear during the listening pauses */}
      {mood === "listen" && (
        <div style={{
          position: "absolute", left: S * 0.74, top: S * 0.26, width: S * 0.28, height: S * 0.28,
          borderRadius: "50%", border: `${Math.max(4, S * 0.03)}px solid ${TOWER.ink}`, borderRightColor: "transparent",
          transform: `rotate(${-20 + Math.sin(frame / 12) * 6}deg)`,
        }} />
      )}
    </div>
  );
};

// ── layout ───────────────────────────────────────────────────────────────────

export const Content: React.FC<{ b: B; children: React.ReactNode; gap?: number }> = ({ b, children, gap }) => (
  <div style={{
    position: "absolute", left: b.contentL, top: b.contentTop,
    width: b.contentR - b.contentL, height: b.contentH,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: gap ?? Math.round(b.height * 0.038),
  }}>
    {children}
  </div>
);

export const Row: React.FC<{ children: React.ReactNode; gap?: number; align?: "center" | "flex-end" }> = ({
  children, gap = 14, align = "center",
}) => (
  <div style={{ display: "flex", alignItems: align, justifyContent: "center", gap, flexWrap: "wrap", rowGap: 16 }}>
    {children}
  </div>
);

export const Card: React.FC<{
  ch: string; size?: number; tone?: "plain" | "ring" | "stop" | "vowel" | "good" | "bad" | "dim";
  at?: number; seed?: number; hot?: boolean;
  /** fixed slot width, so a placeholder and the letter that replaces it never shift the row */
  w?: number;
  /** slide in from a direction instead of only popping — a card that ARRIVES reads as
   *  something being added to the stage, not as a whole new stage */
  from?: "left" | "right" | "up" | "down";
}> = ({ ch, size = 170, tone = "plain", at = 0, seed = 0, hot = false, w, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = { plain: "#FFFFFF", ring: TOWER.ring, stop: TOWER.stop, vowel: TOWER.vowel, good: TOWER.good, bad: TOWER.bad, dim: "#D9DFE3" }[tone];
  const n = parseInt(bg.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  const p = pop(frame, fps, at, 17);
  const slide = from ? (1 - Math.min(1, p)) * size * 1.15 : 0;
  const dx = from === "left" ? -slide : from === "right" ? slide : 0;
  const dy = from === "up" ? -slide : from === "down" ? slide : 0;
  return (
    <div style={{
      width: w, minWidth: w ?? size * 0.74, height: size, padding: `0 ${size * 0.12}px`,
      borderRadius: size * 0.2, background: bg,
      border: `${Math.max(4, size * 0.04)}px solid ${TOWER.ink}`, boxSizing: "border-box",
      boxShadow: hot ? `0 ${size * 0.05}px 0 ${TOWER.ink}, 0 0 0 ${size * 0.038}px rgba(255,194,74,0.6)` : `0 ${size * 0.05}px 0 ${TOWER.ink}`,
      display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.58,
      color: lum > 168 ? TOWER.ink : "#FFFFFF",
      transform: `translate(${dx}px, ${dy + Math.sin((frame + seed * 22) / 42) * 4 - (hot ? size * 0.07 : 0)}px) scale(${p})`,
      whiteSpace: "nowrap", opacity: tone === "dim" ? 0.55 : 1,
    }}>{ch}</div>
  );
};

/** a whole word, with its ‑ng or ‑nk ending picked out */
export const Word: React.FC<{
  text: string; end?: string; size?: number; at?: number; vowel?: boolean; dimHead?: boolean;
}> = ({ text, end, size = 170, at = 0, vowel = false, dimHead = false }) => {
  const cut = end && text.endsWith(end) ? text.length - end.length : text.length;
  const head = text.slice(0, cut).split("");
  return (
    <>
      {head.map((c, i) => (
        <Card
          key={i} ch={c} size={size} at={at + i * 2} seed={i}
          tone={vowel && "aeiou".includes(c) ? "vowel" : dimHead ? "dim" : "plain"}
        />
      ))}
      {end && text.endsWith(end) && (
        <Card ch={end} size={size} tone={end === "nk" ? "stop" : "ring"} at={at + head.length * 2} seed={9} />
      )}
    </>
  );
};

/** one word of a stacked list, with the ending column aligned down the list */
export const WordRow: React.FC<{
  text: string; end: string; size?: number; at?: number; headSlots?: number; vowel?: boolean;
  pic?: string;
}> = ({ text, end, size = 108, at = 0, headSlots = 3, vowel = false, pic }) => {
  const head = text.slice(0, text.length - end.length).split("");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      {pic && <Pic word={pic} size={size * 0.92} seed={head.length} />}
      <div style={{ width: headSlots * size * 0.98 + (headSlots - 1) * 10, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {head.map((c, i) => (
          <Card key={i} ch={c} size={size} at={at + i * 2} seed={i} tone={vowel && "aeiou".includes(c) ? "vowel" : "plain"} />
        ))}
      </div>
      <Card ch={end} size={size} tone={end === "nk" ? "stop" : "ring"} at={at + head.length * 2} seed={9} />
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
      background: TOWER.cream, border: `6px solid ${TOWER.ink}`, boxShadow: `0 13px 0 rgba(34,48,58,0.25)`,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 22, flexWrap: "wrap", rowGap: 18,
      maxWidth: "100%", transform: `scale(${0.95 + 0.05 * p})`,
    }}>{children}</div>
  );
};

export const Banner: React.FC<{ b: B; text: string; tone?: string }> = ({ b, text, tone = TOWER.stone }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      position: "absolute", left: b.contentL, top: b.bannerTop,
      width: b.contentR - b.contentL, display: "flex", justifyContent: "center",
    }}>
      <div style={{
        padding: "14px 38px", borderRadius: 18, background: tone, color: "#FFFFFF",
        border: `6px solid ${TOWER.ink}`, boxShadow: `0 9px 0 ${TOWER.ink}`,
        fontFamily: font.family, fontWeight: 800, fontSize: Math.round(b.height * 0.040), letterSpacing: 1,
        transform: `translateY(${Math.sin(frame / 32) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

export const Tag: React.FC<{ text: string; tone?: string; at?: number; size?: number }> = ({
  text, tone = TOWER.stone, at = 0, size = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{
      padding: `${size * 0.28}px ${size * 0.7}px`, borderRadius: 999, background: tone, color: "#FFFFFF",
      border: `4px solid ${TOWER.ink}`, boxShadow: `0 6px 0 ${TOWER.ink}`,
      fontFamily: font.family, fontWeight: 800, fontSize: size, letterSpacing: 2,
      transform: `scale(${p})`, whiteSpace: "nowrap", flex: "0 0 auto",
    }}>{text}</div>
  );
};

export const Line: React.FC<{ text: string; size?: number; at?: number; color?: string }> = ({
  text, size = 80, at = 0, color = TOWER.ink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, color, textAlign: "center",
      lineHeight: 1.14, whiteSpace: "pre-line", maxWidth: "100%",
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
      background: kind === "yes" ? TOWER.good : TOWER.bad,
      border: `${Math.max(4, size * 0.05)}px solid #FFFFFF`, boxSizing: "border-box",
      boxShadow: `0 ${size * 0.07}px 0 ${TOWER.ink}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: size * 0.55, color: "#FFFFFF",
      transform: `scale(${p}) rotate(${Math.sin(frame / 26) * 5}deg)`,
    }}>{kind === "yes" ? "✓" : "✕"}</div>
  );
};

// ── instruments the lesson needs ─────────────────────────────────────────────

/**
 * A child's head in profile, cut away so "the back of your tongue lifts up and touches the
 * roof of your mouth" is something you can SEE.
 *
 * The first version was an unreadable blob: a peach oval with a dot for an eye and a dark
 * rectangle for a mouth. It has to read as a FACE at a glance or it teaches nothing, so this
 * one has a proper profile — brow, nose, lips, chin — and the cutaway sits inside it.
 *
 * The head faces LEFT, which puts the front of the mouth on the left and the BACK on the
 * right. That matters: the whole point is which end of the tongue moves.
 */
export const Mouth: React.FC<{ lift?: number; at?: number; size?: number }> = ({ lift = 0, at = 0, size = 330 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const L = Math.max(0, Math.min(1, lift));
  const ink = TOWER.ink;
  const skin = "#FFD3AC";
  const bw = Math.max(5, size * 0.017);

  // the cutaway, in size units
  const mx = 0.14, my = 0.44, mw = 0.56, mh = 0.26;

  return (
    <div style={{ width: size, height: size, position: "relative", flex: "0 0 auto", transform: `scale(${p})` }}>
      {/* hair */}
      <div style={{
        position: "absolute", left: size * 0.16, top: size * 0.02, width: size * 0.74, height: size * 0.42,
        borderRadius: "56% 50% 20% 34%", background: "#7A4B2A", border: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />
      {/* head + profile: brow, nose, lips and chin are one silhouette */}
      <div style={{
        position: "absolute", left: size * 0.10, top: size * 0.12, width: size * 0.80, height: size * 0.80,
        borderRadius: "48% 46% 42% 54%", background: skin, border: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />
      {/* the nose, pushed out to the left so the profile is unmistakable */}
      <div style={{
        position: "absolute", left: size * 0.03, top: size * 0.32, width: size * 0.20, height: size * 0.17,
        borderRadius: "60% 10% 40% 60%", background: skin, border: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />
      <div style={{ position: "absolute", left: size * 0.06, top: size * 0.40, width: size * 0.16, height: size * 0.12, background: skin }} />
      {/* chin */}
      <div style={{
        position: "absolute", left: size * 0.10, top: size * 0.68, width: size * 0.26, height: size * 0.20,
        borderRadius: "50% 20% 40% 60%", background: skin, borderLeft: `${bw}px solid ${ink}`, borderBottom: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />
      {/* eye */}
      <div style={{
        position: "absolute", left: size * 0.24, top: size * 0.26, width: size * 0.13, height: size * 0.11,
        borderRadius: "50%", background: "#FFFFFF", border: `${bw * 0.8}px solid ${ink}`, boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", left: "8%", top: "18%", width: "52%", height: "64%", borderRadius: "50%", background: ink }} />
      </div>
      <div style={{ position: "absolute", left: size * 0.23, top: size * 0.215, width: size * 0.15, height: bw * 0.9, borderRadius: 4, background: ink }} />

      {/* ── the cutaway ─────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: size * mx, top: size * my, width: size * mw, height: size * mh,
        borderRadius: `${size * 0.03}px ${size * 0.16}px ${size * 0.16}px ${size * 0.03}px`,
        background: "#5E2129", border: `${bw}px solid ${ink}`, boxSizing: "border-box", overflow: "hidden",
      }}>
        {/* the ROOF of the mouth — the thing the tongue reaches for */}
        <div style={{
          position: "absolute", left: 0, top: 0, width: "100%", height: "26%",
          background: "#E8A9A0", borderRadius: `0 0 ${size * 0.12}px 0`,
        }} />
        {/* upper teeth, at the FRONT */}
        <div style={{ position: "absolute", left: "2%", top: 0, width: "20%", height: "30%", background: "#FFFFFF", borderRadius: `0 0 ${bw * 2}px ${bw * 2}px` }} />
        {/* lower teeth */}
        <div style={{ position: "absolute", left: "2%", bottom: 0, width: "20%", height: "26%", background: "#FFFFFF", borderRadius: `${bw * 2}px ${bw * 2}px 0 0` }} />

        {/* the tongue. Its TIP is pinned at the left; its BACK is the right-hand end, and
            that is the end that lifts — which is exactly what makes /ng/. */}
        <div style={{
          position: "absolute", left: "6%", bottom: 0, width: "94%", height: "56%",
          background: "#E4757F", border: `${bw * 0.7}px solid #B4515E`, boxSizing: "border-box",
          borderRadius: `${size * 0.03}px ${size * 0.13}px ${size * 0.04}px ${size * 0.04}px`,
          transformOrigin: "0% 100%",
          transform: `rotate(${-L * 21}deg) translateY(${-L * size * 0.012}px)`,
        }} />

        {/* contact: the back of the tongue meeting the roof, and the sound coming out */}
        {L > 0.72 && (
          <div style={{
            position: "absolute", right: "3%", top: "16%", width: "34%", height: size * 0.028,
            borderRadius: 999, background: TOWER.ring,
            boxShadow: `0 0 ${size * 0.05}px ${TOWER.ring}`,
            opacity: 0.7 + 0.3 * Math.abs(Math.sin(frame / 7)),
          }} />
        )}
      </div>

      {/* lips, drawn over the cutaway's front edge so the opening reads as a mouth */}
      <div style={{
        position: "absolute", left: size * (mx - 0.075), top: size * (my - 0.045),
        width: size * 0.17, height: size * 0.09,
        borderRadius: "60% 10% 10% 60%", background: "#E4737F", border: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />
      <div style={{
        position: "absolute", left: size * (mx - 0.075), top: size * (my + mh - 0.035),
        width: size * 0.17, height: size * 0.10,
        borderRadius: "60% 10% 10% 60%", background: "#E4737F", border: `${bw}px solid ${ink}`, boxSizing: "border-box",
      }} />

    </div>
  );
};

/** a sound wave that either carries on fading, or is cut dead by a red wall */
export const Wave: React.FC<{ stopped?: boolean; at?: number; width?: number; height?: number; label?: string }> = ({
  stopped = false, at = 0, width = 600, height = 168, label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const bars = 26;
  const cutAt = stopped ? Math.round(bars * 0.55) : bars;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: "0 0 auto", transform: `scale(${p})` }}>
      <div style={{ position: "relative", width, height, display: "flex", alignItems: "center", gap: width / bars * 0.32 }}>
        {Array.from({ length: bars }).map((_, i) => {
          const dead = i >= cutAt;
          const fade = stopped ? 1 : Math.exp(-i / 11);
          const h = dead ? 0 : (0.22 + 0.78 * Math.abs(Math.sin((frame + i * 14) / 9))) * fade * height;
          return (
            <div key={i} style={{
              width: width / bars * 0.68, height: Math.max(6, h), borderRadius: 5,
              background: stopped ? TOWER.stop : TOWER.ring, opacity: dead ? 0 : 1,
              alignSelf: "center",
            }} />
          );
        })}
        {stopped && (
          <>
            {/* where the sound would have carried on, had the /k/ not stopped it */}
            {Array.from({ length: bars - cutAt }).map((_, i) => (
              <div key={`g${i}`} style={{
                position: "absolute", left: (width / bars) * (cutAt + i) + 26,
                top: height / 2 - 3, width: width / bars * 0.68, height: 6, borderRadius: 3,
                background: TOWER.ink, opacity: 0.16,
              }} />
            ))}
            <div style={{
              position: "absolute", left: (width / bars) * cutAt, top: -8, width: 20, height: height + 16,
              borderRadius: 6, background: TOWER.stop, border: `5px solid ${TOWER.ink}`, boxSizing: "border-box",
            }} />
          </>
        )}
      </div>
      {label && (
        <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: 46, color: TOWER.ink }}>{label}</div>
      )}
    </div>
  );
};

/**
 * An ear with sound arriving at it — arcs sweep IN from the side and vanish into the ear,
 * on a loop, while the ear leans towards them. A static ear on a "listen carefully" line
 * is a picture of listening; this one is actually listening.
 */
export const Ear: React.FC<{ at?: number; size?: number; tone?: string }> = ({
  at = 0, size = 230, tone = TOWER.ring,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  const lean = Math.sin(frame / 16) * 7;
  const beat = 0.5 + 0.5 * Math.sin(frame / 11);

  return (
    <div style={{
      position: "relative", width: size * 1.72, height: size, flex: "0 0 auto",
      display: "flex", alignItems: "center", justifyContent: "flex-end",
      transform: `scale(${p})`,
    }}>
      {/* three arcs travelling in towards the ear, each on its own phase */}
      {[0, 1, 2].map((i) => {
        const t = (((frame + i * 15) % 45) / 45);      // 0 → 1, then restart
        const r = size * (0.92 - t * 0.42);            // sweeping inward
        const fade = Math.sin(t * Math.PI);            // fade in and out at the ends
        return (
          <div key={i} style={{
            position: "absolute", right: size * 0.34 - r, top: size * 0.5 - r,
            width: r * 2, height: r * 2, borderRadius: "50%",
            border: `${Math.max(4, size * 0.035)}px solid transparent`,
            borderLeftColor: tone, boxSizing: "border-box",
            opacity: fade * 0.85,
          }} />
        );
      })}
      <div style={{
        fontSize: size * 0.78, lineHeight: 1,
        transform: `rotate(${lean}deg) scale(${1 + beat * 0.055})`,
        filter: `drop-shadow(0 0 ${size * 0.06 * beat}px rgba(255,194,74,0.8))`,
      }}>{"\u{1F442}"}</div>
    </div>
  );
};

/**
 * A chevron that points AT the thing above it. "Look at the end of this word" is a
 * sentence; this is the same instruction with no words in it, which is the whole point —
 * the caption already carries the sentence.
 */
export const Point: React.FC<{ at?: number; size?: number; tone?: string }> = ({
  at = 0, size = 74, tone = TOWER.stop,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  const bob = Math.sin((frame - at) / 7) * size * 0.14;
  return (
    <div style={{
      position: "relative", width: size, height: size * 0.72, flex: "0 0 auto",
      transform: `scale(${p}) translateY(${bob}px)`,
    }}>
      <div style={{
        position: "absolute", left: size * 0.34, top: 0, width: size * 0.32, height: size * 0.34,
        background: tone, borderRadius: 5,
      }} />
      <div style={{
        position: "absolute", left: 0, top: size * 0.30, width: 0, height: 0,
        borderLeft: `${size * 0.5}px solid transparent`, borderRight: `${size * 0.5}px solid transparent`,
        borderTop: `${size * 0.42}px solid ${tone}`,
      }} />
    </div>
  );
};

/**
 * A connector, so a new element is JOINED to the one already on screen instead of
 * replacing it. Keeping the previous visual and linking the next one is what makes a
 * sequence read as one idea building up rather than as a slideshow.
 */
export const Link: React.FC<{ kind?: "arrow" | "plus" | "equals"; at?: number; size?: number; tone?: string }> = ({
  kind = "arrow", at = 0, size = 72, tone = TOWER.ink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  if (kind !== "arrow") {
    return (
      <div style={{
        fontFamily: font.family, fontWeight: 800, fontSize: size, color: tone,
        transform: `scale(${p})`, flex: "0 0 auto",
      }}>{kind === "plus" ? "+" : "="}</div>
    );
  }
  const t = ((frame - at) % 42) / 42;   // a spark travelling along it, so it never sits still
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
        borderRadius: "50%", background: TOWER.ring, opacity: 0.55 + 0.45 * Math.sin(t * Math.PI),
      }} />
    </div>
  );
};

/** the two doors the child chooses between */
export const Doors: React.FC<{ open?: "ng" | "nk" | null; at?: number; size?: number }> = ({
  open = null, at = 0, size = 240,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{ display: "flex", gap: 40, transform: `scale(${p})`, flex: "0 0 auto" }}>
      {(["ng", "nk"] as const).map((d) => {
        const isOpen = open === d;
        return (
          <div key={d} style={{
            width: size, height: size * 1.16, borderRadius: `${size * 0.4}px ${size * 0.4}px 12px 12px`,
            background: d === "ng" ? TOWER.ring : TOWER.stop,
            border: `7px solid ${TOWER.ink}`, boxSizing: "border-box",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: isOpen ? `0 10px 0 ${TOWER.ink}, 0 0 0 12px rgba(55,166,107,0.55)` : `0 10px 0 ${TOWER.ink}`,
            transform: `translateY(${isOpen ? -14 : 0}px) rotate(${isOpen ? Math.sin(frame / 9) * 2 : 0}deg)`,
            opacity: open && !isOpen ? 0.42 : 1,
            fontFamily: font.family, fontWeight: 800,
            color: d === "ng" ? TOWER.ink : "#FFFFFF",
          }}>
            <div style={{ fontSize: size * 0.44 }}>{d}</div>
            {isOpen && <div style={{ fontSize: size * 0.22 }}>✓</div>}
          </div>
        );
      })}
    </div>
  );
};

/** the decision the whole lesson comes down to */
export const Flow: React.FC<{ step: 0 | 1 | 2 | 3; at?: number; scale?: number }> = ({ step, at = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const box = (text: string, bg: string, on: boolean, fg = TOWER.ink) => (
    <div style={{
      padding: `${21 * scale}px ${39 * scale}px`, borderRadius: 20, background: bg, color: fg,
      border: `5px solid ${TOWER.ink}`, boxShadow: `0 8px 0 ${TOWER.ink}`,
      fontFamily: font.family, fontWeight: 800, fontSize: 54 * scale, whiteSpace: "nowrap",
      opacity: on ? 1 : 0.28, transform: `scale(${on ? 1 : 0.94})`,
    }}>{text}</div>
  );
  const arm = (on: boolean) => (
    <div style={{ width: 70 * scale, height: 10, borderRadius: 4, background: TOWER.ink, opacity: on ? 1 : 0.25 }} />
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 * scale, transform: `scale(${p})`, flex: "0 0 auto" }}>
      {box("hear a /k/ ?", TOWER.cream, step >= 0)}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 * scale }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
          {arm(step >= 1)}{box("YES → nk", TOWER.stop, step >= 1, "#FFFFFF")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
          {arm(step >= 2)}{box("NO → ng", TOWER.ring, step >= 2)}
        </div>
      </div>
    </div>
  );
};

/** the held moment where the child answers, so a pause looks like a pause on purpose */
export const Thinking: React.FC<{ at: number; size?: number }> = ({ at, size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 14);
  return (
    <div style={{ display: "flex", gap: size * 0.7, alignItems: "center", transform: `scale(${p})`, flex: "0 0 auto" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: size, height: size, borderRadius: "50%", background: TOWER.stone,
          transform: `translateY(${Math.sin((frame - at) / 6 - i * 0.9) * size * 0.5}px)`,
          opacity: 0.55 + 0.45 * Math.max(0, Math.sin((frame - at) / 6 - i * 0.9)),
        }} />
      ))}
    </div>
  );
};

/** a picture for a word: app artwork where it exists, an honest emoji otherwise */
const APP_ART = new Set(["sing", "king", "crown", "snake", "flower"]);
const EMOJI: Record<string, string> = {
  long: "📏", sung: "🎵", bang: "💥", thing: "📦",
  bank: "🏦", pink: "🌸", sink: "🚰", junk: "🗑️", thank: "🙏", wink: "😉", think: "💭",
  ring: "💍", rink: "⛸️", bell: "🔔", money: "💰", song: "🎶", hands: "🤲", child: "🧒",
  box: "📦", ear: "👂", write: "✍️", idea: "💡", star: "⭐", x: "❎", w: "🅦",
};
export const hasPic = (w: string) => APP_ART.has(w) || w in EMOJI;

export const Pic: React.FC<{ word: string; size?: number; seed?: number; at?: number }> = ({ word, size = 195, seed = 0, at }) => {
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
      {APP_ART.has(w)
        ? <Img src={staticFile(`img/p2/${w}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : <div style={{ fontSize: size * 0.82, lineHeight: 1 }}>{EMOJI[w]}</div>}
    </div>
  );
};

/**
 * An example sentence, with the word being taught picked out and a picture beside it.
 * The teacher says a whole sentence for every word, so the sentence has to be ON SCREEN —
 * a bare word card while a sentence is spoken is a line with no visual of its own.
 */
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
      padding: "16px 30px", borderRadius: 30, background: "rgba(255,248,236,0.96)",
      border: `5px solid ${TOWER.ink}`, boxShadow: `0 10px 0 rgba(34,48,58,0.22)`,
      transform: `scale(${0.96 + 0.04 * p}) translateY(${Math.sin(frame / 36) * 3}px)`,
    }}>
      {pic && <Pic word={pic} size={picSize} seed={3} />}
      <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: size, color: TOWER.ink, lineHeight: 1.2 }}>
        {parts.map((s, i) =>
          s.toLowerCase() === target.toLowerCase()
            ? <span key={i} style={{ color: TOWER.stop, fontWeight: 800, textDecoration: "underline", textDecorationThickness: 5, textUnderlineOffset: 7 }}>{s}</span>
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
