import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { REC_LETTERS } from "../data/recognition";
import { LetterGridPortrait, PGRID, pCellCenter } from "../components/LetterGridPortrait";
import { RecognitionPanelPortrait } from "../components/RecognitionPanelPortrait";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { PINK_BG, MusicNotes, PinkTitle, AlphabetChips, ListenBadge, SpeakerGlyph, CollapseRow } from "../components/LettersPinkFx";
import { LogoBadge } from "../components/BrandMarks";
import { Mascot } from "../components/Mascot";
import { sec } from "../lib/timing";
import { font } from "../data/tokens";
import { bob } from "../lib/motion";

// ── PART 1 · Phonics Letter Sounds A→Z (9:16) ───────────────────────────────
// The 26-letter board fills up A→Z: a gold tile lights, its letter flies down into the
// panel, and "letter → says → sound" plays from the app's trio clip while SOUND-WAVE RINGS
// radiate. Pink world (sibling of the purple Short Vowels), ambient music notes.
// Part 2 (letters_p2) is the practice half.
const FPS = 30;
const LINE = { intro: 9.84, outro: 14.39, cta: 9.84 }; // measured recordings
const INTRO_F = sec(LINE.intro, FPS) + 34;
const WRAP_F = sec(LINE.outro, FPS) + 30;
const OUTRO_F = STORE_OUTRO_PORTRAIT_F;

const T_MOVE = 12, LEAD = 8, PAD = 8, CELEB = 24;
const audioRel = LEAD + T_MOVE;
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
const WRAP_FROM = LETTERS_END;
const OUTRO_FROM = WRAP_FROM + WRAP_F;
export const LETTERS_P1_DURATION = OUTRO_FROM + OUTRO_F;

const activeIndexAt = (f: number): number => {
  if (f >= WRAP_FROM) return 26;
  if (f < SEGS[0].from) return -1;
  let a = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].from) a = i;
  return a;
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: 8, name: "chime_soft", vol: 0.34 },
  ...SEGS.flatMap((s) => [
    { from: s.from, name: "swoosh_soft", vol: 0.22 },
    { from: s.from + T_MOVE, name: "pop", vol: 0.28 },
    { from: s.soundEndAbs, name: "correct", vol: 0.36 },
  ]),
  { from: WRAP_FROM + 4, name: "sparkle", vol: 0.5 },
  { from: WRAP_FROM + 50, name: "twinkle", vol: 0.4 },
  { from: OUTRO_FROM + 8, name: "chime_soft", vol: 0.34 },
];

// grid + gold spotlight glow, driven by the ABSOLUTE frame (continuous across scenes)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const GridLayer: React.FC = () => {
  const frame = useCurrentFrame();
  // only during the A→Z run — the intro/wrap/outro cards own the frame alone (no overlap)
  if (frame < INTRO_F || frame >= WRAP_FROM) return null;
  const active = activeIndexAt(frame);
  const seg = active >= 0 && active < 26 ? SEGS[active] : null;
  const activeDone = seg ? frame >= seg.soundEndAbs : false;

  let glow: React.ReactNode = null;
  if (seg) {
    const mv = easeOut(interpolate(frame - seg.from, [0, T_MOVE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const from = active > 0 ? pCellCenter(active - 1) : pCellCenter(active);
    const to = pCellCenter(active);
    const x = from.x + (to.x - from.x) * mv;
    const y = from.y + (to.y - from.y) * mv;
    const r = PGRID.cell * 1.2;
    glow = <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,194,74,0.6) 0%, rgba(255,194,74,0.24) 45%, rgba(255,194,74,0) 72%)", opacity: activeDone ? 0.3 : 1 }} />;
  }
  return (<>{glow}<LetterGridPortrait active={active < 0 ? 0 : active} activeDone={activeDone} /></>);
};

// live n/26 counter under the title
const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SEGS[0].from || frame >= WRAP_FROM) return null;
  const n = SEGS.filter((s) => frame >= s.soundEndAbs).length;
  return (
    <div style={{ position: "absolute", top: 1830, left: 0, width: "100%", display: "flex", justifyContent: "center", fontFamily: font.family }}>
      <div style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: 999, padding: "10px 34px", fontSize: 40, fontWeight: 800 }}>{n} / 26</div>
    </div>
  );
};

