import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { STAGE_TOP, safeX } from "./LandscapeBeatKit";

// ── Match Day — the ch/tch set ───────────────────────────────────────────────
// Sixth show, sixth world, and the first that ISN'T the three-position row — because this
// card's rule is a different shape. ai/ay, oi/oy, oa/ow, ou/ow and au/aw all ask WHERE in
// the word the sound sits. ch/tch asks something else entirely: what is the letter right
// BEFORE it? So the set is a word built from tiles, with that one letter spotlighted:
//
//   c · a · tch      the a is lit and labelled SHORT VOWEL  → tch
//   ch · air         nothing sits before it at all           → ch
//   lun · ch         the n is lit and labelled CONSONANT     → ch
//   bea · ch         the ea is lit and labelled LONG VOWEL   → ch
//
// The world is a sports ground because the card's own words already are: match, catch,
// fetch, pitch, coach, bench. The mascot coaches from the touchline.
//
// LAYOUT LAW (LandscapeBeatKit): the STAGE band y 300…860 only.
//
//   360 … 560   the word tiles
//   580 … 660   the spotlight label under the letter before
//   700 … 760   the verdict chip
//   768 … 860   the pitch

const TILE_H = 200;
const TILE_TOP = 360;
const LABEL_TOP = 592;
const VERDICT_TOP = 664; // above the crowd stand, which starts at PITCH_Y − 96
const PITCH_Y = 768;

// ── the ground the whole video sits on (persistent, absolute frame) ─────────
export const PitchSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (s: number, span: number, p: number) => ((frame * s + p) % (width + span)) - span;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #7EC8F0 0%, #A9DDF6 38%, #CFEBC4 62%, #6BA843 100%)" }}>
      {/* sun top-left, clear of the brand mark */}
      <svg width={230} height={230} style={{ position: "absolute", left: 40, top: 34 }}>
        <g transform="translate(115 115)">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 + frame * 0.22) * (Math.PI / 180);
            return <line key={i} x1={Math.cos(a) * 74} y1={Math.sin(a) * 74} x2={Math.cos(a) * 100} y2={Math.sin(a) * 100} stroke="#FFD54F" strokeWidth={9} strokeLinecap="round" opacity={0.8} />;
          })}
          <circle cx={0} cy={0} r={64} fill="#FFE082" />
        </g>
      </svg>

      {/* clouds */}
      {[{ s: 0.22, y: 70, k: 0.9, p: 0 }, { s: 0.15, y: 150, k: 0.66, p: 820 }].map((c, i) => (
        <svg key={i} width={340 * c.k} height={150 * c.k} viewBox="0 0 340 150" style={{ position: "absolute", left: drift(c.s, 360, c.p), top: c.y, opacity: 0.9 }}>
          <g fill="#FFFFFF">
            <ellipse cx={110} cy={96} rx={92} ry={50} />
            <ellipse cx={186} cy={80} rx={74} ry={56} />
            <ellipse cx={244} cy={102} rx={66} ry={42} />
          </g>
        </svg>
      ))}

      {/* floodlights on both sides */}
      {[safeX(width) + 30, width - safeX(width) - 30].map((fx, i) => (
        <svg key={i} width={150} height={520} style={{ position: "absolute", left: fx - 75, top: 200 }}>
          <rect x={68} y={100} width={14} height={420} fill="#78909C" />
          <rect x={30} y={62} width={90} height={44} rx={9} fill="#546E7A" />
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={46 + k * 29} cy={84} r={11} fill="#FFF9C4" opacity={0.7 + 0.3 * Math.abs(Math.sin(frame / 18 + k + i))} />
          ))}
        </svg>
      ))}

      {/* crowd stand behind the pitch */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={PITCH_Y - 96} width={width} height={96} fill="#4E5D6C" />
        {Array.from({ length: 58 }).map((_, i) => {
          const cx = 14 + i * (width / 58);
          const hop = Math.sin(frame / 11 + i * 0.8) * 3;
          return <circle key={i} cx={cx} cy={PITCH_Y - 58 + hop} r={13} fill={["#EF5350", "#FFCA28", "#42A5F5", "#66BB6A", "#AB47BC"][i % 5]} opacity={0.9} />;
        })}
        <rect x={0} y={PITCH_Y - 8} width={width} height={12} fill="#F5F5F5" opacity={0.85} />

        {/* the pitch, with mown stripes and a white line */}
        <rect x={0} y={PITCH_Y} width={width} height={height - PITCH_Y} fill="#5FA23C" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={(i * width) / 8} y={PITCH_Y} width={width / 16} height={height - PITCH_Y} fill="#6BB144" />
        ))}
        <rect x={0} y={PITCH_Y + 52} width={width} height={7} fill="#FFFFFF" opacity={0.8} />
        {/* real markings, so the lower third is a pitch rather than a green rectangle */}
        <g fill="none" stroke="#FFFFFF" strokeWidth={7} opacity={0.72}>
          <ellipse cx={width / 2} cy={height - 30} rx={250} ry={112} />
          <circle cx={width / 2} cy={height - 30} r={9} fill="#FFFFFF" />
          <path d={`M${width * 0.5 - 250} ${PITCH_Y + 56} L${width * 0.5 - 250} ${height}`} opacity={0.5} />
          <path d={`M${width * 0.5 + 250} ${PITCH_Y + 56} L${width * 0.5 + 250} ${height}`} opacity={0.5} />
          {/* penalty boxes tucked into both corners */}
          <path d={`M0 ${height - 190} L210 ${height - 190} L210 ${height}`} />
          <path d={`M${width} ${height - 190} L${width - 210} ${height - 190} L${width - 210} ${height}`} />
        </g>
        {/* corner flags */}
        {[26, width - 26].map((fx, i) => (
          <g key={i}>
            <line x1={fx} y1={PITCH_Y + 60} x2={fx} y2={PITCH_Y + 132} stroke="#FFFFFF" strokeWidth={6} />
            <path d={`M${fx} ${PITCH_Y + 62} l ${(i ? -1 : 1) * (26 + Math.sin(frame / 14 + i) * 5)} 10 l ${(i ? 1 : -1) * (26 + Math.sin(frame / 14 + i) * 5)} 10 Z`} fill="#EF5350" />
          </g>
        ))}
      </svg>

      {/* the ball, bouncing along the touchline the whole video */}
      {(() => {
        const t = (frame % 150) / 150;
        const bx = -80 + t * (width + 160);
        const by = PITCH_Y + 22 - Math.abs(Math.sin(t * Math.PI * 5)) * 62;
        return (
          <svg width={70} height={70} style={{ position: "absolute", left: bx, top: by }}>
            <g transform={`rotate(${frame * 7} 35 35)`}>
              <circle cx={35} cy={35} r={30} fill="#FFFFFF" stroke="#37474F" strokeWidth={3} />
              <path d="M35 14 l 16 12 l -6 19 l -20 0 l -6 -19 Z" fill="#37474F" />
            </g>
          </svg>
        );
      })()}
    </AbsoluteFill>
  );
};

