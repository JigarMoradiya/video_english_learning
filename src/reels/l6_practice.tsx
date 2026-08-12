import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/l6_practice.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { Watermark } from "../components/Watermark";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { MUSIC_BED, MUSIC_FADE_IN, MUSIC_FADE_OUT } from "../data/mix";
import { Confetti } from "../components/Confetti";
import { picFor } from "../data/word_pics";
import { AppPractice } from "../components/AppPractice";
import {
  B, Banner, Board, Booth, Content, FAIR, FairWorld, Fixed, Line, Mo, PraiseStars, Row, Tickets, Zip, bands, pop,
} from "../components/QuizFair";

// ── L6 · PART 2 · PRACTICE — the Quiz Fair ──────────────────────────────────
//
// 138 lines, 6:02, fourteen questions — the app's own game (Find the First Letter) played
// at a fairground booth. HAND-AUTHORED scene table, per the L6 law: every line's visual
// chosen by reading it; no classifier, no auto-binding.
//
// The question engine: each question is ONE row in Q below — its lines, its paddles (the
// app's letters, order varied so the answer is not always first), and the visual walks
// pic → paddles → held pause → the paddle lights, the slot fills, a ticket prints.

const FPS = 30;
const P = phrasesJson as unknown as TPhrase[];
const AUDIO_SEC = 361.80;
const f = (s: number) => Math.round(s * FPS);
const TRACK = makeTrack(P, P[P.length - 1].end, FPS, 1.0);
const at = (i: number) => f(P[i].start);

type Q = {
  word: string; rime: string; opts: [string, string, string]; ans: number;   // index into opts
  picAt: number;      // the picture appears (the word is NAMED here)
  optAt: number;      // the paddles pop (the question line)
  hitAt: number;      // the letter is answered (the "C!" line)
  wordAt: number;     // the whole word lands (the "Cat." line)
};
const QS: Q[] = [
  { word: "cat", rime: "at", opts: ["b", "c", "h"], ans: 1, picAt: 18, optAt: 23, hitAt: 24, wordAt: 27 },
  { word: "bat", rime: "at", opts: ["b", "c", "r"], ans: 0, picAt: 30, optAt: 34, hitAt: 35, wordAt: 38 },
  { word: "hat", rime: "at", opts: ["c", "m", "h"], ans: 2, picAt: 40, optAt: 41, hitAt: 42, wordAt: 43 },
  { word: "rat", rime: "at", opts: ["c", "r", "f"], ans: 1, picAt: 46, optAt: 47, hitAt: 48, wordAt: 49 },
  { word: "fan", rime: "an", opts: ["m", "v", "f"], ans: 2, picAt: 56, optAt: 59, hitAt: 60, wordAt: 61 },
  { word: "van", rime: "an", opts: ["v", "f", "m"], ans: 0, picAt: 63, optAt: 64, hitAt: 65, wordAt: 66 },
  { word: "hen", rime: "en", opts: ["p", "h", "t"], ans: 1, picAt: 70, optAt: 71, hitAt: 72, wordAt: 73 },
  { word: "pen", rime: "en", opts: ["d", "p", "h"], ans: 1, picAt: 74, optAt: 75, hitAt: 83, wordAt: 86 },
  { word: "dog", rime: "og", opts: ["l", "f", "d"], ans: 2, picAt: 96, optAt: 97, hitAt: 98, wordAt: 99 },
  { word: "pig", rime: "ig", opts: ["p", "b", "d"], ans: 0, picAt: 100, optAt: 101, hitAt: 102, wordAt: 103 },
  { word: "pot", rime: "ot", opts: ["h", "p", "d"], ans: 1, picAt: 104, optAt: 105, hitAt: 106, wordAt: 107 },
  { word: "sun", rime: "un", opts: ["r", "f", "s"], ans: 2, picAt: 108, optAt: 109, hitAt: 110, wordAt: 111 },
  { word: "map", rime: "ap", opts: ["m", "c", "n"], ans: 0, picAt: 112, optAt: 113, hitAt: 114, wordAt: 115 },
  { word: "jug", rime: "ug", opts: ["b", "j", "r"], ans: 1, picAt: 117, optAt: 118, hitAt: 119, wordAt: 120 },
];
/** which question a line belongs to, and nothing else — spans are explicit */
const qFor = (idx: number): Q | null => {
  for (let k = QS.length - 1; k >= 0; k--) {
    const q = QS[k];
    const end = k + 1 < QS.length ? QS[k + 1].picAt : 122;
    if (idx >= q.picAt && idx < end) return q;
  }
  return null;
};

