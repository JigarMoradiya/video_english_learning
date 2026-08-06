import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { bob, drift, pulse, wiggle } from "../lib/motion";
import { WordPic, hasPicture } from "../data/l5_pictures";

// ── THE WORD BUILDING SITE ───────────────────────────────────────────────────
//
// The world for L5 · Spelling Rules. Words are built out of letter BRICKS on a site.
//
// It earns the subject in a way a generic world could not:
//   · doubling is a physical act — the crane fetches a SECOND identical brick
//   · ck is ONE brick with two letters printed on it, so "two letters, one sound" is
//     the prop itself rather than a caption explaining it
//   · wrong spellings go in the SKIP
//   · the traps are numbered cones and warning tape
//   · the six rules are BLUEPRINTS pinned to the site board
//
// This video runs 10:33. At that length the enemy is repetition, not drift — so the world
// exposes a dozen separate instruments and the reel rotates them so no two adjacent
// sections look alike.
//
// Layout law, learned the hard way: EVERYTHING the child reads goes inside <Stage>, which
// centres on the FRAME and keeps a symmetric margin equal to the word wall's width. A
// container measured against `wallX` centres at 0.42 of the frame and reads as crooked.

export const SITE = {
  sky: "#BFE7FF",
  ground: "#C8A46A",
  groundDark: "#A9834C",
  brick: "#FFFFFF",
  brickEdge: "#D8D3C6",
  ink: "#2B2B2B",
  amber: "#F9A825",      // short vowel
  blue: "#1565C0",       // long vowel / cool
  orange: "#F57C00",     // the ck rule
  teal: "#00897B",       // the floss rule
  red: "#E53935",        // wrong
  green: "#43A047",      // right
  steel: "#7C8B99",
  concrete: "#D9D2C4",
  concreteEdge: "#B9B0A0",
};

export type Aspect = "16x9" | "4x5" | "9x16";

/** 4:5 and 9:16 are BOTH taller than wide — they must never share a table. */
export const aspectOf = (width: number, height: number): Aspect =>
  height <= width ? "16x9" : height / width > 1.5 ? "9x16" : "4x5";

/**
 * One number every sized component multiplies by. 1080 is barely half of 1920, so the
 * 16:9 brick and card sizes overflow a portrait frame outright — this is the whole reason
 * the table exists rather than one constant. 16:9 is exactly 1, so the approved wide cut
 * is bit-for-bit unchanged.
 */
export const uiScale = (width: number, height: number): number => {
  const a = aspectOf(width, height);
  return a === "16x9" ? 1 : a === "4x5" ? 0.88 : 0.62;
};

export const bands = (width: number, height: number) => {
  const a = aspectOf(width, height);
  // a SEPARATE row per aspect: a tall frame wants a narrower wall, a lower slab and a
  // taller content column than a wide one does
  const t = a === "16x9"
    ? { wall: 0.845, horizon: 0.46, slab: 0.600, upper: 0.30, top: 0.305, tall: 0.505, padUp: 150, padH: 268 }
    : a === "4x5"
      // wall: 0.96 leaves only a 43px margin — the word list is a top strip in portrait,
      // not a column, so the stage keeps essentially the whole width
      // padUp 230 keeps the pad's top BELOW the horizon (540): at 300 it sat above the
      // skyline and the dumper truck ran behind it all video, never once visible
      ? { wall: 0.960, horizon: 0.40, slab: 0.585, upper: 0.26, top: 0.268, tall: 0.532, padUp: 230, padH: 470 }
      : { wall: 0.820, horizon: 0.34, slab: 0.520, upper: 0.22, top: 0.180, tall: 0.620, padUp: 230, padH: 420 };
  const wallX = Math.round(width * t.wall);
  return {
    aspect: a,
    scale: uiScale(width, height),
    padTop: Math.round(height * t.slab) - t.padUp,
    padH: t.padH,
    contentTop: Math.round(height * t.top),
    contentH: Math.round(height * t.tall),
    width,
    height,
    horizon: Math.round(height * t.horizon),
    /** the row the word is built on */
    slabY: Math.round(height * t.slab),
    /** the band above it — labels, meters, the crane hook */
    upperY: Math.round(height * t.upper),
    /** BAND A: the upper instrument. Starts below the sign, ends above the pad. */
    bandA: Math.round(height * 0.275),
    bandAMax: Math.round(height * 0.175),
    /** BAND B is the concrete pad, centred on slabY. Two things may never share a band. */
    /** the growing wall of finished words, down the right edge */
    wallX,
    /** the wall's width, mirrored on the left so the stage is symmetric */
    gutter: width - wallX,
    /** usable width for anything the child reads */
    stageW: width - 2 * (width - wallX),
    safeBottom: Math.round(height * 0.16),
  };
};

type B = ReturnType<typeof bands>;

/**
 * Anchors its children to the VIDEO FRAME rather than to whatever positioned ancestor
 * happens to enclose them. Every fixed piece of site furniture is wrapped in this, so
 * moving content into a positioned column can never drag the scenery with it.
 */
export const Fixed: React.FC<{ b: B; children: React.ReactNode }> = ({ b, children }) => (
  <div style={{ position: "fixed", left: 0, top: 0, width: b.width, height: b.height, pointerEvents: "none" }}>
    {children}
  </div>
);

// ── Stage: the one place content is allowed to live ──────────────────────────

/**
 * Centres on the FRAME and keeps a margin equal to the word wall on BOTH sides, so
 * content is both truly centred and structurally unable to reach the wall or the edge.
 */
export const Stage: React.FC<{
  b: B; top?: number; children: React.ReactNode; gap?: number;
  dir?: "row" | "column"; align?: string; wrap?: boolean;
}> = ({ b, children, gap = 20, dir = "row", align = "center", wrap = false }) => (
  <div
    style={{
      width: b.stageW,
      display: "flex", flexDirection: dir,
      alignItems: align, justifyContent: "center",
      flexWrap: wrap ? "wrap" : "nowrap",
      gap: gap * b.scale,
    }}
  >
    {children}
  </div>
);

