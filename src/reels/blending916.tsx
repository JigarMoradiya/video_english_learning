import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AUDIO_SEC, BLENDING916_DURATION, BUILD_CV, BUILD_VC, BuildT, CV_TRIPLES, NARR, P, PE, PIC,
  SEC, Triple, VC_TRIPLES, WRAP_FROM, secFrom,
} from "../data/blending916";
import { bands, Block, Click, CONSONANT, RocketWorld, VOWEL, WordCapsule } from "../components/RocketTower";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { StoreOutro } from "../components/StoreOutro";
import { Watermark } from "../components/Watermark";
import { font, palette } from "../data/tokens";
import { bob, pulse, wiggle } from "../lib/motion";

// ── L3 · 2-Sound Blending — 9:16 ─────────────────────────────────────────────
// Own narration (cv_vc_short.mp3, 2:34) and own world (The Rocket Tower). Same section
// architecture as the 16:9: ONE component per section so lines animate by interpolation
// instead of remounting, every cue a phrase timestamp, the stage confined to the content
// zone so nothing can sit under the gantry.

const B = bands();
const tw = (f: number, at: number, len = 8) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Stage: React.FC<{ children: React.ReactNode; gap?: number; column?: boolean }> = ({ children, gap = 40, column = false }) => (
  <div
    style={{
      position: "absolute", left: B.contentL, width: B.contentR - B.contentL,
      top: B.stageTop, height: B.stageBot - B.stageTop,
      display: "flex", alignItems: "center", justifyContent: "center", gap,
      flexDirection: column ? "column" : "row", fontFamily: font.family,
    }}
  >
    {children}
  </div>
);

