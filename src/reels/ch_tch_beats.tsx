import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { Band, Center, Pill } from "../components/LandscapeBeatKit";
import { TilePart, WordTiles } from "../components/WordTiles";
import { hex, palette, tint, font } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// Beats for ch/tch. The rule here is not about WHERE the sound sits, so there is no
// three-position row: every teaching beat is a word built from tiles with the letter before
// the sound spotlighted (WordTiles).
//
// The rule-breaker stretch is 128 seconds — the longest single idea in any of these videos —
// so it runs as three staged beats, and each one advances on every line of narration.

const CH = "1565C0";
const TCH = "D84315";

// ── the hook: eight lines, eight things to look at ──────────────────────────
export type HookCues = {
  sound1: number; two: number; write: number; writeCh: number; writeTch: number;
  sayIt: number; sound2: number; hear: number; hearChair: number; hearCatch: number; same: number;
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
        <div key={k} style={{ position: "absolute", width: 190 + ring * 180 + k * 70, height: 190 + ring * 180 + k * 70, borderRadius: "50%", border: `8px solid ${hex(TCH)}`, opacity: (1 - ring) * 0.45 }} />
      ))}
      <div style={{ fontSize: 150, fontWeight: 700, color: hex(TCH), fontFamily: font.family, transform: `scale(${0.6 + 0.4 * s})`, textShadow: `0 16px 40px ${hex(TCH)}55` }}>ch!</div>
    </div>
  );
};

