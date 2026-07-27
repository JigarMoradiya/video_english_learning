import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { hex, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";
import { NEUTRAL, PositionPlate, Slot, SlotContent, SlotState, TagChip } from "./PositionSlot";

// ── The Word Train ───────────────────────────────────────────────────────────
// The teaching set for the pair cards (ai/ay · oi/oy · oa/ow). Three carriages ARE
// the three positions in a word — BEGINNING · MIDDLE · END — so "where the sound
// sits" is structural, not just asserted in the narration:
//
//   rain → r | ai | n     ai lands in the MIDDLE carriage
//   day  →   | d  | ay    ay lands in the LAST carriage, and nothing follows it
//
// Words load RIGHT-ALIGNED, so a 2-part word uses the last two carriages and the
// end-spelling always ends up in the final carriage. That is the whole rule, visible.
//
// LAYOUT LAW (LandscapeBeatKit): the train lives in the STAGE band y 300…860 and
// never enters the headline band (0…290) or the caption band (880…1080).
//
// EVERY CARRIAGE IS ALWAYS OCCUPIED — a carriage with nothing to show holds a dashed
// ghost slot, never a bare window. Empty carriages for 15s is the failure this
// mirrors WordStreet.tsx to avoid.

export type Car = Slot;
export type TrainState = SlotState;

const RAIL_Y = 782; // top of the wheels; wheels end 842, inside the stage band (860)
const WHEEL_R = 30;
const BODY_TOP = STAGE_TOP + 60; // 360
const BODY_H = 424; // 360 → 784, i.e. the body sits ON the wheels

// ── the sky/hills the whole video sits on (persistent, absolute frame) ───────
export const RailwaySky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (speed: number, span: number, phase: number) => ((frame * speed + phase) % (width + span)) - span;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #BFE6FF 0%, #DFF3FF 46%, #FBF6E9 100%)" }}>
      {/* sun — top-LEFT: the brand mark is pinned top-right and the rays behind it looked like a mess */}
      <svg width={260} height={260} style={{ position: "absolute", left: 44, top: 40 }}>
        <g transform="translate(130 130)">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 + frame * 0.25) * (Math.PI / 180);
            return <line key={i} x1={Math.cos(a) * 84} y1={Math.sin(a) * 84} x2={Math.cos(a) * 112} y2={Math.sin(a) * 112} stroke="#FFD54F" strokeWidth={9} strokeLinecap="round" opacity={0.75} />;
          })}
          <circle cx={0} cy={0} r={74} fill="#FFE082" />
        </g>
      </svg>
      {/* drifting clouds */}
      {[{ s: 0.24, y: 92, k: 1.0, p: 0 }, { s: 0.16, y: 178, k: 0.72, p: 700 }, { s: 0.3, y: 46, k: 0.56, p: 1350 }].map((c, i) => (
        <svg key={i} width={340 * c.k} height={150 * c.k} viewBox="0 0 340 150" style={{ position: "absolute", left: drift(c.s, 360, c.p), top: c.y, opacity: 0.9 }}>
          <g fill="#FFFFFF">
            <ellipse cx={110} cy={96} rx={92} ry={50} />
            <ellipse cx={186} cy={80} rx={74} ry={56} />
            <ellipse cx={244} cy={102} rx={66} ry={42} />
          </g>
        </svg>
      ))}
      {/* rolling hills behind the track */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${RAIL_Y - 40} Q ${width * 0.22} ${RAIL_Y - 168} ${width * 0.46} ${RAIL_Y - 54} T ${width} ${RAIL_Y - 96} L ${width} ${height} L 0 ${height} Z`} fill="#A5D6A7" opacity={0.85} />
        <path d={`M0 ${RAIL_Y + 6} Q ${width * 0.3} ${RAIL_Y - 74} ${width * 0.62} ${RAIL_Y + 12} T ${width} ${RAIL_Y - 22} L ${width} ${height} L 0 ${height} Z`} fill="#81C784" />
      </svg>
    </AbsoluteFill>
  );
};

// ── one carriage ─────────────────────────────────────────────────────────────
const Carriage: React.FC<{
  x: number; w: number; idx: number; label: boolean; labelLit: boolean;
  car: Car | null; color: string; lit: boolean;
}> = ({ x, w, idx, label, labelLit, car, color, lit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const jiggle = bob(frame, fps, 3, 0.9, idx * 0.6); // the whole train is always moving
  const litPop = lit ? 1 + 0.05 * Math.sin((frame / fps) * 6) : 1;

  const ROOF = 56; // coloured roof bar; the position plate sits ON it
  return (
    <div style={{ position: "absolute", left: x, top: BODY_TOP + jiggle, width: w, height: BODY_H, transform: `scale(${litPop})`, transformOrigin: "center bottom" }}>
      {/* coupling to the unit in front */}
      <div style={{ position: "absolute", left: -26, top: BODY_H - 92, width: 26, height: 14, background: "#546E7A", borderRadius: 7 }} />

      {/* roof */}
      <div
        style={{
          position: "absolute", left: -6, right: -6, top: 0, height: ROOF, borderRadius: 20,
          background: c, boxShadow: `0 8px 22px ${c}55`,
        }}
      />
      {/* body */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: ROOF - 12, bottom: 0, borderRadius: 24,
          background: lit ? tint(color, 0.82) : "#FFFFFF",
          border: `7px solid ${lit ? c : tint(color, 0.55)}`,
          boxShadow: lit ? `0 18px 46px ${c}55` : "0 12px 30px rgba(30,36,56,0.14)",
        }}
      />
      {/* the window — the content lives inside it, so a carriage always looks like a carriage */}
      <div
        style={{
          position: "absolute", left: 26, right: 26, top: ROOF + 34, bottom: 58, borderRadius: 20,
          background: lit ? "#FFFFFF" : "#F6F9FD",
          border: `5px solid ${tint(color, lit ? 0.4 : 0.62)}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.family, overflow: "hidden",
        }}
      >
        <SlotContent slot={car} color={color} />
      </div>
      {/* side tag ("before" / "after") — the narration names them, so show them */}
      {car?.tag && (
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
          <TagChip text={car.tag} />
        </div>
      )}
      {/* position plate, ON the roof — never in the headline band */}
      {label && (
        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)" }}>
          <PositionPlate idx={idx} lit={labelLit} color={color} />
        </div>
      )}
    </div>
  );
};


