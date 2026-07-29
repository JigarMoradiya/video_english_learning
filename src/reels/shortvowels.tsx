import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOWELS, PRACTICE, LISTEN, VOWEL_PROMPTS, LINE, INTRO_NAME_T } from "../data/shortvowels";
import { LogoBadge, FrameBadge } from "../components/BrandMarks";
import { VowelScene, vowelSceneFrames } from "../components/VowelScene";
import { VowelPracticeRound, vpPlan } from "../components/VowelPracticeRound";
import { ListenWord, lwPlan } from "../components/ListenWord";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { VowelFace } from "../components/Mouth";
import { PRAISES } from "../data/practice";
import { Mascot } from "../components/Mascot";
import { sec } from "../lib/timing";
import { hex, font, palette } from "../data/tokens";
import { bob } from "../lib/motion";
import { MorningSky, Wash, WireBirds, chirpAt } from "../components/ChirpWire";

// ── Short Vowels lesson video (16:9) ────────────────────────────────────────
// Recreates the app's Short Vowels module: LEARN (talking-mouth vowels + word chips) →
// PRACTICE (find the missing vowel) → LISTEN (sound-out) → download outro. Reuses the app's
// vowel/word/phoneme clips + user-recorded framing lines. Data-driven frames.
const FPS = 30;

// Intro plays the framing line, then each vowel lights up + PLAYS ITS SOUND in turn.
const INTRO_LINE_END = 6 + sec(LINE.intro, FPS);
let ivc = Math.max(INTRO_LINE_END + 12, 176);
const INTRO_VOWELS = VOWELS.map((v) => { const from = ivc; ivc += sec(v.soundDur, FPS) + 22; return { v, from }; });
const INTRO_F = ivc + 28;
const RULE_F = sec(LINE.rule, FPS) + 40;
const PINTRO_F = sec(LINE.practiceIntro, FPS) + 24;
const LINTRO_F = sec(LINE.listenIntro, FPS) + 24;
const OUTRO_F = STORE_OUTRO_F;

// timeline
let cur = 0;
const INTRO_FROM = cur; cur += INTRO_F;
const RULE_FROM = cur; cur += RULE_F;
const LEARN = VOWELS.map((v) => { const from = cur; const dur = vowelSceneFrames(v); cur += dur; return { v, from, dur }; });
const PINTRO_FROM = cur; cur += PINTRO_F;
const ROUNDS = PRACTICE.map((q, i) => {
  const prompt = VOWEL_PROMPTS[i % VOWEL_PROMPTS.length];
  const praise = PRAISES[i % PRAISES.length];
  const plan = vpPlan(q, prompt.dur, praise.dur);
  const from = cur; cur += plan.dur;
  return { q, prompt, praise, plan, from };
});
const LINTRO_FROM = cur; cur += LINTRO_F;
const LISTENS = LISTEN.map((w) => { const plan = lwPlan(w); const from = cur; cur += plan.dur; return { w, plan, from }; });
const OUTRO_FROM = cur;
export const SHORT_VOWELS_DURATION = OUTRO_FROM + OUTRO_F;
const TITLE_FROM = LEARN[0].from;

// Which bird is chirping, and when. Every scene already carries its vowel — the
// intro plays each phoneme in turn, a learn scene IS one vowel, a practice round
// names its answer in `correct`, and a listen word carries the vowel's colour — so
// the birds are driven from the existing data rather than a second hand-made table.
const vIdx = (letter: string) => VOWELS.findIndex((v) => v.lower === letter.toLowerCase());
const CHIRPS: { from: number; to: number; idx: number }[] = [
  // intro: each vowel's phoneme clip
  ...INTRO_VOWELS.map(({ v, from }, i) => ({ from, to: from + sec(v.soundDur, FPS), idx: i })),
  // learn: the whole scene belongs to that vowel, but the bird only chirps over the
  // sound itself — a beak held open for a 20s scene reads as a stuck bird
  ...LEARN.map((s2, i) => ({ from: s2.from + 2, to: s2.from + 2 + sec(s2.v.soundDur, FPS), idx: i })),
  // practice: on the reveal, when the correct vowel's sound plays
  ...ROUNDS.map((r) => ({
    from: r.from + r.plan.revealAt,
    to: r.from + r.plan.revealAt + sec(r.q.soundDur, FPS),
    idx: vIdx(r.q.correct),
  })),
  // listen: on the vowel phoneme inside the sound-out
  // lwPlan already publishes the exact frame each phoneme starts on (pStart), so the
  // chirp is read from it rather than re-derived by adding durations up
  ...LISTENS.map((s2) => {
    const li = s2.w.letters.findIndex((ch) => vIdx(ch) >= 0);
    if (li < 0) return { from: 0, to: 0, idx: -1 };
    const from = s2.from + s2.plan.pStart[li];
    return { from, to: from + sec(s2.w.phonemeDurs[li], FPS), idx: vIdx(s2.w.letters[li]) };
  }),
].filter((c) => c.idx >= 0);

