import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { palette } from "../data/tokens";

// ── Shared layout kit for 9:16 lesson beats ──────────────────────────────────
// Extracted from the oo portrait cut after its first version came out EMPTY: small
// pills centred inside a band leave the top and bottom thirds of a 1920-tall frame
// bare. The rules baked in here are what fixed it:
//
//   · PBand spans 292 → 1452 and DISTRIBUTES its children (space-between) rather
//     than bunching them in the middle. 1452 is deliberate: it clears the caption
//     pill, which starts around 1500. An earlier 1622 ran rows into the captions.
//   · Row is FULL WIDTH (900px) with icon left / body flexed / marker right, so a
//     card is used edge to edge instead of reading as left-aligned with dead space.
//
// Any new portrait lesson beat should use these rather than re-inventing spacing.

export const BAND_TOP = 292;
export const BAND_H = 1160; // 292 + 1160 = 1452, clear of the captions
export const ROW_W = 900;

export const PBand: React.FC<{ children: React.ReactNode; spread?: boolean; gap?: number }> = ({ children, spread = true, gap = 26 }) => (
  <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: spread ? "space-between" : "center", gap, paddingBottom: 8, pointerEvents: "none" }}>
    {children}
  </div>
);

// `still` skips the entrance spring — required on any beat that owns FRAME 0, since
// frame 0 is the upload thumbnail and a mid-spring element makes it an incomplete cover.
export const Head: React.FC<{ children: React.ReactNode; size?: number; from?: number; still?: boolean }> = ({ children, size = 50, from = 0, still = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = still ? 1 : spring({ frame: frame - from, fps, config: { damping: 12 } });
  if (frame < from) return null;
  return (
    <div style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.6)}px)`, background: "#ffffffef", borderRadius: 999, padding: "16px 40px", fontSize: size, fontWeight: 700, color: palette.ink, boxShadow: "0 14px 34px rgba(20,16,40,0.30)", textAlign: "center", maxWidth: 960 }}>
      {children}
    </div>
  );
};

export const Row: React.FC<{
  at: number; color: string; icon?: string; body: React.ReactNode; mark?: React.ReactNode;
  dim?: boolean; big?: boolean; filled?: boolean;
}> = ({ at, color, icon, body, mark, dim = false, big = false, filled = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  return (
    <div style={{ width: ROW_W, transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2.4)}px)`, opacity: dim ? 0.42 : 1, background: filled ? color : "#fff", border: `7px solid ${color}`, borderRadius: 30, padding: big ? "20px 30px" : "14px 28px", display: "flex", alignItems: "center", gap: 24, boxShadow: `0 16px 38px ${color}55`, boxSizing: "border-box" }}>
      {icon && <span style={{ fontSize: big ? 78 : 62, lineHeight: 1 }}>{icon}</span>}
      <div style={{ flex: 1, fontSize: big ? 78 : 62, fontWeight: 700, color: filled ? "#fff" : palette.ink, letterSpacing: 1 }}>{body}</div>
      {mark && <span style={{ fontSize: big ? 62 : 52, fontWeight: 700, color: filled ? "#fff" : color }}>{mark}</span>}
    </div>
  );
};

const CONF = ["#FF5252", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8", "#FF8A65"];
const PIECES = Array.from({ length: 40 }, (_, i) => {
  const r = (s: number) => Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1);
  return { angle: -Math.PI / 2 + (r(1) - 0.5) * Math.PI * 1.15, speed: 600 + r(2) * 520, color: CONF[i % CONF.length], size: 13 + r(3) * 17, spin: (r(4) - 0.5) * 1400, long: r(6) > 0.5 };
});

export const Burst: React.FC<{ start: number; top?: string }> = ({ start, top = "52%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const t = (frame - start) / fps;
  return (
    <div style={{ position: "absolute", top, left: "50%", width: 0, height: 0 }}>
      {PIECES.map((p, i) => {
        const x = Math.cos(p.angle) * p.speed * t;
        const y = Math.sin(p.angle) * p.speed * t + 0.5 * 1500 * t * t;
        const o = interpolate(t, [0, 1.1, 1.6], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={i} style={{ position: "absolute", transform: `translate(${x}px, ${y}px) rotate(${p.spin * t}deg)`, width: p.long ? p.size * 0.5 : p.size, height: p.long ? p.size * 1.6 : p.size, background: p.color, borderRadius: 3, opacity: o }} />;
      })}
    </div>
  );
};

// Listening cue. The hand-drawn SVG ear this replaces read as an unidentifiable
// blob at small sizes, so it is now the 👂 glyph (unmistakable at any size) with
// sound arcs travelling INTO it. `color` tints the arcs, not the ear.
export const Ear: React.FC<{ size?: number; color?: string }> = ({ size = 190, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
        {/* three arcs at FIXED radii, pulsing in turn. Animating the radius made
            them slide over each other and read as one thick crescent. */}
        {[0, 1, 2].map((k) => {
          const r = 13 + k * 9;
          const phase = ((frame * 0.05) - k * 0.33) % 1;
          const o = 0.28 + 0.72 * Math.max(0, Math.sin(phase * Math.PI));
          return <path key={k} d={`M${30 - k * 4} ${50 - r * 0.95} a${r} ${r} 0 0 1 0 ${r * 1.9}`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={o} />;
        })}
      </svg>
      <span style={{ fontSize: size * 0.6, lineHeight: 1, marginLeft: size * 0.16, transform: `scale(${1 + 0.05 * Math.sin((frame / fps) * 4)})` }}>👂</span>
    </div>
  );
};
