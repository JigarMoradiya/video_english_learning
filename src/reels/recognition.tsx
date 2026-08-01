import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { REC_LETTERS } from "../data/recognition";
import { LetterGrid, gridLayout, cellCenterFor } from "../components/LetterGrid";
import { RecognitionPanel } from "../components/RecognitionPanel";
import { sec } from "../lib/timing";
import { font, palette } from "../data/tokens";
import { Mascot } from "../components/Mascot";
import { Confetti } from "../components/Confetti";
import { PracticeRound } from "../components/PracticeRound";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { PRACTICE, PROMPTS, PRAISES, roundPlan, PRACTICE_INTRO_DUR } from "../data/practice";
import { bob } from "../lib/motion";
import { HeaderLogo } from "../components/BrandMarks";
import { AquariumWorld } from "../components/Aquarium";
import { letterColorFor } from "../data/tokens";

// ── A→Z "Letter Recognition" video (16:9) ───────────────────────────────────
// Recreates the app's MainLetterRecognitionView ("A says a"). The 26-letter GRID is the
// star: a spotlight hops tile→tile, each picked tile flies into the right panel (letter →
// says → sound, synced to the trio clip), celebrates, and locks in with a ✓ — the board
// fills up A→Z (grid = progress). Distinct from video #1 (no self-drawing letters).
const FPS = 30;
const INTRO_F = 75;
const OUTRO_F = STORE_OUTRO_F; // shared store-download outro + CTA voiceover
const T_MOVE = 12; // spotlight sweep + letter fly-in
const LEAD = 8; // tile locks before audio
const PAD = 8; // let the sound tail ring out
const CELEB = 24; // confetti + tile→done hold
const FINALE_F = 108; // 3.6s "you found all 26!" celebration before the outro

const audioRel = LEAD + T_MOVE; // audio start within a letter sequence
const budget = (r: (typeof REC_LETTERS)[number]) => T_MOVE + LEAD + sec(r.d0 + r.d1 + r.d2, FPS) + PAD + CELEB;

let cursor = INTRO_F;
const SEGS = REC_LETTERS.map((it, i) => {
  const from = cursor;
  const dur = budget(it);
  const soundEndAbs = from + audioRel + sec(it.d0 + it.d1 + it.d2, FPS);
  cursor += dur;
  return { it, i, from, dur, soundEndAbs };
});
const LETTERS_END = cursor;

// ── Practice: "Now let's practice!" intro card, then 10 listen-&-pick rounds ──
const PINTRO_F = sec(PRACTICE_INTRO_DUR, FPS) + 56; // ~3.4s transition card
const PRACTICE_INTRO_FROM = LETTERS_END;
cursor = LETTERS_END + PINTRO_F;
const PRACTICE_FROM = cursor;
const ROUNDS = PRACTICE.map((q, i) => {
  const prompt = PROMPTS[i % PROMPTS.length]; // cycle prompt wording
  const praise = PRAISES[i % PRAISES.length]; // cycle praise
  const plan = roundPlan(q, prompt.dur, praise.dur);
  const from = cursor;
  cursor += plan.dur;
  return { q, prompt, praise, plan, from };
});
const PRACTICE_END = cursor;

const FINALE_FROM = cursor; // completed-board celebration
const OUTRO_FROM = FINALE_FROM + FINALE_F;
export const RECOGNITION_DURATION = OUTRO_FROM + OUTRO_F;

// current letter index at a composition frame (-1 during the intro, 26 = all done in finale)
const activeIndexAt = (f: number): number => {
  if (f >= FINALE_FROM) return 26;
  if (f < SEGS[0].from) return -1;
  let a = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].from) a = i;
  return a;
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: 8, name: "chime_soft", vol: 0.34 }, // gentle warm start (was harsh drumroll)
  ...SEGS.flatMap((s) => [
    { from: s.from, name: "swoosh_soft", vol: 0.24 }, // smooth spotlight sweep (was whoosh)
    { from: s.from + T_MOVE, name: "pop", vol: 0.3 }, // soft tile select
    { from: s.soundEndAbs, name: "correct", vol: 0.4 }, // celebrate
  ]),
  { from: PRACTICE_INTRO_FROM + 2, name: "swoosh_soft", vol: 0.3 }, // into practice
  ...ROUNDS.map((r) => ({ from: r.from + r.plan.revealAt, name: "twinkle", vol: 0.32 })), // correct sparkle
  { from: FINALE_FROM + 4, name: "sparkle", vol: 0.5 }, // finale fanfare
  { from: FINALE_FROM + 46, name: "twinkle", vol: 0.4 },
  { from: OUTRO_FROM + 8, name: "chime_soft", vol: 0.34 },
];

