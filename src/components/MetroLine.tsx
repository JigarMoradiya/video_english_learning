import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { darken, font, hex } from "../data/tokens";

// ── THE METRO LINE — the world for the ai/ay 9:16 reel ───────────────────────
// A subway line diagram is the one map that is genuinely NATIVE to a tall frame: real
// ones are drawn vertically because that is the shape of a platform poster. It also
// teaches the rule for free — `ai` is an interchange in the MIDDLE of the line, `ay` is
// the TERMINUS with buffers, and "end of the line" is "end of the word".
//
// WHY THE LINE RUNS DOWN THE LEFT EDGE, not through the middle:
// the eight beats each own a different slice of the centre (Stage centres them at y725,
// but Quiz reaches lower and the recap sits higher). Every world I put BEHIND them — a
// station board, a lettered strip — collided with one beat or another. A left-hand spine
// leaves x200…1080 completely free, so no beat can ever land on it. The world grounds the
// frame from the side instead of from underneath.
const RAIL_X = 116;
const TOP_Y = 170;
const BOT_Y = 1700;

// station stops down the line. `kind` drives the marker:
//   plain       an ordinary stop
//   interchange the ai stop — double ring, the "middle of the line"
//   terminus    the ay stop — a bar across the rail, nothing after it
type Stop = { y: number; kind: "plain" | "interchange" | "terminus"; label?: string };
const STOPS: Stop[] = [
  { y: 250, kind: "plain" },
  { y: 470, kind: "plain" },
  { y: 760, kind: "interchange", label: "ai" },
  { y: 1050, kind: "plain" },
  { y: 1290, kind: "plain" },
  { y: 1620, kind: "terminus", label: "ay" },
];

