import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { darken, font, palette } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { BLEND_AT, LIFT_FROM, WRAP_FROM } from "../data/blending916";

// ── THE ROCKET TOWER — the world for L3 · 2-Sound Blending, 9:16 ─────────────
// Blending is two pieces docking into one, and a launch stack is the most vertical object
// there is — so the metaphor and the frame agree. Two letter blocks DOCK into a word
// capsule; every capsule made adds a notch of fuel; at the wrap the rocket flies.
//
// A different world from the Toy Workshop by design: the 16:9 and 4:5 share the workshop,
// so the vertical cut gets its own show rather than a re-crop.
//
// BANDS (1080x1920) — the table exists BEFORE anything is placed, which is the lesson
// every other world in this repo taught the hard way.
//   y    0 … 210   sky, clouds, the banner
//   y  210 … 1200  THE STAGE — all teaching content
//   y 1200 … 1330  the launch pad deck
//   y 1330 … 1450  ground + smoke
//   y 1450 …       caption band
// The gantry owns x 0…168 and nothing else may; the stage is confined to 196…1044, so no
// content can ever sit under it.
export const bands = () => ({
  stageTop: 210, stageBot: 1320, padY: 1320, groundY: 1650,
  gantryX: 34, gantryW: 134, contentL: 196, contentR: 1044, bannerTop: 96,
});

export const VOWEL = "#E64A4A";
export const CONSONANT = "#2979CF";
const STEEL = "#7E93A6";
const STEEL_D = "#55697B";

