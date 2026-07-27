import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { hex, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";
import { PositionPlate, Slot, SlotContent, SlotState, TagChip, slotColor } from "./PositionSlot";

// ── The Open Sea — the oa/ow set ─────────────────────────────────────────────
// Third show, third world. The recorded recap line is "oa SAILS in the middle, ow ROLLS
// to the end", so the sea does both: three rafts are the three positions, one long swell
// runs through all of them (nothing on this screen is ever still), and a foam crest ROLLS
// left→right whenever the narration is hunting for the sound's position.
//
// LAYOUT LAW (LandscapeBeatKit): STAGE band y 300…860 only.
//
//   316…360  position pennant on the mast
//   372…612  the slot card
//   616…664  the raft deck, the card standing on it
//   636…860  sea, starting right at the deck
//
// The swell is a single function of x and time, so the rafts read as three points on ONE
// wave rather than three things bobbing independently.

const PLATE_TOP = 316;
const CARD_TOP = 372;
const CARD_H = 240;
const DECK_Y = 616;
const SEA_TOP = 636; // the water meets the deck — a gap here left the rafts floating on sand
const BOAT_W = 250; // the mascot's dock, where the train kept its engine
const GAP = 24;

const swell = (x: number, frame: number) => Math.sin(x / 250 - frame * 0.055) * 13;

// ── the sea the whole video sits on (persistent, absolute frame) ─────────────
export const OceanSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (speed: number, span: number, phase: number) => ((frame * speed + phase) % (width + span)) - span;
  const band = (y: number, amp: number, len: number, speed: number, fill: string, op: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= width; x += 40) pts.push(`${x} ${(y + Math.sin(x / len - frame * speed) * amp).toFixed(1)}`);
    return <path d={`M0 ${y} L${pts.join(" L")} L${width} ${height} L0 ${height} Z`} fill={fill} opacity={op} />;
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #B3E5FC 0%, #E1F5FE 40%, #FFF8E1 66%, #FFECB3 100%)" }}>
      {/* sun low over the water — top-LEFT, clear of the top-right brand mark */}
      <svg width={280} height={280} style={{ position: "absolute", left: 36, top: 44 }}>
        <g transform="translate(140 140)">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 - frame * 0.22) * (Math.PI / 180);
            return <line key={i} x1={Math.cos(a) * 86} y1={Math.sin(a) * 86} x2={Math.cos(a) * 116} y2={Math.sin(a) * 116} stroke="#FFE082" strokeWidth={9} strokeLinecap="round" opacity={0.7} />;
          })}
          <circle cx={0} cy={0} r={76} fill="#FFF59D" />
        </g>
      </svg>

      {/* clouds */}
      {[{ s: 0.22, y: 84, k: 0.95, p: 0 }, { s: 0.15, y: 170, k: 0.7, p: 820 }, { s: 0.28, y: 38, k: 0.52, p: 1500 }].map((c, i) => (
        <svg key={i} width={340 * c.k} height={150 * c.k} viewBox="0 0 340 150" style={{ position: "absolute", left: drift(c.s, 360, c.p), top: c.y, opacity: 0.88 }}>
          <g fill="#FFFFFF">
            <ellipse cx={110} cy={96} rx={92} ry={50} />
            <ellipse cx={186} cy={80} rx={74} ry={56} />
            <ellipse cx={244} cy={102} rx={66} ry={42} />
          </g>
        </svg>
      ))}

      {/* gulls, wings actually flapping */}
      {[0, 1, 2].map((i) => {
        const x = drift(0.5 + i * 0.12, 200, i * 620);
        const y = 150 + i * 46 + Math.sin(frame / 26 + i) * 14;
        const w = 16 + Math.abs(Math.sin(frame / 5 + i)) * 16;
        return (
          <svg key={i} width={110} height={60} style={{ position: "absolute", left: x, top: y, opacity: 0.7 }}>
            <path d={`M10 30 q 26 ${-w} 44 0 q 18 ${-w} 44 0`} fill="none" stroke="#546E7A" strokeWidth={5} strokeLinecap="round" />
          </svg>
        );
      })}

      {/* the sea: three travelling bands, so the horizon is never static */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {band(SEA_TOP + 6, 12, 260, 0.055, "#4FC3F7", 0.9)}
        {band(SEA_TOP + 58, 15, 200, 0.075, "#29B6F6", 0.85)}
        {band(SEA_TOP + 128, 18, 165, 0.095, "#0288D1", 0.8)}
        {/* a fish breaching in the open water, clear of the caption band */}
        {(() => {
          const cycle = 150;
          const t = (frame % cycle) / cycle;
          if (t > 0.42) return null;
          const k = t / 0.42;
          const x = 300 + ((Math.floor(frame / cycle) * 517) % (width - 700));
          const y = 812 - Math.sin(Math.PI * k) * 92;
          const rot = -46 + k * 92;
          return (
            <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={0.9}>
              <ellipse cx={0} cy={0} rx={34} ry={17} fill="#FF7043" />
              <ellipse cx={-6} cy={-4} rx={22} ry={9} fill="#FF8A65" />
              <path d="M28 0 L52 -16 L52 16 Z" fill="#FF5722" />
              <circle cx={-20} cy={-4} r={4} fill="#FFFFFF" />
              <circle cx={-21} cy={-4} r={2} fill="#263238" />
            </g>
          );
        })()}
        {/* foam flecks riding the surface */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = ((frame * (1.1 + i * 0.12) + i * 170) % (width + 200)) - 100;
          const y = SEA_TOP + 30 + (i % 6) * 38 + Math.sin(x / 220 - frame * 0.06) * 12;
          return <ellipse key={i} cx={x} cy={y} rx={26} ry={5} fill="#E1F5FE" opacity={0.55} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── one raft ─────────────────────────────────────────────────────────────────
const Raft: React.FC<{
  cx: number; w: number; idx: number; label: boolean; labelLit: boolean;
  slot: Slot | null; color: string; lit: boolean; lift: number;
}> = ({ cx, w, idx, label, labelLit, slot, color, lit, lift }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  // one swell for the whole sea, sampled at this raft's x — plus the crest's extra lift
  const rise = swell(cx, frame) - lift;
  const tilt = (swell(cx + 90, frame) - swell(cx - 90, frame)) * 0.14;
  const cardW = w * 0.78;

  return (
    <div
      style={{ position: "absolute", left: cx - w / 2, top: rise, width: w, height: 900, transform: `rotate(${tilt}deg)`, transformOrigin: `center ${DECK_Y}px`, pointerEvents: "none" }}
    >
      {/* the slot card, standing on the deck */}
      <div
        style={{
          position: "absolute", left: (w - cardW) / 2, top: CARD_TOP, width: cardW, height: CARD_H,
          borderRadius: 30,
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

      {/* the deck: planks + the barrels holding it up */}
      <svg width={w} height={130} style={{ position: "absolute", left: 0, top: DECK_Y - 8 }}>
        <rect x={6} y={8} width={w - 12} height={26} rx={9} fill="#A1887F" />
        <rect x={6} y={8} width={w - 12} height={11} rx={6} fill="#BCAAA4" />
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={18 + i * ((w - 36) / 6)} y1={9} x2={18 + i * ((w - 36) / 6)} y2={33} stroke="#8D6E63" strokeWidth={3} opacity={0.7} />
        ))}
        {[0.22, 0.78].map((k, i) => (
          <ellipse key={i} cx={w * k} cy={44} rx={30} ry={13} fill="#795548" opacity={0.9} />
        ))}
        {/* the raft's own wash */}
        <ellipse cx={w / 2} cy={62 + 3 * Math.sin((frame / fps) * 3 + idx)} rx={w * 0.42} ry={11} fill="#E1F5FE" opacity={0.5} />
      </svg>

      {/* "⬅ before" / "after ➡" */}
      {slot?.tag && (
        <div style={{ position: "absolute", left: 0, right: 0, top: CARD_TOP + CARD_H + 10, display: "flex", justifyContent: "center" }}>
          <TagChip text={slot.tag} />
        </div>
      )}

      {/* mast + pennant carrying the position name */}
      {label && (
        <>
          <div style={{ position: "absolute", left: w / 2 - 4, top: PLATE_TOP + 30, width: 8, height: CARD_TOP - PLATE_TOP - 26, background: "#8D6E63", borderRadius: 4 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: PLATE_TOP, display: "flex", justifyContent: "center", transform: `rotate(${wiggle(frame, fps, 3, 1.6, idx)}deg)`, transformOrigin: "center left" }}>
            <PositionPlate idx={idx} lit={labelLit} color={color} />
          </div>
        </>
      )}
    </div>
  );
};

// ── the sea set ──────────────────────────────────────────────────────────────
export const WordWaves: React.FC<{
  data: PhonicsComparison;
  stateFor: (frame: number) => SlotState;
  showLabelsFrom: number;
  labelLitAt: [number, number, number];
  hideAt: number;
  // a foam crest ROLLS through the rafts while the narration hunts for the position —
  // the same beat the train swept with a magnifier and the pond hopped with a frog.
  sweep?: { from: number; to: number };
}> = ({ data, stateFor, showLabelsFrom, labelLitAt, hideAt, sweep }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const SAFE = safeX(width);
  const raftW = (width - 2 * SAFE - BOAT_W - 3 * GAP) / 3;
  const cxOf = (i: number) => SAFE + BOAT_W + GAP + i * (raftW + GAP) + raftW / 2;

  const { cars, litIdx } = stateFor(f);

  // the rolling crest: a travelling bump that lifts whatever raft it is under
  const rolling = !!sweep && f >= sweep.from && f < sweep.to;
  const crestX = rolling ? interpolate(((f - sweep!.from) % 78) / 78, [0, 1], [SAFE + BOAT_W, width - SAFE]) : -9999;
  const liftAt = (x: number) => {
    const d = Math.abs(x - crestX);
    const fromCrest = d < 260 ? Math.cos((d / 260) * (Math.PI / 2)) * 30 : 0;
    return fromCrest;
  };

  return (
    <AbsoluteFill style={{ opacity }}>
      <MascotDock x={SAFE} w={BOAT_W} />

      {[0, 1, 2].map((i) => (
        <Raft
          key={i}
          cx={cxOf(i)}
          w={raftW}
          idx={i}
          label={f >= showLabelsFrom}
          labelLit={f >= labelLitAt[i]}
          slot={cars[i]}
          color={slotColor(i, data)}
          lit={litIdx === i}
          // the lit raft rides a little higher, and the rolling crest lifts as it passes
          lift={(litIdx === i ? 16 + 3 * Math.sin((f / fps) * 5) : 0) + liftAt(cxOf(i))}
        />
      ))}

      {/* the roll made visible: the raft the swell is under throws foam at its waterline.
          A travelling crest drawn across the whole row read as a stray white scribble —
          anchored to the raft, the cause and the effect are in the same place. */}
      {[0, 1, 2].map((i) => {
        const cx = cxOf(i);
        const l = liftAt(cx);
        if (l < 9) return null;
        const k = l / 30; // 0…1, how squarely the swell is under this raft
        return (
          <svg key={i} width={raftW} height={120} style={{ position: "absolute", left: cx - raftW / 2, top: SEA_TOP - 6, opacity: k }}>
            <ellipse cx={raftW / 2} cy={26} rx={raftW * 0.42} ry={13} fill="#FFFFFF" opacity={0.55} />
            <path d={`M${raftW * 0.16} 30 q ${raftW * 0.17} -26 ${raftW * 0.34} -4 q ${raftW * 0.17} 22 ${raftW * 0.34} -8`} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.9} />
            {Array.from({ length: 6 }).map((_, d) => (
              <circle key={d} cx={raftW * (0.2 + d * 0.12)} cy={18 - Math.abs(Math.sin(frame / 5 + d)) * 16 * k} r={6 + (d % 2) * 3} fill="#FFFFFF" opacity={0.85} />
            ))}
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// The mascot's station. A boat was tried twice — shallow it read as a surfboard, deep as a
// bowl — so it is a little DOCK instead: the same planks and posts as the rafts, and it
// deliberately does NOT ride the swell. The rafts move, the shore stays put.
const MascotDock: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 900 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ position: "absolute", left: w * 0.1, top: DECK_Y - 246, width: w * 0.8, transform: `translateY(${bob(frame, fps, 4, 2)}px) rotate(${wiggle(frame, fps, 2.6, 2.2)}deg)` }}
      />
      <svg width={w + 30} height={210} style={{ position: "absolute", left: -15, top: DECK_Y - 8 }}>
        <rect x={0} y={8} width={w + 30} height={28} rx={10} fill="#A1887F" />
        <rect x={0} y={8} width={w + 30} height={12} rx={6} fill="#BCAAA4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={16 + i * ((w) / 5)} y1={9} x2={16 + i * ((w) / 5)} y2={35} stroke="#8D6E63" strokeWidth={3} opacity={0.7} />
        ))}
        {/* posts driven into the seabed, with the water washing around them */}
        {[0.3, 0.76].map((k, i) => (
          <g key={i}>
            <rect x={(w + 30) * k - 9} y={34} width={18} height={128} rx={6} fill="#795548" />
            <ellipse cx={(w + 30) * k} cy={40 + 4 * Math.sin((frame / fps) * 3 + i)} rx={30} ry={9} fill="#E1F5FE" opacity={0.6} />
          </g>
        ))}
      </svg>
    </div>
  );
};
