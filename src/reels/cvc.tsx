import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ALL_WORDS, AUDIO_SEC, Clip, CLIPS, CVC_DURATION, F, GROUP_WORDS, MARKS, OUTRO_FROM, PIC, run,
} from "../data/cvc";
import captionsJson from "../data/cvc.captions.json";
// the store card rises ON the download line — before this it arrived only after ALL
// audio, leaving the CTA sentence playing over leftover quiz visuals
const DL_FROM = Math.round(((captionsJson as unknown as { start: number }[]).slice(-1)[0].start) * 30) - 6;
import { bands, CONSONANT, GROUPS, LetterBoard, MergedSandwich, ShopWorld, VOWEL, WordPicture } from "../components/SandwichShop";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { StoreOutro } from "../components/StoreOutro";
import { Watermark } from "../components/Watermark";
import { font, palette } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { Confetti } from "../components/Confetti";

// ── L4 · CVC Words — 16:9 ────────────────────────────────────────────────────
// Driven entirely by src/data/cvc.timeline.json: every clip has an absolute start, so a
// visual cue is never a guess — it is the frame the sound actually plays. Nothing was cut
// to build that timeline, so a cue can never drift into a neighbouring word.
//
// THE FRAME IS ONE CONTINUOUS SCENE, not a sequence of sections. The three boards live on
// the counter the whole video; only their letters, their lighting and the merge change.
// That is what the app does, and it is why this needs no per-section components.
const FPS = 30;
const CAPTIONS = makeTrack(captionsJson as unknown as TPhrase[], AUDIO_SEC);

const f = (s: number) => Math.round(s * FPS);

/** boards arrive this long before their first sound, so the child sees them WAITING */
const HOLD_IN = 26;

// THE LAW: every narration LINE gets its own visual change. These are the caption lines,
// so a cue is a line — never a section, never a guess.
const P = (i: number) => f((captionsJson as unknown as TPhrase[])[i].start);
const PE = (i: number) => f((captionsJson as unknown as TPhrase[])[i].end);

/** every word-build in the timeline, resolved once at module load */
interface Build { word: string; sounds: Clip[]; wordClip: Clip; from: number; to: number }
const BUILDS: Build[] = (() => {
  const out: Build[] = [];
  let pending: Clip[] = [];
  let prevEnd = 0;
  let prevRunStart = 0;
  for (const c of CLIPS) {
    if (c.kind === "sound") pending.push(c);
    else if (c.kind === "word") {
      const firstSound = pending[0]?.start ?? c.start;
      // A build normally arrives HOLD_IN before its first sound. But where a LONG gap
      // precedes it — the child's turn, "This one's yours. Sound it out." + 2s of silence
      // — the boards must already be WAITING, or the child is asked to sound out a word
      // that is not on screen yet and the previous word holds the frame instead.
      const runway = firstSound - prevEnd;
      out.push({
        word: c.word!, sounds: pending, wordClip: c,
        from: out.length === 0 ? 0
          // The child's turn — and ONLY that — pulls the boards back into the line before
          // the silence, so they are up while the child is told to sound them out. Its
          // runway is the 1.55s word gap PLUS a 2s pause; the threshold must sit above the
          // word gap or EVERY build takes this branch and lands under the previous word's
          // caption, which is exactly what put "p e n" on screen under "hen!".
          : runway > 2.5 ? f(prevRunStart) + 20
          : f(firstSound) - 12,
        to: f(c.start + c.dur),
      });
      pending = [];
      prevEnd = c.start + c.dur;
    } else if (c.kind === "run") {
      // the quiz's two consonants sound with no word after them — their build closes when
      // the narrator's question arrives
      if (pending.length) {
        const last = pending[pending.length - 1];
        out.push({ word: pending[0].word!, sounds: pending, wordClip: null as unknown as Clip,
                   from: f(pending[0].start) - HOLD_IN, to: f(last.start + last.dur) });
        pending = [];
      }
      prevEnd = c.start + c.dur;
      prevRunStart = c.start;
    }
  }
  return out;
})();

