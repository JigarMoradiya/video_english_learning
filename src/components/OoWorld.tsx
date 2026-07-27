import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat, sec } from "../lib/timing";
import { CkWordChip } from "./CkWordChip";
import { hex, palette } from "../data/tokens";
import { bob, pulse } from "../lib/motion";

// The persistent SPLIT-WORLD set for the oo lesson (one spelling, two sounds):
//   left  = 🌙 MOON / night world  → the LONG /oo/   (deep indigo, stars, a howling moon)
//   right = 📖 BOOK / cozy world   → the SHORT /u/    (warm amber, a reading book)
// Reads the ABSOLUTE frame (top-level child of ReelBase). The active world brightens; the
// other dims. Example words dock into their world during the long/short intros + see-it.
// The set fades out at the quiz so those beats get clean screens.

export const MOON = "#5E35B1"; // long
export const BOOK = "#E65100"; // short

interface Ex { word: string; blanked: string }
const LONG_INTRO: Ex[] = [{ word: "moon", blanked: "moon" }, { word: "zoo", blanked: "zoo" }, { word: "food", blanked: "food" }];
const SHORT_INTRO: Ex[] = [{ word: "book", blanked: "book" }, { word: "good", blanked: "good" }, { word: "foot", blanked: "foot" }];
const LONG_SEE: Ex[] = [{ word: "moon", blanked: "moon" }, { word: "food", blanked: "food" }, { word: "zoo", blanked: "zoo" }, { word: "spoon", blanked: "spoon" }];
const SHORT_SEE: Ex[] = [{ word: "book", blanked: "book" }, { word: "good", blanked: "good" }, { word: "foot", blanked: "foot" }, { word: "wood", blanked: "wood" }];

// ── code-drawn characters ────────────────────────────────────────────────────
export const Moon: React.FC<{ size: number; active: boolean; frame: number; fps: number }> = ({ size, active, frame, fps }) => {
  const howl = active ? pulse(frame, fps, 0.05, 0.9) : 1;
  const mouthOpen = active ? 0.5 + 0.5 * Math.abs(Math.sin((frame / fps) * Math.PI * 1.4)) : 0.18;
  const r = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: `scale(${howl})`, filter: active ? `drop-shadow(0 0 ${size * 0.18}px ${MOON}aa)` : "none", overflow: "visible" }}>
      <defs>
        <radialGradient id="moonG" cx="38%" cy="34%">
          <stop offset="0%" stopColor="#EDE7FF" />
          <stop offset="70%" stopColor="#C6B2F5" />
          <stop offset="100%" stopColor="#9B7DE0" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r * 0.9} fill="url(#moonG)" />
      {/* craters */}
      <circle cx={r * 0.65} cy={r * 0.7} r={r * 0.13} fill="#B49CE8" opacity={0.6} />
      <circle cx={r * 1.32} cy={r * 1.15} r={r * 0.1} fill="#B49CE8" opacity={0.5} />
      <circle cx={r * 1.2} cy={r * 0.6} r={r * 0.07} fill="#B49CE8" opacity={0.5} />
      {/* eyes */}
      <circle cx={r * 0.78} cy={r * 0.95} r={r * 0.09} fill="#3B2A66" />
      <circle cx={r * 1.22} cy={r * 0.95} r={r * 0.09} fill="#3B2A66" />
      {/* howling mouth (open O when active) */}
      <ellipse cx={r} cy={r * 1.32} rx={r * 0.16} ry={r * 0.16 * (1 + mouthOpen * 1.6)} fill="#3B2A66" />
    </svg>
  );
};

