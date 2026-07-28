import React from "react";
import { spring, staticFile, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat, sec } from "../lib/timing";
import { Burst, PHead, PP_SAFE_X } from "../components/PortraitBeatKit";
import { CkWordChip } from "../components/CkWordChip";
import { LogoBadge } from "../components/BrandMarks";
import { hex, palette, tint, font } from "../data/tokens";
import { bob, pulse, wiggle } from "../lib/motion";
import { illustrationFor } from "../data/wordImages";
import { PairCopy } from "./pair_16x9_beats";

// Portrait (9:16) versions of the shared pair beats. Same teaching, same cues, laid out for
// a 1080×1920 frame: everything stacks, and nothing may cross y 1500 where the captions live.
//
// The rule this file exists to keep: every beat is staged to the NARRATION, never one layout
// held for a long stretch. Each component takes the cue frames it needs rather than guessing.

const BOARD_W = 900;
const CARD = 110; // 3 across: 3×198 + 2×53 gaps = 700, comfortably inside 900

export const PPairHook: React.FC<{ data: PhonicsComparison }> = ({ data }) => (
  <PHead still size={52}>
    <span style={{ color: hex(data.teams[0].colorHex) }}>{data.teams[0].marker}</span> &amp;{" "}
    <span style={{ color: hex(data.teams[1].colorHex) }}>{data.teams[1].marker}</span> — two spellings, one sound!
  </PHead>
);

export const PPairSame: React.FC<{ data: PhonicsComparison; copy: PairCopy }> = ({ data, copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = Math.max(0, Math.sin((frame / fps) * 3.2));
  const c = hex(data.teams[0].colorHex);
  return (
    <div style={{ position: "absolute", top: 210, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: -16 - ring * 24, borderRadius: 999, border: `6px solid ${c}`, opacity: (1 - ring) * 0.5 }} />
        <div style={{ background: "#ffffffef", borderRadius: 999, padding: "16px 44px", fontSize: 66, fontWeight: 700, color: c, fontFamily: font.family, boxShadow: "0 14px 34px rgba(20,16,40,0.3)", transform: `translateY(${bob(frame, fps, 4, 2.6)}px)` }}>
          {copy.soundLabel}
        </div>
      </div>
    </div>
  );
};

export const PPairWhere: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const swap = beat.word("where") >= 0 ? beat.word("where") : 999;
  return frame < swap ? (
    <PHead size={44}>How do you know which one to write? 🤔</PHead>
  ) : (
    <PHead size={46}>
      It's all about <span style={{ color: "#D81B60" }}>WHERE</span> the sound sits 📍
    </PHead>
  );
};

export const PPairRule: React.FC<{ data: PhonicsComparison; teamIdx: number }> = ({ data, teamIdx }) => {
  const team = data.teams[teamIdx];
  const c = hex(team.colorHex);
  return (
    <PHead size={44}>
      Sound <span style={{ color: c }}>{(team.zonePhrase ?? `in the ${team.zoneHint}`).toUpperCase()}</span> {team.zoneEmoji}
      <br />→ write <span style={{ color: c }}>{team.marker}</span>
    </PHead>
  );
};

export const PPairBonus: React.FC<{ data: PhonicsComparison; ruleAt: number; guards: string; examples: [string, string] }> = ({ data, ruleAt, guards, examples }) => {
  const frame = useCurrentFrame();
  const team = data.teams[1];
  const c = hex(team.colorHex);
  const tintW = (w: string) => {
    const i = w.indexOf(team.marker);
    return i < 0 ? <>{w}</> : (<>{w.slice(0, i)}<span style={{ color: c }}>{team.marker}</span>{w.slice(i + team.marker.length)}</>);
  };
  return frame < ruleAt ? (
    <PHead size={50}>And here's a bonus 🎁</PHead>
  ) : (
    <PHead size={42} from={ruleAt}>
      <span style={{ color: c }}>{team.marker}</span> also guards {guards}
      <br />
      {tintW(examples[0])} · {tintW(examples[1])}
    </PHead>
  );
};

