import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";

// ── The two portrait worlds ──────────────────────────────────────────────────
// The 9:16 cuts carry the SAME narration as their landscape versions but are deliberately
// different worlds — a re-crop of the big top or the lawn would just be the same video
// squeezed. Both are built for a tall frame, and both fit the slot row the kit defines:
//
//   300 …  600  the world above
//   612 …  980  plates and the three slot cards (PortraitBeatKit)
//   975         the shelf the cards stand on
//  1080 … 1280  the character
//  1180 … 1452  the ground
//  1500 +       captions
//
// ou/ow → a TREEHOUSE at dusk, with an owl hopping the branch (owl is one of its own words)
// au/aw → a NIGHT LAUNCH, the rocket climbing a little further all through the video

const SHELF_Y = 975;
const GROUND_Y = 1190;

// ═══ ou/ow · the treehouse ═══════════════════════════════════════════════════
export const TreehouseSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1B3A5C 0%, #2E5E7E 26%, #6E8BA0 56%, #C8A882 100%)" }}>
      {/* a moon high on the left, clear of the top-right brand mark */}
      <svg width={180} height={180} style={{ position: "absolute", left: 60, top: 150 }}>
        <circle cx={90} cy={90} r={54} fill="#FFF3D6" opacity={0.9} />
      </svg>

      {/* the canopy — overlapping leaf clumps that breathe */}
      <svg width={width} height={620} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* three depth layers, darkest behind — a single ring of same-tone blobs read flat */}
        {[
          { n: 13, fill: "#173A19", spread: 250, yb: 40, r0: 118, k: 0.78 },
          { n: 15, fill: "#22521F", spread: 195, yb: 74, r0: 104, k: 0.72 },
          { n: 17, fill: "#2E6B2A", spread: 150, yb: 108, r0: 88, k: 0.68 },
        ].map((L, li) =>
          Array.from({ length: L.n }).map((_, i) => {
            const cx = ((i * 149 + li * 61) % (width + 160)) - 80;
            const cy = L.yb + ((i * 47 + li * 23) % L.spread);
            const r = L.r0 + ((i * 31) % 44);
            const puff = 1 + 0.03 * Math.sin(frame / (36 + (i % 5) * 8) + i + li);
            return <ellipse key={`${li}-${i}`} cx={cx} cy={cy} rx={r * puff} ry={r * L.k * puff} fill={L.fill} />;
          })
        )}
        {/* sun-catch highlights on the topmost leaves */}
        {Array.from({ length: 8 }).map((_, i) => {
          const cx = ((i * 191) % (width + 120)) - 60;
          const cy = 96 + ((i * 37) % 120);
          return <ellipse key={`h-${i}`} cx={cx} cy={cy} rx={46} ry={30} fill="#4C8A3A" opacity={0.55} />;
        })}
      </svg>

      {/* the trunk. It now runs PAST the shelf and flares into roots that meet the forest
          floor — it used to stop short and hang in the air above the ground. */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bark" x1="0" x2="1">
            <stop offset="0%" stopColor="#4E342E" />
            <stop offset="38%" stopColor="#6D4C41" />
            <stop offset="72%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>
        </defs>
        {/* tapered trunk down to the floor, then root flares */}
        <path
          d={`M${width * 0.5 - 62} 300
              C ${width * 0.5 - 78} 640, ${width * 0.5 - 86} 900, ${width * 0.5 - 96} ${GROUND_Y + 150}
              L ${width * 0.5 + 96} ${GROUND_Y + 150}
              C ${width * 0.5 + 86} 900, ${width * 0.5 + 78} 640, ${width * 0.5 + 62} 300 Z`}
          fill="url(#bark)"
        />
        {[-1, 1].map((k) => (
          <path key={k} d={`M${width * 0.5 + k * 84} ${GROUND_Y + 40} q ${k * 96} 60 ${k * 168} 108 l ${-k * 30} 34 q ${-k * 82} -46 ${-k * 150} -92 Z`} fill="#4E342E" />
        ))}
        {/* bark grain */}
        {[-40, -12, 18, 46].map((ox, i) => (
          <path key={i} d={`M${width * 0.5 + ox} 340 q ${(i % 2 ? 10 : -10)} 320 ${(i % 2 ? -6 : 8)} ${GROUND_Y - 260}`} fill="none" stroke="#3E2723" strokeWidth={5} opacity={0.4} strokeLinecap="round" />
        ))}
        {/* the shelf branch the cards stand on, with a stub where it leaves the trunk */}
        <rect x={0} y={SHELF_Y} width={width} height={30} rx={15} fill="#6D4C41" />
        <rect x={0} y={SHELF_Y} width={width} height={12} rx={6} fill="#8D6E63" />
        <ellipse cx={width * 0.5} cy={SHELF_Y + 15} rx={104} ry={26} fill="#5D4037" />
        {/* the lower branch the owl hops along */}
        <rect x={0} y={1272} width={width} height={24} rx={12} fill="#5D4037" />
        <rect x={0} y={1272} width={width} height={9} rx={4.5} fill="#795548" />
        {/* forest floor, mounded so the roots sit IN it */}
        <path d={`M0 ${GROUND_Y + 118} Q ${width / 2} ${GROUND_Y + 52} ${width} ${GROUND_Y + 118} L${width} ${height} L0 ${height} Z`} fill="#33502F" />
        <path d={`M0 ${GROUND_Y + 168} Q ${width * 0.44} ${GROUND_Y + 108} ${width} ${GROUND_Y + 168} L${width} ${height} L0 ${height} Z`} fill="#2A4227" />
      </svg>

      {/* leaves falling all the way down, so the tall frame is never still */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const seed = i * 91.7;
          const y = ((frame * (0.8 + (i % 4) * 0.22) + seed * 6) % (height + 200)) - 100;
          const x = ((seed * 13) % width) + Math.sin(frame / 30 + i) * 46;
          const rot = frame * (1.1 + (i % 3) * 0.5) + seed;
          return <ellipse key={i} cx={x} cy={y} rx={15} ry={8} fill={["#7CB342", "#C0CA33", "#FFB74D"][i % 3]} opacity={0.75} transform={`rotate(${rot} ${x} ${y})`} />;
        })}
      </svg>

      {/* undergrowth: grass TUFTS (not single blades), ferns and shaded toadstools */}
      <svg width={width} height={560} style={{ position: "absolute", left: 0, top: GROUND_Y + 96 }}>
        {Array.from({ length: 26 }).map((_, i) => {
          const gx = (i * 43) % width;
          const base = 200 + ((i * 29) % 46);
          const sway = Math.sin(frame / 28 + i * 0.6) * 6;
          return (
            <g key={i}>
              {[-1, 0, 1].map((k) => (
                <path
                  key={k}
                  d={`M${gx} ${base} q ${k * 12 + sway} ${-26 - Math.abs(k) * 6} ${k * 22 + sway * 1.5} ${-58 - Math.abs(k) * 10}`}
                  fill="none" stroke={i % 3 === 0 ? "#4E7B36" : i % 3 === 1 ? "#5C8F3E" : "#437030"}
                  strokeWidth={7} strokeLinecap="round"
                />
              ))}
            </g>
          );
        })}
        {[
          { x: 132, s: 1.15 }, { x: 470, s: 0.85 }, { x: 742, s: 1.0 }, { x: 930, s: 0.7 },
        ].map((m, i) => {
          const bobY = Math.sin(frame / 40 + i) * 2;
          return (
            <g key={i} transform={`translate(${m.x} ${214 + bobY}) scale(${m.s})`}>
              {/* stem with a slight lean and a shaded side */}
              <path d="M-11 0 q 3 -34 0 -46 l 22 0 q -3 12 0 46 Z" fill="#F5EFE6" />
              <path d="M0 0 q 2 -34 0 -46 l 11 0 q -3 12 0 46 Z" fill="#E0D7CA" />
              {/* cap, with an underside rim so it reads round */}
              <path d="M-40 -44 q 8 -40 40 -40 q 32 0 40 40 q -16 10 -40 10 q -24 0 -40 -10 Z" fill="#C62828" />
              <path d="M-40 -44 q 16 10 40 10 q 24 0 40 -10 q -14 14 -40 14 q -26 0 -40 -14 Z" fill="#8E1F1F" />
              <ellipse cx={-14} cy={-62} rx={9} ry={7} fill="#FFF3E0" opacity={0.95} />
              <ellipse cx={13} cy={-56} rx={7} ry={5.5} fill="#FFF3E0" opacity={0.95} />
              <ellipse cx={2} cy={-72} rx={5} ry={4} fill="#FFF3E0" opacity={0.9} />
            </g>
          );
        })}
        {/* a couple of ferns behind the tufts */}
        {[60, 620, 980].map((fx, i) => (
          <g key={i} transform={`translate(${fx} 205) rotate(${Math.sin(frame / 34 + i) * 3})`}>
            {[-1, 0, 1].map((k) => (
              <path key={k} d={`M0 0 q ${k * 30} -54 ${k * 52} -102`} fill="none" stroke="#3B6B2E" strokeWidth={10} strokeLinecap="round" />
            ))}
          </g>
        ))}
      </svg>

      {/* fireflies around the trunk */}
      {[0, 1, 2, 3].map((i) => {
        const fx = 140 + ((frame * (0.4 + i * 0.15) + i * 260) % (width - 280));
        const fy = 400 + Math.sin(frame / (26 + i * 8) + i) * 90;
        const g = 0.35 + 0.65 * Math.abs(Math.sin(frame / 13 + i * 1.6));
        return <div key={i} style={{ position: "absolute", left: fx, top: fy, width: 12, height: 12, borderRadius: "50%", background: "#FFF176", opacity: g, boxShadow: `0 0 18px 6px rgba(255,241,118,${0.4 * g})` }} />;
      })}
    </AbsoluteFill>
  );
};

