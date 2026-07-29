import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { hex, slab, tint } from "../data/tokens";
import { TilePart, WordTiles } from "../components/WordTiles";
import { Connector } from "../components/Connector";
import { Ear, PHead } from "../components/PortraitBeatKit";
import {
  Chute, DISPENSER_FLOOR, Gumball, G_TONES, HARD_CHUTE, SOFT_CHUTE, TowerChip, TUBE_X0, TUBE_X1,
} from "../components/GumballWorld";

// ── hard/soft g, 9:16 — the beat overlays ────────────────────────────────────
// LAYOUT. Same derivation discipline as the c portrait: every row comes from the
// one above it and the result is asserted against the lower chute at module load.
// A chute is 96 tall (12 + 60 + 12 of padding, with the 7px borders inside).
const CHUTE_H = 96;
const PIC_TOP = 496;
const PIC_H = 118;
// WordTiles draws the picture with lineHeight 0, which CENTRES the glyph on the
// coordinate given — passing the band's top put half of it on the chute above.
const PIC_CY = PIC_TOP + PIC_H / 2;                      // 575
const TILE_TOP = PIC_TOP + PIC_H + 36;                   // 650
const TILE_H = 190;
const TILE_SLAB = 18 + 16;
const LABEL_TOP = TILE_TOP + TILE_H + TILE_SLAB + 26;    // 900
const LABEL_H = 56;
const NOTE_TOP = LABEL_TOP + LABEL_H + 34;               // 990
const NOTE_H = 60;

if (SOFT_CHUTE + CHUTE_H + 30 >= PIC_TOP) {
  throw new Error(`g 9:16: soft chute ends ${SOFT_CHUTE + CHUTE_H}, picture starts ${PIC_TOP}`);
}
if (NOTE_TOP + NOTE_H + 26 > HARD_CHUTE) {
  throw new Error(`g 9:16: note ends ${NOTE_TOP + NOTE_H}, hard chute starts ${HARD_CHUTE}`);
}

const { SOFT, HARD, DEC, TRICK } = G_TONES;
const CENTER = (TUBE_X0 + TUBE_X1) / 2;
const INNER_W = TUBE_X1 - TUBE_X0 - 140;
const INNER_X = TUBE_X0 + 70;

export const ruleLine = (text: string, color: string): React.ReactNode =>
  text.split("**").map((part, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: hex(color), fontWeight: 800 }}>{part}</span>
      : <span key={i}>{part}</span>
  );

export type Cued = { at: number; node: React.ReactNode | null };
const latest = (list: Cued[], frame: number): Cued | undefined =>
  list.filter((n) => frame >= n.at).slice(-1)[0];

