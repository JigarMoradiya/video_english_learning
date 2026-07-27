import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { MOON, BOOK } from "../components/OoWorld";
import { Mascot } from "../components/Mascot";
import { bob, pulse, wiggle } from "../lib/motion";
import { palette } from "../data/tokens";
import { Ear } from "../components/PortraitBeatKit";
import { illustrationFor } from "../data/wordImages";

// Portrait beats for the oo reel — same teaching content as oo_beats.tsx.
//
// FIRST VERSION WAS TOO EMPTY. It centred small pills inside a band, which left
// the top and bottom thirds of a 1920-tall frame bare. Everything here now:
//   · spans the full 300–1620 band, distributed rather than clustered
//   · uses FULL-WIDTH rows (900px) instead of little centre-hugging chips
//   · puts content across the whole card width, so nothing reads as left-aligned
//     with dead space to its right
//   · brings the mascot in wherever a beat would otherwise have a hole

type BP = { data: PhonicsComparison; beat: Beat };
const kw = (t: string, c: string) => <span style={{ color: c, fontWeight: 700 }}>{t}</span>;

const BAND_TOP = 292;
// ends at 292+1160=1452, clearing the caption pill (top ~1500). An earlier 1330
// ran the last row straight into the captions.
const BAND_H = 1160;
const ROW_W = 900;

// full-height band; `spread` distributes children instead of bunching them
const PBand: React.FC<{ children: React.ReactNode; spread?: boolean; gap?: number }> = ({ children, spread = true, gap = 26 }) => (
  <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: spread ? "space-between" : "center", gap, paddingBottom: 8, pointerEvents: "none" }}>
    {children}
  </div>
);

const Head: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 50 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.6)}px)`, background: "#ffffffef", borderRadius: 999, padding: "16px 40px", fontSize: size, fontWeight: 700, color: palette.ink, boxShadow: "0 14px 34px rgba(20,16,40,0.30)", textAlign: "center", maxWidth: 960 }}>
      {children}
    </div>
  );
};

// a full-width row: icon on the left, body filling the middle, marker on the right —
// so the card is used edge to edge
const Row: React.FC<{ at: number; color: string; icon: string; body: React.ReactNode; mark?: string; dim?: boolean; big?: boolean }> = ({ at, color, icon, body, mark, dim = false, big = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  return (
    <div style={{ width: ROW_W, transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2.4)}px)`, opacity: dim ? 0.42 : 1, background: "#fff", border: `7px solid ${color}`, borderRadius: 30, padding: big ? "20px 30px" : "14px 28px", display: "flex", alignItems: "center", gap: 24, boxShadow: `0 16px 38px ${color}44`, boxSizing: "border-box" }}>
      <span style={{ fontSize: big ? 78 : 62, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1, fontSize: big ? 82 : 66, fontWeight: 700, color: palette.ink, letterSpacing: 1 }}>{body}</div>
      {mark && <span style={{ fontSize: big ? 74 : 60, fontWeight: 700, color }}>{mark}</span>}
    </div>
  );
};

const CONF = ["#FF5252", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8", "#FF8A65"];
const PIECES = Array.from({ length: 40 }, (_, i) => {
  const r = (s: number) => Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1);
  return { angle: -Math.PI / 2 + (r(1) - 0.5) * Math.PI * 1.15, speed: 600 + r(2) * 520, color: CONF[i % CONF.length], size: 13 + r(3) * 17, spin: (r(4) - 0.5) * 1400, long: r(6) > 0.5 };
});
const Burst: React.FC<{ start: number; top?: string }> = ({ start, top = "58%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const t = (frame - start) / fps;
  return (
    <div style={{ position: "absolute", top, left: "50%", width: 0, height: 0 }}>
      {PIECES.map((p, i) => {
        const x = Math.cos(p.angle) * p.speed * t;
        const y = Math.sin(p.angle) * p.speed * t + 0.5 * 1500 * t * t;
        const o = interpolate(t, [0, 1.1, 1.6], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={i} style={{ position: "absolute", transform: `translate(${x}px, ${y}px) rotate(${p.spin * t}deg)`, width: p.long ? p.size * 0.5 : p.size, height: p.long ? p.size * 1.6 : p.size, background: p.color, borderRadius: 3, opacity: o }} />;
      })}
    </div>
  );
};

// ── hook ─────────────────────────────────────────────────────────────────────
export const PHook: React.FC<BP> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", top: 636, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 6, 2.6)}px)`, background: "#ffffffef", borderRadius: 999, padding: "18px 48px", fontSize: 62, fontWeight: 700, color: palette.ink, boxShadow: "0 18px 44px rgba(0,0,0,0.34)" }}>
        oo → 🌙 {kw("or", MOON)} 📖
      </div>
    </div>
  );
};

