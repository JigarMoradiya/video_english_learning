import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/l6_families.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { Watermark } from "../components/Watermark";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { MUSIC_BED, MUSIC_FADE_IN, MUSIC_FADE_OUT } from "../data/mix";
import { picFor } from "../data/word_pics";
import { say } from "../lib/noEcho";
import {
  B, Banner, Content, Fixed, Hub, LANE, Lane, Line, Mo, Row, Tile, Train, VowelStrip, WashingLine, Zip, bands,
} from "../components/WordLane";

// ── L6 · WORD FAMILIES ──────────────────────────────────────────────────────
//
// 214 lines, 9:03, thirteen families, eighty-one words. One mechanism repeated thirteen
// times, so the payoff IS the repetition — which is why it is one video and not three.
//
// The first cut was rejected for two faults this one is built to make impossible:
//   1. it printed each caption on screen as its own "visual" — every string a scene draws
//      now goes through say(), which throws if it repeats the spoken line;
//   2. it showed the same frame for nine minutes — the SETTING now changes with the
//      family, and Mo, Zip, the doorplate and the washing line all change per line.

const FPS = 30;
const P = phrasesJson as unknown as TPhrase[];
const AUDIO_SEC = 542.67;
const f = (s: number) => Math.round(s * FPS);
const TRACK = makeTrack(P, P[P.length - 1].end, FPS, 1.0);

const FAMILIES: { rime: string; words: string[] }[] = [
  { rime: "at",  words: ["cat", "bat", "hat", "rat", "mat", "sat", "pat", "fat"] },
  { rime: "an",  words: ["can", "man", "fan", "ran", "pan", "tan", "van", "ban"] },
  { rime: "ap",  words: ["cap", "map", "nap", "tap", "lap", "gap"] },
  { rime: "en",  words: ["hen", "ten", "pen", "men", "den"] },
  { rime: "ig",  words: ["big", "pig", "dig", "wig", "jig", "fig"] },
  { rime: "it",  words: ["sit", "bit", "hit", "fit", "kit", "pit", "wit"] },
  { rime: "in",  words: ["pin", "win", "fin", "tin", "bin"] },
  { rime: "og",  words: ["dog", "log", "fog", "hog", "jog"] },
  { rime: "ot",  words: ["hot", "pot", "dot", "lot", "cot", "rot", "got"] },
  { rime: "op",  words: ["top", "hop", "mop", "pop", "cop"] },
  { rime: "un",  words: ["sun", "run", "fun", "bun", "gun", "pun"] },
  { rime: "ug",  words: ["bug", "rug", "hug", "mug", "dug", "jug"] },
  { rime: "all", words: ["ball", "tall", "wall", "fall", "call", "hall", "mall"] },
];
const clean = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** which phrase reads which word — walked IN ORDER, so `pat` in the ‑at run cannot bind to
 *  the word `pat` spoken later in a sentence */
type Cell = { rime: string; word: string; k: number };
const CELL: Record<number, Cell> = {};
const FIRST: Record<string, number> = {};
(() => {
  let cursor = 0;
  for (const fam of FAMILIES) {
    fam.words.forEach((w, k) => {
      for (let i = cursor; i < P.length; i++) {
        if (clean(P[i].text) === w) {
          CELL[i] = { rime: fam.rime, word: w, k };
          if (FIRST[fam.rime] === undefined) FIRST[fam.rime] = i;
          cursor = i + 1;
          return;
        }
      }
    });
  }
})();

/**
 * The first family is taught at 66.6s. Before that there is no house, no washing line and
 * no vowel strip — the intro was standing in the ‑at family's garden while the teacher
 * talked about Level Five, and the six rule cards ran into the front wall.
 */
const FIRST_FAMILY_IDX = Math.min(...Object.values(FIRST));
const inIntro = (idx: number) => idx < FIRST_FAMILY_IDX;

