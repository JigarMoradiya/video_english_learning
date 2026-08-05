import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { bob, drift, wiggle } from "../lib/motion";
import { LilyPad, PondWorld } from "./LilyPond";

// ── THE STEPPING STONES ──────────────────────────────────────────────────────
//
// The world for MILESTONE · Read Your First Sentences.
//
// A row of stones across a stream. Each stone is a WORD, and you cross by reading them
// left to right — which is the only genuinely new idea in this milestone. The picture
// waits on the far bank, so meaning is literally the other side of the crossing, and
// finishing the video means the child crossed.
//
// Nothing here is ever still: the water drifts, the reeds sway, every stone bobs on its
// own phase, and a dragonfly works the far bank.
//
// Colours are the app's own, so a child who plays the module recognises the video:
//   normal word  #1565C0   ·   helper word  #8E24AA   ·   accent  #E65100

export const STONE_BLUE = "#1565C0";
export const STONE_PURPLE = "#8E24AA";
export const ACCENT = "#E65100";
const LIT = "#FFB300";

export type Aspect = "16x9" | "4x5" | "9x16";

/** 4:5 and 9:16 are BOTH taller than wide — they must never share a table. */
export const aspectOf = (width: number, height: number): Aspect =>
  height <= width ? "16x9" : height / width > 1.5 ? "9x16" : "4x5";

/**
 * Where everything lives, per aspect. Fractions, not pixels, so a frame size change
 * cannot silently break a layout — but a SEPARATE set per aspect, because a tall frame
 * wants the row lower and the reward higher than a wide one does.
 */
export const bands = (width: number, height: number) => {
  const a = aspectOf(width, height);
  const t = a === "16x9"
    ? { horizon: 0.30, water: 0.44, stone: 0.575, upper: 0.265, bankX: 0.973, bankW: 0.09, rowW: 0.86, bankLift: 0.055 }
    : a === "4x5"
      // A tall frame gives the reward real room above, and the row must sit LOW — at the
      // 16:9 height it left a third of the frame as empty water under it. The banks also
      // narrow, or a six-word sentence lands on the grass instead of in the stream.
      ? { horizon: 0.24, water: 0.38, stone: 0.615, upper: 0.270, bankX: 0.966, bankW: 0.115, rowW: 0.72, bankLift: 0.038 }
      // 9:16 — the tallest of the three, and its own table for the same reason
      : { horizon: 0.20, water: 0.34, stone: 0.400, upper: 0.205, bankX: 0.969, bankW: 0.105, rowW: 0.74, bankLift: 0.028 };
  const waterTop = Math.round(height * t.water);
  return {
    aspect: a,
    width,
    height,
    horizon: Math.round(height * t.horizon),
    waterTop,
    // the stones sit ON the water, and on the FRAME's own centre line — the first cut
    // hung the row off a container that stopped short of the bank, so every sentence sat
    // 130px left of centre with a slab of green beside it.
    stoneY: Math.round(height * t.stone),
    // the band above the row: the reward picture, or the choices. Only ever one of them.
    upperY: Math.round(height * t.upper),
    // the far bank is world flavour at the right edge, not a third of the frame
    bankX: Math.round(width * t.bankX),
    bankW: Math.round(width * t.bankW),
    rowW: t.rowW,
    bankTop: Math.round(waterTop - height * t.bankLift),
    // everything below this belongs to the caption strip
    safeBottom: Math.round(height * 0.16),
  };
};

/**
 * Type sizes per aspect. A six-word sentence has to fit ACROSS the frame, and 1080 is
 * barely half of 1920 — the 16:9 sizes overflow a portrait frame outright, which is the
 * whole reason this table exists rather than one constant.
 */
export const sizes = (width: number, height: number) => {
  const a = aspectOf(width, height);
  if (a === "16x9") return { row: 62, eight: 56, missing: 76, choice: 64, picture: 230, ghost: 40 };
  if (a === "4x5") return { row: 42, eight: 32, missing: 45, choice: 42, picture: 250, ghost: 28 };
  return { row: 48, eight: 40, missing: 52, choice: 48, picture: 260, ghost: 30 };
};

// ── Water ────────────────────────────────────────────────────────────────────

