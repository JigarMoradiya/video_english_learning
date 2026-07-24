import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { WIDTH, HEIGHT } from "../data/tokens";

// Per-reel drawn "world" behind the content (above the gradient) — gives each
// reel a distinct scene instead of the same abstract floaters. Code-drawn only.
export type SceneKind = "none" | "ocean" | "sky" | "party";

// layered animated water + a soft sun — the oa/ow world.
const Ocean: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bands = [
    { baseY: 1230, amp: 26, speed: 22, color: "#4FC3F7", opacity: 0.16 },
    { baseY: 1300, amp: 30, speed: 16, color: "#29B6F6", opacity: 0.18 },
    { baseY: 1370, amp: 34, speed: 12, color: "#0288D1", opacity: 0.2 },
  ];
  const wavePath = (baseY: number, amp: number, off: number) => {
    let d = `M 0 ${baseY + Math.sin(off) * amp}`;
    for (let x = 40; x <= WIDTH; x += 40) d += ` L ${x} ${baseY + Math.sin(x / 130 + off) * amp}`;
    return d + ` L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT}>
        {/* soft sun, top-right */}
        <circle cx={905} cy={250} r={120} fill="#FFE082" opacity={0.3} />
        {[...Array(10)].map((_, k) => {
          const a = (k / 10) * Math.PI * 2 + t * 0.2;
          return (
            <line
              key={k}
              x1={905 + Math.cos(a) * 128}
              y1={250 + Math.sin(a) * 128}
              x2={905 + Math.cos(a) * 150}
              y2={250 + Math.sin(a) * 150}
              stroke="#FFD54F"
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.3}
            />
          );
        })}
        {/* layered water */}
        {bands.map((b, i) => (
          <path key={i} d={wavePath(b.baseY, b.amp, t * (b.speed / 30) + i)} fill={b.color} opacity={b.opacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// a full rainbow (edge-to-edge, clouds at both ends) + drifting clouds — ai/ay.
const cloudShape = (cx: number, cy: number, s: number, opacity = 0.9) => (
  <g opacity={opacity}>
    <circle cx={cx - 52 * s} cy={cy} r={40 * s} fill="#fff" />
    <circle cx={cx + 54 * s} cy={cy} r={44 * s} fill="#fff" />
    <circle cx={cx - 12 * s} cy={cy - 30 * s} r={44 * s} fill="#fff" />
    <circle cx={cx + 26 * s} cy={cy - 22 * s} r={38 * s} fill="#fff" />
    <ellipse cx={cx} cy={cy + 8 * s} rx={92 * s} ry={40 * s} fill="#fff" />
  </g>
);

const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bands = ["#FF6B6B", "#FFA726", "#FFD54F", "#66BB6A", "#42A5F5", "#AB47BC"];
  const baseY = 520;
  const drifters = [
    { x: 0.4, y: 0.05, s: 0.8, spd: 12 },
    { x: 0.15, y: 0.34, s: 0.7, spd: 16 },
    { x: 0.82, y: 0.3, s: 0.75, spd: 10 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT}>
        {/* rainbow: elliptical arc touching both side edges, top not cut */}
        {bands.map((c, i) => {
          const inset = i * 26;
          const x0 = -30 + inset;
          const x1 = WIDTH + 30 - inset;
          const rx = (x1 - x0) / 2;
          const ry = 380 - i * 26;
          return (
            <path key={i} d={`M ${x0} ${baseY} A ${rx} ${ry} 0 0 1 ${x1} ${baseY}`} fill="none" stroke={c} strokeWidth={20} opacity={0.45} strokeLinecap="round" />
          );
        })}
        {/* clouds hiding both ends of the rainbow */}
        {cloudShape(60, baseY - 10, 1.5)}
        {cloudShape(WIDTH - 60, baseY - 10, 1.5)}
        {/* a few drifting clouds */}
        {drifters.map((c, i) => {
          const cx = ((c.x * WIDTH + t * c.spd) % (WIDTH + 320)) - 160;
          return <g key={i}>{cloudShape(cx, c.y * HEIGHT, c.s, 0.6)}</g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// floating balloons + confetti — the oi/oy party world.
const Party: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // soft pastel balloon colours (not dark)
  const colors = ["#FF9E9E", "#FFD98A", "#9EC8FF", "#A8E6B8", "#E0A8F0", "#FFBFA3"];
  const balloons = [
    { x: 0.1, phase: 0, spd: 9 },
    { x: 0.28, phase: 2, spd: 7 },
    { x: 0.72, phase: 1, spd: 8 },
    { x: 0.9, phase: 3, spd: 6 },
    { x: 0.55, phase: 4, spd: 10 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT}>
        {balloons.map((b, i) => {
          const cx = b.x * WIDTH + Math.sin(t * 0.5 + b.phase) * 24;
          const cy = HEIGHT + 140 - ((t * (18 + b.spd) + b.phase * 120) % (HEIGHT + 280)) - 60;
          const col = colors[i % colors.length];
          const kx = cx;
          const ky = cy + 58;
          // snake-shaped rope (alternating curves)
          const rope = `M ${kx} ${ky} q 16 22 0 44 q -16 22 0 44 q 16 22 0 44`;
          return (
            <g key={i} opacity={0.5}>
              <ellipse cx={cx} cy={cy} rx={44} ry={54} fill={col} />
              <ellipse cx={cx - 14} cy={cy - 18} rx={12} ry={16} fill="#fff" opacity={0.5} />
              <circle cx={kx} cy={ky} r={5} fill={col} />
              <path d={rope} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Scene: React.FC<{ kind: SceneKind }> = ({ kind }) => {
  if (kind === "ocean") return <Ocean />;
  if (kind === "sky") return <Sky />;
  if (kind === "party") return <Party />;
  return null;
};