// ── background: THE AQUARIUM — recognition's OWN world ───────────────────────
// The game is a search, and underwater the spotlight is a diver's torch. The water runs
// to the FINAL frame and steps back at the outro; the active letter's colour arrives as
// a light-pool that crossfades over the spotlight sweep. Washes belong to the TEACHING
// run — once practice starts, Z's red would otherwise tint the whole quiz.
const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const active = activeIndexAt(frame);
  const dim = interpolate(frame, [OUTRO_FROM, OUTRO_FROM + 20], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const teaching = frame < PRACTICE_INTRO_FROM + 16;
  const cur = teaching && active >= 0 && active < 26 ? REC_LETTERS[active] : null;
  const prev = teaching && active >= 1 && active <= 26 ? REC_LETTERS[active - 1] : null;
  const fadeIn = cur ? interpolate(frame - SEGS[active].from, [0, T_MOVE + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill style={{ opacity: dim }}>
      <AquariumWorld tone={prev && fadeIn < 1 ? letterColorFor(prev.letter, prev.imageColor) : undefined} />
      {cur && (
        <div style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
          <AquariumWorld tone={letterColorFor(cur.letter, cur.imageColor)} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── persistent grid + moving spotlight (composition frame) ───────────────────
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const GridLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame >= OUTRO_FROM) return null;
  if (frame >= PRACTICE_INTRO_FROM && frame < FINALE_FROM) return null; // hidden during practice
  const active = activeIndexAt(frame);
  const seg = active >= 0 ? SEGS[active] : null;
  const activeDone = seg ? frame >= seg.soundEndAbs : false;

  // soft warm spotlight glow travels from the previous cell to the current cell over T_MOVE
  // (behind the tiles — no clashing hard ring)
  let glow: React.ReactNode = null;
  if (seg) {
    const mv = easeOut(interpolate(frame - seg.from, [0, T_MOVE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const from = active > 0 ? cellCenterFor(active - 1, width, height) : cellCenterFor(active, width, height);
    const to = cellCenterFor(active, width, height);
    const x = from.x + (to.x - from.x) * mv;
    const y = from.y + (to.y - from.y) * mv;
    const r = gridLayout(width, height).cell * 1.15;
    glow = (
      <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,159,67,0.55) 0%, rgba(255,159,67,0.22) 45%, rgba(255,159,67,0) 72%)", opacity: activeDone ? 0.3 : 1 }} />
    );
  }

  return (
    <>
      {glow}
      <LetterGrid active={active} activeDone={activeDone} />
    </>
  );
};

// Persistent title (pill) + live progress counter — whole video, minus intro/outro cards
const Header: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < INTRO_F || frame >= OUTRO_FROM) return null;
  const op = interpolate(frame, [INTRO_F, INTRO_F + 8, OUTRO_FROM - 12, OUTRO_FROM], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // counter = letters found during teaching, quiz progress during practice, hidden on the cards
  let counter: string | null = null;
  if (frame < PRACTICE_INTRO_FROM) {
    counter = `${SEGS.filter((s) => frame >= s.soundEndAbs).length} / 26`;
  } else if (frame >= PRACTICE_FROM && frame < FINALE_FROM) {
    counter = `${Math.min(ROUNDS.length, Math.max(1, ROUNDS.filter((r) => frame >= r.from).length))} / ${ROUNDS.length}`;
  }
  return (
    <>
      <div style={{ position: "absolute", top: 30, left: 0, width: "100%", display: "flex", justifyContent: "center", opacity: op }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.78)", borderRadius: 999, padding: "8px 36px 8px 16px", boxShadow: "0 8px 22px rgba(30,36,56,0.1)", fontFamily: font.family }}>
          <HeaderLogo height={58} />
          <span style={{ fontSize: 42, fontWeight: 800, color: "#8E24AA" }}>Phonics</span>
          <span style={{ fontSize: 42, fontWeight: 800, color: palette.ink }}>Letter Sounds</span>
        </div>
      </div>
      {counter && (
        <div style={{ position: "absolute", top: 38, right: 56, opacity: op }}>
          <div style={{ background: "rgba(142,36,170,0.12)", color: "#8E24AA", borderRadius: 999, padding: "8px 22px", fontSize: 34, fontWeight: 800, fontFamily: font.family }}>{counter}</div>
        </div>
      )}
    </>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const sub = spring({ frame: frame - 10, fps, config: { damping: 11 } });
  // 16:9: title right of the board. Portrait: the board owns the top, so the title
  // takes the band beneath it.
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <div style={{ position: "absolute", ...(portrait ? { left: 0, top: gridLayout(width, height).bottom, width, height: height - gridLayout(width, height).bottom } : { left: 1000, top: 0, width: 860, height: "100%" }), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ textAlign: "center", lineHeight: 1.05, transform: `scale(${s}) translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#8E24AA" }}>Phonics</div>
          <div style={{ fontSize: 96, fontWeight: 800, color: palette.ink }}>Letter Sounds</div>
        </div>
        <div style={{ fontSize: 50, fontWeight: 700, color: palette.inkSoft, opacity: sub }}>26 Letters · 26 Sounds</div>
        <div style={{ transform: `scale(${sub})` }}><Mascot size={172} /></div>
      </div>
    </AbsoluteFill>
  );
};

// Transition into the quiz — "Now let's practice!" (full-screen card, plays its own line)
const PracticeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const sub = spring({ frame: frame - 12, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill style={{ background: "rgba(236,250,253,0.66)", alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={sec(PRACTICE_INTRO_DUR, FPS) + 6}><Audio src={staticFile("audio/recognition/now_lets_practice.mp3")} /></Sequence>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 108, fontWeight: 800, color: "#8E24AA", transform: `scale(${s}) translateY(${bob(frame, fps, 9, 2.4)}px)` }}>Now let's practice!</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: palette.inkSoft, opacity: sub }}>Listen and pick the letter</div>
        <div style={{ transform: `scale(${sub})` }}><Mascot size={186} /></div>
      </div>
    </AbsoluteFill>
  );
};

// "You found all 26!" celebration — the completed board (left, via GridLayer) + cheer (right) + confetti
const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const sub = spring({ frame: frame - 12, fps, config: { damping: 11 } });
  const { height } = useVideoConfig();
  const portrait = height > width;
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <div style={{ position: "absolute", ...(portrait ? { left: 0, top: gridLayout(width, height).bottom, width, height: height - gridLayout(width, height).bottom } : { left: 1000, top: 0, width: 860, height: "100%" }), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ fontSize: 96, fontWeight: 800, color: "#8E24AA", transform: `scale(${s}) translateY(${bob(frame, fps, 9, 2.4)}px)` }}>You found</div>
        <div style={{ fontSize: 108, fontWeight: 800, color: palette.ink, transform: `scale(${s})` }}>all 26! 🎉</div>
        <div style={{ transform: `scale(${sub})` }}><Mascot size={200} /></div>
        <div style={{ fontSize: 46, fontWeight: 700, color: "#FF9F43", opacity: sub }}>Great job! ⭐</div>
      </div>
      {[[0, width * 0.28, 300], [16, width * 0.5, 240], [30, width * 0.72, 300], [46, width * 0.35, 260]].map(([bf, ox, oy], k) => (
        <Confetti key={k} frame={frame} fps={fps} burstFrame={bf as number} origin={{ x: ox as number, y: oy as number }} colors={["#FF9F43", "#8E24AA", "#4FC3F7", "#FFD54F", "#66BB6A", "#EC407A"]} count={34} seed={k + 1} />
      ))}
    </AbsoluteFill>
  );
};


// PracticeRound's tops are landscape values (title 150 … tiles ~770); in a 1350-tall
// frame that leaves the bottom third empty, so the whole block steps down to centre.
const PracticeShift: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <AbsoluteFill style={{ transform: height > width ? "translateY(190px)" : undefined }}>{children}</AbsoluteFill>;
};

export const RecognitionReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#FFFFFF" }}>
      <Bg />
      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, RECOGNITION_DURATION - 40, RECOGNITION_DURATION], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={INTRO_F}>
        <Intro />
      </Sequence>

      {SEGS.map((s) => (
        <Sequence key={s.it.letter} from={s.from} durationInFrames={s.dur}>
          <Sequence from={audioRel} durationInFrames={s.dur - audioRel}>
            <Audio src={staticFile(`audio/recognition/${s.it.trio}.mp3`)} />
          </Sequence>
          <RecognitionPanel item={s.it} audioStart={audioRel} cellIndex={s.i} />
        </Sequence>
      ))}

      {/* practice: intro card + 10 listen-&-pick rounds */}
      <Sequence from={PRACTICE_INTRO_FROM} durationInFrames={PINTRO_F}>
        <PracticeIntro />
      </Sequence>
      {ROUNDS.map((r) => (
        <Sequence key={r.q.letter} from={r.from} durationInFrames={r.plan.dur}>
          <PracticeShift><PracticeRound q={r.q} plan={r.plan} prompt={r.prompt} praise={r.praise} /></PracticeShift>
        </Sequence>
      ))}

      {/* persistent grid + spotlight (paints over the left; panels live on the right) */}
      <GridLayer />
      <Header />

      <Sequence from={FINALE_FROM} durationInFrames={FINALE_F}>
        <Finale />
      </Sequence>

      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_F}>
        <StoreOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