export const RocketWorld: React.FC<{ bare?: boolean }> = ({ bare = false }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const B = bands();

  // fuel: one notch per blend made, 16 in all
  const made = BLEND_AT.filter((f) => frame >= f).length;
  const fuel = made / BLEND_AT.length;

  // liftoff on the SUBSCRIBE line — the payoff for filling the tank
  const lift = interpolate(frame, [LIFT_FROM, LIFT_FROM + 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // ...and the whole set steps back when the store card takes over, so the download
  // section is the only thing in focus (the dimFrom pattern every other video uses)
  const dim = interpolate(frame, [WRAP_FROM, WRAP_FROM + 20], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const riseY = lift * -900;
  const shake = lift > 0 && lift < 1 ? wiggle(frame, fps, 3, 26) : 0;

  const padTop = B.padY;
  const rocketBase = padTop - 6;
  const rocketH = 520;
  const rocketTop = rocketBase - rocketH;
  const rocketCx = B.gantryX + B.gantryW / 2;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#DCEEFB 0%,#EAF4FC 42%,#FFF3DF 82%,#FFE9C9 100%)", fontFamily: font.family }}>
      <AbsoluteFill style={{ opacity: dim }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* sun + drifting clouds */}
        <circle cx={width - 150} cy={126} r={62} fill="#FFE9A8" opacity={0.85} />
        {[{ y: 190, s: 1, d: 26 }, { y: 430, s: 0.72, d: 18 }, { y: 690, s: 0.86, d: 22 }].map((c, i) => {
          const cx = ((t * c.d + i * 520) % (width + 460)) - 230;
          return (
            <g key={i} opacity={0.85}>
              <ellipse cx={cx} cy={c.y} rx={104 * c.s} ry={44 * c.s} fill="#FFFFFF" />
              <ellipse cx={cx + 66 * c.s} cy={c.y + 10 * c.s} rx={72 * c.s} ry={34 * c.s} fill="#FFFFFF" />
              <ellipse cx={cx - 62 * c.s} cy={c.y + 12 * c.s} rx={60 * c.s} ry={30 * c.s} fill="#FFFFFF" />
            </g>
          );
        })}

        {/* THE GANTRY — left margin only */}
        <rect x={B.gantryX} y={300} width={16} height={padTop - 300} fill={STEEL} />
        <rect x={B.gantryX + B.gantryW - 16} y={300} width={16} height={padTop - 300} fill={STEEL} />
        {Array.from({ length: 9 }, (_, i) => {
          const y = 340 + i * ((padTop - 360) / 8);
          return (
            <g key={i}>
              <rect x={B.gantryX} y={y} width={B.gantryW} height={9} fill={STEEL_D} opacity={0.75} />
              <line x1={B.gantryX + 8} y1={y + 9} x2={B.gantryX + B.gantryW - 8} y2={y + ((padTop - 360) / 8) - 2}
                    stroke={STEEL_D} strokeWidth={4} opacity={0.35} />
            </g>
          );
        })}

        {/* FUEL GAUGE up the gantry — one notch per word made, no word is repeated here */}
        {(() => {
          const gy0 = 380, gy1 = padTop - 90, gw = 26;
          const gx = B.gantryX + B.gantryW / 2 - gw / 2;
          const fh = (gy1 - gy0) * fuel;
          return (
            <g>
              <rect x={gx} y={gy0} width={gw} height={gy1 - gy0} rx={12} fill="#FFFFFF" opacity={0.85} />
              <rect x={gx} y={gy1 - fh} width={gw} height={fh} rx={12} fill="#FFB300" />
              <rect x={gx} y={gy1 - fh} width={gw} height={Math.min(fh, 12)} rx={6} fill="#FFD54F" />
              <rect x={gx} y={gy0} width={gw} height={gy1 - gy0} rx={12} fill="none" stroke={STEEL_D} strokeWidth={4} />
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1={gx} y1={gy0 + ((gy1 - gy0) / 8) * (i + 1)} x2={gx + gw}
                      y2={gy0 + ((gy1 - gy0) / 8) * (i + 1)} stroke={STEEL_D} strokeWidth={2} opacity={0.4} />
              ))}
            </g>
          );
        })()}

        {/* THE ROCKET */}
        <g transform={`translate(${shake} ${riseY})`}>
          <path d={`M${rocketCx} ${rocketTop} q 44 60 44 130 L${rocketCx + 44} ${rocketBase - 60} q 0 60 -44 60 q -44 0 -44 -60 L${rocketCx - 44} ${rocketTop + 130} q 0 -70 44 -130 z`}
                fill="#FFFDF7" stroke={STEEL_D} strokeWidth={6} />
          <path d={`M${rocketCx} ${rocketTop} q 44 60 44 130 L${rocketCx - 44} ${rocketTop + 130} q 0 -70 44 -130 z`} fill={VOWEL} />
          <circle cx={rocketCx} cy={rocketTop + 178} r={26} fill="#BFE3FA" stroke={STEEL_D} strokeWidth={5} />
          <path d={`M${rocketCx - 44} ${rocketBase - 128} l -40 76 l 40 0 z`} fill={CONSONANT} />
          <path d={`M${rocketCx + 44} ${rocketBase - 128} l 40 76 l -40 0 z`} fill={CONSONANT} />
          {/* flame, only on liftoff */}
          {lift > 0 && (
            <g opacity={Math.min(1, lift * 4)}>
              <path d={`M${rocketCx - 26} ${rocketBase} q 26 ${70 + 26 * Math.sin(t * 26)} 26 ${120 + 30 * Math.sin(t * 22)} q 0 ${-50} 26 ${-120} z`} fill="#FF9800" />
              <path d={`M${rocketCx - 14} ${rocketBase} q 14 ${44 + 16 * Math.sin(t * 30)} 14 ${72} q 0 -30 14 -72 z`} fill="#FFE082" />
            </g>
          )}
        </g>

        {/* pad deck + ground */}
        <rect x={0} y={padTop} width={width} height={B.groundY - padTop} fill={STEEL} />
        <rect x={0} y={padTop} width={width} height={12} rx={6} fill="#A8BCCB" />
        {/* deck detail — the ground band was 480px of empty tan under the caption */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={40 + i * 150} y={padTop + 30} width={96} height={7} rx={3} fill={STEEL_D} opacity={0.4} />
        ))}
        {/* hazard stripes along the deck edge */}
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M${i * 52} ${B.groundY - 34} l 26 0 l -26 34 l -26 0 z`} fill={i % 2 ? "#FFC94D" : STEEL_D} opacity={0.55} />
        ))}
        {/* hold-down clamps either side of the rocket */}
        {[rocketCx - 96, rocketCx + 96].map((cx) => (
          <g key={cx}>
            <rect x={cx - 13} y={padTop - 54} width={26} height={58} rx={7} fill={STEEL_D} />
            <rect x={cx - 24} y={padTop - 62} width={48} height={16} rx={7} fill={STEEL} />
          </g>
        ))}
        {/* service pipes running along the deck */}
        <rect x={0} y={padTop + 96} width={width} height={13} rx={6} fill={STEEL_D} opacity={0.35} />
        <rect x={0} y={padTop + 150} width={width} height={9} rx={4} fill={STEEL_D} opacity={0.25} />
        <rect x={0} y={B.groundY} width={width} height={height - B.groundY} fill="#F3DCB6" opacity={0.75} />
      </svg>

      {/* pad smoke — the world's baseline motion */}
      {Array.from({ length: 7 }, (_, i) => {
        const period = 3.6 + (i % 4) * 0.5;
        const p = ((t + i * 0.5) % period) / period;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: rocketCx - 40 + Math.sin(t * 1.1 + i) * 40 + i * 12,
              top: padTop - 20 - p * 150, width: 20 + p * 46, height: 20 + p * 46,
              borderRadius: "50%", background: "#FFFFFF", opacity: 0.45 * (1 - p),
            }}
          />
        );
      })}

      {/* the bear, in mission control on the pad */}
      {!bare && <Img
        src={staticFile("mascot.png")}
        style={{
          position: "absolute", left: 250, top: padTop - 150 + bob(frame, fps, 6, 2.4),
          width: 132, transform: `rotate(${wiggle(frame, fps, 1.6, 3)}deg)`, transformOrigin: "bottom center",
        }}
      />}

      {/* the CV·VC key, on the pad's right — chip ABOVE label so nothing can squash */}
      {!bare && <div
        style={{
          position: "absolute", right: 42, top: padTop - 196,
          background: "#FFFDF7", border: `6px solid ${STEEL}`, borderRadius: 16,
          boxShadow: `0 6px 0 ${STEEL_D}, 0 12px 22px rgba(40,60,80,0.22)`,
          width: 168, overflow: "hidden",
        }}
      >
        <div style={{ background: STEEL, color: "#FFFDF7", textAlign: "center", fontSize: 26, fontWeight: 800, letterSpacing: 2, padding: "6px 0" }}>
          CV · VC
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "10px 8px" }}>
          {[[VOWEL, "vowel", "a"], [CONSONANT, "consonant", "b"]].map(([c, label, ltr]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, background: c, boxShadow: `0 3px 0 ${darken(c, 16)}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 800 }}>{ltr}</div>
              <span style={{ fontSize: 21, fontWeight: 800, color: c, whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a letter block — a metal capsule segment, red vowel / blue consonant */
export const Block: React.FC<{
  text: string; vowel: boolean; size?: number; lit?: boolean; ghost?: boolean; popAt?: number;
}> = ({ text, vowel, size = 240, lit = false, ghost = false, popAt }) => {
  const frame = useCurrentFrame();
  const c = vowel ? VOWEL : CONSONANT;
  const pop = popAt !== undefined ? Math.min(1, Math.max(0, (frame - popAt) / 7)) : 1;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.24,
        background: ghost ? "#FFFFFF55" : "#FFFDF7",
        border: `${size * 0.05}px ${ghost ? "dashed" : "solid"} ${ghost ? `${c}66` : c}`,
        boxShadow: ghost ? "none" : `0 ${size * 0.05}px 0 ${darken(c, 18)}, 0 ${size * 0.12}px ${size * 0.16}px rgba(40,60,80,0.28)${lit ? `, 0 0 ${size * 0.3}px ${c}` : ""}`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        fontFamily: font.family,
      }}
    >
      {/* rivets, so it reads as a capsule segment and not a card */}
      {!ghost && [[0.12, 0.12], [0.88, 0.12], [0.12, 0.88], [0.88, 0.88]].map(([rx, ry], i) => (
        <div key={i} style={{ position: "absolute", left: size * rx - 4, top: size * ry - 4, width: 8, height: 8, borderRadius: 4, background: `${c}55` }} />
      ))}
      <span style={{ fontSize: size * 0.5, fontWeight: 800, color: ghost ? `${c}88` : c, transform: `scale(${0.55 + 0.45 * pop})`, opacity: ghost ? 1 : 0.35 + 0.65 * pop }}>
        {text}
      </span>
    </div>
  );
};

