import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { hex, palette, tint } from "../data/tokens";
import { PhonicsComparison } from "../data/types";
import { SlotContent, SlotState, hopInfo, markerAwareColor, slotColor } from "./PositionSlot";

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

// ── the three-position row, portrait ─────────────────────────────────────────
// Added for the ou/ow and au/aw portrait cuts. The slots stay in a HORIZONTAL row even
// though the frame is tall: they stand for the ORDER OF LETTERS IN A WORD, so stacking
// them vertically would teach the wrong thing. The tall space goes to the world instead,
// which is also what stops the frame reading empty — the failure this file was born from.
//
//   y   100 …  280   the beat's headline pill
//   y   300 …  600   the world above (canopy, rocket nose…)
//   y   612 …  656   position plates
//   y   680 …  980   the three slot cards
//   y   990 … 1200   the character
//   y  1200 … 1452   the ground
//   y  1500 +        captions
export const PP_SAFE_X = 90;
export const PP_PLATE_TOP = 612;
export const PP_ROW_TOP = 680;
export const PP_CARD_W = 280;
export const PP_CARD_H = 300;
export const PP_CARD_GAP = 30; // 3×280 + 2×30 = 900 — exactly the safe width
export const ppCx = (i: number) => PP_SAFE_X + i * (PP_CARD_W + PP_CARD_GAP) + PP_CARD_W / 2;

// A pill pinned near the top, clear of the 90px social margin.
export const PHead: React.FC<{ children: React.ReactNode; size?: number; still?: boolean; from?: number }> = ({ children, size = 48, still = false, from = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = still ? 1 : spring({ frame: frame - from, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", top: 104, left: 0, width: 1080, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "#ffffffef", borderRadius: 999, padding: "16px 36px", fontSize: size, fontWeight: 700,
          color: palette.ink, textAlign: "center", maxWidth: 900, lineHeight: 1.16,
          boxShadow: "0 14px 34px rgba(20,16,40,0.30)",
          transform: `scale(${0.88 + 0.12 * s}) translateY(${bob(frame, fps, 4, 2.6)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const PP_LABEL = ["START", "MIDDLE", "END"];

export const PSlotRow: React.FC<{
  data: PhonicsComparison;
  stateFor: (frame: number) => SlotState;
  showLabelsFrom: number;
  labelLitAt: [number, number, number];
  hideAt: number;
  colorFor?: (i: number) => string;
  hopFrames?: number;
  // each world moves its own way, so it draws its own character at the x we hand it
  renderCharacter?: (x: number, t: number, moving: boolean, dir: number) => React.ReactNode;
}> = ({ data, stateFor, showLabelsFrom, labelLitAt, hideAt, colorFor, hopFrames = 14, renderCharacter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const { cars, litIdx } = stateFor(f);
  const { cur, prev, t } = hopInfo(stateFor, f, hopFrames);
  const fromX = ppCx(Math.max(0, prev));
  const toX = ppCx(Math.max(0, cur));
  const ease = t * t * (3 - 2 * t);
  const charX = fromX + (toX - fromX) * ease;

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {[0, 1, 2].map((i) => {
        const slot = cars[i];
        const col = markerAwareColor(slot, i, data, colorFor ?? ((k: number) => slotColor(k, data)));
        const c = hex(col);
        const lit = litIdx === i;
        return (
          <div key={i} style={{ position: "absolute", left: ppCx(i) - PP_CARD_W / 2, top: 0, width: PP_CARD_W, height: 1200 }}>
            {f >= showLabelsFrom && (
              <div
                style={{
                  position: "absolute", top: PP_PLATE_TOP, left: "50%", transform: "translateX(-50%)",
                  background: f >= labelLitAt[i] ? "#FFFFFF" : "#FFFFFF99",
                  color: f >= labelLitAt[i] ? c : "#8FA0B8",
                  borderRadius: 999, padding: "4px 16px", fontSize: 21, fontWeight: 700, letterSpacing: 1.6,
                  whiteSpace: "nowrap", boxShadow: f >= labelLitAt[i] ? "0 6px 16px rgba(0,0,0,0.22)" : "none",
                }}
              >
                {PP_LABEL[i]}
              </div>
            )}
            <div
              style={{
                position: "absolute", top: PP_ROW_TOP, left: 0, width: PP_CARD_W, height: PP_CARD_H,
                borderRadius: 30,
                background: lit ? tint(col, 0.9) : "#FFFFFFF2",
                border: `7px solid ${lit ? c : tint(col, 0.5)}`,
                boxShadow: lit ? `0 18px 44px ${c}66` : "0 12px 30px rgba(20,14,40,0.32)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                transform: `scale(${lit ? 1 + 0.045 * Math.sin((frame / fps) * 6) : 1})`,
                transformOrigin: "center bottom",
              }}
            >
              <SlotContent slot={slot} color={col} scale={0.6} />
            </div>
            {slot?.tag && (
              <div
                style={{
                  position: "absolute", top: PP_ROW_TOP + PP_CARD_H + 10, left: "50%", transform: "translateX(-50%)",
                  background: "#FFF3E0", border: "3px solid #EF6C00", color: "#EF6C00", borderRadius: 999,
                  padding: "2px 14px", fontSize: 21, fontWeight: 700, whiteSpace: "nowrap",
                }}
              >
                {slot.tag}
              </div>
            )}
          </div>
        );
      })}
      {renderCharacter && litIdx !== undefined && litIdx >= 0 && renderCharacter(charX, t, t < 0.98 && prev !== cur, toX < fromX ? -1 : 1)}
    </div>
  );
};
