import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { hex, slab, tint } from "../data/tokens";
import { TilePart, WordTiles } from "../components/WordTiles";
import { Connector } from "../components/Connector";
import { PHead } from "../components/PortraitBeatKit";
import {
  FloorSign, HARD_LANDING, LIFT_TONES, LiftChip, LOBBY_FLOOR, SHAFT_X0, SHAFT_X1, SOFT_LANDING,
} from "../components/LiftWorld";

// ── hard/soft c, 9:16 — the beat overlays ────────────────────────────────────
// LAYOUT. Everything lives BETWEEN the two landing signs, derived downward from
// the soft sign and asserted against the hard sign at module load. The 16:9 build
// shipped text drawn inside a slab's extruded face three times because gaps were
// typed by feel, so no y-coordinate below is a guess.
//
// A landing sign is 96 tall (12 + 64 + 12 of padding).
const SIGN_H = 96;
const PIC_TOP = 496;
const PIC_H = 118;
// WordTiles draws the picture with lineHeight 0, which CENTRES the glyph on the
// coordinate it is given — so passing the band's TOP put half the glyph above the
// band and onto the landing sign. Same class of bug as the baseline-alignment one.
const PIC_CY = PIC_TOP + PIC_H / 2;                    // 575
const TILE_TOP = PIC_TOP + PIC_H + 36;                 // 650
const TILE_H = 190;
const TILE_SLAB = 18 + 16;                             // slab(c, 18) draws depth+16 BELOW
const LABEL_TOP = TILE_TOP + TILE_H + TILE_SLAB + 26;  // 900
const LABEL_H = 56;
const NOTE_TOP = LABEL_TOP + LABEL_H + 34;             // 990
const NOTE_H = 60;

if (SOFT_LANDING + SIGN_H + 30 >= PIC_TOP) {
  throw new Error(`c 9:16: soft sign ends ${SOFT_LANDING + SIGN_H}, picture starts ${PIC_TOP}`);
}
if (NOTE_TOP + NOTE_H + 26 > HARD_LANDING) {
  throw new Error(`c 9:16: note ends ${NOTE_TOP + NOTE_H}, hard sign starts ${HARD_LANDING}`);
}

const { SOFT, HARD, DEC, SH } = LIFT_TONES;
const CENTER = (SHAFT_X0 + SHAFT_X1) / 2;
// inset 70 each side, not 46: the right rail spans x 973..995 and an 848-wide
// row ended at 964, so the five /sh/ rows visually touched it.
const INNER_W = SHAFT_X1 - SHAFT_X0 - 140;

/** Bold + tinted keywords in a kid-facing line. Split on ** so no long chains. */
export const ruleLine = (text: string, color: string): React.ReactNode =>
  text.split("**").map((part, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: hex(color), fontWeight: 800 }}>{part}</span>
      : <span key={i}>{part}</span>
  );

export type Cued = { at: number; node: React.ReactNode | null };

/** Pick the last cue that has fired. Used for heads and notes so a beat's text can
 *  change several times without each change needing its own component. */
const latest = (list: Cued[], frame: number): Cued | undefined =>
  list.filter((n) => frame >= n.at).slice(-1)[0];