const APP_FROM_IDX = 132;                  // "Play Find the First Letter in the…app"
const STORE_FROM_IDX = 134;                // "…free on the Apple App Store and Google Play."
export const L6_PRACTICE_DURATION = Math.max(f(AUDIO_SEC) + 40, at(STORE_FROM_IDX) + STORE_OUTRO_F);

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

/** lines whose caption would SPELL the picture's word — suppressed (user rule) */
const CAPTION_OFF = new Set(QS.flatMap((q) => [q.picAt, q.wordAt]));

const bannerFor = (idx: number): string => {
  if (idx <= 14) return "LEVEL 6 · PRACTICE TIME";
  if (idx <= 53) return "ROUND 1 · WARM-UP";
  if (idx <= 91) return "ROUND 2 · FRIENDS";
  if (idx <= 121) return "ROUND 3 · THE QUICK ROUND";
  return "LEVEL 6 · PRACTICE TIME";
};

const PRAISE = [28, 39, 44, 50, 62, 68, 87, 121, 130];
const SFX: { at: number; file: string; vol: number }[] = [
  ...QS.map((q) => ({ at: at(q.optAt), file: "question", vol: 0.26 })),
  ...QS.map((q) => ({ at: at(q.hitAt), file: "correct", vol: 0.32 })),
  ...QS.map((q) => ({ at: at(q.wordAt), file: "pop", vol: 0.28 })),
  ...PRAISE.map((i) => ({ at: at(i), file: "sparkle", vol: 0.32 })),
  { at: at(77), file: "drop", vol: 0.30 },          // the wrong try, d
  { at: at(15), file: "chime_soft", vol: 0.26 }, { at: at(54), file: "chime_soft", vol: 0.26 },
  { at: at(92), file: "drumroll", vol: 0.24 },      // the quick round opens
  { at: at(122), file: "sparkle", vol: 0.36 },
];

/** two words compared: the shared ending lit the SAME in both, the fronts in DIFFERENT
 *  colours — for lines that say "only the front changed" instead of introducing a word */
const Compare: React.FC<{ a: string; b: string; pics?: boolean; u: (n: number) => number }> = ({ a: wa, b: wb, pics = true, u }) => {
  const rime = wa.slice(1);
  const fa = wa[0], fb = wb[0];
  const Word: React.FC<{ front: string; word: string; color: string }> = ({ front, word, color }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(10) }}>
      {pics && <Board_Pic word={word} size={u(96)} />}
      <div style={{ display: "flex", gap: u(6) }}>
        <div style={{
          width: u(84), height: u(84), borderRadius: u(14), background: color,
          border: `4px solid ${FAIR.ink}`, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "inherit", fontWeight: 800, fontSize: u(48), color: "#FFFFFF",
          boxShadow: `0 ${u(4)}px 0 ${FAIR.ink}`,
        }}>{front}</div>
        <div style={{
          minWidth: u(84), padding: `0 ${u(10)}px`, height: u(84), borderRadius: u(14), background: FAIR.gold,
          border: `4px solid ${FAIR.ink}`, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "inherit", fontWeight: 800, fontSize: u(44), color: FAIR.ink,
          boxShadow: `0 ${u(4)}px 0 ${FAIR.ink}`,
        }}>{rime}</div>
      </div>
    </div>
  );
  return (
    <Row gap={u(30)}>
      <Word front={fa} word={wa} color={FAIR.awningA} />
      <Line text="only this changed" size={u(30)} color="rgba(255,246,216,0.7)" />
      <Word front={fb} word={wb} color="#5FB4CF" />
    </Row>
  );
};

