import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Band, Center, Pill } from "../components/LandscapeBeatKit";
import { BakeChip } from "../components/BakeryWorld";
import { Connector, Puzzled, RuleArrow, Signpost } from "../components/Connector";
import { LogoBadge } from "../components/BrandMarks";
import { TilePart, WordTiles } from "../components/WordTiles";
import { WordArt } from "../components/WordArt";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// Beats for hard c / soft c — The Bakery.
//
// First card where the deciding letter comes AFTER, not before, and the first "which SOUND?"
// card: the two answers are SOUNDS for one letter, not two spellings. That is why the see-it
// boards, the quiz and the recap are built here rather than reused — the shared ones look up
// `word.indexOf(marker)`, and "/s/" is not a substring of "city".
//
// Everything sits on a LIGHT ground, so cards are white with a strong coloured border and
// slab extrusion; no plates are needed behind text.
//
// LAYOUT BANDS, and nothing may cross them:
//   360…560 tiles · 592…650 label · 664…730 note · 768 counter

const HARD = "D84315";  // crunchy — the /k/ sound
const SOFT = "2E7D32";  // the quiet little snake — the /s/ sound
const DEC = "8E24AA";   // the deciding letter that comes next
export const C_TONES = { HARD, SOFT, DEC };

// ── the vertical layout, derived rather than nudged ─────────────────────────
// Every row's top is computed from the row above it PLUS that row's slab extrusion, because
// a slab draws `depth + 16`px below its own box. Nudging these by eye is what produced both
// "everything is crammed" and "the text is inside the card".
const PIC_TOP = 208;
const PIC_H = 160;
const TILE_H = 200;          // WordTiles' own tile height
const TILE_SLAB = 22 + 16;   // deepest tile extrusion
const LABEL_H = 64;
const LABEL_SLAB = 0;
const NOTE_H = 64;

const TILE_TOP = PIC_TOP + PIC_H + 30;                    // 398
const LABEL_TOP = TILE_TOP + TILE_H + TILE_SLAB + 26;     // 662
const NOTE_TOP = LABEL_TOP + LABEL_H + LABEL_SLAB + 34;   // 760
const COUNTER_TOP = 856;

// fail loudly at import time rather than shipping a frame where two rows sit on each other
if (NOTE_TOP + NOTE_H + 26 > COUNTER_TOP) {
  throw new Error(`c/soft-hard layout: the note row runs past the counter (${NOTE_TOP + NOTE_H + 26} > ${COUNTER_TOP})`);
}

// Which c actually decides the word, and which letter follows it. Reading word[1] was wrong
// for every word whose c is not second — ice, race and picnic were all highlighting a letter
// that has nothing to do with the rule.
export const decidingLetter = (w: string, letter = "c"): { ci: number; ni: number; soft: boolean } => {
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== letter) continue;
    const next = w[i + 1] ?? "";
    // `"eiy".includes("")` is TRUE, so a word-final c (picnic) matched the empty string
    // and was classed soft with a highlight on a letter that does not exist
    if (next !== "" && "eiy".includes(next)) return { ci: i, ni: i + 1, soft: true };
  }
  const ci = w.indexOf(letter);
  return { ci, ni: ci + 1 < w.length ? ci + 1 : -1, soft: false };
};

export const decidingC = (w: string) => decidingLetter(w, "c");

export type Note = { at: number; node: React.ReactNode | null };

const pick = (notes: Note[], frame: number): Note | null => {
  let cur: Note | null = null;
  for (const n of notes) if (frame >= n.at) cur = n;
  return cur;
};

