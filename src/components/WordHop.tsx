import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { hex, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";
import { PositionPlate, Slot, SlotContent, SlotState, TagChip, slotColor } from "./PositionSlot";

// ── The Lily Pond — the oi/oy set ────────────────────────────────────────────
// Same lesson as ai/ay (position decides the spelling), deliberately NOT the same show.
// The recorded recap line is "oi sits in the middle, oy JUMPS to the end", so the set
// acts that verb out: three lily pads are the three positions, and a frog HOPS to
// whichever position the narration is naming. The hop is the spotlight.
//
// LAYOUT LAW (LandscapeBeatKit): everything lives in the STAGE band y 300…860 — never
// the headline band (0…290), never the caption band (880…1080).
//
//   316…360  position plate on its stake
//   372…612  the bubble card (the slot window)
//   608…712  the pad itself, the card resting on it
//   625…740  the frog, in FRONT of the pad and BELOW the card — no overlap
//   712…860  water

const PLATE_TOP = 316;
const CARD_TOP = 372;
const CARD_H = 240;
const PAD_CY = 660; // pad centre; ry 52 → 608…712, so the card sits ON the pad
const PAD_RY = 52;
const WATER_TOP = 706;
const BANK_W = 250; // the mascot's own pad, mirroring the train's engine slot
const GAP = 24;
const HOP_FRAMES = 13;

// ── the sky/water the whole video sits on (persistent, absolute frame) ───────
export const PondSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (speed: number, span: number, phase: number) => ((frame * speed + phase) % (width + span)) - span;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFE0B2 0%, #FFF3E0 34%, #FFEBC4 62%, #FFD59E 100%)" }}>
      {/* low evening sun */}
      <svg width={300} height={300} style={{ position: "absolute", left: width - 340, top: 56 }}>
        <g transform="translate(150 150)">
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i * (360 / 14) + frame * 0.2) * (Math.PI / 180);
            return <line key={i} x1={Math.cos(a) * 92} y1={Math.sin(a) * 92} x2={Math.cos(a) * 124} y2={Math.sin(a) * 124} stroke="#FFB74D" strokeWidth={10} strokeLinecap="round" opacity={0.6} />;
          })}
          <circle cx={0} cy={0} r={80} fill="#FFCC80" />
        </g>
      </svg>

      {/* drifting clouds, warmer and softer than the railway's */}
      {[{ s: 0.2, y: 74, k: 0.9, p: 0 }, { s: 0.13, y: 162, k: 0.66, p: 780 }, { s: 0.26, y: 34, k: 0.5, p: 1440 }].map((c, i) => (
        <svg key={i} width={340 * c.k} height={150 * c.k} viewBox="0 0 340 150" style={{ position: "absolute", left: drift(c.s, 360, c.p), top: c.y, opacity: 0.78 }}>
          <g fill="#FFFDF7">
            <ellipse cx={110} cy={96} rx={92} ry={50} />
            <ellipse cx={186} cy={80} rx={74} ry={56} />
            <ellipse cx={244} cy={102} rx={66} ry={42} />
          </g>
        </svg>
      ))}

      {/* reed beds on both banks, swaying */}
      {[80, 150, 210, width - 130, width - 66].map((x, i) => (
        <svg key={i} width={90} height={260} style={{ position: "absolute", left: x - 45, top: WATER_TOP - 210, transform: `rotate(${wiggle(frame, 30, 3 + (i % 3), 2.4, i)}deg)`, transformOrigin: "bottom center" }}>
          <line x1={45} y1={260} x2={45} y2={40} stroke="#7CB342" strokeWidth={9} strokeLinecap="round" />
          <ellipse cx={45} cy={30} rx={13} ry={32} fill="#8D6E63" />
          <line x1={45} y1={150} x2={16} y2={104} stroke="#8BC34A" strokeWidth={7} strokeLinecap="round" />
        </svg>
      ))}

      {/* the pond */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${WATER_TOP + 14} Q ${width * 0.5} ${WATER_TOP - 26} ${width} ${WATER_TOP + 10} L ${width} ${height} L 0 ${height} Z`} fill="#4DB6AC" opacity={0.9} />
        <path d={`M0 ${WATER_TOP + 62} Q ${width * 0.42} ${WATER_TOP + 22} ${width} ${WATER_TOP + 58} L ${width} ${height} L 0 ${height} Z`} fill="#26A69A" opacity={0.75} />
        {/* ripple lines, always travelling */}
        {Array.from({ length: 7 }).map((_, i) => {
          const y = WATER_TOP + 96 + i * 30;
          const off = ((frame * (0.8 + i * 0.18) + i * 120) % (width + 300)) - 150;
          return <path key={i} d={`M${off} ${y} q 40 -11 80 0 t 80 0`} fill="none" stroke="#B2DFDB" strokeWidth={5} strokeLinecap="round" opacity={0.5} />;
        })}
      </svg>

      {/* leaves and petals drifting downstream, so the open water is never a dead field */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const x = ((frame * (0.55 + i * 0.09) + i * 230) % (width + 220)) - 110;
          const y = WATER_TOP + 108 + (i % 5) * 46;
          const spin = frame * (0.5 + i * 0.1) + i * 40;
          return i % 3 === 0 ? (
            <g key={i} transform={`translate(${x} ${y}) rotate(${spin})`}>
              <ellipse cx={0} cy={0} rx={26} ry={15} fill="#81C784" opacity={0.75} />
              <line x1={-20} y1={0} x2={20} y2={0} stroke="#558B2F" strokeWidth={2} opacity={0.5} />
            </g>
          ) : (
            <ellipse key={i} cx={x} cy={y} rx={11} ry={7} fill="#F8BBD0" opacity={0.7} transform={`rotate(${spin} ${x} ${y})`} />
          );
        })}
      </svg>

      {/* NOTE: dragonflies were tried here and cut — at this scale the wings read as purple
          capsules floating near the headline. The pond already moves plenty: reeds, pads,
          ripples, drifting leaves, the lily flowers and the frog itself. */}
    </AbsoluteFill>
  );
};

// ── which pad is lit, and how long ago it changed ────────────────────────────
// Remotion renders one frame at a time with no state, so the hop is derived by walking
// stateFor backwards to the frame the lit pad last changed. Cheap (stateFor is pure
// comparisons) and it means the hop is never out of sync with the narration.
const litOf = (stateFor: (f: number) => SlotState, f: number) => stateFor(f).litIdx ?? -1;

const hopInfo = (stateFor: (f: number) => SlotState, f: number, look = 150) => {
  const cur = litOf(stateFor, f);
  let changedAt = f - look;
  for (let k = 1; k <= look; k++) {
    if (litOf(stateFor, f - k) !== cur) {
      changedAt = f - k + 1;
      break;
    }
  }
  const prev = litOf(stateFor, changedAt - 1);
  const t = Math.min(1, Math.max(0, (f - changedAt) / HOP_FRAMES));
  return { cur, prev: prev < 0 ? cur : prev, t };
};

// ── one lily pad ─────────────────────────────────────────────────────────────
const Pad: React.FC<{
  cx: number; w: number; idx: number; label: boolean; labelLit: boolean;
  slot: Slot | null; color: string; lit: boolean; sweeping: boolean;
}> = ({ cx, w, idx, label, labelLit, slot, color, lit, sweeping }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const float = bob(frame, fps, 4 + idx * 0.4, 4.2, idx * 0.7); // every pad always floating
  const cardW = w * 0.78;
  const rx = w / 2;

  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: 0, width: w, height: 900, pointerEvents: "none" }}>
      {/* the pad, riding the water */}
      <svg width={w + 40} height={200} style={{ position: "absolute", left: -20, top: PAD_CY - 100 + float }}>
        <ellipse cx={rx + 20} cy={100} rx={rx} ry={PAD_RY} fill={lit ? "#66BB6A" : "#7CB342"} />
        <ellipse cx={rx + 20} cy={94} rx={rx - 10} ry={PAD_RY - 8} fill={lit ? "#81C784" : "#8BC34A"} />
        {/* the notch + veins that make it read as a lily pad, not a green oval */}
        <path d={`M${rx + 20} 94 l ${rx - 26} -9 l 0 18 Z`} fill="#F1F8E9" opacity={0.4} />
        {[-0.6, -0.3, 0, 0.3, 0.6].map((k, i) => (
          <line key={i} x1={rx + 20} y1={94} x2={rx + 20 + Math.cos(Math.PI + k) * (rx - 22)} y2={94 + Math.sin(Math.PI + k) * (PAD_RY - 12)} stroke="#558B2F" strokeWidth={3} opacity={0.4} />
        ))}
        {/* the ripple the pad makes, and the search ripple while the frog is hunting */}
        <ellipse cx={rx + 20} cy={132} rx={rx * (0.7 + 0.05 * Math.sin((frame / fps) * 3 + idx))} ry={14} fill="none" stroke="#B2DFDB" strokeWidth={4} opacity={0.5} />
        {sweeping && lit && (
          <ellipse cx={rx + 20} cy={132} rx={rx * (0.5 + 0.5 * (((frame % 26) / 26))) } ry={20} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.7 * (1 - (frame % 26) / 26)} />
        )}
      </svg>

      {/* a lily flower on the pad's rim, opening and closing */}
      <svg width={70} height={70} style={{ position: "absolute", left: w - 46, top: PAD_CY - 46 + float }}>
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <ellipse key={i} cx={35} cy={35} rx={9 + 2 * Math.sin((frame / fps) * 2 + i)} ry={20} fill="#F8BBD0" transform={`rotate(${a} 35 35)`} opacity={0.9} />
        ))}
        <circle cx={35} cy={35} r={8} fill="#FFF176" />
      </svg>

      {/* the slot card — a rounded bubble resting on the pad */}
      <div
        style={{
          position: "absolute", left: (w - cardW) / 2, top: CARD_TOP + float, width: cardW, height: CARD_H,
          borderRadius: 34,
          background: lit ? tint(color, 0.86) : "#FFFFFFF2",
          border: `7px solid ${lit ? c : tint(color, 0.5)}`,
          boxShadow: lit ? `0 20px 46px ${c}55` : "0 14px 32px rgba(30,36,56,0.16)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", fontFamily: font.family,
          transform: `scale(${lit ? 1 + 0.04 * Math.sin((frame / fps) * 6) : 1})`,
          transformOrigin: "center bottom",
        }}
      >
        <SlotContent slot={slot} color={color} scale={0.92} />
      </div>

      {/* "⬅ before" / "after ➡", right under the card the narration is talking about */}
      {slot?.tag && (
        <div style={{ position: "absolute", left: 0, right: 0, top: CARD_TOP + CARD_H + 8 + float, display: "flex", justifyContent: "center" }}>
          <TagChip text={slot.tag} />
        </div>
      )}

      {/* position plate, on a stake pushed into the pad */}
      {label && (
        <>
          <div style={{ position: "absolute", left: w / 2 - 4, top: PLATE_TOP + 34, width: 8, height: CARD_TOP - PLATE_TOP - 30, background: "#8D6E63", borderRadius: 4, opacity: 0.9 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: PLATE_TOP + float * 0.4, display: "flex", justifyContent: "center" }}>
            <PositionPlate idx={idx} lit={labelLit} color={color} />
          </div>
        </>
      )}
    </div>
  );
};

// ── the frog: the spotlight, mid-hop ─────────────────────────────────────────
const Frog: React.FC<{ x: number; y: number; squash: number; airborne: boolean }> = ({ x, y, squash, airborne }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = 1 + 0.04 * Math.sin((frame / fps) * 4);
  const blink = (frame + 40) % 96 < 5 ? 0.15 : 1; // a still frog still blinks — but never on frame 0
  return (
    <svg width={190} height={150} style={{ position: "absolute", left: x - 95, top: y - 118, overflow: "visible" }}>
      <g transform={`translate(95 110) scale(${squash * 1} ${(2 - squash) * breathe})`}>
        {/* back legs, tucked in flight and splayed at rest */}
        <ellipse cx={-52} cy={4} rx={26} ry={airborne ? 11 : 14} fill="#43A047" transform={`rotate(${airborne ? -24 : -8})`} />
        <ellipse cx={52} cy={4} rx={26} ry={airborne ? 11 : 14} fill="#43A047" transform={`rotate(${airborne ? 24 : 8})`} />
        {/* body */}
        <ellipse cx={0} cy={-16} rx={54} ry={44} fill="#66BB6A" />
        <ellipse cx={0} cy={-2} rx={36} ry={24} fill="#C5E1A5" opacity={0.85} />
        {/* eyes on top, the way a frog's are */}
        {[-26, 26].map((ex, i) => (
          <g key={i}>
            <circle cx={ex} cy={-52} r={17} fill="#66BB6A" />
            <circle cx={ex} cy={-54} r={12} fill="#FFFFFF" />
            <ellipse cx={ex + 2} cy={-54} rx={6} ry={6 * blink} fill="#1B2430" />
          </g>
        ))}
        {/* mouth */}
        <path d="M-18 -8 q 18 14 36 0" fill="none" stroke="#2E7D32" strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ── the pond set ─────────────────────────────────────────────────────────────
export const WordHop: React.FC<{
  data: PhonicsComparison;
  stateFor: (frame: number) => SlotState;
  showLabelsFrom: number;
  labelLitAt: [number, number, number];
  hideAt: number;
  // while the narration asks WHERE the sound sits, the frog hunts pad to pad and each
  // landing throws a ring of water — the "is it here? is it here?" beat.
  sweep?: { from: number; to: number };
}> = ({ data, stateFor, showLabelsFrom, labelLitAt, hideAt, sweep }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const SAFE = safeX(width);
  const padW = (width - 2 * SAFE - BANK_W - 3 * GAP) / 3;
  const cxOf = (i: number) => SAFE + BANK_W + GAP + i * (padW + GAP) + padW / 2;

  const { cars, litIdx } = stateFor(f);
  const { cur, prev, t } = hopInfo(stateFor, f);
  const sweeping = !!sweep && f >= sweep.from && f < sweep.to;

  // the hop: horizontal ease with a parabolic arc, squashing on take-off and landing
  const fromX = cxOf(Math.max(0, prev));
  const toX = cxOf(Math.max(0, cur));
  const ease = t * t * (3 - 2 * t);
  const frogX = fromX + (toX - fromX) * ease;
  const arc = Math.sin(Math.PI * t) * (prev === cur ? 0 : 96);
  const airborne = t > 0.08 && t < 0.92 && prev !== cur;
  const squash = airborne ? 1.08 : 1 - 0.1 * Math.sin(Math.PI * Math.min(1, t / 0.12));
  // the frog's art reaches ~77px above this anchor, so anchoring it at the pad centre drew
  // its head through the card. CARD_TOP + CARD_H = 612 is the line it must stay under.
  const frogY = PAD_CY + 42 - arc + bob(frame, fps, 4, 3);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* the mascot watching from its own big pad, where the train kept its engine */}
      <MascotPad x={SAFE} w={BANK_W} />

      {[0, 1, 2].map((i) => (
        <Pad
          key={i}
          cx={cxOf(i)}
          w={padW}
          idx={i}
          label={f >= showLabelsFrom}
          labelLit={f >= labelLitAt[i]}
          slot={cars[i]}
          color={slotColor(i, data)}
          lit={litIdx === i}
          sweeping={sweeping}
        />
      ))}

      {/* the frog rides above the pads, below the cards */}
      {litIdx !== undefined && litIdx >= 0 && <Frog x={frogX} y={frogY} squash={squash} airborne={airborne} />}
    </AbsoluteFill>
  );
};

const MascotPad: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const float = bob(frame, fps, 3.4, 5);
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 900 }}>
      <svg width={w + 30} height={190} style={{ position: "absolute", left: -15, top: PAD_CY - 96 + float }}>
        <ellipse cx={w / 2 + 15} cy={96} rx={w / 2} ry={PAD_RY + 6} fill="#7CB342" />
        <ellipse cx={w / 2 + 15} cy={90} rx={w / 2 - 10} ry={PAD_RY - 2} fill="#8BC34A" />
        <path d={`M${w / 2 + 15} 90 l ${-(w / 2 - 24)} -9 l 0 18 Z`} fill="#F1F8E9" opacity={0.4} />
      </svg>
      <Img
        src={staticFile("mascot.png")}
        style={{ position: "absolute", left: w * 0.1, top: PAD_CY - 250 + float, width: w * 0.8, transform: `rotate(${wiggle(frame, fps, 2.4, 2.6)}deg)` }}
      />
    </div>
  );
};