/**
 * THE CONTENT COLUMN.
 *
 * Every scene's pieces are children of this one flex column, centred in the space between
 * the sign and the caption. Nothing inside is absolutely positioned, so two pieces CANNOT
 * overlap and a short scene CANNOT leave a hole at the top — the layout computes both,
 * instead of me choosing y values by hand and getting them wrong.
 */
export const Content: React.FC<{ b: B; children: React.ReactNode }> = ({ b, children }) => (
  <div
    style={{
      position: "absolute",
      left: b.gutter, width: b.stageW,
      // centred on the PAD, not on the frame: at 0.150h the column's centre was 130px
      // above the pad, so every word row floated off the surface it is built on
      top: b.contentTop,
      height: b.contentH,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: Math.round(b.height * 0.032 * b.scale),
    }}
  >
    {children}
  </div>
);

// ── Background ───────────────────────────────────────────────────────────────

/** One toy block, extruded. Two extra faces are what make it read as solid. */
const Block: React.FC<{
  x: number; w: number; h: number; d: number; hue: string; base: number; seed: number;
  wip?: boolean;
}> = ({ x, w, h, d, hue, base, seed, wip = false }) => {
  const frame = useCurrentFrame();
  const shade = (c: string, amt: number) => {
    const n = parseInt(c.slice(1), 16);
    const f = (sh: number) => Math.max(0, Math.min(255, ((n >> sh) & 255) + amt));
    return `rgb(${f(16)}, ${f(8)}, ${f(0)})`;
  };
  const solidH = wip ? h * 0.58 : h;
  const cols = Math.max(2, Math.round(w / 46));
  const rows = Math.max(2, Math.round(solidH / 54));
  return (
    <div style={{ position: "absolute", left: x, top: base - h, width: w, height: h }}>
      {/* right face */}
      <div style={{ position: "absolute", left: w, top: h - solidH, width: d, height: solidH, background: shade(hue, -26), transform: "skewY(-45deg)", transformOrigin: "left top" }} />
      {/* top face */}
      <div style={{ position: "absolute", left: 0, top: h - solidH - d, width: w, height: d, background: shade(hue, 24), transform: "skewX(-45deg)", transformOrigin: "left bottom" }} />
      {/* front face */}
      <div style={{ position: "absolute", left: 0, top: h - solidH, width: w, height: solidH, background: hue }} />
      {/* windows */}
      {Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const on = ((seed * 7 + r * 5 + c * 3) % 9) < 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 12 + c * ((w - 24) / cols), top: h - solidH + 16 + r * ((solidH - 26) / rows),
              width: (w - 24) / cols - 10, height: (solidH - 26) / rows - 12,
              borderRadius: 3,
              background: on ? "rgba(255, 214, 130, 0.85)" : "rgba(255,255,255,0.30)",
            }}
          />
        );
      })}
      {/* the unfinished top: bare frame, so this reads as a SITE and not a skyline */}
      {wip && (
        <>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ position: "absolute", left: -4, top: (h - solidH) - 14 - r * 30, width: w + 8, height: 7, background: SITE.steel, borderRadius: 3 }} />
          ))}
          {[0.08, 0.5, 0.92].map((fx, i) => (
            <div key={i} style={{ position: "absolute", left: w * fx, top: (h - solidH) - 86, width: 7, height: 92, background: SITE.steel, borderRadius: 3 }} />
          ))}
          {/* a little jib crane on the roof, always turning a load */}
          <div style={{ position: "absolute", left: w * 0.5, top: (h - solidH) - 150, width: 6, height: 66, background: "#B0762A", borderRadius: 3 }} />
          <div style={{ position: "absolute", left: w * 0.5 - 46, top: (h - solidH) - 152, width: 108, height: 6, background: "#B0762A", borderRadius: 3, transformOrigin: "center", transform: `rotate(${Math.sin((frame + seed * 30) / 46) * 7}deg)` }} />
          <div style={{ position: "absolute", left: w * 0.5 + 40, top: (h - solidH) - 146, width: 2, height: 26 + Math.sin((frame + seed * 20) / 34) * 8, background: "#5D6B77" }} />
        </>
      )}
    </div>
  );
};

/** Slow clouds. This is the ambient motion that replaced the drifting white dots. */
const Clouds: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {[
        // kept ABOVE the content column (which starts at 0.150h) — a cloud drifting behind
        // a word both muddies it and makes every automated overlap check untrustworthy
        { y: 0.028, s: 0.70, p: 150, o: 0.85 },
        { y: 0.062, s: 0.52, p: 118, o: 0.70 },
        { y: 0.040, s: 0.85, p: 190, o: 0.60 },
      ].map((c, i) => {
        const t = (drift(frame, fps, c.p) + i * 0.37) % 1;
        const x = t * (b.width + 640) - 320;
        const w = 250 * c.s;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: b.height * c.y, width: w, height: w * 0.34, opacity: c.o }}>
            <div style={{ position: "absolute", left: 0, bottom: 0, width: w, height: w * 0.22, borderRadius: 999, background: "#FFFFFF" }} />
            <div style={{ position: "absolute", left: w * 0.16, bottom: w * 0.10, width: w * 0.40, height: w * 0.30, borderRadius: "50%", background: "#FFFFFF" }} />
            <div style={{ position: "absolute", left: w * 0.46, bottom: w * 0.13, width: w * 0.32, height: w * 0.24, borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
        );
      })}
    </>
  );
};

/**
 * The big tower crane. Its jib hangs BELOW the sign line — before this it ran straight
 * through the section title and cut the words in half.
 */
