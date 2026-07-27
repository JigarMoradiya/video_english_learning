import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { Lightbulb } from "../components/Graphics";
import { CkWordChip } from "../components/CkWordChip";
import { illustrationFor } from "../data/wordImages";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";
import { Mascot } from "../components/Mascot";

type BeatProps = { data: PhonicsComparison; beat: Beat };

// 16:9 centre beats: the mascot sits on the LEFT, and only a big EMOJI heads the
// title. Stacking the mascot above the title made the column taller than the lifted
// Center could hold, so his head was clipped by the top of the frame.
const BeatEmoji: React.FC<{ char: string }> = ({ char }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span
      style={{
        fontSize: 104,
        lineHeight: 1,
        display: "inline-block",
        transform: `scale(${pulse(frame, fps, 0.05, 1.5)}) translateY(${bob(frame, fps, 7, 2.4)}px) rotate(${wiggle(frame, fps, 4, 2.2)}deg)`,
      }}
    >
      {char}
    </span>
  );
};

// Mascot parked on the left of the centre stage, clear of every card row.
const SideMascot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top: "50%",
        transform: `translateY(calc(-50% + ${bob(frame, fps, 10, 2.3)}px))`,
      }}
    >
      <Mascot size={190} />
    </div>
  );
};

// ── shared bits ──────────────────────────────────────────────────────────────

// A keyword pill living in the top "headline" band (above the Word Street panels).
const Pill: React.FC<{ from?: number; color?: string; children: React.ReactNode }> = ({
  from = 0,
  color = palette.ink,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 12 } });
  if (frame < from) return null;
  return (
    <div
      style={{
        transform: `scale(${s}) translateY(${bob(frame, fps, 6, 2.6)}px)`,
        background: "#ffffffe6",
        border: `4px solid ${color}`,
        borderRadius: 999,
        padding: "16px 46px",
        fontSize: 60,
        fontWeight: 700,
        color: palette.ink,
        boxShadow: `0 14px 34px ${palette.cardShadow}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const kw = (text: string, color: string) => <span style={{ color, fontWeight: 700 }}>{text}</span>;

// top-band container. `top` defaults to 100: the 5% title-safe inset on a 1080-tall
// frame is 54px, and the pills used to start at 36–54, i.e. inside the unsafe band.
const Band: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 100 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: top, pointerEvents: "none" }}>
    {children}
  </AbsoluteFill>
);

// Centre stage, ANCHORED FROM THE TOP at a known-safe y. It used to centre the
// column inside a bottom-padded box: when the column grew taller than that box,
// flexbox overflowed it equally at both ends and clipped the header off the top of
// the frame. Growing downward from paddingTop can only ever eat into the slack
// above the caption band, which is harmless.
const STAGE_TOP = 110; // just clear of the 96px title-safe line
const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: STAGE_TOP, pointerEvents: "none" }}>
    {children}
  </AbsoluteFill>
);

// ── ① Hook — title pill only ──────────────────────────────────────────────────
// The big /k/ badge used to drop here at marginTop 40 and land on top of the middle
// zone's street sign. The /k/ moment now lives INSIDE the three panels (WordStreet's
// SoundCard), which also fills the slot that used to be empty for the first 12s.
export const Hook: React.FC<BeatProps> = () => (
  <Band>
    <Pill from={0}>3 ways to spell /k/! 🔑</Pill>
  </Band>
);

// ── ② Three spellings, one sound — c/k/ck badges → one /k/ ───────────────────
export const ThreeOne: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oneAt = Math.max(0, beat.word("one"));
  const titleS = spring({ frame, fps, config: { damping: 12 } });
  const chipAt = [8, 18, 28];
  return (
    <Band>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div
          style={{
            transform: `scale(${titleS}) translateY(${bob(frame, fps, 5, 2.6)}px)`,
            background: "#ffffffe6",
            border: `4px solid ${palette.cardShadow}`,
            borderRadius: 999,
            padding: "12px 40px",
            fontSize: 52,
            fontWeight: 700,
            color: palette.ink,
            boxShadow: `0 12px 30px ${palette.cardShadow}`,
            whiteSpace: "nowrap",
          }}
        >
          {frame >= oneAt ? <>three spellings = {kw("one /k/ sound!", "#2E7D32")}</> : "three spellings…"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {data.teams.map((t, i) => {
            const s = spring({ frame: frame - chipAt[i], fps, config: { damping: 10 } });
            const c = hex(t.colorHex);
            return (
              <div
                key={i}
                style={{
                  transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.2, i)}px)`,
                  background: c,
                  color: "#fff",
                  borderRadius: 18,
                  padding: "4px 26px",
                  fontSize: 50,
                  fontWeight: 700,
                  boxShadow: `0 10px 24px ${c}55`,
                }}
              >
                {t.marker}
              </div>
            );
          })}
          {frame >= oneAt && (
            <>
              <div style={{ fontSize: 48, fontWeight: 700, color: palette.ink }}>→</div>
              <div
                style={{
                  transform: `scale(${spring({ frame: frame - oneAt, fps, config: { damping: 9 } })})`,
                  background: "#2E7D32",
                  color: "#fff",
                  borderRadius: 18,
                  padding: "4px 30px",
                  fontSize: 54,
                  fontWeight: 700,
                  boxShadow: "0 10px 26px #2E7D3255",
                }}
              >
                /k/
              </div>
            </>
          )}
        </div>
      </div>
    </Band>
  );
};