// ❌ / ✅ contrast, stacked
export const PPairNotThis: React.FC<{ data: PhonicsComparison; beat: Beat; copy: PairCopy }> = ({ data, beat, copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const second = beat.word(copy.wrong[1].bad) >= 0 ? beat.word(copy.wrong[1].bad) - 18 : sec(2.8, fps);
  const recap = beat.word("middle") >= 0 ? beat.word("middle") - 24 : sec(6.0, fps);
  const { bad, good } = frame < second ? copy.wrong[0] : copy.wrong[1];
  const s = spring({ frame: frame - (frame < second ? 0 : second), fps, config: { damping: 12 } });
  if (frame >= recap) {
    return (
      <PHead size={40}>
        <span style={{ color: hex(data.teams[0].colorHex) }}>{data.teams[0].marker}</span> inside {data.teams[0].zoneEmoji}
        <br />
        <span style={{ color: hex(data.teams[1].colorHex) }}>{data.teams[1].marker}</span> at the end {data.teams[1].zoneEmoji}
      </PHead>
    );
  }
  return (
    <div style={{ position: "absolute", top: 200, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, fontFamily: font.family, transform: `scale(${0.9 + 0.1 * s})` }}>
      <div style={{ position: "relative", background: "#FFEBEE", border: "6px solid #C62828", borderRadius: 24, padding: "8px 34px", fontSize: 56, fontWeight: 700, color: "#C62828" }}>
        {bad}
        <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1="8%" y1="14%" x2="92%" y2="86%" stroke="#C62828" strokeWidth={8} strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ fontSize: 38 }}>⬇</span>
      <div style={{ background: "#E8F5E9", border: "6px solid #2E7D32", borderRadius: 24, padding: "8px 34px", fontSize: 56, fontWeight: 700, color: "#2E7D32" }}>{good}</div>
    </div>
  );
};

