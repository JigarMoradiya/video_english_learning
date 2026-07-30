import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { darken, font, hex } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// ── THE DIG SITE — the world for the oi/oy 9:16 reel ─────────────────────────
// Digging down through soil strata is vertical by nature, so it fits 9:16 without being
// forced, and it is built out of oi's OWN words: soil, coin, oil, point (the trowel's
// point), join. A coin seam sits MID-depth for oi; the treasure chest on the pit floor is
// the END of the dig, and it holds the oy prizes — toy, joy, boy.
//
// TWO CONSTRAINTS MEASURED FROM THE FINISHED REEL, not guessed:
//
// 1. WHERE IT MAY LIVE. The beats occupy x129…932 and y228…1419 — nearly the whole frame.
//    A panel behind them is what cost three review rounds on ai/ay (a station board hit
//    "Your turn!", then a lettered strip hit the quiz chips). So every piece of furniture
//    here sits in the free zones only: the trench wall and depth ruler in x0…112, the chest
//    in y1470…1830. The strata themselves are full-frame TEXTURE at low contrast, the same
//    role the metro's map grid plays.
//
// 2. IT MUST BE LIGHT. The beats draw dark navy ink (palette.ink). Real topsoil browns
//    would swallow it, so these are sun-bleached sandstone ochres — the banding, the cut
//    trench edge and the depth ruler are what make it read as a dig rather than as the Key
//    Shop's beige pegboard.
const WALL_X = 112;      // the cut trench edge; content starts at 129
const SKY_H = 140;
const CRUST_H = 26;
const SEAM_Y = 770;      // the oi coin seam, mid-depth
const PIT_FLOOR = 1440;
const CHEST_TOP = 1470;
const CHEST_BOT = 1830;

// sun-bleached strata, light -> deeper. Boundaries are visible; that banding IS the world.
const STRATA = [
  { h: 210, fill: "#EFE0C4" },
  { h: 250, fill: "#E7D3AE" },
  { h: 240, fill: "#DFC79C" },
  { h: 260, fill: "#D6B98A" },
  { h: 320, fill: "#CBAB79" },
];

