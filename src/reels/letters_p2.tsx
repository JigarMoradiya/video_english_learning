import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PRACTICE, PROMPTS, PRAISES, roundPlan, PRACTICE_INTRO_DUR } from "../data/practice";
import { PracticeRoundPortrait } from "../components/PracticeRoundPortrait";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { PINK_BG, RisingStars, PinkTitle, AlphabetChips, ListenBadge, SpeakerGlyph, CollapseRow } from "../components/LettersPinkFx";
import { LogoBadge } from "../components/BrandMarks";
import { Mascot } from "../components/Mascot";
import { Confetti } from "../components/Confetti";
import { sec } from "../lib/timing";
import { font } from "../data/tokens";
import { bob } from "../lib/motion";

// ── PART 2 · Letter Practice (9:16) ─────────────────────────────────────────
// The play-along half of the Letter Sounds pair: hear a phonics sound, pick the letter.
// Same pink world as part 1, but a different motion signature — option tiles FLIP in,
// ambient RISING STARS (part 1 used a grid spotlight + drifting music notes).
const FPS = 30;
const LINE = { intro: 11.33, finale: 9.76, cta: 9.25 }; // measured recordings
const INTRO_F = sec(LINE.intro, FPS) + 34;
const PINTRO_F = sec(PRACTICE_INTRO_DUR, FPS) + 52; // reuses "Now let's practice!"
const FINALE_F = sec(LINE.finale, FPS) + 30;
const OUTRO_F = STORE_OUTRO_PORTRAIT_F;

// This portrait video deliberately runs the SAME 10 questions in a DIFFERENT order, and
// pairs them with a different prompt/praise sequence, so it never plays like the 16:9
// version. X, Q and M are all still included (all ten questions are kept).
const Q_ORDER = [6, 2, 9, 4, 3, 8, 0, 5, 7, 1]; // q, a, x, f, m, p, s, g, d, b
const PROMPT_ORDER = [2, 0, 1]; // start on "Can you find…?" (16:9 starts on "Which letter says…?")
const PRAISE_ORDER = [3, 5, 1, 6, 0, 4, 2]; // superstar, woohoo, great job, you got it, …

let cursor = INTRO_F;
const PINTRO_FROM = cursor; cursor += PINTRO_F;
const ROUNDS = Q_ORDER.map((qi, i) => {
  const q = PRACTICE[qi];
  const prompt = PROMPTS[PROMPT_ORDER[i % PROMPT_ORDER.length]];
  const praise = PRAISES[PRAISE_ORDER[i % PRAISE_ORDER.length]];
  const plan = roundPlan(q, prompt.dur, praise.dur);
  const from = cursor;
  cursor += plan.dur;
  return { q, prompt, praise, plan, from, i };
});
const FINALE_FROM = cursor;
const OUTRO_FROM = FINALE_FROM + FINALE_F;
export const LETTERS_P2_DURATION = OUTRO_FROM + OUTRO_F;

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: 8, name: "chime_soft", vol: 0.34 },
  { from: PINTRO_FROM + 2, name: "swoosh_soft", vol: 0.3 },
  ...ROUNDS.flatMap((r) => [
    { from: r.from + 4, name: "pop", vol: 0.24 },
    { from: r.from + r.plan.revealAt, name: "twinkle", vol: 0.32 },
  ]),
  { from: FINALE_FROM + 4, name: "sparkle", vol: 0.5 },
  { from: FINALE_FROM + 48, name: "twinkle", vol: 0.4 },
  { from: OUTRO_FROM + 8, name: "chime_soft", vol: 0.34 },
];

// ── staged intro: a new visual on each phrase of the 11.3s line ──────────────
// "Welcome back Superstar"@0 · "You know all your letter sounds"@2.4 ·
// "Now let's see if you can find them"@4.9 · "I'll say a sound"@7.8 ·
// "You pick the letter"@9.2 · "Ready?"@10.7
const I2 = { know: 6 + sec(2.4, FPS), find: 6 + sec(4.9, FPS), say: 6 + sec(7.8, FPS), pick: 6 + sec(9.2, FPS), ready: 6 + sec(10.7, FPS) };

