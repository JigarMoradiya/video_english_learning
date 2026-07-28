import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// ── The Big Stage — the ge/dge 9:16 world ────────────────────────────────────
// The portrait cut gets its OWN world, the way au/aw's night launch is nothing like its
// landscape sleepy lawn. This card named this one too: `stage` is one of its example words.
//
// It also solves the portrait teaching problem. Landscape used a MAGNIFIER to point at the
// letter before the sound; a magnifier is a horizontal, close-up gesture. In a tall frame a
// SPOTLIGHT is the natural equivalent — it comes down from above, which is the one direction
// 1080×1920 has to spare, and a theatre is where spotlights belong.
//
// The tall frame's own arc: the valance lifts at the top of the video, the footlights warm up,
// and the beam sweeps to whatever is being taught.
//
// PORTRAIT LAYOUT LAW (1080×1920, SAFE_X 90 — drapes are kept inside 0…85 so they never
// cover content):
//
//    150 …  290   headline pill
//    330 …  520   the word's picture
//    560 …  760   the tile row
//    800 …  880   the ↑ label under the deciding letter
//    905 …  985   the swap note
//   1258 … 1470   the stage floor, footlights and the performer
//   1500 …        captions only

export const STAGE_FLOOR = 1258;
const DRAPE_W = 86;

