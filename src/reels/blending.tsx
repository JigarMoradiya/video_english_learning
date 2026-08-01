import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AUDIO_SEC, BLENDING_DURATION, BUILD_CV, BUILD_VC, BuildT, CAPTION_PHRASES, CV_TRIPLES, P, PE, PIC,
  SEC, Triple, VC_TRIPLES, WRAP_FROM, secFrom,
} from "../data/blending";
import { bands, Block, Click, CONSONANT, VOWEL, WordPlank, WorkshopWorld } from "../components/ToyWorkshop";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { StoreOutro } from "../components/StoreOutro";
import { Watermark } from "../components/Watermark";
import { font, palette } from "../data/tokens";
import { bob, pulse, wiggle } from "../lib/motion";

// ── L3 · 2-Sound Blending — v2 reel ──────────────────────────────────────────
// ONE continuous narration (cv_vc_new.mp3), zero audio cuts. Each SECTION is a single
// component for its whole span, so lines inside it animate by interpolation instead of
// remounting — v1 re-ran an entrance spring on every line, which is why "Blue box is a
// consonant." jerked. Every cue is a phrase timestamp; nothing is hand-counted.

const tw = (f: number, at: number, len = 8) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// portrait helpers: the content zone is 728px wide at 4:5 (board left, shelf right), so
// rows that fit 1920 must be re-arranged, never scaled to unreadable
const useB = () => { const { width, height } = useVideoConfig(); return bands(width, height); };
export const useTall = () => { const { width, height } = useVideoConfig(); return height > width; };

const Stage: React.FC<{ children: React.ReactNode; gap?: number; column?: boolean }> = ({ children, gap = 46, column = false }) => {
  const B = useB();
  return (
    <div
      style={{
        // centred INSIDE the content zone (board on the left, shelf on the right), so no
        // stage element can ever sit under either — the overlay class of bug, prevented
        position: "absolute", left: B.contentL, width: B.contentR - B.contentL,
        top: B.stageTop, height: B.stageBot - B.stageTop,
        display: "flex", alignItems: "center", justifyContent: "center", gap,
        flexDirection: column ? "column" : "row", fontFamily: font.family,
      }}
    >
      {children}
    </div>
  );
};