const STORE_FROM_IDX = P.findIndex((p) => p.text.toLowerCase().includes("practise every one"));
const at = (i: number) => f(P[i].start);
export const L6_DURATION = Math.max(f(AUDIO_SEC) + 40, at(STORE_FROM_IDX) + STORE_OUTRO_F);

const phraseAt = (frame: number) => {
  let idx = 0;
  for (let i = 0; i < P.length; i++) { if (f(P[i].start) <= frame) idx = i; else break; }
  return idx;
};
const BEAT_OF: number[] = (() => {
  const out: number[] = []; let cur = 0;
  for (let i = 0; i < P.length; i++) {
    const until = i + 1 < P.length ? P[i + 1].start : P[i].end;
    if (i === 0 || until - P[i].start >= 0.75) cur = i;
    out.push(cur);
  }
  return out;
})();

/** the family whose house we are standing outside */
const famFor = (idx: number) => {
  let cur = FAMILIES[0];
  for (const fam of FAMILIES) if (FIRST[fam.rime] !== undefined && FIRST[fam.rime] <= idx) cur = fam;
  return cur;
};

const Pic: React.FC<{ word: string; size: number }> = ({ word, size }) => {
  const frame = useCurrentFrame();
  const src = picFor(word);
  if (!src) return null;
  return (
    <div style={{ width: size, height: size, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center",
      transform: `translateY(${Math.sin(frame / 30) * 7}px) rotate(${Math.sin(frame / 44) * 3}deg)` }}>
      {src.startsWith("img/")
        ? <img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : <div style={{ fontSize: size * 0.84, lineHeight: 1 }}>{src}</div>}
    </div>
  );
};

/**
 * KIND — what a line is ABOUT, read from the line itself.
 *
 * The first cut chose a visual by `idx % 4`, so "You learned six spelling rules" got the
 * vowel row because 14 mod 4 is 2, and that row alone fired ~30 times. A visual has to be
 * chosen by CONTENT or it is decoration.
 */
type Kind = "WORD" | "SAME" | "RIME" | "RECAP_L5" | "LEVEL6" | "TRICK" | "FAMILY_IDEA" | "VOWEL"
          | "QUIZ" | "COUNT" | "PRAISE" | "OUTRO" | "TALK";

const KIND: Kind[] = P.map((p, i) => {
  const c = clean(p.text), t = p.text.toLowerCase();
  if (CELL[i]) return "WORD";
  if (FAMILIES.some((f) => f.rime === c)) return "RIME";
  if (t.includes("spelling rule") || t.includes("level five")) return "RECAP_L5";
  if (t.includes("level six")) return "LEVEL6";
  if (t.includes("trick")) return "TRICK";
  if (t.includes("stayed the same") || t.includes("only the front")
      || t.includes("last two letters") || t.includes("change just one")
      || t.includes("brand new word")) return "SAME";
  if (t.includes("family") || t.includes("families")) return "FAMILY_IDEA";
  if (t.includes("vowel") || t.includes("short a") || t.includes("short e")
      || t.includes("short i") || t.includes("short o") || t.includes("short u")) return "VOWEL";
  if (t.includes("which letter") || t.includes("your turn") || t.includes("picture")) return "QUIZ";
  if (t.includes("eighty") || t.includes("thirteen") || t.includes("eight words")
      || t.includes("sixteen") || t.includes("five words") || t.includes("twelve more")
      || t.includes("eighteen more")) return "COUNT";
  if (t.includes("proud") || t.includes("well done") || t.includes("beautifully")
      || t.includes("really well") || t.includes("excellent") || t.includes("that is right")) return "PRAISE";
  if (t.includes("subscribe") || t.includes("app") || t.includes("store")
      || t.includes("next time") || t.includes("miss it")) return "OUTRO";
  return "TALK";
});

/** the six rules of Level 5, for the one line that recaps them */
const L5_RULES = ["ff", "ck", "ng", "nk", "x", "w"];