// `litAt` = the frame each named stop is allowed to become the focus: the frame its own
// narration FINISHES. Before that the stop is on the map as an ordinary grey circle with
// no label, so the diagram never answers the question the voiceover is still asking.
//   ai  <- end of the shyI beat  (210+120+150+330 = 810)
//   ay  <- end of the braveY beat (810+240 = 1050)
// `blinkAi` / `blinkAy` = frames where the narration actually SAYS "ai in the middle" /
// "ay at the end". The matching stop flashes on the words, so the map is answering the
// voiceover rather than just sitting there. Frames come from the phrase timings, never typed.
// `dimFrom` = the frame the download section takes over; the map drops back so it is not
// competing with the store card.
export const MetroLine: React.FC<{
  lineColor?: string; endColor?: string; litAt?: [number, number];
  blinkAi?: number[]; blinkAy?: number[]; dimFrom?: number;
}> = ({
  lineColor = "1E88E5",
  endColor = "F4511E",
  litAt = [810, 1050],
  blinkAi = [],
  blinkAy = [],
  dimFrom,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const c = hex(lineColor);
  const e = hex(endColor);
  const t = frame / fps;

  // the service: a train bead runs the line on a loop, so the frame is never still
  const period = 13; // seconds end to end
  const p = (t % period) / period;
  const beadY = TOP_Y + p * (BOT_Y - TOP_Y);

  // 0→1→0 over ~26 frames from each cue, twice, so it reads as a blink and not a fade
  const blinkAt = (cues: number[]) =>
    Math.max(0, ...cues.map((cf) => {
      const d = frame - cf;
      if (d < 0 || d > 30) return 0;
      return Math.max(0, Math.sin((d / 30) * Math.PI * 2)) ** 0.7;
    }), 0);
  const aiBlink = blinkAt(blinkAi);
  const ayBlink = blinkAt(blinkAy);
  const dim = dimFrom !== undefined ? interpolate(frame - dimFrom, [0, 20], [1, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(170deg,#FBFAF6 0%,#F2F0E9 62%,#EAE7DE 100%)", fontFamily: font.family }}>
      <AbsoluteFill style={{ opacity: dim }}>
      {/* map paper: a faint grid, kept very low contrast so it is texture and never pattern */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: Math.ceil(height / 72) + 1 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 72} x2={width} y2={i * 72} stroke="#0B2A4A" strokeWidth={1} opacity={0.045} />
        ))}
        {Array.from({ length: Math.ceil(width / 72) + 1 }, (_, i) => (
          <line key={`v${i}`} x1={i * 72} y1={0} x2={i * 72} y2={height} stroke="#0B2A4A" strokeWidth={1} opacity={0.045} />
        ))}

        {/* two ghost branches peeling off, so it reads as a NETWORK and not one stripe */}
        <path d={`M${RAIL_X} 470 L${RAIL_X + 150} 620 L${RAIL_X + 150} 900`} fill="none" stroke="#B9C2CC" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
        <path d={`M${RAIL_X} 1050 L${RAIL_X + 108} 1158 L${RAIL_X + 108} 1330`} fill="none" stroke="#C8CFD7" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} />

        {/* the line itself — a casing under the colour gives it the printed-map weight */}
        <line x1={RAIL_X} y1={TOP_Y} x2={RAIL_X} y2={BOT_Y} stroke="#FFFFFF" strokeWidth={40} strokeLinecap="round" />
        <line x1={RAIL_X} y1={TOP_Y} x2={RAIL_X} y2={BOT_Y} stroke={c} strokeWidth={26} strokeLinecap="round" />
        {/* the last leg changes to ay's colour, so the terminus is colour-coded too */}
        <line x1={RAIL_X} y1={1290} x2={RAIL_X} y2={BOT_Y} stroke={e} strokeWidth={26} strokeLinecap="round" />

        {/* the travelling bead + its glow */}
        <circle cx={RAIL_X} cy={beadY} r={26} fill={beadY > 1290 ? e : c} opacity={0.22} />
        <circle cx={RAIL_X} cy={beadY} r={13} fill="#FFFFFF" stroke={beadY > 1290 ? e : c} strokeWidth={7} />

        {STOPS.map((s, i) => {
          const col = s.kind === "terminus" ? e : c;

          // a named stop stays an ordinary grey circle until its line has been spoken
          const gate = s.kind === "interchange" ? litAt[0] : s.kind === "terminus" ? litAt[1] : -1;
          const lit = gate < 0 || frame >= gate;
          const pop = lit && gate >= 0 ? spring({ frame: frame - gate, fps, config: { damping: 9 } }) : 1;
          if (!lit) {
            return <circle key={i} cx={RAIL_X} cy={s.y} r={13} fill="#FFFFFF" stroke="#9FB0C0" strokeWidth={7} />;
          }
          if (s.kind === "terminus") {
            return (
              <g key={i}>
                {/* buffers: the rail STOPS here. Nothing comes after ay. */}
              <g transform={`translate(${RAIL_X} ${s.y}) scale(${pop}) translate(${-RAIL_X} ${-s.y})`}>
                <line x1={RAIL_X - 46} y1={s.y} x2={RAIL_X + 46} y2={s.y} stroke={col} strokeWidth={18} strokeLinecap="round" />
                <line x1={RAIL_X - 30} y1={s.y + 22} x2={RAIL_X + 30} y2={s.y + 22} stroke={col} strokeWidth={10} strokeLinecap="round" opacity={0.55} />
              </g>
              </g>
            );
          }
          if (s.kind === "interchange") {
            return (
              <g key={i}>
                <circle cx={RAIL_X} cy={s.y} r={26 * pop} fill="#FFFFFF" stroke={col} strokeWidth={9} />
                <circle cx={RAIL_X} cy={s.y} r={13 * pop} fill={col} />
              </g>
            );
          }
          return <circle key={i} cx={RAIL_X} cy={s.y} r={13} fill="#FFFFFF" stroke="#9FB0C0" strokeWidth={7} />;
        })}
      </svg>

      {/* the two named stops get a real map tick-label, set horizontally beside the rail */}
      {STOPS.filter((s) => s.label).map((s) => {
        const col = s.kind === "terminus" ? e : c;
        const gate = s.kind === "terminus" ? litAt[1] : litAt[0];
        if (frame < gate) return null;
        const pop = interpolate(frame - gate, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const blink = s.kind === "terminus" ? ayBlink : aiBlink;
        return (
          <div
            key={s.label}
            style={{
              position: "absolute", left: RAIL_X + 58, top: s.y - 30,
              display: "flex", alignItems: "center", gap: 12,
              opacity: pop,
            }}
          >
            {/* QUIET map furniture, not a focal chip. As a white card with a 5px coloured
                border and a drop shadow these two labels competed with the teaching cards
                for attention and the frame read as clutter. A real map sets its tick-labels
                as small flat type beside the rail — no box, no shadow, muted weight. */}
            {/* the plate is back, but soft: a white pill with a hairline tint border,
                no drop shadow and no bold colour ring. Readable as map data without
                competing with the teaching cards the way the first version did. */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFFFFEE", border: `2px solid ${col}44`, borderRadius: 14, padding: "5px 14px", transform: `scale(${1 + blink * 0.18})`, transformOrigin: "left center", boxShadow: blink > 0.02 ? `0 0 ${18 * blink}px ${col}88` : "none" }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: col, opacity: 0.55 + blink * 0.45, letterSpacing: 1 }}>{s.label}</span>
              <span style={{ fontSize: 19, fontWeight: 700, color: blink > 0.3 ? col : "#8B98A5", opacity: 0.8, letterSpacing: 1.6, textTransform: "uppercase" }}>
                {s.kind === "terminus" ? "end of the line" : "middle"}
              </span>
            </div>
          </div>
        );
      })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