// ── tricky · "oo doesn't always sound the same" ──────────────────────────────
export const PTricky: React.FC<BP> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = (emoji: string, label: string, color: string, ph: number) => (
    <div style={{ width: 410, transform: `translateY(${bob(frame, fps, 8, 2.2, ph)}px) scale(${pulse(frame, fps, 0.04, 0.9, ph)})`, background: "#fff", border: `8px solid ${color}`, borderRadius: 34, padding: "26px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: `0 18px 40px ${color}55` }}>
      <span style={{ fontSize: 108 }}>{emoji}</span>
      <span style={{ fontSize: 46, fontWeight: 700, color }}>{label}</span>
      <span style={{ fontSize: 62, fontWeight: 700, color: palette.inkSoft }}>?</span>
    </div>
  );
  return (
    <PBand>
      <Head size={46}>The tricky part! 🤔</Head>

      <div style={{ background: "#fff", borderRadius: 30, padding: "6px 56px", fontSize: 138, fontWeight: 700, color: palette.ink, letterSpacing: 10, boxShadow: "0 20px 48px rgba(0,0,0,0.34)", transform: `scale(${pulse(frame, fps, 0.03, 2)})` }}>oo</div>

      {/* the split drawn, not written — the caption already says it in words */}
      <svg width={620} height={130} viewBox="0 0 620 130">
        {[{ x: 150, c: MOON }, { x: 470, c: BOOK }].map((b, i) => (
          <g key={i}>
            <path d={`M 310 6 C 310 60, ${b.x} 46, ${b.x} 104`} fill="none" stroke={b.c} strokeWidth={11} strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 - 220 * Math.min(1, Math.max(0, (frame - 6 - i * 8) / 22))} />
            <polygon points={`${b.x - 15},100 ${b.x + 15},100 ${b.x},128`} fill={b.c} opacity={frame > 26 + i * 8 ? 1 : 0} />
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 26 }}>
        {card("🌙", "long", MOON, 0)}
        {card("📖", "short", BOOK, 1)}
      </div>
    </PBand>
  );
};

// ── strategy · try long first, then short ────────────────────────────────────
export const PStrategy: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const longAt = Math.max(0, beat.fRel(34.06));
  const shortAt = Math.max(0, beat.fRel(38.3));
  const wIn = spring({ frame, fps, config: { damping: 12 } });
  return (
    <PBand>
      <Head size={46}>Try it both ways! 👂</Head>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Ear size={200} color="#fff" />
        <div style={{ transform: `scale(${wIn})`, background: "#fff", borderRadius: 30, padding: "12px 52px", fontSize: 116, fontWeight: 700, color: palette.ink, letterSpacing: 6, boxShadow: "0 18px 44px rgba(20,16,40,0.3)" }}>book</div>
      </div>

      {/* numbered attempts, full width — the first pass is wrong, the second right */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <Row at={longAt} color={MOON} icon="🌙" body={<>1. try <span style={{ color: MOON }}>long</span> — “booo”</>} mark="✗" dim={frame >= shortAt} />
        <Row at={shortAt} color={BOOK} icon="📖" body={<>2. try <span style={{ color: BOOK }}>short</span> — “book”</>} mark="✓" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `translateY(${bob(frame, fps, 8, 2.3)}px)` }}><Mascot size={168} /></div>
        <Head size={40}>Trust your ears!</Head>
      </div>
    </PBand>
  );
};

