import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LETTERS } from "../data/letters";
import { LetterScene } from "../components/LetterScene";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { sec } from "../lib/timing";
import { font, palette, tint, hex, letterColorFor } from "../data/tokens";
import { Mascot } from "../components/Mascot";
import { bob } from "../lib/motion";
import { HeaderLogo } from "../components/BrandMarks";
import { BrushJar, PaintPot, StudioWall } from "../components/PaintStudio";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";

// ── A→Z "Letter Phonics Sound" video (16:9) ─────────────────────────────────
// Recreates the app's LetterPhonicsSoundView flow for all 26 letters, reusing the
// app's combined clips + highlightTimings. Each letter DRAWS ITSELF (app tracing
// geometry) then plays its full clip. Section dividers break the run into groups
// and a persistent alphabet strip tracks progress A→Z.
const FPS = 30;
const INTRO_F = 75; // 2.5s
const OUTRO_F = STORE_OUTRO_F; // shared store-download outro + CTA voiceover
const PAD = 10; // frames after the FULL clip plays out (each clip has a closing line — never trim)
const DIVIDER_F = 66; // 2.2s section divider

const sceneFrames = (durSec: number) => sec(durSec, FPS) + PAD;

// section dividers appear BEFORE these letters; each announces the group it opens
const DIVIDERS_SPEC = [
  { before: "H", label: "H – N", letters: "HIJKLMN" },
  { before: "O", label: "O – U", letters: "OPQRSTU" },
  { before: "V", label: "V – Z", letters: "VWXYZ" },
];

// lay intro → (divider?)letter × 26 → outro, tracking each letter's window
type Seg = { it: (typeof LETTERS)[number]; from: number; dur: number };
type Div = { from: number; dur: number; label: string; letters: string };
const SEGS: Seg[] = [];
const DIVIDERS: Div[] = [];
let cursor = INTRO_F;
for (const it of LETTERS) {
  const spec = DIVIDERS_SPEC.find((d) => d.before === it.letter);
  if (spec) {
    DIVIDERS.push({ from: cursor, dur: DIVIDER_F, label: spec.label, letters: spec.letters });
    cursor += DIVIDER_F;
  }
  const dur = sceneFrames(it.durSec);
  SEGS.push({ it, from: cursor, dur });
  cursor += dur;
}
const OUTRO_FROM = cursor;
export const LETTERS_DURATION = cursor + OUTRO_F;

// span the alphabet strip covers (first letter start → last letter end)
const STRIP_START = SEGS[0].from;
const STRIP_END = SEGS[SEGS.length - 1].from + SEGS[SEGS.length - 1].dur;

type Cue = { from: number; name: string; vol: number; dur?: number };
const SFX: Cue[] = [
  { from: 14, name: "sparkle", vol: 0.5 }, // intro
  ...SEGS.flatMap((s) => [
    { from: s.from + 2, name: "pop", vol: 0.38 }, // letter pops in
    { from: s.from + sec(s.it.timings[7], FPS), name: "sparkle", vol: 0.34 }, // word reveal
  ]),
  ...DIVIDERS.map((d) => ({ from: d.from + 2, name: "whoosh", vol: 0.42 })),
  { from: OUTRO_FROM + 8, name: "whoosh", vol: 0.5 },
  { from: OUTRO_FROM + 50, name: "pop", vol: 0.4 },
];

// active letter index at a composition frame (last letter that has started)
const activeIndexAt = (f: number): number => {
  let a = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].from) a = i;
  return a;
};

