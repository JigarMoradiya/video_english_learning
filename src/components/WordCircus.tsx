import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { hex, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";
import { PositionPlate, Slot, SlotContent, SlotState, TagChip, hopInfo, slotColor } from "./PositionSlot";

// ── The Two-Ring Circus — the ou/ow set ──────────────────────────────────────
// Fourth show, fourth world. Two reasons the circus is the right one for this card:
//
//   1. "Ouch!" is a slapstick sound, and the ow words are already circus-shaped —
//      clown, crown, gown, town, brown, cow, owl.
//   2. This card's hard part is that ow does TWO different jobs (long O in snow, /ow/ in
//      cow), and a TWO-RING circus says that without a word: one performer, two acts.
//
// Three podiums are the three positions and a clown BOUNCES onto whichever one the
// narration names. Unlike the first three sets, the BEGINNING podium is genuinely used
// here — "out" and "ouch" put the sound at the very start of the word.
//
// LAYOUT LAW (LandscapeBeatKit): the STAGE band y 300…860, never the headline band
// (0…290) and never the caption band (880…1080).
//
//   316…360  position banner on its pole
//   372…612  the slot card
//   616…744  the podium the card stands on
//   632…818  the clown, on the FLOOR in front of the podiums and BELOW the cards
//   744…860  sawdust floor

const PLATE_TOP = 316;
const CARD_TOP = 372;
const CARD_H = 240;
const PODIUM_TOP = 616;
const FLOOR_Y = 744;
const RING_W = 250; // the ringmaster's stand, where the train kept its engine
const GAP = 24;
const HOP_FRAMES = 12;

// ── the big top the whole video sits in (persistent, absolute frame) ─────────
export const CircusSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4A1942 0%, #7B2D5E 34%, #C2497A 66%, #F3B0A0 100%)" }}>
      {/* the canopy: alternating stripes radiating from the top of the tent */}
      <svg width={width} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => {
          const x0 = (i / 15) * width * 1.6 - width * 0.3;
          const x1 = ((i + 1) / 15) * width * 1.6 - width * 0.3;
          return (
            <path key={i} d={`M${width / 2} -140 L${x0} 400 L${x1} 400 Z`} fill={i % 2 ? "#8E2F5F" : "#A33A6C"} opacity={0.55} />
          );
        })}
      </svg>

      {/* two spotlights sweeping the tent, out of phase */}
      {[0, 1].map((i) => {
        const a = Math.sin(frame / (74 + i * 23) + i * 2.1) * 21;
        const x = i === 0 ? width * 0.26 : width * 0.74;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x - 190, top: 60, width: 380, height: 760,
              background: "linear-gradient(180deg, rgba(255,241,180,0.30) 0%, rgba(255,241,180,0.10) 46%, rgba(255,241,180,0) 100%)",
              clipPath: "polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)",
              transform: `rotate(${a}deg)`, transformOrigin: "50% 0%",
            }}
          />
        );
      })}

      {/* bunting, strung in two swags and swinging. Stops short of the top-right corner so
          it never runs under the brand mark. */}
      {[{ y: 118, k: 1, from: 0, to: 0.62 }, { y: 176, k: 0.82, from: 0.1, to: 0.5 }].map((r, ri) => {
        const x0 = width * r.from, x1 = width * r.to, n = 13;
        return (
          <svg key={ri} width={width} height={260} style={{ position: "absolute", left: 0, top: r.y }}>
            <path d={`M${x0} 0 Q ${(x0 + x1) / 2} ${64 * r.k + Math.sin(frame / 34 + ri) * 5} ${x1} 0`} fill="none" stroke="#FFD9A0" strokeWidth={4} opacity={0.8} />
            {Array.from({ length: n }).map((_, i) => {
              const t = i / (n - 1);
              const fx = x0 + (x1 - x0) * t;
              const sag = 4 * (64 * r.k + Math.sin(frame / 34 + ri) * 5) * t * (1 - t);
              const sway = Math.sin(frame / 26 + i * 0.6) * 3;
              return (
                <path
                  key={i}
                  d={`M${fx - 15} ${sag} L${fx + 15} ${sag} L${fx + sway} ${sag + 34 * r.k} Z`}
                  fill={["#FFD54F", "#FF8A65", "#4FC3F7", "#AED581"][i % 4]}
                  opacity={0.92}
                />
              );
            })}
          </svg>
        );
      })}

      {/* the sawdust ring floor */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${FLOOR_Y + 8} Q ${width / 2} ${FLOOR_Y - 30} ${width} ${FLOOR_Y + 8} L${width} ${height} L0 ${height} Z`} fill="#E8C08E" />
        <path d={`M0 ${FLOOR_Y + 44} Q ${width / 2} ${FLOOR_Y + 10} ${width} ${FLOOR_Y + 44} L${width} ${height} L0 ${height} Z`} fill="#D9A96D" opacity={0.85} />
        {/* the red ring kerb */}
        <path d={`M0 ${FLOOR_Y + 8} Q ${width / 2} ${FLOOR_Y - 30} ${width} ${FLOOR_Y + 8}`} fill="none" stroke="#C62828" strokeWidth={13} />
      </svg>

      {/* confetti drifting down through the tent, always */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const seed = i * 97.13;
          const x = ((seed * 7.7) % width) + Math.sin(frame / 42 + i) * 26;
          const y = ((frame * (0.55 + (i % 5) * 0.16) + seed * 3.1) % (height + 160)) - 80;
          const rot = frame * (1.4 + (i % 4) * 0.5) + seed;
          return (
            <rect
              key={i} x={x} y={y} width={11} height={17} rx={2}
              fill={["#FFD54F", "#FF8A65", "#4FC3F7", "#AED581", "#F48FB1"][i % 5]}
              opacity={0.72} transform={`rotate(${rot} ${x + 5} ${y + 8})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── one podium ───────────────────────────────────────────────────────────────
const Podium: React.FC<{
  cx: number; w: number; idx: number; label: boolean; labelLit: boolean;
  slot: Slot | null; color: string; lit: boolean;
}> = ({ cx, w, idx, label, labelLit, slot, color, lit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const rise = lit ? -10 - 3 * Math.sin((frame / fps) * 5) : 0; // the named podium lifts
  const cardW = w * 0.78;
  const pw = w * 0.62;

  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: rise, width: w, height: 900, pointerEvents: "none" }}>
      {/* the slot card standing on the podium */}
      <div
        style={{
          position: "absolute", left: (w - cardW) / 2, top: CARD_TOP, width: cardW, height: CARD_H,
          borderRadius: 32,
          background: lit ? tint(color, 0.9) : "#FFFFFFF2",
          border: `7px solid ${lit ? c : tint(color, 0.5)}`,
          boxShadow: lit ? `0 20px 48px ${c}66` : "0 14px 32px rgba(20,10,26,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", fontFamily: font.family,
          transform: `scale(${lit ? 1 + 0.04 * Math.sin((frame / fps) * 6) : 1})`,
          transformOrigin: "center bottom",
        }}
      >
        <SlotContent slot={slot} color={color} scale={0.92} />
      </div>

      {/* the podium: a striped circus drum on a base */}
      <svg width={w} height={150} style={{ position: "absolute", left: 0, top: PODIUM_TOP }}>
        <ellipse cx={w / 2} cy={116} rx={pw * 0.62} ry={13} fill="#00000033" />
        <rect x={(w - pw) / 2} y={16} width={pw} height={94} rx={12} fill={lit ? c : "#8E2F5F"} />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={(w - pw) / 2 + 8 + i * ((pw - 16) / 7)} y={16} width={(pw - 16) / 14} height={94} fill="#FFF3E0" opacity={0.5} />
        ))}
        <rect x={(w - pw) / 2 - 12} y={2} width={pw + 24} height={22} rx={11} fill="#FFD54F" />
        <rect x={(w - pw) / 2 - 12} y={100} width={pw + 24} height={20} rx={10} fill="#FFD54F" />
        {/* a star on the front of the lit podium */}
        {lit && <text x={w / 2} y={78} textAnchor="middle" fontSize={40}>⭐</text>}
      </svg>

      {/* "⬅ before" / "after ➡" */}
      {slot?.tag && (
        <div style={{ position: "absolute", left: 0, right: 0, top: CARD_TOP + CARD_H + 8, display: "flex", justifyContent: "center" }}>
          <TagChip text={slot.tag} />
        </div>
      )}

      {/* position banner on a pole */}
      {label && (
        <>
          <div style={{ position: "absolute", left: w / 2 - 4, top: PLATE_TOP + 32, width: 8, height: CARD_TOP - PLATE_TOP - 28, background: "#FFD54F", borderRadius: 4 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: PLATE_TOP, display: "flex", justifyContent: "center", transform: `rotate(${wiggle(frame, fps, 3, 1.4, idx)}deg)` }}>
            <PositionPlate idx={idx} lit={labelLit} color={color} />
          </div>
        </>
      )}
    </div>
  );
};