/** the finished word as a docked capsule, picture above */
export const WordCapsule: React.FC<{ word: string; pic?: string; size?: number; lit?: boolean; dim?: boolean }> = ({
  word, pic, size = 240, lit = false, dim = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.06, opacity: dim ? 0.4 : 1, fontFamily: font.family }}>
    {pic && (pic.includes(".png")
      ? <Img src={staticFile(pic)} style={{ height: size * 0.6, width: "auto" }} />
      : <span style={{ fontSize: size * 0.54, lineHeight: 1 }}>{pic}</span>)}
    <div
      style={{
        padding: `${size * 0.09}px ${size * 0.2}px`, borderRadius: size * 0.24,
        background: "#FFFDF7", border: `${size * 0.05}px solid ${STEEL}`,
        boxShadow: `0 ${size * 0.05}px 0 ${STEEL_D}, 0 ${size * 0.11}px ${size * 0.14}px rgba(40,60,80,0.26)${lit ? ", 0 0 44px #FFD54F" : ""}`,
        fontSize: size * 0.46, fontWeight: 800, letterSpacing: 2, color: palette.ink,
      }}
    >
      {word}
    </div>
  </div>
);

/** the dock flash */
export const Click: React.FC<{ at: number; x?: number; y?: number }> = ({ at, x = 0, y = 0 }) => {
  const frame = useCurrentFrame();
  const p = (frame - at) / 16;
  if (p < 0 || p > 1) return null;
  return (
    <div style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, pointerEvents: "none" }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 30 + p * 130;
        return (
          <span key={i} style={{ position: "absolute", left: Math.cos(a) * r - 12, top: Math.sin(a) * r - 12, fontSize: 26 + (i % 2) * 10, opacity: 1 - p, transform: `scale(${1 - p * 0.4})` }}>
            {i % 2 ? "✨" : "⭐"}
          </span>
        );
      })}
    </div>
  );
};