const PicWord: React.FC<{ word: string; emoji: string; color: string; at: number; mark: string; litAt?: number }> = ({ word, emoji, color, at, mark, litAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(color);
  const lit = frame >= litAt;
  const kick = lit ? 1 + 0.14 * Math.max(0, 1 - (frame - litAt) / 18) : 1;
  return (
    <div style={{ background: lit ? tint(color, 0.9) : "#FFFFFFF2", border: `8px solid ${c}`, borderRadius: 34, padding: "18px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: font.family, transform: `scale(${(0.76 + 0.24 * s) * kick}) translateY(${bob(frame, fps, 7, 2.4)}px)`, boxShadow: lit ? `0 22px 52px ${c}66` : `0 18px 44px ${c}44` }}>
      <span style={{ fontSize: 92 }}>{emoji}</span>
      <span style={{ fontSize: 62, fontWeight: 700, color: palette.ink }}>
        {/* only the ch / tch is tinted — colouring from an index painted whole words */}
        {word.slice(0, word.indexOf(mark))}
        <span style={{ color: c }}>{mark}</span>
        {word.slice(word.indexOf(mark) + mark.length)}
      </span>
    </div>
  );
};

export const ChHook: React.FC<{ data: PhonicsComparison; cues: HookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showPair = frame >= cues.hear;
  return (
    <>
      <Band top={92}>
        <Pill size={46} still>
          {showPair ? (<>Same sound &mdash; <span style={{ color: hex(CH) }}>ch</span> and <span style={{ color: hex(TCH) }}>tch</span>!</>) : (<>Listen to this sound 👂</>)}
        </Pill>
      </Band>
      <Center top={352}>
        {showPair ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 120 }}>
            <PicWord word="chair" emoji="🪑" color={CH} at={cues.hear} mark="ch" litAt={cues.hearChair} />
            <PicWord word="catch" emoji="🧤" color={TCH} at={cues.hear} mark="tch" litAt={cues.hearCatch} />
            {frame >= cues.same && (
              <svg width={420} height={150} style={{ position: "absolute", left: "50%", top: -96, marginLeft: -210 }}>
                <path d="M40 120 q 170 -105 340 0" fill="none" stroke="#2E7D32" strokeWidth={8} strokeDasharray="14 12" strokeDashoffset={-frame * 1.6} />
                <text x={210} y={52} textAnchor="middle" fontSize={38} fontWeight="700" fill="#2E7D32" fontFamily={font.family}>same sound!</text>
              </svg>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
            <SoundBurst at={frame >= cues.sound2 ? cues.sound2 : cues.sound1} />
            {frame >= cues.sayIt && frame < cues.hear && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: font.family }}>
                <span style={{ fontSize: 104, transform: `scale(${1 + 0.08 * Math.sin((frame / fps) * 5)})` }}>🗣️</span>
                <span style={{ fontSize: 40, fontWeight: 700, color: palette.ink, background: "#FFFFFFE8", borderRadius: 999, padding: "8px 26px" }}>your turn — say it!</span>
              </div>
            )}
            {frame >= cues.two && frame < cues.sayIt && (
              <div style={{ display: "flex", gap: 34 }}>
                {[{ t: "ch", c: CH }, { t: "tch", c: TCH }].map((x, i) => {
                  const at = i === 0 ? cues.writeCh : cues.writeTch;
                  const filled = frame >= at;
                  const sp = spring({ frame: frame - at, fps, config: { damping: 11 } });
                  return (
                    <div key={x.t} style={{ width: 230, height: 200, borderRadius: 30, background: filled ? tint(x.c, 0.9) : "#FFFFFFCC", border: `8px ${filled ? "solid" : "dashed"} ${filled ? hex(x.c) : "#B7C4D4"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 92, fontWeight: 700, color: hex(x.c), fontFamily: font.family, transform: `scale(${(filled ? 0.8 + 0.2 * sp : 1) * (frame >= at && frame < at + 20 ? 1.1 : 1)}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`, boxShadow: filled ? `0 18px 44px ${hex(x.c)}44` : "none" }}>
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

export const ChLookBefore: React.FC<{ beat: Beat; ruleAt: number }> = ({ ruleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = frame >= ruleAt;
  const glass = interpolate(frame - ruleAt, [0, 34], [230, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {on ? (<>Look at the letter <span style={{ color: "#D81B60" }}>just before</span> 🔍</>) : (<>How do we know which one to write? 🤔</>)}
        </Pill>
      </Band>
      <Center top={400}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 70, fontFamily: font.family }}>
          {[{ word: "chair", mark: "ch", c: CH }, { word: "catch", mark: "tch", c: TCH }].map((w, i) => (
            <div key={w.word} style={{ position: "relative", background: "#FFFFFFF2", border: `8px solid ${hex(w.c)}`, borderRadius: 30, padding: "16px 34px", fontSize: 86, fontWeight: 700, color: palette.ink, boxShadow: `0 16px 40px ${hex(w.c)}44`, transform: `translateY(${bob(frame, fps, 6, 2.4, i)}px)` }}>
              {w.word.slice(0, w.word.indexOf(w.mark))}
              <span style={{ color: hex(w.c) }}>{w.mark}</span>
              {w.word.slice(w.word.indexOf(w.mark) + w.mark.length)}
              {on && (
                <svg width={150} height={150} style={{ position: "absolute", left: "50%", top: -50, marginLeft: -75 + glass * (i ? 1 : -1) * 0.4 }}>
                  <circle cx={75} cy={75} r={44} fill="#FFFFFF" opacity={0.28} />
                  <circle cx={75} cy={75} r={44} fill="none" stroke="#D81B60" strokeWidth={9} />
                  <line x1={106} y1={106} x2={132} y2={132} stroke="#D81B60" strokeWidth={12} strokeLinecap="round" />
                </svg>
              )}
            </div>
          ))}
          {!on && <span style={{ fontSize: 92 }}>🤔</span>}
        </div>
      </Center>
    </>
  );
};

export type CaseCues = {
  introAt?: number;   // "The first is at the start of a word" / "Here is the rule"
  ruleAt?: number;    // the generic [short vowel] + [tch] diagram
  build: number; done: number; label: number; more: number[]; allAt: number;
};

export const ChCase: React.FC<{
  headline: React.ReactNode; base: TilePart[]; endingColor: string;
  focusLabel?: string; focusColor?: string; cues: CaseCues;
  examples: { parts: TilePart[]; emoji: string }[]; allWords?: string[];
  baseEmoji?: string; introNode?: React.ReactNode;
}> = ({ headline, base, endingColor, focusLabel, focusColor, cues, examples, allWords, baseEmoji, introNode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = -1;
  for (let i = 0; i < cues.more.length; i++) if (frame >= cues.more[i]) idx = i;
  const showAll = allWords && frame >= cues.allAt;
  const preRule = cues.ruleAt !== undefined && frame >= cues.ruleAt && frame < cues.build;
  const preIntro = cues.introAt !== undefined && frame >= cues.introAt && frame < (cues.ruleAt ?? cues.build);
  const parts = idx < 0 ? base : examples[idx].parts;
  const emoji = idx < 0 ? baseEmoji ?? "" : examples[idx].emoji;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>{headline}</Pill>
      </Band>
      {preIntro || preRule ? (
        <Center top={400}>
          {preRule ? (
            // the rule itself, before any example word — this stretch used to be blank
            <div style={{ display: "flex", alignItems: "center", gap: 26, fontFamily: font.family }}>
              <div style={{ background: "#FFF8E1", border: `8px solid ${hex(focusColor ?? "D81B60")}`, color: hex(focusColor ?? "D81B60"), borderRadius: 30, padding: "20px 40px", fontSize: 58, fontWeight: 700, whiteSpace: "nowrap", transform: `translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
                short vowel
              </div>
              <span style={{ fontSize: 60, color: palette.inkSoft }}>+</span>
              <div style={{ background: tint(endingColor, 0.88), border: `8px solid ${hex(endingColor)}`, color: hex(endingColor), borderRadius: 30, padding: "20px 46px", fontSize: 72, fontWeight: 700, transform: `translateY(${bob(frame, fps, 6, 2.4, 1)}px)` }}>
                {base[base.length - 1].text}
              </div>
              <span style={{ fontSize: 54 }}>✅</span>
            </div>
          ) : (
            introNode
          )}
        </Center>
      ) : showAll ? (
        <Center top={400}>
          <div style={{ display: "flex", gap: 30 }}>
            {allWords!.map((w, i) => (
              <VowelWord key={w} word={w} at={cues.allAt + i * 6} ending={base[base.length - 1].text} tone={endingColor} />
            ))}
          </div>
        </Center>
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
          emoji={emoji}
        />
      )}
    </>
  );
};

export const ChPlaces: React.FC<{ litAt: [number, number, number]; introAt: number; bigAt?: number }> = ({ litAt, introAt, bigAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = [
    { n: "1", t: "at the start", e: "🚩" },
    { n: "2", t: "after a consonant", e: "🔤" },
    { n: "3", t: "after a long vowel", e: "🎵" },
  ];
  return (
    <>
      <Band top={92}>
        <Pill size={46}>Everywhere else → write <span style={{ color: hex(CH) }}>ch</span></Pill>
      </Band>
      <Center top={400}>
        {/* "In every other place, we simply write ch" used to sit on an empty stage */}
        {frame < introAt ? (
          <div style={{ background: tint(CH, 0.9), border: `10px solid ${hex(CH)}`, borderRadius: 40, padding: "30px 80px", fontSize: 150, fontWeight: 700, color: hex(CH), fontFamily: font.family, transform: `scale(${0.8 + 0.2 * spring({ frame: frame - bigAt, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 7, 3)}px)`, boxShadow: `0 22px 54px ${hex(CH)}55` }}>
            ch
          </div>
        ) : (
        <div style={{ display: "flex", gap: 44 }}>
          {P.map((p, i) => {
            const at = introAt + i * 10;
            if (frame < at) return <div key={p.n} style={{ width: 400 }} />;
            const lit = frame >= litAt[i];
            const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
            const c = hex(CH);
            return (
              <div key={p.n} style={{ width: 400, background: lit ? tint(CH, 0.9) : "#FFFFFFE8", border: `8px ${lit ? "solid" : "dashed"} ${lit ? c : "#B7C4D4"}`, borderRadius: 34, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: font.family, transform: `scale(${(0.84 + 0.16 * s) * (lit ? 1.04 : 1)}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`, boxShadow: lit ? `0 18px 44px ${c}55` : "0 10px 26px rgba(20,40,20,0.2)" }}>
                <span style={{ fontSize: 54 }}>{p.e}</span>
                <span style={{ fontSize: 44, fontWeight: 700, color: lit ? c : palette.inkSoft }}>{p.n}</span>
                <span style={{ fontSize: 32, fontWeight: 700, color: palette.ink, textAlign: "center" }}>{p.t}</span>
              </div>
            );
          })}
        </div>
        )}
      </Center>
    </>
  );
};

// the card each of the three ch beats opens on, so the naming line has something to show
export const PlaceCard: React.FC<{ n: string; label: string; emoji: string }> = ({ n, label, emoji }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(CH);
  return (
    <div style={{ background: tint(CH, 0.9), border: `9px solid ${c}`, borderRadius: 38, padding: "28px 56px", display: "flex", alignItems: "center", gap: 26, fontFamily: font.family, transform: `scale(${0.86 + 0.14 * spring({ frame, fps, config: { damping: 12 } })}) translateY(${bob(frame, fps, 6, 2.6)}px)`, boxShadow: `0 20px 48px ${c}55` }}>
      <span style={{ fontSize: 70 }}>{emoji}</span>
      <span style={{ fontSize: 64, fontWeight: 700, color: c }}>{n}</span>
      <span style={{ fontSize: 52, fontWeight: 700, color: palette.ink }}>{label}</span>
    </div>
  );
};

// the two see-it lines that summarise a board — they had no visual of their own
export const ChSeeItNote: React.FC<{ vowelAt: number; clearAt: number; casesAt: number[] }> = ({ vowelAt, clearAt, casesAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cases = frame >= casesAt[0];
  // the tch note goes away when the ch board takes over
  if (frame < vowelAt || (frame >= clearAt && !cases)) return null;
  const s = spring({ frame: frame - (cases ? casesAt[0] : vowelAt), fps, config: { damping: 11 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 812, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      {cases ? (
        <div style={{ display: "flex", gap: 18, transform: `scale(${0.86 + 0.14 * s})` }}>
          {[["🚩", "the start"], ["🔤", "a consonant"], ["🎵", "a long vowel"]].map(([e, t], i) => {
            const on = frame >= casesAt[i];
            return (
            <div key={t} style={{ background: on ? tint(CH, 0.88) : "#FFFFFFF2", border: `5px solid ${on ? hex(CH) : "#B7C4D4"}`, borderRadius: 999, padding: "6px 22px", display: "flex", alignItems: "center", gap: 10, fontSize: 30, fontWeight: 700, color: palette.ink, fontFamily: font.family, opacity: on ? 1 : 0.5, transform: `scale(${on ? 1.06 : 1}) translateY(${bob(frame, fps, 5, 2.2, i)}px)` }}>
              <span style={{ fontSize: 32 }}>{e}</span>{t}
            </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "#FFF8E1", border: "5px solid #D81B60", borderRadius: 999, padding: "8px 30px", fontSize: 34, fontWeight: 700, color: palette.ink, fontFamily: font.family, whiteSpace: "nowrap", transform: `scale(${0.86 + 0.14 * s})` }}>
          every one: <span style={{ color: "#D81B60", borderBottom: "6px solid #D81B60" }}>short vowel</span> + <span style={{ color: hex(TCH) }}>tch</span>
        </div>
      )}
    </div>
  );
};

export const ChVowelChart: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: font.family, background: "#FFFFFFE8", borderRadius: 999, padding: "10px 28px", opacity: interpolate(frame - at, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: palette.inkSoft }}>vowels</span>
        {"aeiou".split("").map((v, i) => (
          <div key={v} style={{ width: 60, height: 60, borderRadius: 15, background: "#FFF8E1", border: "5px solid #FFB300", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: "#F57F17", transform: `translateY(${bob(frame, fps, 5, 2.2, i)}px)` }}>{v}</div>
        ))}
        <span style={{ fontSize: 30, fontWeight: 700, color: "#6A1B9A" }}>· everything else is a consonant</span>
      </div>
    </div>
  );
};

export const ChBreakIntro: React.FC<{ breakAt: number; nameAt: number; nineAt: number }> = ({ breakAt, nameAt, nineAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const crack = frame >= breakAt, named = frame >= nameAt, nine = frame >= nineAt;
  const s = spring({ frame: frame - breakAt, fps, config: { damping: 9 } });
  return (
    <>
      <Band top={96}>
        <Pill size={50}>{nine ? (<>There are <span style={{ color: hex(TCH) }}>nine</span> to learn ⭐</>) : named ? "Meet the rule breakers 📋" : "But watch out! ⚠️"}</Pill>
      </Band>
      <Center top={392}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, fontFamily: font.family }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: crack ? 30 : 0 }}>
            {["short vowel →", "tch"].map((t, i) => (
              <div key={t} style={{ background: "#FFFFFFF2", border: `8px solid ${hex(TCH)}`, borderRadius: 26, padding: "16px 30px", fontSize: 54, fontWeight: 700, color: i ? hex(TCH) : palette.ink, transform: `rotate(${crack ? (i ? 5 : -5) * s : 0}deg) translateY(${crack ? s * (i ? 10 : -10) : 0}px)`, boxShadow: `0 14px 34px ${hex(TCH)}44` }}>{t}</div>
            ))}
            {crack && <span style={{ position: "absolute", left: "50%", marginLeft: -30, fontSize: 62, transform: `scale(${s})` }}>💥</span>}
          </div>
          {named && (
            <div style={{ background: "#C62828", color: "#fff", borderRadius: 22, padding: "12px 40px", fontSize: 46, fontWeight: 700, letterSpacing: 2, transform: `scale(${spring({ frame: frame - nameAt, fps, config: { damping: 10 } })}) rotate(${wiggle(frame, fps, 2, 1.6)}deg)`, boxShadow: "0 16px 40px rgba(198,40,40,0.45)" }}>⚠️ THE RULE BREAKERS</div>
          )}
          {nine && (
            <div style={{ display: "flex", gap: 14 }}>
              {Array.from({ length: 9 }).map((_, i) => {
                const at = nineAt + i * 5;
                return (
                  <div key={i} style={{ width: 68, height: 68, borderRadius: 16, background: frame >= at ? tint(CH, 0.86) : "#FFFFFFAA", border: `5px ${frame >= at ? "solid" : "dashed"} ${frame >= at ? hex(CH) : "#B7C4D4"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: hex(CH), transform: `scale(${frame >= at ? spring({ frame: frame - at, fps, config: { damping: 10 } }) : 0.8})` }}>{i + 1}</div>
                );
              })}
            </div>
          )}
        </div>
      </Center>
    </>
  );
};

// a small word card used all through the rule-breaker beats
const BreakerCard: React.FC<{
  word: string; at: number; lit: boolean; scale?: number; suitcase?: boolean; openAt?: number; tone?: string;
}> = ({ word, at, lit, scale = 1, suitcase = false, openAt = -1, tone = CH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(tone);
  const cut = word.lastIndexOf(tone === CH ? "ch" : "tch");
  const open = openAt > 0 && frame >= openAt;
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${(0.7 + 0.3 * s) * scale}) translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
      <div
        style={{
          background: lit ? tint(tone, 0.88) : "#FFFFFFF2", border: `6px solid ${lit ? c : tint(tone, 0.5)}`,
          borderRadius: 26, padding: "12px 26px", fontSize: 58, fontWeight: 700, fontFamily: font.family,
          color: palette.ink, whiteSpace: "nowrap",
          boxShadow: lit ? `0 16px 38px ${c}55` : "0 10px 26px rgba(20,40,20,0.22)",
        }}
      >
        {/* the vowel right before the ending is the whole point of the rule — underline it */}
        {word.slice(0, cut - 1)}
        <span style={lit ? { color: "#D81B60", borderBottom: "6px solid #D81B60", paddingBottom: 1 } : undefined}>
          {word.slice(cut - 1, cut)}
        </span>
        <span style={{ color: c }}>{tone === CH ? "ch" : "tch"}</span>
        {word.slice(cut + (tone === CH ? 2 : 3))}
      </div>
      {/* the travellers carry their spelling in a case, and it opens to show ch inside */}
      {suitcase && (
        <svg width={78} height={62} style={{ marginTop: -2 }}>
          <rect x={10} y={16} width={58} height={40} rx={7} fill="#8D6E63" />
          <rect x={10} y={16} width={58} height={10} rx={5} fill="#A1887F" />
          <rect x={31} y={6} width={16} height={12} rx={5} fill="none" stroke="#6D4C41" strokeWidth={5} />
          {open && (
            <text x={39} y={48} textAnchor="middle" fontSize={26} fontWeight="700" fill="#1565C0" fontFamily={font.family}>
              ch
            </text>
          )}
        </svg>
      )}
    </div>
  );
};

// a word with its short vowel underlined and its ending tinted
export const VowelWord: React.FC<{ word: string; at: number; ending: string; tone: string }> = ({ word, at, ending, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  const c = hex(tone);
  const stem = word.slice(0, word.length - ending.length);
  const vowel = stem.slice(-1);
  return (
    <div style={{ background: "#FFFFFFF2", border: `7px solid ${c}`, borderRadius: 28, padding: "14px 30px", fontSize: 66, fontWeight: 700, fontFamily: font.family, color: palette.ink, whiteSpace: "nowrap", transform: `scale(${0.74 + 0.26 * s}) translateY(${bob(frame, fps, 6, 2.4)}px)`, boxShadow: `0 16px 40px ${c}44` }}>
      {stem.slice(0, -1)}
      <span style={{ color: "#D81B60", borderBottom: "8px solid #D81B60", paddingBottom: 2 }}>{vowel}</span>
      <span style={{ color: c }}>{ending}</span>
    </div>
  );
};

// ── the four little words ────────────────────────────────────────────────────
export type FourCues = {
  words: [number, number, number, number]; // much · such · rich · which
  shouldTake: number;   // "All four have short vowels, so they should take tch."
  butNot: number;       // "But they don't!"
  why: number;          // "So why are they different?"
  older: number;        // "These four are older than the rule!"
  longAgo: number;      // "People were writing them a very long time ago."
  ruleCame: number;     // "The rule came along later…"
  trick: number;        // "Here is a trick…"
  pairs: number;        // "They go together in two pairs that rhyme."
  pairA: number;        // "Much and such."
  pairB: number;        // "Rich and which."
  stick: number;        // "Say them in pairs, and they will stay in your head."
};

export const ChFour: React.FC<{ beat: Beat; cues: FourCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = ["much", "such", "rich", "which"];
  const anyCard = frame >= cues.words[0];
  const paired = frame >= cues.pairs;
  const oldStory = frame >= cues.older && frame < cues.trick;
  const stamp = spring({ frame: frame - cues.older, fps, config: { damping: 9 } });
  const ruleIn = spring({ frame: frame - cues.ruleCame, fps, config: { damping: 12 } });

  return (
    <>
      <Band top={88}>
        <Pill size={44}>
          {frame >= cues.trick ? "Two pairs that rhyme 🎵" : frame >= cues.why ? "Why are they different? 🤔" : "Four little rule breakers ⚠️"}
        </Pill>
      </Band>

      <Center top={352}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          {/* the four cards. Once the rhyme is named they pull into two pairs with a link. */}
          {!anyCard && (
            <div style={{ display: "flex", gap: 30 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ width: 210, height: 104, borderRadius: 26, border: "6px dashed #B7C4D4", background: "#FFFFFFAA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 700, color: "#B7C4D4", fontFamily: font.family, transform: `translateY(${bob(frame, fps, 5, 2.4, i)}px)` }}>{i + 1}</div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: paired ? 70 : 30 }}>
            {[0, 1].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: paired ? 10 : 30 }}>
                {[0, 1].map((k) => {
                  const i = p * 2 + k;
                  const litPair = (p === 0 && frame >= cues.pairA) || (p === 1 && frame >= cues.pairB);
                  return (
                    <React.Fragment key={i}>
                      <BreakerCard word={W[i]} at={cues.words[i]} lit={litPair} scale={paired && litPair ? 1.06 : 1} />
                      {paired && k === 0 && (
                        <span style={{ fontSize: 40, opacity: litPair ? 1 : 0.4 }}>🎵</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>

          {/* they SHOULD take tch — shown, then crossed out */}
          {frame >= cues.shouldTake && frame < cues.why && (
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: font.family }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: palette.inkSoft }}>short vowels → should be</span>
              <div style={{ position: "relative", background: "#fff", border: `6px solid ${hex(TCH)}`, color: hex(TCH), borderRadius: 22, padding: "6px 26px", fontSize: 52, fontWeight: 700, opacity: frame >= cues.butNot ? 0.55 : 1 }}>
                tch
                {frame >= cues.butNot && (
                  <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
                    <line x1="6%" y1="12%" x2="94%" y2="88%" stroke="#C62828" strokeWidth={9} strokeLinecap="round" />
                  </svg>
                )}
              </div>
              {frame >= cues.butNot && (
                <>
                  <span style={{ fontSize: 40 }}>➜</span>
                  <div style={{ background: hex(CH), color: "#fff", borderRadius: 22, padding: "6px 30px", fontSize: 52, fontWeight: 700, transform: `scale(${spring({ frame: frame - cues.butNot, fps, config: { damping: 10 } })})` }}>ch</div>
                </>
              )}
            </div>
          )}

          {/* the story: these four were here BEFORE the rule */}
          {oldStory && (
            <div style={{ display: "flex", alignItems: "center", gap: 30, fontFamily: font.family }}>
              <div style={{ background: "#FFF3E0", border: "6px dashed #8D6E63", color: "#5D4037", borderRadius: 26, padding: "12px 30px", fontSize: 40, fontWeight: 700, whiteSpace: "nowrap", transform: `scale(${0.8 + 0.2 * stamp}) rotate(${(1 - stamp) * -6}deg)` }}>
                📜 we were here first!
              </div>
              {/* "People were writing them a very long time ago" — a quill actually writing */}
              {frame >= cues.longAgo && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 54, transform: `rotate(${Math.sin((frame - cues.longAgo) / 5) * 14}deg)` }}>🪶</span>
                  <span style={{ fontSize: 34, fontWeight: 700, color: "#5D4037", background: "#FFF8E1", borderRadius: 999, padding: "6px 20px", whiteSpace: "nowrap" }}>
                    written long, long ago
                  </span>
                </div>
              )}
              {frame >= cues.ruleCame && (
                <>
                  <span style={{ fontSize: 36, color: palette.inkSoft }}>…then</span>
                  <div style={{ background: "#fff", border: `6px solid ${hex(TCH)}`, color: hex(TCH), borderRadius: 26, padding: "12px 28px", fontSize: 38, fontWeight: 700, whiteSpace: "nowrap", opacity: ruleIn, transform: `translateX(${(1 - ruleIn) * 70}px)` }}>
                    the tch rule arrived
                  </div>
                </>
              )}
            </div>
          )}

          {frame >= cues.pairs && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: frame >= cues.stick ? "#2E7D32" : "#FFFFFFF2", color: frame >= cues.stick ? "#fff" : palette.ink, borderRadius: 999, padding: "10px 34px", fontSize: 36, fontWeight: 700, fontFamily: font.family, transform: `scale(${(0.86 + 0.14 * spring({ frame: frame - cues.pairs, fps, config: { damping: 12 } })) * (frame >= cues.stick ? 1 + 0.05 * Math.sin((frame / fps) * 6) : 1)})` }}>
              {frame >= cues.stick && <span style={{ fontSize: 40 }}>🧠</span>}
              say them in pairs and they stick
            </div>
          )}
        </div>
      </Center>
    </>
  );
};

// ── the five travellers ──────────────────────────────────────────────────────
export type FiveCues = {
  words: [number, number, number, number, number];
  shortToo: number;   // "They have short vowels too…"
  travelled: number;  // "These five travelled here from lands far away."
  packed: number;     // "They packed their own spelling…"
  kept: number;       // "…they simply kept it!"
};

export const ChFive: React.FC<{ beat: Beat; cues: FiveCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = ["sandwich", "spinach", "ostrich", "attach", "detach"];
  const anyCard = frame >= cues.words[0];
  const travelling = frame >= cues.travelled;
  return (
    <>
      <Band top={88}>
        <Pill size={44}>
          {frame >= cues.travelled ? "They travelled here from far away ✈️" : "Five longer rule breakers ⚠️"}
        </Pill>
      </Band>

      {/* a dotted flight path drawn behind them once the journey is mentioned */}
      {travelling && (
        <svg width={1920} height={300} style={{ position: "absolute", left: 0, top: 300 }}>
          {/* kept in a flat band BELOW the cards — the first version curved up into the
              top-right corner and flew straight through the brand mark */}
          <path
            d="M-40 250 q 430 -70 900 -34 q 420 32 1000 -6"
            fill="none" stroke="#FFFFFF" strokeWidth={7} strokeDasharray="18 20" opacity={0.7}
            strokeDashoffset={-frame * 2}
          />
          <text
            x={interpolate(frame - cues.travelled, [0, 130], [20, 1800], { extrapolateRight: "clamp" })}
            y={236} fontSize={50}
          >
            ✈️
          </text>
        </svg>
      )}

      <Center top={392}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          {!anyCard && (
            <div style={{ display: "flex", gap: 22 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 200, height: 100, borderRadius: 24, border: "6px dashed #B7C4D4", background: "#FFFFFFAA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 700, color: "#B7C4D4", fontFamily: font.family, transform: `translateY(${bob(frame, fps, 5, 2.4, i)}px)` }}>{i + 5}</div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 26 }}>
            {W.map((w, i) => (
              // staggered, so the line lands as a sweep across the row rather than all at once
              <BreakerCard key={w} word={w} at={cues.words[i]} lit={frame >= cues.shortToo + i * 12} suitcase openAt={cues.packed} />
            ))}
          </div>
          {frame >= cues.kept && (
            <div style={{ background: "#FFFFFFF2", border: `6px solid ${hex(CH)}`, borderRadius: 999, padding: "10px 34px", fontSize: 38, fontWeight: 700, color: palette.ink, fontFamily: font.family, whiteSpace: "nowrap", transform: `scale(${0.86 + 0.14 * spring({ frame: frame - cues.kept, fps, config: { damping: 11 } })})` }}>
              they brought their spelling with them 🧳
            </div>
          )}
        </div>
      </Center>
    </>
  );
};

// ── all nine together ────────────────────────────────────────────────────────
export const ChAllNine: React.FC<{ beat: Beat; wordAt: number[]; finaleAt: number }> = ({ wordAt, finaleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = ["much", "such", "rich", "which", "sandwich", "spinach", "ostrich", "attach", "detach"];
  const done = frame >= finaleAt;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>{done ? "Remember these nine! ⭐" : "All nine rule breakers 📋"}</Pill>
      </Band>
      <Center top={362}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", gap: 22 }}>
            {W.slice(0, 4).map((w, i) => (
              <BreakerCard key={w} word={w} at={0} lit={frame >= wordAt[i]} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {W.slice(4).map((w, i) => (
              <BreakerCard key={w} word={w} at={0} lit={frame >= wordAt[i + 4]} />
            ))}
          </div>
          {done && (
            <div
              style={{
                background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "12px 44px",
                fontSize: 42, fontWeight: 700, fontFamily: font.family, whiteSpace: "nowrap",
                transform: `scale(${0.6 + 0.4 * spring({ frame: frame - finaleAt, fps, config: { damping: 9 } })}) rotate(${wiggle(frame, fps, 2, 1.4)}deg)`,
                boxShadow: "0 16px 40px rgba(46,125,50,0.5)",
              }}
            >
              ⭐ Learn these nine — the rule does the rest!
            </div>
          )}
        </div>
      </Center>
    </>
  );
};