// the owl hops along the lower branch
export const owlAt = (x: number, t: number, moving: boolean, dir: number) => <Owl x={x} t={t} moving={moving} dir={dir} />;

const Owl: React.FC<{ x: number; t: number; moving: boolean; dir: number }> = ({ x, t, moving, dir }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arc = moving ? Math.sin(Math.PI * t) * 74 : 0;
  const blink = (frame + 40) % 104 < 6 ? 0.12 : 1;
  const puff = 1 + 0.05 * Math.sin((frame / fps) * 3);
  return (
    <svg width={230} height={230} style={{ position: "absolute", left: x - 115, top: 1272 - 176 - arc, overflow: "visible" }}>
      <g transform={`translate(115 150) scale(${dir * puff} ${puff})`}>
        {/* wings out while hopping */}
        <ellipse cx={-52} cy={-34} rx={22} ry={44} fill="#8D6E63" transform={`rotate(${moving ? -40 : -8})`} />
        <ellipse cx={52} cy={-34} rx={22} ry={44} fill="#8D6E63" transform={`rotate(${moving ? 40 : 8})`} />
        <ellipse cx={0} cy={-38} rx={54} ry={62} fill="#A1887F" />
        <ellipse cx={0} cy={-24} rx={34} ry={40} fill="#D7CCC8" />
        {/* big eyes */}
        {[-22, 22].map((ex, i) => (
          <g key={i}>
            <circle cx={ex} cy={-66} r={23} fill="#FFF8E1" />
            <circle cx={ex} cy={-66} r={12 * blink + 2} fill="#3E2723" />
            <circle cx={ex + 4} cy={-70} r={4} fill="#fff" opacity={blink} />
          </g>
        ))}
        <path d="M-9 -50 L0 -36 L9 -50 Z" fill="#FFB300" />
        {/* ear tufts + feet */}
        <path d="M-46 -96 L-34 -126 L-20 -98 Z" fill="#8D6E63" />
        <path d="M46 -96 L34 -126 L20 -98 Z" fill="#8D6E63" />
        {[-20, 20].map((fx2, i) => (
          <rect key={i} x={fx2 - 8} y={16} width={16} height={12} rx={5} fill="#FFB300" />
        ))}
      </g>
    </svg>
  );
};

