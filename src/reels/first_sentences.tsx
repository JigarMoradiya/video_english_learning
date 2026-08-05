import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../data/first_sentences.timeline.json";
import captionsJson from "../data/first_sentences.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { Watermark } from "../components/Watermark";
import { Confetti } from "../components/Confetti";
import { bob, pulse } from "../lib/motion";
import { font } from "../data/tokens";
import { ACCENT, aspectOf, BankPicture, bands, EmptySocket, sizes, StoneRow, StonesWorld, StoneState, WordStone } from "../components/SteppingStones";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { FrogHopper } from "../components/LilyPond";

// ── MILESTONE · Read Your First Sentences — 16:9 ─────────────────────────────
//
// Driven entirely by src/data/first_sentences.timeline.json. Every clip in that file has
// an absolute start, so a visual cue is never a guess — it is the frame the sound actually
// plays. The gaps in it are decisions, not leftovers from the take.
//
// THE LAW: every narration LINE gets its own visual change. The cue helpers below are
// caption-indexed for exactly that reason — a cue is a line, never a section, never a
// hand-counted frame.
//
// THE FRAME IS ONE CONTINUOUS SCENE. The stream, the banks and the reeds never cut; only
// what is standing in the water changes.

const FPS = 30;
const CAPS = captionsJson as unknown as TPhrase[];
const TL = timeline as {
  clips: { kind: string; src: string; start: number; dur: number; label: string; line?: number }[];
  marks: Record<string, number>;
  total: number;
};

const f = (s: number) => Math.round(s * FPS);
/** frame a caption LINE starts / ends */
const P = (i: number) => f(CAPS[i].start);
const PE = (i: number) => f(CAPS[i].end);
/** frame a section mark lands */
const M = (id: string) => f(TL.marks[id]);

// 1.2s of hold, so a caption never survives one of the three child pauses
const CAPTION_TRACK = makeTrack(CAPS, TL.total, FPS, 1.2);

export const FIRST_SENTENCES_DURATION = M("download") + STORE_OUTRO_F;

// ── the app clips, resolved once ─────────────────────────────────────────────
const clipsBetween = (kind: string, from: number, to: number) =>
  TL.clips.filter((c) => c.kind === kind && c.start >= from - 0.001 && c.start < to);

const EIGHT = clipsBetween("word", TL.marks.eight, TL.marks.build);
const ARRIVE = clipsBetween("word", TL.marks.arrive, TL.marks.readline);
const lineClip = (label: string) => TL.clips.find((c) => c.kind === "line" && c.label === label)!;
const wordClip = (label: string, after: number) =>
  TL.clips.find((c) => c.kind === "word" && c.label === label && c.start >= after - 0.001)!;

const L_BUILD = lineClip("the_map_is_in_the_bag");
const L_TURN = lineClip("the_sun_is_hot");
const L_MEAN = lineClip("the_pin_is_in_the_tin");
const L_MISS = lineClip("the_cat_sat_on_a_mat");
const W_ON = wordClip("on", 0);
const W_THE_SOLO = wordClip("the", TL.marks.little + 6);
const W_SAT = wordClip("sat", TL.marks.missingpick - 0.5);

const HELPER_SET = new Set(["the", "a", "is", "on", "in", "has", "can", "and"]);

// ── sentences shown, exactly as the app spells them ──────────────────────────
const S_CONCEPT = ["The", "cat", "sat", "on", "a", "mat."];
const S_BUILD = ["The", "map", "is", "in", "the", "bag."];
const S_TURN = ["The", "sun", "is", "hot."];
const S_MEAN = ["The", "pin", "is", "in", "the", "tin."];
const S_MISS = ["The", "cat", "___", "on", "a", "mat."];
const EIGHT_WORDS = ["the", "a", "is", "on", "in", "has", "can", "and"];

const bare = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