export const SwapNote: React.FC<{ notes: Note[]; top?: number }> = ({ notes, top = NOTE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cur = pick(notes, frame);
  if (!cur || !cur.node) return null;
  const s = spring({ frame: frame - cur.at, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `scale(${0.84 + 0.16 * s}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>{cur.node}</div>
    </div>
  );
};

export const Notes = {
  listen: <BakeChip tone={hex(DEC)}><span style={{ fontSize: 40 }}>👂</span>listen — we build it</BakeChip>,
  more: <BakeChip tone={hex(DEC)}>three more words <span style={{ fontSize: 38 }}>👇</span></BakeChip>,
  stillHard: <BakeChip tone={hex(HARD)}>an l came next — the c is <span style={{ color: hex(HARD) }}>still hard</span> ✅</BakeChip>,
};

// A thinking face that actually thinks. A motionless emoji held for two seconds is the
// stalled-screen failure in miniature.
export const Thinking: React.FC<{ size?: number }> = ({ size = 165 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span
      style={{
        fontSize: size, display: "inline-block",
        transform: `scale(${1 + 0.08 * Math.sin((frame / fps) * 3.4)}) rotate(${wiggle(frame, fps, 1.8, 9)}deg) translateY(${bob(frame, fps, 10, 2.2)}px)`,
      }}
    >
      🤔
    </span>
  );
};

// ── a big sound card, used wherever a sound is introduced ───────────────────
// [ the c card ] —drawn arrow→ [ the sound ] with the picture on the RIGHT.
// The relationship is the lesson, so it is drawn rather than implied by two cards sitting
// side by side; and the picture sits after the sound, not before it.
export const SoundCard: React.FC<{
  sound: string; tone: string; emoji: string; caption: React.ReactNode; emojiAt?: number;
  label?: string; word?: string;
  // Beat-relative cues. Hard-coding drawAt=6 meant the arrow was measured from the START OF
  // THE BEAT, so by the time "everywhere else, the c stays hard" was spoken it had long since
  // drawn and the whole thing appeared at once.
  drawAt?: number; rightAt?: number;
}> = ({ sound, tone, emoji, caption, emojiAt = 0, label, word = "c", drawAt = 6, rightAt = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: font.family }}>
      <RuleArrow
        color={tone}
        drawAt={drawAt}
        rightAt={rightAt}
        pictureAt={emojiAt}
        label={label}
        left={
          <div style={{ background: "#FFFFFF", border: `12px solid ${c}`, borderRadius: 36, padding: "14px 44px", fontSize: 116, fontWeight: 700, color: c, boxShadow: slab(tone, 20), transform: `translateY(${bob(frame, fps, 7, 2.6)}px)` }}>
            {word}
          </div>
        }
        right={
          <div style={{ background: tint(tone, 0.9), border: `12px solid ${c}`, borderRadius: 40, padding: "18px 56px", fontSize: 126, fontWeight: 700, color: c, boxShadow: slab(tone, 22), transform: `translateY(${bob(frame, fps, 7, 2.8, 1)}px)` }}>
            {sound}
          </div>
        }
        picture={<span style={{ fontSize: 140 }}>{emoji}</span>}
      />
      <div style={{ fontSize: 40, fontWeight: 700, color: palette.ink, opacity: frame >= emojiAt ? 1 : 0 }}>{caption}</div>
    </div>
  );
};

// three empty slots, for the "Listen." line before a word is built
export const EmptySlots: React.FC<{ n?: number; tone: string }> = ({ n = 3, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: 20 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 150, height: 190, borderRadius: 28, border: `9px dashed ${hex(tone)}66`,
            background: "#FFFFFF88", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 70, color: `${hex(tone)}66`, fontFamily: font.family, fontWeight: 700,
            transform: `translateY(${bob(frame, fps, 7, 2.4, i)}px)`,
          }}
        >
          ?
        </div>
      ))}
    </div>
  );
};

// ── hook (0–9) — one letter, two sounds ─────────────────────────────────────
export type HookCues = {
  cee: number; two: number; hear1: number; cat: number; k: number; hear2: number; city: number; s: number;
  // "It is the same letter, but it makes two different sounds!" is TWO ideas in one line, so
  // it gets two moments: the c is spotlighted on "the same letter", then the spotlight moves
  // to the two sound cards on "but…two different sounds".
  same: number; two2: number;
};

const SoundBubble: React.FC<{ sound: string; word: string; tone: string; at: number; lit: boolean; ring?: boolean }> = ({ sound, word, tone, at, lit, ring = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const c = hex(tone);
  const sp = spring({ frame: frame - at, fps, config: { damping: 12 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 42, fontFamily: font.family, transform: `scale(${0.78 + 0.22 * sp}) translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
      <div style={{ position: "relative", background: "#FFFFFF", border: `${ring ? 12 : 9}px solid ${c}`, borderRadius: 34, padding: "16px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: slab(tone, ring ? 26 : lit ? 20 : 13) }}>
        <WordArt word={word} size={92} />
        <span style={{ fontSize: 54, fontWeight: 700, color: palette.ink }}>
          <span style={{ color: c }}>c</span>{word.slice(1)}
        </span>
      </div>
      <div style={{ background: lit ? c : "#FFFFFF", color: lit ? "#fff" : c, border: `7px solid ${c}`, borderRadius: 999, padding: "6px 30px", fontSize: 52, fontWeight: 700, boxShadow: slab(tone, 11) }}>
        {sound}
      </div>
    </div>
  );
};

export const CHook: React.FC<{ cues: HookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const same = frame >= cues.same;          // "It is the same letter…"
  const both = frame >= cues.two2;          // "…but it makes two different sounds!"
  // pulse whichever half the narrator is on, and only that half
  const cPulse = same && !both ? 1 + 0.07 * Math.sin(((frame - cues.same) / fps) * 5) : 1;
  const cRing = same && !both;
  const sidePulse = both ? 1 + 0.06 * Math.sin(((frame - cues.two2) / fps) * 5) : 1;
  return (
    <>
      <Band top={92}>
        <Pill size={46} still>
          {both ? (<>One letter, <span style={{ color: hex(DEC) }}>two sounds</span>!</>)
            : same ? (<>The <span style={{ color: hex(DEC) }}>same letter</span>…</>)
            : (<>Look at this letter 👀</>)}
        </Pill>
      </Band>
      <Center top={352}>
        <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
          <div style={{ transform: `scale(${sidePulse})` }}>
            <SoundBubble sound="/k/" word="cat" tone={HARD} at={cues.cat} lit={frame >= cues.k} ring={both} />
          </div>
          {/* phrase 0, "Look at this letter." — the card is face-down until it is named */}
          {frame < cues.cee && (
            <div
              style={{
                width: 260, height: 300, borderRadius: 40, border: `12px dashed ${hex(DEC)}88`,
                background: "#FFFFFFAA", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 150, fontWeight: 700, color: `${hex(DEC)}88`, fontFamily: font.family,
                transform: `translateY(${bob(frame, fps, 8, 2.4)}px) scale(${1 + 0.04 * Math.sin((frame / fps) * 4)})`,
              }}
            >
              ?
            </div>
          )}
          {frame >= cues.cee && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
              <div
                style={{
                  position: "relative",
                  background: "#FFFFFF", border: `12px solid ${hex(DEC)}`, borderRadius: 40,
                  padding: "16px 54px", fontSize: 170, fontWeight: 700, color: hex(DEC), fontFamily: font.family,
                  boxShadow: slab(DEC, cRing ? 34 : 24),
                  transform: `scale(${(0.8 + 0.2 * spring({ frame: frame - cues.cee, fps, config: { damping: 11 } })) * cPulse}) translateY(${bob(frame, fps, 7, 3)}px)`,
                }}
              >
                c
                {cRing && (
                  <div style={{ position: "absolute", inset: -10 - 26 * (((frame - cues.same) % 26) / 26), borderRadius: 52, border: `8px solid ${hex(DEC)}`, opacity: 0.55 * (1 - ((frame - cues.same) % 26) / 26) }} />
                )}
              </div>
              {frame >= cues.two && (
                <div style={{ fontSize: 42, fontWeight: 700, color: palette.inkSoft, fontFamily: font.family }}>
                  {both ? "the same letter!" : "two sounds"}
                </div>
              )}
            </div>
          )}
          <div style={{ transform: `scale(${sidePulse})` }}>
            <SoundBubble sound="/s/" word="city" tone={SOFT} at={cues.city} lit={frame >= cues.s} ring={both} />
          </div>
        </div>
      </Center>
      {frame >= cues.hear1 && frame < cues.cat && (
        <SwapNote notes={[{ at: cues.hear1, node: <BakeChip tone={hex(DEC)}><span style={{ fontSize: 40 }}>👂</span>listen to the first one</BakeChip> }]} top={214} />
      )}
      {frame >= cues.hear2 && frame < cues.city && (
        <SwapNote notes={[{ at: cues.hear2, node: <BakeChip tone={hex(DEC)}><span style={{ fontSize: 40 }}>👂</span>now listen to the second one</BakeChip> }]} top={214} />
      )}
    </>
  );
};

// ── lookAfter (10–13) — the reversal, with REAL words on both sides ─────────
export const CLookAfter: React.FC<{ beforeAt: number; flipAt: number; afterAt: number; cAt?: number }> = ({ beforeAt, flipAt, afterAt, cAt }) => {
  const frame = useCurrentFrame();
  const flipped = frame >= flipAt;
  const after = frame >= afterAt;
  const turn = interpolate(frame, [flipAt, flipAt + 18], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tone = flipped ? DEC : "9E9E9E";
  const w = after
    ? { pre: "c", target: "i", post: "ty", cTone: SOFT }
    : { pre: "c", target: "a", post: "tch", cTone: HARD };
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {after ? (<>Look at the letter that comes <span style={{ color: hex(DEC) }}>after</span> ➡️</>)
            : flipped ? (<>This time, we look the <span style={{ color: hex(DEC) }}>other way</span> 🔄</>)
            : frame >= beforeAt ? (<>Last time we looked <span style={{ color: palette.inkSoft }}>before</span> ⬅️</>)
            : (<>So how do we know which sound to say? 🤔</>)}
        </Pill>
      </Band>
      <Center top={392}>
        {frame < beforeAt ? (
          <Puzzled />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, fontFamily: font.family }}>
            <div style={{ background: "#FFFFFF", border: `9px solid ${hex(tone)}`, borderRadius: 34, padding: "18px 46px", fontSize: 110, fontWeight: 700, color: palette.ink, boxShadow: slab(tone, 17) }}>
              {/* the line ends "…that comes after THE C", so the c is ringed on those words */}
              <span style={{ position: "relative", display: "inline-block", color: hex(w.cTone) }}>
                {w.pre}
                {cAt !== undefined && frame >= cAt && (
                  <span
                    style={{
                      position: "absolute", left: "50%", top: "50%",
                      width: 118, height: 118, marginLeft: -59, marginTop: -59,
                      borderRadius: "50%", border: `9px solid ${hex(w.cTone)}`,
                      opacity: 0.75 * (1 - ((frame - cAt) % 28) / 28),
                      transform: `scale(${0.7 + 0.5 * (((frame - cAt) % 28) / 28)})`,
                    }}
                  />
                )}
              </span>
              <span style={{ position: "relative", display: "inline-block", color: hex(tone) }}>
                {w.target}
                <svg width={200} height={120} style={{ position: "absolute", left: "50%", top: -112, marginLeft: -100, overflow: "visible" }}>
                  <g transform={`rotate(${turn} 100 66)`}>
                    <path d="M142 66 L60 66" stroke={hex(tone)} strokeWidth={13} strokeLinecap="round" />
                    <path d="M76 48 L56 66 L76 84" fill="none" stroke={hex(tone)} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </span>
              <span style={{ color: after ? palette.ink : hex(HARD) }}>{w.post}</span>
            </div>
            <BakeChip tone={hex(tone)}>
              {after ? (<>the letter <span style={{ color: hex(DEC) }}>after</span> the c decides</>)
                : flipped ? "…so we turn around" : (<>ch ⚡ tch looked at the letter <b>before</b></>)}
            </BakeChip>
          </div>
        )}
      </Center>
    </>
  );
};

// ── the three deciding letters (14–19, and again 49–54) ────────────────────
export const CThreeLetters: React.FC<{
  at: [number, number, number]; ruleAt: number; heading?: React.ReactNode; elseAt?: number;
  // the rule line names e, i and y again — each card lights a SECOND time on its own word,
  // so that 7.5s line is three moments rather than one
  relightAt?: [number, number, number];
}> = ({ at, ruleAt, heading, elseAt, relightAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // "Every other letter keeps it hard." is its own line and needs its own picture, so the
  // three deciders are joined by the letters they are NOT.
  const showElse = elseAt !== undefined && frame >= elseAt;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {showElse ? (<>Every <span style={{ color: hex(HARD) }}>other</span> letter keeps it hard 🍪</>)
            : heading ?? (<>Three letters are <span style={{ color: hex(DEC) }}>special</span> ✨</>)}
        </Pill>
      </Band>
      <Center top={showElse ? 360 : 380}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: showElse ? 30 : 44 }}>
            {["e", "i", "y"].map((l, i) => {
              const shown = frame >= at[i];
              const sp = spring({ frame: frame - at[i], fps, config: { damping: 11 } });
              const S = showElse ? 148 : 200;
              const rl = relightAt?.[i];
              const relit = rl !== undefined && frame >= rl;
              const kick = relit ? 1 + 0.16 * Math.max(0, 1 - (frame - rl!) / 20) : 1;
              return (
                <div
                  key={l}
                  style={{
                    width: S, height: S, borderRadius: 32,
                    background: shown ? tint(DEC, 0.9) : "#FFFFFFAA",
                    border: `10px ${shown ? "solid" : "dashed"} ${shown ? hex(DEC) : "#C9B79E"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: showElse ? 84 : 118, fontWeight: 700, color: shown ? hex(DEC) : "#C9B79E", fontFamily: font.family,
                    boxShadow: shown ? slab(DEC, relit ? 30 : 20) : slab("C9B79E", 9),
                    transform: `scale(${(shown ? 0.8 + 0.2 * sp : 1) * kick}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                  }}
                >
                  {shown ? l : "?"}
                </div>
              );
            })}
            {showElse && (
              <>
                <span style={{ fontSize: 62, fontWeight: 700, color: palette.inkSoft, fontFamily: font.family, margin: "0 8px" }}>vs</span>
                {["a", "o", "u"].map((l, i) => (
                  <div
                    key={l}
                    style={{
                      width: 148, height: 148, borderRadius: 32, background: tint(HARD, 0.92),
                      border: `10px solid ${hex(HARD)}`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 84, fontWeight: 700, color: hex(HARD), fontFamily: font.family,
                      boxShadow: slab(HARD, 16),
                      transform: `scale(${0.7 + 0.3 * spring({ frame: frame - elseAt! - i * 6, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 6, 2.4, i + 3)}px)`,
                    }}
                  >
                    {l}
                  </div>
                ))}
                <span style={{ fontSize: 54, fontFamily: font.family }}>…</span>
              </>
            )}
          </div>
          {/* a line drawn from the three letters down to the verdict, so the rule is shown
              as a consequence rather than as another caption */}
          {frame >= ruleAt && !showElse && (
            <Connector at={ruleAt} x1={960} y1={600} x2={960} y2={694} color={SOFT} dip={0} dur={16} />
          )}
          {frame >= ruleAt && (
            <div style={{ transform: `scale(${0.86 + 0.14 * spring({ frame: frame - ruleAt, fps, config: { damping: 12 } })})` }}>
              <BakeChip tone={hex(showElse ? HARD : SOFT)} size={40}>
                {showElse ? (<>every other letter → the c stays <span style={{ color: hex(HARD) }}>hard</span></>)
                  : (<>c + <span style={{ color: hex(DEC) }}>e, i or y</span> → the c goes <span style={{ color: hex(SOFT) }}>soft</span></>)}
              </BakeChip>
            </div>
          )}
        </div>
      </Center>
    </>
  );
};