export const Crane: React.FC<{ b: B; hookX?: number; hookY?: number; carrying?: string }> = ({
  b, hookX, hookY, carrying,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sway = wiggle(frame, fps, 1.1, 5.5);
  // 16:9 hangs the jib just under the sign. PORTRAIT cannot: the word strip lives in
  // that band, and the jib ran straight through it at every crane beat. Portrait drops
  // the jib below the strip instead.
  // PORTRAIT: the jib must clear the word strip (which ends ~0.207h) but no lower —
  // dropping it to 0.335h left the mast only 112px tall and the crane looked stunted.
  const jibY = Math.round(b.height * (b.aspect === "16x9" ? 0.175 : 0.240));
  // the counter-jib reaches 96px to the LEFT of the mast, so at 0.036 it started at
  // x −57 and the whole structure was cut off by the frame edge
  const mastX = Math.round(b.width * (b.aspect === "16x9" ? 0.036 : 0.115));
  // clamped into the left gutter: the stage begins at b.gutter and the hook must never
  // enter it, whatever a caller passes
  const hx = Math.min(hookX ?? b.width * 0.13, b.gutter - 40);
  // the hook must hang BELOW its own jib whatever a caller asks for
  const hy = Math.max(hookY ?? b.upperY + 30, jibY + 70);
  // PORTRAIT: no crane. There is no room for a jib that does not cross either the word
  // strip or the lesson, and the user asked for the builder gone from this cut.
  if (b.aspect !== "16x9") return null;
  return (
    <Fixed b={b}>
      {/* mast, latticed rather than a bare bar */}
      <div style={{ position: "absolute", left: mastX, top: jibY, width: 26, height: b.horizon - jibY + 24, background: `repeating-linear-gradient(180deg, #E8A21D 0 16px, #C9860F 16px 22px)`, borderRadius: 4, boxShadow: "0 0 0 3px rgba(0,0,0,0.10)" }} />
      {/* jib + counter-jib */}
      <div style={{ position: "absolute", left: mastX - 96, top: jibY - 6, width: b.width * 0.60, height: 15, transformOrigin: `${96}px center`, transform: `rotate(${sway * 0.18}deg)` }}>
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg, #E8A21D 0 20px, #C9860F 20px 26px)`, borderRadius: 4 }} />
        <div style={{ position: "absolute", left: 0, top: -16, width: 74, height: 30, background: "#8D6E63", borderRadius: 4, border: "3px solid #5D4037" }} />
      </div>
      {/* cable + hook */}
      <div style={{ position: "absolute", left: hx, top: jibY + 9, width: 3, height: Math.max(0, hy - jibY - 9), background: "#5D6B77" }} />
      <div style={{ position: "absolute", left: hx - 13, top: hy, width: 29, height: 16, borderRadius: 5, background: "#5D6B77" }} />
      {carrying && (
        <div style={{ position: "absolute", left: hx, top: hy + 18, transform: "translateX(-50%)" }}>
          <Brick ch={carrying} size={64} />
        </div>
      )}
    </Fixed>
  );
};

/**
 * A dumper truck crossing the site. `drift` is a SINE, so the truck ping-pongs — it must
 * therefore turn around at each end instead of driving the return leg backwards.
 */
const Dumper: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 34;
  const t = drift(frame, fps, period);
  const x = -260 + t * (b.width + 520);
  // the sine's slope tells us which way it is travelling; flip the body to match
  const heading = Math.cos((frame / fps) * (Math.PI * 2) / period) >= 0 ? 1 : -1;
  // and ease the flip through a short turn so it never snaps
  const turn = interpolate(Math.abs(Math.cos((frame / fps) * (Math.PI * 2) / period)), [0, 0.16], [0, 1], { extrapolateRight: "clamp" });
  const bumpY = Math.sin(frame / 5) * 2.5;
  const wheel = (frame * 9 * heading) % 360;
  return (
    <div style={{ position: "absolute", left: x, top: b.horizon - (b.aspect === "16x9" ? 46 : 132) + bumpY, width: 240, height: 104, transform: `scaleX(${heading * Math.max(0.12, turn)})` }}>
      <div style={{ position: "absolute", left: 8, top: 18, width: 128, height: 56, background: "#F4A62A", borderRadius: "8px 22px 6px 6px", border: "4px solid #C97F12" }} />
      <div style={{ position: "absolute", left: 136, top: 34, width: 78, height: 40, background: "#E0561B", borderRadius: 8, border: "4px solid #A63C12" }} />
      <div style={{ position: "absolute", left: 150, top: 40, width: 34, height: 22, background: "#CDE9FF", borderRadius: 4 }} />
      {[40, 108, 176].map((cx, i) => (
        <div key={i} style={{ position: "absolute", left: cx, top: 68, width: 40, height: 40, borderRadius: "50%", background: "#37474F", border: "5px solid #263238", transform: `rotate(${wheel + i * 40}deg)` }}>
          <div style={{ position: "absolute", left: "48%", top: 3, width: 3, height: 14, background: "#90A4AE" }} />
        </div>
      ))}
      {/* dust kicked up at the WHEELS only — not scattered across the whole frame */}
      {[0, 1, 2].map((i) => {
        const p = ((frame / (fps * 1.1)) + i * 0.33) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: (heading > 0 ? 18 : 190) - p * 40 * heading, top: 96 - p * 22, width: 16 + p * 26, height: 16 + p * 26, borderRadius: "50%", background: `rgba(196, 166, 116, ${0.5 * (1 - p)})` }} />
        );
      })}
    </div>
  );
};

/** A cement mixer whose drum never stops turning. */
const Mixer: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: b.width * 0.022, top: b.horizon - 132, width: 150, height: 150 }}>
      <div style={{ position: "absolute", left: 26, top: 96, width: 96, height: 16, background: "#546E7A", borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 18, top: 4, width: 112, height: 96, borderRadius: "48% 48% 42% 42%", background: "conic-gradient(#8D6E63 0turn, #A1887F 0.25turn, #6D4C41 0.5turn, #A1887F 0.75turn, #8D6E63 1turn)", border: "5px solid #5D4037", transform: `rotate(${(frame * 2.6) % 360}deg)` }} />
      {[30, 108].map((cx, i) => (
        <div key={i} style={{ position: "absolute", left: cx, top: 108, width: 30, height: 30, borderRadius: "50%", background: "#37474F", border: "4px solid #263238" }} />
      ))}
    </div>
  );
};

