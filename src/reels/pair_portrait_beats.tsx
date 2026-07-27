import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Mascot } from "../components/Mascot";
import { PBand, Head, Row, Burst, Ear, ROW_W } from "../components/PortraitBeatKit";
import { bob, pulse, wiggle } from "../lib/motion";
import { palette, hex } from "../data/tokens";

// ── Shared portrait beats for the MIDDLE-vs-END pair cards ───────────────────
// ai/ay, oi/oy and oa/ow are structurally identical: two spellings, one sound,
// one team lives INSIDE the word (🏠) and the other at the END (🏁). They were
// three near-duplicate sparse beat files; this is one data-driven set instead,
// so a fix lands on all three at once and a new pair card is a data row.
//
// The layout follows PortraitBeatKit: full-height band, distributed children,
// full-width rows. The originals left the bottom ~40% of the frame empty and, in
// oi/oy's case, had a rule beat with no word on screen at all.

export interface PairCopy {
  sound: string;        // e.g. "/oy/"
  midWords: string[];   // spelled with the middle team
  endWords: string[];   // spelled with the end team
  midHero: string;      // the one word the mid rule is taught on
  endHero: string;
}

type BP = { data: PhonicsComparison; copy: PairCopy };

const col = (d: PhonicsComparison, i: number) => hex(d.teams[i].colorHex);
const blankMid = (w: string, mk: string) => w.replace(mk, "__");

// big soft sound badge — the thing both teams share
const SoundBadge: React.FC<{ text: string; size?: number }> = ({ text, size = 104 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ background: "#2E7D32", color: "#fff", borderRadius: 34, padding: "12px 52px", fontSize: size, fontWeight: 700, boxShadow: "0 20px 48px rgba(46,125,50,0.5)", transform: `scale(${pulse(frame, fps, 0.04, 1.4)})` }}>
      {text}
    </div>
  );
};

