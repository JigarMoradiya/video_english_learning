import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Beat } from "../lib/timing";
import { Band, Center, Pill } from "../components/LandscapeBeatKit";
import { Placard } from "../components/CourtRoom";
import { WordArt } from "../components/WordArt";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// Beats for ge/dge — The Word Court. Same rule SHAPE as ch/tch (what letter sits before the
// sound?), so the worked words reuse LetterBeforeCase; everything here is what this card has
// that ch/tch does not:
//
//   · the ck ⚡ tch ⚡ dge family, which is the payoff of three videos at once
//   · the good news that dge has ZERO rule breakers, told against ch/tch's nine
//
// Every surface extrudes (slab) because this is the first 3D world.

const GE = "00695C";   // teal
const DGE = "AD1457";  // magenta
const SHORT = "EF6C00"; // orange — the short vowel
const LONG = "1E88E5";  // blue — the long vowel
const CONS = "6A1B9A";  // purple — the consonant

export const GE_TONES = { GE, DGE, SHORT, LONG, CONS };

// ── a note that swaps as the narration moves on ─────────────────────────────
// Several lines ("Listen." · "Here are more." · "That means we only need ge.") explain the
// SAME tiles, so the tiles cannot carry them. Each gets its own chip on the row below, and
// only the most recent one shows — two chips at one top would sit on each other.
export type SwapNote = { at: number; node: React.ReactNode | null };

export const GeSwapNote: React.FC<{ notes: SwapNote[]; top?: number }> = ({ notes, top = 660 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let cur: SwapNote | null = null;
  for (const n of notes) if (frame >= n.at) cur = n;
  if (!cur || !cur.node) return null;
  const s = spring({ frame: frame - cur.at, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `scale(${0.84 + 0.16 * s}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>{cur.node}</div>
    </div>
  );
};

// The in-flow twin of GeSwapNote. The absolute version anchored to the beat container, so
// inside a centred column `top: 0` put the chip at the very top of the FRAME, where it was cut
// off and sat on the headline pill.
const FlowNote: React.FC<{ notes: SwapNote[] }> = ({ notes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let cur: SwapNote | null = null;
  for (const n of notes) if (frame >= n.at) cur = n;
  if (!cur || !cur.node) return null;
  const s = spring({ frame: frame - cur.at, fps, config: { damping: 12 } });
  return <div style={{ transform: `scale(${0.84 + 0.16 * s}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>{cur.node}</div>;
};

const Chip: React.FC<{ tone: string; children: React.ReactNode; size?: number }> = ({ tone, children, size = 34 }) => (
  <div
    style={{
      background: "#FFFDF6", border: `6px solid ${hex(tone)}`, borderRadius: 999,
      padding: "9px 30px", fontSize: size, fontWeight: 700, color: palette.ink,
      fontFamily: font.family, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12,
      boxShadow: slab(tone, 10),
    }}
  >
    {children}
  </div>
);

// a letter with a red stroke through it — "we do NOT need a d here"
const Crossed: React.FC<{ ch: string }> = ({ ch }) => (
  <span style={{ position: "relative", display: "inline-block", color: "#C62828", padding: "0 4px" }}>
    {ch}
    <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1="4%" y1="12%" x2="96%" y2="88%" stroke="#C62828" strokeWidth={7} strokeLinecap="round" />
    </svg>
  </span>
);

export const GeNotes = {
  listen: <Chip tone={DGE}><span style={{ fontSize: 38 }}>👂</span>listen — we build it</Chip>,
  badgeDone: (
    <Chip tone="2E7D32">
      <span style={{ fontSize: 36 }}>🎉</span>that spells <span style={{ color: hex(DGE) }}>badge</span>!
    </Chip>
  ),
  more: (
    <Chip tone={DGE}>
      3 more words
      <span style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 30, height: 30, borderRadius: 9, border: "5px dashed #B7C4D4", display: "inline-block" }} />
        ))}
      </span>
    </Chip>
  ),
  saysName: (
    <Chip tone={LONG}>
      the <span style={{ color: hex(LONG) }}>a</span> says its own name → <span style={{ color: hex(LONG) }}>“ay”</span>
      <span style={{ fontSize: 34 }}>🎵</span>
    </Chip>
  ),
  saysNameU: (
    <Chip tone={LONG}>
      the <span style={{ color: hex(LONG) }}>u</span> says its own name → <span style={{ color: hex(LONG) }}>“yoo”</span>
      <span style={{ fontSize: 34 }}>🎵</span>
    </Chip>
  ),
  noD: (
    <Chip tone={GE}>
      no <Crossed ch="d" /> needed — just <span style={{ color: hex(GE) }}>ge</span>
    </Chip>
  ),
  geAgain: (
    <Chip tone={GE}>
      so we write <span style={{ color: hex(GE) }}>ge</span> again <span style={{ fontSize: 34 }}>✅</span>
    </Chip>
  ),
};

