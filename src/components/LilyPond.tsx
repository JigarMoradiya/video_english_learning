import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, drift, wiggle } from "../lib/motion";

// ── THE LILY POND — the 9:16 skin ────────────────────────────────────────────
//
// The stream's sibling, not a copy of it. The idea is the same one the milestone teaches —
// you cross by stepping along a line of words, left to right — but the crossing is a pond
// seen from above rather than a stream seen from the side, so a viewer who has watched the
// 16:9 is not watching the same picture twice:
//
//   stream (16:9 / 4:5)          pond (9:16)
//   stone cards on open water    cards on LILY PADS
//   grass banks left and right   reeds top, lotus flowers throughout
//   a butterfly over the bank    a FROG that hops onto whichever word is being read
//   bright noon blue             deep evening teal
//
// The geometry is shared — same bands(), same sizes() — so the reel logic is identical and
// only the skin changes.

const PAD_GREEN = "#2E7D32";
const PAD_LIGHT = "#66BB6A";

// ── Pond ─────────────────────────────────────────────────────────────────────

const Ripples: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => {
        const cx = [0.18, 0.72, 0.42, 0.86, 0.12, 0.58, 0.32][i] * width;
        const cy = [0.18, 0.28, 0.62, 0.74, 0.84, 0.90, 0.44][i] * height;
        const t = ((frame / fps) * 0.34 + i * 0.4) % 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: cx, top: cy,
              width: 220, height: 70, marginLeft: -110, marginTop: -35,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.30)",
              transform: `scale(${0.3 + t * 1.5})`,
              opacity: (1 - t) * 0.5,
            }}
          />
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`s${i}`}
          style={{
            position: "absolute",
            left: -width, top: (0.12 + i * 0.19) * height,
            width: width * 3, height: 6, borderRadius: 999,
            background: "rgba(255,255,255,0.16)",
            transform: `translateX(${drift(frame, fps, 9 + i * 2) * width * (i % 2 ? 1 : -1)}px)`,
          }}
        />
      ))}
    </>
  );
};

const Lotus: React.FC<{ x: number; y: number; size: number; seed: number }> = ({ x, y, size, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute", left: x, top: y,
        transform: `translateY(${bob(frame, fps, 5, 3.2, seed)}px) rotate(${wiggle(frame, fps, 4, 3.6, seed)}deg)`,
      }}
    >
      {[0, 72, 144, 216, 288].map((deg) => (
        <div
          key={deg}
          style={{
            position: "absolute",
            width: size * 0.42, height: size,
            borderRadius: "50%",
            background: "linear-gradient(#F8BBD0, #EC407A)",
            transformOrigin: "50% 100%",
            transform: `rotate(${deg}deg) translateY(-${size * 0.34}px)`,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: size * 0.09, top: -size * 0.12, width: size * 0.24, height: size * 0.24, borderRadius: "50%", background: "#FFD54F" }} />
    </div>
  );
};

const Cattails: React.FC<{ x: number; baseY: number; count: number }> = ({ x, baseY, count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const h = 170 + (i % 4) * 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x + i * 34, top: baseY - h,
              width: 9, height: h,
              transformOrigin: "bottom center",
              transform: `rotate(${wiggle(frame, fps, 5, 2.8 + i * 0.3, i)}deg)`,
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "linear-gradient(#43A047, #1B5E20)" }} />
            <div style={{ position: "absolute", left: -5, top: -34, width: 19, height: 46, borderRadius: 999, background: "#6D4C41" }} />
          </div>
        );
      })}
    </>
  );
};

/**
 * Fish and bubbles, in the pond BELOW the sentence.
 *
 * A 1080×1920 frame is more than twice as tall as it is wide, and the row of words only
 * ever fills a band across the middle — so the first cut left the whole lower half as flat
 * teal. These live in the free regions only: never the reward band (y 0.17–0.30), never
 * the word row (0.51–0.61), never the caption strip (0.88–0.97).
 */