const Birds: React.FC = () => {
  const frame = useCurrentFrame();
  const { idx, open } = chirpAt(CHIRPS, frame);
  return <WireBirds vowels={VOWELS.map((v) => ({ letter: v.letter, color: v.color }))} activeIdx={idx} open={open} />;
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: 8, name: "sparkle", vol: 0.45 },
  ...INTRO_VOWELS.map((s) => ({ from: s.from, name: "pop", vol: 0.24 })),
  ...LEARN.map((s) => ({ from: s.from + 2, name: "pop", vol: 0.3 })),
  { from: PINTRO_FROM + 2, name: "swoosh_soft", vol: 0.3 },
  ...ROUNDS.map((r) => ({ from: r.from + r.plan.revealAt, name: "twinkle", vol: 0.32 })),
  { from: LINTRO_FROM + 2, name: "swoosh_soft", vol: 0.3 },
  ...LISTENS.map((s) => ({ from: s.from + 2, name: "pop", vol: 0.26 })),
];

// persistent topic title on the content scenes
const TitleBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", top: 34, left: 0, width: "100%", display: "flex", justifyContent: "center", fontFamily: font.family, opacity: inn }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#FFFFFFd8", borderRadius: 40, padding: "12px 30px", boxShadow: "0 8px 22px rgba(30,36,56,0.12)" }}>
        <div style={{ display: "flex", gap: 8 }}>{VOWELS.map((v) => <span key={v.letter} style={{ width: 16, height: 16, borderRadius: 8, background: v.color }} />)}</div>
        <span style={{ fontSize: 34, fontWeight: 800, color: palette.ink }}>Short Vowels</span>
      </div>
    </div>
  );
};

