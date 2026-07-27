import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { CkWordChip } from "./CkWordChip";
import { Moon, Book, MOON, BOOK } from "./OoWorld";
import { bob, pulse } from "../lib/motion";

// ── The oo split world, 9:16 ─────────────────────────────────────────────────
// The 16:9 lesson splits the frame LEFT (night/moon, long /oo/) vs RIGHT
// (cosy/book, short /u/). A tall frame makes that read as two thin columns, so
// the portrait cut splits TOP vs BOTTOM instead — night sky above, reading lamp
// below, with a glowing horizon between them. Same content, different world.
//
// The other portrait change: the 16:9 keeps the world on screen and puts the
// explanation beats in a lower band beneath the characters. In 9:16 both halves
// are occupied, so instead the world DIMS during the explanation beats and the
// content takes centre stage. Trying to keep both would have meant overlapping
// them, which the repo forbids.

export const OO_NIGHT = "linear-gradient(180deg, #171436 0%, #241E52 62%, #33296B 100%)";
export const OO_COSY = "linear-gradient(180deg, #FFF6E6 0%, #FFE7BE 55%, #FFD79A 100%)";

export const SEAM = 830; // the horizon: night above, cosy below

interface Ex { word: string; blanked: string }
const LONG_INTRO: Ex[] = [{ word: "moon", blanked: "moon" }, { word: "zoo", blanked: "zoo" }, { word: "food", blanked: "food" }];
const SHORT_INTRO: Ex[] = [{ word: "book", blanked: "book" }, { word: "good", blanked: "good" }, { word: "foot", blanked: "foot" }];
const LONG_SEE: Ex[] = [{ word: "moon", blanked: "moon" }, { word: "food", blanked: "food" }, { word: "zoo", blanked: "zoo" }, { word: "spoon", blanked: "spoon" }];
const SHORT_SEE: Ex[] = [{ word: "book", blanked: "book" }, { word: "good", blanked: "good" }, { word: "foot", blanked: "foot" }, { word: "wood", blanked: "wood" }];

const rnd = (n: number, seed: number) => {
  const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// stars, confined to the night half
export const NightStars: React.FC<{ count?: number }> = ({ count = 34 }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  return (
    <svg width={width} height={SEAM} style={{ position: "absolute", top: 0, left: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = rnd(i, 3) * (width - 60) + 30;
        const y = rnd(i + 40, 3) * (SEAM - 120) + 40;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((frame / fps) * 1.5 + i));
        return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 3.6 : 2.1} fill="#fff" opacity={tw * 0.85} />;
      })}
    </svg>
  );
};

// warm dust drifting in the lamplight, confined to the cosy half
export const WarmMotes: React.FC<{ count?: number }> = ({ count = 16 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const band = height - SEAM;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rnd(i, 7) * width;
        const size = 6 + rnd(i + 30, 7) * 12;
        const speed = 0.2 + rnd(i + 60, 7) * 0.4;
        const phase = rnd(i + 90, 7) * band;
        const y = SEAM + band - ((frame * speed + phase) % band);
        const sway = Math.sin(frame * 0.02 + i) * 22;
        return (
          <div key={i} style={{ position: "absolute", left: x + sway, top: y, width: size, height: size, borderRadius: "50%", background: "#FFB74D", opacity: 0.16 + rnd(i + 120, 7) * 0.14 }} />
        );
      })}
    </>
  );
};