/** which build is on screen at a frame — the LAST one that has started */
const buildAt = (frame: number): Build | null => {
  let cur: Build | null = null;
  for (const b of BUILDS) if (frame >= b.from) cur = b;
  return cur;
};

/** the quiz needs a second row, so the boards ride higher through it */
const QUIZ_LIFT = 120;
const inQuiz = (frame: number) => frame >= f(MARKS.quiz);

const groupIndexAt = (frame: number): number => {
  let idx = -1;
  GROUPS.forEach((g, i) => { if (frame >= f(MARKS[g.key] ?? 1e9)) idx = i; });
  return idx;
};

/** The chosen `o` FLIES out of its option tile and into the blank — the child watches
 *  their answer travel to the word instead of it simply appearing there. Both ends of
 *  the path come from the option row's own layout below (three OPT tiles, OPT_GAP apart,
 *  centred, at counterY - 172), so moving that row moves the flight with it. */
const OPT = 148, OPT_GAP = 26;
const flyIn = (frame: number, at: number, width: number, height: number, size: number) => {
  const B = bands(width, height);
  const p = interpolate(frame, [at, at + 19], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = 1 - Math.pow(1 - p, 3);                       // arrives settling, not braking
  const fromX = (width - (3 * OPT + 2 * OPT_GAP)) / 2 + OPT / 2 - width / 2;
  const fromY = B.counterY - 172 + OPT / 2 - (B.stageTop + (B.stageBot - B.stageTop) / 2 - QUIZ_LIFT);
  const arc = Math.sin(p * Math.PI) * -70;                // it lifts over, not straight through
  return `translate(${(1 - e) * fromX}px, ${(1 - e) * fromY + arc}px) `
    + `scale(${interpolate(e, [0, 1], [OPT / size, 1])}) `
    + `rotate(${(1 - e) * -14}deg)`;
};

// ── the three boards on the counter ─────────────────────────────────────────
const Boards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const b = buildAt(frame);
  if (!b) return null;
  // the idea section owns the frame between the hook's cat and the first Short-A build,
  // and the WALL owns it between the last build (jug) and the quiz — without this the
  // final pair sat on top of all twenty-five words
  if (frame >= P(2) - 10 && frame < P(14) - HOLD_IN) return null;
  if (frame >= f(MARKS.wall) - 4 && frame < f(MARKS.quiz)) return null;
  if (vowelCardAt(frame)) return null;   // the vowel announcement owns the stage

  const SIZE = inGroups(frame) ? 250 : inQuiz(frame) ? 232 : 300;
  const isQuiz = !b.wordClip;
  // the LAST build is the quiz answer: its middle stays a blank until "oh!" is said
  const isAnswer = b === BUILDS[BUILDS.length - 1];
  const vowelSoundAt = isAnswer ? f(b.sounds.find((s) => s.idx === 1)?.start ?? 0) : 0;
  const letters = b.word.split("");

  // which sound is speaking right now — the app's own "one lit, two dim"
  let liveIdx = -1;
  b.sounds.forEach((s, i) => {
    const next = b.sounds[i + 1];
    const until = next ? f(next.start) : f(s.start + s.dur) + 8;
    if (frame >= f(s.start) && frame < until) liveIdx = s.idx!;
  });
  const allSounded = b.sounds.length > 0 && frame >= f(b.sounds[b.sounds.length - 1].start + b.sounds[b.sounds.length - 1].dur);

  // the press comes down and the three become one — the app's merge, as a sandwich press
  // the quiz build has NO word clip — its vowel never sounds — so it never presses
  const hasWord = Boolean(b.wordClip);
  const wordAt = hasWord ? f(b.wordClip.start) : 0;
  const quiz = inQuiz(frame);
  const press = hasWord && !quiz
    ? interpolate(frame, [wordAt - 16, wordAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const merged = hasWord && !quiz && frame >= wordAt;

  // no sound has played yet and none is due for a while: the child is being asked to blend
  // ...and only where the wait is LONG. Every build arrives a little before its first
  // sound; this is the child's turn, where the boards stand alone for two whole seconds.
  const waiting = liveIdx < 0 && b.sounds.length > 0
    && frame < f(b.sounds[0].start) - 20 && f(b.sounds[0].start) - b.from > 45;

  const enterAt = (i: number) => spring({ frame: frame - (b.from + i * 4), fps, config: { damping: 13 } });
  const entrance = (i: number) => 0.72 + 0.28 * enterAt(i);

  return (
    <>
      {/* the child's turn: three dots count the thinking time, so two seconds of silence
          is a beat the child can SEE rather than a frozen frame */}
      {waiting && (
        <div style={{ position: "absolute", left: inGroups(frame) ? 64 + LIST_W : 0,
                      top: B.stageTop, width: inGroups(frame) ? B.menuX - (64 + LIST_W) : width,
                      height: B.stageBot - B.stageTop, display: "flex", alignItems: "flex-end",
                      justifyContent: "center", gap: 22, paddingBottom: 6 }}>
          {[0, 1, 2].map((k) => {
            const a = 0.5 + 0.5 * Math.sin(frame / 6 - k * 1.1);
            return (
              <div key={k} style={{ width: 26, height: 26, borderRadius: 13,
                                    background: VOWEL[0], opacity: 0.25 + 0.75 * a,
                                    transform: `scale(${0.75 + 0.45 * a})` }} />
            );
          })}
        </div>
      )}

      {/* the boards — they slide together as the press descends, then hand over.
          During the group sections the stage is the band RIGHT of the word list. */}
      <div
        style={{
          position: "absolute", left: inGroups(frame) ? 64 + LIST_W : 0, top: B.stageTop,
          width: inGroups(frame) ? B.menuX - (64 + LIST_W) : width, height: B.stageBot - B.stageTop,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: interpolate(press, [0, 1], [26, 2]),
          transform: `translateY(${inQuiz(frame) ? -QUIZ_LIFT : 0}px)`,
          opacity: merged ? 0 : 1,
        }}
      >
        {letters.map((ch, i) => {
          const vowel = "aeiou".includes(ch);
          const blank = (isQuiz && i === 1) || (isAnswer && i === 1 && frame < vowelSoundAt);
          return (
            // While the child is sounding a word out alone the stage has nothing else
            // moving, so the boards themselves breathe in turn — it reads as waiting.
            <div key={i} style={{ transform: `scale(${entrance(i) * (1 + (waiting ? 0.045 : 0) * Math.sin(frame / 8 - i * 0.9))}) `
                                             + `translateY(${bob(frame, fps, 4, waiting ? 9 : 2.4, i)}px)` }}>
              <div style={{ transform: blank && frame >= f(run("14").start)
                  ? `scale(${pulse(frame - f(run("14").start), fps, 0.1, 0.9)})`
                  : isAnswer && i === 1 && frame < vowelSoundAt + 21
                    ? flyIn(frame, vowelSoundAt, width, height, SIZE)
                    : undefined }}>
                <LetterBoard
                  letter={ch}
                  vowel={vowel}
                  size={SIZE}
                  blank={blank}
                  lit={!blank && (liveIdx === i || (allSounded && !merged))}
                  dim={liveIdx >= 0 && liveIdx !== i}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* THE PRESS — the top plate of a sandwich press, coming down on the boards */}
      {press > 0 && !merged && (
        <div
          style={{
            position: "absolute",
            left: (inGroups(frame) ? 64 + LIST_W + (B.menuX - 64 - LIST_W) / 2 : width / 2) - 260,
            width: 520, height: 44,
            top: B.stageTop + (B.stageBot - B.stageTop) / 2 - SIZE / 2 - 96 + press * 60,
            background: "linear-gradient(180deg,#C6CCD4 0%,#8E979F 100%)",
            borderRadius: 12, boxShadow: "0 10px 0 #6E767D, 0 16px 30px rgba(40,40,50,0.3)",
          }}
        />
      )}

      {/* the sandwich the three became, WITH its picture — one centred pair, so neither
          has to be squeezed into a margin */}
      {merged && (
        <div
          style={{
            position: "absolute", left: inGroups(frame) ? 64 + LIST_W : 0, top: B.stageTop,
            width: inGroups(frame) ? B.menuX - (64 + LIST_W) : width, height: B.stageBot - B.stageTop,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 64,
          }}
        >
          <div style={{ transform: `scale(${interpolate(spring({ frame: frame - wordAt, fps, config: { damping: 11 } }), [0, 1], [1.35, 1])}) translateY(${bob(frame, fps, 3.2, 11)}px) rotate(${Math.sin((frame / fps) * 1.6) * 1.4}deg)` }}>
            <MergedSandwich word={b.word} size={SIZE} lit={frame < wordAt + 26} />
          </div>
          <Picture build={b} />
        </div>
      )}
    </>
  );
};

// ── the word's picture — bounces in beside the sandwich once the word is said ──
const Picture: React.FC<{ build: Build }> = ({ build }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = f(build.wordClip.start) + 2;
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
  if (build.word === "big") {
    // the word IS a comparison, so the picture is one: the big one holds focus
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, transform: `scale(${s})` }}>
        <div style={{ transform: `scale(${pulse(frame - at, fps, 0.07, 0.9)})`, filter: "drop-shadow(0 0 18px rgba(255,212,102,0.9))" }}>
          <WordPicture pic="🐘" size={260} />
        </div>
        <div style={{ opacity: 0.55 }}>
          <WordPicture pic="🐘" size={92} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ transform: `scale(${s * pulse(frame - at, fps, 0.07, 0.7)}) translateY(${bob(frame, fps, 3.6, 13, 1)}px) rotate(${Math.sin((frame / fps) * 2.4) * 6}deg)` }}>
      <WordPicture pic={PIC[build.word]} size={250} />
    </div>
  );
};

// ── THE IDEA — twelve lines, twelve visual changes ─────────────────────────
// This is the section that shipped frozen: 30 seconds of narration over a still frame.
// Each line below owns a state, cued on the caption that speaks it.
const IdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  if (frame < P(2) - 10 || frame >= P(14) - HOLD_IN) return null;

  const SIZE = 300;
  const at = (i: number) => frame >= P(i);
  const since = (i: number) => frame - P(i);

  // 2 you just read a word   3 three sounds one word   4 look at the colours
  // 5 blue red blue          6 red is the middle       7 red is a vowel
  // 8 blue are consonants    9 C V C                  10 sound them out
  // 11 blend them fast      12 ready, fifteen         13 first vowel aaa
  const split = at(3) && !at(4);                    // the sandwich comes apart again
  const showBoards = at(3) && !at(13);
  const pip = at(5) && !at(6) ? Math.min(2, Math.floor(since(5) / 26)) : -1;
  const midLift = at(6) && !at(9);
  const vowelOnly = at(7) && !at(8);
  const consOnly = at(8) && !at(9);
  const labels = at(9);
  // line 9's three words, each timed: the matching board pulses as its word is said
  const p9 = (captionsJson as unknown as TPhrase[])[9];
  const spokenIdx = labels && !at(10)
    ? p9.words.findIndex((w, k) => frame >= f(w.start) && (k === p9.words.length - 1 || frame < f(p9.words[k + 1].start)))
    : -1;
  const apart = at(10) && !at(11);
  const snap = at(11) && !at(12);
  const grid = at(12) && !at(13);
  const badge = at(13);

  const gap = apart ? 200 : snap ? 6 : 26;

  return (
    <div style={{ position: "absolute", left: 0, top: B.stageTop, width, height: B.stageBot - B.stageTop,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* 2 · the sandwich they just read, pulsing. Keyed on line 3, NOT on showBoards:
             when line 13 was handed to <VowelCard/> the boards went off, which switched
             this back ON and put a bread slice behind the big red `a`. */}
      {!at(3) && (
        <div style={{ transform: `scale(${pulse(since(2), fps, 0.06, 1.1)}) translateY(${bob(frame, fps, 4.4, 3)}px)` }}>
          <MergedSandwich word="cat" size={SIZE} lit />
        </div>
      )}

      {/* 3-13 · the three boards, each line changing what they do */}
      {showBoards && !grid && (
        <div style={{ display: "flex", alignItems: "center", gap, transition: "none" }}>
          {"cat".split("").map((ch, i) => {
            const vowel = i === 1;
            const s = split ? 0.72 + 0.28 * spring({ frame: since(3) - i * 3, fps, config: { damping: 12 } }) : 1;
            const lit = pip === i || (midLift && vowel) || (vowelOnly && vowel) || (consOnly && !vowel) || spokenIdx === i;
            const dim = (vowelOnly && !vowel) || (consOnly && vowel);
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 50,
                transform: `scale(${s * (spokenIdx === i ? 1.1 : 1)}) translateY(${(midLift && vowel ? -22 : 0) + bob(frame, fps, 4, 2.4, i)}px)`,
              }}>
                <div style={{ height: 52, fontSize: 46, fontWeight: 800, lineHeight: 1,
                              color: vowel ? VOWEL : CONSONANT,
                              opacity: labels ? interpolate(since(9) - i * 8, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0 }}>
                  {vowel ? "V" : "C"}
                </div>
                <LetterBoard letter={ch} vowel={vowel} size={SIZE} lit={lit} dim={dim} />
                <div style={{ height: 40, fontSize: 34, fontWeight: 800, lineHeight: 1,
                              color: vowel ? VOWEL : CONSONANT,
                              opacity: (vowelOnly && vowel) || (consOnly && !vowel) ? 1 : 0 }}>
                  {vowel ? "vowel" : "consonant"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 12 · the twenty-five plates we are about to fill — the shop's own golden
          word-plates, five rows behind their vowel badge. Grey dashed "?" boxes read as
          a broken layout rather than a promise. */}
      {grid && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GROUPS.map((g, r) => (
              <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 36, width: 46, textAlign: "center",
                               opacity: interpolate(since(12) - r * 5, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                  {g.emoji}
                </span>
                {Array.from({ length: 5 }, (_, c) => {
                  const k = r * 5 + c;
                  const e = spring({ frame: since(12) - k * 1.4, fps, config: { damping: 13 } });
                  return (
                    <div
                      key={c}
                      style={{
                        width: 128, height: 52, borderRadius: 26,
                        background: "linear-gradient(180deg,#F3C97E 0%,#DFA45A 100%)",
                        boxShadow: "0 6px 0 #B9803C",
                        transform: `scale(${0.7 + 0.3 * e}) translateY(${bob(frame, fps, 3.6, 5, k)}px)`,
                        opacity: e,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13 · "First vowel — aaa." is drawn by <VowelCard/>, with the other four */}
    </div>
  );
};

// ── THE VOWEL ANNOUNCEMENT ──────────────────────────────────────────────────
// "First vowel — aaa." · "New vowel. eh." · "Next one — ih." · "Next — oh." ·
// "Last vowel. uh." Each names a vowel and then goes straight into that vowel's words, so
// the vowel has to be BIG on screen while it is named — otherwise the line is spoken over
// whatever the previous word happened to leave behind. Keyed on the caption line, so the
// card is up for exactly as long as the sentence is.
const VOWEL_LINES: { say: string; letter: string; badge: string }[] = [
  { say: "First vowel", letter: "a", badge: "🍎" },
  { say: "New vowel", letter: "e", badge: "🥚" },
  { say: "Next one", letter: "i", badge: "🍦" },
  { say: "Next —", letter: "o", badge: "🐙" },
  { say: "Last vowel", letter: "u", badge: "☂️" },
];

/** [fromFrame, toFrame, entry] for the vowel card live at this frame, or null */
const vowelCardAt = (frame: number) => {
  const caps = captionsJson as unknown as TPhrase[];
  for (const v of VOWEL_LINES) {
    const idx = caps.findIndex((c) => c.text.startsWith(v.say));
    if (idx < 0) continue;
    const from = f(caps[idx].start) - 6;
    // it holds until the boards for the first word of that group come up, so the child
    // reads the vowel through the whole gap rather than for one syllable
    const next = BUILDS.find((b) => b.from > from);
    const to = next ? next.from : f(caps[idx].end) + 24;
    if (frame >= from && frame < to) return { v, from };
  }
  return null;
};

const VowelCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const hit = vowelCardAt(frame);
  if (!hit) return null;
  const s = spring({ frame: frame - hit.from, fps, config: { damping: 11 } });
  const g = inGroups(frame);
  // THE SAME FOOTPRINT AS THE BOARDS IT REPLACES. Stacking the badge above the card made
  // the group ~400px tall against the boards' 250–300, and that extra height pushed the
  // card down through the counter, over the sandwich plate and the cones standing on it.
  // The badge is an overlay now, so it costs no layout height.
  // ONE size for all five. `a` is announced before the word list exists, so following the
  // boards' own rule made it 300 against the others' 250 — five announcements that should
  // be identical looked like two different cards.
  const size = 264;
  return (
    <div style={{ position: "absolute", left: g ? 64 + LIST_W : 0, top: B.stageTop,
                  width: g ? B.menuX - (64 + LIST_W) : width, height: B.stageBot - B.stageTop,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative",
                    transform: `scale(${(0.7 + 0.3 * s) * (1 + 0.035 * Math.sin((frame - hit.from) / 11))}) `
                               + `translateY(${bob(frame, fps, 3.2, 10)}px) `
                               + `rotate(${(1 - s) * -8 + Math.sin((frame - hit.from) / 17) * 2.2}deg)` }}>
        <LetterBoard letter={hit.v.letter} vowel size={size} lit />
        <div style={{ position: "absolute", left: "50%", top: -58, fontSize: 66,
                      transform: `translateX(-50%) scale(${s}) `
                                 + `translateY(${bob(frame, fps, 3.6, 7)}px) `
                                 + `rotate(${Math.sin((frame - hit.from) / 13) * 9}deg)` }}>
          {hit.v.badge}
        </div>
      </div>
    </div>
  );
};

// ── THE WORD LIST — the app's CVCLearnView left column ──────────────────────
// During the teaching groups the frame splits like the app: the group's five words
// listed on the left, the build animating on the right, the live word highlighted.
const LIST_W = 380;
/** lines that hold two words up against each other — both chips take turns pulsing */
const COMPARE = [
  { run: "06", words: ["hen", "pen"] },
  { run: "08", words: ["pig", "big"] },
  { run: "10", words: ["pot", "hot"] },
];
const inGroups = (frame: number) => frame >= f(MARKS.shortA) && frame < f(MARKS.wall);

const WordList: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  if (!inGroups(frame)) return null;
  const gi = groupIndexAt(frame);
  if (gi < 0) return null;
  const g = GROUPS[gi];
  const words = GROUP_WORDS[g.key];
  const live = buildAt(frame);

  return (
    <div
      style={{
        position: "absolute", left: 48, top: B.stageTop + 26, width: LIST_W,
        height: B.counterY - B.stageTop - 40,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 14,
        padding: "18px 24px 34px", boxSizing: "border-box",
        // its own board, like the menu opposite — the chips were floating over the jar
        // shelf and the bread basket
        background: "#FFFDF7", borderRadius: 22, border: "8px solid #C98A47",
        boxShadow: "0 14px 30px rgba(60,40,20,0.22)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6,
                    fontSize: 44, fontWeight: 800, color: palette.ink }}>
        <span style={{ fontSize: 48 }}>{g.emoji}</span>{g.label}
      </div>
      {words.map((w, i) => {
        const isLive = live?.word === w && live?.wordClip;
        // Every line that COMPARES two words makes those two chips take turns pulsing:
        //   06 "Hen. Pen. Hear the middle?"  08 "Pig... big..."  10 "Pot. Hot..."
        const pair = COMPARE.find((c) => c.words.includes(w));
        const pr = pair ? CLIPS.find((c) => c.kind === "run" && c.id === pair.run) : undefined;
        const asking = pr ? frame >= f(pr.start) && frame < f(pr.start + pr.dur) + 30 : false;
        const namedPulse = Boolean(
          asking && pr && Math.floor((frame - f(pr.start)) / 14) % 2 === pair!.words.indexOf(w)
        );
        const done = BUILDS.some((b) => b.word === w && b.wordClip && frame >= b.to && b.from >= f(MARKS[g.key]));
        const s = spring({ frame: frame - f(MARKS[g.key]) - i * 4, fps, config: { damping: 13 } });
        return (
          <div
            key={w}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "7px 22px", borderRadius: 18, width: LIST_W - 60,
              background: isLive || namedPulse ? "#FFD466" : done ? "#FFF3D6" : "rgba(255,255,255,0.7)",
              border: `4px solid ${isLive || namedPulse ? "#E0A400" : done ? "#E8CFA0" : "#EADFC8"}`,
              boxShadow: isLive || namedPulse ? "0 10px 22px rgba(224,164,0,0.35)" : "0 6px 14px rgba(60,40,20,0.08)",
              transform: `scale(${s * (isLive || namedPulse ? 1.06 : 1)})`, transformOrigin: "left center",
            }}
          >
            {w.split("").map((ch, k) => (
              <span key={k} style={{ fontSize: 40, fontWeight: 800, lineHeight: 1,
                                     color: "aeiou".includes(ch) ? VOWEL : CONSONANT }}>
                {ch}
              </span>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 30, opacity: done ? 1 : 0 }}>✓</span>
          </div>
        );
      })}
    </div>
  );
};

// ── the wall of finished words ──────────────────────────────────────────────
const Wall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const from = f(MARKS.wall);
  const to = f(MARKS.quiz);
  if (frame < from || frame >= to) return null;
  return (
    <div
      style={{
        position: "absolute", left: B.contentL, top: B.stageTop, width: B.contentR - B.contentL,
        height: B.stageBot - B.stageTop, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
      }}
    >
      {Object.entries(GROUP_WORDS).map(([key, words], row) => (
        <div key={key} style={{ display: "grid", gridTemplateColumns: "64px repeat(5, 208px)",
                                alignItems: "center", justifyItems: "center", columnGap: 8 }}>
          <span style={{ fontSize: 44, textAlign: "center" }}>{GROUPS[row].emoji}</span>
          {words.map((w, i) => {
            const k = row * 5 + i;
            const s = 0.7 + 0.3 * spring({ frame: frame - from - k * 2, fps, config: { damping: 13 } });
            return (
              // a WAVE crosses the grid — twenty-five cards holding still read as a
              // frozen frame however gently each one bobs on its own
              <div key={w} style={{ transform: `scale(${s * (1 + 0.05 * Math.sin((frame - from) / 9 - k * 0.5))}) `
                                               + `translateY(${bob(frame, fps, 3.4, 7, k) + 9 * Math.sin((frame - from) / 9 - k * 0.5)}px)` }}>
                <MergedSandwich word={w} size={88} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── the quiz's three answer tiles ───────────────────────────────────────────
const QuizOptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const from = f(MARKS.quiz);
  // the answer's vowel sounds first, THEN the whole word — the tiles bow out as the
  // boards fill in, or the two stack on top of each other
  const vowelAt = f(CLIPS.filter((c) => c.kind === "sound").slice(-1)[0].start);
  const answerAt = f(CLIPS.filter((c) => c.kind === "word").slice(-1)[0].start);
  if (frame < from + 20 || frame >= answerAt) return null;
  const revealed = frame >= vowelAt;
  return (
    <div
      style={{
        position: "absolute", left: 0, top: B.counterY - 172, width,
        display: "flex", justifyContent: "center", gap: OPT_GAP,
      }}
    >
      {["o", "a", "u"].map((ch, i) => {
        const right = ch === "o";
        const s = spring({ frame: frame - from - 20 - i * 4, fps, config: { damping: 12 } });
        return (
          <div
            key={ch}
            style={{
              transform: `scale(${s * (revealed && right ? pulse(frame - vowelAt, fps, 0.09, 1) : 1)})`,
              // the chosen tile does not stay behind — it IS the letter now flying
              // into the word, so it leaves the row as the flight starts
              opacity: revealed ? (right ? 0 : 0.35) : 1,
            }}
          >
            <LetterBoard letter={ch} vowel size={OPT} lit={revealed && right} />
          </div>
        );
      })}
    </div>
  );
};

const FoundConfetti: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  // "You found it." — paper pieces, from the answer word
  const foundAt = f((captionsJson as unknown as TPhrase[]).slice(-2)[0].start);
  if (frame < foundAt || frame > foundAt + 90) return null;
  return (
    <>
      {[0, 12, 26].map((d, k) => (
        <Confetti key={k} frame={frame - foundAt} fps={fps} burstFrame={d}
                  origin={{ x: width / 2 + (k - 1) * 260, y: 420 }}
                  colors={["#E64A4A", "#2979FF", "#FFD466", "#7FB069", "#8E7CC3"]}
                  count={30} seed={k + 3} />
      ))}
    </>
  );
};

export const CvcReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const B = bands(width, height);
  const gi = groupIndexAt(frame);
  const dim = interpolate(frame, [DL_FROM, DL_FROM + 20], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#FFF6E6" }}>
      <ShopWorld dim={dim} activeGroup={frame < f(MARKS.wall) ? gi : -1} doneGroups={frame >= f(MARKS.wall) ? 5 : Math.max(0, gi)} leftFree={!inGroups(frame)} />

      {/* every clip plays whole, at the frame the timeline put it */}
      {CLIPS.map((c, i) => (
        <Sequence key={i} from={f(c.start)} durationInFrames={f(c.dur) + 2}>
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={DL_FROM}>
        <div
          style={{
            position: "absolute", left: 0, top: B.bannerTop, width, textAlign: "center",
            fontSize: 54, fontWeight: 800, color: palette.ink, letterSpacing: 1,
          }}
        >
          <span style={{ color: CONSONANT }}>C</span>onsonant ·{" "}
          <span style={{ color: VOWEL }}>V</span>owel ·{" "}
          <span style={{ color: CONSONANT }}>C</span>onsonant
        </div>

        <Boards />
        <IdeaScene />
        <WordList />
        <VowelCard />
        <Wall />
        <QuizOptions />
        <FoundConfetti />
        <Captions track={CAPTIONS} fontSize={50} bottom={44} />
        <Watermark corner="br" widthFrac={0.075} opacity={0.5} pad={34} />
      </Sequence>

      <Sequence from={DL_FROM}>
        <StoreOutro silent compact total={CVC_DURATION - DL_FROM} />
      </Sequence>
    </AbsoluteFill>
  );
};