// ── the train ────────────────────────────────────────────────────────────────
export const WordTrain: React.FC<{
  data: PhonicsComparison;
  beats: Beat[];
  stateFor: (frame: number) => TrainState;
  showLabelsFrom: number;
  labelLitAt: [number, number, number];
  hideAt: number;
  // a magnifier glides along the carriages while the narration asks WHERE the sound sits.
  // A spotlight tint alone was too subtle — at feed scale the screen read as static.
  sweep?: { from: number; to: number };
}> = ({ data, beats, stateFor, showLabelsFrom, labelLitAt, hideAt, sweep }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const SAFE = safeX(width);
  const GAP = 24;
  const ENGINE_W = 250;
  const carW = (width - 2 * SAFE - ENGINE_W - 3 * GAP) / 3; // ≈ 452
  const xOf = (i: number) => SAFE + ENGINE_W + GAP + i * (carW + GAP);

  const { cars, litIdx } = stateFor(f);
  // No roll-in: frame 0 is the upload thumbnail and must be a complete cover. The train
  // is already in place; the motion comes from the wheels, sleepers, steam and bob.
  const trainX = 0;

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${trainX}px)` }}>
        {/* rails */}
        <div style={{ position: "absolute", left: 0, right: 0, top: RAIL_Y + WHEEL_R * 2 - 6, height: 10, background: "#8D6E63", borderRadius: 5 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: RAIL_Y + WHEEL_R * 2 + 10, height: 16, background: "#6D4C41", opacity: 0.5 }} />
        {/* sleepers scroll under the train — motion even when nothing else changes */}
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", top: RAIL_Y + WHEEL_R * 2 + 8, left: ((i * 92 - frame * 2.2) % (width + 120) + width + 120) % (width + 120) - 60, width: 46, height: 20, background: "#795548", borderRadius: 4, opacity: 0.55 }} />
        ))}

        {/* engine */}
        <Engine x={safeX(width)} w={ENGINE_W} />

        {/* carriages */}
        {[0, 1, 2].map((i) => (
          <Carriage
            key={i}
            x={xOf(i)}
            w={carW}
            idx={i}
            label={f >= showLabelsFrom}
            labelLit={f >= labelLitAt[i]}
            car={cars[i]}
            // Only the two OWNED carriages wear a team colour: middle = the mid spelling,
            // end = the end spelling. The beginning carriage is neutral — it belongs to
            // neither, and colouring it blue implied "ai lives here too".
            color={i === 0 ? NEUTRAL : i === 1 ? data.teams[0].colorHex : data.teams[1].colorHex}
            lit={litIdx === i}
          />
        ))}

        {/* the WHERE magnifier — glides across the three carriages and back */}
        {sweep && f >= sweep.from && f < sweep.to && (() => {
          const t = (f - sweep.from) / (sweep.to - sweep.from);
          const ping = (t * 2) % 2; // 0→1 across, 1→2 back
          const k = ping <= 1 ? ping : 2 - ping;
          const cx = xOf(0) + carW / 2 + k * (2 * (carW + GAP));
          const R = 132;
          return (
            <svg width={R * 2.4} height={R * 2.4} style={{ position: "absolute", left: cx - R * 1.2, top: BODY_TOP + BODY_H / 2 - R * 1.2 }}>
              <circle cx={R * 1.2} cy={R * 1.2} r={R} fill="#FFFFFF" opacity={0.22} />
              <circle cx={R * 1.2} cy={R * 1.2} r={R} fill="none" stroke="#D81B60" strokeWidth={14} />
              <line x1={R * 1.2 + R * 0.72} y1={R * 1.2 + R * 0.72} x2={R * 1.2 + R * 1.16} y2={R * 1.2 + R * 1.16} stroke="#D81B60" strokeWidth={20} strokeLinecap="round" />
            </svg>
          );
        })()}

        {/* wheels ride under every unit, always turning */}
        {[safeX(width) + 60, safeX(width) + 168, ...[0, 1, 2].flatMap((i) => [xOf(i) + carW * 0.24, xOf(i) + carW * 0.76])].map((wx, i) => (
          <Wheel key={i} x={wx} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Wheel: React.FC<{ x: number }> = ({ x }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={WHEEL_R * 2} height={WHEEL_R * 2} style={{ position: "absolute", left: x - WHEEL_R, top: RAIL_Y }}>
      <circle cx={WHEEL_R} cy={WHEEL_R} r={WHEEL_R - 2} fill="#37474F" />
      <circle cx={WHEEL_R} cy={WHEEL_R} r={WHEEL_R * 0.42} fill="#90A4AE" />
      <g transform={`rotate(${frame * 6} ${WHEEL_R} ${WHEEL_R})`}>
        <line x1={WHEEL_R} y1={7} x2={WHEEL_R} y2={WHEEL_R * 2 - 7} stroke="#CFD8DC" strokeWidth={5} />
        <line x1={7} y1={WHEEL_R} x2={WHEEL_R * 2 - 7} y2={WHEEL_R} stroke="#CFD8DC" strokeWidth={5} />
      </g>
    </svg>
  );
};

const Engine: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jiggle = bob(frame, fps, 3, 0.9);
  return (
    <div style={{ position: "absolute", left: x, top: BODY_TOP + jiggle, width: w, height: BODY_H }}>
      {/* steam puffs — continuous motion above the funnel, inside the stage band */}
      {Array.from({ length: 5 }).map((_, i) => {
        const t = ((frame * 1.7 + i * 22) % 110) / 110;
        return (
          <div key={i} style={{ position: "absolute", left: w * 0.24 - 22 + t * 46, top: 6 - t * 74, width: 26 + t * 46, height: 26 + t * 46, borderRadius: "50%", background: "#FFFFFF", opacity: (1 - t) * 0.62 }} />
        );
      })}
      <div style={{ position: "absolute", inset: 0, top: 62, borderRadius: 28, background: "#EF5350", border: "8px solid #C62828", boxShadow: "0 14px 34px rgba(198,40,40,0.34)" }} />
      {/* funnel */}
      <div style={{ position: "absolute", left: w * 0.16, top: 22, width: 62, height: 62, background: "#C62828", borderRadius: 10 }} />
      {/* cab window with the mascot driving */}
      <div style={{ position: "absolute", right: 22, top: 96, width: w * 0.42, height: 132, background: "#FFF3E0", borderRadius: 18, border: "6px solid #C62828", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Img src={staticFile("mascot.png")} style={{ width: "94%", transform: `translateY(${16 + bob(frame, fps, 4, 1.6)}px) rotate(${wiggle(frame, fps, 2, 2.2)}deg)` }} />
      </div>
    </div>
  );
};