const Board_Pic: React.FC<{ word: string; size: number }> = ({ word, size }) => {
  const src = picFor(word);
  if (!src) return null;
  return (
    <div style={{ width: size, height: size, background: FAIR.cream, borderRadius: size * 0.16,
      border: `3px solid ${FAIR.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src.startsWith("img/")
        ? <img src={staticFile(src)} style={{ width: "78%", height: "78%", objectFit: "contain" }} />
        : <div style={{ fontSize: size * 0.6, lineHeight: 1 }}>{src}</div>}
    </div>
  );
};

const Icon: React.FC<{ glyph: string; size: number }> = ({ glyph, size }) => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: size, lineHeight: 1, transform: `translateY(${Math.sin(frame / 26) * 6}px) rotate(${Math.sin(frame / 38) * 4}deg)` }}>{glyph}</div>;
};

// ── THE SCENE TABLE ─────────────────────────────────────────────────────────
const Scene: React.FC<{ idx: number; b: B }> = ({ idx, b }) => {
  const a = at(idx);
  const u = (n: number) => Math.round(n * (b.wide ? 1 : 0.84));
  const q = qFor(idx);

  // ── inside a question: the board walks pic → paddles → answer → word ──
  // "Fan and van — only the front changed." — a live comparison, not the previous
  // question's board left standing (that is what showed before).
  if (idx === 67) return <Compare a="fan" b="van" u={u} />;

  if (q) {
    const answered = idx >= q.hitAt;
    const wrongTry = q.word === "pen" && idx >= 77 && idx < 83;   // the "good try" beat
    // staged, so every line inside a question changes something: slot on its own line,
    // paddles on the ask, the letter the moment it is answered, pulse during sound-outs
    const slotFrom = q.word === "cat" ? 19 : q.word === "bat" ? 31 : q.picAt;
    const optFrom = q.word === "cat" ? 22 : q.word === "bat" ? 33 : q.optAt;
    const optWords = (P[q.optAt] as any).words ?? [];
    const optTimes = q.opts.map((o, i) => {
      const hit = optWords.find((w: any) => w.word.toLowerCase().replace(/[^a-z]/g, "") === o);
      return hit ? f(hit.start) : at(q.optAt) + i * 12;
    });
    return (
      <Board b={b} at={at(q.picAt)}
        pic={q.word}
        rime={q.rime}
        showSlot={idx >= slotFrom}
        opts={idx >= optFrom ? q.opts : undefined}
        optAt={at(optFrom)}
        optTimes={idx >= optFrom ? optTimes : undefined}
        lit={answered ? q.ans : undefined}
        wrong={wrongTry ? 0 : undefined}
        filled={answered ? q.word.slice(0, q.word.length - q.rime.length)
              : wrongTry && idx >= 80 ? "d" : undefined}
        endingHot={answered && idx < q.wordAt}
        lookPic={q.word === "pen" && (idx === 81 || idx === 82)}
      />
    );
  }

  switch (idx) {
    case 0: return <Row gap={u(20)}><Icon glyph={"\u{1F44B}"} size={u(150)} /><Line text="LEVEL 6" size={u(96)} at={a} color={FAIR.gold} /></Row>;
    case 1: return (
      // fixed-width cards at one pitch, each word wearing its picture (review rule)
      <Row gap={u(26)}>
        {["cat", "sun", "dog", "ball"].map((w, i) => {
          const src = picFor(w);
          return (
            <div key={w} style={{ width: u(150), display: "flex", flexDirection: "column", alignItems: "center", gap: u(8) }}>
              <div style={{ width: u(110), height: u(110), display: "flex", alignItems: "center", justifyContent: "center" }}>
                {src && src.startsWith("img/")
                  ? <img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <div style={{ fontSize: u(96), lineHeight: 1 }}>{src}</div>}
              </div>
              <div style={{ width: u(150), padding: `${u(8)}px 0`, background: FAIR.cream, border: `4px solid ${FAIR.ink}`,
                borderRadius: u(14), boxSizing: "border-box", textAlign: "center",
                fontFamily: "inherit", fontWeight: 800, fontSize: u(44), color: FAIR.ink,
                boxShadow: `0 ${u(5)}px 0 ${FAIR.ink}` }}>{w}</div>
            </div>
          );
        })}
        <Line text="× 81" size={u(84)} at={a + 40} color={FAIR.gold} />
      </Row>
    );
    case 2: case 3: return <Row gap={u(18)}><Icon glyph={"\u{1F914}"} size={u(140)} /><Line text={"?"} size={u(140)} at={a} color={FAIR.gold} /></Row>;
    case 4: return <Row gap={u(14)}><Line text="?" size={u(110)} at={a} color={FAIR.cream} /><Line text="+" size={u(70)} at={a + 4} /><Line text="at" size={u(110)} at={a + 8} color={FAIR.gold} /></Row>;
    case 5: return <Row gap={u(20)}><Icon glyph={"\u{1F4F1}"} size={u(140)} /><Icon glyph={"\u{1F3AE}"} size={u(140)} /></Row>;
    case 6: case 7: return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(14) }}>
        <Icon glyph={"\u{1F50D}"} size={u(120)} />
        <Line text={"FIND THE\nFIRST LETTER"} size={u(84)} at={a} color={FAIR.gold} />
      </div>
    );
    case 8: return <Icon glyph={"\u{1F440}"} size={u(170)} />;
    case 9: return <Board b={b} at={a} pic="hen" rime="en" />;
    case 10: return <Board b={b} at={a} pic="hen" rime="en" opts={["p", "h", "t"]} optAt={a} />;
    case 11: return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(12) }}>
        <Icon glyph={"\u{2705}"} size={u(110)} />
        <Row gap={u(20)}><Line text="1" size={u(120)} at={a} color={FAIR.good} /><Line text="of 3" size={u(64)} at={a + 6} /></Row>
      </div>
    );
    case 12: return <Row gap={u(20)}><Icon glyph={"\u{1F5E3}"} size={u(150)} /><Icon glyph={"\u{1F4E2}"} size={u(130)} /></Row>;
    case 13: case 14: return <Line text="READY?" size={u(130)} at={a} color={FAIR.gold} />;
    case 15: case 16: return <Row gap={u(16)}><Icon glyph={"\u{1F3E0}"} size={u(130)} /><Line text="at" size={u(120)} at={a} color={FAIR.gold} /></Row>;
    case 17: return <Icon glyph={"\u{1F5BC}"} size={u(160)} />;
    // 18-49 are inside questions (qFor)
    case 50: return <Row gap={u(14)}>{[0, 1, 2, 3].map((i) => <Icon key={i} glyph={"⭐"} size={u(110)} />)}</Row>;
    case 51: return <Row gap={u(16)}><Line text="at" size={u(120)} at={a} color={FAIR.gold} /><Icon glyph={"\u{1F4AA}"} size={u(120)} /></Row>;
    case 52: return <Row gap={u(24)}><Icon glyph={"\u{1F44D}"} size={u(140)} /><Icon glyph={"\u{1F514}"} size={u(140)} /></Row>;
    case 53: return <Icon glyph={"\u{1F680}"} size={u(160)} />;
    case 54: case 55: return <Row gap={u(16)}><Icon glyph={"\u{1F3E0}"} size={u(120)} /><Icon glyph={"\u{1F3E0}"} size={u(120)} /></Row>;
    // 56-91 questions + pen beat (qFor covers 56-91 via spans)
    case 92: case 93: return <Row gap={u(14)}>{[0, 1, 2, 3, 4, 5].map((i) => <Line key={i} text="?" size={u(76)} at={a + i * 5} color={i % 2 ? FAIR.gold : FAIR.cream} />)}</Row>;
    case 94: case 95: return <Row gap={u(18)}><Icon glyph={"\u{26A1}"} size={u(140)} /><Line text="FAST!" size={u(100)} at={a} color={FAIR.gold} /></Row>;
    // 96-120 questions
    case 121: return <Row gap={u(14)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"\u{1F386}"} size={u(140)} />)}</Row>;
    case 122: return <Row gap={u(16)}><Icon glyph={"⭐"} size={u(130)} /><Line text="14 / 14" size={u(110)} at={a} color={FAIR.gold} /></Row>;
    case 123: return <Line text="14 / 14" size={u(150)} at={a} color={FAIR.good} />;
    case 124: return <Icon glyph={"\u{1F914}"} size={u(160)} />;
    case 125: return <Row gap={u(16)}><Line text="14" size={u(110)} at={a} color={FAIR.cream} /><Icon glyph={"\u{274C}"} size={u(90)} /></Row>;
    case 126: return (
      <Row gap={u(26)}>
        {["at", "an", "en", "og"].map((r, i) => (
          <div key={r} style={{ width: u(140), padding: `${u(14)}px 0`, background: FAIR.gold, border: `5px solid ${FAIR.ink}`,
            borderRadius: u(16), boxSizing: "border-box", textAlign: "center",
            fontFamily: "inherit", fontWeight: 800, fontSize: u(60), color: FAIR.ink,
            boxShadow: `0 ${u(6)}px 0 ${FAIR.ink}` }}>{r}</div>
        ))}
      </Row>
    );
    case 127: case 128: return <Row gap={u(14)}><Line text="?" size={u(100)} at={a} /><Line text="→" size={u(70)} at={a + 4} /><Line text="c" size={u(100)} at={a + 8} color={FAIR.good} /></Row>;
    case 129: return <Row gap={u(14)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"⭐"} size={u(110)} />)}</Row>;
    case 130: return <Row gap={u(18)}><Icon glyph={"\u{1F31F}"} size={u(150)} /><Icon glyph={"\u{1F4AA}"} size={u(130)} /></Row>;
    case 131: return <Row gap={u(16)}><Line text="LEVEL 6" size={u(96)} at={a} color={FAIR.gold} /><Icon glyph={"\u{2705}"} size={u(110)} /></Row>;
    // 132-133: the app segment (rendered outside Content)
    default: return <Line text="?" size={u(120)} at={a} color={FAIR.gold} />;
  }
};

export const L6PracticeReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  const idx = BEAT_OF[phraseAt(frame)];
  const storeFrom = at(STORE_FROM_IDX);
  const appFrom = at(APP_FROM_IDX);
  const inApp = frame >= appFrom && frame < storeFrom;
  const done = QS.filter((q) => idx >= q.wordAt).map((q) => q.word);
  const zipCheers = PRAISE.some((i) => idx === i);
  // portrait finale — "Look at your score" (122) through "I am so proud of you" (130):
  // all 14 word cards across the top, everything else pushed below them
  const recapPortrait = !b.wide && idx >= 122 && idx <= 130;
  // the ground counter bar sits at ~0.652–0.712H (FairWorld, drawn from the unmodified
  // `b`) — the lowered band must clear it, not just clear the grid above
  const bLow: B = recapPortrait ? { ...b, contentTop: b.height * 0.722, contentH: b.height * 0.111, charY: b.height * 0.841, charH: b.height * 0.115 } : b;

  return (
    <AbsoluteFill>
      <FairWorld b={b} fireworks={idx >= 121 && idx <= 123} />
      <Sequence from={0} durationInFrames={f(AUDIO_SEC) + 8}>
        <Audio src={staticFile("audio/l6_practice/l6_practice.mp3")} />
      </Sequence>
      {SFX.map((c, i) => (
        <Sequence key={i} from={c.at} durationInFrames={60}>
          <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("music_bed.mp3")} loop
        volume={(fr) => interpolate(fr, [0, MUSIC_FADE_IN, L6_PRACTICE_DURATION - MUSIC_FADE_OUT, L6_PRACTICE_DURATION],
          [0, MUSIC_BED, MUSIC_BED, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {frame < storeFrom && (
        <>
          <Banner b={b} text={bannerFor(idx)} />
          {!inApp && !recapPortrait && <Booth b={b} />}
          {!inApp && <Tickets b={b} words={done} final={recapPortrait} />}
          {!inApp && <Content b={bLow}><Scene idx={idx} b={b} /></Content>}
          {inApp && <AppPractice b={b} from={appFrom} />}
          <Fixed b={b}>
            {PRAISE.map((i) => <Confetti key={i} frame={frame} fps={FPS} burstFrame={at(i)} origin={{ x: b.width / 2, y: b.height * 0.30 }} colors={[FAIR.gold, FAIR.awningA, "#8FD3E8", FAIR.good]} count={24} seed={i} />)}
            {!inApp && PRAISE.includes(idx) && <PraiseStars b={bLow} />}
            {!inApp && <Mo b={bLow} />}
            {!inApp && <Zip b={bLow} cheer={zipCheers} />}
          </Fixed>
          {!CAPTION_OFF.has(idx) && <Captions track={TRACK} maxWidth={b.wide ? 1180 : 900} />}
          <Watermark corner="tl" widthFrac={b.wide ? 0.085 : 0.11} pad={b.wide ? 54 : 46} />
        </>
      )}

      <Sequence from={storeFrom}>
        <AbsoluteFill style={{ background: "rgba(18, 14, 34, 0.60)" }} />
        <StoreOutro silent total={L6_PRACTICE_DURATION - storeFrom} ctaBg={FAIR.gold} titleColor="#FFFFFF" />
      </Sequence>
    </AbsoluteFill>
  );
};
