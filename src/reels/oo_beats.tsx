import React from "react";
import { interpolate, spring, staticFile, Img, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { CkWordChip } from "../components/CkWordChip";
import { bob, pulse, wiggle } from "../lib/motion";
import { palette } from "../data/tokens";
import { illustrationFor } from "../data/wordImages";

const MOON = "#5E35B1"; // long
const BOOK = "#E65100"; // short
type BP = { data: PhonicsComparison; beat: Beat };

// ── shared bits ──────────────────────────────────────────────────────────────
const kw = (t: string, c: string) => <span style={{ color: c, fontWeight: 700 }}>{t}</span>;
const Band: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 46 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: top, pointerEvents: "none" }}>{children}</AbsoluteFill>
);
const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 190, pointerEvents: "none" }}>{children}</AbsoluteFill>
);
// LOWER band — beneath the split-world characters (they stay up top). Explanation beats
// render here so the world stays visible AND nothing overlaps it.
const Lower: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 175, pointerEvents: "none" }}>{children}</AbsoluteFill>
);
const Pill: React.FC<{ from?: number; color?: string; children: React.ReactNode }> = ({ from = 0, color = palette.cardShadow, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 12 } });
  if (frame < from) return null;
  return (
    <div style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 6, 2.6)}px)`, background: "#ffffffe8", border: `4px solid ${color}`, borderRadius: 999, padding: "16px 48px", fontSize: 58, fontWeight: 700, color: palette.ink, boxShadow: `0 14px 34px ${palette.cardShadow}`, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

// confetti (ported from c/k/ck)
const CONFETTI = ["#FF5252", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8", "#FF8A65", "#4DD0E1"];
const PIECES = Array.from({ length: 42 }, (_, i) => {
  const rand = (s: number) => Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1);
  return { angle: -Math.PI / 2 + (rand(1) - 0.5) * Math.PI * 1.1, speed: 640 + rand(2) * 520, color: CONFETTI[i % CONFETTI.length], size: 14 + rand(3) * 18, spin: (rand(4) - 0.5) * 1400, long: rand(6) > 0.5 };
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
        return <div key={i} style={{ position: "absolute", transform: `translate(${x}px, ${y}px) rotate(${p.spin * t}deg)`, width: p.long ? p.size * 0.5 : p.size, height: p.long ? p.size * 1.6 : p.size, background: p.color, borderRadius: 3, opacity }} />;
      })}
    </div>
  );
};

// ── ① Hook (short formula, not the caption sentence) ─────────────────────────
export const Hook: React.FC<BP> = () => (
  <Band top={44}>
    <Pill from={0}>oo → 🌙 {kw("or", MOON)} 📖</Pill>
  </Band>
);

// ── ④ Tricky (lower band — moon+book world stays up top) ─────────────────────
export const Tricky: React.FC<BP> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chip = (emoji: string, color: string, ph: number) => (
    <div style={{ transform: `translateY(${bob(frame, fps, 6, 2.2, ph)}px) scale(${pulse(frame, fps, 0.05, 0.9, ph)})`, background: "#fff", border: `6px solid ${color}`, borderRadius: 28, padding: "14px 44px", fontSize: 72, fontWeight: 700, color, boxShadow: `0 14px 30px ${color}44` }}>
      {emoji} <span style={{ color: palette.inkSoft }}>?</span>
    </div>
  );
  return (
    <Lower>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: palette.ink, background: "#ffffffe8", borderRadius: 999, padding: "12px 44px", boxShadow: `0 12px 30px ${palette.cardShadow}`, transform: `translateY(${bob(frame, fps, 5, 2.6)}px)` }}>
          which one? 🤔
        </div>
        <div style={{ display: "flex", gap: 44 }}>
          {chip("🌙", MOON, 0)}
          {chip("📖", BOOK, 1)}
        </div>
      </div>
    </Lower>
  );
};

// ── ⑤ Strategy — try long, then short (demo on "book") ───────────────────────
export const Strategy: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const longAt = Math.max(0, beat.fRel(34.06)); // "try the long sound first"
  const shortAt = Math.max(0, beat.fRel(38.3)); // "try the short sound"
  const wIn = spring({ frame, fps, config: { damping: 12 } });
  const step = (at: number) => spring({ frame: frame - at, fps, config: { damping: 11 } });
  return (
    <Lower>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: palette.ink, background: "#ffffffe8", borderRadius: 999, padding: "10px 36px", boxShadow: `0 12px 30px ${palette.cardShadow}`, transform: `translateY(${bob(frame, fps, 5, 2.6)}px)` }}>Try it both ways! 👂</div>
        <div style={{ transform: `scale(${wIn})`, background: "#fff", borderRadius: 26, padding: "10px 46px", fontSize: 100, fontWeight: 700, color: palette.ink, letterSpacing: 5, boxShadow: `0 16px 40px ${palette.cardShadow}` }}>book</div>
        <div style={{ display: "flex", gap: 34 }}>
          {frame >= longAt && (
            <div style={{ transform: `scale(${step(longAt)})`, background: "#fff", border: `6px solid ${MOON}`, borderRadius: 24, padding: "10px 30px", fontSize: 46, fontWeight: 700, color: MOON, opacity: frame >= shortAt ? 0.4 : 1 }}>🌙 booo? ✗</div>
          )}
          {frame >= shortAt && (
            <div style={{ transform: `scale(${step(shortAt) * pulse(frame, fps, 0.05, 0.8)})`, background: BOOK, border: `6px solid ${BOOK}`, borderRadius: 24, padding: "10px 30px", fontSize: 46, fontWeight: 700, color: "#fff" }}>📖 book ✓</div>
          )}
        </div>
      </div>
    </Lower>
  );
};

// ── ⑥ Hint — oo before k is OFTEN short (book/look/cook) ─────────────────────
// The narration says "often short" and the very next beat says "but that's not always
// true", so the card must NOT read as an absolute rule (see feedback_no_false_rules).
// "often" carries its own amber tag, and the formula is a built card, not a text pill.
export const HintFormula: React.FC<{ struck?: boolean }> = ({ struck = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = (bg: string, color: string, text: React.ReactNode, size = 62) => (
    <div style={{ background: bg, color, border: `5px solid ${bg === "#fff" ? BOOK : bg}`, borderRadius: 20, padding: "8px 26px", fontSize: size, fontWeight: 700, lineHeight: 1.15 }}>{text}</div>
  );
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: "#ffffffee",
        border: `6px solid ${BOOK}`,
        borderRadius: 34,
        padding: "18px 34px",
        boxShadow: `0 16px 38px ${BOOK}44`,
        transform: `translateY(${bob(frame, fps, 5, 2.6)}px)`,
        opacity: struck ? 0.62 : 1,
      }}
    >
      {box("#fff", palette.ink, "oo")}
      <span style={{ fontSize: 52, fontWeight: 700, color: palette.inkSoft }}>+</span>
      {box("#fff", BOOK, "k")}
      <span style={{ fontSize: 52, fontWeight: 700, color: palette.inkSoft }}>→</span>
      {/* the hedge, visually separated so it can never be read as "always" */}
      <div style={{ background: "#FFF3E0", border: "4px solid #FB8C00", borderRadius: 16, padding: "6px 18px", fontSize: 38, fontWeight: 800, color: "#E65100", letterSpacing: 1 }}>OFTEN</div>
      {box(BOOK, "#fff", <>short 📖</>)}
      {/* red strike — the Caveat beat reuses this card and cancels it */}
      {struck && (
        <>
          <div style={{ position: "absolute", left: 16, right: 16, top: "50%", height: 10, borderRadius: 6, background: "#E53935", transform: "translateY(-50%) rotate(-4deg)", boxShadow: "0 4px 12px rgba(229,57,53,0.4)" }} />
          <div style={{ position: "absolute", right: -34, top: -34, fontSize: 78, transform: `rotate(${wiggle(frame, fps, 6, 2.2)}deg)` }}>❌</div>
        </>
      )}
    </div>
  );
};
const HintChip: React.FC<{ word: string; at: number }> = ({ word, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
  const body = word.slice(0, -1);
  // each word gets its OWN picture (book 📖 · look 👀 · cook 👨‍🍳) — all three used to
  // render as bare text under one shared 📖, so they read as the same card
  const illo = illustrationFor(word);
  const emoji = illo && illo.kind === "emoji" ? illo.char : "";
  return (
    <div style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.2)}px)`, background: "#fff", border: `6px solid ${BOOK}`, borderRadius: 26, padding: "16px 34px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: `0 14px 30px ${BOOK}44` }}>
      <span style={{ fontSize: 68, lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: 68, fontWeight: 700, letterSpacing: 2, lineHeight: 1 }}>
        <span style={{ color: palette.ink }}>{body}</span>
        <span style={{ color: BOOK }}>k</span>
      </span>
    </div>
  );
};
export const Hint: React.FC<BP> = ({ beat }) => (
  <Lower>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <HintFormula />
      <div style={{ display: "flex", gap: 36 }}>
        <HintChip word="book" at={Math.max(0, beat.word("book"))} />
        <HintChip word="look" at={Math.max(0, beat.word("look"))} />
        <HintChip word="cook" at={Math.max(0, beat.word("cook"))} />
      </div>
    </div>
  </Lower>
);