export const StageSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // the valance lifts once, at the very start — the show is beginning
  const lift = spring({ frame: frame - 8, fps, config: { damping: 16 } });
  const valanceY = interpolate(lift, [0, 1], [0, -46]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2A1024 0%, #431730 34%, #6B2440 66%, #8C3450 100%)" }}>
      {/* the auditorium behind: soft boxes and a warm haze */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        {[0.2, 0.5, 0.8].map((k, i) => (
          <ellipse key={i} cx={k * width} cy={300 + i * 120} rx={260} ry={150} fill="#FFD9A0" opacity={0.07} />
        ))}
      </svg>

      {/* the spotlight beam — a wide cone from above, always on, gently swaying */}
      {(() => {
        const sway = Math.sin(frame / 90) * 60;
        return (
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF3D0" stopOpacity={0.30} />
                <stop offset="60%" stopColor="#FFF3D0" stopOpacity={0.10} />
                <stop offset="100%" stopColor="#FFF3D0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={`M${width / 2 - 90 + sway} 120 L${width / 2 + 90 + sway} 120 L${width / 2 + 470} ${STAGE_FLOOR + 60} L${width / 2 - 470} ${STAGE_FLOOR + 60} Z`} fill="url(#beam)" />
          </svg>
        );
      })()}

      {/* motes drifting up through the beam, so the frame is never still */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const seed = i * 71.3;
          const span = 1100;
          const y = STAGE_FLOOR - ((frame * (0.5 + (i % 4) * 0.22) + seed * 11) % span);
          const x = 200 + ((seed * 5.7) % 680) + Math.sin(frame / 40 + i) * 22;
          return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 4.5 : 2.8} fill="#FFF3D0" opacity={0.42} />;
        })}
      </svg>

      {/* stage floor — warm and LIT, so white cards and dark text both read on it */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={STAGE_FLOOR} width={width} height={height - STAGE_FLOOR} fill="#8A5A3C" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={0} y={STAGE_FLOOR + 26 + i * 34} width={width} height={3} fill="#6E4429" opacity={0.5} />
        ))}
        <rect x={0} y={STAGE_FLOOR} width={width} height={16} fill="#C89B3C" />
        {/* footlights along the front edge, breathing in turn */}
        {Array.from({ length: 11 }).map((_, i) => {
          const cx = 54 + i * ((width - 108) / 10);
          const g = 0.6 + 0.4 * Math.abs(Math.sin(frame / 26 + i * 0.7));
          return (
            <g key={i}>
              <ellipse cx={cx} cy={STAGE_FLOOR - 40} rx={54} ry={40} fill="#FFE9A8" opacity={0.14 * g} />
              <circle cx={cx} cy={STAGE_FLOOR + 6} r={13} fill="#FFF3D0" opacity={g} />
            </g>
          );
        })}
      </svg>

      {/* red velvet drapes down both edges, INSIDE the safe margin */}
      {[0, 1].map((side) => (
        <svg key={side} width={DRAPE_W} height={height} style={{ position: "absolute", top: 0, left: side ? width - DRAPE_W : 0 }}>
          <rect x={0} y={0} width={DRAPE_W} height={height} fill="#8E1B36" />
          {[0, 1, 2].map((f) => (
            <path
              key={f}
              d={`M${f * 29} 0 q ${14 + Math.sin(frame / 70 + f) * 4} ${height / 2} 0 ${height}`}
              fill="none" stroke="#6B1028" strokeWidth={10} opacity={0.7}
            />
          ))}
          <rect x={side ? 0 : DRAPE_W - 7} y={0} width={7} height={height} fill="#C89B3C" opacity={0.85} />
        </svg>
      ))}

      {/* gold valance across the top, lifting as the show starts */}
      <svg width={width} height={200} style={{ position: "absolute", top: valanceY, left: 0 }}>
        <rect x={0} y={0} width={width} height={92} fill="#8E1B36" />
        <path d={`M0 92 ${Array.from({ length: 9 }).map((_, i) => `Q ${(i + 0.5) * (width / 9)} ${140 + Math.sin(frame / 60 + i) * 5} ${(i + 1) * (width / 9)} 92`).join(" ")} L${width} 0 L0 0 Z`} fill="#A32040" />
        <rect x={0} y={0} width={width} height={16} fill="#C89B3C" />
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={(i + 0.5) * (width / 9)} cy={140 + Math.sin(frame / 60 + i) * 5} r={9} fill="#E8B84B" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ── the performer, centre stage ─────────────────────────────────────────────
// The mascot takes a bow on each cue — the portrait counterpart of the landscape gavel bang,
// so the video still has a beat that lands on a verdict.
export const Performer: React.FC<{ bowAt?: number[] }> = ({ bowAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  let last = -1;
  for (const b of bowAt) if (frame >= b) last = b;
  const t = last >= 0 ? frame - last : 999;
  const bow = t < 30 ? interpolate(t, [0, 8, 18, 30], [0, 22, 22, 0]) : 0;
  return (
    <div style={{ position: "absolute", left: width / 2 - 100, top: STAGE_FLOOR - 158, width: 200 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{
          width: 196,
          transformOrigin: "bottom center",
          transform: `translateY(${bob(frame, fps, 4, 3)}px) rotate(${bow ? 0 : wiggle(frame, fps, 2.4, 2.2)}deg) rotateX(${bow}deg) scaleY(${1 - bow / 260})`,
        }}
      />
      {/* the pool of light the performer stands in */}
      <div style={{ position: "absolute", left: -52, top: 186, width: 304, height: 48, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,243,208,0.55), rgba(255,243,208,0))" }} />
    </div>
  );
};

// ── the spotlight that names the deciding letter ────────────────────────────
// Landscape used a magnifier sliding sideways. In a tall frame the beam comes from above, and
// it is anchored to the letter's own element rather than a guessed x — the landscape version
// interpolated to the card's centre and ended up over the wrong letter.
// The ring must sit ON the letter, so BOTH axes are anchored to the wrapping span's centre:
// left 50% / top 50%, then pulled back by the circle's own centre inside the svg. The first
// version only did that horizontally and set `top` from the radius, which parked the ring a
// full 78px ABOVE the letter — the beam pointed at empty air over the card.
const SPOT_CY = 300; // where the circle sits inside the svg, leaving room for the cone above

export const SpotOn: React.FC<{ at: number; r?: number }> = ({ at, r = 78 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 13 } });
  const drop = interpolate(s, [0, 1], [-260, 0]);
  const glow = 0.82 + 0.18 * Math.sin((frame / fps) * 4);
  const cx = r + 20;
  return (
    <svg
      width={cx * 2} height={SPOT_CY + r + 40}
      style={{
        position: "absolute",
        left: "50%", top: "50%",
        marginLeft: -cx, marginTop: -SPOT_CY,
        overflow: "visible", pointerEvents: "none",
      }}
    >
      <g transform={`translate(0 ${drop})`}>
        {/* the cone down onto the letter */}
        <path d={`M${cx - 26} 0 L${cx + 26} 0 L${cx + r} ${SPOT_CY + r} L${cx - r} ${SPOT_CY + r} Z`} fill="#FFF3D0" opacity={0.24 * glow} />
        <circle cx={cx} cy={SPOT_CY} r={r} fill="#FFF3D0" opacity={0.30 * glow} />
        <circle cx={cx} cy={SPOT_CY} r={r} fill="none" stroke="#FFE9A8" strokeWidth={7} opacity={0.95} />
      </g>
    </svg>
  );
};

// a small marquee bulb strip, used under the headline so the top of the frame moves too
export const Marquee: React.FC<{ top: number }> = ({ top }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", gap: 22, pointerEvents: "none" }}>
      {Array.from({ length: 11 }).map((_, i) => {
        const on = Math.sin(frame / 7 - i * 0.7) > -0.2;
        return (
          <div
            key={i}
            style={{
              width: 16, height: 16, borderRadius: "50%",
              background: on ? "#FFE9A8" : "#8C6A3A",
              boxShadow: on ? "0 0 14px #FFE9A8" : "none",
            }}
          />
        );
      })}
    </div>
  );
};

// the shared chip for this world's notes
export const StageChip: React.FC<{ tone: string; children: React.ReactNode; size?: number }> = ({ tone, children, size = 38 }) => (
  <div
    style={{
      background: "#FFFDF6", border: `6px solid ${tone}`, borderRadius: 999,
      padding: "10px 32px", fontSize: size, fontWeight: 700, color: palette.ink,
      fontFamily: font.family, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12,
      boxShadow: slab(tone.replace("#", ""), 11),
    }}
  >
    {children}
  </div>
);