// ── hint · oo before k is often short ────────────────────────────────────────
export const PHint: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["book", "look", "cook"];
  return (
    <PBand>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 172, transform: `rotate(${wiggle(frame, fps, 6, 2)}deg) scale(${pulse(frame, fps, 0.05, 1.5)})`, display: "inline-block", filter: "drop-shadow(0 12px 26px rgba(255,193,7,0.55))" }}>💡</span>
        <Head size={48}>A helpful hint!</Head>
      </div>

      <div style={{ background: BOOK, color: "#fff", borderRadius: 30, padding: "16px 46px", fontSize: 58, fontWeight: 700, boxShadow: `0 18px 40px ${BOOK}66`, transform: `translateY(${bob(frame, fps, 5, 2.5)}px)` }}>
        oo + k → often short 📖
      </div>

      {/* each example a full-width row with its k called out */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        {words.map((w) => (
          <Row
            key={w}
            at={Math.max(0, beat.word(w))}
            color={BOOK}
            /* each word gets its OWN picture — all three used to show 📖, so they
               read as the same card (same fix as the 16:9 cut) */
            icon={(() => {
              const il = illustrationFor(w);
              return il && il.kind === "emoji" ? il.char : "📖";
            })()}
            big
            body={<>
              <span style={{ color: palette.ink }}>{w.slice(0, -1)}</span>
              <span style={{ color: BOOK }}>k</span>
            </>}
            mark="short"
          />
        ))}
      </div>

      <Head size={38}>…but it&apos;s only a hint, not a rule</Head>
    </PBand>
  );
};

// ── caveat · it is NOT a rule ────────────────────────────────────────────────
export const PCaveat: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <PBand>
      <div style={{ background: "#E53935", color: "#fff", borderRadius: 999, padding: "16px 48px", fontSize: 56, fontWeight: 700, boxShadow: "0 18px 40px rgba(229,57,53,0.5)", transform: `scale(${pulse(frame, fps, 0.03, 1.6)})` }}>
        Not a rule! ⚠️
      </div>
      <Head size={44}>No {kw("k", BOOK)} — and still short 📖</Head>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <Row at={Math.max(0, beat.word("good"))} color={BOOK} icon="👍" big body="good" mark="short" />
        <Row at={Math.max(0, beat.word("foot"))} color={BOOK} icon="🦶" big body="foot" mark="short" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `translateY(${bob(frame, fps, 8, 2.4)}px)` }}><Mascot size={172} flip /></div>
        <Head size={40}>So listen carefully! 👂</Head>
      </div>
    </PBand>
  );
};