const Scene: React.FC<{ idx: number; b: B }> = ({ idx, b }) => {
  const frameNow = useCurrentFrame();
  const a = at(idx);
  const u = (n: number) => Math.round(n * (b.wide ? 1 : 0.84));
  const cell = CELL[idx];
  const fam = famFor(idx);
  const kind = KIND[idx];

  // ── a WORD beat. Three presentations, rotated BY FAMILY so each house feels different:
  //    build   the letter tile lands in front of the bolted ending (families 1,4,7…)
  //    hub     the ending big in the middle, every front letter on a spoke (2,5,8…)
  //    train   the ending is the engine and the word couples on (3,6,9…)
  if (cell) {
    const famIdx = FAMILIES.findIndex((fm) => fm.rime === cell.rime);
    const style = famIdx % 3;
    if (style === 1) {
      return <Hub b={b} rime={cell.rime} words={FAMILIES[famIdx].words} onWord={cell.word} at={a} />;
    }
    if (style === 2) {
      return (
        <>
          <Pic word={cell.word} size={u(180)} />
          <Train b={b} rime={cell.rime} word={cell.word} k={cell.k} at={a} />
        </>
      );
    }
    const front = cell.word.slice(0, cell.word.length - cell.rime.length);
    return (
      <>
        <Pic word={cell.word} size={u(215)} />
        <Row gap={u(14)}>
          {front.split("").map((c, i) => (
            <Tile key={i} ch={c} size={u(148)} at={a + i * 2} seed={i} hot />
          ))}
          <Tile ch={cell.rime} size={u(148)} tone="ending" w={u(148) * (cell.rime.length > 2 ? 1.5 : 1.2)} />
        </Row>
      </>
    );
  }

  switch (kind) {
    // the ending arriving: it is the thing that will not move all section
    case "RIME":
      return (
        <Row gap={u(20)}>
          <Tile ch="?" size={u(160)} tone="dim" at={a} />
          <Tile ch={fam.rime} size={u(190)} tone="ending" at={a}
                w={u(190) * (fam.rime.length > 2 ? 1.5 : 1.2)} />
        </Row>
      );

    // six ticked cards — the level just finished
    case "RECAP_L5":
      return (
        <Row gap={u(14)}>
          {L5_RULES.map((r, i) => (
            <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(8) }}>
              <Tile ch={r} size={u(110)} at={a + i * 3} seed={i} />
              <div style={{ fontSize: u(52), lineHeight: 1 }}>{"\u2705"}</div>
            </div>
          ))}
        </Row>
      );

    case "LEVEL6":
      return <Row gap={u(18)}>{["L", "6"].map((c, i) => <Tile key={c} ch={c} size={u(200)} tone={i ? "ending" : "front"} at={a + i * 5} />)}</Row>;

    // the whole video in one beat: one letter changes, the rest holds
    case "TRICK":
    case "SAME": {
      // the ending is BIG and lit; only the front letter flips. This is the whole video.
      const swap = Math.floor(Math.max(0, frameNow - a) / 24) % 2;
      return (
        <Row gap={u(16)}>
          <Tile ch={swap ? "b" : "c"} size={u(180)} at={a} hot seed={swap ? 1 : 2} />
          <Tile ch="at" size={u(240)} tone="ending" w={u(240) * 1.25} />
        </Row>
      );
    }

    // the family: members at the windows
    case "FAMILY_IDEA":
      return (
        <Row gap={u(16)}>
          {fam.words.slice(0, 5).map((w, i) => <Pic key={w} word={w} size={u(140)} />)}
        </Row>
      );

    // the vowel lives on the fence; here we simply show the ending it sits inside
    case "VOWEL":
      return (
        <Row gap={u(16)}>
          <Tile ch={fam.rime[0]} size={u(190)} tone="ending" at={a} hot />
          <Tile ch={fam.rime.slice(1)} size={u(150)} at={a + 4} />
        </Row>
      );

    case "QUIZ":
      return (
        <Row gap={u(20)}>
          <Tile ch="?" size={u(170)} tone="dim" at={a} hot />
          <Tile ch={fam.rime} size={u(170)} tone="ending" w={u(170) * 1.2} />
        </Row>
      );

    case "COUNT": {
      const n = fam.words.length;
      return (
        <Row gap={u(10)}>
          {Array.from({ length: n }).map((_, i) => (
            <Tile key={i} ch={fam.words[i][0]} size={u(96)} at={a + i * 3} seed={i} />
          ))}
        </Row>
      );
    }

    case "PRAISE":
      return <Row gap={u(24)}>{[0, 1, 2].map((i) => <Pic key={i} word="fun" size={u(150)} />)}</Row>;

    case "OUTRO":
      return <Row gap={u(20)}><Pic word="ball" size={u(170)} /><Tile ch="6" size={u(150)} tone="ending" at={a} /></Row>;

    // connective lines: the family's own words, held, so the frame is never bare and never
    // repeats the sentence
    // connective lines hold the family's ENDING, lit, with the door it belongs to — never
    // a gallery of pictures unrelated to what is being said
    default:
      return (
        <Row gap={u(18)}>
          <Tile ch={fam.rime} size={u(210)} tone="ending" at={a}
                w={u(210) * (fam.rime.length > 2 ? 1.5 : 1.2)} />
        </Row>
      );
  }
};