// a team's marker on its coloured plate, with the 🏠 / 🏁 place cue
const TeamPlate: React.FC<{ d: PhonicsComparison; i: number; at?: number; width?: number }> = ({ d, i, at = 0, width = 400 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = d.teams[i];
  const c = col(d, i);
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  if (frame < at) return null;
  return (
    <div style={{ width, transform: `scale(${s}) translateY(${bob(frame, fps, 8, 2.2, i)}px)`, background: "#fff", border: `8px solid ${c}`, borderRadius: 34, padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: `0 18px 42px ${c}55` }}>
      <span style={{ fontSize: 76 }}>{t.zoneEmoji}</span>
      <span style={{ fontSize: 92, fontWeight: 700, color: c, lineHeight: 1 }}>{t.marker}</span>
      <span style={{ fontSize: 38, fontWeight: 700, color: palette.inkSoft }}>{t.zoneHint}</span>
    </div>
  );
};

// ── hook · one sound, two spellings ──────────────────────────────────────────
export const PairHook: React.FC<BP> = ({ data, copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <PBand>
      <Head size={50}>{data.cardTitle}</Head>
      <SoundBadge text={copy.sound} />
      <div style={{ display: "flex", gap: 26 }}>
        <TeamPlate d={data} i={0} at={10} />
        <TeamPlate d={data} i={1} at={20} />
      </div>
      <div style={{ transform: `translateY(${bob(frame, fps, 9, 2.3)}px)` }}><Mascot size={186} /></div>
    </PBand>
  );
};

// ── same · both say the SAME sound ───────────────────────────────────────────
export const PairSame: React.FC<BP> = ({ data, copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <PBand>
      <Head size={46}>Two spellings… 👀</Head>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {data.teams.map((t, i) => (
          <React.Fragment key={t.marker}>
            {i > 0 && <span style={{ fontSize: 60, color: palette.inkSoft }}>+</span>}
            <span style={{ fontSize: 132, fontWeight: 700, color: col(data, i) }}>{t.marker}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Ear size={132} />
        <SoundBadge text={copy.sound} size={92} />
      </div>
      <Head size={44}>…but only ONE sound!</Head>
    </PBand>
  );
};

// ── puzzle · so which spelling? ──────────────────────────────────────────────
export const PairPuzzle: React.FC<BP> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <PBand>
      <Head size={48}>So… which one? 🤔</Head>
      <div style={{ display: "flex", gap: 26 }}>
        {data.teams.map((t, i) => (
          <div key={t.marker} style={{ width: 380, transform: `translateY(${bob(frame, fps, 10, 2.1, i)}px) rotate(${wiggle(frame, fps, 3, 1.8, i)}deg)`, background: "#fff", border: `8px solid ${col(data, i)}`, borderRadius: 34, padding: "26px 0", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: `0 18px 42px ${col(data, i)}55` }}>
            <span style={{ fontSize: 92, fontWeight: 700, color: col(data, i) }}>{t.marker}</span>
            <span style={{ fontSize: 68, fontWeight: 700, color: palette.inkSoft }}>?</span>
          </div>
        ))}
      </div>
      <Head size={42}>It depends WHERE it sits 📍</Head>
      <div style={{ transform: `translateY(${bob(frame, fps, 9, 2.4)}px)` }}><Mascot size={180} /></div>
    </PBand>
  );
};

// ── the two rules — same component, driven by which team ────────────────────
export const PairRule: React.FC<BP & { team: 0 | 1 }> = ({ data, copy, team }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = data.teams[team];
  const c = col(data, team);
  const mk = t.marker;
  const hero = team === 0 ? copy.midHero : copy.endHero;
  const words = (team === 0 ? copy.midWords : copy.endWords).slice(0, 3);
  const place = team === 0 ? "in the MIDDLE" : "at the END";

  return (
    <PBand>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontSize: 96, transform: `translateY(${bob(frame, fps, 8, 2.2)}px)`, display: "inline-block" }}>{t.zoneEmoji}</span>
        <div style={{ background: c, color: "#fff", borderRadius: 30, padding: "16px 44px", fontSize: 60, fontWeight: 700, boxShadow: `0 18px 44px ${c}88` }}>
          {mk} {place}
        </div>
      </div>

      {/* the hero word, with the spelling called out inside it */}
      <div style={{ background: "#fff", borderRadius: 34, padding: "10px 54px", fontSize: 150, fontWeight: 700, letterSpacing: 6, boxShadow: "0 20px 50px rgba(20,16,40,0.24)" }}>
        {hero.split(mk).map((part, i, arr) => (
          <React.Fragment key={i}>
            <span style={{ color: palette.ink }}>{part}</span>
            {i < arr.length - 1 && <span style={{ color: c }}>{mk}</span>}
          </React.Fragment>
        ))}
      </div>

      {/* more examples, full width, each showing the blank filled */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        {words.map((w, i) => (
          <Row
            key={w}
            at={10 + i * 26}
            color={c}
            big
            body={<>
              {w.split(mk).map((part, k, arr) => (
                <React.Fragment key={k}>
                  <span style={{ color: palette.ink }}>{part}</span>
                  {k < arr.length - 1 && <span style={{ color: c }}>{mk}</span>}
                </React.Fragment>
              ))}
            </>}
            mark={<span style={{ fontSize: 40 }}>{t.zoneHint}</span>}
          />
        ))}
      </div>

      <Head size={40}>{team === 0 ? "inside a word → " + mk : "last letters → " + mk}</Head>
    </PBand>
  );
};

// ── see it · the two lists side by side ──────────────────────────────────────
export const PairSeeIt: React.FC<BP> = ({ data, copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lists = [copy.midWords.slice(0, 3), copy.endWords.slice(0, 3)];
  return (
    <PBand>
      <Head size={46}>See them both! 👀</Head>
      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        {data.teams.map((t, i) => {
          const c = col(data, i);
          return (
            <div key={t.marker} style={{ width: 428, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
              <div style={{ width: "100%", background: c, color: "#fff", borderRadius: 26, padding: "12px 0", textAlign: "center", fontSize: 62, fontWeight: 700, boxShadow: `0 14px 34px ${c}77` }}>
                {t.zoneEmoji} {t.marker}
              </div>
              {lists[i].map((w, k) => {
                const at = 12 + i * 14 + k * 30;
                const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
                if (frame < at) return null;
                return (
                  <div key={w} style={{ width: "100%", transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2.3, k)}px)`, background: "#fff", border: `6px solid ${c}`, borderRadius: 24, padding: "10px 0", textAlign: "center", fontSize: 62, fontWeight: 700, boxShadow: `0 12px 28px ${c}44` }}>
                    {w.split(t.marker).map((part, m, arr) => (
                      <React.Fragment key={m}>
                        <span style={{ color: palette.ink }}>{part}</span>
                        {m < arr.length - 1 && <span style={{ color: c }}>{t.marker}</span>}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `translateY(${bob(frame, fps, 8, 2.3)}px)` }}><Mascot size={166} /></div>
        <Head size={38}>Same sound, different spot!</Head>
      </div>
    </PBand>
  );
};

// ── quiz · fill the blank ────────────────────────────────────────────────────
export const PairQuiz: React.FC<BP & { revealAt: number; word: string; answer: 0 | 1 }> = ({ data, revealAt, word, answer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAt;
  const mk = data.teams[answer].marker;
  const c = col(data, answer);
  const titleIn = spring({ frame, fps, config: { damping: 12 } });
  return (
    <PBand>
      <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `scale(${titleIn})` }}>
        <Ear size={116} />
        <div style={{ fontSize: 62, fontWeight: 700, color: palette.ink }}>Your turn! 🤔</div>
      </div>

      <div style={{ background: "#fff", borderRadius: 34, padding: "10px 56px", fontSize: 168, fontWeight: 700, letterSpacing: 8, boxShadow: "0 20px 50px rgba(20,16,40,0.26)" }}>
        {word.split(mk).map((part, i, arr) => (
          <React.Fragment key={i}>
            <span style={{ color: palette.ink }}>{part}</span>
            {i < arr.length - 1 && <span style={{ color: revealed ? c : palette.blank }}>{revealed ? mk : "__"}</span>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        {data.teams.map((t, i) => {
          const cc = col(data, i);
          const lit = revealed && i === answer;
          const dim = revealed && i !== answer;
          const pop = lit ? spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1;
          return (
            <div key={t.marker} style={{ width: ROW_W, transform: `rotate(${lit ? 0 : wiggle(frame, fps, 1.6, 1.7, i)}deg) scale(${lit ? 1 + pop * 0.05 : 1})`, opacity: dim ? 0.3 : 1, background: lit ? cc : "#fff", border: `8px solid ${cc}`, borderRadius: 30, padding: "18px 30px", display: "flex", alignItems: "center", gap: 22, fontSize: 72, fontWeight: 700, color: lit ? "#fff" : cc, boxShadow: lit ? `0 20px 54px ${cc}99` : "0 16px 40px rgba(20,16,40,0.22)", boxSizing: "border-box" }}>
              <span style={{ fontSize: 78 }}>{t.zoneEmoji}</span>
              <span style={{ flex: 1 }}>{t.marker}</span>
              <span style={{ fontSize: 44, fontWeight: 700, opacity: 0.9 }}>{t.zoneHint}</span>
              <span style={{ fontSize: 70 }}>{lit ? "🎉" : ""}</span>
            </div>
          );
        })}
      </div>
      <Burst start={revealAt} top="50%" />
    </PBand>
  );
};

// ── recap · the rule, one card per team ──────────────────────────────────────
export const PairRecap: React.FC<BP> = ({ data, copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroes = [copy.midHero, copy.endHero];
  return (
    <PBand>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {["⭐", "🧠", "⭐"].map((e, k) => {
          const s = spring({ frame: frame - 4 - k * 5, fps, config: { damping: 10 } });
          return <span key={k} style={{ fontSize: k === 1 ? 100 : 66, transform: `scale(${s}) rotate(${wiggle(frame, fps, 7, 2.2, k)}deg)`, display: "inline-block" }}>{e}</span>;
        })}
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, color: palette.ink }}>Remember!</div>
      {data.teams.map((t, i) => {
        const c = col(data, i);
        const at = 10 + i * 30;
        const on = frame >= at;
        const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
        return (
          <div key={t.marker} style={{ width: ROW_W, transform: `scale(${on ? s : 0.92}) translateY(${bob(frame, fps, 5, 2.4, i)}px)`, opacity: on ? 1 : 0.22, background: "#fff", border: `8px solid ${c}`, borderRadius: 34, padding: "18px 28px", display: "flex", alignItems: "center", gap: 22, boxShadow: on ? `0 20px 50px ${c}66` : "0 14px 34px rgba(20,16,40,0.16)", boxSizing: "border-box" }}>
            <span style={{ fontSize: 88 }}>{t.zoneEmoji}</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 70, fontWeight: 700, color: c, lineHeight: 1.05 }}>{t.marker}</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: palette.inkSoft }}>{i === 0 ? "inside the word" : "at the end"}</span>
            </div>
            <span style={{ background: c, color: "#fff", borderRadius: 22, padding: "12px 26px", fontSize: 52, fontWeight: 700 }}>{heroes[i]}</span>
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `translateY(${bob(frame, fps, 8, 2.3)}px)` }}><Mascot size={168} /></div>
        <Head size={38}>{data.rule.replace(/…/g, " · ")}</Head>
      </div>
    </PBand>
  );
};