export const DigSite: React.FC<{
  oiColor?: string;
  oyColor?: string;
  /** frames the narration says "oi … middle" — the coin seam glints */
  seamCues?: number[];
  /** frames it says "oy … end" — a prize drops to the chest on the pit floor */
  chestCues?: number[];
  /** frame the download section takes over; the site steps back */
  dimFrom?: number;
}> = ({ oiColor = "7B1FA2", oyColor = "F4511E", seamCues = [], chestCues = [], dimFrom }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const oi = hex(oiColor);
  const oy = hex(oyColor);

  const pulse = (cues: number[], len: number) =>
    Math.max(0, ...cues.map((cf) => {
      const d = frame - cf;
      if (d < 0 || d > len) return 0;
      return Math.max(0, Math.sin((d / len) * Math.PI)) ** 0.6;
    }), 0);
  const seam = pulse(seamCues, 40);
  // a prize falls from the seam down to the chest
  const dropT = Math.max(0, ...chestCues.map((cf) => {
    const d = frame - cf;
    if (d < 0 || d > 48) return 0;
    return Math.min(1, d / 36);
  }), 0);
  const dropping = chestCues.some((cf) => frame >= cf && frame - cf <= 48);
  const chestLid = pulse(chestCues.map((c) => c + 34), 26);
  // The chest used to sit dead still between cues. Now it always breathes: the lid creaks,
  // treasure glows from inside, a glint sweeps the lock and sparkles drift up out of it.
  const lidIdle = 2.4 * Math.sin(t * 1.15);            // degrees
  const glow = 0.55 + 0.45 * Math.sin(t * 1.9);        // inner treasure light
  const glint = (t * 0.42) % 1;                        // specular sweep, 0->1

  const dim = dimFrom !== undefined
    ? interpolate(frame - dimFrom, [0, 20], [1, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // strata band tops, accumulated
  let acc = SKY_H + CRUST_H;
  const bands = STRATA.map((b) => { const top = acc; acc += b.h; return { ...b, top }; });

  return (
    <AbsoluteFill style={{ background: "#EFE0C4", fontFamily: font.family }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* sky above ground level */}
          <rect x={0} y={0} width={width} height={SKY_H} fill="#CFE4EF" />
          <circle cx={width - 150} cy={62} r={44} fill="#FFE08A" opacity={0.75} />
          {/* the topsoil crust, with a few tufts */}
          <rect x={0} y={SKY_H} width={width} height={CRUST_H} fill="#8D9E52" />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M${40 + i * 78} ${SKY_H} q 6 -16 12 0`} fill="none" stroke="#7C8C45" strokeWidth={5} strokeLinecap="round" />
          ))}

          {/* the strata — texture, low contrast, full width */}
          {bands.map((b, i) => (
            <g key={i}>
              <rect x={0} y={b.top} width={width} height={b.h} fill={b.fill} />
              <rect x={0} y={b.top} width={width} height={5} fill={darken(b.fill, 30)} opacity={0.85} />
              <rect x={0} y={b.top + 5} width={width} height={22} fill={darken(b.fill, 12)} opacity={0.45} />
              {/* pebbles, deterministic so frame 0 is reproducible */}
              {Array.from({ length: 9 }, (_, k) => {
                const px = ((i * 977 + k * 613) % (width - 180)) + 90;
                const py = b.top + ((i * 271 + k * 149) % (b.h - 40)) + 20;
                const r = 4 + ((i + k) % 3) * 2.5;
                return <ellipse key={k} cx={px} cy={py} rx={r} ry={r * 0.72} fill={darken(b.fill, 20)} opacity={0.5} />;
              })}
            </g>
          ))}
          {/* deepest layer down to the pit floor */}
          <rect x={0} y={acc} width={width} height={PIT_FLOOR - acc} fill="#C09E6C" />

          {/* THE oi COIN SEAM — mid-depth. A dotted seam right across, plus a marker in the
              margin. It glints on the words "oi … middle". */}
          <rect x={0} y={SEAM_Y - 16} width={width} height={32} fill={oi} opacity={0.06 + seam * 0.16} />
          <line x1={0} y1={SEAM_Y} x2={width} y2={SEAM_Y} stroke="#FFFFFF" strokeWidth={11} opacity={0.5} />
          <line x1={0} y1={SEAM_Y} x2={width} y2={SEAM_Y} stroke={oi} strokeWidth={6 + seam * 5} strokeDasharray="20 14" opacity={0.5 + seam * 0.5} />
          {/* buried coins along the seam, in BOTH margins so neither side is dead */}
          {[34, 62, 90, width - 96, width - 66, width - 36].map((cxp, i) => (
            <g key={i}>
              <circle cx={cxp} cy={SEAM_Y} r={13 + seam * 4} fill="#E0B75A" stroke={darken("#E0B75A", 26)} strokeWidth={3} opacity={0.85 + seam * 0.15} />
              <circle cx={cxp} cy={SEAM_Y} r={5} fill={darken("#E0B75A", 30)} opacity={0.7} />
            </g>
          ))}

          {/* the cut trench edge + depth ruler, entirely inside x0…112 */}
          <rect x={WALL_X - 16} y={SKY_H + CRUST_H} width={16} height={PIT_FLOOR - SKY_H - CRUST_H} fill="#B08F5E" opacity={0.8} />
          <rect x={WALL_X - 4} y={SKY_H + CRUST_H} width={4} height={PIT_FLOOR - SKY_H - CRUST_H} fill="#8A6D42" opacity={0.55} />
          {Array.from({ length: 11 }, (_, i) => {
            const y = SKY_H + CRUST_H + 60 + i * 118;
            if (y > PIT_FLOOR - 40) return null;
            const major = i % 2 === 0;
            return <line key={i} x1={WALL_X - 16} y1={y} x2={WALL_X - (major ? 52 : 36)} y2={y} stroke="#8A6D42" strokeWidth={major ? 5 : 3} opacity={0.6} />;
          })}

          {/* roots hanging out of the topsoil, and buried finds in the RIGHT margin
              (x932…1080 was doing nothing). Both stay clear of the content zone. */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${width - 74 + i * 22} ${SKY_H + CRUST_H} q ${-12 + i * 9} 60 ${4 + i * 5} 128`} fill="none" stroke="#8A6D42" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
          ))}
          {[{ y: 470, r: 20 }, { y: 1080, r: 16 }, { y: 1260, r: 22 }].map((f, i) => (
            <g key={i} opacity={0.5}>
              <ellipse cx={width - 62} cy={f.y} rx={f.r} ry={f.r * 0.8} fill="#A98455" />
              <ellipse cx={width - 62} cy={f.y - 3} rx={f.r - 5} ry={f.r * 0.55} fill="#8A6D42" />
            </g>
          ))}
          {/* survey string with pegs across the trench, low contrast */}
          <line x1={0} y1={SKY_H + CRUST_H + 44} x2={width} y2={SKY_H + CRUST_H + 52} stroke="#9C8256" strokeWidth={3} opacity={0.4} strokeDasharray="26 18" />

          {/* the pit floor the chest stands on */}
          <rect x={0} y={PIT_FLOOR} width={width} height={26} fill="#A98455" />
          <rect x={0} y={PIT_FLOOR} width={width} height={6} fill="#8A6D42" opacity={0.6} />
          <rect x={0} y={PIT_FLOOR + 26} width={width} height={height - PIT_FLOOR - 26} fill="#B9945F" />

          {/* THE CHEST — the END of the dig. Lid bounces when a prize lands. */}
          {(() => {
            const cw = Math.min(560, width - 2 * (WALL_X + 40));
            const cx = (width - cw) / 2;
            const bodyTop = CHEST_TOP + 96;
            return (
              <g>
                {/* lid */}
                <g transform={`translate(${cx + cw / 2} ${bodyTop}) rotate(${-chestLid * 9 - lidIdle}) translate(${-(cx + cw / 2)} ${-bodyTop})`}>
                  <path d={`M${cx} ${bodyTop} q ${cw / 2} -110 ${cw} 0 z`} fill="#8D5A2B" />
                  <path d={`M${cx} ${bodyTop} q ${cw / 2} -110 ${cw} 0 z`} fill="none" stroke={darken("#8D5A2B", 18)} strokeWidth={7} />
                  <g>
                    <rect x={cx + cw / 2 - 28} y={bodyTop - 54} width={56} height={44} rx={9} fill="#E0B75A" />
                    {/* a highlight travelling across the brass */}
                    <rect x={cx + cw / 2 - 28 + glint * 56 - 7} y={bodyTop - 54} width={14} height={44} fill="#FFF3C4" opacity={0.55 * Math.sin(glint * Math.PI)} />
                    <rect x={cx + cw / 2 - 28} y={bodyTop - 54} width={56} height={44} rx={9} fill="none" stroke={darken("#E0B75A", 22)} strokeWidth={3} />
                    <circle cx={cx + cw / 2} cy={bodyTop - 34} r={7} fill="#6B4A12" />
                    <rect x={cx + cw / 2 - 3} y={bodyTop - 32} width={6} height={14} rx={3} fill="#6B4A12" />
                  </g>
                </g>
                {/* body */}
                <rect x={cx} y={bodyTop} width={cw} height={CHEST_BOT - bodyTop} rx={16} fill="#A06A33" />
                {/* the OPEN interior — the prizes sit in this shadow, so they read as being
                    inside the chest rather than stuck on its front face */}
                <rect x={cx + 26} y={bodyTop + 14} width={cw - 52} height={CHEST_BOT - bodyTop - 40} rx={12} fill="#4A2E12" />
                {/* treasure light rising out of the open chest */}
                <ellipse cx={cx + cw / 2} cy={bodyTop + 30} rx={cw * 0.42} ry={54} fill="#FFD54F" opacity={0.10 + glow * 0.22} />
                <rect x={cx + 26} y={bodyTop + 14} width={cw - 52} height={54} rx={12} fill="#2E1B08" opacity={0.55} />
                <rect x={cx} y={bodyTop} width={cw} height={CHEST_BOT - bodyTop} rx={16} fill="none" stroke={oy} strokeWidth={7} opacity={0.8} />
                {/* corner straps only — full-height bands ran straight through the prizes */}
                {[0, 1].map((i) => (
                  <rect key={i} x={i === 0 ? cx + 8 : cx + cw - 34} y={bodyTop} width={26} height={CHEST_BOT - bodyTop} rx={8} fill="#E0B75A" opacity={0.9} />
                ))}
              </g>
            );
          })()}
        </svg>

        {/* the oy words are the treasure, sitting in the chest */}
        <div style={{ position: "absolute", left: 0, width, top: CHEST_TOP + 168, display: "flex", justifyContent: "center", gap: 56 }}>
          {["🧸", "🎯", "⭐"].map((p, i) => (
            <span key={p} style={{ fontSize: 92, transform: `translateY(${bob(frame, fps, 7, 2.6, i * 0.8)}px) rotate(${wiggle(frame, fps, 5, 3.4 + i * 0.6, i)}deg)`, transformOrigin: "bottom center", filter: "drop-shadow(0 10px 18px rgba(60,40,10,0.4))" }}>
              {p}
            </span>
          ))}
        </div>

        {/* sparkles drifting up out of the chest */}
        {Array.from({ length: 9 }, (_, i) => {
          const period = 3.1 + (i % 4) * 0.55;
          const ph = ((t + i * 0.44) % period) / period;
          const sx = width / 2 - 210 + ((i * 137) % 420);
          return (
            <span
              key={i}
              style={{
                position: "absolute", left: sx + Math.sin(t * 1.5 + i) * 14,
                top: CHEST_TOP + 150 - ph * 190,
                fontSize: 16 + (i % 3) * 7,
                opacity: 0.75 * Math.sin(ph * Math.PI),
              }}
            >
              ✨
            </span>
          );
        })}

        {/* the trowel works the trench wall — the site's own idle motion */}
        <div
          style={{
            position: "absolute", left: 8, top: SEAM_Y - 250 + bob(frame, fps, 22, 3.1),
            fontSize: 62, transform: `rotate(${34 + wiggle(frame, fps, 9, 3.1)}deg)`,
            filter: "drop-shadow(0 6px 12px rgba(60,40,10,0.35))",
          }}
        >
          ⛏️
        </div>

        {/* dust drifting up out of the pit */}
        {Array.from({ length: 16 }, (_, i) => {
          const period = 5.5 + (i % 5) * 0.9;
          const p = ((t + i * 0.7) % period) / period;
          const x = 150 + ((i * 421) % (width - 300));
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: x + Math.sin(t * 0.8 + i) * 16,
                top: PIT_FLOOR - p * (PIT_FLOOR - 300),
                width: 5 + (i % 3) * 2, height: 5 + (i % 3) * 2, borderRadius: "50%",
                background: "#8A6D42", opacity: 0.3 * (1 - p),
              }}
            />
          );
        })}

        {/* the prize actually falling from the seam into the chest on an "oy … end" cue */}
        {dropping && (
          <span
            style={{
              position: "absolute", fontSize: 76,
              left: width * 0.5 - 38 + Math.sin(dropT * 6) * 26,
              top: interpolate(dropT, [0, 1], [SEAM_Y - 30, CHEST_TOP + 150]),
              filter: "drop-shadow(0 8px 16px rgba(60,40,10,0.45))",
            }}
          >
            🪙
          </span>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