// Persistent bottom strip: all 26 letters, current highlighted, past filled, future faint.
const AlphabetStrip: React.FC = () => {
  const frame = useCurrentFrame();
  // both read BEFORE the early return below: pulling a hook in after it changes the hook
  // count between frames, which is React error #310 and killed the render at frame 63
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  if (frame < STRIP_START - 12 || frame > STRIP_END + 12) return null;
  const active = activeIndexAt(frame);
  const accent = letterColorFor(SEGS[active].it.letter, SEGS[active].it.imageColor);
  const fade = interpolate(frame, [STRIP_START - 12, STRIP_START + 6, STRIP_END - 6, STRIP_END + 12], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cell = (width - (portrait ? 90 : 150)) / 26;
  return (
    <div style={{ position: "absolute", bottom: portrait ? 16 : 20, left: 0, width, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: portrait ? 3 : 4, opacity: fade }}>
      {LETTERS.map((l, i) => {
        const state = i === active ? "active" : i < active ? "done" : "todo";
        // The strip IS the Paint Studio's bottom shelf: 26 tins that get painted as the
        // alphabet is worked through — every aspect, since the 16:9 wears the studio too.
        return <PaintPot key={l.letter} letter={l.letter} color={letterColorFor(l.letter, l.imageColor)} state={state} size={Math.min(portrait ? 38 : 44, cell)} />;
        const isActive = state === "active";
        const done = state === "done";
        return (
          <div
            key={l.letter}
            style={{
              width: cell, height: cell, maxWidth: 54, maxHeight: 54,
              display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12,
              background: isActive ? accent : done ? tint(letterColorFor(l.letter, l.imageColor), 0.72) : "rgba(30,36,56,0.06)",
              color: isActive ? "#fff" : done ? letterColorFor(l.letter, l.imageColor) : "rgba(30,36,56,0.32)",
              fontSize: isActive ? 30 : 24, fontWeight: 800,
              transform: `scale(${isActive ? 1.22 : 1})`,
              boxShadow: isActive ? `0 8px 18px ${hex(accent)}66` : "none",
            }}
          >
            {l.letter}
          </div>
        );
      })}
    </div>
  );
};

// Section divider card between letter groups.
const Divider: React.FC<{ label: string; letters: string }> = ({ label, letters }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(155deg, #E9F1FF 0%, #FFF6EC 72%)", alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ fontSize: 46, fontWeight: 700, color: palette.inkSoft, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>Next up</div>
        <div style={{ fontSize: 132, fontWeight: 800, color: "#5B6CF0", transform: `scale(${s}) translateY(${bob(frame, fps, 8, 2.6)}px)` }}>{label}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
          {letters.split("").map((ch, i) => {
            const p = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 11 } });
            return (
              <div key={ch} style={{ width: 74, height: 74, borderRadius: 18, background: "#fff", border: "4px solid #5B6CF0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800, color: "#5B6CF0", transform: `scale(${p})`, boxShadow: "0 10px 22px rgba(91,108,240,0.22)" }}>
                {ch}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Persistent title pill across the letter scenes (matches video #2's title bar)
const Header: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < STRIP_START || frame > STRIP_END) return null;
  const op = interpolate(frame, [STRIP_START, STRIP_START + 8, STRIP_END - 8, STRIP_END], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 30, left: 0, width: "100%", display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.78)", borderRadius: 999, padding: "8px 36px 8px 16px", boxShadow: "0 8px 22px rgba(30,36,56,0.1)", fontFamily: font.family }}>
        <HeaderLogo height={58} />
        <span style={{ fontSize: 42, fontWeight: 800, color: "#5B6CF0" }}>Letter Sounds</span>
        <span style={{ fontSize: 34, fontWeight: 800, color: palette.inkSoft, letterSpacing: 2 }}>A–Z</span>
      </div>
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const az = spring({ frame: frame - 10, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(155deg, #EDE9FF 0%, #FFF7EC 70%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 10, 2.6)}px)`, fontSize: 116, fontWeight: 800, color: palette.ink }}>Letter Sounds 🔤</div>
        <div style={{ transform: `scale(${az})`, fontSize: 84, fontWeight: 800, color: "#5B6CF0", letterSpacing: 8 }}>A → Z</div>
        <Mascot size={200} />
      </div>
    </AbsoluteFill>
  );
};


export const LettersReel: React.FC = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#FFFFFF" }}>
      {/* THE PAINT STUDIO — every aspect. The wall stays neutral and each letter's colour
          arrives in its own wash, so the frame never jump-cuts between letters. The brush
          jar sits low-left, clear of the pot shelf. */}
      <Sequence from={0} durationInFrames={OUTRO_FROM}>
        <StudioWall />
        <BrushJar />
      </Sequence>
      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(f) => interpolate(f, [0, 20, LETTERS_DURATION - 40, LETTERS_DURATION], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur ?? 45}>
          <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={INTRO_F}>
        <Intro />
      </Sequence>

      {DIVIDERS.map((d, i) => (
        <Sequence key={`div${i}`} from={d.from} durationInFrames={d.dur}>
          <Divider label={d.label} letters={d.letters} />
        </Sequence>
      ))}

      {SEGS.map((s) => (
        <Sequence key={s.it.letter} from={s.from} durationInFrames={s.dur}>
          <Audio src={staticFile(`audio/letters/${s.it.audio}.mp3`)} />
          <LetterScene item={s.it} />
        </Sequence>
      ))}

      {/* persistent alphabet progress strip + title (over the letter scenes) */}
      <AlphabetStrip />
      <Header />

      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_F}>
        {portrait ? <StoreOutroPortrait /> : <StoreOutro />}
      </Sequence>
    </AbsoluteFill>
  );
};