/** A note pill in the fixed note band. */
const Note: React.FC<{ at: number; tone: string; children: React.ReactNode; top?: number }> = ({ at, tone, children, top = NOTE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(tone);
  return (
    <div style={{ position: "absolute", top, left: SHAFT_X0 + 70, width: INNER_W, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: "#fff", border: `5px solid ${c}`, borderRadius: 999, padding: "10px 30px", fontSize: 38, fontWeight: 700, color: "#3A2B4F", boxShadow: slab(tone, 10), textAlign: "center", transform: `scale(${0.9 + 0.1 * s}) translateY(${bob(frame, fps, 4, 2.7)}px)` }}>
        {children}
      </div>
    </div>
  );
};

/** A dashed placeholder, so a slot that is coming is never a hole in the frame. */
const Slot: React.FC<{ top: number; height: number; tone: string; wide?: boolean }> = ({ top, height, tone, wide = true }) => (
  <div style={{ position: "absolute", top, left: SHAFT_X0 + 70, width: wide ? INNER_W : INNER_W / 2, height, borderRadius: 28, border: `7px dashed ${tint(tone, 0.5)}`, boxSizing: "border-box" }} />
);

// ── hook (phrases 0-9) ───────────────────────────────────────────────────────
// The letter arrives, then each word rides to its own floor.
export type PCHookCues = {
  letter: number; pop: number; two: number; first: number; catSlot: number; cat: number; catSound: number;
  citySlot: number; city: number; citySound: number; same: number; butTwo: number;
};

const HOOK_CARD_H = 160;
const HOOK_CITY_TOP = 510;
const HOOK_CAT_TOP = 740;   // 510 + 160 + 32 of slab + 38 of gap
const HOOK_NOTE_TOP = 966;  // 740 + 160 + 32 of slab + 34 of gap
if (HOOK_CITY_TOP + HOOK_CARD_H + 32 + 20 > HOOK_CAT_TOP) {
  throw new Error("c 9:16 hook: the two word cards overlap");
}
if (HOOK_CAT_TOP + HOOK_CARD_H + 32 + 20 > HOOK_NOTE_TOP) {
  throw new Error("c 9:16 hook: the note lands on the cat card");
}
if (HOOK_NOTE_TOP + NOTE_H + 26 > HARD_LANDING) {
  throw new Error("c 9:16 hook: the note runs into the hard landing");
}

export const PCHook: React.FC<{ cues: PCHookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The hook owns frame 0, which is the upload thumbnail: a mid-spring element makes
  // it an incomplete cover, so the letter is drawn still when its cue is frame 0.
  const big = cues.letter === 0 ? 1 : spring({ frame: frame - cues.letter, fps, config: { damping: 12 } });
  const head = latest([
    { at: 0, node: "Look at this letter" },
    { at: cues.two, node: ruleLine("One letter, **two floors**", DEC) },
    { at: cues.citySound, node: ruleLine("**/s/** upstairs · **/k/** downstairs", SOFT) },
  ], frame);
  return (
    <>
      <PHead still={frame < cues.two}>{head?.node}</PHead>

      {frame < cues.first && (
        <>
          <div style={{ position: "absolute", top: 560, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
            {/* "C." gets its own moment: the letter thumps and is named */}
            <div style={{ fontSize: 300, fontWeight: 800, color: hex(DEC), lineHeight: 1, transform: `scale(${(0.72 + 0.28 * big) * (frame >= cues.pop && frame < cues.pop + 12 ? 1 + 0.14 * Math.sin(((frame - cues.pop) / 12) * Math.PI) : 1)}) translateY(${bob(frame, fps, 9, 3)}px)`, textShadow: "0 18px 0 rgba(0,0,0,0.12)" }}>c</div>
          </div>
          {frame >= cues.pop && (
            <div style={{ position: "absolute", top: 900, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
              <LiftChip tone={DEC} at={cues.pop} size={44}>the letter c</LiftChip>
            </div>
          )}
        </>
      )}

      {frame >= cues.first && (
        <>
          <FloorSign at={cues.first} top={SOFT_LANDING} tone={SOFT} sound="/s/" emoji="🐍" name="SOFT FLOOR" dim={frame < cues.citySound} />
          <FloorSign at={cues.first} top={HARD_LANDING} tone={HARD} sound="/k/" emoji="🥁" name="HARD FLOOR" dim={frame < cues.catSound} />

          {frame >= cues.citySlot && frame < cues.city && <Slot top={HOOK_CITY_TOP} height={HOOK_CARD_H} tone={SOFT} />}
          {frame >= cues.city && <HookWord at={cues.city} top={HOOK_CITY_TOP} tone={SOFT} word="city" emoji="🏙️" sound="/s/" lit={frame >= cues.citySound} />}

          {frame >= cues.catSlot && frame < cues.cat && <Slot top={HOOK_CAT_TOP} height={HOOK_CARD_H} tone={HARD} />}
          {frame >= cues.cat && <HookWord at={cues.cat} top={HOOK_CAT_TOP} tone={HARD} word="cat" emoji="🐱" sound="/k/" lit={frame >= cues.catSound} />}

          {frame >= cues.same && (
            <Note at={cues.same} tone={DEC} top={HOOK_NOTE_TOP}>
              {frame >= cues.butTwo
                ? ruleLine("the same c — **two different sounds**", DEC)
                : ruleLine("the **same** letter", DEC)}
            </Note>
          )}
        </>
      )}
    </>
  );
};

const HookWord: React.FC<{ at: number; top: number; tone: string; word: string; emoji: string; sound: string; lit: boolean }> = ({ at, top, tone, word, emoji, sound, lit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 13 } });
  const c = hex(tone);
  return (
    <div
      style={{
        position: "absolute", top, left: SHAFT_X0 + 70, width: INNER_W, height: HOOK_CARD_H,
        display: "flex", alignItems: "center", gap: 26, padding: "0 30px", boxSizing: "border-box",
        background: "#fff", border: `8px solid ${lit ? c : tint(tone, 0.45)}`, borderRadius: 28,
        boxShadow: slab(lit ? tone : "B0A2C4", 16),
        transform: `scale(${0.88 + 0.12 * s}) translateY(${bob(frame, fps, 5, 3)}px)`,
      }}
    >
      <span style={{ fontSize: 96, lineHeight: 0, display: "flex", alignItems: "center" }}>{emoji}</span>
      <span style={{ fontSize: 100, fontWeight: 800, letterSpacing: 2, color: "#3A2B4F" }}>
        <span style={{ color: lit ? c : "#3A2B4F" }}>c</span>{word.slice(1)}
      </span>
      {lit && (
        <span style={{ marginLeft: "auto", fontSize: 62, fontWeight: 800, color: "#fff", background: c, borderRadius: 18, padding: "4px 20px", transform: `scale(${1 + 0.05 * Math.sin((frame / fps) * 6)})` }}>{sound}</span>
      )}
    </div>
  );
};

// ── lookAfter (phrases 10-13) ────────────────────────────────────────────────
// The reversal, shown: two rows whose arrows point opposite ways.
export const PCLookAfter: React.FC<{ askAt: number; beforeAt: number; flipAt: number; afterAt: number; pivotAt: number }> = ({ askAt, beforeAt, flipAt, afterAt, pivotAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const row = (top: number, label: string, tone: string, dir: -1 | 1, at: number, dim: boolean, ring: boolean) => {
    if (frame < at) return null;
    const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
    const c = hex(tone);
    return (
      <div style={{ position: "absolute", top, left: SHAFT_X0 + 70, width: INNER_W, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, opacity: dim ? 0.36 : 1, transform: `scale(${0.9 + 0.1 * s}) translateY(${dim ? 0 : bob(frame, fps, 4, 2.8)}px)` }}>
        <div style={{ background: "#fff", border: `7px solid ${c}`, borderRadius: 26, padding: "14px 24px", boxShadow: slab(tone, 14), display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: dir < 0 ? c : "#C7BBD8" }}>a</span>
          <span style={{ fontSize: 72, fontWeight: 800, color: hex(DEC) }}>c</span>
          <span style={{ fontSize: 72, fontWeight: 800, color: dir > 0 ? c : "#C7BBD8", background: ring ? tint(tone, 0.8) : "transparent", borderRadius: 10, padding: ring ? "0 8px" : 0 }}>e</span>
        </div>
        <div style={{ fontSize: 66, transform: `translateX(${dir * 7 * Math.sin((frame / fps) * 4)}px)` }}>{dir < 0 ? "⬅️" : "➡️"}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: c, letterSpacing: 1, maxWidth: 210, lineHeight: 1.15 }}>{label}</div>
      </div>
    );
  };
  return (
    <>
      <PHead from={askAt}>
        {frame >= pivotAt ? ruleLine("Look at the letter **after** the c", DEC) : "So how do we know?"}
      </PHead>
      {row(560, "THE LETTER BEFORE", "6A7B8C", -1, beforeAt, frame >= flipAt, false)}
      {frame >= flipAt && frame < afterAt && (
        <Note at={flipAt} tone={DEC} top={820}>{ruleLine("this time, the **other way**", DEC)}</Note>
      )}
      {row(900, "THE LETTER AFTER", DEC, 1, afterAt, false, frame >= pivotAt)}
    </>
  );
};

// ── rule (phrases 14-19) ─────────────────────────────────────────────────────
export const PCRule: React.FC<{
  headAt: number; threeAt: number; letterAt: number[]; ruleAt: number; nextAt: number; softAt: number;
}> = ({ headAt, threeAt, letterAt, ruleAt, nextAt, softAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <PHead from={headAt}>
        {frame >= softAt ? ruleLine("the c goes **soft**", SOFT) : frame >= threeAt ? ruleLine("Three **special** letters", DEC) : "Here is the rule!"}
      </PHead>

      {frame >= threeAt && (
        <div style={{ position: "absolute", top: 540, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 40 }}>
          {["e", "i", "y"].map((L, i) => {
            const at = letterAt[i];
            if (frame < at) {
              return <div key={L} style={{ width: 190, height: 190, borderRadius: 34, border: `7px dashed ${tint(DEC, 0.5)}`, boxSizing: "border-box" }} />;
            }
            const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
            // all three pulse together once "coming next" is spoken
            const pulse = frame >= nextAt ? 1 + 0.06 * Math.sin((frame / fps) * 6 + i * 0.7) : 1;
            return (
              <div key={L} style={{ width: 190, height: 190, borderRadius: 34, background: "#fff", border: `8px solid ${hex(DEC)}`, boxShadow: slab(DEC, 16), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, fontWeight: 800, color: hex(DEC), boxSizing: "border-box", transform: `scale(${(0.8 + 0.2 * s) * pulse}) translateY(${bob(frame, fps, 5, 2.6 + i * 0.2)}px)` }}>
                {L}
              </div>
            );
          })}
        </div>
      )}

      {frame >= ruleAt && (
        <Connector at={ruleAt} x1={CENTER} y1={760} x2={CENTER} y2={SOFT_LANDING + SIGN_H + 26} color={SOFT} dip={-40} dur={20} label={frame >= ruleAt + 14 ? "goes UP" : undefined} />
      )}
      {frame >= softAt && <FloorSign at={softAt} top={SOFT_LANDING} tone={SOFT} sound="/s/" emoji="🐍" name="SOFT FLOOR" />}
      {frame >= ruleAt && (
        <Note at={ruleAt} tone={SOFT} top={840}>
          {frame >= softAt ? ruleLine("**e, i or y** next → the **soft** floor", SOFT) : ruleLine("when c sees **e, i or y** coming next…", DEC)}
        </Note>
      )}
    </>
  );
};

// ── a word case: soft c or hard c ────────────────────────────────────────────
// Both landings stay on screen and the ACTIVE one lights. That is the per-line
// change, and it guarantees neither sign is ever covered by the content between.
export type PCCaseCues = {
  listen: number; partsAt: number[]; wordAt: number; labelAt: number;
  heads: Cued[]; notes?: Cued[];
  preNode?: React.ReactNode; preUntil?: number;   // fills the tile band before "Listen."
};

export const PCCase: React.FC<{
  soft: boolean; parts: TilePart[]; emoji: string; cues: PCCaseCues; focusLabel: string;
  // Both signs stay dim until the line that names the floor. Lighting the active one
  // at beat start answered the question before the narrator asked it.
  activeLitAt?: number;
}> = ({ soft, parts, emoji, cues, focusLabel, activeLitAt = 0 }) => {
  const frame = useCurrentFrame();
  const tone = soft ? SOFT : HARD;
  const head = latest(cues.heads, frame);
  const note = latest(cues.notes ?? [], frame);
  const showPre = cues.preNode !== undefined && cues.preUntil !== undefined && frame < cues.preUntil;
  const live = frame >= activeLitAt;
  return (
    <>
      <PHead from={cues.heads[0]?.at ?? 0}>{head?.node}</PHead>

      <FloorSign at={0} top={SOFT_LANDING} tone={SOFT} sound="/s/" emoji="🐍" name="SOFT FLOOR" dim={!live || !soft} still />
      <FloorSign at={0} top={HARD_LANDING} tone={HARD} sound="/k/" emoji="🥁" name="HARD FLOOR" dim={!live || soft} still />

      {showPre && cues.preNode}

      {/* While the word is being sounded out its picture has not arrived yet, which
          left the whole picture band empty for three lines. A dashed frame holds the
          space and reads as "a picture is coming". */}
      {!showPre && frame < cues.wordAt && (
        <div style={{ position: "absolute", top: PIC_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 168, height: PIC_H, borderRadius: 26, border: `6px dashed ${tint(tone, 0.45)}`, boxSizing: "border-box" }} />
        </div>
      )}

      {!showPre && (
        <WordTiles
          parts={parts}
          endingColor={tone}
          focusColor={DEC}
          focusLabel={focusLabel}
          enterAt={cues.partsAt[0]}
          partsAt={cues.partsAt}
          labelAt={cues.labelAt}
          emoji={frame >= cues.wordAt ? emoji : undefined}
          tileTop={TILE_TOP}
          labelTop={LABEL_TOP}
          emojiTop={PIC_CY}
          emojiSize={118}
        />
      )}

      {note?.node && <Note at={note.at} tone={tone}>{note.node}</Note>}
    </>
  );
};

/** The big sound character shown while a case is being introduced: a snake that
 *  hisses for /s/, a drum that thumps for /k/. Keeps the shaft alive for the 5s
 *  before "Listen." — an empty stage over a long line was a repeated complaint. */
export const SoundCreature: React.FC<{ emoji: string; tone: string; captions?: Cued[]; ringsFrom?: number }> = ({ emoji, tone, captions = [], ringsFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  const t = frame / fps;
  const caption = latest(captions, frame)?.node;
  // gap 34, not 26: the caption below carries slab(tone, 12), whose extruded face is
  // drawn 12 + 16 = 28px BELOW it, so a 26px gap draws the rings inside that face.
  return (
    <div style={{ position: "absolute", top: PIC_TOP - 10, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={{ position: "relative", width: 340, height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {frame >= ringsFrom && [0, 1, 2].map((k) => {
          const phase = ((t * 0.9) - k * 0.33) % 1;
          const p = phase < 0 ? phase + 1 : phase;
          return (
            <div key={k} style={{ position: "absolute", width: 170 + p * 210, height: 170 + p * 210, borderRadius: 999, border: `6px solid ${c}`, opacity: 0.55 * (1 - p) }} />
          );
        })}
        <span style={{ fontSize: 230, lineHeight: 0, display: "flex", alignItems: "center", transform: `scale(${1 + 0.05 * Math.sin(t * 5)}) translateY(${bob(frame, fps, 8, 2.6)}px)` }}>{emoji}</span>
      </div>
      {caption && (
        <div style={{ background: "#fff", border: `6px solid ${c}`, borderRadius: 999, padding: "10px 32px", fontSize: 42, fontWeight: 800, color: "#3A2B4F", boxShadow: slab(tone, 12), transform: `translateY(${bob(frame, fps, 4, 3)}px)` }}>
          {caption}
        </div>
      )}
    </div>
  );
};

// ── more words of one kind (phrases 37-40) ───────────────────────────────────
export const PCMoreWords: React.FC<{
  headAt: number; at: number[]; words: { w: string; emoji: string }[]; tone: string; head: React.ReactNode; sound: string;
}> = ({ headAt, at, words, tone, head, sound }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  const ROW_H = 176;
  const GAP = 24;
  const TOP = 450;
  if (TOP + words.length * ROW_H + (words.length - 1) * GAP + 30 > HARD_LANDING) {
    throw new Error("c 9:16 more-words: rows run into the hard landing");
  }
  return (
    <>
      <PHead from={headAt}>{head}</PHead>
      <FloorSign at={0} top={HARD_LANDING} tone={HARD} sound="/k/" emoji="🥁" name="HARD FLOOR" still />
      <div style={{ position: "absolute", top: TOP, left: SHAFT_X0 + 70, width: INNER_W, display: "flex", flexDirection: "column", gap: GAP }}>
        {words.map((it, i) => {
          if (frame < at[i]) {
            return <div key={it.w} style={{ height: ROW_H, borderRadius: 30, border: `7px dashed ${tint(tone, 0.5)}`, boxSizing: "border-box" }} />;
          }
          const s = spring({ frame: frame - at[i], fps, config: { damping: 12 } });
          return (
            <div key={it.w} style={{ height: ROW_H, borderRadius: 30, background: "#fff", border: `8px solid ${c}`, boxShadow: slab(tone, 16), display: "flex", alignItems: "center", gap: 28, padding: "0 32px", boxSizing: "border-box", transform: `scale(${0.9 + 0.1 * s}) translateY(${bob(frame, fps, 4, 2.6 + i * 0.25)}px)` }}>
              <span style={{ fontSize: 92, lineHeight: 0, display: "flex", alignItems: "center" }}>{it.emoji}</span>
              <span style={{ fontSize: 88, fontWeight: 800, letterSpacing: 2, color: "#3A2B4F" }}>
                <span style={{ color: c }}>c</span>{it.w.slice(1)}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 54, fontWeight: 800, color: c }}>{sound}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ── the /sh/ family (phrases 41-58) ──────────────────────────────────────────
// The five words that break the /s/ half of the rule. This beat is why the video
// runs to 3:11: without it the rule would misteach ocean and special. Its closing
// line says the pattern has its own video, so nothing is claimed that isn't taught.
export type PCShCues = {
  intro: number; look: number; words: number[]; allSoft: number;
  notS: number; saysSh: number; ends: number; endsAt: number[];
  rule: number; twoVowels: number; own: number; ownVideo: number;
};

const SH_WORDS: [string, string, string][] = [
  ["spe", "cial", "⭐"],
  ["pre", "cious", "💎"],
  ["musi", "cian", "🎻"],
  ["an", "cient", "🏺"],
  ["o", "cean", "🌊"],
];

const SH_ROW_TOP = 490;
const SH_ROW_H = 80;
const SH_ROW_GAP = 16;
const SH_ROWS_BOTTOM = SH_ROW_TOP + 5 * SH_ROW_H + 4 * SH_ROW_GAP; // 954
const SH_FOOT_TOP = SH_ROWS_BOTTOM + 40;                            // 994
if (SOFT_LANDING + SIGN_H + 22 > SH_ROW_TOP) {
  throw new Error("c 9:16 /sh/: first row sits on the landing sign");
}
if (SH_FOOT_TOP + 74 > HARD_LANDING) {
  throw new Error(`c 9:16 /sh/: footer ends ${SH_FOOT_TOP + 74}, landing at ${HARD_LANDING}`);
}

export const PCShFamily: React.FC<{ cues: PCShCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(SH);
  const head = latest([
    { at: cues.intro, node: "One more thing to know…" },
    { at: cues.look, node: ruleLine("Five words with a **soft c**", SOFT) },
    { at: cues.saysSh, node: ruleLine("This soft c says **/sh/**", SH) },
    { at: cues.ends, node: ruleLine("Look how each one **ends**", SH) },
  ], frame);
  return (
    <>
      <PHead from={cues.intro}>{head?.node}</PHead>
      {/* These five words DO have a soft c, so the soft landing is shown from the
          start (dim) and is replaced by the third floor once /sh/ is named. Waiting
          until then left the landing band empty for the beat's first nine lines. */}
      {frame < cues.saysSh
        ? <FloorSign at={cues.intro} top={SOFT_LANDING} tone={SOFT} sound="/s/" emoji="🐍" name="SOFT FLOOR" dim />
        : <FloorSign at={cues.saysSh} top={SOFT_LANDING} tone={SH} sound="/sh/" emoji="🤫" name="THIRD FLOOR" />}

      <div style={{ position: "absolute", top: SH_ROW_TOP, left: SHAFT_X0 + 70, width: INNER_W, display: "flex", flexDirection: "column", gap: SH_ROW_GAP }}>
        {SH_WORDS.map(([stem, end, art], i) => {
          const at = cues.words[i];
          if (frame < at) {
            return <div key={end} style={{ height: SH_ROW_H, borderRadius: 22, border: `6px dashed ${tint(SOFT, 0.5)}`, boxSizing: "border-box" }} />;
          }
          const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
          const hint = frame >= cues.ends;              // every ending gets a dashed box
          const endLit = frame >= cues.endsAt[i];       // then fills on its own spoken cue
          const vowels = frame >= cues.twoVowels;
          return (
            <div
              key={end}
              style={{
                height: SH_ROW_H, borderRadius: 22, background: "#fff",
                border: `6px solid ${endLit ? c : hex(SOFT)}`, boxShadow: slab(endLit ? SH : SOFT, 10),
                display: "flex", alignItems: "center", gap: 18, padding: "0 24px", boxSizing: "border-box",
                transform: `scale(${0.9 + 0.1 * s}) translateY(${bob(frame, fps, 3, 2.5 + i * 0.18)}px)`,
              }}
            >
              <span style={{ fontSize: 50, lineHeight: 0, display: "flex", alignItems: "center" }}>{art}</span>
              <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: 1, color: "#3A2B4F" }}>
                {stem}
                <span
                  style={{
                    color: endLit ? c : hex(SOFT),
                    background: endLit ? tint(SH, 0.82) : "transparent",
                    border: hint && !endLit ? `3px dashed ${tint(SH, 0.4)}` : "3px solid transparent",
                    borderRadius: 8, padding: "0 6px",
                  }}
                >
                  {/* once "two vowels" is spoken, the two vowels after the c carry the tint */}
                  {vowels ? <>{end.slice(0, 1)}<span style={{ background: tint(DEC, 0.75), borderRadius: 5 }}>{end.slice(1, 3)}</span>{end.slice(3)}</> : end}
                </span>
              </span>
              {endLit && <span style={{ marginLeft: "auto", fontSize: 42, fontWeight: 800, color: c }}>/sh/</span>}
            </div>
          );
        })}
      </div>

      {/* footer band: one thing at a time, so nothing ever stacks here */}
      {frame >= cues.allSoft && frame < cues.notS && (
        <div style={{ position: "absolute", top: SH_FOOT_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <LiftChip tone={SOFT} at={cues.allSoft} size={44}>every one has a soft c</LiftChip>
        </div>
      )}
      {frame >= cues.notS && frame < cues.rule && (
        <div style={{ position: "absolute", top: SH_FOOT_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 26, alignItems: "center" }}>
          <WrongCard at={cues.notS} label="/s/" />
          {frame >= cues.saysSh && <LiftChip tone={SH} at={cues.saysSh} size={50}>/sh/ ✓</LiftChip>}
        </div>
      )}
      {/* "That is a rule of its own, AND IT HAS ITS OWN VIDEO" runs 3.3s, so the
          promise of another video is its own moment — a play badge, not just text. */}
      {frame >= cues.rule && frame < cues.ownVideo && (
        <Note at={cues.rule} tone={SH} top={SH_FOOT_TOP}>
          {frame >= cues.own
            ? ruleLine("that is a rule of its **own**", SH)
            : ruleLine("c + **two vowels** → **/sh/**", SH)}
        </Note>
      )}
      {frame >= cues.ownVideo && (
        <div style={{ position: "absolute", top: SH_FOOT_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <LiftChip tone={SH} at={cues.ownVideo} size={44}>▶ it has its own video</LiftChip>
        </div>
      )}
    </>
  );
};

const WrongCard: React.FC<{ at: number; label: string }> = ({ at, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const strike = interpolate(frame - at, [6, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", background: "#fff", border: "6px solid #9E9E9E", borderRadius: 999, padding: "8px 30px", fontSize: 50, fontWeight: 800, color: "#9E9E9E", boxShadow: slab("9E9E9E", 10), transform: `scale(${0.9 + 0.1 * s}) translateY(${bob(frame, fps, 3, 2.6)}px)` }}>
      {label}
      <div style={{ position: "absolute", left: 12, right: 12, top: "50%", height: 7, background: "#E53935", borderRadius: 4, transform: `scaleX(${strike})`, transformOrigin: "left center" }} />
    </div>
  );
};

// ── quiz (phrases 59-65) ─────────────────────────────────────────────────────
export const PCQuiz: React.FC<{
  slotAt: number; wordAt: number; askAt: number; askAt2: number; revealAt: number; whyAt: number;
}> = ({ slotAt, wordAt, askAt, askAt2, revealAt, whyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  const CARD_TOP = 640;
  return (
    <>
      <PHead from={0}>{frame >= revealAt ? ruleLine("It is **soft**!", SOFT) : "Now it's your turn!"}</PHead>

      {/* The two landings ARE the answer. Offering a separate pair of HARD/SOFT
          buttons abandoned the world at the exact moment the child has to use it —
          and left the shaft empty on "Now it's your turn!". The floors are the
          question: which one does this word ride to? */}
      <FloorSign at={0} top={SOFT_LANDING} tone={SOFT} sound="/s/" emoji="🐍" name={frame >= revealAt ? "✓ THIS FLOOR" : "SOFT FLOOR"} dim={frame >= revealAt ? false : true} still />
      <FloorSign at={0} top={HARD_LANDING} tone={HARD} sound="/k/" emoji="🥁" name="HARD FLOOR" dim still />

      {frame < slotAt && (
        <div style={{ position: "absolute", top: CARD_TOP + 60, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <LiftChip tone={DEC} at={0} size={46}>which floor will it ride to?</LiftChip>
        </div>
      )}
      {frame >= slotAt && frame < wordAt && <Slot top={CARD_TOP} height={200} tone={DEC} />}
      {frame >= wordAt && (
        <div style={{ position: "absolute", top: CARD_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", border: `9px solid ${hex(frame >= revealAt ? SOFT : DEC)}`, borderRadius: 34, padding: "20px 50px", boxShadow: slab(frame >= revealAt ? SOFT : DEC, 20), display: "flex", alignItems: "center", gap: 26, transform: `scale(${0.88 + 0.12 * s}) translateY(${bob(frame, fps, 5, 3)}px)` }}>
            <span style={{ fontSize: 104, lineHeight: 0, display: "flex", alignItems: "center" }}>🚲</span>
            <span style={{ fontSize: 126, fontWeight: 800, letterSpacing: 3, color: "#3A2B4F" }}>
              <span style={{ color: hex(frame >= revealAt ? SOFT : "3A2B4F") }}>c</span>
              <span style={{ color: hex(DEC), background: frame >= whyAt ? tint(DEC, 0.78) : "transparent", borderRadius: 10, padding: frame >= whyAt ? "0 6px" : 0 }}>y</span>
              cle
            </span>
          </div>
        </div>
      )}

      {/* Two candidate routes drawn out of the card — one down to the hard floor on
          "Is this c hard…", one up to the soft floor on "or is it soft?" — so the two
          halves of the question each get their own moment. On the reveal the wrong
          route fades and the right one goes solid. */}
      {frame >= askAt && frame < revealAt && (
        <Connector
          at={askAt} x1={640} y1={CARD_TOP + 200} x2={640} y2={HARD_LANDING - 18}
          color={HARD} dashed dip={0} dur={18} label="hard?"
        />
      )}
      {frame >= askAt2 && (
        <Connector
          at={askAt2} x1={440} y1={CARD_TOP} x2={440} y2={SOFT_LANDING + SIGN_H + 18}
          color={SOFT} dashed={frame < revealAt} dip={0} dur={18}
          label={frame >= revealAt ? "goes UP" : "soft?"}
        />
      )}

      {frame >= whyAt && <Note at={whyAt} tone={SOFT} top={CARD_TOP + 236}>{ruleLine("**y** comes right after the c", DEC)}</Note>}
    </>
  );
};

// ── recap (phrases 66-69) ────────────────────────────────────────────────────
// Each recap card reveals in three stages — letters, then the sound chip, then the
// chip lights — so both 5.2s and 3.5s closing lines get a change of their own.
export const PCRecap: React.FC<{
  headAt: number; softAt: number; softWordAt: number; sAt: number;
  hardAt: number; hardWordAt: number; kAt: number;
}> = ({ headAt, softAt, softWordAt, sAt, hardAt, hardWordAt, kAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CARD_H = 190;
  const A_TOP = 520;
  const B_TOP = A_TOP + CARD_H + 80; // 790
  if (B_TOP + CARD_H + 40 > HARD_LANDING) {
    throw new Error("c 9:16 recap: second card runs into the hard landing");
  }
  const card = (at: number, tone: string, top: number, letters: string, sound: string, when: string, verdict: string, verdictAt: number, litAt: number) => {
    if (frame < at) return null;
    const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
    const c = hex(tone);
    const shown = frame >= verdictAt;
    const lit = frame >= litAt;
    return (
      <div style={{ position: "absolute", top, left: SHAFT_X0 + 70, width: INNER_W, height: CARD_H, boxSizing: "border-box", background: "#fff", border: `8px solid ${c}`, borderRadius: 30, padding: "20px 30px", boxShadow: slab(tone, 18), transform: `scale(${0.92 + 0.08 * s}) translateY(${bob(frame, fps, 5, 2.7)}px)` }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#8B7BA8", letterSpacing: 2, marginBottom: 10 }}>{when}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: letters.length > 8 ? 52 : 76, fontWeight: 800, color: c, letterSpacing: 3 }}>{letters}</span>
          <span style={{ fontSize: 34, fontWeight: 800, color: shown ? c : "transparent", letterSpacing: 1 }}>{verdict}</span>
          {shown ? (
            <span style={{ marginLeft: "auto", fontSize: 68, fontWeight: 800, color: lit ? "#fff" : c, background: lit ? c : "transparent", borderRadius: 18, padding: "2px 22px", transform: `scale(${lit ? 1 + 0.05 * Math.sin((frame / fps) * 6) : 1})` }}>{sound}</span>
          ) : (
            <span style={{ marginLeft: "auto", width: 140, height: 76, borderRadius: 18, border: `5px dashed ${tint(tone, 0.5)}`, boxSizing: "border-box" }} />
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      <PHead from={headAt}>Let's remember it together</PHead>
      {/* the landings stay, dim: dropping them left "Let's remember it together" on a
          completely empty shaft, and the recap is a summary OF the two floors */}
      <FloorSign at={0} top={SOFT_LANDING} tone={SOFT} sound="/s/" emoji="🐍" name="SOFT FLOOR" dim still />
      <FloorSign at={0} top={HARD_LANDING} tone={HARD} sound="/k/" emoji="🥁" name="HARD FLOOR" dim still />
      {card(softAt, SOFT, A_TOP, "e · i · y", "/s/", "BEFORE", "SOFT", softWordAt, sAt)}
      {card(hardAt, HARD, B_TOP, "everywhere else", "/k/", "AND", "HARD", hardWordAt, kAt)}
    </>
  );
};

export const PC_LAYOUT = { PIC_TOP, TILE_TOP, LABEL_TOP, NOTE_TOP, SIGN_H, SH_ROWS_BOTTOM, LOBBY_FLOOR };
export const PC_TONES = { SOFT, HARD, DEC, SH };