// ── a worked word ───────────────────────────────────────────────────────────
// `pre` carries the lines that come BEFORE the word is built ("A soft c says /s/…",
// "So what happens everywhere else?", "Listen."). Without it those lines played over an
// empty stage, which is what the phrase sheet exposed.
export type CaseCues = {
  pre?: Note[]; partsAt?: number[]; build: number; label: number; more: number[]; allAt?: number;
  // the second clause of "The i comes right after the c, SO THIS C IS SOFT" — one line, two
  // ideas, so the verdict lands on its own words instead of arriving with the label
  verdictAt?: number; verdict?: React.ReactNode;
  allStagger?: number;      // spread the summary words across their (5-6s) line
  allAtEach?: number[];     // ...or give each summary word its own spoken cue
  allNote?: React.ReactNode; // a chip under the summary group, e.g. "the g is at the END"
};

export const CCase: React.FC<{
  head: React.ReactNode; base: TilePart[]; baseWord: string; cTone: string; focusLabel: string;
  cues: CaseCues; examples: { parts: TilePart[]; word: string }[]; notes?: Note[]; allWords?: string[];
  letter?: string;   // which letter this card teaches — "c" by default
}> = ({ head, base, baseWord, cTone, focusLabel, cues, examples, notes = [], allWords, letter = "c" }) => {
  const frame = useCurrentFrame();
  const preNode = frame < cues.build ? pick(cues.pre ?? [], frame) : null;
  const showAll = allWords && cues.allAt !== undefined && frame >= cues.allAt;
  let idx = -1;
  for (let i = 0; i < cues.more.length; i++) if (frame >= cues.more[i]) idx = i;
  const parts = idx < 0 ? base : examples[idx].parts;
  const word = idx < 0 ? baseWord : examples[idx].word;
  const enterAt = idx < 0 ? cues.build : cues.more[idx];
  return (
    <>
      <Band top={92}><Pill size={46}>{head}</Pill></Band>
      {preNode ? (
        <Center top={400}>{preNode.node}</Center>
      ) : showAll ? (
        // the summary line names ALL the words, so it shows all of them
        <Center top={400}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
          <div style={{ display: "flex", gap: 26 }}>
            {allWords!.map((w, i) => (
              <SummaryWord
                key={w}
                word={w}
                tone={cTone}
                letter={letter}
                at={cues.allAtEach ? cues.allAtEach[i] : cues.allAt! + i * (cues.allStagger ?? 6)}
              />
            ))}
          </div>
          {cues.allNote}
          </div>
        </Center>
      ) : (
        <>
          <WordTiles
            key={idx}
            parts={parts}
            endingColor={cTone}
            focusLabel={focusLabel}
            focusColor={DEC}
            enterAt={enterAt}
            endingAt={enterAt}
            labelAt={idx < 0 ? cues.label : cues.more[idx] + 8}
            emoji={<WordArt word={word} size={PIC_H} />}
            depth3d
            tileTop={TILE_TOP}
            labelTop={LABEL_TOP}
            partsAt={idx < 0 ? cues.partsAt : undefined}
          />
          <SwapNote notes={cues.verdictAt !== undefined && cues.verdict
            ? [...notes, { at: cues.verdictAt, node: cues.verdict }]
            : notes} />
        </>
      )}
    </>
  );
};