// ── framing cards ────────────────────────────────────────────────────────────
// `tone` tints the wash with the scene's colour. The old per-scene gradient is gone:
// the sky is drawn ONCE at the root and runs the whole lesson, because a different
// background per scene is a jump cut to another world (the lesson the portrait store
// outro taught). Only the wash changes.
const Card: React.FC<{ audio?: string; audioDur?: number; tone?: string; washBottom?: number; children: React.ReactNode }> = ({ audio, audioDur, tone, washBottom, children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
    <Wash tone={tone} bottom={washBottom} />
    {audio && <Sequence from={6} durationInFrames={sec(audioDur ?? 3, 30) + 8}><Audio src={staticFile(`audio/shortvowels/${audio}.mp3`)} /></Sequence>}
    {children}
  </AbsoluteFill>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const sub = spring({ frame: frame - 14, fps, config: { damping: 12 } });
  return (
    <Card washBottom={820}>
      <Sequence from={6} durationInFrames={sec(LINE.intro, 30) + 8}><Audio src={staticFile("audio/shortvowels/intro.mp3")} /></Sequence>
      {/* each vowel plays its sound in turn */}
      {INTRO_VOWELS.map(({ v, from }) => (
        <Sequence key={v.letter} from={from} durationInFrames={sec(v.soundDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/sound_${v.lower}.mp3`)} /></Sequence>
      ))}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 116, fontWeight: 800, color: palette.ink, transform: `scale(${0.92 + 0.08 * s}) translateY(${bob(frame, fps, 8, 2.6)}px)` }}>Short Vowels</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: palette.inkSoft, opacity: 0.5 + 0.5 * sub }}>The 5 vowel sounds — A · E · I · O · U</div>
        {/* gap is wide enough that the scale-up on the spoken vowel never touches its neighbours */}
        <div style={{ display: "flex", gap: 62, marginTop: 8 }}>
          {INTRO_VOWELS.map(({ v, from }, i) => {
            const popIn = spring({ frame: frame - 12 - i * 5, fps, config: { damping: 10 } });
            // highlight when NAMED in the narration ("…A, E, I…") AND again on its phoneme sound
            const nameAt = 6 + sec(INTRO_NAME_T[i], fps);
            const nameSpot = interpolate(frame, [nameAt - 3, nameAt + 2, nameAt + 13, nameAt + 19], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const soundSpot = interpolate(frame, [from - 4, from + 4, from + sec(v.soundDur, fps) + 16, from + sec(v.soundDur, fps) + 24], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const litLetter = Math.max(nameSpot, soundSpot) > 0.2; // letter glows on naming OR sound
            return (
              <div key={v.letter} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${(0.86 + 0.14 * popIn) * (1 + soundSpot * 0.16)}) translateY(${bob(frame, fps, 10, 2.2, i)}px)` }}>
                <VowelFace shape={v.mouth} open={soundSpot} size={128} color={v.color} frame={frame} fps={fps} />
                <div style={{ fontSize: 96, fontWeight: 800, color: v.color, transform: `scale(${1 + nameSpot * 0.16})`, textShadow: litLetter ? `0 12px 30px ${v.color}88` : "none" }}>{v.letter}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const RuleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <Card audio="rule" audioDur={LINE.rule}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {/* brand badge above the mouth row (the one logo on screen for this card) */}
        <LogoBadge size={148} style={{ transform: `scale(${spring({ frame: frame - 2, fps, config: { damping: 12 } })})` }} />
        {/* the 5 quick-talking vowel mouths (relates to the rule) */}
        <div style={{ display: "flex", gap: 26 }}>
          {VOWELS.map((v, i) => {
            const inn = spring({ frame: frame - 4 - i * 4, fps, config: { damping: 11 } });
            const talk = 0.45 + 0.4 * Math.abs(Math.sin(frame * 0.55 + i)); // quick, lively
            return <div key={v.letter} style={{ transform: `scale(${inn}) translateY(${bob(frame, fps, 7, 2.2, i)}px)` }}><VowelFace shape={v.mouth} open={talk} size={116} color={v.color} frame={frame} fps={fps} /></div>;
          })}
        </div>
        <div style={{ maxWidth: 1500, textAlign: "center", transform: `scale(${s})`, lineHeight: 1.25 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#8E24AA", marginBottom: 14, opacity: spring({ frame: frame - 8, fps, config: { damping: 12 } }) }}>Remember!</div>
          <div style={{ fontSize: 80, fontWeight: 800, color: palette.ink }}>
            Short vowels make a <span style={{ color: "#2E7D32" }}>QUICK sound</span> —<br />not the letter's <span style={{ color: "#C62828" }}>NAME!</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// step icons (drawn, purple to match the title)
// "listen" — headphones with a pair of music notes
const SpeakerIcon: React.FC = () => (
  <svg width={175} height={144} viewBox="0 0 170 140">
    <path d="M20 92 V72 a46 46 0 0 1 92 0 V92" fill="none" stroke="#8E24AA" strokeWidth={11} strokeLinecap="round" />
    <rect x={6} y={84} width={30} height={52} rx={15} fill="#8E24AA" />
    <rect x={97} y={84} width={30} height={52} rx={15} fill="#8E24AA" />
    <g fill="#F9A825">
      <rect x={128} y={18} width={5} height={42} rx={2.5} />
      <rect x={152} y={10} width={5} height={42} rx={2.5} />
      <path d="M128 18 L157 10 L157 21 L133 29 Z" />
      <ellipse cx={124} cy={62} rx={10} ry={7.5} />
      <ellipse cx={148} cy={54} rx={10} ry={7.5} />
    </g>
  </svg>
);
// "find the missing vowel" — 3 tiles with the middle one blank + a vowel piece dropping in
const FindIcon: React.FC = () => (
  <svg width={180} height={148} viewBox="0 0 170 140">
    <circle cx={85} cy={20} r={18} fill="#F9A825" />
    <path d="M85 40 v10 M78 47 l7 7 l7 -7" fill="none" stroke="#F9A825" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={14} y={62} width={42} height={56} rx={12} fill="#fff" stroke="#8E24AA" strokeWidth={4} />
    <rect x={64} y={62} width={42} height={56} rx={12} fill="none" stroke="#8E24AA" strokeWidth={5} strokeDasharray="9 7" />
    <rect x={114} y={62} width={42} height={56} rx={12} fill="#fff" stroke="#8E24AA" strokeWidth={4} />
  </svg>
);

const StepIntro: React.FC<{ audio: string; audioDur: number; title: string; sub: string; icon: React.ReactNode }> = ({ audio, audioDur, title, sub, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const ic = spring({ frame: frame - 4, fps, config: { damping: 9 } });
  const sub2 = spring({ frame: frame - 12, fps, config: { damping: 11 } });
  return (
    <Card audio={audio} audioDur={audioDur} tone="#8E24AA" washBottom={860}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ transform: `scale(${ic}) translateY(${bob(frame, fps, 7, 2.1)}px)` }}>{icon}</div>
        <div style={{ fontSize: 104, fontWeight: 800, color: "#8E24AA", transform: `scale(${s}) translateY(${bob(frame, fps, 8, 2.4)}px)` }}>{title}</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: palette.inkSoft, opacity: sub2 }}>{sub}</div>
        <div style={{ transform: `scale(${sub2})`, marginTop: 12 }}><Mascot size={172} /></div>
      </div>
    </Card>
  );
};

export const ShortVowelsReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#FFFFFF" }}>
      {/* THE CHIRP WIRE — one continuous world for the whole lesson, up to the outro
          (which owns the frame and shows the app icon full size) */}
      <Sequence from={0} durationInFrames={OUTRO_FROM}><MorningSky /></Sequence>
      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, SHORT_VOWELS_DURATION - 40, SHORT_VOWELS_DURATION], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={45}><Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} /></Sequence>
      ))}

      <Sequence from={INTRO_FROM} durationInFrames={INTRO_F}><Intro /></Sequence>
      <Sequence from={RULE_FROM} durationInFrames={RULE_F}><RuleCard /></Sequence>
      {LEARN.map((s) => (
        <Sequence key={s.v.letter} from={s.from} durationInFrames={s.dur}><VowelScene item={s.v} /></Sequence>
      ))}
      <Sequence from={PINTRO_FROM} durationInFrames={PINTRO_F}><StepIntro audio="practice_intro" audioDur={LINE.practiceIntro} title="Let's practice!" sub="Find the missing vowel" icon={<FindIcon />} /></Sequence>
      {ROUNDS.map((r) => (
        <Sequence key={r.q.word} from={r.from} durationInFrames={r.plan.dur}>
          <Wash tone={r.q.color} bottom={790} />
          <VowelPracticeRound q={r.q} plan={r.plan} prompt={r.prompt} praise={r.praise} />
        </Sequence>
      ))}
      <Sequence from={LINTRO_FROM} durationInFrames={LINTRO_F}><StepIntro audio="listen_intro" audioDur={LINE.listenIntro} title="Let's listen!" sub="Sound out each word" icon={<SpeakerIcon />} /></Sequence>
      {LISTENS.map((s) => (
        <Sequence key={s.w.word} from={s.from} durationInFrames={s.plan.dur}>
          <Wash tone={s.w.color} />
          <ListenWord w={s.w} plan={s.plan} />
        </Sequence>
      ))}

      {/* the five birds sit on the wire for the whole lesson; the one whose sound is
          playing opens its beak. Drawn AFTER the scenes so a bird is never covered. */}
      <Sequence from={0} durationInFrames={OUTRO_FROM}><Birds /></Sequence>

      {/* persistent title over the teaching content (learn → listen) */}
      <Sequence from={TITLE_FROM} durationInFrames={OUTRO_FROM - TITLE_FROM}><TitleBar /></Sequence>

      {/* the section cards have no image card, so the badge sits bottom-left there
          (one logo on screen at a time — everywhere else it lives on an image card) */}
      <Sequence from={PINTRO_FROM} durationInFrames={PINTRO_F}><FrameBadge liftY={168} /></Sequence>
      <Sequence from={LINTRO_FROM} durationInFrames={LINTRO_F}><FrameBadge liftY={168} /></Sequence>

      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_F}>
        <StoreOutro audioSrc="audio/shortvowels/outro_cta.mp3" audioDur={LINE.outroCta} />
      </Sequence>
    </AbsoluteFill>
  );
};