/** Birds, so the sky is never a flat panel. */
const Birds: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = (drift(frame, fps, 26 + i * 7) + i * 0.33) % 1;
        const x = b.width + 80 - t * (b.width + 200);
        const y = b.height * (0.055 + i * 0.03) + Math.sin(frame / (17 + i * 4)) * 14;
        const flap = Math.sin(frame / (3.2 + i * 0.5)) * 16;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 46, height: 22 }}>
            <div style={{ position: "absolute", left: 0, top: 10, width: 24, height: 5, borderRadius: 4, background: "#5A6B7A", transformOrigin: "right center", transform: `rotate(${-flap}deg)` }} />
            <div style={{ position: "absolute", left: 22, top: 10, width: 24, height: 5, borderRadius: 4, background: "#5A6B7A", transformOrigin: "left center", transform: `rotate(${flap}deg)` }} />
          </div>
        );
      })}
    </>
  );
};

/** Ground clutter: gravel, planks, tools. Static by design — the motion is elsewhere. */
const GroundProps: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stones = Array.from({ length: 46 }).map((_, i) => {
    const gx = ((i * 137) % 100) / 100;
    const gy = ((i * 61) % 100) / 100;
    return { x: gx * b.width, y: b.horizon + 26 + gy * (b.height - b.horizon - 60), s: 4 + (i % 4) * 3 };
  });
  return (
    <>
      {stones.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s * 0.7, borderRadius: "50%", background: i % 3 ? "rgba(122, 92, 52, 0.30)" : "rgba(255,255,255,0.18)" }} />
      ))}
      {/* tyre tracks receding to the horizon */}
      {[0.18, 0.34].map((fy, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: b.horizon + (b.height - b.horizon) * fy, width: b.width, height: 9, background: "repeating-linear-gradient(90deg, rgba(120,90,52,0.20) 0 26px, rgba(120,90,52,0) 26px 54px)" }} />
      ))}
      {/* planks, bottom left — below the caption line so nothing can collide */}
      <div style={{ position: "absolute", left: b.width * 0.02, top: b.height * 0.915 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: i * 9, top: i * -13, width: 250, height: 20, borderRadius: 4, background: i % 2 ? "#C08A4E" : "#AD7A42", border: "2px solid #8A5F30" }} />
        ))}
      </div>
      {/* bucket + shovel, bottom right */}
      <div style={{ position: "absolute", left: b.width * 0.885, top: b.height * 0.905 }}>
        <div style={{ position: "absolute", left: 0, top: 22, width: 74, height: 58, borderRadius: "8px 8px 16px 16px", background: "#E0561B", border: "4px solid #A63C12" }} />
        <div style={{ position: "absolute", left: 4, top: 8, width: 66, height: 16, borderRadius: 8, border: "4px solid #A63C12" }} />
        <div style={{ position: "absolute", left: 88, top: -10, width: 9, height: 96, borderRadius: 4, background: "#8D6E63", transform: `rotate(${8 + wiggle(frame, fps, 1.5, 6)}deg)` }} />
        <div style={{ position: "absolute", left: 76, top: 78, width: 40, height: 30, borderRadius: "6px 6px 18px 18px", background: SITE.steel }} />
      </div>
    </>
  );
};