export const Book: React.FC<{ size: number; active: boolean; frame: number; fps: number }> = ({ size, active, frame, fps }) => {
  const bobY = active ? bob(frame, fps, size * 0.03, 2.2) : 0;
  const w = size;
  const h = size * 0.78;
  const m = w / 2;
  // open-book silhouette: outer top edges rise above the spine (an open book), inset gives the pages
  const sil = (i: number) => {
    const l = w * (0.06 + i);
    const r = w * (0.94 - i);
    const t = h * (0.2 + i * 0.7);
    const b = h * (0.9 - i * 0.5);
    const tOut = t - h * 0.12;
    return `M ${m} ${t} Q ${w * 0.27} ${tOut} ${l} ${t} L ${l} ${b} Q ${w * 0.27} ${b - h * 0.1} ${m} ${b} Q ${w * 0.73} ${b - h * 0.1} ${r} ${b} L ${r} ${t} Q ${w * 0.73} ${tOut} ${m} ${t} Z`;
  };
  return (
    <svg width={w} height={h} style={{ transform: `translateY(${bobY}px)`, filter: active ? `drop-shadow(0 0 ${size * 0.14}px ${BOOK}aa)` : "none", overflow: "visible" }}>
      <path d={sil(0)} fill={BOOK} />
      <path d={sil(0.035)} fill="#FFF7EC" />
      {/* spine */}
      <line x1={m} y1={h * 0.24} x2={m} y2={h * 0.88} stroke={BOOK} strokeWidth={size * 0.02} strokeLinecap="round" opacity={0.85} />
      {/* text lines */}
      {[0.5, 0.62, 0.74].map((ly, i) => (
        <g key={i}>
          <line x1={w * 0.16} y1={h * ly} x2={w * 0.42} y2={h * (ly - 0.015)} stroke="#E7C79B" strokeWidth={size * 0.014} strokeLinecap="round" />
          <line x1={w * 0.58} y1={h * (ly - 0.015)} x2={w * 0.84} y2={h * ly} stroke="#E7C79B" strokeWidth={size * 0.014} strokeLinecap="round" />
        </g>
      ))}
      {/* face on the upper pages */}
      <circle cx={w * 0.41} cy={h * 0.36} r={size * 0.038} fill="#6D4C41" />
      <circle cx={w * 0.59} cy={h * 0.36} r={size * 0.038} fill="#6D4C41" />
      <path d={`M ${w * 0.43} ${h * 0.44} Q ${m} ${h * (active ? 0.52 : 0.48)} ${w * 0.57} ${h * 0.44}`} fill="none" stroke="#6D4C41" strokeWidth={size * 0.022} strokeLinecap="round" />
    </svg>
  );
};

