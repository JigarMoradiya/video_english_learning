import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PHead } from "../components/PortraitBeatKit";
import { Capsule, Claw, ClawChip } from "../components/ClawMachine";
import { TilePart, WordTiles } from "../components/WordTiles";
import { WordArt } from "../components/WordArt";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// Portrait beats for ch/tch — The Claw Machine. Vertical law from ClawMachine.tsx:
//   150…300 headline · 300…410 claw · 420…640 tiles · 660…740 label
//   760…840 note · 880…1050 prize capsule · 1258 pit floor · 1500+ captions

const CH = "1565C0";
const TCH = "D84315";
const SHORT = "D81B60";  // pink — contrasts with tch's orange-red, unlike ge/dge's two magentas
const CONS = "6A1B9A";
const LONG = "00897B";
export const C_TONES = { CH, TCH, SHORT, CONS, LONG };

const TILE_TOP = 420;
const LABEL_TOP = 660;
const NOTE_TOP = 760;
const CAPSULE_TOP = 850;

export type CNote = { at: number; node: React.ReactNode | null };

export const CSwapNote: React.FC<{ notes: CNote[]; top?: number }> = ({ notes, top = NOTE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let cur: CNote | null = null;
  for (const n of notes) if (frame >= n.at) cur = n;
  if (!cur || !cur.node) return null;
  const s = spring({ frame: frame - cur.at, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `scale(${0.84 + 0.16 * s}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>{cur.node}</div>
    </div>
  );
};

export const CNotes = {
  listen: <ClawChip tone={hex(TCH)}><span style={{ fontSize: 42 }}>👂</span>listen — we build it</ClawChip>,
  caught: <ClawChip tone="#2E7D32"><span style={{ fontSize: 42 }}>🎉</span>that spells <span style={{ color: hex(TCH) }}>catch</span>!</ClawChip>,
  more: <ClawChip tone={hex(TCH)}>three more words <span style={{ fontSize: 40 }}>👇</span></ClawChip>,
  nothingBefore: <ClawChip tone="#6A7B8C">nothing comes before it <span style={{ fontSize: 40 }}>🚩</span></ClawChip>,
  saysName: <ClawChip tone={hex(LONG)}>a long vowel <span style={{ color: hex(LONG) }}>says its own name</span> 🎵</ClawChip>,
  allThree: <ClawChip tone={hex(CH)}>all three of these take <span style={{ color: hex(CH) }}>ch</span> ✅</ClawChip>,
  byHeart: <ClawChip tone="#C62828"><span style={{ fontSize: 40 }}>⭐</span>special words — try to remember them</ClawChip>,
};

// ── hook (0–5) ───────────────────────────────────────────────────────────────
export type CHookCues = {
  sounds: number[]; two: number; writeCh: number; writeTch: number;
  hear: number; hearChair: number; hearCatch: number; same: number;
};

const Burst: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 9 } });
  const ring = ((frame - at) % 30) / 30;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 620, height: 420 }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", width: 260 + ring * 280 + k * 90, height: 260 + ring * 280 + k * 90, borderRadius: "50%", border: `10px solid ${hex(TCH)}`, opacity: (1 - ring) * 0.45 }} />
      ))}
      <div style={{ fontSize: 220, fontWeight: 700, color: "#FFE9A8", fontFamily: font.family, transform: `scale(${0.6 + 0.4 * s})`, textShadow: "0 18px 44px rgba(0,0,0,0.5)" }}>ch!</div>
    </div>
  );
};

// the opening line: a capsule dangling from the claw with a ? inside, and an ear
const MysteryCapsule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, fontFamily: font.family }}>
      <span style={{ fontSize: 140, transform: `scale(${1 + 0.09 * Math.sin((frame / fps) * 4)})` }}>👂</span>
      <div style={{ position: "relative", width: 230, height: 230, borderRadius: "50%", background: "#FFFDF6", border: `10px solid ${hex(TCH)}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: slab(TCH, 18), transform: `translateY(${bob(frame, fps, 10, 2.2)}px) rotate(${wiggle(frame, fps, 2, 4)}deg)` }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: hex(TCH), opacity: 0.22 }} />
        <span style={{ fontSize: 130, fontWeight: 700, color: hex(TCH) }}>?</span>
      </div>
      <ClawChip tone={hex(TCH)}>what sound is in here?</ClawChip>
    </div>
  );
};

