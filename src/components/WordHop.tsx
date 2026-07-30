import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { hex, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";
import { PositionPlate, Slot, SlotContent, SlotState, TagChip, hopInfo, slotColor } from "./PositionSlot";

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

const PAD_RY = 52;

// Band table per aspect. The 16:9 numbers are the originals and must not move.
//
// The whole pond — plate, card, pad, waterline — occupied y316…712, i.e. the top 53% of a
// 1350-tall frame, leaving 644px (48%) of empty water with the caption floating in it.
// Portrait drops the pond and grows the card, so the extra height is split between the sky
// above (where the headline sits) and the water below, instead of all going to water.
//
// The relationships are preserved, not re-guessed:
//   cardTop + cardH sits 4px above the pad top (padCY - PAD_RY)  -> the card rests ON the pad
//   waterTop - (padCY - PAD_RY) == 98                            -> pads float the same way
export const pondBands = (width: number, height: number) => {
  const ratio = height / width;
  if (ratio > 1.5) return { plateTop: 700, cardTop: 756, cardH: 320, padCY: 1124, waterTop: 1170, bankW: 170, gap: 14 }; // 9:16
  if (ratio > 1) return { plateTop: 410, cardTop: 466, cardH: 300, padCY: 814, waterTop: 860, bankW: 170, gap: 16 };     // 4:5
  return { plateTop: 316, cardTop: 372, cardH: 240, padCY: 660, waterTop: 706, bankW: 250, gap: 24 };                    // 16:9
};
const HOP_FRAMES = 13;

// ── the sky/water the whole video sits on (persistent, absolute frame) ───────
export const PondSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const B = pondBands(width, height);
  const drift = (speed: number, span: number, phase: number) => ((frame * speed + phase) % (width + span)) - span;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFE0B2 0%, #FFF3E0 34%, #FFEBC4 62%, #FFD59E 100%)" }}>
      {/* low evening sun — top-LEFT, clear of the top-right brand mark */}
      <svg width={300} height={300} style={{ position: "absolute", left: 26, top: 52 }}>
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
        <svg key={i} width={90} height={260} style={{ position: "absolute", left: x - 45, top: B.waterTop - 210, transform: `rotate(${wiggle(frame, 30, 3 + (i % 3), 2.4, i)}deg)`, transformOrigin: "bottom center" }}>
          <line x1={45} y1={260} x2={45} y2={40} stroke="#7CB342" strokeWidth={9} strokeLinecap="round" />
          <ellipse cx={45} cy={30} rx={13} ry={32} fill="#8D6E63" />
          <line x1={45} y1={150} x2={16} y2={104} stroke="#8BC34A" strokeWidth={7} strokeLinecap="round" />
        </svg>
      ))}

      {/* the pond */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${B.waterTop + 14} Q ${width * 0.5} ${B.waterTop - 26} ${width} ${B.waterTop + 10} L ${width} ${height} L 0 ${height} Z`} fill="#4DB6AC" opacity={0.9} />
        <path d={`M0 ${B.waterTop + 62} Q ${width * 0.42} ${B.waterTop + 22} ${width} ${B.waterTop + 58} L ${width} ${height} L 0 ${height} Z`} fill="#26A69A" opacity={0.75} />
        {/* ripple lines, always travelling */}
        {Array.from({ length: 7 }).map((_, i) => {
          const y = B.waterTop + 96 + i * 30;
          const off = ((frame * (0.8 + i * 0.18) + i * 120) % (width + 300)) - 150;
          return <path key={i} d={`M${off} ${y} q 40 -11 80 0 t 80 0`} fill="none" stroke="#B2DFDB" strokeWidth={5} strokeLinecap="round" opacity={0.5} />;
        })}
      </svg>

      {/* leaves and petals drifting downstream, so the open water is never a dead field */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const x = ((frame * (0.55 + i * 0.09) + i * 230) % (width + 220)) - 110;
          const y = B.waterTop + 108 + (i % 5) * 46;
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

// ── one lily pad ─────────────────────────────────────────────────────────────
const Pad: React.FC<{
  cx: number; w: number; idx: number; label: boolean; labelLit: boolean;
  slot: Slot | null; color: string; lit: boolean; sweeping: boolean;
}> = ({ cx, w, idx, label, labelLit, slot, color, lit, sweeping }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = pondBands(width, height);
  const c = hex(color);
  const float = bob(frame, fps, 4 + idx * 0.4, 4.2, idx * 0.7); // every pad always floating
  const cardW = w * 0.78;
  const rx = w / 2;

  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: 0, width: w, height: 900, pointerEvents: "none" }}>
      {/* the pad, riding the water */}
      <svg width={w + 40} height={200} style={{ position: "absolute", left: -20, top: B.padCY - 100 + float }}>
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
      <svg width={70} height={70} style={{ position: "absolute", left: w - 46, top: B.padCY - 46 + float }}>
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <ellipse key={i} cx={35} cy={35} rx={9 + 2 * Math.sin((frame / fps) * 2 + i)} ry={20} fill="#F8BBD0" transform={`rotate(${a} 35 35)`} opacity={0.9} />
        ))}
        <circle cx={35} cy={35} r={8} fill="#FFF176" />
      </svg>

      {/* the slot card — a rounded bubble resting on the pad */}
      <div
        style={{
          position: "absolute", left: (w - cardW) / 2, top: B.cardTop + float, width: cardW, height: B.cardH,
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
        <div style={{ position: "absolute", left: 0, right: 0, top: B.cardTop + B.cardH + 8 + float, display: "flex", justifyContent: "center" }}>
          <TagChip text={slot.tag} />
        </div>
      )}

      {/* position plate, on a stake pushed into the pad */}
      {label && (
        <>
          <div style={{ position: "absolute", left: w / 2 - 4, top: B.plateTop + 34, width: 8, height: B.cardTop - B.plateTop - 30, background: "#8D6E63", borderRadius: 4, opacity: 0.9 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: B.plateTop + float * 0.4, display: "flex", justifyContent: "center" }}>
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
  const { width, height, fps } = useVideoConfig();
  const B = pondBands(width, height);
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const SAFE = safeX(width);
  const padW = (width - 2 * SAFE - B.bankW - 3 * B.gap) / 3;
  const cxOf = (i: number) => SAFE + B.bankW + B.gap + i * (padW + B.gap) + padW / 2;

  const { cars, litIdx } = stateFor(f);
  const { cur, prev, t } = hopInfo(stateFor, f, HOP_FRAMES);
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
  // its head through the card. B.cardTop + B.cardH = 612 is the line it must stay under.
  const frogY = B.padCY + 42 - arc + bob(frame, fps, 4, 3);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* the mascot watching from its own big pad, where the train kept its engine */}
      <MascotPad x={SAFE} w={B.bankW} />

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
  const { fps, width, height } = useVideoConfig();
  const B = pondBands(width, height);
  const float = bob(frame, fps, 3.4, 5);
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 900 }}>
      <svg width={w + 30} height={190} style={{ position: "absolute", left: -15, top: B.padCY - 96 + float }}>
        <ellipse cx={w / 2 + 15} cy={96} rx={w / 2} ry={PAD_RY + 6} fill="#7CB342" />
        <ellipse cx={w / 2 + 15} cy={90} rx={w / 2 - 10} ry={PAD_RY - 2} fill="#8BC34A" />
        <path d={`M${w / 2 + 15} 90 l ${-(w / 2 - 24)} -9 l 0 18 Z`} fill="#F1F8E9" opacity={0.4} />
      </svg>
      {/* SITS ON the pad, derived — not a fixed offset. `padCY - 250` was tuned for the
          16:9 mascot (bankW 250 -> 200px wide); portrait's is 136px wide, so the same
          offset left him hanging 41px ABOVE the leaf. mascot.png is 923x1063 with only 7px
          of bottom padding, so its feet are effectively the last pixel row and the full
          height is the right thing to measure from. FEET_INTO_PAD reproduces the 16:9
          placement exactly (608 + 32 - 230 = 410, which is what -250 gave). */}
      {(() => {
        const mw = w * 0.8;
        const mh = mw * (1063 / 923);
        const FEET_INTO_PAD = 32;
        const top = B.padCY - PAD_RY + FEET_INTO_PAD - mh;
        return (
          <Img
            src={staticFile("mascot.png")}
            style={{ position: "absolute", left: w * 0.1, top: top + float, width: mw, transform: `rotate(${wiggle(frame, fps, 2.4, 2.6)}deg)`, transformOrigin: "bottom center" }}
          />
        );
      })()}
    </div>
  );
};