// The answer stone flies out of the choices row and into the gap.
//
// The VERTICAL leg is derived from the band table — the choices sit at `upperY - 40` and
// the row at `stoneY` — so it is exact in every aspect and cannot drift when a table
// changes. Checked against a measured 1920×1080 render: the formula gives -271 where the
// pixels say -276, five px over a 276px fall.
//
// The HORIZONTAL leg is measured, and only for 16:9, where the three choices were read off
// a real frame: sat x=764 against the gap slot at x=848. A portrait frame is half as wide
// and its slots land elsewhere, so rather than guess, the stone there drops straight down
// into the slot — which still reads as the word leaving the options, because it vanishes
// from the choices row on the same frame.
const FLY_FRAMES = 20;

const flyOffset = (b: ReturnType<typeof bands>, S: ReturnType<typeof sizes>) => ({
  x: b.aspect === "16x9" ? 764 - 848 : 0,
  y: (b.upperY - 40 + S.choice * 0.775) - b.stoneY,
  scale: S.choice / S.missing,
});

const flyIn = (frame: number, at: number, b: ReturnType<typeof bands>, S: ReturnType<typeof sizes>): string => {
  const o = flyOffset(b, S);
  const p = interpolate(frame, [at, at + FLY_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = 1 - Math.pow(1 - p, 3);                       // arrives settling, not braking
  const arc = Math.sin(p * Math.PI) * -(b.height * 0.05); // it lifts over the water
  return `translate(${(1 - e) * o.x}px, ${(1 - e) * o.y + arc}px) `
    + `scale(${interpolate(e, [0, 1], [o.scale, 1])}) `
    + `rotate(${(1 - e) * -12}deg)`;
};

/**
 * Which word of a line is being spoken right now.
 * The app walks its highlight evenly along the line while the recording plays, and the
 * video does the same, so a child sees the same thing in both places.
 */
const litIndex = (frame: number, clip: { start: number; dur: number }, count: number): number => {
  const t = frame - f(clip.start);
  if (t < 0 || t > f(clip.dur)) return -1;
  return Math.min(count - 1, Math.floor((t / f(clip.dur)) * count));
};

// ── Scenes ───────────────────────────────────────────────────────────────────

const Row: React.FC<{
  words: string[]; lit?: number; size?: number; shown?: number;
  /** "Some words are tiny." — the helper stones actually shrink, so the line is shown */
  tinyHelpers?: boolean;
  /** sockets stand where words have not arrived yet */
  sockets?: boolean;
  /** index of the word flying in from the choices row, and the frame it left */
  flyIndex?: number;
  flyAt?: number;
}> = ({ words, lit, size, shown = 99, tinyHelpers = false, sockets = false, flyIndex = -1, flyAt = 0 }) => {
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  const S = sizes(width, height);
  const sizePx = size ?? S.row;
  const litIdx = lit ?? -1;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoneRow b={b}>
      {words.map((w, i) => {
        const helper = HELPER_SET.has(bare(w));
        if (sockets && i >= shown) return <EmptySocket key={i} size={sizePx} seed={i} />;
        const state: StoneState = i >= shown ? "hidden" : w === "___" ? "gap" : i === litIdx ? "lit" : "idle";
        const sz = tinyHelpers && helper ? sizePx * 0.62 : sizePx;
        const shrink = tinyHelpers && helper ? 1 + 0.06 * Math.sin(frame / 7 + i) : 1;
        const fly = i === flyIndex && frame < flyAt + FLY_FRAMES ? flyIn(frame, flyAt, b, S) : undefined;
        return (
          <div key={i} style={{ transform: fly ?? `scale(${shrink})` }}>
            <WordStone word={w} helper={helper} state={state} seed={i} size={sz} />
          </div>
        );
      })}
    </StoneRow>
  );
};

/**
 * Faint sentences drifting behind the eight — "you can read a LOT" needs to be shown,
 * not just said. These are real lines from the app's own thirty-five.
 */
const GhostLines: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  const lines = ["The hen is in a pen.", "A bug is on the rug.", "Tom got a mop.", "The fox has a box."];
  const appear = interpolate(frame - from, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, top: b.upperY - 120, width, opacity: appear }}>
      {lines.map((l, i) => {
        const t = ((frame - from) / 30 + i * 1.2) % 9;
        return (
          <div
            key={l}
            style={{
              position: "absolute", left: 0, top: i * 52,
              width, textAlign: "center",
              fontFamily: font.family, fontWeight: 800, fontSize: sizes(width, height).ghost,
              color: "#1565C0",
              opacity: 0.16 + 0.10 * Math.sin(t),
              transform: `translateX(${Math.sin(t / 1.4 + i) * 46}px)`,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

/** the three floating choice stones, ABOVE the row so nothing ever overlaps it */
const Choices: React.FC<{ words: string[]; picked?: number; from: number; flown?: boolean }> = ({ words, picked = -1, from, flown = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const b = bands(width, height);
  const appear = interpolate(frame - from, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0, top: b.upperY - 40,
        width: b.width,
        display: "flex", justifyContent: "center", gap: 40,
        opacity: appear,
      }}
    >
      {words.map((w, i) => (
        <div
          key={w}
          style={{
            transform: `translateY(${bob(frame, fps, 7, 2.4, i)}px) scale(${i === picked ? 1.12 : 1})`,
            // once it has flown into the sentence it is no longer up here
            opacity: flown && i === picked ? 0 : picked >= 0 && i !== picked ? 0.28 : 1,
          }}
        >
          <WordStone word={w} state={i === picked ? "lit" : "idle"} seed={i + 4} size={sizes(width, height).choice} />
        </div>
      ))}
    </div>
  );
};

/** three pictures on the far bank — the "which one means this?" question */
const BankChoices: React.FC<{ emojis: string[]; picked: number; from: number }> = ({ emojis, picked, from }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const b = bands(width, height);
  const appear = interpolate(frame - from, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0, top: b.upperY - 90,
        width: b.width,
        display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 130,
        opacity: appear,
      }}
    >
      {emojis.map((e, i) => (
        <div
          key={e}
          style={{
            fontSize: sizes(width, height).picture * 0.7,
            transform: `translateY(${bob(frame, fps, 6, 2.6, i)}px) scale(${i === picked ? 1.22 : 1})`,
            opacity: picked >= 0 && i !== picked ? 0.22 : 1,
            filter: i === picked ? "drop-shadow(0 0 26px rgba(255,179,0,0.9))" : "none",
          }}
        >
          {e}
        </div>
      ))}
    </div>
  );
};

// ── The reel ─────────────────────────────────────────────────────────────────

export const FirstSentencesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const b = bands(width, height);
  const S = sizes(width, height);

  // the frame a word last lit — the frog jumps on that beat
  const lastHop = React.useMemo(() => {
    const marks = [
      ...EIGHT.map((c) => f(c.start)),
      ...ARRIVE.map((c) => f(c.start)),
      ...[L_BUILD, L_TURN, L_MEAN, L_MISS].flatMap((c) =>
        Array.from({ length: 6 }, (_, i) => f(c.start) + Math.round((f(c.dur) * i) / 6))),
      f(W_SAT.start),
    ].sort((x, y) => x - y);
    return marks;
  }, []).filter((m) => m <= frame).slice(-1)[0] ?? -999;

  // ── what is standing in the water right now ────────────────────────────────
  let body: React.ReactNode = null;

  if (frame < M("eight")) {
    // 1 · the little words, inside a real sentence
    if (frame < P(1)) {
      // "Some words are tiny." — the helper stones shrink where they stand
      body = <Row words={S_CONCEPT} tinyHelpers />;
    } else if (frame < P(2)) {
      // "They turn up in almost every sentence." — so the sentence keeps changing under
      // them while the little purple stones stay
      const cycle = [S_CONCEPT, S_BUILD, S_MEAN, S_TURN];
      const which = Math.min(cycle.length - 1, Math.floor((frame - P(1)) / 22));
      body = <Row words={cycle[which]} tinyHelpers />;
    } else if (frame < P(3)) {
      // "Some you can sound out." — one stone, and it genuinely splits
      const t = frame - f(W_ON.start);
      const split = t >= 0 && t < f(W_ON.dur) + 18;
      body = split
        ? <Row words={["o", "n"]} size={72} />
        : <Row words={["on"]} size={72} />;
    } else {
      // "Some you cannot. You just learn them." — one stone that refuses to
      const t = frame - f(W_THE_SOLO.start);
      const shake = t >= 0 && t < 26 ? Math.sin(t / 1.6) * 9 : 0;
      body = (
        <div style={{ transform: `translateX(${shake}px)` }}>
          <Row words={["the"]} size={72} />
        </div>
      );
    }
  } else if (frame < M("build")) {
    // 2 · the eight, each speaking in turn
    let lit = -1;
    EIGHT.forEach((c, i) => {
      if (frame >= f(c.start) && frame < f(c.start + c.dur) + 6) lit = i;
    });
    const allGlow = frame >= P(6);
    body = <Row words={EIGHT_WORDS} size={S.eight} lit={allGlow ? -1 : lit} />;
  } else if (frame < M("turn")) {
    // 3 · build one — the words arrive, then the line reads
    let shown = 0;
    ARRIVE.forEach((c, i) => { if (frame >= f(c.start) - 4) shown = i + 1; });
    if (frame < M("arrive")) shown = 0;
    const lit = litIndex(frame, L_BUILD, S_BUILD.length);
    // the empty sockets stand there from "Let's build one." onward, so the line has
    // something to point at instead of open water
    body = <Row words={S_BUILD} shown={frame >= M("readline") ? 99 : shown} lit={lit} sockets />;
  } else if (frame < M("meaning")) {
    // 4 · your turn — the child reads it alone first
    const lit = litIndex(frame, L_TURN, S_TURN.length);
    body = <Row words={S_TURN} lit={lit} />;
  } else if (frame < M("missing")) {
    // 5 · what does it mean
    const lit = litIndex(frame, L_MEAN, S_MEAN.length);
    body = <Row words={S_MEAN} lit={lit} />;
  } else {
    // 6 · a stone is missing
    const flyAt = f(W_SAT.start);
    const filled = frame >= flyAt;
    const words = filled ? ["The", "cat", "sat", "on", "a", "mat."] : S_MISS;
    const lit = filled ? litIndex(frame, L_MISS, words.length) : -1;
    body = <Row words={words} lit={lit} size={S.missing} flyIndex={filled ? 2 : -1} flyAt={flyAt} />;
  }

  // ── the far bank ───────────────────────────────────────────────────────────
  const bagFrom = f(L_BUILD.start + L_BUILD.dur);
  const sunFrom = f(L_TURN.start + L_TURN.dur);
  const catFrom = f(L_MISS.start + L_MISS.dur);

  return (
    <AbsoluteFill>
      <StonesWorld />

      {/* every clip plays at its own start — nothing is mixed down, nothing drifts */}
      {TL.clips.map((c, i) => (
        <Sequence key={i} from={f(c.start)} durationInFrames={Math.max(1, f(c.dur) + 2)}>
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}

      {frame < M("download") && body}

      {/* the pond's own character — it hops on every word the reading moves to, so the
          9:16 has a face in it that the wide cut does not */}
      {b.aspect === "9x16" && frame < M("download") && (
        // BELOW the line, not beside it. At x=0.085 the frog spanned x 11–173 while the
        // sentence starts at x≈107, so it sat under the first word — and that far into the
        // left edge is outside the safe area a Reel leaves clear.
        <FrogHopper x={b.width * 0.20} y={b.stoneY + b.height * 0.062} hopFrom={lastHop} />
      )}

      {/* every word landing gets a soft pop; every right answer gets the app's own
          correct chime; a picture arriving twinkles. All self-synthesised. */}
      {ARRIVE.map((c, i) => (
        <Sequence key={`pop${i}`} from={f(c.start) - 3} durationInFrames={14}>
          <Audio src={staticFile("sfx/pop.mp3")} volume={0.24} />
        </Sequence>
      ))}
      {/* the praise rings out AFTER "I knew you could." — over the line it summed past
          full scale and clipped */}
      <Sequence from={PE(14) + 2} durationInFrames={44}>
        <Audio src={staticFile("sfx/brave.mp3")} volume={0.30} />
      </Sequence>
      {/* the chime rings just AFTER the word, never across it — landing on the syllable
          summed past full scale both times */}
      <Sequence from={PE(17) + 1} durationInFrames={26}>
        <Audio src={staticFile("sfx/correct.mp3")} volume={0.24} />
      </Sequence>
      <Sequence from={f(W_SAT.start + W_SAT.dur) + 1} durationInFrames={26}>
        <Audio src={staticFile("sfx/correct.mp3")} volume={0.24} />
      </Sequence>
      {[bagFrom, sunFrom, catFrom].map((fr, i) => (
        <Sequence key={`tw${i}`} from={fr - 2} durationInFrames={30}>
          <Audio src={staticFile("sfx/twinkle.mp3")} volume={0.22} />
        </Sequence>
      ))}

      {frame >= P(5) && frame < M("build") && <GhostLines from={P(5)} />}

      {/* the three word choices — only while the missing-stone question is open */}
      {frame >= P(21) && frame < f(W_SAT.start) + FLY_FRAMES && (
        <Choices
          words={["sat", "sit", "sun"]}
          picked={frame >= f(W_SAT.start) - 8 ? 0 : -1}
          flown={frame >= f(W_SAT.start)}
          from={P(21)}
        />
      )}

      {/* the three pictures — only while the meaning question is open */}
      {frame >= P(16) && frame < M("missing") && (
        <BankChoices emojis={["📌", "🏆", "👄"]} picked={frame >= P(17) ? 0 : -1} from={P(16)} />
      )}

      {/* pictures that land once a line has actually been read */}
      {/* the line is "The map is in the bag." — so the map is IN the bag */}
      {frame >= bagFrom && frame < M("turn") && <BankPicture emoji="🎒" inner="🗺️" b={b} show from={bagFrom} />}
      {/* "The sun is hot." — heat haze and a beating glow, so hot is felt */}
      {frame >= sunFrom && frame < M("meaning") && <BankPicture emoji="☀️" hot b={b} show from={sunFrom} />}
      {/* the app's own cat, on the mat it sat on */}
      {frame >= catFrom && frame < M("close") && (
        <BankPicture emoji="🐱" img="letters/cat.png" mat b={b} show from={catFrom} />
      )}

      {/* praise bursts — one per section, never more */}
      <Confetti frame={frame} fps={fps} burstFrame={P(14)} origin={{ x: width / 2, y: b.stoneY }} colors={["#FFB300", "#43A047", "#1565C0", "#8E24AA"]} />
      <Confetti frame={frame} fps={fps} burstFrame={P(17)} origin={{ x: width / 2, y: b.upperY }} colors={["#FFB300", "#43A047", "#00897B"]} />
      <Confetti frame={frame} fps={fps} burstFrame={P(22)} origin={{ x: width / 2, y: b.stoneY }} colors={["#FFB300", "#E65100", "#1565C0"]} />

      {/* the crossing — all the stones glow gold on the closing line */}
      {frame >= P(23) && frame < M("download") && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% ${b.stoneY}px, rgba(255,179,0,${0.18 * pulse(frame, fps, 1, 1.6)}) 0%, rgba(255,179,0,0) 55%)`,
          }}
        />
      )}

      {/* the CTA card carries its own words — a caption bar under it just collided
          with the phone, so captions stop when the card arrives */}
      {frame < M("download") && <Captions track={CAPTION_TRACK} />}
      {/* 4:5 puts the logo top-RIGHT — its left corner is where the sun sits */}
      <Watermark corner={b.aspect === "4x5" ? "tr" : "tl"} />

      {/* the CTA is in the teacher's own take, so the card is silent. The world dims
          behind it — without this the sentence stones read straight through the phone. */}
      <Sequence from={M("download")}>
        <AbsoluteFill style={{ background: "rgba(10, 40, 60, 0.55)" }} />
        {/* the 16:9 card lays the phone and the CTA side by side — in a 1080-wide frame
            that right column runs clean off the edge, so portrait gets its own */}
        {aspectOf(width, height) === "16x9"
          ? <StoreOutro silent compact={false} total={STORE_OUTRO_F} ctaBg={ACCENT} titleColor="#FFFFFF" />
          : <StoreOutroPortrait />}
      </Sequence>
    </AbsoluteFill>
  );
};