// ── seeIt — the two boards STACK, both present, the one being spoken is lit ──
const PBoard: React.FC<{
  team: PhonicsComparison["teams"][0]; words: string[]; beat: Beat; headAt: number; top: number;
}> = ({ team, words, beat, headAt, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);
  const inn = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const myTurn = frame >= headAt;
  const lastSpoken = (w: string) => {
    let at = -1;
    for (let n = 0; n < 8; n++) {
      const f = beat.word(w, n);
      if (f < 0) break;
      at = f;
    }
    return at;
  };
  return (
    <>
      {/* opaque sheet under the dim, or the world shows through the cards */}
      <div style={{ position: "absolute", left: PP_SAFE_X, top, width: BOARD_W, height: 500, borderRadius: 34, background: "#fff", opacity: inn, boxShadow: "0 18px 44px rgba(20,14,40,0.34)" }} />
      <div
        style={{
          position: "absolute", left: PP_SAFE_X, top, width: BOARD_W, height: 500, borderRadius: 34,
          background: tint(team.colorHex, 0.9), border: `6px solid ${tint(team.colorHex, 0.45)}`,
          opacity: inn * (myTurn ? 1 : 0.5), transform: `scale(${myTurn ? 1 : 0.97})`, fontFamily: font.family,
        }}
      >
        <div style={{ position: "absolute", top: 12, left: "50%", transform: `translateX(-50%) translateY(${bob(frame, fps, 3, 2.4)}px)`, background: c, color: "#fff", borderRadius: 999, padding: "6px 24px", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", boxShadow: `0 8px 22px ${c}66` }}>
          <span style={{ fontSize: 28 }}>{team.zoneEmoji}</span>
          <span style={{ fontSize: 38, fontWeight: 700 }}>{team.marker}</span>
          <span style={{ fontSize: 22, fontWeight: 600, opacity: 0.9 }}>· {team.zonePhrase ? team.zonePhrase.replace(" the word", "") : team.zoneHint}</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, bottom: 14, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          {[words.slice(0, 3), words.slice(3, 6)].map((row, r) => (
            <div key={r} style={{ display: "flex", justifyContent: "center", gap: 38 }}>
              {row.map((w) => {
                const i = words.indexOf(w);
                const at = lastSpoken(w);
                return (
                  <div key={w} style={{ opacity: at >= 0 && frame >= at ? 1 : 0.42 }}>
                    <CkWordChip word={w} blanked={w.replace(team.marker, "_".repeat(team.marker.length))} colorHex={team.colorHex} enterFrame={6 + i * 4} litFrame={at >= 0 ? at : undefined} size={CARD} phase={i} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const PPairSeeIt: React.FC<{ data: PhonicsComparison; beat: Beat; wordsMid: string[]; wordsEnd: string[] }> = ({ data, beat, wordsMid, wordsEnd }) => {
  const { fps } = useVideoConfig();
  const endHead = beat.word("Now") >= 0 ? beat.word("Now") - 20 : sec(16, fps);
  return (
    <>
      <PHead size={44}>More words! 📚</PHead>
      <PBoard team={data.teams[0]} words={wordsMid} beat={beat} headAt={0} top={404} />
      <PBoard team={data.teams[1]} words={wordsEnd} beat={beat} headAt={endHead} top={934} />
    </>
  );
};

const QuizIllo: React.FC<{ word: string }> = ({ word }) => {
  const illo = illustrationFor(word);
  if (!illo) return null;
  if (illo.kind === "image") return <Img src={staticFile(illo.src)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />;
  return <span>{illo.char}</span>;
};

// ── quiz — picture, word, then the two choices, all stacked ─────────────────
export const PPairQuiz: React.FC<{ data: PhonicsComparison; beat: Beat; copy: PairCopy; word: string; blanked: string; answer: number }> = ({ data, beat, copy, word, blanked, answer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = beat.word(copy.reveal.needle, copy.reveal.nth);
  if (cue < 0) throw new Error(`PPairQuiz: reveal cue "${copy.reveal.needle}"#${copy.reveal.nth} missing in "${beat.id}"`);
  const revealAt = cue;
  const revealed = frame >= revealAt;
  const team = data.teams[answer];
  const c = hex(team.colorHex);
  const s = spring({ frame: frame - revealAt, fps, config: { damping: 10 } });
  const cut = word.indexOf(team.marker);
  const wordAt = beat.word(word) >= 0 ? beat.word(word) : 0;
  const wordIn = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  const optionAt = data.teams.map((t) => beat.word(t.marker));
  let pointed = -1;
  for (let j = 0; j < optionAt.length; j++) if (!revealed && optionAt[j] >= 0 && frame >= optionAt[j]) pointed = j;
  const tension = Math.min(3, Math.max(1, 1 + ((frame - (revealAt - 55)) / 55) * 2));

  return (
    <>
      <PHead size={48}>Your turn! 🤔</PHead>
      <div style={{ position: "absolute", top: 404, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 36, fontFamily: font.family }}>
        <div style={{ width: 300, height: 300, background: palette.card, border: `9px solid ${c}`, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 168, overflow: "hidden", padding: 16, boxShadow: `0 18px 44px ${c}44`, transform: `translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
          <QuizIllo word={word} />
        </div>

        {/* on a panel: these worlds are dark, and dark ink on a night sky left the y and the
            n of "y__n" unreadable */}
        <div
          style={{
            display: "flex", alignItems: "baseline", gap: 6, fontSize: 130, fontWeight: 700, color: palette.ink, lineHeight: 1.1,
            background: "#FFFFFFF2", borderRadius: 34, padding: "18px 46px",
            boxShadow: "0 16px 40px rgba(20,14,40,0.4)",
            opacity: frame >= wordAt ? 1 : 0.22,
            transform: `scale(${(frame >= wordAt ? 0.9 + 0.1 * wordIn : 0.92) * (revealed ? pulse(frame - revealAt, fps, 0.05, 0.8) : 1)})`,
          }}
        >
          {revealed ? (
            <>
              <span>{word.slice(0, cut)}</span>
              <span style={{ color: c, display: "inline-block", transform: `scale(${1 + 0.18 * s})`, textShadow: `0 12px 30px ${c}55` }}>{team.marker}</span>
              <span>{word.slice(cut + team.marker.length)}</span>
            </>
          ) : (
            blanked.split("").map((ch, i) =>
              ch === "_" ? <span key={i} style={{ display: "block", width: 58, height: 11, background: "#B9C4D6", borderRadius: 6, margin: "0 5px", transformOrigin: "bottom" }} /> : <span key={i}>{ch}</span>
            )
          )}
        </div>

        <div style={{ display: "flex", gap: 46, marginTop: 34 }}>
          {data.teams.map((t, i) => {
            const tc = hex(t.colorHex);
            const lit = revealed && i === answer;
            const dim = revealed && i !== answer;
            const isPointed = pointed === i;
            const pointS = isPointed && optionAt[i] >= 0 ? spring({ frame: frame - optionAt[i], fps, config: { damping: 9 } }) : 0;
            const pop = lit ? spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 0;
            return (
              <div key={t.marker} style={{ position: "relative" }}>
                {isPointed && (
                  <div style={{ position: "absolute", top: -78, left: "50%", fontSize: 56, transform: `translateX(-50%) scale(${pointS}) translateY(${bob(frame, fps, 9, 3.4)}px)` }}>👇</div>
                )}
                <div
                  style={{
                    background: lit ? tc : "#fff", border: `8px solid ${tc}`, borderRadius: 28, padding: "12px 46px",
                    fontSize: 76, fontWeight: 700, color: lit ? "#fff" : tc, opacity: dim ? 0.3 : 1,
                    transform: `scale(${(lit ? 1 + pop * 0.16 : 1) * (1 + pointS * 0.1)}) rotate(${lit ? 0 : wiggle(frame, fps, 2 * tension, 1.6 / tension, i)}deg)`,
                    boxShadow: lit || isPointed ? `0 16px 44px ${tc}88` : "0 10px 26px rgba(20,14,40,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.marker}
                  {lit && <span style={{ fontSize: 42, marginLeft: 10 }}>🎉</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Burst start={revealAt} top="46%" />
    </>
  );
};

// ── recap — the two cards stack, each lighting on its own spoken marker ─────
export const PPairRecap: React.FC<{ data: PhonicsComparison; beat: Beat }> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <PHead size={50}>Remember! ✨</PHead>
      <div style={{ position: "absolute", top: 430, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, fontFamily: font.family }}>
        {data.teams.map((t, i) => {
          const c = hex(t.colorHex);
          const cue = beat.word(t.marker);
          const litAt = cue >= 0 ? cue : 24 + i * 44;
          const lit = frame >= litAt;
          const enter = spring({ frame: frame - i * 8, fps, config: { damping: 13 } });
          const kick = lit ? 1 + 0.16 * Math.max(0, 1 - (frame - litAt) / 20) : 1;
          const glow = lit ? 1 + 0.035 * Math.sin((frame / fps) * 6.5) : 1;
          return (
            <div key={t.marker} style={{ position: "relative" }}>
              {lit && (
                <div style={{ position: "absolute", inset: -8 - 28 * Math.min(1, (frame - litAt) / 18), borderRadius: 52, border: `8px solid ${c}`, opacity: 0.6 * Math.max(0, 1 - (frame - litAt) / 18) }} />
              )}
              <div
                style={{
                  width: 760, background: lit ? tint(t.colorHex, 0.88) : "#fff",
                  border: `8px solid ${lit ? c : tint(t.colorHex, 0.5)}`, borderRadius: 38, padding: "24px 40px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 26,
                  opacity: lit ? 1 : 0.72, boxShadow: lit ? `0 20px 50px ${c}66` : "0 12px 30px rgba(20,14,40,0.28)",
                  transform: `scale(${(0.88 + 0.12 * enter) * kick * glow}) translateY(${bob(frame, fps, lit ? 8 : 5, 2.6, i)}px)`,
                }}
              >
                <span style={{ fontSize: 62 }}>{t.zoneEmoji}</span>
                <span style={{ fontSize: 96, fontWeight: 700, color: c, lineHeight: 1 }}>{t.marker}</span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 34, fontWeight: 600, color: lit ? c : palette.inkSoft }}>
                    {t.zonePhrase ?? (t.zoneHint === "middle" ? "in the middle" : "at the end")}
                  </span>
                  {t.zoneNote && <span style={{ fontSize: 23, fontWeight: 600, color: palette.inkSoft }}>{t.zoneNote}</span>}
                </span>
              </div>
            </div>
          );
        })}
        <div style={{ transform: `scale(${spring({ frame: frame - 70, fps, config: { damping: 12 } })})`, marginTop: 8 }}>
          <LogoBadge size={128} />
        </div>
      </div>
    </>
  );
};