// Opacity alone leaves a hole: a faded-out block still occupies its box, and a
// not-yet-shown block reserves its box early. `collapse` ties height to the same
// progress value so the stack stays tight — and the negative margin cancels the
// parent's flex gap once the block is fully closed.
const GAP = 26;

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const knowIn = spring({ frame: frame - I2.know, fps, config: { damping: 12 } });
  const findIn = spring({ frame: frame - I2.find, fps, config: { damping: 12 } });
  const sayIn = spring({ frame: frame - I2.say, fps, config: { damping: 12 } });
  const pickIn = spring({ frame: frame - I2.pick, fps, config: { damping: 12 } });
  const readyIn = spring({ frame: frame - I2.ready, fps, config: { damping: 10 } });
  // the welcome block hands over to the "how it works" half
  const topOut = interpolate(frame, [I2.say - 10, I2.say + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const coverFade = 1 - Math.min(1, knowIn * 1.4); // cover-only lines + mascot

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={sec(LINE.intro, 30) + 8}><Audio src={staticFile("audio/recognition/p2_intro.mp3")} /></Sequence>

      {/* beats 1–3 — welcome, "you know all your sounds" (alphabet recap), "let's find them" */}
      {topOut > 0.01 && (
        <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: GAP, padding: "0 90px", opacity: topOut }}>
          {/* frame 0 is a COMPLETE cover: logo + part + title + subtitle + mascot */}
          <div style={{ transform: `scale(${0.94 + 0.06 * s})` }}><LogoBadge /></div>
          <div style={{ fontSize: 46, fontWeight: 800, color: "#FFD9EC", letterSpacing: 4 }}>PART 2</div>
          <div style={{ fontSize: 108, fontWeight: 800, color: "#fff", textAlign: "center", transform: `scale(${0.94 + 0.06 * s}) translateY(${bob(frame, fps, 7, 2.6)}px)`, textShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>Welcome back!</div>
          {/* cover-only lines + mascot — height collapses as they fade so no hole is left behind */}
          <CollapseRow p={coverFade} gap={GAP}>
            <div style={{ fontSize: 88, fontWeight: 800, color: "#FFC24A", letterSpacing: 4 }}>Letter Practice</div>
            <div style={{ fontSize: 46, fontWeight: 700, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>Hear the sound — find the letter!</div>
            <div style={{ marginTop: 54, transform: `translateY(${bob(frame, fps, 8, 2.3)}px)` }}><Mascot size={220} /></div>
          </CollapseRow>
          {/* beat 2: the whole alphabet you already know, lit up — grows in, reserves nothing before */}
          <CollapseRow p={knowIn} gap={14}>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#FFC24A", textAlign: "center", marginBottom: 14 }}>You know all 26 sounds!</div>
            <AlphabetChips startFrame={I2.know + 4} lit={26} size={56} />
          </CollapseRow>
          {/* beat 3: now let's find them */}
          <CollapseRow p={findIn}>
            <div style={{ transform: `scale(${0.85 + 0.15 * Math.min(1, findIn)})`, display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.16)", borderRadius: 36, padding: "16px 34px" }}>
              <svg width={58} height={58} viewBox="0 0 60 60"><circle cx={25} cy={25} r={15} fill="none" stroke="#fff" strokeWidth={6} /><line x1={36} y1={36} x2={50} y2={50} stroke="#fff" strokeWidth={7} strokeLinecap="round" /></svg>
              <span style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>Now let's find them!</span>
            </div>
          </CollapseRow>
        </div>
      )}

      {/* beats 4–6 — how it works: I say a sound → you pick the letter → Ready? */}
      {frame >= I2.say - 10 && (
        <div style={{ position: "absolute", top: 420, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "0 90px" }}>
          <div style={{ opacity: sayIn, transform: `scale(${sayIn})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 240, height: 240, borderRadius: "50%", background: "#fff", boxShadow: "0 14px 34px rgba(0,0,0,0.26)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SpeakerGlyph size={208} />
            </div>
            <div style={{ fontSize: 54, fontWeight: 800, color: "#fff" }}>I say a sound…</div>
          </div>
          <div style={{ opacity: pickIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 10 }}>
            <div style={{ display: "flex", gap: 28 }}>
              {["x", "q", "m"].map((ch, i) => {
                const t = spring({ frame: frame - I2.pick - i * 6, fps, config: { damping: 12 } });
                return <div key={ch} style={{ width: 170, height: 170, borderRadius: 36, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 106, fontWeight: 800, color: "#8E2A59", transform: `perspective(900px) rotateY(${(1 - t) * -90}deg) scale(${t})`, boxShadow: "0 14px 34px rgba(0,0,0,0.28)" }}>{ch}</div>;
              })}
            </div>
            <div style={{ fontSize: 54, fontWeight: 800, color: "#FFC24A" }}>…you pick the letter!</div>
          </div>
          <div style={{ opacity: readyIn, transform: `scale(${readyIn}) rotate(${Math.sin(frame * 0.16) * 3}deg)`, fontSize: 96, fontWeight: 800, color: "#fff", marginTop: 16, textShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>Ready? 🎧</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// "Now let's practice!" transition (reuses the existing clip)
const PracticeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const ic = spring({ frame: frame - 4, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={sec(PRACTICE_INTRO_DUR, 30) + 8}><Audio src={staticFile("audio/recognition/now_lets_practice.mp3")} /></Sequence>
      {/* parked in the upper band (not centred) to match the rest of the video's rhythm */}
      <div style={{ position: "absolute", top: 420, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, padding: "0 90px" }}>
        {/* rich listen badge (filled ear + arcs feeding in + sparkle) */}
        <div style={{ transform: `scale(${ic}) translateY(${bob(frame, fps, 7, 2.1)}px)` }}><ListenBadge size={280} /></div>
        <div style={{ fontSize: 112, fontWeight: 800, color: "#fff", transform: `scale(${s}) translateY(${bob(frame, fps, 8, 2.4)}px)`, textShadow: "0 10px 26px rgba(0,0,0,0.28)" }}>Let's practice!</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: "#FFC24A" }}>Listen carefully…</div>
      </div>
    </AbsoluteFill>
  );
};

// ── staged finale: visuals keep arriving across the 9.8s line ────────────────
// "You did it"@0 · "You found every single letter"@1.7 ·
// "Your ears are getting so good at phonics"@4.6 · "Keep practising every day"@7.7
const F2 = { every: 6 + sec(1.7, FPS), ears: 6 + sec(4.6, FPS), keep: 6 + sec(7.7, FPS) };

const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const everyIn = spring({ frame: frame - F2.every, fps, config: { damping: 12 } });
  const earsIn = spring({ frame: frame - F2.ears, fps, config: { damping: 12 } });
  const keepIn = spring({ frame: frame - F2.keep, fps, config: { damping: 11 } });
  // the "10/10 + alphabet" block clears out for the closing encouragement
  const midOut = interpolate(frame, [F2.keep - 8, F2.keep + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={sec(LINE.finale, 30) + 8}><Audio src={staticFile("audio/recognition/p2_finale.mp3")} /></Sequence>

      {/* beat 1 — logo above "You did it!" */}
      <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ transform: `scale(${s})` }}><LogoBadge /></div>
        <div style={{ fontSize: 126, fontWeight: 800, color: "#FFC24A", transform: `scale(${s}) rotate(${Math.sin(frame * 0.12) * 2.5}deg)`, textShadow: "0 14px 34px rgba(0,0,0,0.3)" }}>You did it!</div>
      </div>

      {/* beat 2 — "every single letter": 10/10 + the alphabet lit */}
      {midOut > 0.01 && (
        <div style={{ position: "absolute", top: 700, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "0 90px", opacity: everyIn * midOut }}>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", transform: `scale(${everyIn})` }}>10 / 10</div>
          <div style={{ fontSize: 50, fontWeight: 800, color: "#fff" }}>Every letter found 🎉</div>
          <div style={{ marginTop: 6 }}><AlphabetChips startFrame={F2.every + 4} lit={26} size={54} /></div>
        </div>
      )}

      {/* beat 3 — "your ears are getting so good": listen badge + stars */}
      {midOut > 0.01 && (
        <div style={{ position: "absolute", top: 1300, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: earsIn * midOut, transform: `scale(${0.85 + 0.15 * earsIn})` }}>
          <ListenBadge size={220} />
          <div style={{ fontSize: 48, fontWeight: 800, color: "#FFC24A" }}>Great listening ears! 👂</div>
        </div>
      )}

      {/* beat 4 — "keep practising every day": mascot + streak of days */}
      {frame >= F2.keep - 8 && (
        <div style={{ position: "absolute", top: 760, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, padding: "0 90px", opacity: keepIn }}>
          <div style={{ transform: `scale(${keepIn}) translateY(${bob(frame, fps, 9, 2.3)}px)` }}><Mascot size={250} /></div>
          <div style={{ fontSize: 68, fontWeight: 800, color: "#fff", textAlign: "center", padding: "0 70px", lineHeight: 1.3 }}>Practise a little<br />every day!</div>
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            {[0, 1, 2, 3, 4].map((k) => {
              const t = spring({ frame: frame - F2.keep - 8 - k * 5, fps, config: { damping: 11 } });
              return <div key={k} style={{ width: 92, height: 92, borderRadius: 26, background: "#FFC24A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, transform: `scale(${t})`, boxShadow: "0 8px 20px rgba(255,170,40,0.5)" }}>⭐</div>;
            })}
          </div>
        </div>
      )}

      <Confetti frame={frame} fps={fps} burstFrame={8} origin={{ x: 540, y: 560 }} colors={["#FFC24A", "#3BD07A", "#FF8AB8", "#FFFFFF", "#4FC3F7"]} count={40} seed={9} />
    </AbsoluteFill>
  );
};

export const LettersP2Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#4A1430" }}>
      {/* ONE global pink background + ambient rising stars (part 2's signature) */}
      <AbsoluteFill style={{ background: PINK_BG }} />
      <RisingStars seed={6} />

      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, LETTERS_P2_DURATION - 40, LETTERS_P2_DURATION], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={45}><Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} /></Sequence>
      ))}

      <Sequence from={0} durationInFrames={INTRO_F}><Intro /></Sequence>
      <Sequence from={PINTRO_FROM} durationInFrames={PINTRO_F}><PracticeIntro /></Sequence>

      {/* persistent title across the rounds */}
      <Sequence from={ROUNDS[0].from} durationInFrames={FINALE_FROM - ROUNDS[0].from}><PinkTitle title="Letter Practice" part="PART 2 · FIND THE LETTER" /></Sequence>

      {ROUNDS.map((r) => (
        <Sequence key={r.i} from={r.from} durationInFrames={r.plan.dur}>
          <PracticeRoundPortrait q={r.q} plan={r.plan} prompt={r.prompt} praise={r.praise} index={r.i} total={ROUNDS.length} />
        </Sequence>
      ))}

      <Sequence from={FINALE_FROM} durationInFrames={FINALE_F}><Finale /></Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_F}>
        <StoreOutroPortrait audioSrc="audio/recognition/p2_cta.mp3" audioDur={LINE.cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
