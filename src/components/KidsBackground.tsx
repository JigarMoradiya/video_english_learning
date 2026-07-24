import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { WIDTH, HEIGHT } from "../data/tokens";

// Exact port of the app's HomePageBackground: a soft 3-stop base gradient +
// floating blurred colour orbs + small twinkling sparkles. `hueShift` rotates
// the orb colours so each reel can have its own colour mood (same home look).

const ORBS = [
  { cx: 0.1, cy: 0.2, r: 240, color: "#A78BFA", speed: 0.1, phase: 0.0, drift: 28 },
  { cx: 0.82, cy: 0.15, r: 200, color: "#60A5FA", speed: 0.08, phase: 1.5, drift: 22 },
  { cx: 0.55, cy: 0.8, r: 220, color: "#F472B6", speed: 0.11, phase: 0.8, drift: 26 },
  { cx: 0.18, cy: 0.75, r: 175, color: "#FCD34D", speed: 0.07, phase: 2.2, drift: 18 },
  { cx: 0.9, cy: 0.6, r: 165, color: "#34D399", speed: 0.12, phase: 1.0, drift: 20 },
  { cx: 0.48, cy: 0.38, r: 185, color: "#C084FC", speed: 0.09, phase: 3.1, drift: 15 },
];

const SPARKLES = [
  { cx: 0.05, cy: 0.1, size: 0.028, speed: 0.4, phase: 0.0 },
  { cx: 0.93, cy: 0.08, size: 0.022, speed: 0.35, phase: 1.2 },
  { cx: 0.28, cy: 0.92, size: 0.03, speed: 0.45, phase: 0.5 },
  { cx: 0.72, cy: 0.88, size: 0.02, speed: 0.38, phase: 2.0 },
  { cx: 0.96, cy: 0.42, size: 0.024, speed: 0.42, phase: 1.7 },
  { cx: 0.07, cy: 0.58, size: 0.018, speed: 0.3, phase: 3.0 },
  { cx: 0.5, cy: 0.04, size: 0.026, speed: 0.5, phase: 0.3 },
  { cx: 0.76, cy: 0.52, size: 0.016, speed: 0.55, phase: 2.5 },
  { cx: 0.38, cy: 0.15, size: 0.02, speed: 0.36, phase: 1.1 },
  { cx: 0.62, cy: 0.65, size: 0.022, speed: 0.44, phase: 0.7 },
];

const R_SCALE = 2.2; // portrait canvas is larger than the app's landscape one
const minDim = Math.min(WIDTH, HEIGHT);

const sparklePoints = (cx: number, cy: number, r: number): string => {
  const ir = r * 0.25;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 4;
    const rad = i % 2 === 0 ? r : ir;
    pts.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
  }
  return pts.join(" ");
};

export const KidsBackground: React.FC<{ hueShift?: number; floater?: "sparkle" | "bubble" | "wave" }> = ({
  hueShift = 0,
  floater = "sparkle",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const amp = HEIGHT * 0.025;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom right, #F7F2FF 0%, #FDFCFF 45%, #EFF6FF 100%)",
        }}
      />

      {/* floating colour orbs */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", filter: `hue-rotate(${hueShift}deg)` }}>
        <defs>
          {ORBS.map((o, i) => (
            <radialGradient key={i} id={`orb${i}`}>
              <stop offset="0%" stopColor={o.color} stopOpacity={0.28} />
              <stop offset="60%" stopColor={o.color} stopOpacity={0.1} />
              <stop offset="100%" stopColor={o.color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>
        {ORBS.map((o, i) => {
          const cx = o.cx * WIDTH + Math.sin(t * o.speed * Math.PI + o.phase) * o.drift;
          const cy = o.cy * HEIGHT + Math.cos(t * o.speed * Math.PI + o.phase + 1) * o.drift * 0.6;
          const r = o.r * R_SCALE;
          return <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#orb${i})`} />;
        })}
      </svg>

      {/* floaters: twinkling sparkles OR rising bubbles (per reel) */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute" }}>
        {SPARKLES.map((s, i) => {
          const r = s.size * minDim;
          if (floater === "bubble") {
            // drift slowly upward and wrap around; gentle horizontal sway
            const cx = s.cx * WIDTH + Math.sin(t * s.speed * Math.PI + s.phase) * 24;
            const cy = ((s.cy * HEIGHT - t * (18 + s.speed * 40)) % (HEIGHT + 120) + HEIGHT + 120) % (HEIGHT + 120) - 60;
            const br = r * 1.7;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={br} fill="#6D28D9" opacity={0.06} />
                <circle cx={cx} cy={cy} r={br} fill="none" stroke="#7B1FA2" strokeWidth={2} opacity={0.16} />
                <circle cx={cx - br * 0.32} cy={cy - br * 0.32} r={br * 0.16} fill="#fff" opacity={0.5} />
              </g>
            );
          }
          if (floater === "wave") {
            // little wave crests drifting sideways + bobbing
            const cx = s.cx * WIDTH + Math.sin(t * s.speed * Math.PI + s.phase) * 34;
            const cy = s.cy * HEIGHT + Math.sin(t * s.speed * Math.PI + s.phase) * amp * 0.7;
            const w = r * 2.6;
            return (
              <path
                key={i}
                d={`M ${cx - w} ${cy} q ${w / 2} ${-r * 1.4} ${w} 0 q ${w / 2} ${r * 1.4} ${w} 0`}
                fill="none"
                stroke="#0277BD"
                strokeWidth={6}
                strokeLinecap="round"
                opacity={0.13}
              />
            );
          }
          const cx = s.cx * WIDTH;
          const cy = s.cy * HEIGHT + Math.sin(t * s.speed * Math.PI + s.phase) * amp;
          return <polygon key={i} points={sparklePoints(cx, cy, r)} fill="#6D28D9" opacity={0.11} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
