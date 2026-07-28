import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PHead } from "../components/PortraitBeatKit";
import { Marquee, SpotOn, StageChip } from "../components/TheatreWorld";
import { TilePart, WordTiles } from "../components/WordTiles";
import { WordArt } from "../components/WordArt";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// Portrait beats for ge/dge — The Big Stage. Separate from the landscape beats on purpose:
// the tile row is the same VISUAL but the frame is 1080×1920, so the vertical positions and
// the pointing device both differ (a spotlight from above, not a magnifier from the side).
//
// Vertical law, from TheatreWorld:
//    150…290 headline · 330…520 picture · 560…760 tiles · 800…880 label
//    905…985 note · 1180+ stage · 1500+ captions

const GE = "00695C";
const DGE = "AD1457";
const SHORT = "EF6C00";
const LONG = "1E88E5";
const CONS = "6A1B9A";
export const P_TONES = { GE, DGE, SHORT, LONG, CONS };

const TILE_TOP = 560;
const LABEL_TOP = 800;
const NOTE_TOP = 905;
const PIC_TOP = 330;

// ── the swap note, in flow-free absolute space (the stage below is empty) ────
export type PNote = { at: number; node: React.ReactNode | null };

export const PSwapNote: React.FC<{ notes: PNote[]; top?: number }> = ({ notes, top = NOTE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let cur: PNote | null = null;
  for (const n of notes) if (frame >= n.at) cur = n;
  if (!cur || !cur.node) return null;
  const s = spring({ frame: frame - cur.at, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `scale(${0.84 + 0.16 * s}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>{cur.node}</div>
    </div>
  );
};

export const PNotes = {
  listen: <StageChip tone={hex(DGE)}><span style={{ fontSize: 42 }}>👂</span>listen — we build it</StageChip>,
  badgeDone: <StageChip tone="#2E7D32"><span style={{ fontSize: 42 }}>🎉</span>that spells <span style={{ color: hex(DGE) }}>badge</span>!</StageChip>,
  more: <StageChip tone={hex(DGE)}>three more words <span style={{ fontSize: 40 }}>👇</span></StageChip>,
  saysName: <StageChip tone={hex(LONG)}>the <span style={{ color: hex(LONG) }}>a</span> says its own name → <span style={{ color: hex(LONG) }}>“ay”</span> 🎵</StageChip>,
  noD: (
    <StageChip tone={hex(GE)}>
      no{" "}
      <span style={{ position: "relative", display: "inline-block", color: "#C62828", padding: "0 5px" }}>
        d
        <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1="4%" y1="12%" x2="96%" y2="88%" stroke="#C62828" strokeWidth={7} strokeLinecap="round" />
        </svg>
      </span>{" "}
      needed — just <span style={{ color: hex(GE) }}>ge</span>
    </StageChip>
  ),
  geAgain: <StageChip tone={hex(GE)}>so we write <span style={{ color: hex(GE) }}>ge</span> again ✅</StageChip>,
};

// ── hook ─────────────────────────────────────────────────────────────────────
export type PHookCues = {
  sound1: number; two: number; writeGe: number; writeDge: number;
  sayIt: number; sound2: number; hear: number; hearCage: number; hearBadge: number; same: number;
};

const Burst: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9 } });
  const ring = ((frame - at) % 30) / 30;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 560, height: 420 }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", width: 260 + ring * 260 + k * 90, height: 260 + ring * 260 + k * 90, borderRadius: "50%", border: `10px solid ${hex(DGE)}`, opacity: (1 - ring) * 0.45 }} />
      ))}
      <div style={{ fontSize: 250, fontWeight: 700, color: "#FFE9A8", fontFamily: font.family, transform: `scale(${0.6 + 0.4 * s})`, textShadow: `0 18px 44px rgba(0,0,0,0.45)` }}>j!</div>
    </div>
  );
};

// the opening line names WHERE to listen, so it draws a word shape with the last slot ringed
const EndOfWord: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = (frame % 34) / 34;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, fontFamily: font.family }}>
      <span style={{ fontSize: 130, transform: `scale(${1 + 0.09 * Math.sin((frame / fps) * 4)})` }}>👂</span>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        {[0, 1, 2].map((i) => {
          const last = i === 2;
          return (
            <div
              key={i}
              style={{
                position: "relative", width: 170, height: 210, borderRadius: 30,
                background: last ? tint(DGE, 0.9) : "#FFFDF6AA",
                border: `9px ${last ? "solid" : "dashed"} ${last ? hex(DGE) : "#C8A9A0"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 92, fontWeight: 700, color: last ? hex(DGE) : "#C8A9A0",
                boxShadow: slab(last ? DGE : "6B1028", last ? 18 : 10),
                transform: `translateY(${bob(frame, fps, 7, 2.4, i)}px)`,
              }}
            >
              {last ? "?" : "•"}
              {last && <div style={{ position: "absolute", inset: -10 - ring * 40, borderRadius: 46, border: `8px solid ${hex(DGE)}`, opacity: (1 - ring) * 0.55 }} />}
            </div>
          );
        })}
      </div>
      <StageChip tone={hex(DGE)}>the <span style={{ color: hex(DGE) }}>END</span> of the word</StageChip>
    </div>
  );
};