const Fish: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shoal = [
    { y: 0.310, size: 42, speed: 0.050, phase: 0.20, dir: 1 },
    { y: 0.500, size: 54, speed: 0.042, phase: 0.72, dir: -1 },
    { y: 0.560, size: 38, speed: 0.066, phase: 0.35, dir: 1 },
    { y: 0.625, size: 54, speed: 0.055, phase: 0.10, dir: 1 },
    { y: 0.685, size: 40, speed: 0.070, phase: 0.60, dir: 1 },
    { y: 0.745, size: 62, speed: 0.045, phase: 0.30, dir: -1 },
    { y: 0.805, size: 46, speed: 0.062, phase: 0.80, dir: -1 },
    { y: 0.858, size: 36, speed: 0.080, phase: 0.45, dir: 1 },
  ];
  return (
    <>
      {shoal.map((f, i) => {
        const t = ((frame / fps) * f.speed + f.phase) % 1;
        const x = f.dir > 0 ? -160 + t * (width + 320) : width + 160 - t * (width + 320);
        const tail = Math.sin(frame / 4 + i) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x, top: f.y * height,
              transform: `scaleX(${f.dir}) translateY(${bob(frame, fps, 5, 2.6, i)}px)`,
              opacity: 0.34,
            }}
          >
            <div style={{ position: "relative", width: f.size * 1.7, height: f.size }}>
              <div style={{ position: "absolute", left: f.size * 0.4, top: 0, width: f.size * 1.3, height: f.size, borderRadius: "50%", background: "#06403F" }} />
              <div
                style={{
                  position: "absolute", left: 0, top: f.size * 0.18,
                  width: 0, height: 0,
                  borderTop: `${f.size * 0.32}px solid transparent`,
                  borderBottom: `${f.size * 0.32}px solid transparent`,
                  borderRight: `${f.size * 0.5}px solid #06403F`,
                  transform: `rotate(${tail}deg)`, transformOrigin: "right center",
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

const Bubbles: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = [0.13, 0.34, 0.62, 0.88];
  return (
    <>
      {cols.flatMap((cx, c) =>
        Array.from({ length: 5 }).map((_, i) => {
          const t = ((frame / fps) * 0.13 + i * 0.2 + c * 0.11) % 1;
          const size = 9 + ((i * 7 + c * 3) % 13);
          // rise through the lower pond only, and fade out before the caption strip
          const y = height * 0.98 - t * height * 0.30;
          return (
            <div
              key={`${c}-${i}`}
              style={{
                position: "absolute",
                left: cx * width + Math.sin(frame / 22 + i + c) * 14,
                top: y,
                width: size, height: size, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.42)",
                opacity: Math.sin(t * Math.PI) * 0.75,
              }}
            />
          );
        })
      )}
    </>
  );
};

export const PondWorld: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0F6B6B 0%, #12857F 34%, #0C5E63 100%)" }}>
      <Ripples width={width} height={height} />

      {/* free-floating pads, so the pond is a place and not a backdrop */}
      {[[0.08, 0.055, 140], [0.84, 0.10, 112], [0.13, 0.295, 124],
        [0.86, 0.545, 132], [0.15, 0.78, 146], [0.60, 0.955, 120]].map(
        ([fx, fy, sz], i) => (
          <div
            key={i}
            style={{
              position: "absolute", left: fx * width, top: fy * height,
              width: sz, height: (sz as number) * 0.78,
              borderRadius: "50%",
              background: `radial-gradient(circle at 40% 35%, ${PAD_LIGHT}, ${PAD_GREEN})`,
              opacity: 0.46,
              transform: `translateY(${bob(frame, fps, 7, 3.4, i)}px) rotate(${wiggle(frame, fps, 3, 4, i)}deg)`,
            }}
          />
        )
      )}

      {/* kept OUT of the word row's band (y 0.50–0.62) and the reward band (0.18–0.30) —
          the first cut put a lotus straight through the end of every sentence */}
      {/* The row owns y 0.35–0.45. Every flower clears it — two of these used to sit at
          0.37 and 0.345 on the right, i.e. straight through the end of every sentence. */}
      <Lotus x={width * 0.06} y={height * 0.115} size={72} seed={0} />
      <Lotus x={width * 0.92} y={height * 0.145} size={60} seed={1} />
      <Lotus x={width * 0.07} y={height * 0.585} size={66} seed={2} />
      <Lotus x={width * 0.89} y={height * 0.720} size={58} seed={3} />


      <Fish width={width} height={height} />
      <Bubbles width={width} height={height} />

      <Cattails x={-10} baseY={height * 0.20} count={4} />
      <Cattails x={width - 130} baseY={height * 0.17} count={4} />
      <Cattails x={width * 0.30} baseY={height * 0.115} count={3} />
    </AbsoluteFill>
  );
};

