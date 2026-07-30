import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { darken, font, hex } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// ── THE SNOW SLOPE — the world for the oa/ow 9:16 reel ───────────────────────
// A piste runs downhill, which is what a tall frame is shaped like, and the world is made
// of the words it teaches: snow, blow, slow, grow are the `ow` list. A marker pole mid-slope
// is `oa`; the finish gate and the snowman at the foot of the run are the END, which is `ow`.
//
// It is also the first COOL world in the set — Bakery, Key Shop, Dig Site, Word Train and
// the rest are all warm — so oa/ow is instantly separable in a feed instead of reading as
// another beige video.
//
// THREE CONSTRAINTS, learned on ai/ay and oi/oy rather than guessed here:
//
// 1. NOTHING BEHIND THE BEATS. They own roughly x129…932 and y228…1419 (same Stage as its
//    sibling reels). Every world I ever put behind them collided with one beat or another,
//    so all furniture lives in the margins and the bottom band: marker poles in x0…120,
//    pines and the chairlift in x940+, the finish gate below y1440. The snow field itself is
//    full-frame TEXTURE at low contrast, the role the metro's map grid and the dig's strata
//    both play.
// 2. IT MUST BE LIGHT. The beats draw dark navy ink; snow is the best ground for it there is.
// 3. IT MUST NEVER BE STILL. Snow falls, the chairlift runs, the pines sway, the flag flaps.
const SKY_H = 190;
const MARK_X = 84;        // the piste marker line, left margin
const OA_Y = 770;         // the mid-slope marker — `oa` sits in the middle
const FINISH_TOP = 1440;
const GATE_Y = 1580;
const GROUND = 1880;
const LIFT_X = 966;       // chairlift cable, LEFT half of the right margin
const PINE_X = 1042;      // pines, right half — at 1014 the cable ran through the trees