// showCast=false keeps the sky, horizon and ambient but drops the labels,
// characters and word chips. The explanation beats need the middle of the frame,
// and dimming alone still left the moon and book showing through the content.
export const OoWorldPortrait: React.FC<{ data: PhonicsComparison; beats: Beat[]; dim?: number; showCast?: boolean }> = ({ beats, dim = 1, showCast = true }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const B: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
  const f = frame;

  const quiz = B.quizQ?.from ?? Infinity;
  const worldOpacity = interpolate(f, [0, 22, quiz - 12, quiz + 12], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * dim;
  if (worldOpacity <= 0.01) return null;

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
  const moonDim = focusBook ? 0.34 : 1;
  const bookDim = focusMoon ? 0.34 : 1;

  const docked = (list: Ex[], beat: Beat | undefined): (Ex & { at: number })[] => {
    if (!beat || f < beat.from) return [];
    // whole list from the beat start — an unspoken word renders as a ghost slot, so
    // "Here are some examples." no longer plays over an empty row (same as the 16:9)
    return list.map((w) => ({ ...w, at: beat.from + beat.word(w.word) })).filter((x) => x.at >= beat.from);
  };
  const moonWords = beatId === "seeIt" ? docked(LONG_SEE, B.seeIt) : beatId === "long" ? docked(LONG_INTRO, B.long) : [];
  const bookWords = beatId === "seeIt" ? docked(SHORT_SEE, B.seeIt) : beatId === "short" ? docked(SHORT_INTRO, B.short) : [];
  const labeled = beatId !== "hook";

  const Label: React.FC<{ top: number; color: string; emoji: string; text: string; ph: number }> = ({ top, color, emoji, text, ph }) => (
    <div style={{ position: "absolute", top, left: 0, width, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `translateY(${bob(frame, fps, 5, 2.6, ph)}px)`, background: color, color: "#fff", borderRadius: 28, padding: "10px 32px", display: "flex", alignItems: "center", gap: 12, fontSize: 44, fontWeight: 700, boxShadow: `0 12px 30px ${color}66`, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 40 }}>{emoji}</span> oo · {text}
      </div>
    </div>
  );

  const Chips: React.FC<{ top: number; words: (Ex & { at: number })[]; hexColor: string }> = ({ top, words, hexColor }) => (
    <div style={{ position: "absolute", top, left: 0, width, display: "flex", gap: 27, flexWrap: "wrap", justifyContent: "center", alignContent: "flex-start", maxWidth: 900, marginLeft: 90, boxSizing: "border-box" }}>
      {words.map((w) =>
        f >= w.at ? (
          <CkWordChip key={w.word} word={w.word} blanked={w.blanked} colorHex={hexColor} enterFrame={w.at} size={92} />
        ) : (
          // the night side needs a LIGHT ghost — a dark border on the dark sky is invisible
          <div
            key={w.word}
            style={{
              width: 132,
              height: 138,
              borderRadius: 26,
              border: `4px dashed ${hexColor === "5E35B1" ? "#FFFFFF66" : "#E6510066"}`,
              background: hexColor === "5E35B1" ? "#FFFFFF1F" : "#ffffff55",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 46,
              fontWeight: 700,
              color: hexColor === "5E35B1" ? "#FFFFFFAA" : "#E6510099",
              transform: `translateY(${bob(frame, fps, 4, 2.2, w.word.length)}px)`,
            }}
          >
            ?
          </div>
        )
      )}
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: worldOpacity }}>
      {/* night above the horizon */}
      <div style={{ position: "absolute", top: 0, left: 0, width, height: SEAM, background: OO_NIGHT, opacity: moonDim }} />
      <div style={{ opacity: moonDim }}><NightStars /></div>
      {/* cosy lamplight below */}
      <div style={{ position: "absolute", top: SEAM, left: 0, width, height: height - SEAM, background: OO_COSY, opacity: bookDim }} />
      <div style={{ opacity: bookDim }}><WarmMotes /></div>
      {/* the horizon itself — a warm glow where the two worlds meet */}
      <div style={{ position: "absolute", top: SEAM - 26, left: 0, width, height: 52, background: "linear-gradient(180deg, rgba(255,183,77,0) 0%, rgba(255,183,77,0.55) 50%, rgba(255,183,77,0) 100%)" }} />

      {/* NIGHT half */}
      {showCast && <div style={{ opacity: moonDim }}>
        {/* top=104 keeps the pill clear of the 90px social safe margin (was 54) */}
        {labeled && <Label top={104} color={MOON} emoji="🌙" text="long /oo/" ph={0} />}
        <div style={{ position: "absolute", top: 190, left: "50%", transform: "translateX(-50%)" }}>
          <Moon size={250} active={focusMoon} frame={frame} fps={fps} />
        </div>
        {focusMoon && (
          <div style={{ position: "absolute", top: 462, left: 0, width, textAlign: "center", fontSize: 62, fontWeight: 700, color: "#C6B2F5", transform: `scale(${pulse(frame, fps, 0.08, 0.8)})` }}>oooooo</div>
        )}
        <Chips top={568} words={moonWords} hexColor="5E35B1" />
      </div>}

      {/* COSY half */}
      {showCast && <div style={{ opacity: bookDim }}>
        {labeled && <Label top={SEAM + 34} color={BOOK} emoji="📖" text="short /u/" ph={1} />}
        <div style={{ position: "absolute", top: SEAM + 132, left: "50%", transform: "translateX(-50%)" }}>
          <Book size={260} active={focusBook} frame={frame} fps={fps} />
        </div>
        {focusBook && (
          <div style={{ position: "absolute", top: SEAM + 356, left: 0, width, textAlign: "center", fontSize: 56, fontWeight: 700, color: BOOK, transform: `scale(${pulse(frame, fps, 0.08, 0.8)})` }}>u</div>
        )}
        <Chips top={SEAM + 434} words={bookWords} hexColor="E65100" />
      </div>}
    </AbsoluteFill>
  );
};
