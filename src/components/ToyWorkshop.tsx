import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { darken, font, palette } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { P, WRAP_FROM } from "../data/blending";

// ── THE TOY WORKSHOP — the world for L3 · 2-Sound Blending ───────────────────
// v1 was a steel factory and the user called it: not kids friendly. Same teaching idea —
// two pieces click into one — but now it happens where a child already does it: a toy
// workshop where letter BLOCKS snap together on a wooden bench. Warm cream wall, string
// lights, bunting, a toy shelf, and the bear watching from beside the bench.
//
// BANDS (1920x1080) — unchanged from v1, they were right:
//   y    0 … 118   string lights + bunting
//   y  248 … 762   THE STAGE — all teaching content
//   y  762 … 846   the wooden bench top (the tally of finished words lives ON it)
//   y  846 … 968   floor: bear, rug, toy shelf
//   y  968 …1080   caption band
// Aspect band table — the FIRST thing built, not retro-fitted. Every world in this repo
// needed one eventually (train rail y782, pond waterline y706, sea line y636 all left
// 40-50% of a 1350-tall frame dead), so L3 gets one up front.
//   16:9  lights 0…118 · stage 248…762 · bench 762…846 · floor …968 · caption 968…1080
//   4:5   lights 0…110 · stage 240…888 · bench 888…972 · floor …1150 · caption 1150…1350
export const bands = (width: number, height: number) => {
  const portrait = height > width;
  return portrait
    ? { stageTop: 240, stageBot: 888, benchY: 888, floorY: 1150, captionTop: 1150,
        shelfX: 946, shelfW: 118, shelfTop: 330, shelfH: 300, boardX: 18, boardW: 176, bannerTop: 132,
        contentL: 208, contentR: 936 }
    : { stageTop: 248, stageBot: 762, benchY: 762, floorY: 982, captionTop: 968,
        shelfX: width - 226, shelfW: 206, shelfTop: 300, shelfH: 430, boardX: 42, boardW: 214, bannerTop: 158,
        contentL: 300, contentR: width - 260 };
};
export const STAGE_TOP = 248;
export const STAGE_BOT = 762;
export const BENCH_Y = 762;
export const CAPTION_TOP = 968;

export const VOWEL = "#E64A4A";
export const CONSONANT = "#2979CF";
const WOOD = "#C99B66";
const WOOD_D = "#A87B48";