const PicCard: React.FC<{ word: string; mark: string; color: string; litAt: number }> = ({ word, mark, color, litAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const lit = frame >= litAt;
  const kick = lit ? 1 + 0.13 * Math.max(0, 1 - (frame - litAt) / 18) : 1;
  const cut = word.indexOf(mark);
  return (
    <div
      style={{
        width: 420, background: lit ? tint(color, 0.9) : "#FFFDF6", border: `9px solid ${c}`, borderRadius: 40,
        padding: "22px 0 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        fontFamily: font.family, boxShadow: slab(color, lit ? 22 : 14),
        transform: `scale(${kick}) translateY(${bob(frame, fps, 8, 2.4)}px)`,
      }}
    >
      <WordArt word={word} size={140} />
      <span style={{ fontSize: 84, fontWeight: 700, color: palette.ink }}>
        {word.slice(0, cut)}
        <span style={{ color: c }}>{mark}</span>
        {word.slice(cut + mark.length)}
      </span>
    </div>
  );
};

export const CHook: React.FC<{ cues: CHookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pair = frame >= cues.hear;
  return (
    <>
      <PHead size={46} still>
        {pair ? (<>Same sound — <span style={{ color: hex(CH) }}>ch</span> and <span style={{ color: hex(TCH) }}>tch</span>!</>) : (<>Listen to this sound 👂</>)}
      </PHead>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {pair ? (
          <>
            <div style={{ display: "flex", gap: 30 }}>
              <PicCard word="chair" mark="ch" color={CH} litAt={cues.hearChair} />
              <PicCard word="catch" mark="tch" color={TCH} litAt={cues.hearCatch} />
            </div>
            {frame >= cues.same && (
              <div style={{ transform: `scale(${spring({ frame: frame - cues.same, fps, config: { damping: 11 } })})` }}>
                <ClawChip tone="#FFE9A8" size={42}>🕹️ one sound, two spellings</ClawChip>
              </div>
            )}
          </>
        ) : frame < cues.sounds[0] ? (
          <MysteryCapsule />
        ) : (
          <>
            {/* the narrator says "Ch!" three times — the burst re-fires on each, rather than
                ringing once and then sitting still for six seconds */}
            <Burst at={cues.sounds.filter((t) => frame >= t).slice(-1)[0]} />
            {frame >= cues.two && (
              <div style={{ display: "flex", gap: 40 }}>
                {[{ t: "ch", c: CH, at: cues.writeCh }, { t: "tch", c: TCH, at: cues.writeTch }].map((x, i) => {
                  const filled = frame >= x.at;
                  const sp = spring({ frame: frame - x.at, fps, config: { damping: 11 } });
                  return (
                    <div
                      key={x.t}
                      style={{
                        width: 300, height: 230, borderRadius: 36,
                        background: filled ? tint(x.c, 0.9) : "#FFFDF6CC",
                        border: `9px ${filled ? "solid" : "dashed"} ${filled ? hex(x.c) : "#8FA6BC"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 110, fontWeight: 700, color: hex(x.c), fontFamily: font.family,
                        boxShadow: filled ? slab(x.c, 22) : slab("0C2440", 10),
                        transform: `scale(${(filled ? 0.8 + 0.2 * sp : 1) * (frame >= x.at && frame < x.at + 20 ? 1.1 : 1)}) translateY(${bob(frame, fps, 7, 2.4, i)}px)`,
                      }}
                    >
                      {filled ? x.t : "?"}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

// ── lookBefore (6–7) ─────────────────────────────────────────────────────────
// The claw grips the a of catch. `chair` has NOTHING before its ch, which is the other half of
// the rule, so it gets an explicit ∅ marker rather than a claw pointing at empty space.
export const CLookBefore: React.FC<{ ruleAt: number }> = ({ ruleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = frame >= ruleAt;
  return (
    <>
      <PHead size={46}>
        {on ? (<>Look at the vowel <span style={{ color: hex(SHORT) }}>right before</span> 🔎</>) : (<>Which one do we write? 🤔</>)}
      </PHead>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 54 }}>
        <div
          style={{
            position: "relative", background: "#FFFDF6", border: `9px solid ${hex(TCH)}`, borderRadius: 34,
            padding: "18px 46px", fontSize: 104, fontWeight: 700, color: palette.ink,
            fontFamily: font.family, boxShadow: slab(TCH, 17),
            transform: `translateY(${bob(frame, fps, 7, 2.4)}px)`,
          }}
        >
          c
          <span style={{ position: "relative", display: "inline-block" }}>
            a
            {on && <Claw at={ruleAt} mountTop={470} />}
          </span>
          <span style={{ color: hex(TCH) }}>tch</span>
        </div>
        <div
          style={{
            position: "relative", background: "#FFFDF6", border: `9px solid ${hex(CH)}`, borderRadius: 34,
            padding: "18px 46px", fontSize: 104, fontWeight: 700, color: palette.ink,
            fontFamily: font.family, boxShadow: slab(CH, 17),
            transform: `translateY(${bob(frame, fps, 7, 2.4, 1)}px)`,
          }}
        >
          {on && (
            <span style={{ display: "inline-block", width: 62, height: 62, borderRadius: 14, border: "6px dashed #8FA6BC", marginRight: 14, verticalAlign: "middle" }} />
          )}
          <span style={{ color: hex(CH) }}>ch</span>air
        </div>
        {!on ? (
          <span style={{ fontSize: 130 }}>🤔</span>
        ) : (
          <div style={{ transform: `scale(${spring({ frame: frame - ruleAt, fps, config: { damping: 12 } })})` }}>
            <ClawChip tone="#E8B84B">🕹️ the claw grabs the vowel before</ClawChip>
          </div>
        )}
      </div>
    </>
  );
};

// ── a worked word, rebuilt on each named example ────────────────────────────
export type CCaseCues = { intro?: number; rule?: number; build: number; done: number; label: number; more: number[] };

export const CCase: React.FC<{
  head: React.ReactNode; base: TilePart[]; endingColor: string; focusLabel?: string; focusColor: string;
  cues: CCaseCues; examples: { parts: TilePart[]; word: string }[]; baseWord: string;
  introNode?: React.ReactNode; ruleLabel?: string; notes?: CNote[]; clawAt?: number;
}> = ({ head, base, endingColor, focusLabel, focusColor, cues, examples, baseWord, introNode, ruleLabel = "short vowel", notes = [], clawAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = -1;
  for (let i = 0; i < cues.more.length; i++) if (frame >= cues.more[i]) idx = i;
  const preRule = cues.rule !== undefined && frame >= cues.rule && frame < cues.build;
  const preIntro = cues.intro !== undefined && frame >= cues.intro && frame < (cues.rule ?? cues.build);
  const parts = idx < 0 ? base : examples[idx].parts;
  const word = idx < 0 ? baseWord : examples[idx].word;
  const enterAt = idx < 0 ? cues.build : cues.more[idx];
  return (
    <>
      <PHead size={44}>{head}</PHead>
      {preIntro || preRule ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 510, display: "flex", justifyContent: "center" }}>
          {preRule ? (
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
      ) : (
        <>
          <WordTiles
            key={idx}
            parts={parts}
            endingColor={endingColor}
            focusLabel={focusLabel}
            focusColor={focusColor}
            enterAt={enterAt}
            endingAt={idx < 0 ? cues.done : cues.more[idx] + 4}
            labelAt={idx < 0 ? cues.label : cues.more[idx] + 8}
            depth3d
            tileTop={TILE_TOP}
            labelTop={LABEL_TOP}
            focusOverlay={clawAt !== undefined && idx < 0 ? <Claw at={clawAt} /> : undefined}
          />
          {/* the word's picture, in a prize capsule below the row */}
          <div style={{ position: "absolute", left: 0, right: 0, top: CAPSULE_TOP, display: "flex", justifyContent: "center" }}>
            <Capsule key={word} colorHex={endingColor} at={enterAt}>
              <WordArt word={word} size={140} />
            </Capsule>
          </div>
        </>
      )}
      {!preRule && !preIntro && <CSwapNote notes={notes} />}
    </>
  );
};

// the card each case beat opens on
export const CPlaceCard: React.FC<{ n: string; label: string; emoji: string; tone: string }> = ({ n, label, emoji, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  return (
    <div style={{ background: tint(tone, 0.9), border: `10px solid ${c}`, borderRadius: 44, padding: "34px 56px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: font.family, boxShadow: slab(tone, 20), transform: `scale(${0.86 + 0.14 * spring({ frame, fps, config: { damping: 12 } })}) translateY(${bob(frame, fps, 7, 2.6)}px)` }}>
      <span style={{ fontSize: 110 }}>{emoji}</span>
      <span style={{ fontSize: 62, fontWeight: 700, color: c }}>{n}</span>
      <span style={{ fontSize: 50, fontWeight: 700, color: palette.ink, textAlign: "center" }}>{label}</span>
    </div>
  );
};

// ── "everywhere else → ch" (18) ─────────────────────────────────────────────
export const CChIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <PHead size={46}>Most of the time → write <span style={{ color: hex(CH) }}>ch</span></PHead>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
        <div style={{ background: tint(CH, 0.9), border: `12px solid ${hex(CH)}`, borderRadius: 50, padding: "44px 110px", fontSize: 230, fontWeight: 700, color: hex(CH), fontFamily: font.family, boxShadow: slab(CH, 28), transform: `scale(${0.8 + 0.2 * spring({ frame, fps, config: { damping: 11 } })}) translateY(${bob(frame, fps, 8, 3)}px)` }}>
          ch
        </div>
      </div>
    </>
  );
};

// ── the rule breakers (28–33) ───────────────────────────────────────────────
export type CBreakCues = {
  warn: number; few: number; words: [number, number, number, number];
  shortToo: number; byHeart: number; longer: number; ostrich: number; attach: number;
};

const BreakerCard: React.FC<{ word: string; lit: boolean; at: number; underline: boolean; small?: boolean }> = ({ word, lit, at, underline, small = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(CH);
  const cut = word.lastIndexOf("ch");
  return (
    <div
      style={{
        background: lit ? tint(CH, 0.9) : "#FFFDF6", border: `7px solid ${lit ? c : "#8FA6BC"}`,
        borderRadius: 26, padding: small ? "10px 20px" : "12px 28px",
        fontSize: small ? 50 : 62, fontWeight: 700, fontFamily: font.family, color: palette.ink, whiteSpace: "nowrap",
        boxShadow: slab(lit ? CH : "0C2440", lit ? 16 : 9),
        transform: `scale(${(0.74 + 0.26 * s) * (lit ? 1.04 : 1)}) translateY(${bob(frame, fps, 6, 2.4)}px)`,
      }}
    >
      {word.slice(0, cut - 1)}
      <span style={underline ? { color: hex(SHORT), borderBottom: `7px solid ${hex(SHORT)}`, paddingBottom: 1 } : undefined}>{word.slice(cut - 1, cut)}</span>
      <span style={{ color: c }}>ch</span>
    </div>
  );
};

export const CBreakers: React.FC<{ cues: CBreakCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = ["much", "such", "rich", "which"];
  const any = frame >= cues.words[0];
  const longer = frame >= cues.longer;
  return (
    <>
      <PHead size={44}>
        {longer ? "A few longer ones too 📚" : frame >= cues.byHeart ? "Special words to remember ⭐" : "But watch out! ⚠️"}
      </PHead>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {/* the rule cracking */}
        {frame >= cues.warn && frame < cues.words[0] && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, fontFamily: font.family }}>
            <span style={{ fontSize: 150, transform: `scale(${0.7 + 0.3 * spring({ frame: frame - cues.warn, fps, config: { damping: 9 } })}) rotate(${wiggle(frame, fps, 3, 5)}deg)` }}>⚠️</span>
            {frame >= cues.few && (
              <div style={{ display: "flex", gap: 18 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ width: 180, height: 100, borderRadius: 24, border: "6px dashed #8FA6BC", background: "#FFFDF655", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 700, color: "#8FA6BC", transform: `translateY(${bob(frame, fps, 5, 2.4, i)}px)` }}>{i + 1}</div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* the four, lighting one at a time on their own spoken word */}
        {any && (
          <>
            <div style={{ display: "flex", gap: 22 }}>
              {W.slice(0, 2).map((w, i) => (
                <BreakerCard key={w} word={w} at={cues.words[i]} lit={frame >= cues.words[i]} underline={frame >= cues.shortToo} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 22 }}>
              {W.slice(2).map((w, i) => (
                <BreakerCard key={w} word={w} at={cues.words[i + 2]} lit={frame >= cues.words[i + 2]} underline={frame >= cues.shortToo} />
              ))}
            </div>
          </>
        )}
        {/* they SHOULD take tch — shown, then crossed out */}
        {frame >= cues.shortToo && !longer && (
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: font.family }}>
            <span style={{ fontSize: 34, fontWeight: 700, color: "#FFE9A8" }}>short vowels → should be</span>
            <div style={{ position: "relative", background: "#fff", border: `6px solid ${hex(TCH)}`, color: hex(TCH), borderRadius: 20, padding: "6px 22px", fontSize: 46, fontWeight: 700 }}>
              tch
              <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
                <line x1="6%" y1="12%" x2="94%" y2="88%" stroke="#C62828" strokeWidth={8} strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 34 }}>➜</span>
            <div style={{ background: hex(CH), color: "#fff", borderRadius: 20, padding: "6px 26px", fontSize: 46, fontWeight: 700 }}>ch</div>
          </div>
        )}
        {frame >= cues.byHeart && !longer && (
          <div style={{ transform: `scale(${spring({ frame: frame - cues.byHeart, fps, config: { damping: 11 } })})` }}>{CNotes.byHeart}</div>
        )}
        {/* two longer ones, each arriving on its own spoken word */}
        {longer && (
          <div style={{ display: "flex", gap: 22, marginTop: 6 }}>
            <BreakerCard word="ostrich" at={cues.ostrich} lit={frame >= cues.ostrich} underline small />
            <BreakerCard word="attach" at={cues.attach} lit={frame >= cues.attach} underline small />
          </div>
        )}
      </div>
    </>
  );
};

// the recap's closing line
export const CPocket: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1075, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "#C62828", color: "#fff", borderRadius: 999, padding: "14px 44px",
          fontSize: 44, fontWeight: 700, fontFamily: font.family, whiteSpace: "nowrap",
          boxShadow: slab("C62828", 17),
          transform: `scale(${0.6 + 0.4 * s}) rotate(${wiggle(frame, fps, 2, 1.4)}deg)`,
        }}
      >
        ⭐ don't forget those special words!
      </div>
    </div>
  );
};