// ── the clown: the spotlight, mid-bounce ─────────────────────────────────────
const Clown: React.FC<{ x: number; y: number; squash: number; airborne: boolean }> = ({ x, y, squash, airborne }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = 1 + 0.04 * Math.sin((frame / fps) * 4);
  const blink = (frame + 40) % 96 < 5 ? 0.15 : 1; // never mid-blink on frame 0
  const spin = frame * 5; // the bow tie never stops spinning
  return (
    <svg width={210} height={170} style={{ position: "absolute", left: x - 105, top: y - 124, overflow: "visible" }}>
      <g transform={`translate(105 120) scale(${squash} ${(2 - squash) * breathe})`}>
        {/* legs, tucked in flight */}
        {[-30, 30].map((lx, i) => (
          <rect key={i} x={lx - 11} y={-6} width={22} height={airborne ? 26 : 38} rx={11} fill="#1976D2" transform={`rotate(${airborne ? (i ? 26 : -26) : (i ? 8 : -8)} ${lx} 0)`} />
        ))}
        {/* big shoes */}
        {[-38, 38].map((sx, i) => (
          <ellipse key={i} cx={sx} cy={airborne ? 20 : 34} rx={22} ry={9} fill="#C62828" />
        ))}
        {/* body */}
        <ellipse cx={0} cy={-34} rx={44} ry={38} fill="#FFF3E0" />
        <ellipse cx={0} cy={-30} rx={30} ry={24} fill="#F48FB1" opacity={0.5} />
        {/* spinning bow tie */}
        <g transform={`translate(0 -66) rotate(${spin})`}>
          <path d="M0 0 L-24 -12 L-24 12 Z" fill="#FFD54F" />
          <path d="M0 0 L24 -12 L24 12 Z" fill="#FFD54F" />
          <circle cx={0} cy={0} r={7} fill="#C62828" />
        </g>
        {/* head */}
        <circle cx={0} cy={-96} r={30} fill="#FFE0B2" />
        <circle cx={0} cy={-86} r={9} fill="#E53935" />
        {[-12, 12].map((ex, i) => (
          <ellipse key={i} cx={ex} cy={-104} rx={5} ry={6 * blink} fill="#1B2430" />
        ))}
        <path d="M-13 -76 q 13 12 26 0" fill="none" stroke="#C62828" strokeWidth={4} strokeLinecap="round" />
        {/* frizzy hair + tiny hat */}
        {[-30, 30].map((hx, i) => (
          <circle key={i} cx={hx} cy={-104} r={13} fill="#E53935" />
        ))}
        <g transform={`rotate(${airborne ? -12 : -4}) translate(0 -124)`}>
          <rect x={-20} y={-4} width={40} height={7} rx={3.5} fill="#1976D2" />
          <rect x={-13} y={-24} width={26} height={22} rx={5} fill="#1976D2" />
        </g>
      </g>
    </svg>
  );
};