export const SnowSlope: React.FC<{
  oaColor?: string;
  owColor?: string;
  /** frames the narration says "oa … middle" — the mid-slope marker flares */
  markCues?: number[];
  /** frames it says "ow … end" — a snowball rolls through the finish gate */
  finishCues?: number[];
  /** frame the download section takes over; the slope steps back */
  dimFrom?: number;
}> = ({ oaColor = "1565C0", owColor = "00897B", markCues = [], finishCues = [], dimFrom }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const oa = hex(oaColor);
  const ow = hex(owColor);

  const pulse = (cues: number[], len: number) =>
    Math.max(0, ...cues.map((cf) => {
      const d = frame - cf;
      if (d < 0 || d > len) return 0;
      return Math.max(0, Math.sin((d / len) * Math.PI)) ** 0.6;
    }), 0);
  const mark = pulse(markCues, 40);
  // a snowball runs the slope into the gate: 0 at the marker, 1 through the finish
  const rollT = Math.max(0, ...finishCues.map((cf) => {
    const d = frame - cf;
    if (d < 0 || d > 52) return 0;
    return Math.min(1, d / 40);
  }), 0);
  const rolling = finishCues.some((cf) => frame >= cf && frame - cf <= 52);

  const dim = dimFrom !== undefined
    ? interpolate(frame - dimFrom, [0, 20], [1, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ background: "#F6FBFE", fontFamily: font.family }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* cold sky + a pale winter sun */}
          <defs>
            <linearGradient id="coldsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BEDCF0" />
              <stop offset="100%" stopColor="#E4F1FA" />
            </linearGradient>
            <linearGradient id="snowfield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAFDFF" />
              <stop offset="52%" stopColor="#EEF6FC" />
              <stop offset="100%" stopColor="#DCEAF4" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={width} height={SKY_H + 40} fill="url(#coldsky)" />
          <circle cx={width - 168} cy={78} r={46} fill="#FFF6D6" opacity={0.9} />

          {/* far peaks on the horizon, low contrast so they never compete */}
          <path d={`M0 ${SKY_H} L150 ${SKY_H - 118} L268 ${SKY_H - 34} L392 ${SKY_H - 96} L520 ${SKY_H} Z`} fill="#B9D4E6" opacity={0.75} />
          <path d={`M${width} ${SKY_H} L${width - 190} ${SKY_H - 96} L${width - 300} ${SKY_H - 26} L${width - 430} ${SKY_H - 74} L${width - 560} ${SKY_H} Z`} fill="#C6DCEB" opacity={0.7} />
          {/* their snow caps */}
          <path d={`M120 ${SKY_H - 84} L150 ${SKY_H - 118} L182 ${SKY_H - 82} L152 ${SKY_H - 96} Z`} fill="#FFFFFF" opacity={0.9} />

          {/* THE SNOW FIELD — full-frame texture. The contour shadows read as the roll of a
              piste without ever becoming a pattern the eye has to fight. */}
          <rect x={0} y={SKY_H} width={width} height={height - SKY_H} fill="url(#snowfield)" />
          {[0, 1, 2, 3, 4].map((i) => {
            const y = SKY_H + 150 + i * 250;
            return (
              <path
                key={i}
                d={`M0 ${y} Q ${width * 0.34} ${y - 54} ${width * 0.62} ${y + 16} T ${width} ${y - 22}`}
                fill="none" stroke="#C7DCEB" strokeWidth={16} opacity={0.42}
              />
            );
          })}
          {/* a ski track carving down the slope, behind everything */}
          <path
            d={`M${MARK_X + 210} ${SKY_H + 40} C ${MARK_X + 60} ${SKY_H + 340}, ${MARK_X + 330} ${SKY_H + 620}, ${MARK_X + 150} ${FINISH_TOP}`}
            fill="none" stroke="#CFE2EF" strokeWidth={13} strokeLinecap="round" opacity={0.55} strokeDasharray="2 22"
          />

          {/* PISTE MARKER POLES — the left margin only. The one at OA_Y is `oa`'s, mid-slope,
              and it flares on the words "oa … middle". */}
          {[330, 520, OA_Y, 1010, 1210].map((y) => {
            const isOa = y === OA_Y;
            const flare = isOa ? mark : 0;
            const sway = wiggle(frame, fps, isOa ? 3.2 : 2, 3.4, y / 300);
            return (
              <g key={y} transform={`rotate(${sway} ${MARK_X} ${y + 92})`}>
                <rect x={MARK_X - 5} y={y} width={10} height={92} rx={5} fill="#9AAEBD" />
                {/* high-vis bands */}
                {[0, 1].map((k) => (
                  <rect key={k} x={MARK_X - 6} y={y + 14 + k * 30} width={12} height={13} rx={3} fill={isOa ? oa : "#E8724A"} opacity={isOa ? 0.9 : 0.75} />
                ))}
                {isOa && (
                  <g>
                    {/* the flag: bigger, tinted, and it flaps */}
                    <path
                      d={`M${MARK_X + 4} ${y - 4} q 46 ${10 + 7 * Math.sin(t * 5)} 78 0 l 0 40 q -34 ${-8 - 6 * Math.sin(t * 5)} -78 0 z`}
                      fill={oa} opacity={0.85 + flare * 0.15}
                    />
                    <circle cx={MARK_X} cy={y - 10} r={9 + flare * 8} fill={oa} opacity={0.5 + flare * 0.5} />
                  </g>
                )}
              </g>
            );
          })}

          {/* CHAIRLIFT — right margin. Constant motion that belongs to the place. */}
          <line x1={LIFT_X} y1={SKY_H - 10} x2={LIFT_X} y2={GROUND} stroke="#8FA6B6" strokeWidth={5} opacity={0.7} />
          {[0, 1, 2, 3].map((i) => {
            const period = 16;
            const p = ((t + i * (period / 4)) % period) / period;
            const cy = SKY_H - 10 + p * (GROUND - SKY_H + 10);
            return (
              <g key={i} transform={`translate(${LIFT_X} ${cy}) rotate(${wiggle(frame, fps, 4, 3.2, i)})`} opacity={0.8}>
                <line x1={0} y1={0} x2={0} y2={26} stroke="#8FA6B6" strokeWidth={4} />
                <rect x={-24} y={26} width={48} height={30} rx={7} fill={ow} opacity={0.85} />
                <rect x={-24} y={52} width={48} height={7} rx={3} fill={darken(ow, 20)} />
              </g>
            );
          })}

          {/* snow-laden pines, right margin */}
          {[{ y: 620, s: 1 }, { y: 900, s: 0.82 }, { y: 1180, s: 1.1 }].map((p, i) => {
            const px = PINE_X;
            const h = 150 * p.s;
            const sway = wiggle(frame, fps, 1.8, 4.2 + i, i);
            return (
              <g key={i} transform={`rotate(${sway} ${px} ${p.y + h})`}>
                <rect x={px - 6} y={p.y + h - 26} width={12} height={30} fill="#7A5A3C" />
                {[0, 1, 2].map((k) => (
                  <g key={k}>
                    <path d={`M${px} ${p.y + k * h * 0.28} l ${-34 * p.s} ${h * 0.36} l ${68 * p.s} 0 z`} fill="#2F6B57" />
                    <path d={`M${px} ${p.y + k * h * 0.28 + 6} l ${-26 * p.s} ${h * 0.24} l ${52 * p.s} 0 z`} fill="#FFFFFF" opacity={0.72} />
                  </g>
                ))}
              </g>
            );
          })}

          {/* THE FINISH — the END of the run, below the caption band */}
          <path d={`M0 ${FINISH_TOP} Q ${width * 0.5} ${FINISH_TOP - 46} ${width} ${FINISH_TOP} L ${width} ${height} L 0 ${height} Z`} fill="#FFFFFF" opacity={0.72} />
          {/* gate posts + banner */}
          {[width * 0.5 - 210, width * 0.5 + 210].map((px) => (
            <rect key={px} x={px - 13} y={GATE_Y - 40} width={26} height={GROUND - GATE_Y + 40} rx={9} fill="#8FA6B6" />
          ))}
          <rect x={width * 0.5 - 232} y={GATE_Y - 78} width={464} height={62} rx={16} fill={ow} />
          <rect x={width * 0.5 - 232} y={GATE_Y - 78} width={464} height={62} rx={16} fill="none" stroke={darken(ow, 22)} strokeWidth={4} />
          {/* chequered trim, so it reads as a finish line */}
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={width * 0.5 - 232 + i * 29} y={GATE_Y - 16} width={29} height={12} fill={i % 2 ? "#FFFFFF" : darken(ow, 26)} opacity={0.9} />
          ))}
          {/* the snowman waiting at the end */}
          {(() => {
            const sx = width * 0.5 + 300;
            const sy = GROUND - 34;
            const nod = bob(frame, fps, 4, 2.4);
            return (
              <g transform={`translate(0 ${nod})`}>
                <ellipse cx={sx} cy={sy} rx={54} ry={50} fill="#FFFFFF" stroke="#D3E6F2" strokeWidth={4} />
                <ellipse cx={sx} cy={sy - 72} rx={38} ry={36} fill="#FFFFFF" stroke="#D3E6F2" strokeWidth={4} />
                <circle cx={sx - 13} cy={sy - 80} r={5} fill="#3B4A57" />
                <circle cx={sx + 13} cy={sy - 80} r={5} fill="#3B4A57" />
                <path d={`M${sx - 4} ${sy - 68} l 26 7 l -26 7 z`} fill="#F08A3C" />
                <rect x={sx - 30} y={sy - 122} width={60} height={13} rx={5} fill={ow} />
                <rect x={sx - 21} y={sy - 152} width={42} height={32} rx={7} fill={ow} />
              </g>
            );
          })()}
        </svg>

        {/* the word the finish banner is celebrating */}
        <div
          style={{
            position: "absolute", left: 0, width, top: GATE_Y - 70,
            textAlign: "center", fontSize: 40, fontWeight: 800, letterSpacing: 4,
            color: "#FFFFFF", textTransform: "uppercase", opacity: 0.95,
          }}
        >
          finish
        </div>

        {/* SNOW — the world's baseline motion. Small and pale so it never fights the text. */}
        {Array.from({ length: 34 }, (_, i) => {
          const period = 6 + (i % 7) * 1.15;
          const p = ((t + i * 0.53) % period) / period;
          const x = (i * 317) % width;
          const size = 5 + (i % 4) * 3;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x + Math.sin(t * 0.9 + i) * 26,
                top: -20 + p * (height + 40),
                width: size, height: size, borderRadius: "50%",
                background: "#FFFFFF",
                opacity: 0.42 + 0.3 * Math.sin(p * Math.PI),
                boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              }}
            />
          );
        })}

        {/* the snowball running the slope into the gate on an "ow … end" cue */}
        {rolling && (
          <div
            style={{
              position: "absolute",
              left: interpolate(rollT, [0, 1], [MARK_X + 40, width * 0.5 - 26]),
              top: interpolate(rollT, [0, 1], [OA_Y + 60, GATE_Y + 40]),
              width: 52, height: 52, borderRadius: "50%",
              background: "radial-gradient(circle at 34% 30%, #FFFFFF 0%, #E3F0F8 62%, #C7DCEB 100%)",
              transform: `rotate(${rollT * 720}deg)`,
              boxShadow: "0 8px 16px rgba(90,120,140,0.35)",
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