// ── the hook: eight lines, eight things to look at ──────────────────────────
export type GeHookCues = {
  sound1: number; two: number; writeGe: number; writeDge: number;
  sayIt: number; sound2: number; hear: number; hearCage: number; hearBadge: number; same: number;
};

// The opening line, "Listen to this sound at the END of a word", used to play over a bare
// stage for its whole 3.9 seconds. It is the line that says WHERE to listen, so it gets a
// word shape with the last slot ringed.
const EndOfWord: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = ((frame % 34) / 34);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontFamily: font.family }}>
      <span style={{ fontSize: 92, transform: `scale(${1 + 0.09 * Math.sin((frame / fps) * 4)})` }}>👂</span>
      <div style={{ display: "flex", alignItems: "center", gap: 20, perspective: 1400 }}>
        {[0, 1, 2].map((i) => {
          const last = i === 2;
          return (
            <div
              key={i}
              style={{
                position: "relative", width: 130, height: 170, borderRadius: 26,
                background: last ? tint(DGE, 0.9) : "#FFFDF6AA",
                border: `8px ${last ? "solid" : "dashed"} ${last ? hex(DGE) : "#B7A48C"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 76, fontWeight: 700, color: last ? hex(DGE) : "#B7A48C",
                boxShadow: slab(last ? DGE : "8D6E63", last ? 18 : 10),
                transform: `rotateX(10deg) rotateY(${(i - 1) * 5}deg) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
              }}
            >
              {last ? "?" : "•"}
              {/* a ring pulsing off the final slot — this is the one we are listening to */}
              {last && (
                <div style={{ position: "absolute", inset: -8 - ring * 34, borderRadius: 40, border: `7px solid ${hex(DGE)}`, opacity: (1 - ring) * 0.55 }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ background: "#FFFDF6", border: `6px solid ${hex(DGE)}`, borderRadius: 999, padding: "8px 30px", fontSize: 34, fontWeight: 700, color: palette.ink, boxShadow: slab(DGE, 10) }}>
        the <span style={{ color: hex(DGE) }}>END</span> of the word
      </div>
    </div>
  );
};

const SoundBurst: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9 } });
  const ring = ((frame - at) % 30) / 30;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 340, height: 240 }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", width: 190 + ring * 180 + k * 70, height: 190 + ring * 180 + k * 70, borderRadius: "50%", border: `8px solid ${hex(DGE)}`, opacity: (1 - ring) * 0.45 }} />
      ))}
      <div style={{ fontSize: 158, fontWeight: 700, color: hex(DGE), fontFamily: font.family, transform: `perspective(700px) rotateX(10deg) scale(${0.6 + 0.4 * s})`, textShadow: `0 20px 46px ${hex(DGE)}66` }}>j!</div>
    </div>
  );
};

