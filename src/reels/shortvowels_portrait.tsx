import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOWELS, PRACTICE, LISTEN, VOWEL_PROMPTS, LINE, INTRO_NAME_T } from "../data/shortvowels";
import { VowelScenePortrait } from "../components/VowelScenePortrait";
import { vowelSceneFrames } from "../components/VowelScene";
import { VowelPracticeRoundPortrait, vpPlan } from "../components/VowelPracticeRoundPortrait";
import { ListenWordPortrait, lwPlan } from "../components/ListenWordPortrait";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { VowelFace } from "../components/Mouth";
import { PRAISES } from "../data/practice";
import { Mascot } from "../components/Mascot";
import { Bubbles, PortraitTitle, PORTRAIT_BG } from "../components/PortraitFx";
import { sec } from "../lib/timing";
import { font } from "../data/tokens";
import { bob } from "../lib/motion";

// ── Short Vowels — 9:16 reel (1080×1920) ────────────────────────────────────
// SAME data/audio/images + graphic pieces (mouths, confetti) as the 16:9 lesson, but a
// DISTINCT theme: ONE bold purple world throughout, white frosted cards, drifting bubbles,
// vertical motion, top vowel pager. Timeline mirrors the 16:9 (same clip timing).
const FPS = 30;

const INTRO_LINE_END = 6 + sec(LINE.intro, FPS);
let ivc = Math.max(INTRO_LINE_END + 12, 176);
const INTRO_VOWELS = VOWELS.map((v) => { const from = ivc; ivc += sec(v.soundDur, FPS) + 22; return { v, from }; });
const INTRO_F = ivc + 28;
const RULE_F = sec(LINE.rule, FPS) + 40;
const PINTRO_F = sec(LINE.practiceIntro, FPS) + 24;
const LINTRO_F = sec(LINE.listenIntro, FPS) + 24;
const OUTRO_F = STORE_OUTRO_PORTRAIT_F;

let cur = 0;
const INTRO_FROM = cur; cur += INTRO_F;
const RULE_FROM = cur; cur += RULE_F;
const LEARN = VOWELS.map((v, i) => { const from = cur; const dur = vowelSceneFrames(v); cur += dur; return { v, i, from, dur }; });
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
export const SHORT_VOWELS_PORTRAIT_DURATION = OUTRO_FROM + OUTRO_F;

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

// transparent — the purple + bubbles live in ONE global layer behind every scene
const FrameCard: React.FC<{ audio?: string; audioDur?: number; children: React.ReactNode }> = ({ audio, audioDur, children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
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
    <FrameCard>
      <Sequence from={6} durationInFrames={sec(LINE.intro, 30) + 8}><Audio src={staticFile("audio/shortvowels/intro.mp3")} /></Sequence>
      {INTRO_VOWELS.map(({ v, from }) => (
        <Sequence key={v.letter} from={from} durationInFrames={sec(v.soundDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/sound_${v.lower}.mp3`)} /></Sequence>
      ))}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ fontSize: 130, fontWeight: 800, color: "#fff", transform: `scale(${0.92 + 0.08 * s}) translateY(${bob(frame, fps, 8, 2.6)}px)`, textShadow: "0 12px 28px rgba(0,0,0,0.25)" }}>Short Vowels</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,0.9)", opacity: 0.5 + 0.5 * sub, marginBottom: 30 }}>The 5 vowel sounds</div>
        <div style={{ display: "flex", gap: 18 }}>
          {INTRO_VOWELS.map(({ v, from }, i) => {
            const popIn = spring({ frame: frame - 12 - i * 5, fps, config: { damping: 10 } });
            // highlight when NAMED in the narration ("…A, E, I…") AND again on its phoneme sound
            const nameAt = 6 + sec(INTRO_NAME_T[i], fps);
            const nameSpot = interpolate(frame, [nameAt - 3, nameAt + 2, nameAt + 13, nameAt + 19], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const soundSpot = interpolate(frame, [from - 4, from + 4, from + sec(v.soundDur, fps) + 16, from + sec(v.soundDur, fps) + 24], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const litLetter = Math.max(nameSpot, soundSpot) > 0.3; // letter colours on naming OR sound
            const litFace = soundSpot > 0.3; // face/mouth reacts ONLY when the sound plays
            return (
              <div key={v.letter} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${(0.86 + 0.14 * popIn) * (1 + soundSpot * 0.3)}) translateY(${bob(frame, fps, 10, 2.2, i)}px)` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 158, height: 158, borderRadius: "50%", background: "#fff", border: `5px solid ${v.color}`, boxShadow: litFace ? `0 10px 30px ${v.color}99` : "0 10px 24px rgba(0,0,0,0.22)" }}>
                  <VowelFace shape={v.mouth} open={soundSpot} size={128} color={v.color} frame={frame} fps={fps} />
                </div>
                <div style={{ fontSize: 88, fontWeight: 800, color: litLetter ? v.color : "#fff", transform: `scale(${1 + nameSpot * 0.18})`, textShadow: litLetter ? `0 6px 20px ${v.color}aa` : "none" }}>{v.letter}</div>
              </div>
            );
          })}
        </div>
      </div>
    </FrameCard>
  );
};

const RuleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <FrameCard audio="rule" audioDur={LINE.rule}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, padding: "0 70px" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {VOWELS.map((v, i) => {
            const inn = spring({ frame: frame - 4 - i * 4, fps, config: { damping: 11 } });
            const talk = 0.45 + 0.4 * Math.abs(Math.sin(frame * 0.55 + i));
            return <div key={v.letter} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 150, height: 150, borderRadius: "50%", background: "#fff", border: `5px solid ${v.color}`, boxShadow: "0 10px 24px rgba(0,0,0,0.22)", transform: `scale(${inn}) translateY(${bob(frame, fps, 7, 2.2, i)}px)` }}><VowelFace shape={v.mouth} open={talk} size={122} color={v.color} frame={frame} fps={fps} /></div>;
          })}
        </div>
        <div style={{ textAlign: "center", transform: `scale(${s})`, lineHeight: 1.28 }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: "#FFD54F", marginBottom: 20, opacity: spring({ frame: frame - 8, fps, config: { damping: 12 } }) }}>Remember!</div>
          <div style={{ fontSize: 82, fontWeight: 800, color: "#fff" }}>
            Short vowels make a <span style={{ color: "#7CF29C" }}>QUICK sound</span> — not the letter's <span style={{ color: "#FF8A80" }}>NAME!</span>
          </div>
        </div>
      </div>
    </FrameCard>
  );
};

// "listen" — headphones with a pair of music notes
const SpeakerIcon: React.FC = () => (
  <svg width={205} height={168} viewBox="0 0 170 140">
    <path d="M20 92 V72 a46 46 0 0 1 92 0 V92" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" />
    <rect x={6} y={84} width={30} height={52} rx={15} fill="#fff" />
    <rect x={97} y={84} width={30} height={52} rx={15} fill="#fff" />
    <g fill="#FFD54F">
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
  <svg width={210} height={172} viewBox="0 0 170 140">
    <circle cx={85} cy={20} r={18} fill="#FFD54F" />
    <path d="M85 40 v10 M78 47 l7 7 l7 -7" fill="none" stroke="#FFD54F" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={14} y={62} width={42} height={56} rx={12} fill="#fff" />
    <rect x={64} y={62} width={42} height={56} rx={12} fill="rgba(255,255,255,0.14)" stroke="#FFD54F" strokeWidth={5} strokeDasharray="9 7" />
    <rect x={114} y={62} width={42} height={56} rx={12} fill="#fff" />
  </svg>
);

const StepIntro: React.FC<{ audio: string; audioDur: number; title: string; sub: string; icon: React.ReactNode }> = ({ audio, audioDur, title, sub, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const ic = spring({ frame: frame - 4, fps, config: { damping: 9 } });
  const sub2 = spring({ frame: frame - 12, fps, config: { damping: 11 } });
  return (
    <FrameCard audio={audio} audioDur={audioDur}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
        <div style={{ transform: `scale(${ic}) translateY(${bob(frame, fps, 7, 2.1)}px)` }}>{icon}</div>
        <div style={{ fontSize: 116, fontWeight: 800, color: "#fff", transform: `scale(${s}) translateY(${bob(frame, fps, 8, 2.4)}px)`, textShadow: "0 10px 24px rgba(0,0,0,0.22)" }}>{title}</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "rgba(255,255,255,0.85)", opacity: sub2 }}>{sub}</div>
        <div style={{ transform: `scale(${sub2})`, marginTop: 20 }}><Mascot size={200} /></div>
      </div>
    </FrameCard>
  );
};

export const ShortVowelsPortraitReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#1B1140" }}>
      {/* ── ONE global background: purple + drifting bubbles, driven by the ABSOLUTE frame so
          it stays continuous across every scene change (foreground scenes are transparent) ── */}
      <AbsoluteFill style={{ background: PORTRAIT_BG }} />
      <Bubbles seed={3} />

      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, SHORT_VOWELS_PORTRAIT_DURATION - 40, SHORT_VOWELS_PORTRAIT_DURATION], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={45}><Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} /></Sequence>
      ))}

      <Sequence from={INTRO_FROM} durationInFrames={INTRO_F}><Intro /></Sequence>
      <Sequence from={RULE_FROM} durationInFrames={RULE_F}><RuleCard /></Sequence>
      {LEARN.map((s) => (
        <Sequence key={s.v.letter} from={s.from} durationInFrames={s.dur}><VowelScenePortrait item={s.v} idx={s.i} /></Sequence>
      ))}
      <Sequence from={PINTRO_FROM} durationInFrames={PINTRO_F}><StepIntro audio="practice_intro" audioDur={LINE.practiceIntro} title="Let's practice!" sub="Find the missing vowel" icon={<FindIcon />} /></Sequence>
      {ROUNDS.map((r) => (
        <Sequence key={r.q.word} from={r.from} durationInFrames={r.plan.dur}><VowelPracticeRoundPortrait q={r.q} plan={r.plan} prompt={r.prompt} praise={r.praise} /></Sequence>
      ))}
      <Sequence from={LINTRO_FROM} durationInFrames={LINTRO_F}><StepIntro audio="listen_intro" audioDur={LINE.listenIntro} title="Let's listen!" sub="Sound out each word" icon={<SpeakerIcon />} /></Sequence>
      {LISTENS.map((s) => (
        <Sequence key={s.w.word} from={s.from} durationInFrames={s.plan.dur}><ListenWordPortrait w={s.w} plan={s.plan} /></Sequence>
      ))}

      {/* ONE persistent title header (learn → listen) — global so it never re-fades/blinks.
          The brand logo lives inside this chip, so it's naturally gone on the download outro. */}
      <Sequence from={LEARN[0].from} durationInFrames={OUTRO_FROM - LEARN[0].from}><PortraitTitle dark /></Sequence>

      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_F}>
        <StoreOutroPortrait audioSrc="audio/shortvowels/outro_cta.mp3" audioDur={LINE.outroCta} />
      </Sequence>
    </AbsoluteFill>
  );
};