const PicCard: React.FC<{ word: string; mark: string; color: string; litAt: number }> = ({ word, mark, color, litAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const lit = frame >= litAt;
  const kick = lit ? 1 + 0.13 * Math.max(0, 1 - (frame - litAt) / 18) : 1;
  const cut = word.lastIndexOf(mark);
  return (
    <div
      style={{
        width: 420, background: lit ? tint(color, 0.9) : "#FFFDF6", border: `9px solid ${c}`, borderRadius: 40,
        padding: "22px 0 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        fontFamily: font.family, boxShadow: slab(color, lit ? 22 : 14),
        transform: `scale(${kick}) translateY(${bob(frame, fps, 8, 2.4)}px)`,
      }}
    >
      <WordArt word={word} size={150} />
      <span style={{ fontSize: 84, fontWeight: 700, color: palette.ink }}>
        {word.slice(0, cut)}
        <span style={{ color: c }}>{mark}</span>
      </span>
    </div>
  );
};

export const PGeHook: React.FC<{ cues: PHookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pair = frame >= cues.hear;
  return (
    <>
      <PHead size={46} still>
        {pair ? (<>Same sound — <span style={{ color: hex(GE) }}>ge</span> and <span style={{ color: hex(DGE) }}>dge</span>!</>) : (<>Listen to the sound at the END 👂</>)}
      </PHead>
      <Marquee top={296} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {pair ? (
          <>
            <div style={{ display: "flex", gap: 30 }}>
              <PicCard word="cage" mark="ge" color={GE} litAt={cues.hearCage} />
              <PicCard word="badge" mark="dge" color={DGE} litAt={cues.hearBadge} />
            </div>
            {frame >= cues.same && (
              <div style={{ transform: `scale(${spring({ frame: frame - cues.same, fps, config: { damping: 11 } })})` }}>
                <StageChip tone="#FFE9A8" size={42}>🎭 one sound, two spellings</StageChip>
              </div>
            )}
          </>
        ) : frame < cues.sound1 ? (
          <EndOfWord />
        ) : (
          <>
            <Burst at={frame >= cues.sound2 ? cues.sound2 : cues.sound1} />
            {frame >= cues.two && frame < cues.sayIt && (
              <div style={{ display: "flex", gap: 40 }}>
                {[{ t: "ge", c: GE, at: cues.writeGe }, { t: "dge", c: DGE, at: cues.writeDge }].map((x, i) => {
                  const filled = frame >= x.at;
                  const sp = spring({ frame: frame - x.at, fps, config: { damping: 11 } });
                  return (
                    <div
                      key={x.t}
                      style={{
                        width: 300, height: 240, borderRadius: 36,
                        background: filled ? tint(x.c, 0.9) : "#FFFDF6CC",
                        border: `9px ${filled ? "solid" : "dashed"} ${filled ? hex(x.c) : "#C8A9A0"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 110, fontWeight: 700, color: hex(x.c), fontFamily: font.family,
                        boxShadow: filled ? slab(x.c, 22) : slab("6B1028", 10),
                        transform: `scale(${(filled ? 0.8 + 0.2 * sp : 1) * (frame >= x.at && frame < x.at + 20 ? 1.1 : 1)}) translateY(${bob(frame, fps, 7, 2.4, i)}px)`,
                      }}
                    >
                      {filled ? x.t : "?"}
                    </div>
                  );
                })}
              </div>
            )}
            {frame >= cues.sayIt && frame < cues.hear && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: font.family }}>
                <span style={{ fontSize: 150, transform: `scale(${1 + 0.08 * Math.sin((frame / fps) * 5)})` }}>🗣️</span>
                <StageChip tone="#FFE9A8" size={42}>your turn — say it!</StageChip>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

// ── "just like ch and tch, look at the letter before" ───────────────────────
// The spotlight is anchored to the target letter's own span, so it cannot drift onto a
// neighbour the way an x-interpolated magnifier did in landscape.
export const PGeLookBefore: React.FC<{ ruleAt: number }> = ({ ruleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = frame >= ruleAt;
  return (
    <>
      <PHead size={46}>
        {on ? (<>Look at the letter <span style={{ color: hex(SHORT) }}>just before</span> 🔎</>) : (<>Which one do we write? 🤔</>)}
      </PHead>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        {[{ pre: "c", target: "a", mark: "ge", c: GE }, { pre: "b", target: "a", mark: "dge", c: DGE }].map((w, i) => (
          <div
            key={w.mark}
            style={{
              background: "#FFFDF6", border: `9px solid ${hex(w.c)}`, borderRadius: 34,
              padding: "18px 46px", fontSize: 104, fontWeight: 700, color: palette.ink,
              fontFamily: font.family, boxShadow: slab(w.c, 17),
              transform: `translateY(${bob(frame, fps, 7, 2.4, i)}px)`,
            }}
          >
            {w.pre}
            <span style={{ position: "relative", display: "inline-block" }}>
              {w.target}
              {/* tight enough to ring the ONE letter — at 82 it swallowed its neighbours */}
              {on && <SpotOn at={ruleAt + i * 10} r={62} />}
            </span>
            <span style={{ color: hex(w.c) }}>{w.mark}</span>
          </div>
        ))}
        {!on ? (
          <span style={{ fontSize: 130 }}>🤔</span>
        ) : (
          <div style={{ transform: `scale(${spring({ frame: frame - ruleAt, fps, config: { damping: 12 } })})` }}>
            <StageChip tone="#C89B3C">🔁 the same question as <span style={{ color: "#1565C0" }}>ch</span> ⚡ <span style={{ color: "#D84315" }}>tch</span></StageChip>
          </div>
        )}
      </div>
    </>
  );
};

// ── a worked word, rebuilt on each named example ────────────────────────────
export type PCaseCues = { intro?: number; rule?: number; build: number; done: number; label: number; more: number[]; allAt: number };

export const PGeCase: React.FC<{
  head: React.ReactNode; base: TilePart[]; endingColor: string; focusLabel: string; focusColor: string;
  cues: PCaseCues; examples: { parts: TilePart[]; art: React.ReactNode }[]; baseArt: React.ReactNode;
  introNode?: React.ReactNode; ruleLabel?: string; allWords?: string[]; notes?: PNote[];
}> = ({ head, base, endingColor, focusLabel, focusColor, cues, examples, baseArt, introNode, ruleLabel = "short vowel", allWords, notes = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = -1;
  for (let i = 0; i < cues.more.length; i++) if (frame >= cues.more[i]) idx = i;
  const showAll = allWords && frame >= cues.allAt;
  const preRule = cues.rule !== undefined && frame >= cues.rule && frame < cues.build;
  const preIntro = cues.intro !== undefined && frame >= cues.intro && frame < (cues.rule ?? cues.build);
  const parts = idx < 0 ? base : examples[idx].parts;
  const art = idx < 0 ? baseArt : examples[idx].art;
  return (
    <>
      <PHead size={44}>{head}</PHead>
      {preIntro || preRule ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
          {preRule ? (
            // the rule on its own, before any example word — stacked, because a tall frame has
            // the room and a wide row would have to shrink the type
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontFamily: font.family }}>
              <div style={{ background: "#FFF8E1", border: `9px solid ${hex(focusColor)}`, color: hex(focusColor), borderRadius: 34, padding: "22px 52px", fontSize: 68, fontWeight: 700, boxShadow: slab(focusColor, 17), transform: `translateY(${bob(frame, fps, 7, 2.4)}px)` }}>
                {ruleLabel}
              </div>
              <span style={{ fontSize: 66, color: "#FFE9A8" }}>+</span>
              <div style={{ background: tint(endingColor, 0.88), border: `9px solid ${hex(endingColor)}`, color: hex(endingColor), borderRadius: 34, padding: "22px 60px", fontSize: 88, fontWeight: 700, boxShadow: slab(endingColor, 19), transform: `translateY(${bob(frame, fps, 7, 2.4, 1)}px)` }}>
                {base[base.length - 1].text}
              </div>
              <span style={{ fontSize: 66 }}>✅</span>
            </div>
          ) : (
            introNode
          )}
        </div>
      ) : showAll ? (
        // four finished words, two by two — a single row of four would not fit 900px
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          {[allWords!.slice(0, 2), allWords!.slice(2, 4)].map((row, r) => (
            <div key={r} style={{ display: "flex", gap: 26 }}>
              {row.map((w, i) => (
                <PVowelWord key={w} word={w} at={cues.allAt + (r * 2 + i) * 7} ending={base[base.length - 1].text} tone={endingColor} vowelColor={focusColor} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <WordTiles
          key={idx}
          parts={parts}
          endingColor={endingColor}
          focusLabel={focusLabel}
          focusColor={focusColor}
          enterAt={idx < 0 ? cues.build : cues.more[idx]}
          endingAt={idx < 0 ? cues.done : cues.more[idx] + 4}
          labelAt={idx < 0 ? cues.label : cues.more[idx] + 8}
          emoji={art}
          depth3d
          tileTop={TILE_TOP}
          labelTop={LABEL_TOP}
          emojiTop={PIC_TOP}
          emojiSize={150}
        />
      )}
      {!showAll && !preRule && !preIntro && <PSwapNote notes={notes} />}
    </>
  );
};

const PVowelWord: React.FC<{ word: string; at: number; ending: string; tone: string; vowelColor: string }> = ({ word, at, ending, tone, vowelColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  const c = hex(tone);
  const vc = hex(vowelColor);
  const stem = word.slice(0, word.length - ending.length);
  return (
    <div style={{ background: "#FFFDF6", border: `8px solid ${c}`, borderRadius: 32, padding: "16px 34px", fontSize: 78, fontWeight: 700, fontFamily: font.family, color: palette.ink, whiteSpace: "nowrap", boxShadow: slab(tone, 15), transform: `scale(${0.74 + 0.26 * s}) translateY(${bob(frame, fps, 7, 2.4)}px)` }}>
      {stem.slice(0, -1)}
      <span style={{ color: vc, borderBottom: `9px solid ${vc}`, paddingBottom: 2 }}>{stem.slice(-1)}</span>
      <span style={{ color: c }}>{ending}</span>
    </div>
  );
};

// the card each case beat opens on
export const PPlaceCard: React.FC<{ n: string; label: string; emoji: string; tone: string }> = ({ n, label, emoji, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  return (
    <div style={{ background: tint(tone, 0.9), border: `10px solid ${c}`, borderRadius: 44, padding: "34px 56px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: font.family, boxShadow: slab(tone, 20), transform: `scale(${0.86 + 0.14 * spring({ frame, fps, config: { damping: 12 } })}) translateY(${bob(frame, fps, 7, 2.6)}px)` }}>
      <span style={{ fontSize: 110 }}>{emoji}</span>
      <span style={{ fontSize: 62, fontWeight: 700, color: c }}>{n}</span>
      <span style={{ fontSize: 54, fontWeight: 700, color: palette.ink, textAlign: "center" }}>{label}</span>
    </div>
  );
};

// ── "everywhere else → ge", then the two places ────────────────────────────
export const PGePlaces: React.FC<{ introAt: number }> = ({ introAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = [
    { n: "1", t: "after a long vowel", e: "🎵", c: LONG },
    { n: "2", t: "after a consonant", e: "🔤", c: CONS },
  ];
  return (
    <>
      <PHead size={46}>Everywhere else → write <span style={{ color: hex(GE) }}>ge</span></PHead>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        {frame < introAt ? (
          <div style={{ background: tint(GE, 0.9), border: `12px solid ${hex(GE)}`, borderRadius: 50, padding: "44px 110px", fontSize: 230, fontWeight: 700, color: hex(GE), fontFamily: font.family, boxShadow: slab(GE, 28), transform: `scale(${0.8 + 0.2 * spring({ frame, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 8, 3)}px)` }}>
            ge
          </div>
        ) : (
          // stacked, not side by side: the tall frame reads them as a list, and each card can
          // keep full-size type
          P.map((p, i) => {
            const at = introAt + i * 12;
            if (frame < at) return <div key={p.n} style={{ height: 200 }} />;
            const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
            return (
              <div key={p.n} style={{ width: 830, background: "#FFFDF6", border: `9px dashed ${hex(p.c)}`, borderRadius: 40, padding: "24px 30px", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, fontFamily: font.family, boxShadow: slab(p.c, 14), transform: `scale(${0.86 + 0.14 * s}) translateY(${bob(frame, fps, 7, 2.4, i)}px)` }}>
                <span style={{ fontSize: 78 }}>{p.e}</span>
                <span style={{ fontSize: 62, fontWeight: 700, color: hex(p.c) }}>{p.n}</span>
                <span style={{ fontSize: 52, fontWeight: 700, color: palette.ink }}>{p.t}</span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

// the recap's closing line
export const PNoTricky: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9 } });
  return (
    // in the clear air between the recap block and the stage floor (1258)
    <div style={{ position: "absolute", left: 0, right: 0, top: 1075, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "14px 46px",
          fontSize: 48, fontWeight: 700, fontFamily: font.family, whiteSpace: "nowrap",
          boxShadow: slab("2E7D32", 17),
          transform: `scale(${0.6 + 0.4 * s}) rotate(${wiggle(frame, fps, 2, 1.4)}deg)`,
        }}
      >
        ⭐ and no tricky words at all!
      </div>
    </div>
  );
};