const Banner: React.FC<{ text: string; color?: string }> = ({ text, color = palette.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 13 } });
  return (
    <div style={{ position: "absolute", left: B.contentL, width: B.contentR - B.contentL, top: B.bannerTop, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: color, color: "#fff", borderRadius: 999, padding: "12px 42px",
          fontSize: 44, fontWeight: 800, fontFamily: font.family, whiteSpace: "nowrap",
          transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2.6)}px)`, boxShadow: `0 12px 30px ${color}66`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ── opener: hook + intro + idea, one continuous scene (phrases 0…11) ─────────
const Opener: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (i: number) => P(i) - from;
  const slow = interpolate(f, [c(8), c(9) - 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fast = f >= c(9) && f < c(10) ? ((f - c(9)) / Math.max(1, (c(10) - c(9)) / 2)) % 1 : 0;
  // ZONE ARITHMETIC: content zone 848px, two 264 blocks = 528, so the gap can never
  // exceed 320 — and the VOWEL/CONSONANT pills widen each column further, so 250 is the
  // safe ceiling. At 330 the blocks pushed onto the gantry.
  const gap =
    f < c(2) - 10 ? 250
    : f < c(2) ? interpolate(f, [c(2) - 10, c(2)], [250, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : f < c(5) ? 16
    : f < c(6) ? interpolate(f, [c(5), c(5) + 12], [16, 240], { extrapolateRight: "clamp" })
    : f < c(7) ? interpolate(f, [c(6), c(6) + 14], [240, 260], { extrapolateRight: "clamp" })
    : f < c(8) ? interpolate(f, [c(7), c(8) - 4], [260, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : f < c(9) ? interpolate(slow, [0, 0.55, 1], [250, 250, 16])
    : f < c(10) ? interpolate(fast, [0, 0.5, 1], [240, 16, 240])
    : 250;

  const inB = spring({ frame: f - c(1), fps, config: { damping: 13 } });
  const merged = f >= c(2) && f < c(5);
  // see blending.tsx: the cards hold FULL opacity and shrink into the centre, they do not
  // crossfade (which is invisible over a pale sky)
  const mergeP = interpolate(f, [c(2), c(2) + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const grid = f >= c(4) && f < c(5);
  const emph = f < c(10) ? 0 : interpolate(f, [c(11) - 2, c(11) + 10], [1, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aS = emph === 0 ? 1 : interpolate(emph, [1, 2], [1.1, 0.85]);
  const bS = emph === 0 ? 1 : interpolate(emph, [1, 2], [0.85, 1.1]);
  const label = (on: number, text: string, color: string) => (
    <div style={{ background: color, color: "#fff", borderRadius: 999, padding: "8px 22px", fontSize: 30, fontWeight: 800, letterSpacing: 1, opacity: 0.35 + 0.65 * on, transform: `scale(${0.85 + 0.15 * on})`, boxShadow: `0 8px 20px ${color}55` }}>{text}</div>
  );

  return (
    <>
      <Stage gap={0}>
        <div style={{ display: "flex", alignItems: "center", gap, opacity: grid ? 0 : 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, transform: `translateY(${bob(f, fps, 4, 3.2, 0)}px) scale(${aS})` }}>
            <Block text="a" vowel size={264} lit={(f >= c(0) && f < c(1)) || (f >= c(10) && f < c(11))} popAt={c(0)} />
            {f >= c(10) && label(f < c(11) ? 1 : 0, "VOWEL", VOWEL)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, transform: `translateY(${bob(f, fps, 4, 3.2, 3)}px) scale(${bS * inB})` }}>
            <Block text="t" vowel={false} size={264} lit={(f >= c(1) && f < c(2)) || f >= c(11)} popAt={c(1)} />
            {f >= c(10) && label(f >= c(11) ? 1 : 0, "CONSONANT", CONSONANT)}
          </div>
        </div>
        {/* THE MERGE: the word card comes DOWN OVER the two letter cards and settles in
            their place — it must land on the same centre they occupy, which is why this is
            a centred overlay and not a fixed `top`. Appearing at a different y was a cut,
            not a merge. Once the grid arrives it steps up to make room (EXPLICIT tops:
            capsule 60…~300, grid 360…780 — they cannot meet). */}
        {merged && (
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center",
                        alignItems: grid ? "flex-start" : "center", paddingTop: grid ? 60 : 0 }}>
            <div style={{ transform: `translateY(${bob(f, fps, 4.4, 3.4) - (1 - mergeP) * 110}px) scale(${(grid ? 0.82 : 1) * interpolate(mergeP, [0.12, 1], [0.28, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, opacity: interpolate(mergeP, [0.12, 0.34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <WordCapsule word="at" size={310} lit={f < c(2) + 30} />
            </div>
          </div>
        )}
        {grid && (
          <div style={{ position: "absolute", top: 360, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {Array.from({ length: 16 }, (_, k) => (
              <div key={k} style={{ transform: `scale(${tw(f, c(4) + k * 2, 7)}) translateY(${bob(f, fps, 4, 2.4, k)}px)` }}>
                <Block text="" vowel={k % 2 === 0} size={126} ghost />
              </div>
            ))}
          </div>
        )}
      </Stage>
      <Click at={c(2)} />
    </>
  );
};

// ── a set of blend triples ───────────────────────────────────────────────────
const SetSec: React.FC<{ from: number; triples: Triple[]; banner: string; color: string; introUntil: number }> = ({ from, triples, banner, color, introUntil }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = (x: number) => x - from;
  const intro = f < rel(introUntil) - 6;
  let k = 0;
  for (let i = 0; i < triples.length; i++) if (f >= rel(triples[i].p1) - 6) k = i;
  const tr = triples[k];
  const t = { ...tr, p1: rel(tr.p1), p2: rel(tr.p2), p3: rel(tr.p3) };
  const said = !intro && f >= t.p3;
  const gap = intro ? 260 : interpolate(f, [t.p3 - 8, t.p3], [260, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Banner text={banner} color={color} />
      <Stage gap={0}>
        <div style={{ display: "flex", alignItems: "center", gap, opacity: said ? interpolate(f, [t.p3 + 2, t.p3 + 9], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1 }}>
          <Block text={t.a} vowel={t.vowelFirst} size={264} lit={!intro && f >= t.p1 && f < t.p2} popAt={intro ? undefined : t.p1} />
          <Block text={intro ? "?" : t.b} vowel={!t.vowelFirst} size={264} lit={!intro && f >= t.p2 && f < t.p3} ghost={intro} popAt={intro ? undefined : t.p2} />
        </div>
        {said && (
          <div style={{ position: "absolute", top: 320, transformOrigin: "top center", transform: `scale(${spring({ frame: f - t.p3, fps, config: { damping: 10 } })})` }}>
            <WordCapsule word={t.word} size={296} lit={f < t.p3 + 24} />
          </div>
        )}
      </Stage>
      {!intro && <Click at={t.p3} y={40} />}
    </>
  );
};

const RecapSec: React.FC<{ from: number; triples: Triple[]; banner: string; color: string; sweepFrom: number; sweepTo: number }> = ({ from, triples, banner, color, sweepFrom, sweepTo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lit = Math.floor(interpolate(f, [sweepFrom - from, sweepTo - from], [0, 7.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <>
      <Banner text={banner} color={color} />
      <Stage>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, justifyItems: "center" }}>
          {triples.map((t, i) => (
            <div key={t.word} style={{ transform: `scale(${tw(f, i * 3, 8) * (i === lit ? 1.1 : 1)}) translateY(${bob(f, fps, 5, 2.4, i)}px)`, opacity: i <= lit ? 1 : 0.55 }}>
              <WordCapsule word={t.word} size={188} lit={i === lit} />
            </div>
          ))}
        </div>
      </Stage>
    </>
  );
};

// ── Listen builds: chunk + one sound = a real word ───────────────────────────
const BuildSec: React.FC<{ from: number; builds: BuildT[]; banner: string; introUntil: number; gatherUntil?: number }> = ({ from, builds, banner, introUntil, gatherUntil }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = (x: number) => x - from;
  const intro = f < rel(introUntil) - 6;
  let k = 0;
  for (let i = 0; i < builds.length; i++) if (f >= rel(builds[i].p1) - 6) k = i;
  const bb = builds[k];
  const b = { ...bb, p1: rel(bb.p1), p2: rel(bb.p2), p2e: rel(bb.p2e), p3: rel(bb.p3), cut: rel(bb.cut) };
  const said = !intro && f >= b.p3;
  const sweep = !intro && f >= b.p2 && f < b.p3;
  const cut = b.cut;
  // A CV build's added letter is a stop consonant -- "g" in buh-aaa-g is a 0.07s release,
  // so ending its lit window at the sound-out gave a 2-frame blink. It lights on the sound
  // and HOLDS through the word reveal, which is both correct and visible.
  const addLit = b.front ? (sweep && f < cut) : (!intro && f >= cut && f < b.p3 + 22);
  const chunkLit = sweep && (b.front ? f >= cut : f < cut);
  const win = (a: number, z: number): [number, number, number, number] => {
    const span = Math.max(4, z - a);
    const r = Math.max(1, Math.min(5, Math.floor((span - 1) / 3)));
    return [a, a + r, a + span - r, a + span];
  };
  const addScale = interpolate(f, b.front ? win(b.p2 - 2, cut) : win(cut, b.p2e + 6), [1, 1.16, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chunkScale = interpolate(f, b.front ? win(cut, b.p2e + 6) : win(b.p2 - 2, cut), [1, 1.16, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (intro && gatherUntil !== undefined && f < rel(gatherUntil) - 6) {
    return (
      <Stage>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[...VC_TRIPLES, ...CV_TRIPLES].map((t, i) => (
            <div key={t.word} style={{ transform: `scale(${tw(f, i * 2, 7)}) translateY(${bob(f, fps, 4, 2.2, i)}px)` }}>
              <WordCapsule word={t.word} size={150} />
            </div>
          ))}
        </div>
      </Stage>
    );
  }

  return (
    <>
      <Banner text={banner} color={b.front ? VOWEL : CONSONANT} />
      {/* stacked: the 848px zone cannot hold blocks + arrow + word on one line */}
      <div style={{ position: "absolute", inset: 0, transform: "translateY(-190px)" }}>
      <Stage gap={16} column>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexDirection: b.front ? "row" : "row-reverse" }}>
          <div style={{ transform: `scale(${intro ? 1 : addScale})` }}>
            <Block text={intro ? "?" : b.add} vowel={false} size={232} ghost={intro} lit={addLit} popAt={intro ? undefined : (b.front ? b.p2 : cut)} />
          </div>
          <div style={{ transform: `scale(${intro ? 1 : chunkScale})` }}>
            <Block text={b.chunk} vowel size={232} lit={chunkLit} popAt={intro ? undefined : (b.front ? cut : b.p2)} />
          </div>
        </div>
        <div style={{ fontSize: 66, fontWeight: 800, color: palette.inkSoft }}>↓</div>
        {said ? (
          <div style={{ transform: `scale(${spring({ frame: f - b.p3, fps, config: { damping: 10 } })})` }}>
            <WordCapsule word={b.word} pic={PIC[b.word]} size={252} lit={f < b.p3 + 24} />
          </div>
        ) : (
          <Block text="?" vowel={false} size={232} ghost />
        )}
      </Stage>
      </div>
      {/* the chunk row: "At…" lights ITS chip here before the sound-out
          lights the blocks above. A 3-column grid splits 6 evenly whatever the words are —
          a pinned pixel width cannot, because plank widths differ. */}
      <div style={{ position: "absolute", left: B.contentL, width: B.contentR - B.contentL, top: B.stageBot - 330,
                    display: "flex", justifyContent: "center", alignItems: "center",
                    gap: builds.length >= 4 ? 16 : 10, fontFamily: font.family }}>
        {builds.map((x, i2) => {
          const active = !intro && i2 === k && f >= rel(x.p1);
          return (
            <div key={x.chunk} style={{ transform: `scale(${intro ? 1 : active ? 1.22 : 0.92}) translateY(${bob(f, fps, 4, 2.4, i2)}px)`, opacity: intro || active ? 1 : 0.5 }}>
              <WordCapsule word={x.chunk} size={builds.length >= 4 ? 112 : 140} lit={active} />
            </div>
          );
        })}
      </div>
      {!intro && <Click at={b.p3} y={140} />}
    </>
  );
};

const PayoffSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (i: number) => P(i) - from;
  // THIS SECTION IS 108…112. Every cue must be one of its OWN lines:
  //   108 "You didn't learn sixteen little words."  109 "You learned sixteen word machines."
  //   110 "Blended along with me?"  111 "Tap the thumbs up."  112 "I want to know you did it!"
  // `thumbs` was keyed to 122 — "Which word is this?", a quiz line four seconds past the end
  // of this section — so the 👍 never appeared and three lines ran on the same still grid.
  const thumbs = f >= c(96);
  const lit = f >= c(94);
  // 110 sweeps a highlight across the sixteen so the question has its own beat
  const sweep = interpolate(f, [c(95), c(96) - 4], [0, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stage>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, transform: `scale(${thumbs ? 0.88 : lit ? pulse(f - c(94), fps, 0.04, 1) : 1}) translateY(${thumbs ? -26 : 0}px)` }}>
        {[...VC_TRIPLES, ...CV_TRIPLES].map((t, i) => {
          const on = sweep > i && sweep < i + 3.2;
          return (
            <div key={t.word} style={{ transform: `scale(${tw(f, i, 6) * (on ? 1.14 : 1)}) translateY(${bob(f, fps, 4, 2.4, i)}px)` }}>
              <WordCapsule word={t.word} size={150} lit={lit} />
            </div>
          );
        })}
      </div>
      {thumbs && (
        <div style={{ position: "absolute", top: 40, fontSize: 132,
                      transform: `scale(${spring({ frame: f - c(96), fps, config: { damping: 9 } }) * (f >= c(97) ? pulse(f - c(97), fps, 0.10, 1.6) : 1)}) rotate(${wiggle(f, fps, 6, 3)}deg)` }}>👍</div>
      )}
    </Stage>
  );
};

const PracticeSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (i: number) => P(i) - from;
  // THE PHRASE SHEET, and nothing else:
  //   115 "Aaa..."  116 "nuh...?"  117 "An!"   |   118 "Duh..."  119 "oh...?"  120 "Do!"
  // The old mapping started round 2 on 117 (which is round 1's ANSWER) and keyed round 1's
  // first sound to 126 -- "Cup!", nine seconds away in the quiz -- so it never fired.
  const second = f >= c(103) - 6;
  const A = second ? "d" : "a", Bl = second ? "o" : "n", word = second ? "do" : "an";
  const s1 = second ? c(103) : c(100), s2 = second ? c(104) : c(101), hit = second ? c(105) : c(102);
  const vowelFirst = !second;
  const said = f >= hit;
  return (
    <>
      <Banner text="YOUR TURN" />
      <Stage gap={0}>
        <div style={{ display: "flex", alignItems: "center", gap: interpolate(f, [hit - 8, hit], [260, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), opacity: said ? interpolate(f, [hit + 2, hit + 9], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1 }}>
          <Block text={f >= s1 ? A : "?"} vowel={vowelFirst} size={264} ghost={f < s1} lit={f >= s1 && f < hit} popAt={s1} />
          <Block text={f >= s2 ? Bl : "?"} vowel={!vowelFirst} size={264} ghost={f < s2} lit={f >= s2 && f < hit} popAt={s2} />
        </div>
        {said && (
          <div style={{ position: "absolute", top: 320, transformOrigin: "top center", transform: `scale(${spring({ frame: f - hit, fps, config: { damping: 10 } })})` }}>
            <WordCapsule word={word} size={296} lit />
          </div>
        )}
        <Click at={hit} y={40} />
      </Stage>
    </>
  );
};

const QuizSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (i: number) => P(i) - from;
  const reveal = f >= c(111);
  return (
    <>
      <Banner text="LAST ONE!" color="#7B1FA2" />
      <Stage gap={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
          <div style={{ display: "flex", gap: 18 }}>
            {(["c", "u", "p"] as const).map((ch, i) => {
              const at = c(108 + i);   // 111,112,113 = 'Kuh...', 'uh...', 'puh...'
              return (
                <div key={ch} style={{ transform: `scale(${tw(f, c(106) + i * 4, 7)})` }}>
                  <Block text={ch} vowel={ch === "u"} size={186} lit={f >= at && f < at + 22} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["cap", "cup", "cop"].map((w, i) => (
              <div key={w} style={{ transform: `scale(${tw(f, c(107) + i * 4, 7) * (reveal && w === "cup" ? pulse(f - c(111), fps, 0.07, 1) : 1)})` }}>
                <WordCapsule word={w} pic={reveal && w === "cup" ? PIC.cup : undefined} size={168} lit={reveal && w === "cup"} dim={reveal && w !== "cup"} />
              </div>
            ))}
          </div>
        </div>
        {reveal && <Click at={c(111)} />}
      </Stage>
    </>
  );
};


// ── assembly ─────────────────────────────────────────────────────────────────
const CAPTION_TRACK = makeTrack(NARR as unknown as TPhrase[], AUDIO_SEC);
const l3Keyword = (raw: string): string | null => {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (["vowel", "vowels", "red"].includes(w)) return VOWEL;
  if (["consonant", "consonants", "blue"].includes(w)) return CONSONANT;
  if (["blend", "blending", "blended", "blends"].includes(w)) return "#F57C00";
  if (["sixteen", "front", "back"].includes(w)) return "#7B1FA2";
  return null;
};

const Sec: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={from} durationInFrames={Math.max(1, to - from)}>{children}</Sequence>
);

export const Blending916Reel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <RocketWorld />

    <Audio src={staticFile("audio/cv_vc/cv_vc_short.mp3")} />
    <Audio
      src={staticFile("music_bed.mp3")}
      loop
      volume={(f) => interpolate(f, [0, 20, BLENDING916_DURATION - 40, BLENDING916_DURATION], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />

    <Sec from={0} to={secFrom("vcIntro")}><Opener from={0} /></Sec>
    <Sec from={secFrom("vcIntro")} to={secFrom("vcRecap")}>
      <SetSec from={secFrom("vcIntro")} triples={VC_TRIPLES} banner="VOWEL FIRST" color={VOWEL} introUntil={P(SEC.vcSet[0])} />
    </Sec>
    <Sec from={secFrom("vcRecap")} to={secFrom("cvIntro")}>
      <RecapSec from={secFrom("vcRecap")} triples={VC_TRIPLES} banner="VOWEL FIRST" color={VOWEL} sweepFrom={P(38)} sweepTo={PE(38)} />
    </Sec>
    <Sec from={secFrom("cvIntro")} to={secFrom("cvRecap")}>
      <SetSec from={secFrom("cvIntro")} triples={CV_TRIPLES} banner="CONSONANT FIRST" color={CONSONANT} introUntil={P(SEC.cvSet[0])} />
    </Sec>
    <Sec from={secFrom("cvRecap")} to={secFrom("secret")}>
      <RecapSec from={secFrom("cvRecap")} triples={CV_TRIPLES} banner="CONSONANT FIRST" color={CONSONANT} sweepFrom={P(66)} sweepTo={PE(66)} />
    </Sec>
    <Sec from={secFrom("secret")} to={secFrom("flip")}>
      <BuildSec from={secFrom("secret")} builds={BUILD_VC} banner="ADD IN FRONT" introUntil={P(SEC.buildVC[0])} gatherUntil={P(69)} />
    </Sec>
    <Sec from={secFrom("flip")} to={secFrom("payoff")}>
      <BuildSec from={secFrom("flip")} builds={BUILD_CV} banner="ADD AT THE BACK" introUntil={P(SEC.buildCV[0])} />
    </Sec>
    <Sec from={secFrom("payoff")} to={secFrom("practice")}><PayoffSec from={secFrom("payoff")} /></Sec>
    <Sec from={secFrom("practice")} to={secFrom("quiz")}><PracticeSec from={secFrom("practice")} /></Sec>
    <Sec from={secFrom("quiz")} to={secFrom("wrap")}><QuizSec from={secFrom("quiz")} /></Sec>

    <Sequence from={WRAP_FROM} durationInFrames={BLENDING916_DURATION - WRAP_FROM}>
      <StoreOutro silent compact total={BLENDING916_DURATION - WRAP_FROM} />
    </Sequence>

    {/* captions end at the download section, and the world dims there */}
    <Sequence from={0} durationInFrames={WRAP_FROM}>
      <Captions track={CAPTION_TRACK} keywordColor={l3Keyword} maxWidth={940} fontSize={38} bottom={410} />
    </Sequence>
    <Sequence from={0} durationInFrames={WRAP_FROM}>
      <Watermark corner="tr" widthFrac={0.12} opacity={0.5} />
    </Sequence>
  </AbsoluteFill>
);

export const BLENDING916_TOTAL = BLENDING916_DURATION;