// ── ⑦ Caveat — "But that's not always true" ──────────────────────────────────
// The negative is now SHOWN, not just said: the hint card from the previous beat is
// still on screen and gets struck through with a red bar + ❌. Then good/foot come in
// carrying a "no k" tag and their own pictures (👍 🦶 — both used to show 📖).
export const Caveat: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const earsAt = Math.max(0, beat.fRel(56.8)); // "trust your ears"
  const chip = (word: string, at: number, ph: number) => {
    if (frame < at) return null;
    const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
    const illo = illustrationFor(word);
    const emoji = illo && illo.kind === "emoji" ? illo.char : "";
    return (
      <div style={{ position: "relative", transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.2, ph)}px)` }}>
        {/* the point of these two words: NO k, still short */}
        <div style={{ position: "absolute", top: -18, right: -22, background: "#E53935", color: "#fff", borderRadius: 999, padding: "4px 16px", fontSize: 28, fontWeight: 800, boxShadow: "0 8px 18px rgba(229,57,53,0.4)", zIndex: 2 }}>no k</div>
        <div style={{ background: "#fff", border: `6px solid ${BOOK}`, borderRadius: 26, padding: "16px 34px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: `0 14px 30px ${BOOK}44` }}>
          <span style={{ fontSize: 68, lineHeight: 1 }}>{emoji}</span>
          <span style={{ fontSize: 68, fontWeight: 700, color: palette.ink, letterSpacing: 2, lineHeight: 1 }}>{word}</span>
        </div>
      </div>
    );
  };
  return (
    <Lower>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <HintFormula struck />
        <div style={{ display: "flex", gap: 44, alignItems: "center" }}>
          {chip("good", Math.max(0, beat.word("good")), 0)}
          {chip("foot", Math.max(0, beat.word("foot")), 1)}
          {frame >= earsAt && (
            <div style={{ transform: `scale(${spring({ frame: frame - earsAt, fps, config: { damping: 10 } })}) translateY(${bob(frame, fps, 6, 2.4)}px)`, background: MOON, color: "#fff", borderRadius: 26, padding: "20px 32px", fontSize: 44, fontWeight: 800, boxShadow: `0 14px 30px ${MOON}55`, textAlign: "center" }}>
              trust your
              <br />
              ears 👂
            </div>
          )}
        </div>
      </div>
    </Lower>
  );
};

// ── ⑧ See-it headline (the split world shows the two lists) ──────────────────
export const SeeItHead: React.FC<BP> = () => (
  <Band top={40}>
    <Pill from={0}>Long 🌙 vs short 📖</Pill>
  </Band>
);

// ── ⑨+⑩ Quiz — "good": long 🌙 or short 📖? ──────────────────────────────────
export const Quiz2: React.FC<BP & { revealAt: number }> = ({ beat, revealAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAt;
  // staggered entrances tied to the narration: word → long card → short card
  const wordAt = Math.max(0, beat.word("good"));
  const wIn = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  const titleIn = spring({ frame, fps, config: { damping: 12 } });
  const suspense = interpolate(frame, [revealAt - 50, revealAt], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const choices: { label: string; color: string; correct: boolean; at: number }[] = [
    { label: "🌙 long", color: MOON, correct: false, at: Math.max(0, beat.word("long")) },
    { label: "📖 short", color: BOOK, correct: true, at: Math.max(0, beat.word("short")) },
  ];
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        <div style={{ transform: `scale(${titleIn}) translateY(${bob(frame, fps, 6, 2.4)}px)`, fontSize: 68, fontWeight: 700, color: palette.ink }}>Your turn! 🤔 Is this…</div>
        <div style={{ transform: `scale(${(frame >= wordAt ? wIn : 0) * (revealed ? pulse(frame - revealAt, fps, 0.05, 0.8) : 1)})`, fontSize: 176, fontWeight: 700, color: revealed ? BOOK : palette.ink, letterSpacing: 6 }}>good</div>
        <div style={{ display: "flex", gap: 50 }}>
          {choices.map((c) => {
            const on = frame >= c.at;
            const cin = spring({ frame: frame - c.at, fps, config: { damping: 11 } });
            const lit = revealed && c.correct;
            const dim = revealed && !c.correct;
            const pop = lit ? spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1;
            const scale = (on ? cin : 0) * (lit ? 1 + pop * 0.16 : 1);
            return (
              <div key={c.label} style={{ transform: `scale(${scale}) rotate(${lit ? 0 : wiggle(frame, fps, 2 * suspense, 1.6 / suspense, c.correct ? 1 : 0)}deg)`, opacity: dim ? 0.3 : 1, background: lit ? c.color : "#fff", color: lit ? "#fff" : c.color, border: `8px solid ${c.color}`, borderRadius: 34, padding: "26px 60px", fontSize: 76, fontWeight: 700, boxShadow: lit ? `0 16px 48px ${c.color}88` : `0 16px 40px ${palette.cardShadow}` }}>
                {c.label} {lit ? "🎉" : ""}
              </div>
            );
          })}
        </div>
      </div>
      <Confetti start={revealAt} />
    </Center>
  );
};

// ── ⑪ Remember — two summary cards ───────────────────────────────────────────
export const Remember2: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ats = [Math.max(0, beat.fRel(93.92)), Math.max(0, beat.fRel(99.26)), Math.max(0, beat.fRel(103.4))];
  const cards = [
    { color: MOON, emoji: "🌙", title: "long", sub: "most of the time", word: "moon", i: 0 },
    { color: BOOK, emoji: "📖", title: "short", sub: "some words", word: "book", i: 1 },
  ];
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 5, 2.6)}px)` }}>Remember! 🧠</div>
        <div style={{ display: "flex", gap: 48 }}>
          {cards.map((c) => {
            const at = ats[c.i];
            const on = frame >= at;
            const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
            const glow = on && frame < at + 34 ? Math.sin(((frame - at) / 34) * Math.PI) : 0;
            return (
              <div key={c.title} style={{ width: 500, transform: `scale(${(on ? s : 0.9) * (1 + glow * 0.03)}) translateY(${bob(frame, fps, 5, 2.4, c.i)}px)`, opacity: on ? 1 : 0.25, background: palette.card, border: `8px solid ${c.color}`, borderRadius: 40, padding: "34px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, boxShadow: on ? `0 20px 54px ${c.color}${glow > 0.05 ? "aa" : "55"}` : `0 16px 40px ${palette.cardShadow}` }}>
                <div style={{ fontSize: 110 }}>{c.emoji}</div>
                <div style={{ fontSize: 66, fontWeight: 700, color: c.color, lineHeight: 1 }}>oo = {c.title}</div>
                <div style={{ fontSize: 38, fontWeight: 600, color: c.color, opacity: 0.85 }}>{c.sub}</div>
                <div style={{ fontSize: 60, fontWeight: 700, color: palette.ink, marginTop: 6 }}>{c.word}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Center>
  );
};

// ── ⑫ Wrap — logo + store badges + CTA ───────────────────────────────────────
export const Wrap2: React.FC<BP> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame: frame - 12, fps, config: { damping: 12 } });
  const play = spring({ frame: frame - 52, fps, config: { damping: 10 } });
  const apple = spring({ frame: frame - 64, fps, config: { damping: 10 } });
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Img src={staticFile("logo.png")} style={{ width: 560, height: "auto", transform: `scale(${logoIn}) translateY(${bob(frame, fps, 10, 2.6)}px) rotate(${wiggle(frame, fps, 1.5, 2.4)}deg)`, filter: "drop-shadow(0 16px 30px rgba(30,36,56,0.2))" }} />
        <div style={{ opacity: logoIn, fontSize: 52, fontWeight: 600, color: palette.ink }}>Download free 👇</div>
        <div style={{ display: "flex", gap: 30 }}>
          <Img src={staticFile("playstore.png")} style={{ width: 330, height: "auto", transform: `scale(${play}) translateY(${bob(frame, fps, 5, 2.2)}px)` }} />
          <Img src={staticFile("appstore.png")} style={{ width: 330, height: "auto", transform: `scale(${apple}) translateY(${bob(frame, fps, 5, 2.2, 1.5)}px)` }} />
        </div>
      </div>
    </Center>
  );
};