const Banner: React.FC<{ text: string; color?: string; at?: number }> = ({ text, color = palette.ink, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13 } });
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 158, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: color, color: "#fff", borderRadius: 999, padding: "12px 46px",
          fontSize: 46, fontWeight: 800, fontFamily: font.family,
          transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2.6)}px)`, boxShadow: `0 12px 30px ${color}66`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ── opener: hook + intro + idea as ONE continuous scene (phrases 0…11) ───────
const Opener: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tall = useTall();
  const c = (i: number) => P(i) - from;

  // the two blocks' gap, driven through the whole opening — never remounted
  const slowCycle = interpolate(f, [c(8), c(9) - 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fastPhase = f >= c(9) && f < c(10) ? ((f - c(9)) / Math.max(1, (c(10) - c(9)) / 2)) % 1 : 0;
  // The gaps below are 16:9 values. At 1080 the content zone is 740px and two 210 blocks
  // take 420, so anything over ~320 pushes a block onto the shelf or the CV·VC board —
  // which is exactly what happened. `gk` scales them into the zone.
  const gk = tall ? 0.42 : 1;
  const gap = gk * (
    f < c(2) - 10 ? 600
    : f < c(2) ? interpolate(f, [c(2) - 10, c(2)], [600, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : f < c(5) ? 20
    : f < c(6) ? interpolate(f, [c(5), c(5) + 12], [20, 560], { extrapolateRight: "clamp" })
    : f < c(7) ? interpolate(f, [c(6), c(6) + 14], [560, 720], { extrapolateRight: "clamp" })
    : f < c(8) ? interpolate(f, [c(7), c(8) - 4], [720, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : f < c(9) ? interpolate(slowCycle, [0, 0.55, 1], [680, 680, 20])
    : f < c(10) ? interpolate(fastPhase, [0, 0.5, 1], [560, 20, 560])
    : tall ? 300 : 600);   // the labelled pair: the pills widen each column

  const inA = spring({ frame: f - c(0), fps, config: { damping: 13 } });
  const inB = spring({ frame: f - c(1), fps, config: { damping: 13 } });
  const merged = f >= c(2) && f < c(5);
  // THE MERGE, 18 frames of it. An opacity crossfade was useless: a coloured card fading
  // over a cream room desaturates inside two frames, so "the cards stay on screen" was true
  // in the DOM and invisible on screen. They now stay at FULL opacity and SHRINK into the
  // centre while the word plank grows out of the same point — you watch a and t be absorbed.
  const mergeP = interpolate(f, [c(2), c(2) + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gridIn = f >= c(4) && f < c(5);
  // vowel/consonant emphasis CROSSFADES at c(11) — the v1 jerk, fixed
  const emph = f < c(10) ? 0 : interpolate(f, [c(11) - 2, c(11) + 10], [1, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aScale = emph === 0 ? 1 : interpolate(emph, [1, 2], [1.12, 0.84]);
  const bScale = emph === 0 ? 1 : interpolate(emph, [1, 2], [0.84, 1.12]);

  const label = (on: number, text: string, color: string) => (
    <div
      style={{
        background: color, color: "#fff", borderRadius: 999, padding: tall ? "8px 20px" : "10px 34px",
        fontSize: tall ? 30 : 40, fontWeight: 800, opacity: 0.35 + 0.65 * on, letterSpacing: tall ? 1 : 2,
        transform: `scale(${0.82 + 0.18 * on})`, boxShadow: `0 10px 26px ${color}55`,
      }}
    >
      {text}
    </div>
  );

  return (
    <>
      <Stage gap={0}>
        <div style={{ display: "flex", alignItems: "center", gap, opacity: gridIn ? 0 : merged ? interpolate(mergeP, [0, 1], [1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `translateX(${(1 - inA) * -700}px) scale(${aScale})` }}>
            <Block text="a" vowel size={tall ? 210 : 250} lit={(f >= c(0) && f < c(1)) || (f >= c(10) && f < c(11))} popAt={c(0)} />
            {f >= c(10) && label(f < c(11) ? 1 : 0, "VOWEL", VOWEL)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `translateX(${(1 - inB) * 700}px) scale(${bScale})` }}>
            <Block text="t" vowel={false} size={tall ? 210 : 250} lit={(f >= c(1) && f < c(2)) || f >= c(11)} popAt={c(1)} />
            {f >= c(10) && label(f >= c(11) ? 1 : 0, "CONSONANT", CONSONANT)}
          </div>
        </div>
        {/* THE MERGE: the word plank comes DOWN OVER the two letter cards and settles in
            their place, so "a" and "t" are still on screen as "at" arrives. Switching the
            cards off on the same frame left 2.55s showing an empty room. Once the ghost grid
            is due the plank steps up to its own band (EXPLICIT tops — as a bare absolute
            child of the flex stage it landed wherever flex put it, straight through the
            grid. plank 4..~210, grid 250..464: they cannot touch). */}
        {merged && (
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center",
                        alignItems: gridIn ? "flex-start" : "center", paddingTop: gridIn ? 4 : 0 }}>
            <div style={{ transform: `translateY(${-(1 - mergeP) * (tall ? 90 : 105)}px) scale(${(gridIn ? 0.8 : 1) * interpolate(mergeP, [0.12, 1], [0.28, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, opacity: interpolate(mergeP, [0.12, 0.34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <WordPlank word="at" size={tall ? 250 : 300} lit={f < c(2) + 30} />
            </div>
          </div>
        )}
        {gridIn && (
          <div style={{ position: "absolute", top: 250, display: "grid", gridTemplateColumns: `repeat(${tall ? 4 : 8}, 1fr)`, gap: tall ? 12 : 14 }}>
            {Array.from({ length: 16 }, (_, k) => (
              <div key={k} style={{ transform: `scale(${tw(f, c(4) + k * 2, 7)})` }}>
                <Block text="" vowel={k % 2 === 0} size={tall ? 92 : 100} ghost />
              </div>
            ))}
          </div>
        )}
      </Stage>
      <Click at={c(2)} />
    </>
  );
};

// ── a set of blend triples: the SAME two blocks re-stamped for every word ────
const SetSec: React.FC<{ from: number; triples: Triple[]; banner: string; color: string; introUntil: number }> = ({
  from, triples, banner, color, introUntil,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tall = useTall();
  const rel = (x: number) => x - from;
  const intro = f < rel(introUntil) - 6;
  let k = 0;
  for (let i = 0; i < triples.length; i++) if (f >= rel(triples[i].p1) - 6) k = i;
  const t = triples[k];
  const p1 = rel(t.p1), p2 = rel(t.p2), p3 = rel(t.p3);
  const gap = intro ? (tall ? 250 : 340) : interpolate(f, [p3 - 8, p3], [tall ? 250 : 340, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const said = !intro && f >= p3;
  const landIn = spring({ frame: f - p3, fps, config: { damping: 12, stiffness: 90 } });
  const dim = interpolate(landIn, [0, 1], [1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });


  return (
    <>
      <Banner text={banner} color={color} />
      <Stage gap={0}>
        <div style={{ display: "flex", alignItems: "center", gap, opacity: dim }}>
          <Block text={t.a} vowel={t.vowelFirst} size={tall ? 210 : 250} lit={!intro && f >= p1 && f < p2} popAt={intro ? undefined : p1} />
          <Block text={intro ? "?" : t.b} vowel={!t.vowelFirst} size={tall ? 210 : 250} lit={!intro && f >= p2 && f < p3} ghost={intro} popAt={intro ? undefined : p2} />
        </div>
        {/* the blocks do NOT go away — they step back to 0.45 and the plank lands ON them */}
        {said && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: `translateY(${-(1 - landIn) * 130}px) scale(${interpolate(landIn, [0, 1], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, opacity: interpolate(landIn, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <WordPlank word={t.word} size={tall ? 210 : 240} lit={f < p3 + 24} />
            </div>
          </div>
        )}
      </Stage>
      {!intro && <Click at={p3} y={30} />}
    </>
  );
};

// ── recap: the row of eight, swept as the line is spoken ─────────────────────
const RecapSec: React.FC<{ from: number; triples: Triple[]; banner: string; color: string; sweepFrom: number; sweepTo: number }> = ({
  from, triples, banner, color, sweepFrom, sweepTo,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tall = useTall();
  const lit = Math.floor(interpolate(f, [sweepFrom - from, sweepTo - from], [0, 7.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <>
      <Banner text={banner} color={color} />
      <Stage>
        <div style={{ display: "flex", gap: tall ? 16 : 22, flexWrap: "wrap", justifyContent: "center", maxWidth: tall ? 700 : 1700 }}>
          {triples.map((t, i) => (
            <div key={t.word} style={{ transform: `scale(${tw(f, i * 3, 8) * (i === lit ? 1.1 : 1)}) translateY(${bob(f, fps, 5, 2.4, i)}px)`, opacity: i <= lit ? 1 : 0.55 }}>
              <WordPlank word={t.word} size={tall ? 152 : 150} lit={i === lit} />
            </div>
          ))}
        </div>
      </Stage>
    </>
  );
};

// ── the Listen builds: chunk + one more sound = a real word with its picture ─
const BuildSec: React.FC<{ from: number; builds: BuildT[]; banner: string; introUntil: number; gatherUntil?: number }> = ({
  from, builds, banner, introUntil, gatherUntil,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const B = useB();
  const tall = useTall();
  const rel = (x: number) => x - from;
  const intro = f < rel(introUntil) - 6;
  let k = 0;
  for (let i = 0; i < builds.length; i++) if (f >= rel(builds[i].p1) - 6) k = i;
  const b = builds[k];
  const p1 = rel(b.p1), p2 = rel(b.p2), p3 = rel(b.p3);
  const said = !intro && f >= p3;
  const sweep = !intro && f >= p2 && f < p3; // the "buh-aaa-t" sound-out
  // "buh" lights the added letter ALONE; "aaa-t" lights the chunk ALONE. Split at a third
  // of the sound-out phrase's REAL length (its aligned end), not of the gap to the next
  // word — the gap includes silence, which dragged the split late.
  const p2e = rel(b.p2e);
  // ORDER FOLLOWS THE SOUND-OUT: "buh-aaa-t" = add first (front), "buh-aaa-g" = the
  // CHUNK "ba" first and the added "g" LAST. One cut point, sides swap with b.front.
  const cut = rel(b.cut);
  // A CV build's added letter is a stop consonant -- "g" in buh-aaa-g is a 0.07s release,
  // so ending its lit window at the sound-out gave a 2-frame blink. It lights on the sound
  // and HOLDS through the word reveal, which is both correct and visible.
  const addLit = b.front ? (sweep && f < cut) : (!intro && f >= cut && f < b.p3 + 22);
  const chunkLit = sweep && (b.front ? f >= cut : f < cut);
  // A MEASURED cut can land a frame or two from the phrase end, so a fixed 5-frame ramp
  // would make the interpolate range non-monotonic (Remotion throws). Ramps adapt to the
  // room actually available on each side.
  const win = (a: number, b: number): [number, number, number, number] => {
    // STRICTLY increasing: a window of 4 frames or fewer cannot host two ramp points, so
    // it is widened rather than allowed to collide (Remotion throws on equal stops).
    const span = Math.max(4, b - a);
    const ramp = Math.max(1, Math.min(5, Math.floor((span - 1) / 3)));
    return [a, a + ramp, a + span - ramp, a + span];
  };
  const addWin = b.front ? win(p2 - 2, cut) : win(cut, p2e + 6);
  const chunkWin = b.front ? win(cut, p2e + 6) : win(p2 - 2, cut);
  const addScale = interpolate(f, addWin, [1, 1.16, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chunkScale = interpolate(f, chunkWin, [1, 1.16, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (intro && gatherUntil !== undefined && f < rel(gatherUntil) - 6) {
    // "Here's the secret / These aren't just little words" — the 16 chunks assemble
    return (
      <Stage>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tall ? 4 : 8}, 1fr)`, gap: tall ? 12 : 16 }}>
          {[...VC_TRIPLES, ...CV_TRIPLES].map((t, i) => (
            <div key={t.word} style={{ transform: `scale(${tw(f, i * 2, 7)}) translateY(${bob(f, fps, 4, 2.2, i)}px)` }}>
              <WordPlank word={t.word} size={tall ? 118 : 104} />
            </div>
          ))}
        </div>
      </Stage>
    );
  }

  return (
    <>
      <Banner text={banner} color={b.front ? VOWEL : CONSONANT} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${tall ? -18 : -46}px)` }}>
      <Stage gap={tall ? 14 : 30} column={tall}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, flexDirection: b.front ? "row" : "row-reverse" }}>
          <div style={{ transform: `scale(${intro ? 1 : addScale})` }}><Block text={intro ? "?" : b.add} vowel={false} size={tall ? 168 : 205} ghost={intro} lit={addLit} popAt={intro ? undefined : (b.front ? p2 : cut)} /></div>
          <div style={{ transform: `scale(${intro ? 1 : chunkScale})` }}><Block text={b.chunk} vowel size={tall ? 168 : 205} lit={chunkLit} popAt={intro ? undefined : (b.front ? cut : p2)} /></div>
        </div>
        <div style={{ width: tall ? "auto" : 100, textAlign: "center", fontSize: tall ? 58 : 76, fontWeight: 800, color: palette.inkSoft }}>{tall ? "↓" : "→"}</div>
        {said ? (
          <div style={{ transform: `scale(${spring({ frame: f - p3, fps, config: { damping: 10 } })})` }}>
            <WordPlank word={b.word} pic={PIC[b.word]} size={tall ? 190 : 225} lit={f < p3 + 24} />
          </div>
        ) : (
          <Block text="?" vowel={false} size={tall ? 168 : 205} ghost />
        )}
      </Stage>
      </div>
      {/* the chunk row along the stage bottom: "At..." (p1) highlights ITS chip here,
          before the sound-out lights the big blocks — proper to the audio script */}
      {/* 4:5: the chunk row moves ONTO THE BENCH and wraps 4+4. Eight planks need 966px
          but the content zone is 728, so inside the stage it wrapped 7+1 and collided with
          the build content. On the bench it is thematically right and the stage keeps all
          648px. Width is pinned so the wrap is even, never 7+1. */}
      <div style={{ position: "absolute", left: tall ? 300 : B.contentL, width: tall ? 480 : B.contentR - B.contentL, top: tall ? B.benchY - 6 : B.stageBot - 78, display: tall ? "grid" : "flex", gridTemplateColumns: tall ? "repeat(4, 1fr)" : undefined, justifyItems: tall ? "center" : undefined, flexWrap: "wrap", justifyContent: "center", gap: tall ? 10 : 14, fontFamily: font.family }}>
        {builds.map((x, i2) => {
          const active = !intro && i2 === k && f >= rel(x.p1);
          return (
            <div key={x.chunk} style={{ transform: `scale(${(intro ? 1 : active ? 1.22 : 0.92)}) translateY(${bob(f, fps, 4, 2.4, i2)}px)`, opacity: intro || active ? 1 : 0.5, transition: "none" }}>
              <WordPlank word={x.chunk} size={tall ? 76 : 96} lit={active} />
            </div>
          );
        })}
      </div>
      {!intro && <Click at={p3} x={340} />}
    </>
  );
};

// ── payoff · practice · quiz · subscribe ─────────────────────────────────────
const PayoffSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tall = useTall();
  const c = (i: number) => P(i) - from;
  const thumbs = f >= c(122);
  return (
    <Stage>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tall ? 4 : 8}, 1fr)`, gap: tall ? 12 : 14, transform: `scale(${f >= c(121) && f < c(122) ? pulse(f - c(121), fps, 0.04, 1) : 1}) translateY(${thumbs ? 46 : 0}px)` }}>
        {[...VC_TRIPLES, ...CV_TRIPLES].map((t, i) => (
          <div key={t.word} style={{ transform: `scale(${tw(f, i, 6)}) translateY(${bob(f, fps, 4, 2.4, i)}px)` }}>
            <WordPlank word={t.word} size={tall ? 122 : 96} lit={f >= c(121) && f < c(122)} />
          </div>
        ))}
      </div>
      {thumbs && (
        <div style={{ position: "absolute", top: tall ? -80 : -34, fontSize: tall ? 130 : 148, transform: `scale(${spring({ frame: f - c(122), fps, config: { damping: 9 } })}) rotate(${wiggle(f, fps, 6, 3)}deg)` }}>
          👍
        </div>
      )}
    </Stage>
  );
};

const PracticeSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tall = useTall();
  const c = (i: number) => P(i) - from;
  const second = f >= c(130) - 6;
  const A = second ? "d" : "a", B = second ? "o" : "n", word = second ? "do" : "an";
  const s1 = second ? c(130) : c(127), s2 = second ? c(131) : c(128), hit = second ? c(132) : c(129);
  const vowelFirst = !second;
  const said = f >= hit;
  const landIn = spring({ frame: f - hit, fps, config: { damping: 12, stiffness: 90 } });
  const dim = interpolate(landIn, [0, 1], [1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <Banner text="YOUR TURN" />
      <Stage gap={0}>
        <div style={{ display: "flex", alignItems: "center", gap: interpolate(f, [hit - 8, hit], [tall ? 250 : 340, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), opacity: dim }}>
          <Block text={f >= s1 ? A : "?"} vowel={vowelFirst} size={tall ? 210 : 250} ghost={f < s1} lit={f >= s1 && f < hit} popAt={s1} />
          <Block text={f >= s2 ? B : "?"} vowel={!vowelFirst} size={tall ? 210 : 250} ghost={f < s2} lit={f >= s2 && f < hit} popAt={s2} />
        </div>
        {said && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: `translateY(${-(1 - landIn) * 130}px) scale(${interpolate(landIn, [0, 1], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, opacity: interpolate(landIn, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <WordPlank word={word} size={tall ? 210 : 240} lit />
            </div>
          </div>
        )}
        <Click at={hit} y={30} />
      </Stage>
    </>
  );
};

const QuizSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tall = useTall();
  const c = (i: number) => P(i) - from;
  const reveal = f >= c(138);
  return (
    <>
      <Banner text="LAST ONE!" color="#7B1FA2" />
      <Stage gap={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 42 }}>
          <div style={{ display: "flex", gap: 18 }}>
            {(["c", "u", "p"] as const).map((ch, i) => {
              const at = c(135 + i);
              return (
                <div key={ch} style={{ transform: `scale(${tw(f, c(134) + i * 4, 7)})` }}>
                  <Block text={ch} vowel={ch === "u"} size={tall ? 150 : 162} lit={f >= at && f < at + 22} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 30 }}>
            {["cap", "cup", "cop"].map((w, i) => (
              <div key={w} style={{ transform: `scale(${tw(f, c(134) + 10 + i * 4, 7) * (reveal && w === "cup" ? pulse(f - c(138), fps, 0.07, 1) : 1)})` }}>
                <WordPlank word={w} size={tall ? 150 : 148} lit={reveal && w === "cup"} dim={reveal && w !== "cup"} />
              </div>
            ))}
          </div>
        </div>
        {reveal && <Click at={c(138)} />}
      </Stage>
    </>
  );
};

const SubscribeSec: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (i: number) => P(i) - from;
  const press = f >= c(140) + 26;
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 42 }}>
        <div
          style={{
            background: "#E53935", color: "#fff", borderRadius: 20, padding: "18px 60px",
            fontSize: 54, fontWeight: 800, letterSpacing: 1,
            transform: `scale(${spring({ frame: f - c(140), fps, config: { damping: 11 } }) * (press ? 0.97 + 0.03 * Math.sin((f / fps) * 4) : 1)})`,
            boxShadow: "0 14px 34px rgba(229,57,53,0.5)",
          }}
        >
          SUBSCRIBE
        </div>
        {/* the tap: finger in, press, pop */}
        {f >= c(140) + 10 && (
          <div style={{ position: "absolute", top: 66, left: "calc(50% + 60px)", fontSize: 92, transform: `translate(${interpolate(f, [c(140) + 10, c(140) + 24], [140, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px, ${press ? 6 : 0}px) rotate(-20deg)`, pointerEvents: "none" }}>
            👆
          </div>
        )}
        <Sequence from={c(140) + 24} durationInFrames={16}>
          <Audio src={staticFile("sfx/pop.mp3")} volume={0.7} />
        </Sequence>
        <div style={{ display: "flex", gap: 26 }}>
          {(["cat", "dog", "pig"] as const).map((w, i) => (
            <div key={w} style={{ transform: `scale(${tw(f, c(141 + i), 8)}) translateY(${bob(f, fps, 6, 2.4, i)}px)` }}>
              <WordPlank word={w} pic={PIC[w]} size={150} />
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
};

// ── assembly ─────────────────────────────────────────────────────────────────
const CAPTION_TRACK = makeTrack(CAPTION_PHRASES as unknown as TPhrase[], AUDIO_SEC);
// the Bold Keywords rule: the lesson's own vocabulary is tinted in the caption band
const l3Keyword = (raw: string): string | null => {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (["vowel", "vowels", "red"].includes(w)) return VOWEL;
  if (["consonant", "consonants", "blue"].includes(w)) return CONSONANT;
  if (["blend", "blending", "blended", "blends"].includes(w)) return "#F57C00";
  if (["sixteen", "front", "back"].includes(w)) return "#7B1FA2";
  return null;
};

export const BlendingReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family }}>
    <WorkshopWorld />

    <Audio src={staticFile("audio/cv_vc/cv_vc_new.mp3")} />
    <Audio
      src={staticFile("music_bed.mp3")}
      loop
      volume={(f) => interpolate(f, [0, 20, BLENDING_DURATION - 40, BLENDING_DURATION], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />

    {/* one Sequence per SECTION — see header. The opener spans hook+intro+idea. */}
    <Sequence from={0} durationInFrames={secFrom("vcIntro")}>
      <Opener from={0} />
    </Sequence>
    <Sequence from={secFrom("vcIntro")} durationInFrames={secFrom("vcRecap") - secFrom("vcIntro")}>
      <SetSec from={secFrom("vcIntro")} triples={VC_TRIPLES} banner="VOWEL FIRST" color={VOWEL} introUntil={P(SEC.vcSet[0])} />
    </Sequence>
    <Sequence from={secFrom("vcRecap")} durationInFrames={secFrom("cvIntro") - secFrom("vcRecap")}>
      <RecapSec from={secFrom("vcRecap")} triples={VC_TRIPLES} banner="VOWEL FIRST" color={VOWEL} sweepFrom={P(38)} sweepTo={PE(38)} />
    </Sequence>
    <Sequence from={secFrom("cvIntro")} durationInFrames={secFrom("cvRecap") - secFrom("cvIntro")}>
      <SetSec from={secFrom("cvIntro")} triples={CV_TRIPLES} banner="CONSONANT FIRST" color={CONSONANT} introUntil={P(SEC.cvSet[0])} />
    </Sequence>
    <Sequence from={secFrom("cvRecap")} durationInFrames={secFrom("secret") - secFrom("cvRecap")}>
      <RecapSec from={secFrom("cvRecap")} triples={CV_TRIPLES} banner="CONSONANT FIRST" color={CONSONANT} sweepFrom={P(66)} sweepTo={PE(66)} />
    </Sequence>
    <Sequence from={secFrom("secret")} durationInFrames={secFrom("flip") - secFrom("secret")}>
      <BuildSec from={secFrom("secret")} builds={BUILD_VC} banner="ADD IN FRONT" introUntil={P(SEC.buildVC[0])} gatherUntil={P(69)} />
    </Sequence>
    <Sequence from={secFrom("flip")} durationInFrames={secFrom("payoff") - secFrom("flip")}>
      <BuildSec from={secFrom("flip")} builds={BUILD_CV} banner="ADD AT THE BACK" introUntil={P(SEC.buildCV[0])} />
    </Sequence>
    <Sequence from={secFrom("payoff")} durationInFrames={secFrom("practice") - secFrom("payoff")}>
      <PayoffSec from={secFrom("payoff")} />
    </Sequence>
    <Sequence from={secFrom("practice")} durationInFrames={secFrom("quiz") - secFrom("practice")}>
      <PracticeSec from={secFrom("practice")} />
    </Sequence>
    <Sequence from={secFrom("quiz")} durationInFrames={secFrom("subscribe") - secFrom("quiz")}>
      <QuizSec from={secFrom("quiz")} />
    </Sequence>
    <Sequence from={secFrom("subscribe")} durationInFrames={WRAP_FROM - secFrom("subscribe")}>
      <SubscribeSec from={secFrom("subscribe")} />
    </Sequence>

    <Sequence from={WRAP_FROM} durationInFrames={BLENDING_DURATION - WRAP_FROM}>
      {/* the HOUSE download section — same call as c_k_ck and every 16:9 lesson:
          compact = detail page only, no dark search flow */}
      <StoreOutro silent compact total={BLENDING_DURATION - WRAP_FROM} />
    </Sequence>

    {/* house karaoke captions — gated at the outro: the store card carries its own text,
        and a caption over the badges read as clutter (user call). from=0 keeps the
        track's absolute frames aligned. */}
    <Sequence from={0} durationInFrames={WRAP_FROM}>
      <Captions track={CAPTION_TRACK} keywordColor={l3Keyword} maxWidth={1360} fontSize={40} bottom={70} />
    </Sequence>

    <Sequence from={0} durationInFrames={WRAP_FROM}>
      <Watermark corner="tr" widthFrac={0.09} opacity={0.5} />
    </Sequence>
  </AbsoluteFill>
);

export const BLENDING_TOTAL = BLENDING_DURATION;
