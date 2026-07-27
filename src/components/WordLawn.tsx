import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { hex, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";
import { PositionPlate, Slot, SlotContent, SlotState, TagChip, hopInfo, markerAwareColor, slotColor } from "./PositionSlot";

// ── The Sleepy Lawn — the au/aw set ──────────────────────────────────────────
// Fifth show, fifth world, and the only one whose background TRAVELS: the sky runs from
// night to dawn across the whole video. Stars fade, the moon sets, the sun comes up — so
// the lesson has a arc you can feel even with the sound off, and "constant motion" comes
// from the world itself rather than from things wiggling.
//
// The card picked the theme: the /aw/ sound IS a yawn, and its words are all here already —
// yawn, dawn, lawn, paw, claw, straw, crawl.
//
// Three garden signs are the three positions, each with a lantern that lights on its turn,
// and a sleepy cat PADS between them (walk + stretch — not the frog's hop or the clown's
// bounce; every set moves its own way).
//
// LAYOUT LAW (LandscapeBeatKit): the STAGE band y 300…860 only.
//
//   316…360  position plate on the sign's topper
//   372…612  the slot card
//   616…744  the post, and the lantern hanging beside it
//   744…860  the lawn
//   700…812  the cat, on the grass IN FRONT of the posts and below the cards

const PLATE_TOP = 316;
const CARD_TOP = 372;
const CARD_H = 240;
const POST_TOP = 616;
const GRASS_Y = 744;
const PORCH_W = 250; // the mascot's porch, where the train kept its engine
const GAP = 24;
const HOP_FRAMES = 16; // a pad, not a hop — slower than the frog and the clown

// how far through the night→dawn journey we are, 0…1
const dawnT = (frame: number, total: number) =>
  interpolate(frame, [0, total * 0.62, total], [0, 0.72, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Interpolating straight from indigo to gold passes through a muddy brown, because that is
// what the midpoint of those two RGB values is. A real sunrise goes through ROSE, so the
// ramp has a third stop and the sky never looks dirty.
const ramp = (a: number[], mid: number[], b: number[], t: number) => {
  const [from, to, k] = t < 0.5 ? [a, mid, t * 2] : [mid, b, (t - 0.5) * 2];
  return `rgb(${from.map((v, i) => Math.round(v + (to[i] - v) * k)).join(",")})`;
};

// ── the sky, travelling from night to dawn (persistent, absolute frame) ──────
export const LawnSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = dawnT(frame, durationInFrames);

  // three stops, each easing indigo → rose → gold
  const top = ramp([26, 22, 62], [92, 52, 124], [255, 196, 140], t);
  const mid = ramp([58, 42, 104], [168, 78, 128], [255, 170, 150], t);
  const low = ramp([104, 66, 128], [232, 126, 122], [255, 226, 168], t);
  const starAlpha = interpolate(t, [0, 0.45], [0.95, 0], { extrapolateRight: "clamp" });
  // stops short of the mascot, whose head starts at y 384
  const moonY = interpolate(t, [0, 0.7], [58, 244], { extrapolateRight: "clamp" });
  const sunY = interpolate(t, [0.45, 1], [980, 430], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 46%, ${low} 100%)` }}>
      {/* stars, fading out as the sky lifts */}
      {starAlpha > 0.01 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 46 }).map((_, i) => {
            const sx = (i * 137.5) % width;
            const sy = ((i * 79.7) % 420) + 20;
            const tw = 0.45 + 0.55 * Math.abs(Math.sin(frame / 22 + i));
            return <circle key={i} cx={sx} cy={sy} r={i % 7 === 0 ? 3.4 : 2.1} fill="#FFF8E1" opacity={starAlpha * tw} />;
          })}
        </svg>
      )}

      {/* the moon setting on the left, the sun rising on the right */}
      <svg width={220} height={220} style={{ position: "absolute", left: 40, top: moonY, opacity: interpolate(t, [0, 0.72], [1, 0], { extrapolateRight: "clamp" }) }}>
        <circle cx={110} cy={110} r={62} fill="#FFF8E1" opacity={0.95} />
        <circle cx={132} cy={96} r={54} fill={ramp([26, 22, 62], [92, 52, 124], [255, 196, 140], t)} />
      </svg>
      <svg width={300} height={300} style={{ position: "absolute", left: width - 340, top: sunY, opacity: interpolate(t, [0.42, 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <g transform="translate(150 150)">
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i * (360 / 14) + frame * 0.18) * (Math.PI / 180);
            return <line key={i} x1={Math.cos(a) * 88} y1={Math.sin(a) * 88} x2={Math.cos(a) * 122} y2={Math.sin(a) * 122} stroke="#FFD180" strokeWidth={9} strokeLinecap="round" opacity={0.6} />;
          })}
          <circle cx={0} cy={0} r={74} fill="#FFE0A3" />
        </g>
      </svg>

      {/* fireflies early on, birds once it is light — the sky is never empty */}
      {starAlpha > 0.05 &&
        [0, 1, 2, 3].map((i) => {
          const fx = 300 + ((frame * (0.5 + i * 0.17) + i * 420) % (width - 700));
          const fy = 300 + Math.sin(frame / (30 + i * 9) + i) * 70;
          const glow = 0.4 + 0.6 * Math.abs(Math.sin(frame / 14 + i * 1.7));
          return <div key={i} style={{ position: "absolute", left: fx, top: fy, width: 13, height: 13, borderRadius: "50%", background: "#FFF176", opacity: starAlpha * glow, boxShadow: `0 0 20px 7px rgba(255,241,118,${0.45 * starAlpha * glow})` }} />;
        })}
      {t > 0.55 &&
        [0, 1, 2].map((i) => {
          const bx = ((frame * (0.5 + i * 0.14) + i * 560) % (width + 200)) - 100;
          const by = 180 + i * 44 + Math.sin(frame / 26 + i) * 14;
          const w = 15 + Math.abs(Math.sin(frame / 5 + i)) * 15;
          return (
            <svg key={i} width={110} height={60} style={{ position: "absolute", left: bx, top: by, opacity: interpolate(t, [0.55, 0.72], [0, 0.65], { extrapolateRight: "clamp" }) }}>
              <path d={`M10 30 q 26 ${-w} 44 0 q 18 ${-w} 44 0`} fill="none" stroke="#6D4C41" strokeWidth={5} strokeLinecap="round" />
            </svg>
          );
        })}

      {/* the lawn, greening up as the light arrives */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${GRASS_Y + 6} Q ${width / 2} ${GRASS_Y - 32} ${width} ${GRASS_Y + 6} L${width} ${height} L0 ${height} Z`} fill={ramp([38, 62, 44], [70, 96, 62], [124, 179, 66], t)} />
        <path d={`M0 ${GRASS_Y + 54} Q ${width * 0.44} ${GRASS_Y + 16} ${width} ${GRASS_Y + 50} L${width} ${height} L0 ${height} Z`} fill={ramp([28, 48, 34], [54, 78, 48], [104, 159, 56], t)} opacity={0.9} />
        {/* blades swaying along the near edge */}
        {Array.from({ length: 42 }).map((_, i) => {
          const gx = (i * (width / 42)) % width;
          const sway = Math.sin(frame / 26 + i * 0.7) * 7;
          return <path key={i} d={`M${gx} ${height} q ${sway} -46 ${sway * 1.6} -84`} fill="none" stroke={ramp([46, 74, 52], [80, 112, 66], [139, 195, 74], t)} strokeWidth={6} strokeLinecap="round" opacity={0.75} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── one garden sign ──────────────────────────────────────────────────────────
const Sign: React.FC<{
  cx: number; w: number; idx: number; label: boolean; labelLit: boolean;
  slot: Slot | null; color: string; lit: boolean; dawn: number;
}> = ({ cx, w, idx, label, labelLit, slot, color, lit, dawn }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const sway = wiggle(frame, fps, 3 + idx * 0.4, 0.7, idx);
  const cardW = w * 0.78;
  // the lantern glows on this sign's turn, and glows less as the sky brightens
  const lampOn = lit ? 1 : 0.22;
  const lamp = lampOn * interpolate(dawn, [0.4, 0.95], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: 0, width: w, height: 900, transform: `rotate(${sway}deg)`, transformOrigin: `center ${POST_TOP + 120}px`, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: (w - cardW) / 2, top: CARD_TOP, width: cardW, height: CARD_H,
          borderRadius: 30,
          background: lit ? tint(color, 0.9) : "#FFFFFFF2",
          border: `7px solid ${lit ? c : tint(color, 0.5)}`,
          boxShadow: lit ? `0 20px 48px ${c}66` : "0 14px 32px rgba(12,10,30,0.34)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", fontFamily: font.family,
          transform: `scale(${lit ? 1 + 0.04 * Math.sin((frame / fps) * 6) : 1})`,
          transformOrigin: "center bottom",
        }}
      >
        <SlotContent slot={slot} color={color} scale={0.92} />
      </div>

      {/* the post, and a lantern hanging off its arm */}
      <svg width={w} height={170} style={{ position: "absolute", left: 0, top: POST_TOP }}>
        <rect x={w / 2 - 11} y={0} width={22} height={132} rx={7} fill="#6D4C41" />
        <rect x={w / 2 - 44} y={6} width={88} height={13} rx={6} fill="#8D6E63" />
        <line x1={w / 2 + 40} y1={12} x2={w / 2 + 70} y2={12} stroke="#8D6E63" strokeWidth={7} strokeLinecap="round" />
        <line x1={w / 2 + 70} y1={12} x2={w / 2 + 70} y2={34} stroke="#8D6E63" strokeWidth={5} />
        <g transform={`translate(${w / 2 + 70} ${34}) rotate(${Math.sin(frame / 30 + idx) * 4})`}>
          <rect x={-17} y={0} width={34} height={40} rx={7} fill="#4E342E" />
          <rect x={-12} y={5} width={24} height={30} rx={5} fill="#FFE082" opacity={0.35 + 0.65 * lamp} />
          {lamp > 0.5 && <circle cx={0} cy={20} r={34} fill="#FFE082" opacity={0.2 * lamp} />}
        </g>
      </svg>

      {slot?.tag && (
        <div style={{ position: "absolute", left: 0, right: 0, top: CARD_TOP + CARD_H + 10, display: "flex", justifyContent: "center" }}>
          <TagChip text={slot.tag} />
        </div>
      )}

      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, top: PLATE_TOP, display: "flex", justifyContent: "center" }}>
          <PositionPlate idx={idx} lit={labelLit} color={color} />
        </div>
      )}
    </div>
  );
};