const Water: React.FC<{ top: number; width: number; height: number }> = ({ top, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = 9;
  return (
    <div style={{ position: "absolute", left: 0, top, width, height: height - top, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#7EC8E3, #2E8BC0 55%, #1B5E8C)" }} />
      {Array.from({ length: rows }).map((_, i) => {
        const y = (i / rows) * (height - top);
        const speed = 5 + (i % 3) * 2.5;
        const x = drift(frame, fps, speed) * width * (i % 2 ? 1 : -1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -width, top: y + Math.sin(frame / (24 + i * 3)) * 4,
              width: width * 3, height: 5 + (i % 3) * 3,
              borderRadius: 999,
              background: "rgba(255,255,255,0.30)",
              transform: `translateX(${x}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Reeds ────────────────────────────────────────────────────────────────────

const Reeds: React.FC<{ x: number; span: number; baseY: number; count: number }> = ({ x, span, baseY, count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const h = 120 + (i % 4) * 46;
        const sway = wiggle(frame, fps, 4, 2.4 + i * 0.3, i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + (span * i) / Math.max(1, count - 1),
              top: baseY - h,
              width: 9, height: h,
              borderRadius: 999,
              background: "linear-gradient(#4CAF50, #2E7D32)",
              transformOrigin: "bottom center",
              transform: `rotate(${sway}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

// ── The far bank ─────────────────────────────────────────────────────────────

const FarBank: React.FC<{ b: ReturnType<typeof bands> }> = ({ b }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: b.bankX - b.bankW * 0.7, top: b.bankTop,
        width: b.width - b.bankX + b.bankW * 0.7, height: b.height - b.bankTop,
        background: "linear-gradient(#8BC34A, #558B2F)",
        borderTopLeftRadius: Math.round(b.bankW * 0.22),
      }}
    />
    {/* inset from both edges of the bank, so no blade overhangs the water */}
    <Reeds
      x={b.bankX - b.bankW * 0.7 + 26}
      span={b.width - (b.bankX - b.bankW * 0.7) - 62}
      baseY={b.bankTop + 30}
      count={4}
    />
  </>
);

const Dragonfly: React.FC<{ b: ReturnType<typeof bands> }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = b.bankX - 120 + Math.sin(frame / 46) * 90;
  const y = b.bankTop - 120 + Math.cos(frame / 33) * 46;
  // NEVER an emoji here: 🦋 falls back to a "W" glyph in the render font. Drawn instead.
  const flap = Math.sin(frame / 3);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${wiggle(frame, fps, 10, 1.1)}deg)` }}>
      <div style={{ position: "absolute", width: 26, height: 12, borderRadius: "50%", background: "#FF8A65", transform: `translateX(-22px) scaleX(${0.5 + 0.5 * Math.abs(flap)})` }} />
      <div style={{ position: "absolute", width: 26, height: 12, borderRadius: "50%", background: "#FF8A65", transform: `translateX(4px) scaleX(${0.5 + 0.5 * Math.abs(flap)})` }} />
      <div style={{ position: "absolute", left: -3, top: 2, width: 8, height: 8, borderRadius: 999, background: "#4E342E" }} />
    </div>
  );
};

// ── World ────────────────────────────────────────────────────────────────────

export const StonesWorld: React.FC<{ skin?: "stream" | "pond"; waterFrac?: number }> = ({ skin, waterFrac }) => {
  const { width, height } = useVideoConfig();
  const base = bands(width, height);
  // The covers push the waterline DOWN so the headline sits on sky, not on water. The
  // video keeps the table's own value.
  const b = waterFrac
    ? { ...base, waterTop: Math.round(height * waterFrac), bankTop: Math.round(height * waterFrac - height * 0.028) }
    : base;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The 9:16 VIDEO wears the pond — the same crossing seen from above, so a viewer who
  // watched the wide cut is not shown the same picture twice. The 9:16 COVER does not:
  // both covers wear the stream, because a cover promises the long video's world. So the
  // skin is passed in, and only defaults to the aspect.
  const use = skin ?? (b.aspect === "9x16" ? "pond" : "stream");
  if (use === "pond") return <PondWorld />;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FFF3D6 0%, #CFEAF7 46%, #A9DCEF 100%)" }}>
      {/* far hills */}
      <div style={{ position: "absolute", left: -80, top: b.horizon - 90, width: width * 0.7, height: 240, borderRadius: "50%", background: "#A5D6A7", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: width * 0.42, top: b.horizon - 60, width: width * 0.7, height: 200, borderRadius: "50%", background: "#C5E1A5", opacity: 0.9 }} />
      {/* sun */}
      <div style={{ position: "absolute", left: width * 0.08, top: b.horizon - 210, width: 130, height: 130, borderRadius: "50%", background: "#FFD54F", boxShadow: "0 0 90px rgba(255,213,79,0.75)", transform: `translateY(${bob(frame, fps, 6, 6)}px)` }} />

      <Water top={b.waterTop} width={width} height={height} />

      {/* near bank, bottom-left — where the child starts */}
      <div style={{ position: "absolute", left: 0, top: b.bankTop, width: b.bankW, height: height - b.bankTop, background: "linear-gradient(#8BC34A, #558B2F)", borderTopRightRadius: Math.round(b.bankW * 0.22) }} />
      <Reeds x={22} span={b.bankW - 52} baseY={b.bankTop + 30} count={3} />

      <FarBank b={b} />
      <Dragonfly b={b} />
    </AbsoluteFill>
  );
};

// ── A word stone ─────────────────────────────────────────────────────────────

export type StoneState = "hidden" | "idle" | "lit" | "gap";

export const WordStone: React.FC<{
  word: string;
  helper?: boolean;
  state: StoneState;
  /** phase offset so no two stones bob together */
  seed?: number;
  size?: number;
  /** pads belong to the pond skin; the covers pass false even at 1080×1920 */
  pond?: boolean;
}> = ({ word, helper = false, state, seed = 0, size = 62, pond }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const onPad = pond ?? aspectOf(vw, vh) === "9x16";

  const lit = state === "lit";
  const waiting = state === "hidden";
  const isGap = state === "gap";
  const shown = isGap ? "?" : word;
  const face = isGap ? "rgba(255,255,255,0.30)" : lit ? LIT : "#FFFFFF";
  const ink = isGap ? "rgba(255,255,255,0.9)" : lit ? "#FFFFFF" : helper ? STONE_PURPLE : STONE_BLUE;

  return (
    <div
      style={{
        transform: `translateY(${bob(frame, fps, 5, 2.6, seed)}px) scale(${lit ? 1.1 : waiting ? 0.6 : 1})`,
        // a stone that has not landed is invisible but still holds its place, so the
        // sentence assembles in position instead of sliding left each time
        opacity: waiting ? 0 : 1,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      <div style={{ position: "relative" }}>
      {onPad && !waiting && <LilyPad size={size} seed={seed} lit={lit} />}
      <div
        style={{
          position: "relative",
          padding: `${size * 0.26}px ${size * 0.44}px`,
          borderRadius: size * 0.46,
          background: face,
          border: isGap ? `4px dashed rgba(255,255,255,0.85)` : "none",
          boxShadow: lit
            ? `0 14px 34px rgba(255,179,0,0.55)`
            : `0 12px 26px rgba(12,60,90,0.35)`,
          fontFamily: font.family,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          color: ink,
          whiteSpace: "nowrap",
        }}
      >
        {shown}
      </div>
      </div>
      {/* the stone sits IN water — a shadow plus a ripple ring always spreading from it,
          so even a held sentence is never a still picture */}
      <div style={{ marginTop: 6, position: "relative", height: 26, width: size * 2.4 }}>
        <div
          style={{
            position: "absolute", left: "50%", top: 2, transform: "translateX(-50%)",
            width: size * 1.9, height: 12, borderRadius: "50%",
            background: "rgba(0,0,0,0.20)", filter: "blur(5px)",
          }}
        />
        {[0, 1].map((k) => {
          const t = ((frame / fps + seed * 0.37 + k * 0.9) % 1.8) / 1.8;
          return (
            <div
              key={k}
              style={{
                position: "absolute", left: "50%", top: 0, transform: `translateX(-50%) scale(${0.5 + t * 1.3})`,
                width: size * 1.7, height: 20, borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.55)",
                opacity: (1 - t) * 0.55,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * A stone that has not arrived yet. "Watch the words arrive." used to play over open
 * water with nothing on screen at all; now the sockets are already waiting, so the line
 * has something to point at and the child can see how many words are coming.
 */
export const EmptySocket: React.FC<{ size?: number; seed?: number }> = ({ size = 62, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = 0.35 + 0.25 * Math.sin(frame / 9 + seed);
  return (
    <div style={{ transform: `translateY(${bob(frame, fps, 4, 2.8, seed)}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: size * 2.2, height: size * 1.55,
          borderRadius: size * 0.46,
          border: `4px dashed rgba(255,255,255,${glow})`,
          background: "rgba(255,255,255,0.10)",
        }}
      />
      <div style={{ marginTop: 6, height: 26 }} />
    </div>
  );
};

/** the whole row, centred in the water */
export const StoneRow: React.FC<{
  children: React.ReactNode;
  b: ReturnType<typeof bands>;
  gap?: number;
}> = ({ children, b, gap = 22 }) => (
  <div
    style={{
      position: "absolute",
      left: b.width * (1 - b.rowW) / 2,
      top: b.stoneY,
      width: b.width * b.rowW,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap,
      transform: "translateY(-50%)",
    }}
  >
    {children}
  </div>
);

/** the picture that lands on the far bank once a line has been read */
export const BankPicture: React.FC<{
  emoji: string;
  b: ReturnType<typeof bands>;
  show: boolean;
  from: number;
  /** a second thing tucked INTO the first — "The map is in the bag." shows the map in it */
  inner?: string;
  /** the sun treatment: heat haze and a beating glow, so "hot" is felt not just named */
  hot?: boolean;
  /** the app's own artwork instead of an emoji — same picture the child taps in the app */
  img?: string;
  /** a woven mat for the cat to sit on: "The cat sat on a MAT." */
  mat?: boolean;
}> = ({ emoji, b, show, from, inner, hot = false, img, mat = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const S = sizes(vw, vh);
  if (!show) return null;
  const t = frame - from;
  const pop = interpolate(t, [0, 8, 14], [0.4, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: b.upperY - S.picture * 0.55,
        width: b.width,
        display: "flex", justifyContent: "center",
        fontSize: S.picture,
        transform: `scale(${pop}) translateY(${bob(frame, fps, 8, 2.2)}px) rotate(${wiggle(frame, fps, 3, 2.6)}deg)`,
        transformOrigin: "bottom center",
      }}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        {hot && (
          <>
            <div
              style={{
                position: "absolute", left: "50%", top: "50%",
                width: 340, height: 340, marginLeft: -170, marginTop: -170,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(255,138,0,${0.34 + 0.16 * Math.sin(frame / 7)}) 0%, rgba(255,193,7,0) 68%)`,
              }}
            />
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                style={{
                  position: "absolute", left: 20 + k * 52, top: -70 + Math.sin(frame / 8 + k) * 8,
                  width: 10, height: 60, borderRadius: 999,
                  background: "rgba(255,138,0,0.55)",
                  transform: `rotate(${Math.sin(frame / 11 + k * 1.4) * 12}deg)`,
                }}
              />
            ))}
          </>
        )}
        {mat && (
          // the mat the cat sat on — woven bands, and it sits UNDER the picture
          <div
            style={{
              position: "absolute", left: "50%", bottom: "-6%",
              width: "1.34em", height: "0.34em", marginLeft: "-0.67em",
              borderRadius: "0.06em",
              background: "repeating-linear-gradient(90deg, #C77B3C 0 7%, #E09A5A 7% 14%)",
              border: "0.02em solid #A25E28",
              boxShadow: "0 0.03em 0.06em rgba(0,0,0,0.28)",
              transform: `perspective(340px) rotateX(56deg) rotate(${wiggle(frame, fps, 1.2, 3.4)}deg)`,
            }}
          />
        )}
        {img ? (
          <Img src={staticFile(img)} style={{ position: "relative", width: "1em", height: "1em", objectFit: "contain", display: "block" }} />
        ) : (
          <span style={{ position: "relative" }}>{emoji}</span>
        )}
        {inner && (
          <span
            style={{
              position: "absolute", right: -18, top: 16,
              fontSize: "0.52em",
              transform: `rotate(${wiggle(frame, fps, 5, 2.2, 1)}deg)`,
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))",
            }}
          >
            {inner}
          </span>
        )}
      </div>
    </div>
  );
};