const PicWord: React.FC<{ word: string; emoji: React.ReactNode; color: string; at: number; mark: string; litAt?: number }> = ({ word, emoji, color, at, mark, litAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(color);
  const lit = frame >= litAt;
  const kick = lit ? 1 + 0.14 * Math.max(0, 1 - (frame - litAt) / 18) : 1;
  return (
    <div
      style={{
        background: lit ? tint(color, 0.9) : "#FFFDF6", border: `8px solid ${c}`, borderRadius: 34,
        padding: "18px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        fontFamily: font.family, boxShadow: slab(color, lit ? 20 : 14),
        transform: `perspective(1100px) rotateX(8deg) scale(${(0.76 + 0.24 * s) * kick}) translateY(${bob(frame, fps, 7, 2.4)}px)`,
      }}
    >
      <span style={{ fontSize: 92 }}>{emoji}</span>
      <span style={{ fontSize: 62, fontWeight: 700, color: palette.ink }}>
        {/* only the ge / dge is tinted — never the whole word */}
        {word.slice(0, word.lastIndexOf(mark))}
        <span style={{ color: c }}>{mark}</span>
        {word.slice(word.lastIndexOf(mark) + mark.length)}
      </span>
    </div>
  );
};

export const GeHook: React.FC<{ cues: GeHookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showPair = frame >= cues.hear;
  return (
    <>
      <Band top={92}>
        <Pill size={46} still>
          {showPair ? (<>Same sound &mdash; <span style={{ color: hex(GE) }}>ge</span> and <span style={{ color: hex(DGE) }}>dge</span>!</>) : (<>Listen to the sound at the END 👂</>)}
        </Pill>
      </Band>
      <Center top={352}>
        {showPair ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 120 }}>
            <PicWord word="cage" emoji={<WordArt word="cage" size={92} />} color={GE} at={cues.hear} mark="ge" litAt={cues.hearCage} />
            <PicWord word="badge" emoji="🎖️" color={DGE} at={cues.hear} mark="dge" litAt={cues.hearBadge} />
            {frame >= cues.same && (
              <svg width={420} height={150} style={{ position: "absolute", left: "50%", top: -96, marginLeft: -210 }}>
                <path d="M40 120 q 170 -105 340 0" fill="none" stroke="#FFE9A8" strokeWidth={8} strokeDasharray="14 12" strokeDashoffset={-frame * 1.6} />
                <text x={210} y={52} textAnchor="middle" fontSize={38} fontWeight="700" fill="#FFE9A8" fontFamily={font.family}>same sound!</text>
              </svg>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
            {frame < cues.sound1 ? <EndOfWord /> : <SoundBurst at={frame >= cues.sound2 ? cues.sound2 : cues.sound1} />}
            {frame >= cues.sayIt && frame < cues.hear && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: font.family }}>
                <span style={{ fontSize: 104, transform: `scale(${1 + 0.08 * Math.sin((frame / fps) * 5)})` }}>🗣️</span>
                <span style={{ fontSize: 40, fontWeight: 700, color: palette.ink, background: "#FFFDF6", borderRadius: 999, padding: "8px 26px", boxShadow: slab("C89B3C", 9) }}>your turn — say it!</span>
              </div>
            )}
            {frame >= cues.two && frame < cues.sayIt && (
              // two blank placards, each filling on its OWN spoken spelling
              <div style={{ display: "flex", gap: 34, perspective: 1400 }}>
                {[{ t: "ge", c: GE, at: cues.writeGe }, { t: "dge", c: DGE, at: cues.writeDge }].map((x, i) => {
                  const filled = frame >= x.at;
                  const sp = spring({ frame: frame - x.at, fps, config: { damping: 11 } });
                  return (
                    <div
                      key={x.t}
                      style={{
                        width: 240, height: 200, borderRadius: 30,
                        background: filled ? tint(x.c, 0.9) : "#FFFDF6CC",
                        border: `8px ${filled ? "solid" : "dashed"} ${filled ? hex(x.c) : "#B7A48C"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 92, fontWeight: 700, color: hex(x.c), fontFamily: font.family,
                        boxShadow: filled ? slab(x.c, 20) : slab("8D6E63", 10),
                        transform: `rotateX(10deg) rotateY(${(i - 0.5) * 8}deg) scale(${(filled ? 0.8 + 0.2 * sp : 1) * (frame >= x.at && frame < x.at + 20 ? 1.1 : 1)}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                      }}
                    >
                      {filled ? x.t : "?"}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Center>
    </>
  );
};

// ── "just like ch and tch, look at the letter before it" ────────────────────
export const GeLookBefore: React.FC<{ ruleAt: number }> = ({ ruleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = frame >= ruleAt;
  const glass = interpolate(frame - ruleAt, [0, 34], [230, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {on ? (<>Look at the letter <span style={{ color: hex(SHORT) }}>just before</span> 🔍</>) : (<>How do we know which one to write? 🤔</>)}
        </Pill>
      </Band>
      <Center top={392}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 70, fontFamily: font.family, perspective: 1500 }}>
          {/* split as [before, TARGET, ending] so the glass is anchored to the target letter
              itself — interpolating to the card's centre put it over the g of "cage" */}
          {[{ pre: "c", target: "a", mark: "ge", c: GE }, { pre: "b", target: "a", mark: "dge", c: DGE }].map((w, i) => (
            <div
              key={w.pre + w.mark}
              style={{
                background: "#FFFDF6", border: `8px solid ${hex(w.c)}`, borderRadius: 30,
                padding: "16px 34px", fontSize: 86, fontWeight: 700, color: palette.ink,
                boxShadow: slab(w.c, 16),
                transform: `rotateX(9deg) rotateY(${(i - 0.5) * 7}deg) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
              }}
            >
              {w.pre}
              <span style={{ position: "relative", display: "inline-block" }}>
                {w.target}
                {on && (
                  <svg width={150} height={150} style={{ position: "absolute", left: "50%", top: -34, marginLeft: -75 + glass * (i ? 1 : -1) * 0.4 }}>
                    <circle cx={75} cy={75} r={44} fill="#FFFFFF" opacity={0.3} />
                    <circle cx={75} cy={75} r={44} fill="none" stroke={hex(SHORT)} strokeWidth={9} />
                    <line x1={106} y1={106} x2={132} y2={132} stroke={hex(SHORT)} strokeWidth={12} strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span style={{ color: hex(w.c) }}>{w.mark}</span>
            </div>
          ))}
          {!on && <span style={{ fontSize: 92 }}>🤔</span>}
        </div>
      </Center>
      {/* the callback the script actually makes — this rule is the ch/tch rule again */}
      {on && (
        <GeSwapNote
          top={648}
          notes={[{ at: ruleAt, node: <Chip tone="C89B3C"><span style={{ fontSize: 34 }}>🔁</span>the same question as <span style={{ color: "#1565C0" }}>ch</span> ⚡ <span style={{ color: "#D84315" }}>tch</span></Chip> }]}
        />
      )}
    </>
  );
};

// ── "everywhere else → ge", then the two places ─────────────────────────────
export const GePlaces: React.FC<{ introAt: number; litAt: [number, number] }> = ({ introAt, litAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = [
    { n: "1", t: "after a long vowel", e: "🎵", c: LONG },
    { n: "2", t: "after a consonant", e: "🔤", c: CONS },
  ];
  return (
    <>
      <Band top={92}>
        <Pill size={46}>Everywhere else → write <span style={{ color: hex(GE) }}>ge</span></Pill>
      </Band>
      <Center top={392}>
        {frame < introAt ? (
          <div
            style={{
              background: tint(GE, 0.9), border: `10px solid ${hex(GE)}`, borderRadius: 40,
              padding: "30px 84px", fontSize: 156, fontWeight: 700, color: hex(GE), fontFamily: font.family,
              boxShadow: slab(GE, 26),
              transform: `perspective(1200px) rotateX(11deg) scale(${0.8 + 0.2 * spring({ frame, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 7, 3)}px)`,
            }}
          >
            ge
          </div>
        ) : (
          <div style={{ display: "flex", gap: 60, perspective: 1500 }}>
            {P.map((p, i) => {
              const at = introAt + i * 12;
              if (frame < at) return <div key={p.n} style={{ width: 470 }} />;
              const lit = frame >= litAt[i];
              const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
              return (
                <div
                  key={p.n}
                  style={{
                    width: 470, background: lit ? tint(p.c, 0.9) : "#FFFDF6",
                    border: `8px ${lit ? "solid" : "dashed"} ${lit ? hex(p.c) : "#B7A48C"}`,
                    borderRadius: 34, padding: "26px 20px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: font.family,
                    boxShadow: slab(lit ? p.c : "8D6E63", lit ? 22 : 12),
                    transform: `rotateX(10deg) rotateY(${(i - 0.5) * 7}deg) scale(${(0.84 + 0.16 * s) * (lit ? 1.04 : 1)}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                  }}
                >
                  <span style={{ fontSize: 58 }}>{p.e}</span>
                  <span style={{ fontSize: 46, fontWeight: 700, color: hex(p.c) }}>{p.n}</span>
                  <span style={{ fontSize: 36, fontWeight: 700, color: palette.ink, textAlign: "center" }}>{p.t}</span>
                </div>
              );
            })}
          </div>
        )}
      </Center>
    </>
  );
};

// ── the family: ck ⚡ tch ⚡ dge ─────────────────────────────────────────────
// The payoff of three videos, so it gets the biggest 3D moment: three podiums in perspective,
// one per ending, and the two the child already met arrive wearing the video they came from.
export type FamilyCues = {
  podiums: number; duckAt: number; catchAt: number;
  duckLit: number; catchLit: number; badgeAt: number;
  sameJob: number; helper: number; everywhere: number;
};

const FAMILY = [
  { word: "duck", ending: "ck", tone: "1565C0", emoji: "🦆", from: "c ⚡ k ⚡ ck" },
  { word: "catch", ending: "tch", tone: "D84315", emoji: "🧤", from: "ch ⚡ tch" },
  { word: "badge", ending: "dge", tone: DGE, emoji: "🎖️", from: "this video!" },
];

export const GeFamily: React.FC<{ cues: FamilyCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = [cues.duckAt, cues.catchAt, cues.badgeAt];
  const litAt = [cues.duckLit, cues.catchLit, cues.badgeAt];
  const endings = frame >= cues.sameJob;
  const helper = frame >= cues.helper;
  const every = frame >= cues.everywhere;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {every ? "Spot them everywhere ✨" : helper ? (<>A short vowel needs a <span style={{ color: hex(SHORT) }}>helper</span> 🛡️</>) : endings ? "One family, one job 🤝" : "The whole family 👪"}
        </Pill>
      </Band>

      {/* three podiums, centred but clear of the judge at the left edge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 40, perspective: 1600 }}>
        {FAMILY.map((f, i) => {
          const shown = frame >= at[i];
          const lit = frame >= litAt[i];
          const s = spring({ frame: frame - at[i], fps, config: { damping: 12 } });
          const c = hex(f.tone);
          const cut = f.word.lastIndexOf(f.ending);
          const vowel = f.word.slice(cut - 1, cut);
          return (
            <div key={f.word} style={{ width: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, fontFamily: font.family }}>
              {/* which video this ending came from */}
              <div style={{ height: 46, display: "flex", alignItems: "center", opacity: shown ? 1 : 0 }}>
                <div style={{ background: "#2B1B3D", color: "#FFE9A8", borderRadius: 999, padding: "6px 20px", fontSize: 24, fontWeight: 700, whiteSpace: "nowrap", transform: `translateY(${bob(frame, fps, 4, 2.4, i)}px)` }}>
                  {f.from}
                </div>
              </div>
              {/* an empty placard while the member has not arrived — three bare podiums were
                  a near-empty stage for the 3.3s of "let's put the whole family together" */}
              {!shown && (
                <div
                  style={{
                    width: 300, height: 104, borderRadius: 26, border: "7px dashed #B7A48C",
                    background: "#FFFDF655", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 54, fontWeight: 700, color: "#C8B49C",
                    transform: `rotateX(9deg) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                  }}
                >
                  ?
                </div>
              )}
              {/* the word, with its deciding vowel underlined and its ending tinted */}
              {shown && <div
                style={{
                  position: "relative", background: lit ? tint(f.tone, 0.9) : "#FFFDF6",
                  border: `8px solid ${lit ? c : "#B7A48C"}`, borderRadius: 26, padding: "12px 26px",
                  fontSize: 66, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap",
                  boxShadow: slab(lit ? f.tone : "8D6E63", lit ? 20 : 11),
                  transform: `rotateX(9deg) scale(${(0.76 + 0.24 * s) * (lit ? 1.05 : 1)}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                }}
              >
                <span style={{ fontSize: 46, marginRight: 10 }}>{f.emoji}</span>
                {f.word.slice(0, cut - 1)}
                <span style={helper || every ? { color: hex(SHORT), borderBottom: `7px solid ${hex(SHORT)}`, paddingBottom: 1 } : undefined}>{vowel}</span>
                <span style={{ color: c }}>{f.ending}</span>
                {every && (
                  <span style={{ position: "absolute", right: -18, top: -22, fontSize: 38, transform: `rotate(${wiggle(frame, fps, 3, 12, i)}deg)` }}>✨</span>
                )}
              </div>}
              {/* the helper's own row, always reserved, so it never lands on the badge above */}
              <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {helper && (
                  <span style={{ fontSize: 40, transform: `scale(${spring({ frame: frame - cues.helper - i * 5, fps, config: { damping: 10 } })}) translateY(${bob(frame, fps, 5, 3, i)}px)` }}>
                    ↑🛡️
                  </span>
                )}
              </div>
              {/* the podium — a lit tread and a slab body, in perspective */}
              <div style={{ width: 300, opacity: frame >= cues.podiums ? 1 : 0 }}>
                <div style={{ height: 26, borderRadius: 8, background: lit ? `linear-gradient(180deg, ${c}, ${c})` : "linear-gradient(180deg, #A9704A, #8D5A3B)", transform: "rotateX(52deg)", transformOrigin: "bottom center", boxShadow: lit ? `0 0 34px ${c}88` : "none" }} />
                <div style={{ height: 74, borderRadius: 10, background: "linear-gradient(180deg, #8D5A3B, #5E3A24)", boxShadow: "0 10px 0 #4E2F1C, 0 22px 34px rgba(10,6,20,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 54, fontWeight: 700, color: endings ? c : "#C89B3C", transition: "none" }}>{endings ? f.ending : "?"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* one swap row: same job → the helper idea → spot them everywhere */}
      <GeSwapNote
        top={676}
        notes={[
          { at: cues.sameJob, node: <Chip tone="C89B3C" size={36}><span style={{ color: "#1565C0" }}>ck</span> · <span style={{ color: "#D84315" }}>tch</span> · <span style={{ color: hex(DGE) }}>dge</span> — all the same job! 🤝</Chip> },
          { at: cues.helper, node: <Chip tone={SHORT} size={36}>a <span style={{ color: hex(SHORT) }}>short vowel</span> at the end needs a helper 🛡️</Chip> },
          { at: cues.everywhere, node: <Chip tone="2E7D32" size={36}>now you can spot them everywhere ✨</Chip> },
        ]}
      />
    </>
  );
};

// ── the good news: dge has NO rule breakers ────────────────────────────────
export type GoodNewsCues = {
  best: number; nine: number; zero: number; longWords: number; villageAt: number; messageAt: number;
  endings: number; quiet: number; trust: number;
};

export const GeGoodNews: React.FC<{ cues: GoodNewsCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nine = frame >= cues.nine;
  const zero = frame >= cues.zero;
  const long = frame >= cues.longWords;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {long ? (<>Longer words take just <span style={{ color: hex(GE) }}>ge</span></>) : zero ? (<><span style={{ color: hex(DGE) }}>dge</span> has NO rule breakers! 🎉</>) : nine ? (<><span style={{ color: "#1565C0" }}>ch</span> ⚡ <span style={{ color: "#D84315" }}>tch</span> had nine to learn ⚠️</>) : "And here is the best part 🎁"}
        </Pill>
      </Band>
      <Center top={368}>
        {!long ? (
          <div style={{ display: "flex", alignItems: "center", gap: 60, fontFamily: font.family, perspective: 1500 }}>
            {/* the nine, remembered from the last video — then swept away */}
            {!nine ? (
              <span style={{ fontSize: 190, transform: `scale(${0.6 + 0.4 * spring({ frame: frame - cues.best, fps, config: { damping: 9 } })}) rotate(${wiggle(frame, fps, 2, 4)}deg)` }}>🎁</span>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: zero ? 0.4 : 1 }}>
                  <div style={{ background: "#C62828", color: "#fff", borderRadius: 20, padding: "10px 30px", fontSize: 34, fontWeight: 700, letterSpacing: 1.5, boxShadow: slab("C62828", 12) }}>⚠️ ch ⚡ tch</div>
                  <div style={{ display: "flex", gap: 12, position: "relative" }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} style={{ width: 62, height: 62, borderRadius: 14, background: "#FFFDF6", border: "5px solid #C62828", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, color: "#C62828", boxShadow: slab("C62828", 8), transform: `rotateX(10deg) scale(${spring({ frame: frame - cues.nine - i * 4, fps, config: { damping: 10 } })})` }}>{i + 1}</div>
                    ))}
                    {zero && (
                      <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                        <line x1="0" y1="10%" x2={`${interpolate(frame - cues.zero, [0, 16], [0, 100], { extrapolateRight: "clamp" })}%`} y2="90%" stroke="#C62828" strokeWidth={12} strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                </div>
                {zero && (
                  <>
                    <span style={{ fontSize: 56, color: "#FFE9A8" }}>→</span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, transform: `scale(${0.7 + 0.3 * spring({ frame: frame - cues.zero, fps, config: { damping: 9 } })})` }}>
                      <div style={{ background: tint(DGE, 0.9), color: hex(DGE), border: `8px solid ${hex(DGE)}`, borderRadius: 24, padding: "8px 34px", fontSize: 44, fontWeight: 700, boxShadow: slab(DGE, 16) }}>dge</div>
                      <div style={{ background: "#2E7D32", color: "#fff", borderRadius: 22, padding: "10px 40px", fontSize: 62, fontWeight: 700, boxShadow: slab("2E7D32", 16), transform: `translateY(${bob(frame, fps, 6, 2.6)}px)` }}>0 ✅</div>
                      <span style={{ fontSize: 32, fontWeight: 700, color: "#FFE9A8" }}>none to learn!</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          // the longer words, their quiet endings, and the promise you can trust
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, fontFamily: font.family }}>
            <div style={{ display: "flex", gap: 60, perspective: 1500 }}>
              {[{ w: "village", e: "🏘️", at: cues.villageAt }, { w: "message", e: "✉️", at: cues.messageAt }].map((x, i) => {
                const ringing = frame >= cues.endings;
                // the sentence names them one after the other; a pair that both appear on the
                // phrase onset left 6.7s with nothing new to look at
                if (frame < x.at) return <div key={x.w} style={{ width: 420 }} />;
                return (
                  <div
                    key={x.w}
                    style={{
                      position: "relative", background: "#FFFDF6", border: `8px solid ${hex(GE)}`, borderRadius: 30,
                      padding: "16px 34px", display: "flex", alignItems: "center", gap: 18,
                      fontSize: 62, fontWeight: 700, color: palette.ink, boxShadow: slab(GE, ringing ? 20 : 14),
                      transform: `rotateX(9deg) rotateY(${(i - 0.5) * 7}deg) scale(${0.8 + 0.2 * spring({ frame: frame - x.at, fps, config: { damping: 12 } })}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                    }}
                  >
                    <span style={{ fontSize: 54 }}>{x.e}</span>
                    {x.w.slice(0, -2)}
                    <span style={{ color: hex(GE), marginLeft: -14, borderBottom: ringing ? `7px solid ${hex(GE)}` : "none" }}>ge</span>
                    {ringing && (
                      <span style={{ position: "absolute", right: -34, top: -74, fontSize: 86, transform: `scale(${1 + 0.14 * Math.sin((frame / fps) * 6 + i)}) rotate(${wiggle(frame, fps, 3, 6, i)}deg)` }}>👂</span>
                    )}
                  </div>
                );
              })}
            </div>
            <FlowNote
              notes={[
                { at: cues.longWords, node: null },
                { at: cues.quiet, node: <Chip tone={GE} size={36}><span style={{ fontSize: 36 }}>🔉</span>these endings sound <span style={{ color: hex(GE) }}>quiet and soft</span></Chip> },
                { at: cues.trust, node: <Chip tone="2E7D32" size={36}><span style={{ fontSize: 36 }}>🤝</span>in short words, trust <span style={{ color: hex(DGE) }}>dge</span> every time</Chip> },
              ]}
            />
          </div>
        )}
      </Center>
    </>
  );
};

// ── the two see-it summary lines ────────────────────────────────────────────
export const GeSeeItNote: React.FC<{ vowelAt: number; clearAt: number; casesAt: [number, number] }> = ({ vowelAt, clearAt, casesAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cases = frame >= casesAt[0];
  if (frame < vowelAt || (frame >= clearAt && !cases)) return null;
  const s = spring({ frame: frame - (cases ? casesAt[0] : vowelAt), fps, config: { damping: 11 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 812, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      {cases ? (
        <div style={{ display: "flex", gap: 20, transform: `scale(${0.86 + 0.14 * s})` }}>
          {([["🎵", "a long vowel", LONG], ["🔤", "a consonant", CONS]] as const).map(([e, t, c], i) => {
            const on = frame >= casesAt[i];
            return (
              <div key={t} style={{ background: on ? tint(c, 0.88) : "#FFFDF6", border: `5px solid ${on ? hex(c) : "#B7A48C"}`, borderRadius: 999, padding: "6px 24px", display: "flex", alignItems: "center", gap: 10, fontSize: 32, fontWeight: 700, color: palette.ink, fontFamily: font.family, opacity: on ? 1 : 0.55, transform: `scale(${on ? 1.06 : 1}) translateY(${bob(frame, fps, 5, 2.2, i)}px)` }}>
                <span style={{ fontSize: 34 }}>{e}</span>after {t} → <span style={{ color: hex(GE) }}>ge</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "#FFFDF6", border: `5px solid ${hex(SHORT)}`, borderRadius: 999, padding: "8px 30px", fontSize: 34, fontWeight: 700, color: palette.ink, fontFamily: font.family, whiteSpace: "nowrap", transform: `scale(${0.86 + 0.14 * s})` }}>
          every one: <span style={{ color: hex(SHORT), borderBottom: `6px solid ${hex(SHORT)}` }}>short vowel</span> + <span style={{ color: hex(DGE) }}>dge</span>
        </div>
      )}
    </div>
  );
};

// ── the recap's closing line, which the shared recap has no slot for ────────
export const GeNoTricky: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9 } });
  return (
    // In the HEADLINE BAND: the recap block runs 215…615 and ends on its own logo badge, so a
    // stamp below it landed on the logo. The band is empty for the whole recap.
    <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "12px 44px",
          fontSize: 42, fontWeight: 700, fontFamily: font.family, whiteSpace: "nowrap",
          boxShadow: slab("2E7D32", 16),
          transform: `scale(${0.6 + 0.4 * s}) rotate(${wiggle(frame, fps, 2, 1.4)}deg)`,
        }}
      >
        ⭐ and no tricky words at all!
      </div>
    </div>
  );
};

export { Placard };