const SummaryWord: React.FC<{ word: string; tone: string; at: number; letter?: string }> = ({ word, tone, at, letter = "c" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = frame >= at;
  const c = hex(tone);
  const { ci, ni } = decidingLetter(word, letter);
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  return (
    <div style={{ background: "#FFFFFF", border: `8px solid ${shown ? c : "#C9B79E"}`, borderRadius: 30, padding: "16px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: font.family, opacity: shown ? 1 : 0.3, boxShadow: shown ? slab(tone, 16) : slab("C9B79E", 8), transform: `scale(${shown ? 0.74 + 0.26 * s : 0.94}) translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
      <WordArt word={word} size={74} />
      <span style={{ fontSize: 58, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
        {word.slice(0, ci)}
        <span style={{ color: c }}>{word[ci]}</span>
        {ni >= 0 && <span style={{ color: hex(DEC), borderBottom: `7px solid ${hex(DEC)}` }}>{word[ni]}</span>}
        {word.slice(ni >= 0 ? ni + 1 : ci + 1)}
      </span>
    </div>
  );
};

// ── see-it boards (55–70) ───────────────────────────────────────────────────
const WordCard: React.FC<{ word: string; tone: string; lit: boolean; swept: boolean; i: number; letter?: string }> = ({ word, tone, lit, swept, i, letter = "c" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  const { ci, ni } = decidingLetter(word, letter);
  const mark = lit || swept;
  return (
    <div
      style={{
        background: lit ? tint(tone, 0.9) : "#FFFFFF", border: `7px solid ${mark ? c : "#D8C7A8"}`,
        borderRadius: 26, padding: "14px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        fontFamily: font.family, opacity: mark ? 1 : 0.55,
        boxShadow: mark ? slab(tone, 16) : slab("D8C7A8", 8),
        transform: `scale(${lit ? 1.04 : 1}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
      }}
    >
      <WordArt word={word} size={60} />
      <span style={{ fontSize: 48, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
        {word.slice(0, ci)}
        <span style={{ color: mark ? c : palette.ink }}>{word[ci]}</span>
        {ni >= 0 ? (
          <span
            style={
              swept
                ? { background: hex(DEC), color: "#fff", borderRadius: 8, padding: "0 6px" }
                : mark
                ? { color: hex(DEC), borderBottom: `6px solid ${hex(DEC)}` }
                : undefined
            }
          >
            {word[ni]}
          </span>
        ) : null}
        {word.slice(ni >= 0 ? ni + 1 : ci + 1)}
      </span>
    </div>
  );
};

export const CSeeIt: React.FC<{
  soft: string[]; hard: string[]; softAt: number[]; hardAt: number[];
  hardHeadAt: number; sweepSoftAt: number; sweepHardAt: number;
  sweepStep?: number; letter?: string;
}> = ({ soft, hard, softAt, hardAt, hardHeadAt, sweepSoftAt, sweepHardAt, sweepStep = 8, letter = "c" }) => {
  const frame = useCurrentFrame();
  const onHard = frame >= hardHeadAt;
  const words = onHard ? hard : soft;
  const at = onHard ? hardAt : softAt;
  const tone = onHard ? HARD : SOFT;
  // the summary line is its own visual: every deciding letter turns into a filled badge at
  // once, so "every one has e, i or y" is shown rather than only said
  // the badges land one after another across the 4.5s line, not all on the first frame
  const sweepFrom = onHard ? sweepHardAt : sweepSoftAt;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {onHard ? (<>The <span style={{ color: hex(HARD) }}>hard {letter}</span> words</>) : (<>The <span style={{ color: hex(SOFT) }}>soft {letter}</span> words</>)}
        </Pill>
      </Band>
      <Center top={370}>
        <div style={{ display: "flex", gap: 24 }}>
          {words.map((w, i) => (
            <WordCard key={w} word={w} tone={tone} lit={frame >= at[i]} swept={frame >= sweepFrom + i * sweepStep} i={i} letter={letter} />
          ))}
        </div>
      </Center>
      <SwapNote
        top={678}
        notes={[
          { at: sweepSoftAt, node: <BakeChip tone={hex(SOFT)}>✅ every one has <span style={{ color: hex(DEC) }}>e, i or y</span> after the c</BakeChip> },
          { at: hardHeadAt, node: null },
          { at: sweepHardAt, node: <BakeChip tone={hex(HARD)}>🚫 not one of them has <span style={{ color: hex(DEC) }}>e, i or y</span> after the c</BakeChip> },
        ]}
      />
    </>
  );
};

// ── the /sh/ family (74–93) ─────────────────────────────────────────────────
export type ShCues = { intro: number; look: number; words: number[]; softToo: number; careful: number; notS: number; sh: number; ask: number; ends: number; endsAt: number[]; rule: number; saysAt: number; own: number };

const W_SH = ["special", "precious", "musician", "ancient", "ocean"];
const ENDS = ["cial", "cious", "cian", "cient", "cean"];

export const CShFamily: React.FC<{ cues: ShCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showEnds = frame >= cues.ends;
  const soft = frame >= cues.softToo;
  const careful = frame >= cues.careful;
  const notS = frame >= cues.notS;
  return (
    <>
      <Band top={92}>
        <Pill size={44}>
          {frame >= cues.rule ? (<>c + two vowels → <span style={{ color: hex(SOFT) }}>/sh/</span></>)
            : frame >= cues.sh ? (<>This soft c says <span style={{ color: hex(SOFT) }}>/sh/</span> 🤫</>)
            : careful ? (<>Listen carefully 👂</>)
            : (<>One more thing to know 🔎</>)}
        </Pill>
      </Band>
      <Center top={352}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          {/* "There is one more thing you should know." lands before any word arrives, and
              had nothing on screen at all. It gets its own moment: a magnifier sweeping over
              the stack the five words are about to come out of. */}
          {frame < cues.look && (
            <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
              <div style={{ position: "relative", width: 300, height: 190 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute", left: 46 + i * 14, top: 34 + i * 10,
                      width: 190, height: 118, borderRadius: 22,
                      background: "#FFFFFF", border: `7px solid ${hex(SOFT)}${i ? "66" : ""}`,
                      boxShadow: slab(SOFT, 10 - i * 3),
                      transform: `rotate(${-6 + i * 5}deg) translateY(${bob(frame, fps, 5, 2.2, i)}px)`,
                    }}
                  />
                ))}
                <span
                  style={{
                    position: "absolute", left: 150 + Math.sin(frame / 22) * 52, top: 44 + Math.cos(frame / 26) * 16,
                    fontSize: 104, transform: `rotate(${wiggle(frame, fps, 1.6, 8)}deg)`,
                  }}
                >
                  🔎
                </span>
              </div>
              <BakeChip tone={hex(SOFT)} size={38}>one more thing to know…</BakeChip>
            </div>
          )}
          <div style={{ display: "flex", gap: 18 }}>
            {W_SH.map((w, i) => {
              const shown = frame >= cues.words[i];
              const end = ENDS[i];
              const stem = w.slice(0, w.length - end.length);
              const lit = showEnds && frame >= cues.endsAt[i];
              const c = hex(SOFT);
              // before the words arrive they are already legible, just waiting — the earlier
              // version showed five numbered blanks while the narrator said "look at these
              // five words", which showed nothing to look at
              return (
                <div
                  key={w}
                  style={{
                    background: "#FFFFFF", border: `7px solid ${shown ? c : "#C9B79E"}`, borderRadius: 24,
                    padding: "12px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    fontFamily: font.family, opacity: shown ? 1 : frame >= cues.look ? 0.4 : 0,
                    boxShadow: shown ? slab(SOFT, lit ? 18 : 12) : slab("C9B79E", 7),
                    transform: `scale(${lit ? 1.05 : 1}) translateY(${bob(frame, fps, 6, 2.4, i)}px)`,
                  }}
                >
                  <WordArt word={w} size={54} />
                  <span style={{ fontSize: 40, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
                    {stem.slice(0, -1)}
                    <span style={{ color: soft ? c : palette.ink, background: soft && !showEnds ? tint(SOFT, 0.75) : "none", borderRadius: 6, padding: soft && !showEnds ? "0 4px" : 0 }}>
                      {stem.slice(-1)}
                    </span>
                    <span style={{ color: lit ? hex(DEC) : c, borderBottom: lit ? `5px solid ${hex(DEC)}` : "none" }}>{end}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* three separate lines, three separate pictures */}
          {careful && !notS && (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 92, transform: `scale(${1 + 0.1 * Math.sin((frame / fps) * 5)})` }}>👂</span>
              <BakeChip tone={hex(DEC)} size={38}>listen very carefully…</BakeChip>
            </div>
          )}
          {notS && frame < cues.sh && (
            <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: font.family }}>
              <div style={{ position: "relative", background: "#FFFFFF", border: `8px solid ${hex(SOFT)}`, borderRadius: 24, padding: "8px 34px", fontSize: 60, fontWeight: 700, color: hex(SOFT), boxShadow: slab(SOFT, 12) }}>
                /s/
                <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
                  <line x1="6%" y1="12%" x2="94%" y2="88%" stroke="#C62828" strokeWidth={10} strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 44, fontWeight: 700, color: palette.ink }}>not this one!</span>
            </div>
          )}
          {frame >= cues.sh && (
            <BakeChip tone={hex(SOFT)} size={38}>
              {frame >= cues.own ? (<>a rule of its own — it has its own video 🎬</>)
                : frame >= cues.saysAt ? (<>c + <span style={{ color: hex(DEC) }}>two vowels</span> → it says <span style={{ color: hex(SOFT) }}>/sh/</span> 🤫</>)
                : frame >= cues.rule ? (<>c followed by <span style={{ color: hex(DEC) }}>two vowels</span>…</>)
                : frame >= cues.ask ? (<>can you see what these five share? 🔎</>)
                : (<>it says <span style={{ color: hex(SOFT) }}>/sh/</span> 🤫</>)}
            </BakeChip>
          )}
          {soft && !careful && (
            <BakeChip tone={hex(SOFT)} size={38}>every one of them has a <span style={{ color: hex(SOFT) }}>soft c</span></BakeChip>
          )}
        </div>
      </Center>
    </>
  );
};

// ── the reassurance (94–97) ─────────────────────────────────────────────────
export const CAlwaysSoft: React.FC<{ at: number; alwaysAt: number; neverAt: number }> = ({ at, alwaysAt, neverAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Band top={92}><Pill size={46}>Just remember the big thing ⭐</Pill></Band>
      <Center top={400}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44, fontFamily: font.family }}>
          <div
            style={{
              background: tint(SOFT, 0.92), border: `12px solid ${hex(SOFT)}`, borderRadius: 44,
              padding: "26px 60px", fontSize: 62, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap",
              boxShadow: slab(SOFT, 22),
              transform: `scale(${0.86 + 0.14 * spring({ frame: frame - at, fps, config: { damping: 12 } })}) translateY(${bob(frame, fps, 7, 2.6)}px)`,
            }}
          >
            Before <span style={{ color: hex(DEC) }}>e, i or y</span> the c is{" "}
            <span style={{ color: hex(SOFT), opacity: frame >= alwaysAt ? 1 : 0.18, display: "inline-block", transform: `scale(${frame >= alwaysAt ? 1 + 0.09 * Math.max(0, 1 - (frame - alwaysAt) / 22) : 0.9})` }}>always soft</span>
          </div>
          {frame >= neverAt && (
            <div
              style={{
                background: "#C62828", color: "#fff", borderRadius: 999, padding: "14px 46px",
                fontSize: 48, fontWeight: 700, whiteSpace: "nowrap", boxShadow: slab("C62828", 16),
                transform: `scale(${0.6 + 0.4 * spring({ frame: frame - neverAt, fps, config: { damping: 9 } })}) rotate(${wiggle(frame, fps, 2, 1.4)}deg)`,
              }}
            >
              it is never, ever hard
            </div>
          )}
        </div>
      </Center>
    </>
  );
};

// ── the quiz (98–104) — which SOUND, not which spelling ─────────────────────
export const CQuiz: React.FC<{ wordAt: number; askAt: number; revealAt: number; whyAt: number }> = ({ wordAt, askAt, revealAt, whyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAt;
  const tension = interpolate(frame, [revealAt - 50, revealAt], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Band top={72}><Pill size={50}>Your turn! 🤔</Pill></Band>
      <Center top={340}>
        <div style={{ display: "flex", alignItems: "center", gap: 76 }}>
          <div style={{ width: 280, height: 280, background: "#FFFFFF", border: `10px solid ${hex(revealed ? SOFT : DEC)}`, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: slab(revealed ? SOFT : DEC, 18), transform: `translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
            <WordArt word="cycle" size={170} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: font.family }}>
            <div style={{ fontSize: 130, fontWeight: 700, color: palette.ink, opacity: frame >= wordAt ? 1 : 0.2, transform: `scale(${frame >= wordAt ? 1 : 0.94})` }}>
              <span style={{ color: revealed ? hex(SOFT) : hex(DEC) }}>c</span>
              <span style={{ color: revealed ? hex(DEC) : palette.ink, borderBottom: revealed ? `9px solid ${hex(DEC)}` : "none" }}>y</span>
              cle
            </div>
            <div style={{ display: "flex", gap: 46 }}>
              {[{ t: "hard /k/", tone: HARD, ok: false }, { t: "soft /s/", tone: SOFT, ok: true }].map((o, i) => {
                const lit = revealed && o.ok;
                const dim = revealed && !o.ok;
                return (
                  <div
                    key={o.t}
                    style={{
                      background: lit ? hex(o.tone) : "#FFFFFF", color: lit ? "#fff" : hex(o.tone),
                      border: `9px solid ${hex(o.tone)}`, borderRadius: 30, padding: "14px 44px",
                      fontSize: 62, fontWeight: 700, whiteSpace: "nowrap", opacity: dim ? 0.3 : 1,
                      boxShadow: slab(o.tone, lit ? 22 : 13),
                      transform: `scale(${lit ? 1 + 0.14 * spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1}) rotate(${lit || dim ? 0 : wiggle(frame, fps, 2 * tension, 1.4 / tension, i)}deg)`,
                    }}
                  >
                    {o.t}{lit && <span style={{ fontSize: 46, marginLeft: 12 }}>🎉</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Center>
      {frame >= whyAt ? (
        <SwapNote top={718} notes={[{ at: whyAt, node: <BakeChip tone={hex(DEC)} size={38}>the <span style={{ color: hex(DEC) }}>y</span> comes right after the c 🐍</BakeChip> }]} />
      ) : frame >= askAt && !revealed ? (
        <SwapNote top={718} notes={[{ at: askAt, node: <BakeChip tone={hex(DEC)} size={38}>hard, or soft? 🤔</BakeChip> }]} />
      ) : null}
    </>
  );
};

// ── the recap (105–108) ─────────────────────────────────────────────────────
// Built here rather than reused. The shared PairRecap lights a card on `beat.word(marker)`,
// and this card's markers are "/k/" and "/s/", which the narration says as sounds — so every
// line lit nothing and all four lines showed one identical screen.
export const CRecap: React.FC<{ softAt: number; sAt: number; hardAt: number; kAt: number }> = ({ softAt, sAt, hardAt, kAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { tone: SOFT, marker: "/s/", icon: "🐍", line: <>before <span style={{ color: hex(DEC) }}>e, i or y</span></>, at: softAt },
    { tone: HARD, marker: "/k/", icon: "🍪", line: <>everywhere else</>, at: hardAt },
  ];
  return (
    <>
      <Band top={78}>
        <Pill size={50} still>
          <span style={{ fontSize: 52, marginRight: 12 }}>🧠</span>Remember! ✨
        </Pill>
      </Band>
      <Center top={272}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
          <div style={{ display: "flex", gap: 46 }}>
            {rows.map((r, i) => {
              const lit = frame >= r.at;
              const c = hex(r.tone);
              const kick = lit ? 1 + 0.14 * Math.max(0, 1 - (frame - r.at) / 20) : 1;
              // "A soft c usually says /s/" is its own line — the /s/ badge pulses on it
              // each sound badge pulses on the clause that names IT, so both recap lines have
              // two moments rather than one card lighting and then holding
              const bAt = r.marker === "/s/" ? sAt : kAt;
              const badge = frame >= bAt;
              return (
                <div
                  key={r.marker}
                  style={{
                    background: lit ? tint(r.tone, 0.9) : "#FFFFFF",
                    border: `10px solid ${lit ? c : "#D8C7A8"}`, borderRadius: 40, padding: "22px 44px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    fontFamily: font.family, minWidth: 420, opacity: lit ? 1 : 0.6,
                    boxShadow: lit ? slab(r.tone, 22) : slab("D8C7A8", 10),
                    transform: `scale(${kick}) translateY(${bob(frame, fps, lit ? 8 : 5, 2.6, i)}px)`,
                  }}
                >
                  <span style={{ fontSize: 62 }}>{r.icon}</span>
                  <span
                    style={{
                      fontSize: 92, fontWeight: 700, color: c, lineHeight: 1,
                      transform: `scale(${badge ? 1 + 0.09 * Math.sin(((frame - bAt) / fps) * 6) : 1})`,
                      display: "inline-block",
                    }}
                  >
                    {r.marker}
                  </span>
                  <span style={{ fontSize: 38, fontWeight: 700, color: lit ? c : palette.inkSoft }}>{r.line}</span>
                </div>
              );
            })}
          </div>
          <div style={{ transform: `scale(${spring({ frame: frame - 40, fps, config: { damping: 12 } }) * (1 + 0.06 * Math.sin((frame / fps) * 3.2))}) translateY(${bob(frame, fps, 6, 2.2)}px)`, marginTop: 6 }}>
            <LogoBadge size={188} />
          </div>
        </div>
      </Center>
    </>
  );
};