// ── quiz · "good" — long or short? ───────────────────────────────────────────
export const PQuiz: React.FC<BP & { revealAt: number }> = ({ beat, revealAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAt;
  const wordAt = Math.max(0, beat.word("good"));
  const wIn = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  const titleIn = spring({ frame, fps, config: { damping: 12 } });
  const suspense = interpolate(frame, [revealAt - 50, revealAt], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const choices = [
    { label: "long", emoji: "🌙", color: MOON, correct: false, at: Math.max(0, beat.word("long")) },
    { label: "short", emoji: "📖", color: BOOK, correct: true, at: Math.max(0, beat.word("short")) },
  ];
  return (
    <PBand>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transform: `scale(${titleIn})` }}>
        <Ear size={196} color={palette.ink} />
        <div style={{ fontSize: 66, fontWeight: 700, color: palette.ink }}>Your turn! 🤔</div>
      </div>

      <div style={{ transform: `scale(${(frame >= wordAt ? wIn : 0) * (revealed ? pulse(frame - revealAt, fps, 0.05, 0.8) : 1)})`, background: "#fff", borderRadius: 34, padding: "10px 64px", fontSize: 186, fontWeight: 700, color: revealed ? BOOK : palette.ink, letterSpacing: 8, boxShadow: "0 20px 50px rgba(20,16,40,0.28)" }}>good</div>

      {/* full-width stacked choices — two side-by-side cards left the frame bare */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        {choices.map((c) => {
          const on = frame >= c.at;
          const cin = spring({ frame: frame - c.at, fps, config: { damping: 11 } });
          const lit = revealed && c.correct;
          const dim = revealed && !c.correct;
          const pop = lit ? spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1;
          const scale = (on ? cin : 0) * (lit ? 1 + pop * 0.06 : 1);
          return (
            <div key={c.label} style={{ width: ROW_W, transform: `scale(${scale}) rotate(${lit ? 0 : wiggle(frame, fps, 1.4 * suspense, 1.6 / suspense, c.correct ? 1 : 0)}deg)`, opacity: dim ? 0.32 : 1, background: lit ? c.color : "#fff", color: lit ? "#fff" : c.color, border: `8px solid ${c.color}`, borderRadius: 32, padding: "20px 34px", display: "flex", alignItems: "center", gap: 26, fontSize: 72, fontWeight: 700, boxShadow: lit ? `0 20px 54px ${c.color}88` : "0 18px 44px rgba(20,16,40,0.24)", boxSizing: "border-box" }}>
              <span style={{ fontSize: 84 }}>{c.emoji}</span>
              <span style={{ flex: 1 }}>{c.label}</span>
              <span style={{ fontSize: 76 }}>{lit ? "🎉" : ""}</span>
            </div>
          );
        })}
      </div>

      <div style={{ transform: `translateY(${bob(frame, fps, 9, 2.2)}px) scale(${revealed ? 1.06 : 1})` }}><Mascot size={182} /></div>
      <Burst start={revealAt} top="52%" />
    </PBand>
  );
};

// ── remember · two summary cards ─────────────────────────────────────────────
export const PRemember: React.FC<BP> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ats = [Math.max(0, beat.fRel(93.92)), Math.max(0, beat.fRel(99.26))];
  const cards = [
    { color: MOON, emoji: "🌙", title: "long", sub: "most of the time", word: "moon", i: 0 },
    { color: BOOK, emoji: "📖", title: "short", sub: "some words", word: "book", i: 1 },
  ];
  return (
    <PBand>
      {/* something ABOVE the header, which was floating on its own before */}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {["⭐", "🧠", "⭐"].map((e, k) => {
          const s = spring({ frame: frame - 4 - k * 5, fps, config: { damping: 10 } });
          return <span key={k} style={{ fontSize: k === 1 ? 168 : 104, transform: `scale(${s}) translateY(${k === 1 ? -10 : 12}px) rotate(${wiggle(frame, fps, 7, 2.2, k)}deg)`, display: "inline-block" }}>{e}</span>;
        })}
      </div>
      <div style={{ fontSize: 74, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 5, 2.6)}px)` }}>Remember!</div>

      {/* card content spans the FULL width: emoji left, rule centre, example right */}
      {cards.map((c) => {
        const at = ats[c.i];
        const on = frame >= at;
        const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
        const glow = on && frame < at + 34 ? Math.sin(((frame - at) / 34) * Math.PI) : 0;
        return (
          <div key={c.title} style={{ width: ROW_W, transform: `scale(${(on ? s : 0.9) * (1 + glow * 0.02)}) translateY(${bob(frame, fps, 5, 2.4, c.i)}px)`, opacity: on ? 1 : 0.22, background: palette.card, border: `8px solid ${c.color}`, borderRadius: 36, padding: "22px 30px", display: "flex", alignItems: "center", gap: 22, boxShadow: on ? `0 22px 56px ${c.color}${glow > 0.05 ? "aa" : "55"}` : "0 16px 40px rgba(20,16,40,0.18)", boxSizing: "border-box" }}>
            <span style={{ fontSize: 104, lineHeight: 1 }}>{c.emoji}</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 62, fontWeight: 700, color: c.color, lineHeight: 1.05 }}>oo = {c.title}</div>
              <div style={{ fontSize: 34, fontWeight: 600, color: c.color, opacity: 0.85 }}>{c.sub}</div>
            </div>
            <div style={{ background: c.color, color: "#fff", borderRadius: 22, padding: "12px 26px", fontSize: 54, fontWeight: 700, whiteSpace: "nowrap" }}>{c.word}</div>
          </div>
        );
      })}

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `translateY(${bob(frame, fps, 8, 2.3)}px)` }}><Mascot size={170} /></div>
        <Head size={40}>Try both — trust your ears!</Head>
      </div>
    </PBand>
  );
};