// ── the circus set ───────────────────────────────────────────────────────────
export const WordCircus: React.FC<{
  data: PhonicsComparison;
  stateFor: (frame: number) => SlotState;
  showLabelsFrom: number;
  labelLitAt: [number, number, number];
  hideAt: number;
  // ou/ow needs this: "out" and "ouch" put the sound in the FIRST slot, so that slot is not
  // neutral on this card the way it is on ai/ay, oi/oy and oa/ow.
  colorFor?: (i: number) => string;
  // while the narration asks WHERE the sound sits, the clown bounces podium to podium and
  // a ring of light chases him.
  sweep?: { from: number; to: number };
}> = ({ data, stateFor, showLabelsFrom, labelLitAt, hideAt, sweep, colorFor }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const SAFE = safeX(width);
  const podW = (width - 2 * SAFE - RING_W - 3 * GAP) / 3;
  const cxOf = (i: number) => SAFE + RING_W + GAP + i * (podW + GAP) + podW / 2;

  const { cars, litIdx } = stateFor(f);
  const { cur, prev, t } = hopInfo(stateFor, f, HOP_FRAMES);
  const sweeping = !!sweep && f >= sweep.from && f < sweep.to;

  // the bounce: eased across, a parabola up, squashing on take-off and landing
  const fromX = cxOf(Math.max(0, prev));
  const toX = cxOf(Math.max(0, cur));
  const ease = t * t * (3 - 2 * t);
  const clownX = fromX + (toX - fromX) * ease;
  const arc = Math.sin(Math.PI * t) * (prev === cur ? 0 : 110);
  const airborne = t > 0.08 && t < 0.92 && prev !== cur;
  const squash = airborne ? 1.1 : 1 - 0.12 * Math.sin(Math.PI * Math.min(1, t / 0.12));
  // the clown's hat reaches ~152px above this anchor, so anchoring him on the podium drew
  // him through the card standing on it. He performs on the floor, in front of the row.
  const clownY = FLOOR_Y + 42 - arc + bob(frame, fps, 4, 3);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Ringmaster x={SAFE} w={RING_W} />

      {[0, 1, 2].map((i) => (
        <Podium
          key={i}
          cx={cxOf(i)}
          w={podW}
          idx={i}
          label={f >= showLabelsFrom}
          labelLit={f >= labelLitAt[i]}
          slot={cars[i]}
          color={(colorFor ?? ((k: number) => slotColor(k, data)))(i)}
          lit={litIdx === i}
        />
      ))}

      {/* a ring of light on the floor, chasing the clown while the narration hunts */}
      {sweeping && (
        <svg width={340} height={90} style={{ position: "absolute", left: clownX - 170, top: FLOOR_Y - 34 }}>
          <ellipse cx={170} cy={45} rx={150} ry={32} fill="#FFF3B0" opacity={0.3} />
          <ellipse cx={170} cy={45} rx={150} ry={32} fill="none" stroke="#FFD54F" strokeWidth={6} opacity={0.85} />
        </svg>
      )}

      {litIdx !== undefined && litIdx >= 0 && <Clown x={clownX} y={clownY} squash={squash} airborne={airborne} />}
    </AbsoluteFill>
  );
};

const Ringmaster: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 900 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{
          position: "absolute", left: w * 0.1, top: PODIUM_TOP - 236, width: w * 0.8,
          transform: `translateY(${bob(frame, fps, 3.6, 3)}px) rotate(${wiggle(frame, fps, 2.4, 2.4)}deg)`,
        }}
      />
      {/* the ringmaster's own little stand */}
      <svg width={w} height={150} style={{ position: "absolute", left: 0, top: PODIUM_TOP }}>
        <ellipse cx={w / 2} cy={116} rx={w * 0.4} ry={12} fill="#00000033" />
        <rect x={w * 0.16} y={22} width={w * 0.68} height={88} rx={12} fill="#C62828" />
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={w * 0.16 + 8 + i * ((w * 0.68 - 16) / 5)} y={22} width={(w * 0.68 - 16) / 10} height={88} fill="#FFF3E0" opacity={0.45} />
        ))}
        <rect x={w * 0.12} y={8} width={w * 0.76} height={20} rx={10} fill="#FFD54F" />
        <rect x={w * 0.12} y={100} width={w * 0.76} height={18} rx={9} fill="#FFD54F" />
      </svg>
    </div>
  );
};