// ── the word, built from tiles ───────────────────────────────────────────────
// parts: the word split into [before…, theLetter, theEnding]. `lit` marks which part is the
// letter being talked about, and `label` names what it is.
export type TilePart = { text: string; kind: "plain" | "focus" | "ending" };

export const WordTiles: React.FC<{
  parts: TilePart[];
  endingColor: string;
  focusLabel?: string;   // SHORT VOWEL · CONSONANT · LONG VOWEL
  focusColor?: string;
  verdict?: string;      // "so we write tch"
  enterAt: number;
  endingAt?: number;     // the ending tile lands on its own cue
  labelAt?: number;
  emoji?: React.ReactNode; // a picture for the word being built (emoji or real art)
  depth3d?: boolean;     // extruded slabs on a tilted stage — the ge/dge Word Court look
  verdictTop?: number;   // a world with no crowd stand can put the verdict lower
}> = ({ parts, endingColor, focusLabel, focusColor = "#D81B60", verdict, enterAt, endingAt = 0, labelAt = 0, emoji, depth3d = false, verdictTop }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const ec = hex(endingColor);
  const fc = hex(focusColor);
  const inn = spring({ frame: frame - enterAt, fps, config: { damping: 13 } });
  const focusIdx = parts.findIndex((p) => p.kind === "focus");

  return (
    <>
      {/* The picture for the word, so a built word is never just letters. ABOVE the row,
          not beside it — beside, it landed on top of the ending tile. */}
      {emoji && (
        <div style={{ position: "absolute", left: 0, right: 0, top: TILE_TOP - 132, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 104, transform: `scale(${spring({ frame: frame - enterAt, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 7, 3)}px)` }}>{emoji}</span>
        </div>
      )}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: TILE_TOP,
          display: "flex", justifyContent: "center", gap: depth3d ? 24 : 18, fontFamily: font.family,
          // The 3D stage. One perspective on the ROW, so all tiles share a vanishing point —
          // per-tile perspective made each one its own little world and the row read crooked.
          ...(depth3d ? { perspective: 1500, perspectiveOrigin: "50% 30%" } : {}),
        }}
      >
        {parts.map((p, i) => {
          const isEnd = p.kind === "ending";
          const isFocus = p.kind === "focus";
          const shown = isEnd ? frame >= endingAt : true;
          const s = isEnd ? spring({ frame: frame - endingAt, fps, config: { damping: 10 } }) : inn;
          const pulse = isFocus && frame >= labelAt ? 1 + 0.05 * Math.sin((frame / fps) * 6) : 1;
          const edge = isEnd ? endingColor : isFocus ? focusColor : "B7C4D4";
          // The focus tile and the ending tile stand PROUD of the plain ones — a deeper
          // extrusion plus a lift, so the letter that decides the rule is the tallest thing
          // on the bench. That's the whole teaching point, told by depth instead of a colour.
          const deep = isEnd || isFocus ? 22 : 13;
          return (
            <div
              key={i}
              style={{
                minWidth: 132, height: TILE_H, padding: "0 26px", borderRadius: 28,
                background: isEnd ? tint(endingColor, 0.88) : isFocus ? "#FFF8E1" : "#FFFFFFF2",
                border: `8px solid ${isEnd ? ec : isFocus ? fc : "#B7C4D4"}`,
                boxShadow: depth3d
                  ? slab(edge, deep)
                  : isEnd ? `0 18px 44px ${ec}55` : isFocus ? `0 16px 40px ${fc}44` : "0 12px 30px rgba(20,40,20,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 104, fontWeight: 700,
                color: isEnd ? ec : isFocus ? fc : palette.ink,
                opacity: shown ? 1 : 0,
                transform: depth3d
                  ? `rotateX(10deg) rotateY(${(i - (parts.length - 1) / 2) * 4}deg) translateZ(${isEnd || isFocus ? 40 : 0}px) scale(${(0.8 + 0.2 * s) * pulse}) translateY(${bob(frame, fps, 6, 2.2, i)}px)`
                  : `scale(${(0.8 + 0.2 * s) * pulse}) translateY(${bob(frame, fps, 6, 2.2, i)}px)`,
                transformStyle: depth3d ? "preserve-3d" : undefined,
              }}
            >
              {p.text}
            </div>
          );
        })}
      </div>

      {/* the label naming what the spotlighted letter IS */}
      {focusLabel && focusIdx >= 0 && frame >= labelAt && (
        <div style={{ position: "absolute", left: 0, right: 0, top: LABEL_TOP, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div
            style={{
              background: fc, color: "#fff", borderRadius: 999, padding: "8px 30px",
              fontSize: 34, fontWeight: 700, letterSpacing: 1.5, fontFamily: font.family, whiteSpace: "nowrap",
              transform: `scale(${spring({ frame: frame - labelAt, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 5, 2.4)}px)`,
              boxShadow: `0 12px 30px ${fc}66`,
            }}
          >
            ↑ {focusLabel}
          </div>
        </div>
      )}

      {/* the verdict — what we therefore write */}
      {verdict && frame >= endingAt && (
        <div style={{ position: "absolute", left: 0, right: 0, top: verdictTop ?? VERDICT_TOP, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "#FFFFFFF2", border: `6px solid ${ec}`, color: palette.ink, borderRadius: 999,
              padding: "10px 34px", fontSize: 40, fontWeight: 700, fontFamily: font.family, whiteSpace: "nowrap",
              transform: `scale(${0.86 + 0.14 * spring({ frame: frame - endingAt, fps, config: { damping: 12 } })})`,
              boxShadow: `0 14px 34px ${ec}44`,
            }}
          >
            {verdict}
          </div>
        </div>
      )}
    </>
  );
};

// the mascot coaching from the touchline
export const Coach: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const x = safeX(width) - 10;
  return (
    <div style={{ position: "absolute", left: x, top: PITCH_Y - 232, width: 210 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ width: 176, transform: `translateY(${bob(frame, fps, 3.6, 3)}px) rotate(${wiggle(frame, fps, 2.4, 2.6)}deg)` }}
      />
      {/* a whistle on a string, swinging */}
      <svg width={90} height={90} style={{ position: "absolute", left: 132, top: 96 }}>
        <g transform={`rotate(${Math.sin(frame / 22) * 12} 20 6)`}>
          <line x1={20} y1={0} x2={30} y2={40} stroke="#5D4037" strokeWidth={4} />
          <rect x={20} y={38} width={34} height={20} rx={9} fill="#FFC107" />
          <circle cx={30} cy={48} r={5} fill="#795548" />
        </g>
      </svg>
    </div>
  );
};