// ── ③ Same-sound tag ─────────────────────────────────────────────────────────
export const SameTag: React.FC<BeatProps> = () => (
  <Band>
    <Pill from={6}>same sound → three spellings</Pill>
  </Band>
);

// ── ④ Puzzle — lightbulb + "which one?" ──────────────────────────────────────
export const Puzzle: React.FC<BeatProps> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = Math.max(0, beat.fRel(28.96));
  const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
  return (
    <Band>
      {/* bulb INLINE with the pill — stacked it pushed past the band and onto the
          middle zone's street sign */}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <Pill from={0}>which one do we use? 🤔</Pill>
      {frame >= at && (
        <div
          style={{
            transform: `scale(${s})`,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 18px 44px ${palette.cardShadow}`,
          }}
        >
          <Lightbulb size={86} />
        </div>
      )}
      </div>
    </Band>
  );
};

// ── ⑤ Rule c ─────────────────────────────────────────────────────────────────
export const RuleC: React.FC<BeatProps> = ({ data }) => (
  <Band>
    <Pill from={4} color={hex(data.teams[0].colorHex)}>
      before {kw("a, o, u", hex(data.teams[0].colorHex))} → use {kw("c", hex(data.teams[0].colorHex))}
    </Pill>
  </Band>
);

// ── ⑥ Rule k — headline + the soft-c "c says /s/" callout ────────────────────
export const RuleK: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cityAt = Math.max(0, beat.word("city"));
  const kAt = Math.max(0, beat.fRel(54.92));
  const cCol = hex(data.teams[0].colorHex);
  const kCol = hex(data.teams[1].colorHex);
  const cityS = spring({ frame: frame - (cityAt - 20), fps, config: { damping: 11 } });
  return (
    <Band>
      {/* the special-rule callout: c goes soft /s/ before e/i (city) */}
      {frame >= cityAt - 20 && frame < kAt + 10 && (
        <div
          style={{
            transform: `scale(${cityS}) translateY(${bob(frame, fps, 5, 2.4)}px)`,
            background: "#FFEBEE",
            border: "4px solid #E53935",
            borderRadius: 30,
            padding: "14px 40px",
            fontSize: 54,
            fontWeight: 700,
            color: palette.ink,
            boxShadow: `0 14px 34px ${palette.cardShadow}`,
          }}
        >
          {kw("c", cCol)} says {kw("/s/", "#E53935")} — like in {kw("city", "#E53935")}!
        </div>
      )}
      {/* after k saves the sound */}
      {frame >= kAt + 10 && (
        <Pill from={kAt + 10} color={kCol}>
          before {kw("e, i", kCol)} → use {kw("k", kCol)}
        </Pill>
      )}
    </Band>
  );
};

// ── ⑦ Rule ck ────────────────────────────────────────────────────────────────
export const RuleCK: React.FC<BeatProps> = ({ data }) => (
  <Band>
    <Pill from={4} color={hex(data.teams[2].colorHex)}>
      end + short vowel → {kw("ck", hex(data.teams[2].colorHex))} (one sound!)
    </Pill>
  </Band>
);

// ── ⑧ See-it — one group at a time; its words accumulate in a sliding row ────
const SEEIT_GROUPS: { g: number; words: { word: string; blanked: string }[] }[] = [
  { g: 0, words: [{ word: "cat", blanked: "_at" }, { word: "cup", blanked: "_up" }, { word: "cot", blanked: "_ot" }] },
  { g: 1, words: [{ word: "key", blanked: "_ey" }, { word: "kit", blanked: "_it" }, { word: "king", blanked: "_ing" }] },
  { g: 2, words: [{ word: "duck", blanked: "du__" }, { word: "rock", blanked: "ro__" }, { word: "kick", blanked: "ki__" }] },
];
export const SeeIt3: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groups = SEEIT_GROUPS.map((gr) => ({ ...gr, words: gr.words.map((w) => ({ ...w, at: Math.max(0, beat.word(w.word)) })) }));

  // switch group when its LABEL is spoken ("c:" 87.9 · "k:" 93.64 · "ck:" 99.2),
  // so the previous group's cards clear the moment the new label is announced.
  const labelAt = [Math.max(0, beat.word("c")), Math.max(0, beat.word("k")), Math.max(0, beat.word("ck"))];
  let gi = 0;
  for (let j = 0; j < 3; j++) if (frame >= labelAt[j]) gi = j;
  // the first group's label is present from the BEAT start — keyed to labelAt[0]
  // (87.9s) it spent the beat's first ~2.5s at scale 0, so the row had a heading-
  // shaped hole above it while the narration was already running
  const labelPop = spring({ frame: frame - (gi === 0 ? 0 : labelAt[gi]), fps, config: { damping: 10 } });
  const group = groups[gi];
  const c = hex(data.teams[gi].colorHex);

  // THREE FIXED SLOTS, always on screen. Before its word is spoken a slot shows a
  // dashed ghost card, so the stage is never blank — the old build left ~2.5s of
  // empty screen at "Let's try some words!" and ~1.4s at each new group label.
  // No fixed-width slot: at size 230 a card is ~414px, so a 300px slot made adjacent
  // cards overlap. Natural width + a real gap can never touch.
  const gap = 84; // pulse-proof: a spoken card grows 0.16×width each side

  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <BeatEmoji char="👀" />
        <div style={{ fontSize: 66, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 6, 2.6)}px)` }}>
          Let's try some words!
        </div>

        {/* the group letter — breathing room below it so the label reads as a
            heading for the row rather than sitting on top of the first card */}
        <div
          style={{
            marginBottom: 30,
            background: c,
            color: "#fff",
            border: `5px solid ${c}`,
            borderRadius: 24,
            padding: "10px 46px",
            fontSize: 64,
            fontWeight: 700,
            boxShadow: `0 12px 30px ${c}66`,
            transform: `scale(${labelPop}) translateY(${bob(frame, fps, 5, 2.4)}px)`,
          }}
        >
          {group.g === 0 ? "c" : group.g === 1 ? "k" : "ck"}
        </div>

        {/* fixed three-slot row: ghost → filled as each word is spoken */}
        <div style={{ display: "flex", gap, alignItems: "center", justifyContent: "center" }}>
          {group.words.map((w, k) => {
            const on = frame >= w.at;
            return (
              <div key={`${gi}-${w.word}`} style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on ? (
                  <CkWordChip word={w.word} blanked={w.blanked} colorHex={data.teams[gi].colorHex} enterFrame={w.at} size={230} />
                ) : (
                  <div
                    style={{
                      width: 300,
                      height: 250,
                      borderRadius: 60,
                      border: `6px dashed ${c}55`,
                      background: "#ffffff55",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 84,
                      fontWeight: 700,
                      color: `${c}55`,
                      transform: `translateY(${bob(frame, fps, 6, 2.2, k)}px)`,
                    }}
                  >
                    ?
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <SideMascot />
    </Center>
  );
};

// ── confetti (ported from beats/Quiz.tsx) ────────────────────────────────────
const CONFETTI = ["#FF5252", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8", "#FF8A65", "#4DD0E1"];
const PIECES = Array.from({ length: 42 }, (_, i) => {
  const rand = (s: number) => Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1);
  return {
    angle: -Math.PI / 2 + (rand(1) - 0.5) * Math.PI * 1.1,
    speed: 640 + rand(2) * 520,
    color: CONFETTI[i % CONFETTI.length],
    size: 14 + rand(3) * 18,
    spin: (rand(4) - 0.5) * 1400,
    long: rand(6) > 0.5,
  };
});
const Confetti: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const t = (frame - start) / fps;
  return (
    <div style={{ position: "absolute", top: "42%", left: "50%", width: 0, height: 0 }}>
      {PIECES.map((p, i) => {
        const x = Math.cos(p.angle) * p.speed * t;
        const y = Math.sin(p.angle) * p.speed * t + 0.5 * 1500 * t * t;
        const opacity = interpolate(t, [0, 1.1, 1.6], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px) rotate(${p.spin * t}deg)`,
              width: p.long ? p.size * 0.5 : p.size,
              height: p.long ? p.size * 1.6 : p.size,
              background: p.color,
              borderRadius: 3,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// ── ⑨+⑩ Quiz3 — 3-way "how do we spell duck?" + reveal (spans quiz+reveal) ────
export const Quiz3: React.FC<BeatProps & { revealAt: number; underlineAt: number }> = ({ data, beat, revealAt, underlineAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const answer = 2;
  const revealed = frame >= revealAt;
  const underlined = frame >= underlineAt; // "u" underline waits for "short vowel"
  const aCol = hex(data.teams[answer].colorHex);
  const suspense = interpolate(frame, [revealAt - 55, revealAt], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const before = "du";

  // The quiz used to hold ONE static picture for the whole 9s before the reveal —
  // only the caption moved. Now every spoken beat lands a visual:
  //   107.22 "How do we spell duck?" → the du__ word drops in
  //   109.34 / 110.42 / 111.36 "c, k, or ck?" → a pointer hops onto each option
  const wordAt = Math.max(0, beat.fRel(107.22));
  const optionAt = [beat.fRel(109.34), beat.fRel(110.42), beat.fRel(111.36)];
  const wordIn = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  let pointed = -1;
  for (let j = 0; j < 3; j++) if (!revealed && frame >= optionAt[j]) pointed = j;

  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        <BeatEmoji char="🤔" />
        <div style={{ fontSize: 70, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
          Your turn! How do we spell…
        </div>

        {/* the word: du__ → duck. The short-vowel "u" underline appears ONLY after the
            reveal ("It's ck — because there's a short vowel right before it!"). */}
        {/* the word slot is HELD from the beat start (ghosted) so the 2s before
            "How do we spell duck?" isn't a hole where the word will be */}
        <div
          style={{
            fontSize: 168,
            fontWeight: 700,
            letterSpacing: 6,
            opacity: frame >= wordAt ? 1 : 0.22,
            transform: `scale(${(frame >= wordAt ? wordIn : 0.92) * (revealed ? pulse(frame - revealAt, fps, 0.05, 0.8) : 1)})`,
          }}
        >
          {revealed ? (
            <>
              <span style={{ color: palette.ink }}>{before.slice(0, -1)}</span>
              <span
                style={
                  underlined
                    ? {
                        color: palette.ink,
                        textDecoration: "underline",
                        textDecorationColor: "#00897B",
                        textDecorationThickness: "11px",
                        textUnderlineOffset: "10px",
                      }
                    : { color: palette.ink }
                }
              >
                {before.slice(-1)}
              </span>
              <span style={{ color: aCol }}>ck</span>
            </>
          ) : (
            <>
              <span style={{ color: palette.ink }}>{before}</span>
              <span style={{ color: palette.blank }}>__</span>
            </>
          )}
        </div>

        {/* three choice cards */}
        <div style={{ display: "flex", gap: 46 }}>
          {data.teams.map((team, i) => {
            const correct = i === answer;
            const lit = revealed && correct;
            const dim = revealed && !correct;
            const pop = lit ? spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1;
            const scale = lit ? 1 + pop * 0.16 : 1;
            const c = hex(team.colorHex);
            const isPointed = pointed === i;
            const pointS = isPointed ? spring({ frame: frame - optionAt[i], fps, config: { damping: 9 } }) : 0;
            return (
              <div key={team.marker} style={{ position: "relative" }}>
                {/* hopping pointer while "c, k, or ck?" is spoken */}
                {isPointed && (
                  <div
                    style={{
                      position: "absolute",
                      top: -74,
                      left: "50%",
                      transform: `translateX(-50%) scale(${pointS}) translateY(${bob(frame, fps, 9, 3.4)}px)`,
                      fontSize: 58,
                    }}
                  >
                    👇
                  </div>
                )}
                <div
                  style={{
                    transform: `scale(${scale * (1 + pointS * 0.1)}) rotate(${lit ? 0 : wiggle(frame, fps, 2 * suspense, 1.6 / suspense, i)}deg)`,
                    opacity: dim ? 0.3 : 1,
                    background: lit ? c : palette.card,
                    color: lit ? "#fff" : c,
                    border: `8px solid ${c}`,
                    borderRadius: 34,
                    padding: "26px 70px",
                    fontSize: 96,
                    fontWeight: 700,
                    boxShadow: lit || isPointed ? `0 16px 48px ${c}88` : `0 16px 40px ${palette.cardShadow}`,
                  }}
                >
                  {team.marker} {lit ? "🎉" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SideMascot />
      <Confetti start={revealAt} />
    </Center>
  );
};

// ── ⑪ Recap3 — three big summary cards (rule + one clear example) ────────────
const RECAP = [
  { i: 0, rule: "before a, o, u", word: "cat", blanked: "_at" },
  { i: 1, rule: "before e, i", word: "king", blanked: "_ing" },
  { i: 2, rule: "after a short vowel", word: "duck", blanked: "du__" },
];
const TintWord: React.FC<{ word: string; blanked: string; color: string; size: number; markVowel?: boolean }> = ({ word, blanked, color, size, markVowel = false }) => {
  const g = blanked.indexOf("_");
  const gl = blanked.match(/_+/)?.[0].length ?? 0;
  const before = word.slice(0, g < 0 ? word.length : g);
  const target = g < 0 ? "" : word.slice(g, g + gl);
  const after = g < 0 ? "" : word.slice(g + gl);
  const showVowel = markVowel && before.length > 0 && target.length > 0;
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>
      <span style={{ color: palette.ink }}>{showVowel ? before.slice(0, -1) : before}</span>
      {showVowel && (
        <span
          style={{
            color: palette.ink,
            textDecoration: "underline",
            textDecorationColor: "#00897B",
            textDecorationThickness: `${size * 0.09}px`,
            textUnderlineOffset: `${size * 0.08}px`,
          }}
        >
          {before.slice(-1)}
        </span>
      )}
      <span style={{ color }}>{target}</span>
      <span style={{ color: palette.ink }}>{after}</span>
    </span>
  );
};
export const Recap3: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // first card lands on "Remember:" (the beat start), not 0.6s later — the old 120.0
  // left three empty ghost boxes on screen while the line had already begun
  const ats = [0, beat.fRel(123.56), beat.fRel(126.22)];
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        <BeatEmoji char="🧠" />
        <div style={{ fontSize: 72, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 5, 2.6)}px)` }}>
          Remember!
        </div>
        <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
          {RECAP.map((r, idx) => {
            const at = Math.max(0, ats[idx]);
            const on = frame >= at;
            const team = data.teams[r.i];
            const c = hex(team.colorHex);
            const illo = illustrationFor(r.word);
            const emoji = illo && illo.kind === "emoji" ? illo.char : "";
            // internals stagger in as the card is spoken, with a glow pulse — alive, not a plain pop
            const cardS = spring({ frame: frame - at, fps, config: { damping: 12 } });
            const letterS = spring({ frame: frame - at, fps, config: { damping: 9 } });
            const ruleS = spring({ frame: frame - (at + 8), fps, config: { damping: 12 } });
            const emojiS = spring({ frame: frame - (at + 16), fps, config: { damping: 8 } });
            const wordS = spring({ frame: frame - (at + 24), fps, config: { damping: 9 } });
            const glow = on && frame < at + 34 ? Math.sin(((frame - at) / 34) * Math.PI) : 0;
            return (
              <div
                key={r.i}
                style={{
                  width: 420,
                  transform: `scale(${(on ? cardS : 0.9) * (1 + glow * 0.03)}) translateY(${bob(frame, fps, 5, 2.4, idx)}px)`,
                  opacity: on ? 1 : 0.25,
                  background: palette.card,
                  border: `8px solid ${c}`,
                  borderRadius: 40,
                  padding: "26px 20px 30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: on ? `0 20px 54px ${c}${glow > 0.05 ? "aa" : "55"}` : `0 16px 40px ${palette.cardShadow}`,
                }}
              >
                <div style={{ fontSize: 120, fontWeight: 700, color: c, lineHeight: 1, transform: `scale(${letterS})`, textShadow: glow > 0.1 ? `0 0 ${glow * 44}px ${c}` : undefined }}>
                  {team.marker}
                </div>
                <div style={{ fontSize: 34, fontWeight: 700, color: c, whiteSpace: "nowrap", opacity: ruleS, transform: `translateY(${(1 - ruleS) * 14}px)` }}>{r.rule}</div>
                <span style={{ fontSize: 78, marginTop: 6, display: "inline-block", transform: `scale(${emojiS}) translateY(${bob(frame, fps, 5, 2, idx)}px)` }}>{emoji}</span>
                <div style={{ transform: `scale(${wordS})` }}>
                  <TintWord word={r.word} blanked={r.blanked} color={c} size={72} markVowel={r.i === 2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SideMascot />
    </Center>
  );
};

// ── ⑫ Wrap3 — logo + store badges + CTA ──────────────────────────────────────
export const Wrap3: React.FC<BeatProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame: frame - 12, fps, config: { damping: 12 } });
  const play = spring({ frame: frame - 52, fps, config: { damping: 10 } });
  const apple = spring({ frame: frame - 64, fps, config: { damping: 10 } });
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 560,
            height: "auto",
            transform: `scale(${logoIn}) translateY(${bob(frame, fps, 10, 2.6)}px) rotate(${wiggle(frame, fps, 1.5, 2.4)}deg)`,
            filter: "drop-shadow(0 16px 30px rgba(30,36,56,0.2))",
          }}
        />
        <div style={{ opacity: logoIn, fontSize: 52, fontWeight: 600, color: palette.ink }}>Download free 👇</div>
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <Img src={staticFile("playstore.png")} style={{ width: 330, height: "auto", transform: `scale(${play}) translateY(${bob(frame, fps, 5, 2.2)}px)` }} />
          <Img src={staticFile("appstore.png")} style={{ width: 330, height: "auto", transform: `scale(${apple}) translateY(${bob(frame, fps, 5, 2.2, 1.5)}px)` }} />
        </div>
      </div>
    </Center>
  );
};