export const WorkshopWorld: React.FC<{ dim?: number }> = ({ dim = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const B = bands(width, height);
  const portrait = height > width;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#FFF8EC 0%,#FFEFD8 58%,#FFE6C4 100%)", fontFamily: font.family }}>
      {/* the world steps back when the download section takes over (dimFrom pattern
          from the other videos) so the store card is the only focus */}
      <AbsoluteFill style={{ opacity: dim * interpolate(frame, [WRAP_FROM, WRAP_FROM + 20], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* soft window light, top-left */}
          <ellipse cx={230} cy={140} rx={330} ry={200} fill="#FFF3C9" opacity={0.5} />

          {/* string lights swaying across the top */}
          <path d={`M0 46 Q ${width * 0.25} ${96 + 5 * Math.sin(t * 1.1)} ${width * 0.5} 60 T ${width} 52`} fill="none" stroke="#B98A55" strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 80 + i * ((width - 160) / 11);
            const y = 58 + 30 * Math.sin((x / width) * Math.PI * 2 + 0.6);
            const c = ["#F06292", "#FFD54F", "#4FC3F7", "#81C784"][i % 4];
            const tw = 0.65 + 0.35 * Math.abs(Math.sin(t * 2 + i));
            return (
              <g key={i} transform={`rotate(${wiggle(frame, fps, 2, 4 + (i % 3), i)} ${x} ${y})`}>
                <line x1={x} y1={y} x2={x} y2={y + 16} stroke="#B98A55" strokeWidth={3} />
                <circle cx={x} cy={y + 26} r={11} fill={c} opacity={tw} />
              </g>
            );
          })}

          {/* bunting under the lights */}
          {Array.from({ length: 14 }, (_, i) => {
            const x0 = i * (width / 14);
            const c = ["#FFB3C1", "#FFE082", "#A5D8FF", "#B9E8B0"][i % 4];
            return <path key={i} d={`M${x0} 116 L${x0 + width / 28} ${158 + 4 * Math.sin(t * 1.4 + i)} L${x0 + width / 14} 116 Z`} fill={c} opacity={0.9} />;
          })}

          {/* toy shelf, right margin */}
          <rect x={B.shelfX} y={B.shelfTop} width={16} height={B.shelfH} rx={6} fill={WOOD_D} />
          <rect x={B.shelfX + B.shelfW - 16} y={B.shelfTop} width={16} height={B.shelfH} rx={6} fill={WOOD_D} />
          {[1, 2, 3].map((n) => (
            <rect key={n} x={B.shelfX - 8} y={B.shelfTop + (B.shelfH / 3) * n - 16} width={B.shelfW + 16} height={16} rx={6} fill={WOOD} />
          ))}

          {/* THE BENCH — warm wood, full width */}
          <rect x={0} y={B.benchY} width={width} height={84} fill={WOOD} />
          <rect x={0} y={B.benchY} width={width} height={12} rx={6} fill="#E2BB8B" />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${i * 340 + 60} ${B.benchY + 34} q 90 ${8 + (i % 3) * 4} 200 0`} fill="none" stroke={WOOD_D} strokeWidth={3} opacity={0.4} />
          ))}
          {/* legs + floor */}
          {[140, 690, 1240, 1790].map((lx) => (
            <rect key={lx} x={lx - 22} y={B.benchY + 84} width={44} height={height - B.benchY - 84} fill={WOOD_D} opacity={0.85} />
          ))}
          <rect x={0} y={B.floorY} width={width} height={height - B.floorY} fill="#EED9B8" opacity={0.6} />

          {/* rug, bottom-left */}
          <ellipse cx={portrait ? 200 : 300} cy={B.floorY + 28} rx={portrait ? 180 : 250} ry={44} fill="#F6C9A0" opacity={0.7} />
          <ellipse cx={portrait ? 200 : 300} cy={B.floorY + 28} rx={portrait ? 130 : 190} ry={32} fill="#F2B98A" opacity={0.6} />
        </svg>

        {/* toys on the shelf, each with its own idle bob */}
        {/* TOYS ON THE BOARDS. The 4:5 shelf is only 118px wide, so two toys side by side
            would each have to shrink to ~33px to clear the uprights — at that size they
            read as specks. Portrait gets ONE toy per board at full size; 16:9 has room for
            two. Size is derived from the clear span between the uprights, never typed, so
            it cannot grow into the frame again. */}
        {(portrait
          ? [{ e: "🧸", row: 0 }, { e: "🪁", row: 1 }, { e: "⚽", row: 2 }]
          : [{ e: "🧸", row: 0 }, { e: "🚂", row: 0 }, { e: "🪁", row: 1 },
             { e: "🥁", row: 1 }, { e: "🦆", row: 2 }, { e: "⚽", row: 2 }]
        ).map((toy, i) => {
          const clear = B.shelfW - 36;
          const perRow = portrait ? 1 : 2;
          const size = Math.min(portrait ? 66 : 70, clear / perRow - 6);
          const boardTop = B.shelfTop + (B.shelfH / 3) * (toy.row + 1) - 16;
          const slot = portrait ? 0 : i % 2;
          const left = portrait
            ? B.shelfX + (B.shelfW - size) / 2
            : slot === 0 ? B.shelfX + 20 : B.shelfX + B.shelfW - size - 20;
          return (
            <span
              key={toy.e}
              style={{
                position: "absolute", left,
                // glyph bottom meets the board, +12% for the emoji's own bottom padding
                top: boardTop - size + size * 0.12 + bob(frame, fps, 3, 2.6, i),
                fontSize: size, lineHeight: 1,
              }}
            >
              {toy.e}
            </span>
          );
        })}

        {/* the bear, watching from beside the bench */}
        <Img
          src={staticFile("mascot.png")}
          style={{
            // centred on the rug (rug ellipse cx=300, cy=1010), feet on its middle
            position: "absolute", left: (portrait ? 200 : 300) - (portrait ? 66 : 84),
            top: B.floorY + 23 - (portrait ? 152 : 193) + bob(frame, fps, 6, 2.4),
            width: portrait ? 132 : 168, transform: `rotate(${wiggle(frame, fps, 1.6, 3)}deg)`, transformOrigin: "bottom center",
          }}
        />

        {/* THE LEGEND — a little wooden sign on the left: red = vowel, blue = consonant.
            Appears when the narration teaches it (phrase 10) and stays for the whole
            lesson, so the colour code is always one glance away. */}
        {frame >= P(10) && (
          <div
            style={{
              position: "absolute", left: B.boardX, top: (portrait ? 268 : 310) + bob(frame, fps, 5, 3),
              background: "#FFFDF7", border: "7px solid #C99B66", borderRadius: 18,
              boxShadow: "0 7px 0 #A87B48, 0 14px 24px rgba(120,80,30,0.25)",
              width: B.boardW, overflow: "hidden",
              transform: `scale(${Math.min(1, (frame - P(10)) / 8)})`, transformOrigin: "top left",
            }}
          >
            {/* the board's title strip */}
            <div style={{ background: "#C99B66", color: "#FFFDF7", textAlign: "center", fontSize: 30, fontWeight: 800, letterSpacing: 2, padding: "8px 0" }}>
              CV · VC
            </div>
            {/* At 4:5 the board's inner width is 140px but a chip + "consonant" needs
                ~204px — the chip was flex-squashed to a sliver and the word ran off the
                edge. Portrait stacks chip ABOVE label so the word gets the full width;
                flexShrink 0 means the chip can never be squeezed again. */}
            <div style={{ display: "flex", flexDirection: "column", gap: portrait ? 12 : 14, padding: portrait ? "12px 10px" : "16px 18px" }}>
              {[[VOWEL, "vowel", "a"], [CONSONANT, "consonant", "b"]].map(([c, t2, ltr]) => (
                <div
                  key={t2}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: portrait ? "column" : "row", gap: portrait ? 5 : 12,
                  }}
                >
                  <div style={{ width: portrait ? 38 : 42, height: portrait ? 38 : 42, flexShrink: 0, borderRadius: 9, background: c, boxShadow: `0 3px 0 ${darken(c, 16)}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: portrait ? 22 : 24, fontWeight: 800 }}>{ltr}</div>
                  <span style={{ fontSize: portrait ? 22 : 25, fontWeight: 800, color: c, whiteSpace: "nowrap" }}>{t2}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* (the bench tally was removed: a small copy of the stage word sitting on the
            bench read as a duplicate card and overlapped section rows — user call) */}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A wooden alphabet block. Red face = vowel, blue face = consonant — the script's law. */