export const SiteWorld: React.FC = () => {
  const { width, height, fps } = useVideoConfig();
  const b = bands(width, height);
  const frame = useCurrentFrame();

  // a real site: near blocks big, far blocks small, two of them still going up
  const blocks = [
    { x: 0.045, w: 0.115, h: 0.150, d: 24, hue: "#B9CEDE", seed: 1, wip: false },
    { x: 0.150, w: 0.135, h: 0.255, d: 30, hue: "#A9C3D6", seed: 2, wip: true },
    { x: 0.290, w: 0.110, h: 0.180, d: 22, hue: "#C4D6E4", seed: 3, wip: false },
    { x: 0.395, w: 0.150, h: 0.300, d: 34, hue: "#9FBBD0", seed: 4, wip: false },
    { x: 0.560, w: 0.120, h: 0.205, d: 26, hue: "#BDD2E1", seed: 5, wip: true },
    { x: 0.690, w: 0.140, h: 0.270, d: 32, hue: "#AEC7D9", seed: 6, wip: false },
    { x: 0.845, w: 0.120, h: 0.165, d: 24, hue: "#C7D8E6", seed: 7, wip: false },
  ];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${SITE.sky} 0%, #E4F3FF 54%, #F7F0DE 100%)` }}>
      <Clouds b={b} />
      <Birds b={b} />

      <div style={{ position: "absolute", inset: 0, filter: "blur(4.5px) saturate(0.55)", opacity: 0.40 }}>
        {blocks.map((k, i) => (
          <Block
            key={i}
            x={width * k.x} w={width * k.w} h={height * k.h} d={k.d}
            hue={k.hue} base={b.horizon + 6} seed={k.seed} wip={k.wip}
          />
        ))}
        {/* hoarding fence along the horizon, so the buildings stand ON something */}
        <div style={{ position: "absolute", left: 0, top: b.horizon - 26, width, height: 30, background: "repeating-linear-gradient(90deg, #6FA8CF 0 44px, #5E97BE 44px 88px)", borderTop: "4px solid #4E86AC" }} />
      </div>

      {/* ground: packed earth at the horizon, deepening to the foreground */}
      <div style={{ position: "absolute", left: 0, top: b.horizon, width, height: height - b.horizon, background: `linear-gradient(#D8B481 0%, ${SITE.ground} 26%, ${SITE.groundDark} 100%)` }} />
      <div style={{ position: "absolute", left: 0, top: b.horizon, width, height: 8, background: "rgba(255,255,255,0.40)" }} />

      {/* the scrim pushes the SITE back — it must be painted BEFORE the vehicles, or the
          truck and mixer get washed out along with the scenery they sit in front of */}
      <div style={{ position: "absolute", left: 0, top: 0, width, height: b.horizon + 8, background: "rgba(255,255,255,0.42)" }} />
      <Dumper b={b} />
      <GroundProps b={b} />

      {/* the concrete pad the words are built on — this is what the word row stands on */}
      <div
        style={{
          position: "absolute", left: b.gutter * 0.72, top: b.padTop, width: width - b.gutter * 1.44, height: b.padH,
          borderRadius: 26,
          background: `linear-gradient(#BCB2A0, #A79C88)`,
          boxShadow: "inset 0 -14px 0 #8F856F, inset 0 6px 0 rgba(255,255,255,0.30), 0 14px 30px rgba(0,0,0,0.20)",
        }}
      >
        {/* pallets of spare bricks at each end — a bare pad reads as an empty beige band */}
        {[-0.055, 0.985].map((fx, i) => (
          <div key={fx} style={{ position: "absolute", left: `${fx * 100}%`, top: "calc(100% + 26px)", width: 150, height: 96 }}>
            {[0, 1, 2].map((r) => (
              <div key={r} style={{ position: "absolute", left: r * 5, bottom: 14 + r * 24, display: "flex", gap: 4 }}>
                {[0, 1, 2].map((c) => (
                  <div key={c} style={{ width: 44, height: 20, borderRadius: 3, background: (r + c + i) % 2 ? "#D96A3A" : "#C25A2E", border: "2px solid #9E4522" }} />
                ))}
              </div>
            ))}
            <div style={{ position: "absolute", left: -6, bottom: 0, width: 160, height: 14, borderRadius: 3, background: "#B07C42", border: "2px solid #8A5F30" }} />
          </div>
        ))}
        {/* expansion joints, so it reads as a poured slab and not a rounded rectangle */}
        {[0.25, 0.5, 0.75].map((fx) => (
          <div key={fx} style={{ position: "absolute", left: `${fx * 100}%`, top: 16, width: 3, height: "calc(100% - 32px)", background: "rgba(70,62,48,0.20)" }} />
        ))}
        {Array.from({ length: 34 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${((i * 149) % 97)}%`, top: `${((i * 71) % 88)}%`, width: 5, height: 4, borderRadius: "50%", background: "rgba(70,62,48,0.22)" }} />
        ))}
      </div>


      {/* a flagpole of its own — the flag used to hang on the crane's mast, and floated
          unattached in every section that does not show the crane */}
      <div style={{ position: "absolute", left: width * 0.036 + 20, top: height * 0.10, width: 7, height: b.horizon - height * 0.10, background: "#9E9E9E", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: width * 0.036 + 26, top: height * 0.10, width: 44, height: 26, background: SITE.red, borderRadius: 3, transformOrigin: "left center", transform: `rotate(${wiggle(frame, fps, 7, 1.7)}deg) scaleX(${0.9 + 0.1 * Math.sin(frame / 9)})` }} />

      <Mixer b={b} />
    </AbsoluteFill>
  );
};

// ── Site signage — what section titles hang from ─────────────────────────────

/** A board hung on two chains from a beam. Replaces the floating text pill. */
export const Sign: React.FC<{ b: B; text: string; tone?: string }> = ({ b, text, tone = SITE.teal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const S = b.scale;
  const swing = wiggle(frame, fps, 1.3, 4.4);
  // ONE design for every aspect — the board hangs from a beam on two chains, scaled by S.
  // The portrait-only variants (posts, rope, a plain plate) are gone: they were my
  // invention, they never lined up, and the wide cut's sign was already right.
  return (
    <Fixed b={b}>
    <div style={{ position: "absolute", left: 0, top: 0, width: b.width, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transformOrigin: "top center", transform: `rotate(${swing}deg)` }}>
        {/* the beam it hangs from */}
        <div style={{ position: "absolute", left: "50%", top: 14 * S, width: 460 * S, marginLeft: -230 * S, height: 13 * S, borderRadius: 4, background: "#8D6E63", border: `${Math.max(2, 3 * S)}px solid #5D4037` }} />
        {[-150, 150].map((dx, i) => (
          <div key={i} style={{ position: "absolute", left: `calc(50% + ${dx * S}px)`, top: 24 * S, width: 4 * S, height: 34 * S, background: "#78909C" }} />
        ))}
        <div
          style={{
            marginTop: 54 * S,
            padding: `${14 * S}px ${40 * S}px`, borderRadius: 12,
            background: tone, color: "#FFFFFF",
            border: "5px solid rgba(255,255,255,0.55)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.26)",
            fontFamily: font.family, fontWeight: 800, fontSize: 38 * S, letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
        {/* bolts */}
        {[-1, 1].map((sd) => (
          <div key={sd} style={{ position: "absolute", left: `calc(50% + ${sd * 150 * S}px)`, top: 62 * S, width: 12 * S, height: 12 * S, borderRadius: "50%", background: "rgba(0,0,0,0.22)" }} />
        ))}
      </div>
    </div>
    </Fixed>
  );
};

// ── A letter brick ───────────────────────────────────────────────────────────

export type BrickTone = "plain" | "amber" | "blue" | "orange" | "teal" | "green" | "red" | "ghost";

const TONE: Record<BrickTone, { bg: string; ink: string }> = {
  plain:  { bg: "#FFFFFF", ink: SITE.ink },
  amber:  { bg: SITE.amber, ink: "#3E2B00" },
  blue:   { bg: SITE.blue, ink: "#FFFFFF" },
  orange: { bg: SITE.orange, ink: "#FFFFFF" },
  teal:   { bg: SITE.teal, ink: "#FFFFFF" },
  green:  { bg: SITE.green, ink: "#FFFFFF" },
  red:    { bg: SITE.red, ink: "#FFFFFF" },
  ghost:  { bg: "rgba(255,255,255,0.28)", ink: "rgba(43,43,43,0.45)" },
};

export const Brick: React.FC<{
  ch: string;
  size?: number;
  tone?: BrickTone;
  seed?: number;
  /** a brick can hold TWO letters — that is what ck is */
  joined?: boolean;
  /** lit right now by the narration (see lib/spoken) */
  hot?: boolean;
}> = ({ ch, size: rawSize = 92, tone = "plain", seed = 0, joined = false, hot = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const size = rawSize * uiScale(width, height);
  const t = TONE[tone];
  return (
    <div
      style={{
        minWidth: joined ? size * 1.5 : size * 0.92,
        height: size,
        padding: `0 ${size * 0.16}px`,
        borderRadius: size * 0.16,
        background: t.bg,
        border: `${Math.max(3, size * 0.045)}px solid ${hot ? SITE.amber : tone === "plain" ? SITE.brickEdge : "rgba(255,255,255,0.55)"}`,
        boxShadow: hot
          ? `0 ${size * 0.09}px 0 rgba(0,0,0,0.16), 0 0 0 ${size * 0.07}px rgba(249,168,37,0.40)`
          : `0 ${size * 0.09}px 0 rgba(0,0,0,0.16)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.family, fontWeight: 800, fontSize: size * 0.60, lineHeight: 1,
        color: t.ink,
        transform: `translateY(${bob(frame, fps, 5, 2.1, seed)}px) rotate(${wiggle(frame, fps, 0.9, 3.4, seed)}deg) scale(${hot ? 1.12 : 1})`,
        whiteSpace: "nowrap",
      }}
    >
      {ch}
    </div>
  );
};

/**
 * The plank a single word is built on. One word = one plank, so two words side by side
 * can never read as one long word.
 */
export const Plank: React.FC<{ children: React.ReactNode; gap?: number; pic?: string; picSize?: number; seed?: number }> = ({
  children, gap = 8, pic, picSize = 190, seed = 0,
}) => {
  const { width, height } = useVideoConfig();
  const S = uiScale(width, height);
  return (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * S }}>
    {pic && hasPicture(pic) && <WordPic word={pic} size={picSize * S} seed={seed} />}
    <div style={{ display: "flex", alignItems: "flex-end", gap: gap * S }}>{children}</div>
    <div style={{ position: "relative", width: `calc(100% + ${26 * S}px)`, minWidth: 110 * S, height: 18 * S, borderRadius: 5, background: "linear-gradient(#C08A4E, #9B6B34)", border: `${Math.max(1, 2 * S)}px solid #7E5628`, boxShadow: `0 ${4 * S}px 0 rgba(0,0,0,0.20)` }}>
      {[4, -4].map((dx) => (
        <div key={dx} style={{ position: "absolute", [dx > 0 ? "left" : "right"]: 5 * S, top: 4 * S, width: 6 * S, height: 6 * S, borderRadius: "50%", background: "rgba(255,255,255,0.45)" }} />
      ))}
    </div>
  </div>
  );
};

/** The slab the word is built on. Centres on the FRAME, not on the wall. */
export const Slab: React.FC<{ b: B; children: React.ReactNode; gap?: number }> = ({
  b, children, gap = 10,
}) => (
  <div style={{ width: b.stageW, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: gap * b.scale, flexWrap: "wrap", rowGap: 20 * b.scale }}>
    {children}
  </div>
);

// ── The word wall — the through-line ─────────────────────────────────────────

/**
 * Words that follow the rule, stacked by RULE. Two labelled groups rather than one long
 * column: a single cumulative stack made Rule 1's words look like they belonged to Rule 2,
 * and it grew tall enough to run under the logo.
 */
export const WordWall: React.FC<{
  b: B; groups: { title: string; tone: string; words: string[] }[]; side?: "left" | "right";
}> = ({ b, groups, side = "right" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const live = groups.filter((g) => g.words.length);
  if (b.aspect !== "16x9") {
    // PORTRAIT: a two-line strip of chips under the sign. Down the side it stole a third
    // of the width from the lesson; across the top it costs 110px of otherwise empty sky.
    const chip = Math.round(20 * b.scale + 6);
    return (
      <div style={{ position: "absolute", left: b.gutter, top: Math.round(b.height * 0.185), width: b.width - b.gutter * 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {live.map((g) => (
          <div key={g.title} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 5, width: "100%" }}>
            <div style={{ padding: "2px 10px", borderRadius: 6, background: g.tone, color: "#FFF", fontFamily: font.family, fontWeight: 800, fontSize: chip * 0.72 }}>
              {g.title}
            </div>
            {g.words.map((w, i) => (
              <div
                key={`${w}-${i}`}
                style={{
                  padding: "2px 9px", borderRadius: 6, background: "#FFFFFF",
                  border: `2px solid ${g.tone}`, boxShadow: "0 2px 0 rgba(0,0,0,0.12)",
                  fontFamily: font.family, fontWeight: 800, fontSize: chip * 0.80, color: SITE.ink,
                }}
              >
                {w}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  // the logo occupies the top-right corner — the wall starts below it, always
  // a FIXED row height. Sizing rows to the list made every card shrink as words were
  // added, and the stack still reached the bottom edge.
  const top = Math.round(b.height * (b.aspect === "16x9" ? 0.235 : 0.200));
  const rowH = b.aspect === "16x9" ? 31 : 26;
  return (
    <div
      style={{
        position: "absolute",
        left: side === "right" ? b.wallX : 16,
        top, width: b.width - b.wallX - 16,
        display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      {live.map((g) => (
        <div key={g.title} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ padding: "5px 0", textAlign: "center", borderRadius: 8, background: g.tone, color: "#FFF", fontFamily: font.family, fontWeight: 800, fontSize: rowH * 0.56, boxShadow: "0 4px 0 rgba(0,0,0,0.18)", letterSpacing: 0.5 }}>
            {g.title}
          </div>
          {g.words.map((w, i) => (
            <div
              key={`${w}-${i}`}
              style={{
                height: rowH, borderRadius: 7,
                background: "#FFFFFF",
                border: `3px solid ${g.tone}`,
                boxShadow: "0 4px 0 rgba(0,0,0,0.13)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.family, fontWeight: 800, fontSize: rowH * 0.66, color: SITE.ink,
                transform: `translateY(${bob(frame, fps, 1.4, 4, i)}px)`,
              }}
            >
              {w}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ── Instruments ──────────────────────────────────────────────────────────────

/**
 * One segment per clap. The word rides ON the meter card rather than floating behind it —
 * as a loose label it landed on top of the trap cones.
 */
export const ClapMeter: React.FC<{ b: B; claps: number; lit: number; label?: string; y?: number; inline?: boolean }> = ({
  b, claps, lit, label, y, inline = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    inline ? <>{children}</> : <div style={{ display: "flex", justifyContent: "center" }}>{children}</div>;
  return (
    <Wrap>
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          padding: `${16 * b.scale}px ${34 * b.scale}px`, borderRadius: 18,
          background: "rgba(255,255,255,0.94)",
          border: `${Math.max(2, 4 * b.scale)}px solid ${SITE.amber}`,
          boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
        }}
      >
        {label && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {hasPicture(label) && <WordPic word={label} size={84 * b.scale} />}
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: 40 * b.scale, color: SITE.ink }}>{label}</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: claps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 92 * b.scale, height: 26 * b.scale, borderRadius: 13,
                background: i < lit ? SITE.amber : "rgba(0,0,0,0.10)",
                border: `3px solid ${i < lit ? "#B26A00" : "rgba(0,0,0,0.12)"}`,
                transform: `scale(${i === lit - 1 ? 1 + 0.12 * pulse(frame, fps, 1, 0.5) : 1})`,
              }}
            />
          ))}
        </div>
      </div>
    </Wrap>
  );
};

/** The elastic between two posts — fffff, lllll, sssss, zzzzz. */
export const StretchBand: React.FC<{ b: B; letter: string; amount: number }> = ({
  b, letter, amount,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = b.stageW * (0.22 + 0.46 * amount);
  const sag = 10 - 8 * amount;
  return (
    <div style={{ width: b.stageW, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 18, height: 96, background: SITE.steel, borderRadius: 5 }} />
      <div style={{ position: "relative", width: w, height: 96, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: `calc(50% + ${sag}px)`, height: 10, borderRadius: 5, background: SITE.teal }} />
        <div style={{ position: "absolute", left: "50%", transform: `translate(-50%, ${-8 + bob(frame, fps, 3, 2, 1)}px)` }}>
          <Brick ch={letter.repeat(Math.max(1, Math.round(1 + amount * 4)))} size={64} tone="teal" />
        </div>
      </div>
      <div style={{ width: 18, height: 96, background: SITE.steel, borderRadius: 5 }} />
    </div>
  );
};

/** Amber quick-pulse for a short vowel, blue slow stretch for a long one. */
export const VowelLamp: React.FC<{ b: B; vowel: string; long: boolean; y?: number; inline?: boolean; size?: number }> = ({
  b, vowel, long, y, inline = false, size: rawLampSize = 156,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const size = rawLampSize * uiScale(vw, vh);
  const beat = long ? pulse(frame, fps, 1, 2.2) : pulse(frame, fps, 1, 0.5);
  const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    inline ? <>{children}</> : <div style={{ display: "flex", justifyContent: "center" }}>{children}</div>;
  return (
    <Wrap>
      <div
        style={{
          width: size, height: size, borderRadius: "50%", flexShrink: 0,
          background: long ? SITE.blue : SITE.amber,
          border: "8px solid #FFFFFF",
          boxShadow: `0 10px 24px rgba(0,0,0,0.22), 0 0 0 ${10 + 8 * beat}px ${long ? "rgba(21,101,192,0.22)" : "rgba(249,168,37,0.24)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${(long ? 1.0 : 0.94) + 0.06 * beat})`,
        }}
      >
        <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: size * 0.50, color: long ? "#FFFFFF" : "#4A3000" }}>
          {long ? `${vowel}̄` : vowel}
        </div>
      </div>
    </Wrap>
  );
};

/** A numbered cone with warning tape — the traps. */
export const Cone: React.FC<{ n: number; active: boolean; size?: number }> = ({ n, active, size: rawCone = 96 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const size = rawCone * uiScale(width, height);
  return (
    <div style={{ position: "relative", width: size, height: size, opacity: active ? 1 : 0.35, transform: `translateY(${active ? bob(frame, fps, 4, 1.8, n) : 0}px)` }}>
      <div style={{ position: "absolute", left: "50%", bottom: 0, width: size * 0.86, height: size * 0.12, marginLeft: -(size * 0.43), borderRadius: 4, background: "#C0450F" }} />
      <div style={{ position: "absolute", left: "50%", bottom: size * 0.09, marginLeft: -(size * 0.30), width: 0, height: 0, borderLeft: `${size * 0.30}px solid transparent`, borderRight: `${size * 0.30}px solid transparent`, borderBottom: `${size * 0.80}px solid #F4511E` }} />
      <div style={{ position: "absolute", left: "50%", bottom: size * 0.34, marginLeft: -(size * 0.20), width: size * 0.40, height: size * 0.13, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 0, bottom: size * 0.30, width: size, textAlign: "center", fontFamily: font.family, fontWeight: 800, fontSize: size * 0.26, color: "#C0450F" }}>{n}</div>
    </div>
  );
};

export const WarningTape: React.FC<{ b: B; y?: number }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Fixed b={b}>
    <div
      style={{
        // pinned to the very top edge: the content column starts at 0.150h, and a tape
        // anywhere below that will sooner or later be drawn across a word
        position: "absolute", left: -30, top: 2, width: b.width + 60, height: 34,
        background: "repeating-linear-gradient(-45deg, #F9A825 0 22px, #2B2B2B 22px 44px)",
        transform: `rotate(${wiggle(frame, fps, 0.7, 6)}deg)`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
      }}
    />
    </Fixed>
  );
};

/**
 * The skip. Wrong spellings tumble in — and so do words that do NOT follow the rule,
 * which is why it carries a label: they must never be filed with the rule words.
 */
export const Skip: React.FC<{ b: B; tossed: string[]; from: number; label?: string; x?: number }> = ({
  b, tossed, from, label, x,
}) => {
  const frame = useCurrentFrame();
  if (b.aspect !== "16x9") {
    // PORTRAIT: the wall moved to a top strip, so there is no side margin left to hang a
    // skip in — the old clamp put it at x −218, half off the frame. The rejected words
    // become a labelled row in the column instead, which a tall frame has room for.
    const shown = tossed.filter((_, i) => frame >= from + i * 9);
    if (!shown.length) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 10 * b.scale }}>
        <div style={{ padding: `${4 * b.scale}px ${12 * b.scale}px`, borderRadius: 8, background: "#37474F", color: "#FFF", fontFamily: font.family, fontWeight: 800, fontSize: 24 * b.scale }}>
          {label ?? "NOT THIS"}
        </div>
        {shown.map((w) => (
          <div key={w} style={{ padding: `${3 * b.scale}px ${14 * b.scale}px`, borderRadius: 8, background: SITE.red, color: "#FFFFFF", fontFamily: font.family, fontWeight: 800, fontSize: 30 * b.scale, boxShadow: "0 3px 0 rgba(0,0,0,0.25)" }}>
            {w}
          </div>
        ))}
      </div>
    );
  }
  return (
    <Fixed b={b}>
    <div style={{ position: "absolute", left: Math.min(x ?? 16, b.gutter - 262), top: b.slabY + 16, width: 252, height: 306 }}>
      {label && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 232, textAlign: "center", fontFamily: font.family, fontWeight: 800, fontSize: 22, color: "#FFF", background: SITE.red, borderRadius: 8, padding: "4px 0" }}>
          {label}
        </div>
      )}
      <div style={{ position: "absolute", left: 0, top: 52, width: 244, height: 248, background: "#546E7A", borderRadius: "8px 8px 16px 16px", border: "5px solid #37474F" }} />
      <div style={{ position: "absolute", left: 8, top: 46, width: 228, height: 13, background: "#78909C", borderRadius: 4 }} />
      {tossed.map((w, i) => {
        const t = interpolate(frame - from - i * 9, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={w}
            style={{
              // its OWN line inside the skip. They used to land on the same spot AND fade
              // to 10% opacity, which is what turned the box into one unreadable blob.
              position: "absolute", left: 16, top: -64 + t * (122 + i * 46),
              width: 212, textAlign: "center",
              transform: `rotate(${Math.sin(t * Math.PI) * (i % 2 ? 22 : -26)}deg)`,
              fontFamily: font.family, fontWeight: 800, fontSize: 26, color: "#FFFFFF",
              background: SITE.red, borderRadius: 7, padding: "1px 0",
              boxShadow: "0 3px 0 rgba(0,0,0,0.25)",
            }}
          >
            {w}
          </div>
        );
      })}
    </div>
    </Fixed>
  );
};

/** The six rules, pinned. Used by the intro and the close. */
export const Blueprints: React.FC<{
  b: B;
  shown: number;
  lit: number[];
  done?: number[];
  /** the recap shows a word wall down BOTH sides, so the row must come in off them */
  compact?: boolean;
}> = ({ b, shown, lit, done = [], compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plans = [
    { key: "ff ll ss zz", name: "Floss", emoji: "\u{1F9F5}" },
    { key: "c · ck · k", name: "C-K", emoji: "\u{1F511}" },
    { key: "ng", name: "N-G", emoji: "\u{1F514}" },
    { key: "nk", name: "N-K", emoji: "⚓" },
    { key: "x", name: "X", emoji: "❎" },
    { key: "wa", name: "W", emoji: "\u{1F30A}" },
  ];
  const wide = b.aspect === "16x9";
  const gap = (compact ? 14 : 16) * b.scale;
  const cw = Math.floor(((compact ? b.stageW * 0.86 : b.stageW) - 5 * gap) / 6);
  const ch = (compact ? 152 : 176) * b.scale;

  const cards = plans.map((p, i) => {
    if (i >= shown) {
      return <div key={p.name} style={{ width: cw, ...(wide ? { height: ch } : { minHeight: ch }) }} />;
    }
    const on = lit.includes(i);
    const fin = done.includes(i);
    return (
      <div
        key={p.name}
        style={{
          width: cw, boxSizing: "border-box",
          // 16:9 keeps its fixed height — it never overflowed at scale 1. Portrait sizes
          // to its content, because an emoji's line box is taller than its font size and
          // the key text ("ff ll ss zz") fell out of the bottom of the card at 0.56.
          ...(wide ? { height: ch } : { minHeight: ch, padding: `${12 * b.scale}px ${6 * b.scale}px` }),
          borderRadius: 14,
          background: on || fin ? "#FFFFFF" : "#8FB6D6",
          border: `4px solid ${fin ? SITE.green : on ? SITE.amber : "#6FA5CE"}`,
          boxShadow: on ? "0 12px 26px rgba(0,0,0,0.22)" : "0 6px 14px rgba(0,0,0,0.14)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: wide ? 6 : 7 * b.scale,
          transform: `translateY(${bob(frame, fps, 3, 3.4, i)}px) scale(${on ? 1.06 : 1}) rotate(${wiggle(frame, fps, 0.8, 5, i)}deg)`,
          fontFamily: font.family,
        }}
      >
        <div style={{ fontSize: (compact ? 38 : 46) * b.scale, ...(wide ? {} : { lineHeight: 1.05 }) }}>{p.emoji}</div>
        <div style={{ fontWeight: 800, fontSize: (compact ? 25 : 30) * b.scale, ...(wide ? {} : { lineHeight: 1.1 }), color: on || fin ? SITE.ink : "#FFFFFF" }}>{p.name}</div>
        <div style={{ fontWeight: 700, fontSize: (compact ? 19 : 22) * b.scale, ...(wide ? {} : { lineHeight: 1.1, whiteSpace: "nowrap" }), color: on || fin ? "#5A6178" : "#EAF4FF" }}>{p.key}</div>
        {fin && <div style={{ fontWeight: 800, fontSize: 20 * b.scale, color: SITE.green }}>DONE</div>}
      </div>
    );
  });

  return <Stage b={b} gap={gap}>{cards}</Stage>;
};

