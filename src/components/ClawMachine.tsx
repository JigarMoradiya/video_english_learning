import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// ── The Claw Machine — the ch/tch 9:16 world ─────────────────────────────────
// `catch` is this card's own word and is literally what a claw does. It also gives the
// portrait cut a POINTING DEVICE of its own: ge/dge's portrait uses a spotlight from above,
// and these two are sibling cards teaching the same shape of rule, so reusing the spotlight
// would make them read as re-crops of each other. The claw descends and its pincers close on
// the letter before the sound.
//
// PORTRAIT LAYOUT LAW (1080×1920 · pillars stay inside 0…84 and 996…1080, clear of SAFE_X 90)
//
//      0 …  150   cabinet top trim and marquee bulbs   · logo top-left 40…170
//    150 …  300   headline pill
//    300 …  410   claw rail, cable and claw
//    420 …  640   the tile row
//    660 …  740   the ↑ label under the deciding letter
//    760 …  840   the swap note
//    880 … 1050   the prize capsule holding the word's picture
//   1110 … 1296   the mascot at the joystick, feet on the pit floor
//   1258          pit floor
//   1500 …        captions only

export const PIT_FLOOR = 1258;
export const CLAW_RAIL = 300;
const PILLAR_W = 84;

export const CabinetSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #10233F 0%, #16325C 34%, #1E4A7A 64%, #2C6E9B 100%)" }}>
      {/* the glass: a soft vignette and one diagonal sheen, so the middle reads as a window */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.10} />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.03} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`M0 260 L${width * 0.62} 260 L0 ${height * 0.72} Z`} fill="url(#sheen)" />
        {/* prize capsules drifting up behind the glass — the frame is never still */}
        {Array.from({ length: 16 }).map((_, i) => {
          const seed = i * 83.1;
          const span = 1500;
          const y = PIT_FLOOR - ((frame * (0.34 + (i % 4) * 0.16) + seed * 13) % span);
          const x = 150 + ((seed * 6.1) % 780) + Math.sin(frame / 46 + i) * 20;
          const c = ["#FF8A65", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8"][i % 5];
          return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 15 : 10} fill={c} opacity={0.16} />;
        })}
      </svg>

      {/* the claw's rail, spanning the cabinet */}
      <svg width={width} height={40} style={{ position: "absolute", top: CLAW_RAIL - 20, left: 0 }}>
        <rect x={PILLAR_W} y={10} width={width - PILLAR_W * 2} height={14} rx={7} fill="#8E9BA8" />
        <rect x={PILLAR_W} y={10} width={width - PILLAR_W * 2} height={5} rx={3} fill="#C4D0DA" />
      </svg>

      {/* the prize pit */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={PIT_FLOOR} width={width} height={height - PIT_FLOOR} fill="#123253" />
        <rect x={0} y={PIT_FLOOR} width={width} height={18} rx={9} fill="#E8B84B" />
        {/* a heap of capsules resting in the pit */}
        {Array.from({ length: 22 }).map((_, i) => {
          const seed = i * 57.7;
          const x = 40 + ((seed * 7.3) % (width - 80));
          const row = i % 3;
          const y = PIT_FLOOR + 54 + row * 44 + Math.sin(frame / 60 + i) * 2;
          const c = ["#FF8A65", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8"][i % 5];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={30} fill={c} />
              <path d={`M${x - 30} ${y} a 30 30 0 0 1 60 0 Z`} fill="#FFFFFF" opacity={0.35} />
              <circle cx={x} cy={y} r={30} fill="none" stroke="#0C2440" strokeWidth={4} opacity={0.35} />
            </g>
          );
        })}
      </svg>

      {/* candy-striped pillars down both edges, inside the safe margin */}
      {[0, 1].map((side) => (
        <svg key={side} width={PILLAR_W} height={height} style={{ position: "absolute", top: 0, left: side ? width - PILLAR_W : 0 }}>
          <rect x={0} y={0} width={PILLAR_W} height={height} fill="#C62828" />
          {Array.from({ length: 26 }).map((_, i) => (
            <path key={i} d={`M-40 ${i * 90 - 40} l 60 -60 l 46 0 l -60 60 Z`} fill="#FFFDF6" opacity={0.85} />
          ))}
          <rect x={side ? 0 : PILLAR_W - 8} y={0} width={8} height={height} fill="#E8B84B" />
        </svg>
      ))}

      {/* top trim and the marquee bulbs */}
      <svg width={width} height={150} style={{ position: "absolute", top: 0, left: 0 }}>
        <rect x={0} y={0} width={width} height={104} fill="#0C2440" />
        <rect x={0} y={96} width={width} height={12} fill="#E8B84B" />
        {Array.from({ length: 13 }).map((_, i) => {
          const on = Math.sin(frame / 7 - i * 0.6) > -0.2;
          const cx = 46 + i * ((width - 92) / 12);
          return <circle key={i} cx={cx} cy={128} r={11} fill={on ? "#FFE9A8" : "#6E5A2E"} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── the claw ────────────────────────────────────────────────────────────────
// Mounted INSIDE the focus tile and anchored to that element's own centre, so it cannot drift
// onto a neighbouring letter. Both the landscape magnifier and the portrait spotlight shipped
// with exactly that bug — the magnifier interpolated to the card's centre, and the spotlight
// took its vertical position from its own radius.
export const Claw: React.FC<{ at: number; mountTop?: number }> = ({ at, mountTop = 420 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const t = frame - at;
  const drop = spring({ frame: t, fps, config: { damping: 15 } });
  const y = interpolate(drop, [0, 1], [-110, 0]);
  // the pincers close once the claw has arrived
  const grip = interpolate(t, [14, 26], [26, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sway = Math.sin(frame / 26) * 1.6;
  const W = 200, H = 150;
  // svg y=0 sits at (mountTop − H + 12), so this is where CLAW_RAIL falls in svg coords.
  // Hard-coding it made the cable overshoot the rail and run up behind the headline pill.
  const railY = CLAW_RAIL - mountTop + H - 12;
  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: "50%", top: -H + 12, marginLeft: -W / 2, overflow: "visible", pointerEvents: "none" }}
    >
      <g transform={`translate(0 ${y}) rotate(${sway} ${W / 2} 0)`}>
        {/* cable up to the rail */}
        <line x1={W / 2} y1={railY} x2={W / 2} y2={78} stroke="#8E9BA8" strokeWidth={7} />
        {/* the head */}
        <rect x={W / 2 - 34} y={70} width={68} height={26} rx={9} fill="#C4D0DA" stroke="#5A6B7A" strokeWidth={5} />
        <rect x={W / 2 - 20} y={58} width={40} height={16} rx={7} fill="#8E9BA8" />
        {/* two pincers, closing on the letter */}
        {[-1, 1].map((s) => (
          <path
            key={s}
            d={`M${W / 2 + s * 22} 96 q ${s * grip} 30 ${s * (grip * 0.7)} 52`}
            fill="none" stroke="#C4D0DA" strokeWidth={13} strokeLinecap="round"
          />
        ))}
        {[-1, 1].map((s) => (
          <path
            key={`i${s}`}
            d={`M${W / 2 + s * 22} 96 q ${s * grip} 30 ${s * (grip * 0.7)} 52`}
            fill="none" stroke="#5A6B7A" strokeWidth={5} strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
};

// ── the prize capsule that holds the word's picture ─────────────────────────
export const Capsule: React.FC<{ children: React.ReactNode; colorHex: string; at: number }> = ({ children, colorHex, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  return (
    <div
      style={{
        position: "relative", width: 210, height: 210, borderRadius: "50%",
        background: "#FFFDF6", border: `9px solid #${colorHex}`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        boxShadow: slab(colorHex, 16),
        transform: `scale(${0.7 + 0.3 * s}) translateY(${bob(frame, fps, 8, 2.6)}px) rotate(${wiggle(frame, fps, 2, 3)}deg)`,
      }}
    >
      {/* the capsule's tinted top half */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: `#${colorHex}`, opacity: 0.22 }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 6, background: `#${colorHex}`, opacity: 0.5 }} />
      {children}
    </div>
  );
};

// ── the mascot, working the joystick ────────────────────────────────────────
export const Player: React.FC<{ pressAt?: number[] }> = ({ pressAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  let last = -1;
  for (const b of pressAt) if (frame >= b) last = b;
  const t = last >= 0 ? frame - last : 999;
  const press = t < 18 ? interpolate(t, [0, 5, 12, 18], [0, -14, -10, 0]) : 0;
  // mascot.png is 923×1063 with no bottom padding, so at width 196 the element is 226px tall
  // and its last row of pixels IS the feet. Anything other than PIT_FLOOR − 226 sinks the bear
  // into the pit or floats it; the first pass used −158 and buried it 68px below the line.
  const MASCOT_W = 196;
  const MASCOT_H = Math.round(MASCOT_W * (1063 / 923));
  return (
    <div style={{ position: "absolute", left: width - 114 - 200, top: PIT_FLOOR - MASCOT_H, width: 200 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ width: MASCOT_W, transform: `translateY(${bob(frame, fps, 4, 3)}px) rotate(${wiggle(frame, fps, 2.4, 2.2)}deg)` }}
      />
      {/* the joystick it is pushing — on the bear's LEFT now that the bear stands on the right,
          so it cannot run into the cabinet pillar */}
      <svg width={130} height={130} style={{ position: "absolute", left: -68, top: 118, overflow: "visible" }}>
        <ellipse cx={48} cy={104} rx={40} ry={14} fill="#0C2440" />
        <rect x={38} y={44} width={20} height={62} rx={10} fill="#5A6B7A" transform={`rotate(${press} 48 106)`} />
        <circle cx={48 + press * 0.6} cy={40} r={22} fill="#E53935" stroke="#8E1B36" strokeWidth={5} />
        <circle cx={41 + press * 0.6} cy={33} r={6} fill="#FFFFFF" opacity={0.6} />
      </svg>
    </div>
  );
};

// this world's chip
export const ClawChip: React.FC<{ tone: string; children: React.ReactNode; size?: number }> = ({ tone, children, size = 38 }) => (
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