export const Block: React.FC<{
  text: string; vowel: boolean; size?: number; lit?: boolean; ghost?: boolean; popAt?: number;
}> = ({ text, vowel, size = 240, lit = false, ghost = false, popAt }) => {
  const frame = useCurrentFrame();
  const c = vowel ? VOWEL : CONSONANT;
  const face = vowel ? "#FFE9E5" : "#E7F1FF";
  const pop = popAt !== undefined ? Math.min(1, Math.max(0, (frame - popAt) / 7)) : 1;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.16,
        background: ghost ? "#FFFFFF66" : "#FFFDF7",
        border: `${size * 0.055}px ${ghost ? "dashed" : "solid"} ${ghost ? `${c}66` : WOOD}`,
        boxShadow: ghost ? "none" : `0 ${size * 0.07}px 0 ${WOOD_D}, 0 ${size * 0.14}px ${size * 0.16}px rgba(120,80,30,0.30)${lit ? `, 0 0 ${size * 0.3}px ${c}88` : ""}`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        fontFamily: font.family,
      }}
    >
      <div
        style={{
          width: "76%", height: "76%", borderRadius: size * 0.1, background: ghost ? "transparent" : face,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.5, fontWeight: 800, color: ghost ? `${c}88` : c,
          transform: `scale(${0.55 + 0.45 * pop})`, opacity: ghost ? 1 : 0.35 + 0.65 * pop,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** the finished word on a wooden plank, with its picture above */
export const WordPlank: React.FC<{ word: string; pic?: string; size?: number; lit?: boolean; dim?: boolean }> = ({
  word, pic, size = 240, lit = false, dim = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.07, opacity: dim ? 0.4 : 1, fontFamily: font.family }}>
    {pic && (pic.includes(".png")
      ? <Img src={staticFile(pic)} style={{ height: size * 0.62, width: "auto" }} />
      : <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>{pic}</span>)}
    <div
      style={{
        padding: `${size * 0.08}px ${size * 0.2}px`, borderRadius: size * 0.14,
        background: "#FFFDF7", border: `${size * 0.05}px solid ${WOOD}`,
        boxShadow: `0 ${size * 0.06}px 0 ${WOOD_D}, 0 ${size * 0.12}px ${size * 0.15}px rgba(120,80,30,0.28)${lit ? ", 0 0 40px #FFD54F" : ""}`,
        fontSize: size * 0.46, fontWeight: 800, letterSpacing: 2, color: palette.ink,
      }}
    >
      {word}
    </div>
  </div>
);

/** a star burst for the click moment */
export const Click: React.FC<{ at: number; x?: number; y?: number }> = ({ at, x = 0, y = 0 }) => {
  const frame = useCurrentFrame();
  const p = (frame - at) / 16;
  if (p < 0 || p > 1) return null;
  return (
    <div style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, pointerEvents: "none" }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 30 + p * 120;
        return (
          <span
            key={i}
            style={{
              position: "absolute", left: Math.cos(a) * r - 12, top: Math.sin(a) * r - 12,
              fontSize: 26 + (i % 2) * 10, opacity: 1 - p, transform: `scale(${1 - p * 0.4})`,
            }}
          >
            {i % 2 ? "✨" : "⭐"}
          </span>
        );
      })}
    </div>
  );
};