// ═══ au/aw · the night launch ════════════════════════════════════════════════
export const LaunchSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  // the rocket climbs all through the video — the arc you can feel with the sound off
  const climb = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  // the card row owns x 90…990 for its whole height, so the rocket has to stay ABOVE it:
  // 250 → 670 at the start, climbing out of frame. Only its thin exhaust trail crosses down.
  const rocketY = interpolate(climb, [0, 1], [250, -470]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0B1030 0%, #241C4E 34%, #4A2A63 64%, #8A4A63 100%)" }}>
      {/* stars */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 70 }).map((_, i) => {
          const sx = (i * 137.5) % width;
          const sy = (i * 97.3) % (height * 0.72);
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i));
          return <circle key={i} cx={sx} cy={sy} r={i % 8 === 0 ? 3.6 : 2} fill="#FFF8E1" opacity={0.85 * tw} />;
        })}
      </svg>

      {/* the rocket, rising on the right, trailing exhaust */}
      <svg width={220} height={420} style={{ position: "absolute", left: width - 250, top: rocketY, overflow: "visible" }}>
        <g transform={`translate(110 0) scale(0.82) rotate(${wiggle(frame, 30, 3, 0.8)})`}>
          <path d="M0 0 q 46 92 46 168 l 0 120 l -92 0 l 0 -120 q 0 -76 46 -168 Z" fill="#ECEFF1" />
          <path d="M0 0 q 46 92 46 168 l -46 0 Z" fill="#CFD8DC" />
          <circle cx={0} cy={150} r={26} fill="#4FC3F7" stroke="#90A4AE" strokeWidth={7} />
          <path d="M-46 236 l -44 68 l 44 0 Z" fill="#EF5350" />
          <path d="M46 236 l 44 68 l -44 0 Z" fill="#EF5350" />
          {/* flame */}
          {Array.from({ length: 5 }).map((_, i) => {
            const k = ((frame * 2.2 + i * 15) % 60) / 60;
            return <ellipse key={i} cx={(i - 2) * 11} cy={300 + k * 90} rx={26 - k * 18} ry={44 - k * 26} fill={i % 2 ? "#FFB300" : "#FF7043"} opacity={(1 - k) * 0.85} />;
          })}
        </g>
      </svg>

      {/* the console shelf the monitors stand on, and the pad below */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={SHELF_Y} width={width} height={30} rx={15} fill="#37474F" />
        <rect x={0} y={SHELF_Y} width={width} height={12} rx={6} fill="#546E7A" />
        <path d={`M0 ${GROUND_Y + 60} L${width} ${GROUND_Y + 60} L${width} ${height} L0 ${height} Z`} fill="#1C2431" />
        <path d={`M0 ${GROUND_Y + 60} Q ${width / 2} ${GROUND_Y + 10} ${width} ${GROUND_Y + 60}`} fill="none" stroke="#37474F" strokeWidth={10} />
      </svg>

      {/* the pad below: gantry, blinking guide lights and a distant planet, so the lower
          third has something of its own instead of flat dark */}
      <svg width={width} height={560} style={{ position: "absolute", left: 0, top: GROUND_Y + 40 }}>
        <circle cx={168} cy={330} r={92} fill="#5C6BC0" opacity={0.5} />
        <ellipse cx={168} cy={330} rx={140} ry={20} fill="none" stroke="#9FA8DA" strokeWidth={7} opacity={0.5} transform="rotate(-18 168 330)" />
        <rect x={width - 250} y={40} width={22} height={300} fill="#37474F" />
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={width - 300} y={70 + i * 58} width={122} height={12} rx={6} fill="#455A64" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => {
          const on = (Math.floor(frame / 9) + i) % 4 === 0;
          return <circle key={i} cx={70 + i * 118} cy={130} r={9} fill={on ? "#FFD54F" : "#546E7A"} opacity={on ? 1 : 0.6} />;
        })}
      </svg>

      {/* launch smoke rolling across the pad */}
      <svg width={width} height={300} style={{ position: "absolute", left: 0, top: GROUND_Y - 20 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const t = ((frame * (0.5 + i * 0.08) + i * 90) % 420) / 420;
          return <circle key={i} cx={((i * 131) % width) + t * 70} cy={120 - t * 40} r={44 + t * 46} fill="#B0BEC5" opacity={(1 - t) * 0.25} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// the mascot in a helmet, drifting between the monitors
export const astronautAt = (x: number, t: number, moving: boolean, dir: number) => <Astronaut x={x} moving={moving} dir={dir} />;

const Astronaut: React.FC<{ x: number; moving: boolean; dir: number }> = ({ x, moving, dir }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x - 96, top: 1046 + bob(frame, fps, 3, 10), width: 192, transform: `rotate(${wiggle(frame, fps, 3, moving ? 8 : 3)}deg)` }}>
      <svg width={192} height={210} style={{ position: "absolute", left: 0, top: -6, overflow: "visible" }}>
        {/* jetpack puffs while moving */}
        {moving &&
          Array.from({ length: 4 }).map((_, i) => {
            const k = ((frame * 2 + i * 12) % 44) / 44;
            return <circle key={i} cx={96 - dir * (54 + k * 40)} cy={150 + k * 20} r={16 - k * 10} fill="#B3E5FC" opacity={(1 - k) * 0.7} />;
          })}
        {/* helmet ring */}
        <circle cx={96} cy={96} r={86} fill="#B3E5FC" opacity={0.28} />
        <circle cx={96} cy={96} r={86} fill="none" stroke="#E1F5FE" strokeWidth={7} opacity={0.85} />
        <path d="M40 66 q 30 -22 62 -12" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.65} />
      </svg>
      <Img src={staticFile("mascot.png")} style={{ width: 150, marginLeft: 21, position: "relative" }} />
    </div>
  );
};