export const OoWorld: React.FC<{ data: PhonicsComparison; beats: Beat[] }> = ({ data, beats }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const B: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
  const f = frame;

  // The split world (characters up TOP) stays visible the whole teaching half — it's the
  // rich backdrop. Explanation beats render their content in a LOWER band beneath the
  // characters (see oo_beats' Lower), so the world stays on screen and nothing overlaps.
  // It only fades out at the quiz (that + remember + wrap are clean center-stage screens).
  const quiz = B.quizQ?.from ?? Infinity;
  if (f >= quiz + 12) return null;
  const worldOpacity = interpolate(f, [0, 25, quiz - 12, quiz + 12], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // which world is in focus this beat
  const beatId =
    f >= (B.seeIt?.from ?? Infinity) ? "seeIt"
    : f >= (B.caveat?.from ?? Infinity) ? "caveat"
    : f >= (B.hint?.from ?? Infinity) ? "hint"
    : f >= (B.strategy?.from ?? Infinity) ? "strategy"
    : f >= (B.tricky?.from ?? Infinity) ? "tricky"
    : f >= (B.short?.from ?? Infinity) ? "short"
    : f >= (B.long?.from ?? Infinity) ? "long"
    : "hook";
  const focusMoon = beatId === "long";
  const focusBook = beatId === "hint" || beatId === "caveat" || beatId === "short";
  const moonDim = focusBook ? 0.32 : 1;
  const bookDim = focusMoon ? 0.32 : 1;

  // Words docked in each world. The WHOLE list is returned from the beat start —
  // a word that hasn't been spoken yet renders as a dashed ghost slot rather than
  // being filtered out. Without this, "Here are some examples." (61.1→63.9s) and the
  // two intro lines played over an empty lower half: the first card only lands when
  // its word is spoken, ~2.7s after the beat begins.
  const docked = (list: Ex[], beat: Beat | undefined): (Ex & { at: number })[] => {
    if (!beat || f < beat.from) return [];
    return list.map((w) => ({ ...w, at: beat.from + beat.word(w.word) })).filter((x) => x.at >= beat.from);
  };
  const moonWords = beatId === "seeIt" ? docked(LONG_SEE, B.seeIt) : beatId === "long" ? docked(LONG_INTRO, B.long) : [];
  const bookWords = beatId === "seeIt" ? docked(SHORT_SEE, B.seeIt) : beatId === "short" ? docked(SHORT_INTRO, B.short) : [];

  const halfW = width / 2;
  const labeled = beatId !== "hook"; // no labels during the hook intro (avoids clutter)
  const World: React.FC<{
    side: "moon" | "book"; cx: number; dim: number; active: boolean; color: string; hint: string; words: (Ex & { at: number })[];
  }> = ({ side, cx, dim, active, color, hint, words }) => (
    <div style={{ position: "absolute", left: cx - halfW / 2, top: 0, width: halfW, height, opacity: dim, transition: "opacity 0.3s" }}>
      {/* label */}
      {labeled && (
        <div style={{ position: "absolute", top: 70, left: "50%", transform: `translateX(-50%) translateY(${bob(frame, fps, 5, 2.6, side === "moon" ? 0 : 1)}px)`, background: color, color: "#fff", borderRadius: 30, padding: "14px 40px", display: "flex", alignItems: "center", gap: 14, fontSize: 52, fontWeight: 700, boxShadow: `0 14px 34px ${color}66` }}>
          <span style={{ fontSize: 46 }}>{side === "moon" ? "🌙" : "📖"}</span> oo · {hint}
        </div>
      )}
      {/* character (kept in the TOP half so the lower band is free for beat content) */}
      <div style={{ position: "absolute", top: 190, left: "50%", transform: "translateX(-50%)" }}>
        {side === "moon" ? <Moon size={230} active={active} frame={frame} fps={fps} /> : <Book size={250} active={active} frame={frame} fps={fps} />}
      </div>
      {/* howl / short-sound cue — BELOW the character (never over it) */}
      {active && (
        <div style={{ position: "absolute", top: 450, left: "50%", transform: `translateX(-50%) scale(${pulse(frame, fps, 0.08, 0.8)})`, fontSize: side === "moon" ? 58 : 50, fontWeight: 700, color }}>
          {side === "moon" ? "oooooo" : "u"}
        </div>
      )}
      {/* docked example words (raised above the caption band) */}
      <div style={{ position: "absolute", bottom: 210, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 31, flexWrap: "wrap", justifyContent: "center", width: halfW * 0.9 }}>
        {words.map((w) =>
          f >= w.at ? (
            <CkWordChip key={w.word} word={w.word} blanked={w.blanked} colorHex={side === "moon" ? "5E35B1" : "E65100"} enterFrame={w.at} size={104} />
          ) : (
            // Ghost slot — holds the space so the row is prepared, never a bare screen.
            // The night side needs a LIGHT ghost: a #5E35B1 dashed border on the #2A2350
            // sky is invisible, which just puts the empty screen back.
            <div
              key={w.word}
              style={{
                width: 168,
                height: 176,
                borderRadius: 34,
                border: `5px dashed ${side === "moon" ? "#FFFFFF66" : `${color}66`}`,
                background: side === "moon" ? "#FFFFFF1F" : "#ffffff55",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                fontWeight: 700,
                color: side === "moon" ? "#FFFFFFAA" : `${color}99`,
                transform: `translateY(${bob(frame, fps, 5, 2.2, w.word.length)}px)`,
              }}
            >
              ?
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: worldOpacity }}>
      {/* left = night, right = cozy */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #2A2350 0%, #3A2F6E 100%)`, clipPath: `polygon(0 0, ${halfW}px 0, ${halfW}px ${height}px, 0 ${height}px)`, opacity: moonDim }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%)`, clipPath: `polygon(${halfW}px 0, ${width}px 0, ${width}px ${height}px, ${halfW}px ${height}px)`, opacity: bookDim }} />
      {/* stars in the night side */}
      <svg width={width} height={height} style={{ position: "absolute", opacity: moonDim }}>
        {[...Array(28)].map((_, i) => {
          const x = (Math.sin(i * 12.9) * 0.5 + 0.5) * (halfW - 60) + 30;
          const y = (Math.cos(i * 7.3) * 0.5 + 0.5) * (height - 120) + 40;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / fps * 1.5 + i));
          return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 3.5 : 2} fill="#fff" opacity={tw * 0.8} />;
        })}
      </svg>

      <World side="moon" cx={halfW / 2} dim={moonDim} active={focusMoon} color={MOON} hint="long /oo/" words={moonWords} />
      <World side="book" cx={halfW + halfW / 2} dim={bookDim} active={focusBook} color={BOOK} hint="short /u/" words={bookWords} />
    </AbsoluteFill>
  );
};
