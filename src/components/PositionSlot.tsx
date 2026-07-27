import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { hex, palette, font } from "../data/tokens";

// ── The three-position slot, shared by every pair lesson ─────────────────────
// ai/ay · oi/oy · oa/ow all teach the SAME rule — the sound's POSITION in the word
// decides the spelling — so all three share this slot model:
//
//   rain → r | ai | n     the mid spelling lands in slot 1 (MIDDLE)
//   day  →   | d  | ay    the end spelling lands in slot 2, and nothing follows it
//
// Words load RIGHT-ALIGNED, so a 2-part word uses the last two slots and the
// end-spelling always ends up in the final one. That is the whole rule, visible.
//
// What each video does NOT share is the SET the slots live in — a train (ai/ay), lily
// pads (oi/oy), rafts on the swell (oa/ow). Each recorded recap line names its own
// motion ("ay finishes the word" · "oy JUMPS to the end" · "ow ROLLS to the end"), and
// the set acts that verb out. Only the slot CONTENTS are common, so they live here
// instead of being copy-pasted three times.

export type Slot = { text: string; kind: "marker" | "letter" | "ghost" | "cross"; tag?: string };
export type SlotState = { cars: [Slot | null, Slot | null, Slot | null]; litIdx?: number };

export const POSITION_LABEL = ["BEGINNING", "MIDDLE", "END"];

// The first slot belongs to NEITHER spelling. Painting it in the mid-spelling's colour
// implied "ai lives here too", which is the opposite of the lesson.
export const NEUTRAL = "78909C";

export const slotColor = (i: number, data: PhonicsComparison) =>
  i === 0 ? NEUTRAL : i === 1 ? data.teams[0].colorHex : data.teams[1].colorHex;

// ── which slot is lit, and how long ago it changed ────────────────────────────
// Remotion renders one frame at a time with no state, so a character that JUMPS between
// slots derives its motion by walking stateFor backwards to the frame the lit slot last
// changed. stateFor is pure comparisons, so this is cheap, and the jump can never drift
// out of sync with the narration.
export const litOf = (stateFor: (f: number) => SlotState, f: number) => stateFor(f).litIdx ?? -1;

export const hopInfo = (stateFor: (f: number) => SlotState, f: number, hopFrames: number, look = 150) => {
  const cur = litOf(stateFor, f);
  let changedAt = f - look;
  for (let k = 1; k <= look; k++) {
    if (litOf(stateFor, f - k) !== cur) {
      changedAt = f - k + 1;
      break;
    }
  }
  const prev = litOf(stateFor, changedAt - 1);
  const t = Math.min(1, Math.max(0, (f - changedAt) / hopFrames));
  return { cur, prev: prev < 0 ? cur : prev, t };
};

// ── what sits inside a slot ──────────────────────────────────────────────────
// A slot with nothing to show holds a dashed ghost frame, never a bare hole: empty
// slots for 15s is the dead-screen failure every one of these sets has to avoid.
export const SlotContent: React.FC<{ slot: Slot | null; color: string; scale?: number }> = ({ slot, color, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  if (!slot) {
    return <div style={{ width: "62%", height: "58%", borderRadius: 22 * scale, border: `${Math.max(4, 6 * scale)}px dashed #C9D4E4`, opacity: 0.75 }} />;
  }
  const s = spring({ frame, fps, config: { damping: 11 } });
  if (slot.kind === "ghost") {
    return <span style={{ fontSize: 116 * scale, fontWeight: 700, color: "#B9C4D6", opacity: 0.7, fontFamily: font.family }}>{slot.text}</span>;
  }
  if (slot.kind === "cross") {
    return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
        <span style={{ fontSize: 132 * scale, fontWeight: 700, color: "#C62828" }}>{slot.text}</span>
        <svg width={210 * scale} height={130 * scale} style={{ position: "absolute", pointerEvents: "none" }}>
          <line x1={16 * scale} y1={16 * scale} x2={194 * scale} y2={114 * scale} stroke="#C62828" strokeWidth={13 * scale} strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  const isMarker = slot.kind === "marker";
  return (
    <span
      style={{
        fontSize: (isMarker ? 150 : 128) * scale,
        fontWeight: 700,
        color: isMarker ? c : palette.ink,
        lineHeight: 1,
        fontFamily: font.family,
        transform: `scale(${0.7 + 0.3 * s})`,
        textShadow: isMarker ? `0 10px 26px ${c}44` : "none",
      }}
    >
      {slot.text}
    </span>
  );
};

// ── the "⬅ before" / "after ➡" chip the narration names out loud ─────────────
export const TagChip: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        background: "#FFF3E0", border: "4px solid #EF6C00", color: "#EF6C00",
        borderRadius: 999, padding: "3px 20px", fontSize: 28, fontWeight: 700,
        fontFamily: font.family, whiteSpace: "nowrap",
        transform: `scale(${1 + 0.06 * Math.sin((frame / fps) * 5)})`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ── BEGINNING · MIDDLE · END plate ───────────────────────────────────────────
export const PositionPlate: React.FC<{ idx: number; lit: boolean; color: string; style?: React.CSSProperties }> = ({ idx, lit, color, style }) => (
  <div
    style={{
      background: lit ? "#FFFFFF" : "#FFFFFF99",
      color: lit ? hex(color) : "#8FA0B8",
      borderRadius: 999, padding: "5px 20px", fontSize: 24, fontWeight: 700, letterSpacing: 2,
      fontFamily: font.family, whiteSpace: "nowrap",
      boxShadow: lit ? "0 6px 16px rgba(0,0,0,0.18)" : "none",
      ...style,
    }}
  >
    {POSITION_LABEL[idx]}
  </div>
);