// ── staged intro: a new visual lands on each phrase of the 9.8s line ─────────
// word times (whisper): "Let's learn the sound every letter makes"@0 · "all the way from
// A to Z"@3.3 · "Listen carefully"@6.5 · "say each sound with me"@7.7
const I_B = { az: 6 + sec(3.3, FPS), listen: 6 + sec(6.5, FPS), say: 6 + sec(7.7, FPS) };

// Same collapsing-stack layout as part 2: every beat is a row in ONE centred flex column,
// and a row's HEIGHT is tied to its own progress. So a row that hasn't arrived (or has
// handed over) takes no space — no holes, and overlap is impossible by construction.
const GAP = 26;

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const azIn = spring({ frame: frame - I_B.az, fps, config: { damping: 12 } });
  const listenIn = spring({ frame: frame - I_B.listen, fps, config: { damping: 12 } });
  const sayIn = spring({ frame: frame - I_B.say, fps, config: { damping: 12 } });
  const coverFade = 1 - Math.min(1, azIn * 1.4); // cover-only lines + mascot
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={sec(LINE.intro, 30) + 8}><Audio src={staticFile("audio/recognition/p1_intro.mp3")} /></Sequence>

      <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: GAP, padding: "0 90px" }}>
        {/* always-on title rows */}
        <div style={{ transform: `scale(${0.94 + 0.06 * s})` }}><LogoBadge /></div>
        <div style={{ fontSize: 46, fontWeight: 800, color: "#FFD9EC", letterSpacing: 4 }}>PART 1</div>
        <div style={{ fontSize: 108, fontWeight: 800, color: "#fff", textAlign: "center", transform: `scale(${0.94 + 0.06 * s}) translateY(${bob(frame, fps, 7, 2.6)}px)`, textShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>Letter Sounds</div>

        {/* frame 0 cover — A–Z, subtitle, mascot; collapses as the staged beats take over */}
        <CollapseRow p={coverFade} gap={GAP}>
          <div style={{ fontSize: 88, fontWeight: 800, color: "#FFC24A", letterSpacing: 10 }}>A – Z</div>
          <div style={{ fontSize: 46, fontWeight: 700, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>Say every sound with me!</div>
          <div style={{ marginTop: 54, transform: `translateY(${bob(frame, fps, 8, 2.3)}px)` }}><Mascot size={220} /></div>
        </CollapseRow>

        {/* beat 2 — "all the way from A to Z": the whole alphabet cascades in */}
        <CollapseRow p={azIn} gap={24}>
          <div style={{ fontSize: 86, fontWeight: 800, color: "#FFC24A", letterSpacing: 10 }}>A – Z</div>
          <AlphabetChips startFrame={I_B.az + 4} lit={26} size={64} />
        </CollapseRow>

        {/* beat 3 — "listen carefully": the listen badge with arcs feeding into the ear */}
        <CollapseRow p={listenIn} gap={6}>
          <ListenBadge size={250} />
          <div style={{ fontSize: 52, fontWeight: 800, color: "#fff" }}>Listen carefully…</div>
        </CollapseRow>

        {/* beat 4 — "say each sound with me": mascot joins in */}
        <CollapseRow p={sayIn} gap={10}>
          <div style={{ transform: `translateY(${bob(frame, fps, 8, 2.2)}px)` }}><Mascot size={220} /></div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#FFC24A" }}>…and say it with me!</div>
        </CollapseRow>
      </div>
    </AbsoluteFill>
  );
};

// ── staged wrap: visuals keep arriving across the 14.4s line ─────────────────
// "Wow!"@0 · "You found all 26 letter sounds"@1.4 · "You're a phonics superstar"@4.8 ·
// "Next in part 2, we'll practice"@8.2 · "I'll say a sound and you find the letter"@11.3
const W_B = { count: 6 + sec(1.4, FPS), star: 6 + sec(4.8, FPS), next: 6 + sec(8.2, FPS), how: 6 + sec(11.3, FPS) };

const Wrap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wow = spring({ frame, fps, config: { damping: 11 } });
  const countIn = spring({ frame: frame - W_B.count, fps, config: { damping: 12 } });
  const starIn = spring({ frame: frame - W_B.star, fps, config: { damping: 11 } });
  const nextIn = spring({ frame: frame - W_B.next, fps, config: { damping: 12 } });
  const howIn = spring({ frame: frame - W_B.how, fps, config: { damping: 12 } });
  // "Wow!" hands the frame over to the count block
  const wowOut = interpolate(frame, [W_B.count - 6, W_B.count + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the celebration block clears out when the part-2 preview arrives
  const celebOut = interpolate(frame, [W_B.next - 8, W_B.next + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={sec(LINE.outro, 30) + 8}><Audio src={staticFile("audio/recognition/p1_outro.mp3")} /></Sequence>

      {/* beat 1 — "Wow!" with a burst of stars + the mascot popping above it */}
      {wowOut > 0.01 && (
        <div style={{ position: "absolute", top: 560, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: wowOut }}>
          {/* radiating burst behind/above the word */}
          <svg width={560} height={300} viewBox="0 0 560 300" style={{ position: "absolute", top: 60 }}>
            {Array.from({ length: 12 }).map((_, k) => {
              const a = (Math.PI * 2 * k) / 12 + frame * 0.014;
              const r0 = 108 + Math.sin(frame * 0.16 + k) * 8;
              const len = 30 + (k % 3) * 14;
              return <line key={k} x1={280 + r0 * Math.cos(a)} y1={150 + r0 * Math.sin(a) * 0.6} x2={280 + (r0 + len) * Math.cos(a)} y2={150 + (r0 + len) * Math.sin(a) * 0.6} stroke="#FFC24A" strokeWidth={7} strokeLinecap="round" opacity={0.55} />;
            })}
          </svg>
          {/* mascot cheering above */}
          <div style={{ transform: `scale(${wow}) translateY(${bob(frame, fps, 10, 2.1)}px)`, zIndex: 1 }}><Mascot size={230} /></div>
          {/* three stars arcing over the word */}
          <div style={{ display: "flex", gap: 34, zIndex: 1 }}>
            {[0, 1, 2].map((k) => {
              const t = spring({ frame: frame - 4 - k * 5, fps, config: { damping: 10 } });
              return <span key={k} style={{ fontSize: k === 1 ? 84 : 62, transform: `scale(${t}) translateY(${k === 1 ? -14 : 6}px) rotate(${Math.sin(frame * 0.13 + k) * 10}deg)` }}>⭐</span>;
            })}
          </div>
          <div style={{ fontSize: 190, fontWeight: 800, color: "#FFC24A", transform: `scale(${wow}) rotate(${Math.sin(frame * 0.14) * 4}deg)`, textShadow: "0 16px 40px rgba(0,0,0,0.32)", zIndex: 1 }}>Wow!</div>
        </div>
      )}

      {/* beats 2–3 — logo + 26/26 + superstar + the filled alphabet */}
      {celebOut > 0.01 && (
        <div style={{ position: "absolute", top: 340, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "0 90px", opacity: countIn * celebOut }}>
          <div style={{ transform: `scale(${countIn})` }}><LogoBadge /></div>
          <div style={{ fontSize: 132, fontWeight: 800, color: "#FFC24A", transform: `scale(${countIn})`, textShadow: "0 14px 34px rgba(0,0,0,0.3)" }}>26 / 26</div>
          <div style={{ fontSize: 66, fontWeight: 800, color: "#fff" }}>You found them all!</div>
          {/* the whole alphabet, lit */}
          <div style={{ marginTop: 6 }}><AlphabetChips startFrame={W_B.count + 6} lit={26} size={58} /></div>
          {/* "phonics superstar" badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: starIn, transform: `scale(${starIn})`, background: "rgba(255,255,255,0.16)", borderRadius: 40, padding: "16px 38px", marginTop: 10 }}>
            <span style={{ fontSize: 62 }}>⭐</span>
            <span style={{ fontSize: 54, fontWeight: 800, color: "#fff" }}>Phonics Superstar!</span>
          </div>
          <div style={{ transform: `scale(${starIn}) translateY(${bob(frame, fps, 8, 2.4)}px)`, opacity: starIn }}><Mascot size={190} /></div>
        </div>
      )}

      {/* beat 4 — Part 2 announcement */}
      {frame >= W_B.next - 10 && (
        <div style={{ position: "absolute", top: 372, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "0 90px", opacity: nextIn }}>
          <div style={{ transform: `scale(${nextIn})`, marginBottom: 4 }}><LogoBadge /></div>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#FFD9EC", letterSpacing: 4 }}>NEXT UP</div>
          <div style={{ fontSize: 104, fontWeight: 800, color: "#fff", transform: `scale(${nextIn}) translateY(${bob(frame, fps, 7, 2.5)}px)`, textShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>Part 2</div>
          <div style={{ fontSize: 62, fontWeight: 800, color: "#FFC24A" }}>Letter Practice</div>
        </div>
      )}

      {/* beat 5 — "I'll say a sound, you find the letter": speaker + option tiles preview */}
      {frame >= W_B.how - 8 && (
        <div style={{ position: "absolute", top: 1040, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "0 90px", opacity: howIn }}>
          {/* the glyph is pink-on-white by design, so it needs its white plate here */}
          <div style={{ width: 210, height: 210, borderRadius: "50%", background: "#fff", boxShadow: "0 14px 34px rgba(0,0,0,0.26)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${howIn})` }}>
            <SpeakerGlyph size={182} />
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>I say a sound…</div>
          <div style={{ display: "flex", gap: 26, marginTop: 6 }}>
            {["m", "q", "x"].map((ch, i) => {
              const t = spring({ frame: frame - W_B.how - 6 - i * 6, fps, config: { damping: 12 } });
              return (
                <div key={ch} style={{ width: 150, height: 150, borderRadius: 32, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 94, fontWeight: 800, color: "#8E2A59", transform: `perspective(800px) rotateY(${(1 - t) * -90}deg) scale(${t})`, boxShadow: "0 12px 30px rgba(0,0,0,0.26)" }}>{ch}</div>
              );
            })}
          </div>
          <div style={{ fontSize: 46, fontWeight: 800, color: "#FFC24A" }}>…you find the letter!</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const LettersP1Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#4A1430" }}>
      {/* ONE global pink background + ambient notes, driven by the absolute frame */}
      <AbsoluteFill style={{ background: PINK_BG }} />
      <MusicNotes seed={2} />

      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, LETTERS_P1_DURATION - 40, LETTERS_P1_DURATION], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={45}><Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} /></Sequence>
      ))}

      <Sequence from={0} durationInFrames={INTRO_F}><Intro /></Sequence>

      {/* persistent title + grid + counter across the teaching run */}
      <Sequence from={INTRO_F} durationInFrames={WRAP_FROM - INTRO_F}><PinkTitle title="Letter Sounds" sub="A–Z" part="PART 1 · PHONICS SOUNDS" /></Sequence>
      <GridLayer />
      <Counter />

      {SEGS.map((s) => (
        <Sequence key={s.it.letter} from={s.from} durationInFrames={s.dur}>
          <Sequence from={audioRel} durationInFrames={sec(s.it.d0 + s.it.d1 + s.it.d2, FPS) + 8}>
            <Audio src={staticFile(`audio/recognition/${s.it.trio}.mp3`)} />
          </Sequence>
          <RecognitionPanelPortrait item={s.it} audioStart={audioRel} flyFrom={pCellCenter(s.i)} />
        </Sequence>
      ))}

      <Sequence from={WRAP_FROM} durationInFrames={WRAP_F}><Wrap /></Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_F}>
        <StoreOutroPortrait audioSrc="audio/recognition/p1_cta.mp3" audioDur={LINE.cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