const Note: React.FC<{ at: number; tone: string; children: React.ReactNode; top?: number }> = ({ at, tone, children, top = NOTE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const c = hex(tone);
  return (
    <div style={{ position: "absolute", top, left: INNER_X, width: INNER_W, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: "#fff", border: `5px solid ${c}`, borderRadius: 999, padding: "10px 30px", fontSize: 38, fontWeight: 700, color: "#26331F", boxShadow: slab(tone, 10), textAlign: "center", transform: `scale(${0.9 + 0.1 * s}) translateY(${bob(frame, fps, 4, 2.7)}px)` }}>
        {children}
      </div>
    </div>
  );
};

const Slot: React.FC<{ top: number; height: number; tone: string }> = ({ top, height, tone }) => (
  <div style={{ position: "absolute", top, left: INNER_X, width: INNER_W, height, borderRadius: 28, border: `7px dashed ${tint(tone, 0.5)}`, boxSizing: "border-box" }} />
);

// ── hook (phrases 0-9) ───────────────────────────────────────────────────────
export type PGHookCues = {
  letter: number; pop: number; two: number; likeC: number; first: number;
  goatSlot: number; goat: number; goatSound: number;
  gemSlot: number; gem: number; gemSound: number; same: number; makingTwo: number;
};

const HOOK_CARD_H = 160;
const HOOK_GEM_TOP = 510;
const HOOK_GOAT_TOP = 740;
const HOOK_NOTE_TOP = 966;
if (HOOK_GEM_TOP + HOOK_CARD_H + 32 + 20 > HOOK_GOAT_TOP) {
  throw new Error("g 9:16 hook: the two word cards overlap");
}
if (HOOK_NOTE_TOP + NOTE_H + 26 > HARD_CHUTE) {
  throw new Error("g 9:16 hook: the note runs into the hard chute");
}

export const PGHook: React.FC<{ cues: PGHookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // frame 0 is the upload thumbnail, so a cue of 0 is drawn still, not mid-spring
  const big = cues.letter === 0 ? 1 : spring({ frame: frame - cues.letter, fps, config: { damping: 12 } });
  const head = latest([
    { at: 0, node: "Look at this letter" },
    { at: cues.two, node: ruleLine("One letter, **two gumballs**", DEC) },
    { at: cues.likeC, node: ruleLine("just like **c**", DEC) },
    { at: cues.gemSound, node: ruleLine("**/j/** on top · **/g/** below", SOFT) },
  ], frame);
  return (
    <>
      <PHead still={frame < cues.two}>{head?.node}</PHead>

      {frame < cues.first && (
        <>
          <div style={{ position: "absolute", top: 560, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
            <div style={{ fontSize: 300, fontWeight: 800, color: hex(DEC), lineHeight: 1, transform: `scale(${(0.72 + 0.28 * big) * (frame >= cues.pop && frame < cues.pop + 12 ? 1 + 0.14 * Math.sin(((frame - cues.pop) / 12) * Math.PI) : 1)}) translateY(${bob(frame, fps, 9, 3)}px)`, textShadow: "0 18px 0 rgba(0,0,0,0.12)" }}>g</div>
          </div>
          {frame >= cues.pop && (
            <div style={{ position: "absolute", top: 900, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
              <TowerChip tone={DEC} at={cues.pop} size={44}>{frame >= cues.likeC ? "the same secret as c" : "the letter g"}</TowerChip>
            </div>
          )}
        </>
      )}

      {frame >= cues.first && (
        <>
          <Chute at={cues.first} top={SOFT_CHUTE} tone={SOFT} sound="/j/" name="SOFT GUMBALL" dim={frame < cues.gemSound} />
          <Chute at={cues.first} top={HARD_CHUTE} tone={HARD} sound="/g/" name="HARD GUMBALL" dim={frame < cues.goatSound} />

          {frame >= cues.gemSlot && frame < cues.gem && <Slot top={HOOK_GEM_TOP} height={HOOK_CARD_H} tone={SOFT} />}
          {frame >= cues.gem && <HookWord at={cues.gem} top={HOOK_GEM_TOP} tone={SOFT} word="gem" emoji="💎" sound="/j/" lit={frame >= cues.gemSound} />}

          {frame >= cues.goatSlot && frame < cues.goat && <Slot top={HOOK_GOAT_TOP} height={HOOK_CARD_H} tone={HARD} />}
          {frame >= cues.goat && <HookWord at={cues.goat} top={HOOK_GOAT_TOP} tone={HARD} word="goat" emoji="🐐" sound="/g/" lit={frame >= cues.goatSound} />}

          {frame >= cues.same && (
            <Note at={cues.same} tone={DEC} top={HOOK_NOTE_TOP}>
              {frame >= cues.makingTwo
                ? ruleLine("the same g — **two different sounds**", DEC)
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
        position: "absolute", top, left: INNER_X, width: INNER_W, height: HOOK_CARD_H,
        display: "flex", alignItems: "center", gap: 24, padding: "0 30px", boxSizing: "border-box",
        background: "#fff", border: `8px solid ${lit ? c : tint(tone, 0.45)}`, borderRadius: 28,
        boxShadow: slab(lit ? tone : "A8B8A8", 16),
        transform: `scale(${0.88 + 0.12 * s}) translateY(${bob(frame, fps, 5, 3)}px)`,
      }}
    >
      <span style={{ fontSize: 92, lineHeight: 0, display: "flex", alignItems: "center" }}>{emoji}</span>
      <span style={{ fontSize: 96, fontWeight: 800, letterSpacing: 2, color: "#26331F" }}>
        <span style={{ color: lit ? c : "#26331F" }}>g</span>{word.slice(1)}
      </span>
      {lit && (
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <Gumball tone={tone} size={48} />
          <span style={{ fontSize: 58, fontWeight: 800, color: "#fff", background: c, borderRadius: 18, padding: "4px 18px" }}>{sound}</span>
        </span>
      )}
    </div>
  );
};

// ── lookAfter (phrases 10-12) ────────────────────────────────────────────────
export const PGLookAfter: React.FC<{ askAt: number; secretAt: number; afterAt: number; pivotAt: number }> = ({ askAt, secretAt, afterAt, pivotAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <PHead from={askAt}>
        {frame >= pivotAt ? ruleLine("Look at the letter **after** the g", DEC) : "So how do we know?"}
      </PHead>

      {/* the c rule, handed over to g — the script says "the same secret we used for c" */}
      {frame >= secretAt && (
        <div style={{ position: "absolute", top: 560, left: INNER_X, width: INNER_W, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
          {[{ l: "c", t: DEC }, { l: "g", t: SOFT }].map((it, i) => {
            const at = i === 0 ? secretAt : afterAt;
            if (frame < at) return <div key={it.l} style={{ width: 180, height: 180, borderRadius: 34, border: `7px dashed ${tint(it.t, 0.5)}`, boxSizing: "border-box" }} />;
            const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
            return (
              <React.Fragment key={it.l}>
                {i === 1 && <span style={{ fontSize: 74, transform: `translateX(${6 * Math.sin((frame / fps) * 4)}px)` }}>➡️</span>}
                <div style={{ width: 180, height: 180, borderRadius: 34, background: "#fff", border: `8px solid ${hex(it.t)}`, boxShadow: slab(it.t, 16), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, fontWeight: 800, color: hex(it.t), boxSizing: "border-box", transform: `scale(${0.82 + 0.18 * s}) translateY(${bob(frame, fps, 5, 2.6 + i * 0.3)}px)` }}>
                  {it.l}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {frame >= afterAt && (
        <div style={{ position: "absolute", top: 830, left: INNER_X, width: INNER_W, display: "flex", justifyContent: "center", gap: 16 }}>
          {["g", "e"].map((L, i) => (
            <div key={L} style={{ width: 130, height: 150, borderRadius: 26, background: "#fff", border: `7px solid ${hex(i === 1 && frame >= pivotAt ? DEC : "B7C9B7")}`, boxShadow: slab(i === 1 && frame >= pivotAt ? DEC : "B7C9B7", 12), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 92, fontWeight: 800, color: hex(i === 1 && frame >= pivotAt ? DEC : "6E7F6E"), boxSizing: "border-box", transform: `translateY(${bob(frame, fps, 4, 2.7 + i * 0.3)}px)` }}>
              {L}
            </div>
          ))}
        </div>
      )}
      {frame >= pivotAt && <Note at={pivotAt} tone={DEC} top={1020}>{ruleLine("the letter **after** decides", DEC)}</Note>}
    </>
  );
};

// ── rule (phrases 13-18) ─────────────────────────────────────────────────────
export const PGRule: React.FC<{
  headAt: number; threeAt: number; letterAt: number[]; ruleAt: number; nextAt: number; softAt: number;
}> = ({ headAt, threeAt, letterAt, ruleAt, nextAt, softAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <PHead from={headAt}>
        {frame >= softAt ? ruleLine("the g goes **soft**", SOFT) : frame >= threeAt ? ruleLine("Remember the **three** letters?", DEC) : "Here is the rule."}
      </PHead>

      {frame >= threeAt && (
        <div style={{ position: "absolute", top: 540, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 40 }}>
          {["e", "i", "y"].map((L, i) => {
            const at = letterAt[i];
            if (frame < at) return <div key={L} style={{ width: 190, height: 190, borderRadius: 34, border: `7px dashed ${tint(DEC, 0.5)}`, boxSizing: "border-box" }} />;
            const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
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
        <Connector at={ruleAt} x1={CENTER} y1={760} x2={CENTER} y2={SOFT_CHUTE + CHUTE_H + 26} color={SOFT} dip={-40} dur={20} label={frame >= ruleAt + 14 ? "soft" : undefined} />
      )}
      {frame >= softAt && <Chute at={softAt} top={SOFT_CHUTE} tone={SOFT} sound="/j/" name="SOFT GUMBALL" />}
      {frame >= ruleAt && (
        <Note at={ruleAt} tone={SOFT} top={840}>
          {frame >= softAt ? ruleLine("**e, i or y** next → a **soft** gumball", SOFT) : ruleLine("when g sees **e, i or y** coming next…", DEC)}
        </Note>
      )}
    </>
  );
};

// ── a word case (phrases 19-25 soft, 26-35 hard) ─────────────────────────────
export type PGCaseCues = {
  partsAt: number[]; wordAt: number; labelAt: number;
  heads: Cued[]; notes?: Cued[];
  preNode?: React.ReactNode; preUntil?: number;
};

export const PGCase: React.FC<{
  soft: boolean; parts: TilePart[]; emoji: string; cues: PGCaseCues; focusLabel: string; activeLitAt?: number;
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

      <Chute at={0} top={SOFT_CHUTE} tone={SOFT} sound="/j/" name="SOFT GUMBALL" dim={!live || !soft} still />
      <Chute at={0} top={HARD_CHUTE} tone={HARD} sound="/g/" name="HARD GUMBALL" dim={!live || soft} still />

      {showPre && cues.preNode}

      {/* the picture has not arrived while the word is being sounded out */}
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

/** A big gumball with sound rings, held while a case is introduced. */
export const SoundBall: React.FC<{ tone: string; sound: string; captions?: Cued[]; ringsFrom?: number }> = ({ tone, sound, captions = [], ringsFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  const t = frame / fps;
  const caption = latest(captions, frame)?.node;
  // gap 34: the caption below carries slab(tone, 12), whose face is drawn 28px BELOW it
  return (
    <div style={{ position: "absolute", top: PIC_TOP - 10, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={{ position: "relative", width: 330, height: 330, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {frame >= ringsFrom && [0, 1, 2].map((k) => {
          const ph = ((t * 0.9) - k * 0.33) % 1;
          const p = ph < 0 ? ph + 1 : ph;
          return <div key={k} style={{ position: "absolute", width: 180 + p * 200, height: 180 + p * 200, borderRadius: 999, border: `6px solid ${c}`, opacity: 0.5 * (1 - p) }} />;
        })}
        <div style={{ width: 210, height: 210, borderRadius: 999, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 78, fontWeight: 800, color: "#fff", boxShadow: `inset -14px -14px 0 ${hex(tone)}, inset 18px 18px 0 ${tint(tone, 0.4)}`, transform: `scale(${1 + 0.05 * Math.sin(t * 5)}) translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
          {sound}
        </div>
      </div>
      {caption && (
        <div style={{ background: "#fff", border: `6px solid ${c}`, borderRadius: 999, padding: "10px 32px", fontSize: 42, fontWeight: 800, color: "#26331F", boxShadow: slab(tone, 12), transform: `translateY(${bob(frame, fps, 4, 3)}px)` }}>
          {caption}
        </div>
      )}
    </div>
  );
};

// ── the rule-breakers (phrases 36-46) ────────────────────────────────────────
// get · give · girl · gift · begin · tiger. This beat is why g could not be cut
// below 3:00 the way c was: drop it and the video teaches that "get" is said
// "jet". Each word arrives looking SOFT and its gumball flips to HARD on the line
// that says so — which is precisely "should be soft, but it is not".
export type PGBreakCues = {
  warn: number; some: number; anyway: number; listen: number;
  words: number[]; shouldBe: number; flip: number; sight: number;
};

const TRICKY: [string, string][] = [
  ["g", "et"], ["g", "ive"], ["g", "irl"], ["g", "ift"], ["be", "gin"], ["ti", "ger"],
];
const BR_TOP = 500;
const BR_ROW_H = 84;
const BR_GAP = 16;
const BR_BOTTOM = BR_TOP + 6 * BR_ROW_H + 5 * BR_GAP;   // 1084
if (SOFT_CHUTE + CHUTE_H + 22 > BR_TOP) {
  throw new Error("g 9:16 breakers: first row sits on the soft chute");
}
if (BR_BOTTOM + 26 > HARD_CHUTE + CHUTE_H) {
  // the six rows are allowed to reach past the chute's TOP only if the chute is hidden
  // in this beat, which it is — but never past the base.
  if (BR_BOTTOM + 26 > DISPENSER_FLOOR) {
    throw new Error(`g 9:16 breakers: rows end ${BR_BOTTOM}, base at ${DISPENSER_FLOOR}`);
  }
}

export const PGBreakers: React.FC<{ cues: PGBreakCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = latest([
    { at: cues.warn, node: ruleLine("Something **important**", TRICK) },
    { at: cues.some, node: ruleLine("**e** or **i** next… but still **hard**", TRICK) },
    { at: cues.shouldBe, node: ruleLine("should be soft — but it is **not**!", TRICK) },
    { at: cues.sight, node: ruleLine("learn these by **sight**", TRICK) },
  ], frame);
  return (
    <>
      <PHead from={cues.warn}>{head?.node}</PHead>

      {/* no chutes here: these words defy them, and six rows need the height */}
      <div style={{ position: "absolute", top: BR_TOP, left: INNER_X, width: INNER_W, display: "flex", flexDirection: "column", gap: BR_GAP }}>
        {TRICKY.map(([a, b], i) => {
          const at = cues.words[i];
          if (frame < at) {
            return <div key={a + b} style={{ height: BR_ROW_H, borderRadius: 22, border: `6px dashed ${tint(TRICK, 0.5)}`, boxSizing: "border-box" }} />;
          }
          const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
          const flipped = frame >= cues.flip;
          const c = hex(flipped ? HARD : SOFT);
          return (
            <div
              key={a + b}
              style={{
                height: BR_ROW_H, borderRadius: 22, background: "#fff",
                border: `6px solid ${c}`, boxShadow: slab(flipped ? HARD : SOFT, 10),
                display: "flex", alignItems: "center", gap: 20, padding: "0 24px", boxSizing: "border-box",
                transform: `scale(${0.9 + 0.1 * s}) translateY(${bob(frame, fps, 3, 2.5 + i * 0.18)}px)`,
              }}
            >
              <Gumball tone={SOFT} size={50} flipAt={cues.flip} flipTo={HARD} />
              <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: 1, color: "#26331F" }}>
                {a}
                <span style={{ color: hex(DEC), background: tint(DEC, 0.82), borderRadius: 8, padding: "0 6px" }}>{b.slice(0, 1)}</span>
                {b.slice(1)}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 42, fontWeight: 800, color: c }}>
                {flipped ? "/g/" : "/j/ ?"}
              </span>
            </div>
          );
        })}
      </div>

      {frame >= cues.anyway && frame < cues.listen && (
        <div style={{ position: "absolute", top: BR_BOTTOM + 26, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <TowerChip tone={TRICK} at={cues.anyway} size={40}>the g stays hard anyway</TowerChip>
        </div>
      )}
      {/* "Listen to these." used to only REMOVE a chip, which the sheet flagged as
          barely a change. It now brings the listening cue in. */}
      {frame >= cues.listen && frame < cues.shouldBe && (
        <div style={{ position: "absolute", top: BR_BOTTOM + 10, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          <Ear size={96} color={hex(TRICK)} />
          <TowerChip tone={TRICK} at={cues.listen} size={40}>listen to these six</TowerChip>
        </div>
      )}
      {frame >= cues.sight && (
        <div style={{ position: "absolute", top: BR_BOTTOM + 26, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <TowerChip tone={HARD} at={cues.sight} size={40}>know them by sight ✓</TowerChip>
        </div>
      )}
    </>
  );
};

// ── quiz (phrases 47-52) ─────────────────────────────────────────────────────
export const PGQuiz: React.FC<{
  slotAt: number; wordAt: number; askAt: number; askAt2: number; revealAt: number; whyAt: number;
}> = ({ slotAt, wordAt, askAt, askAt2, revealAt, whyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  const CARD_TOP = 640;
  return (
    <>
      <PHead from={0}>{frame >= revealAt ? ruleLine("It is **hard**!", HARD) : "Now it's your turn!"}</PHead>

      {/* the two chutes ARE the answer — which gumball does this word drop? */}
      <Chute at={0} top={SOFT_CHUTE} tone={SOFT} sound="/j/" name="SOFT GUMBALL" dim still />
      <Chute at={0} top={HARD_CHUTE} tone={HARD} sound="/g/" name={frame >= revealAt ? "✓ THIS ONE" : "HARD GUMBALL"} dim={frame < revealAt} still />

      {frame < slotAt && (
        <div style={{ position: "absolute", top: CARD_TOP + 60, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <TowerChip tone={DEC} at={0} size={46}>which gumball drops?</TowerChip>
        </div>
      )}
      {frame >= slotAt && frame < wordAt && <Slot top={CARD_TOP} height={200} tone={DEC} />}
      {frame >= wordAt && (
        <div style={{ position: "absolute", top: CARD_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", border: `9px solid ${hex(frame >= revealAt ? HARD : DEC)}`, borderRadius: 34, padding: "20px 50px", boxShadow: slab(frame >= revealAt ? HARD : DEC, 20), display: "flex", alignItems: "center", gap: 26, transform: `scale(${0.88 + 0.12 * s}) translateY(${bob(frame, fps, 5, 3)}px)` }}>
            <span style={{ fontSize: 100, lineHeight: 0, display: "flex", alignItems: "center" }}>🌿</span>
            <span style={{ fontSize: 126, fontWeight: 800, letterSpacing: 3, color: "#26331F" }}>
              <span style={{ color: hex(frame >= revealAt ? HARD : "26331F") }}>g</span>
              <span style={{ color: hex(DEC), background: frame >= whyAt ? tint(DEC, 0.78) : "transparent", borderRadius: 10, padding: frame >= whyAt ? "0 6px" : 0 }}>r</span>
              een
            </span>
          </div>
        </div>
      )}

      {/* "Is this g hard…" draws the route down; "…or is it soft?" draws it up */}
      {frame >= askAt && (
        <Connector
          at={askAt} x1={640} y1={CARD_TOP + 200} x2={640} y2={HARD_CHUTE - 18}
          color={HARD} dashed={frame < revealAt} dip={0} dur={18}
          // no label after the reveal: this route SURVIVES (hard is the answer), so its
          // mid-line label landed on the note below the card. The lit chute already
          // says "THIS ONE", so the label has nothing left to add.
          label={frame >= revealAt ? undefined : "hard?"}
        />
      )}
      {frame >= askAt2 && frame < revealAt && (
        <Connector at={askAt2} x1={440} y1={CARD_TOP} x2={440} y2={SOFT_CHUTE + CHUTE_H + 18} color={SOFT} dashed dip={0} dur={18} label="soft?" />
      )}

      {frame >= whyAt && <Note at={whyAt} tone={HARD} top={CARD_TOP + 236}>{ruleLine("**r** is not e, i or y", DEC)}</Note>}
    </>
  );
};

// ── recap (phrases 53-60) ────────────────────────────────────────────────────
// Three cards, because g has three things to remember and c only had two: soft,
// hard, and the tricky friends that break the rule.
export const PGRecap: React.FC<{
  headAt: number; softAt: number; softWordAt: number; jAt: number;
  hardAt: number; hardWordAt: number; gAt: number;
  trickAt: number; trickWords: number[];
}> = ({ headAt, softAt, softWordAt, jAt, hardAt, hardWordAt, gAt, trickAt, trickWords }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CARD_H = 160;
  const A_TOP = 450;
  const B_TOP = A_TOP + CARD_H + 50;   // 660
  const C_TOP = B_TOP + CARD_H + 50;   // 870
  if (C_TOP + CARD_H + 40 > HARD_CHUTE) {
    throw new Error(`g 9:16 recap: third card ends ${C_TOP + CARD_H}, chute at ${HARD_CHUTE}`);
  }
  const card = (at: number, tone: string, top: number, letters: string, sound: string, when: string, verdictAt: number, litAt: number) => {
    if (frame < at) return null;
    const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
    const c = hex(tone);
    const shown = frame >= verdictAt;
    const lit = frame >= litAt;
    return (
      <div style={{ position: "absolute", top, left: INNER_X, width: INNER_W, height: CARD_H, boxSizing: "border-box", background: "#fff", border: `8px solid ${c}`, borderRadius: 30, padding: "16px 28px", boxShadow: slab(tone, 16), transform: `scale(${0.92 + 0.08 * s}) translateY(${bob(frame, fps, 5, 2.7)}px)` }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#7A8B7C", letterSpacing: 2, marginBottom: 8 }}>{when}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: letters.length > 8 ? 48 : 70, fontWeight: 800, color: c, letterSpacing: 3 }}>{letters}</span>
          {shown ? (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
              <Gumball tone={tone} size={44} />
              <span style={{ fontSize: 62, fontWeight: 800, color: lit ? "#fff" : c, background: lit ? c : "transparent", borderRadius: 16, padding: "2px 18px", transform: `scale(${lit ? 1 + 0.05 * Math.sin((frame / fps) * 6) : 1})` }}>{sound}</span>
            </span>
          ) : (
            <span style={{ marginLeft: "auto", width: 130, height: 66, borderRadius: 16, border: `5px dashed ${tint(tone, 0.5)}`, boxSizing: "border-box" }} />
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      <PHead from={headAt}>{frame >= trickAt ? ruleLine("and our **tricky friends**", TRICK) : "Let's remember it together"}</PHead>
      {/* three dashed frames while the head says "let's remember it together": g has
          THREE things to remember, and without these the tube was empty for the line. */}
      {frame < softAt && [A_TOP, B_TOP, C_TOP].map((t, i) => (
        <div key={t} style={{ position: "absolute", top: t, left: INNER_X, width: INNER_W, height: CARD_H, borderRadius: 30, border: `7px dashed ${tint([SOFT, HARD, TRICK][i], 0.5)}`, boxSizing: "border-box" }} />
      ))}
      {card(softAt, SOFT, A_TOP, "e · i · y", "/j/", "BEFORE — USUALLY SOFT", softWordAt, jAt)}
      {card(hardAt, HARD, B_TOP, "everywhere else", "/g/", "AND — HARD", hardWordAt, gAt)}

      {/* the third card fills word by word as the four are named */}
      {frame >= trickAt && (
        <div style={{ position: "absolute", top: C_TOP, left: INNER_X, width: INNER_W, height: CARD_H, boxSizing: "border-box", background: "#fff", border: `8px solid ${hex(TRICK)}`, borderRadius: 30, padding: "16px 28px", boxShadow: slab(TRICK, 16), transform: `translateY(${bob(frame, fps, 5, 2.9)}px)` }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#7A8B7C", letterSpacing: 2, marginBottom: 10 }}>BUT DON'T FORGET</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {["get", "give", "girl", "gift"].map((w, i) => {
              if (frame < trickWords[i]) {
                return <span key={w} style={{ width: 168, height: 62, borderRadius: 14, border: `4px dashed ${tint(TRICK, 0.5)}`, boxSizing: "border-box" }} />;
              }
              const s = spring({ frame: frame - trickWords[i], fps, config: { damping: 12 } });
              return (
                <span key={w} style={{ width: 168, height: 62, borderRadius: 14, background: tint(TRICK, 0.86), border: `4px solid ${hex(TRICK)}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 800, color: hex(TRICK), transform: `scale(${0.86 + 0.14 * s})` }}>
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export const PG_TONES = { SOFT, HARD, DEC, TRICK };