// ── the cat: pads to the position, then stretches ────────────────────────────
const Cat: React.FC<{ x: number; y: number; t: number; moving: boolean; dir: number }> = ({ x, y, t, moving, dir }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = 1 + 0.05 * Math.sin((frame / fps) * 3.2);
  const blink = (frame + 40) % 110 < 6 ? 0.12 : 1;
  // settled: a slow stretch every few seconds. Walking: a gentle bob and a swinging tail.
  const settle = Math.max(0, 1 - t / 0.5);
  const stretch = moving ? 0 : Math.max(0, Math.sin((frame / fps) * 1.5)) * 0.1;
  const step = moving ? Math.abs(Math.sin(t * Math.PI * 4)) * 9 : 0;
  const tail = Math.sin((frame / fps) * (moving ? 6 : 2.2)) * (moving ? 22 : 13);
  return (
    <svg width={324} height={238} style={{ position: "absolute", left: x - 162, top: y - 168, overflow: "visible" }}>
      <g transform={`translate(162 168) scale(${dir * 1.26 * (1 + stretch)} ${1.26 * breathe * (1 - stretch * 0.5)}) translate(0 ${-step})`}>
        {/* tail */}
        <path d={`M-54 -22 q -40 ${-10 - tail} -18 ${-52 - tail * 0.4}`} fill="none" stroke="#FFB74D" strokeWidth={13} strokeLinecap="round" />
        {/* body */}
        <ellipse cx={0} cy={-26} rx={62} ry={34} fill="#FFB74D" />
        <ellipse cx={12} cy={-18} rx={44} ry={22} fill="#FFCC80" opacity={0.75} />
        {/* legs */}
        {[-34, -6, 26, 48].map((lx, i) => (
          <rect key={i} x={lx - 7} y={-8} width={14} height={16 + (moving ? Math.abs(Math.sin(t * Math.PI * 4 + i)) * 6 : 0)} rx={7} fill="#FFA726" />
        ))}
        {/* head */}
        <g transform="translate(52 -54)">
          <circle cx={0} cy={0} r={30} fill="#FFB74D" />
          <path d="M-24 -18 L-14 -42 L-2 -22 Z" fill="#FFB74D" />
          <path d="M24 -18 L14 -42 L2 -22 Z" fill="#FFB74D" />
          <path d="M-21 -20 L-14 -35 L-5 -22 Z" fill="#F8BBD0" />
          <path d="M21 -20 L14 -35 L5 -22 Z" fill="#F8BBD0" />
          {[-11, 11].map((ex, i) => (
            <ellipse key={i} cx={ex} cy={-3} rx={4.5} ry={6 * blink * (1 - settle * 0.5)} fill="#3E2723" />
          ))}
          <path d="M0 6 l -5 -5 l 10 0 Z" fill="#F48FB1" />
          {/* a yawn when it settles, a closed mouth while padding */}
          {!moving ? (
            <ellipse cx={0} cy={16} rx={9 + stretch * 40} ry={6 + stretch * 40} fill="#C2185B" opacity={0.85} />
          ) : (
            <path d="M-8 14 q 8 6 16 0" fill="none" stroke="#8D6E63" strokeWidth={3} strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  );
};

// ── the lawn set ─────────────────────────────────────────────────────────────
export const WordLawn: React.FC<{
  data: PhonicsComparison;
  stateFor: (frame: number) => SlotState;
  showLabelsFrom: number;
  labelLitAt: [number, number, number];
  hideAt: number;
  sweep?: { from: number; to: number };
  colorFor?: (i: number) => string;
}> = ({ data, stateFor, showLabelsFrom, labelLitAt, hideAt, sweep, colorFor }) => {
  const frame = useCurrentFrame();
  const { width, fps, durationInFrames } = useVideoConfig();
  const f = frame;
  if (f >= hideAt + 14) return null;
  const opacity = interpolate(f, [hideAt - 14, hideAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dawn = dawnT(f, durationInFrames);

  const SAFE = safeX(width);
  const signW = (width - 2 * SAFE - PORCH_W - 3 * GAP) / 3;
  const cxOf = (i: number) => SAFE + PORCH_W + GAP + i * (signW + GAP) + signW / 2;

  const { cars, litIdx } = stateFor(f);
  const { cur, prev, t } = hopInfo(stateFor, f, HOP_FRAMES);
  const sweeping = !!sweep && f >= sweep.from && f < sweep.to;

  // it WALKS: eased across with no arc, facing the way it is going
  const fromX = cxOf(Math.max(0, prev));
  const toX = cxOf(Math.max(0, cur));
  const ease = t * t * (3 - 2 * t);
  const catX = fromX + (toX - fromX) * ease;
  const moving = t < 0.98 && prev !== cur;
  const dir = toX < fromX ? -1 : 1;
  const catY = GRASS_Y + 56 + bob(frame, fps, 3.4, 2.4);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Porch x={SAFE} w={PORCH_W} dawn={dawn} />

      {[0, 1, 2].map((i) => (
        <Sign
          key={i}
          cx={cxOf(i)}
          w={signW}
          idx={i}
          label={f >= showLabelsFrom}
          labelLit={f >= labelLitAt[i]}
          slot={cars[i]}
          color={markerAwareColor(cars[i], i, data, colorFor ?? ((k: number) => slotColor(k, data)))}
          lit={litIdx === i}
          dawn={dawn}
        />
      ))}

      {/* while the narration hunts, a pool of lantern light follows the cat */}
      {sweeping && (
        <svg width={360} height={90} style={{ position: "absolute", left: catX - 180, top: GRASS_Y + 12 }}>
          <ellipse cx={180} cy={44} rx={158} ry={32} fill="#FFE082" opacity={0.26} />
          <ellipse cx={180} cy={44} rx={158} ry={32} fill="none" stroke="#FFE082" strokeWidth={5} opacity={0.6} />
        </svg>
      )}

      {litIdx !== undefined && litIdx >= 0 && <Cat x={catX} y={catY} t={t} moving={moving} dir={dir} />}
    </AbsoluteFill>
  );
};

const Porch: React.FC<{ x: number; w: number; dawn: number }> = ({ x, w, dawn }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 900 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ position: "absolute", left: w * 0.1, top: POST_TOP - 232, width: w * 0.8, transform: `translateY(${bob(frame, fps, 3.4, 2.6)}px) rotate(${wiggle(frame, fps, 2.4, 2.2)}deg)` }}
      />
      {/* a little garden bench under it, with its own lantern */}
      <svg width={w + 20} height={170} style={{ position: "absolute", left: -10, top: POST_TOP }}>
        <rect x={16} y={16} width={w - 12} height={16} rx={8} fill="#8D6E63" />
        <rect x={16} y={-16} width={w - 12} height={13} rx={6} fill="#A1887F" />
        {[0.16, 0.84].map((k, i) => (
          <rect key={i} x={16 + (w - 12) * k - 7} y={30} width={14} height={78} rx={6} fill="#6D4C41" />
        ))}
        <g transform={`translate(${w - 6} 40) rotate(${Math.sin(frame / 30) * 4})`}>
          <rect x={-16} y={0} width={32} height={38} rx={7} fill="#4E342E" />
          <rect x={-11} y={5} width={22} height={28} rx={5} fill="#FFE082" opacity={interpolate(dawn, [0.4, 0.95], [0.95, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </g>
      </svg>
    </div>
  );
};