export const L6FamiliesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  const idx = BEAT_OF[phraseAt(frame)];
  const storeFrom = at(STORE_FROM_IDX);
  const fam = famFor(idx);
  const intro = inIntro(idx);
  const cell = CELL[idx];
  const shown = fam.words.filter((w, k) => {
    const i = Object.entries(CELL).find(([, c]) => c.rime === fam.rime && c.word === w)?.[0];
    return i !== undefined && Number(i) <= idx;
  }).length;
  const letter = cell ? cell.word.slice(0, cell.word.length - cell.rime.length) || cell.word[0] : fam.rime[0];

  return (
    <AbsoluteFill>
      <Lane b={b} rime={fam.rime} dusk={idx >= P.length - 14} noHouse={intro} />

      <Sequence from={0} durationInFrames={f(AUDIO_SEC) + 8}>
        <Audio src={staticFile("audio/l6_families/l6.mp3")} />
      </Sequence>
      <Audio src={staticFile("music_bed.mp3")} loop
        volume={(fr) => interpolate(fr, [0, MUSIC_FADE_IN, L6_DURATION - MUSIC_FADE_OUT, L6_DURATION],
          [0, MUSIC_BED, MUSIC_BED, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {frame < storeFrom && (
        <>
          <Banner b={b} text={intro ? "LEVEL 6 · WORD FAMILIES" : `THE  ${fam.rime}  FAMILY`} />
          {!intro && <WashingLine b={b} words={fam.words} shown={shown} rime={fam.rime} />}
          {!intro && <VowelStrip b={b} lit={fam.rime[0]} />}
          <Content b={intro ? { ...b, contentR: b.contentRFull } : b}><Scene idx={idx} b={b} /></Content>
          <Fixed b={b}>
            <Mo b={b} />
            <Zip b={b} letter={letter} at={cell ? at(idx) : 0} />
          </Fixed>
          <Captions track={TRACK} maxWidth={b.wide ? 1180 : 900} />
          <Watermark corner="tr" widthFrac={b.wide ? 0.085 : 0.11} pad={b.wide ? 54 : 46} />
        </>
      )}

      <Sequence from={storeFrom}>
        <AbsoluteFill style={{ background: "rgba(20, 34, 26, 0.55)" }} />
        <StoreOutro silent total={L6_DURATION - storeFrom} ctaBg={LANE.door} titleColor="#FFFFFF" />
      </Sequence>
    </AbsoluteFill>
  );
};