// ── A lily pad, which is what a word stands on here ─────────────────────────

export const LilyPad: React.FC<{ size: number; seed: number; lit: boolean }> = ({ size, seed, lit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = size * 3.4;
  return (
    <div
      style={{
        position: "absolute", left: "50%", top: "48%",
        width: w, height: w * 0.62, marginLeft: -w / 2, marginTop: -(w * 0.62) / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle at 42% 34%, ${lit ? "#9CCC65" : PAD_LIGHT}, ${PAD_GREEN})`,
        boxShadow: lit ? "0 0 40px rgba(156,204,101,0.7)" : "0 10px 22px rgba(0,0,0,0.28)",
        transform: `rotate(${wiggle(frame, fps, 2.5, 3.4, seed)}deg) translateY(${bob(frame, fps, 3, 3, seed)}px)`,
      }}
    >
      {/* the pad's notch, so it reads as a lily pad and not a green disc */}
      <div
        style={{
          position: "absolute", right: "6%", top: "50%",
          width: w * 0.20, height: w * 0.16, marginTop: -(w * 0.08),
          background: "#0F6B6B",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

// ── The frog: it hops onto whichever word is being read ─────────────────────

export const FrogHopper: React.FC<{ x: number; y: number; hopFrom: number }> = ({ x, y, hopFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame - hopFrom, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hop = Math.sin(p * Math.PI) * -46;          // the arc of the jump itself
  const idle = bob(frame, fps, 4, 1.9);
  const squash = 1 + 0.10 * Math.sin(p * Math.PI);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)" }}>
      {/* THE PAD DOES NOT HOP. It is the thing being jumped off — riding the jump made the
          whole assembly look like it was being lifted. It keeps its own slow float on the
          water instead, on a period unrelated to the frog's. */}
      <div style={{ position: "absolute", left: "50%", top: 52, width: 210, height: 62, marginLeft: -105,
                    borderRadius: "50%", background: "radial-gradient(circle at 42% 34%, #66BB6A, #2E7D32)",
                    opacity: 0.75,
                    transform: `translateY(${bob(frame, fps, 3, 3.6)}px) rotate(${wiggle(frame, fps, 1.6, 4.2)}deg)` }} />
      <div style={{ position: "relative", width: 120, height: 87,
                    transform: `translateY(${hop + idle}px) scaleY(${squash}) scale(1.35)`,
                    transformOrigin: "bottom center" }}>
        <div style={{ position: "absolute", left: 6, top: 16, width: 74, height: 44, borderRadius: "50%", background: "linear-gradient(#66BB6A, #2E7D32)" }} />
        <div style={{ position: "absolute", left: 14, top: 2, width: 26, height: 26, borderRadius: "50%", background: "#66BB6A" }} />
        <div style={{ position: "absolute", left: 46, top: 2, width: 26, height: 26, borderRadius: "50%", background: "#66BB6A" }} />
        <div style={{ position: "absolute", left: 22, top: 9, width: 11, height: 11, borderRadius: "50%", background: "#1B1B1B" }} />
        <div style={{ position: "absolute", left: 54, top: 9, width: 11, height: 11, borderRadius: "50%", background: "#1B1B1B" }} />
        <div style={{ position: "absolute", left: 30, top: 40, width: 26, height: 6, borderRadius: 999, background: "#1B5E20", opacity: 0.7 }} />
      </div>
    </div>
  );
};
