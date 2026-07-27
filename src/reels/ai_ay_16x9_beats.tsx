import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat, sec } from "../lib/timing";
import { Band, Center, Pill, STAGE_TOP, safeX } from "../components/LandscapeBeatKit";
import { CkWordChip } from "../components/CkWordChip";
import { LogoBadge } from "../components/BrandMarks";
import { hex, palette, tint, font } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import extraWordAudio from "../data/extraWordAudio.json";

// Beat overlays for ai-ay-16x9. The WordTrain carries the teaching beats; these are the
// headline-band pills plus the two full-stage beats that replace the train (see-it, quiz).
// Nothing here may enter y 300…860 while the train is up, or y 880…1080 ever.

const DUR: Record<string, number> = extraWordAudio as Record<string, number>;
const wordSrc = (w: string) => `audio/words/${w}.mp3`;

// ── hook · same · where · rules · notThis — headline pills only ──────────────
export const AaHook: React.FC<{ data: PhonicsComparison; beat: Beat }> = ({ data, beat }) => (
  <Band>
    <Pill color={palette.ink} still>
      <span style={{ color: hex(data.teams[0].colorHex) }}>ai</span> &amp;{" "}
      <span style={{ color: hex(data.teams[1].colorHex) }}>ay</span> — two spellings, one sound!
    </Pill>
  </Band>
);

export const AaSame: React.FC<{ data: PhonicsComparison; beat: Beat }> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // the sound itself, ringing while "Ayyy!" / "Same sound" are spoken
  const ring = Math.max(0, Math.sin((frame / fps) * 3.2));
  return (
    <Band top={70}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ position: "absolute", inset: -18 - ring * 26, borderRadius: 999, border: `6px solid ${hex(data.teams[0].colorHex)}`, opacity: (1 - ring) * 0.5 }} />
        <Pill size={72} color={hex(data.teams[0].colorHex)}>/ā/ — “ayyy”</Pill>
      </div>
    </Band>
  );
};

export const AaWhere: React.FC<{ data: PhonicsComparison; beat: Beat }> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const swap = beat.word("where") >= 0 ? beat.word("where") : 999;
  return (
    <Band>
      {frame < swap ? (
        <Pill>How do you know which one to write? 🤔</Pill>
      ) : (
        <Pill color={palette.ink}>
          It's all about <span style={{ color: "#D81B60" }}>WHERE</span> the sound sits 📍
        </Pill>
      )}
    </Band>
  );
};

export const AaRule: React.FC<{ data: PhonicsComparison; beat: Beat; teamIdx: number }> = ({ data, beat, teamIdx }) => {
  const team = data.teams[teamIdx];
  const c = hex(team.colorHex);
  return (
    <Band>
      <Pill color={palette.ink}>
        Sound in the <span style={{ color: c }}>{team.zoneHint.toUpperCase()}</span> {team.zoneEmoji} → write <span style={{ color: c }}>{team.marker}</span>
      </Pill>
    </Band>
  );
};

// ── notThis — the ❌ contrast, in the headline band above the train ──────────
export const AaNotThis: React.FC<{ data: PhonicsComparison; beat: Beat }> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const second = beat.word("dai") >= 0 ? beat.word("dai") - 18 : sec(2.8, fps);
  const recap = beat.word("middle") >= 0 ? beat.word("middle") - 24 : sec(6.0, fps);
  const bad = frame < second ? "rayn" : "dai";
  const good = frame < second ? "rain" : "day";
  const s = spring({ frame: frame - (frame < second ? 0 : second), fps, config: { damping: 12 } });
  if (frame >= recap) {
    return (
      <Band>
        <Pill color={palette.ink} size={50}>
          <span style={{ color: hex(data.teams[0].colorHex) }}>ai</span> in the middle 🏠 &nbsp;·&nbsp;{" "}
          <span style={{ color: hex(data.teams[1].colorHex) }}>ay</span> at the end 🏁
        </Pill>
      </Band>
    );
  }
  return (
    <Band top={84}>
      <div style={{ display: "flex", alignItems: "center", gap: 34, transform: `scale(${0.88 + 0.12 * s})` }}>
        <div style={{ position: "relative", background: "#FFEBEE", border: "6px solid #C62828", borderRadius: 26, padding: "12px 40px", fontSize: 62, fontWeight: 700, color: "#C62828", fontFamily: font.family }}>
          {bad}
          <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1="8%" y1="14%" x2="92%" y2="86%" stroke="#C62828" strokeWidth={9} strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: 52 }}>❌</span>
        <span style={{ fontSize: 46, color: palette.inkSoft, fontFamily: font.family }}>→</span>
        <span style={{ fontSize: 52 }}>✅</span>
        <div style={{ background: "#E8F5E9", border: "6px solid #2E7D32", borderRadius: 26, padding: "12px 40px", fontSize: 62, fontWeight: 700, color: "#2E7D32", fontFamily: font.family }}>
          {good}
        </div>
      </div>
    </Band>
  );
};

// ── seeIt — the train leaves, two boards of six words slide in ───────────────
// Card sizing (CkWordChip law): card width ≈ size × 1.8, a spoken card pulses 1.32×.
// 3 per row in an 844 board: 844 / (1.8 × (3 + 2×0.16)) = 141 max. 128 with gap 46 fits.
const BOARD_W = 844;
const CARD = 128;
const CARD_GAP = 46;

const WordBoard: React.FC<{
  team: PhonicsComparison["teams"][0];
  words: string[];
  beat: Beat;
  headAt: number;
  side: "left" | "right";
}> = ({ team, words, beat, headAt, side }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const c = hex(team.colorHex);
  // BOTH boards arrive together at the top of the beat — a board that waits 17s for its
  // turn is a blank half-screen, which is the dead-screen failure. The board whose turn
  // it is not is DIMMED, never empty.
  const inn = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const x = side === "left" ? safeX(width) : width - safeX(width) - BOARD_W;
  const slide = (1 - inn) * (side === "left" ? -80 : 80);
  const myTurn = frame >= headAt;
  return (
    <div
      style={{
        position: "absolute", left: x, top: STAGE_TOP, width: BOARD_W, height: 560,
        transform: `translateX(${slide}px) scale(${myTurn ? 1 : 0.97})`, opacity: myTurn ? 1 : 0.55,
        background: tint(team.colorHex, 0.9), border: `6px solid ${tint(team.colorHex, 0.45)}`,
        borderRadius: 40, boxShadow: `0 18px 46px ${c}33`, fontFamily: font.family,
      }}
    >
      {/* board header */}
      <div style={{ position: "absolute", top: 20, left: "50%", transform: `translateX(-50%) translateY(${bob(frame, fps, 4, 2.8)}px)`, background: c, color: "#fff", borderRadius: 999, padding: "10px 34px", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 10px 26px ${c}55`, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 38 }}>{team.zoneEmoji}</span>
        <span style={{ fontSize: 52, fontWeight: 700 }}>{team.marker}</span>
        <span style={{ fontSize: 30, fontWeight: 600, opacity: 0.9 }}>· {team.zoneHint}</span>
      </div>
      {/* two rows of three */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, bottom: 26, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
        {[words.slice(0, 3), words.slice(3, 6)].map((row, r) => (
          <div key={r} style={{ display: "flex", justifyContent: "center", gap: CARD_GAP }}>
            {row.map((w) => {
              const i = words.indexOf(w);
              const at = beat.word(w); // beat-relative frame the word is spoken
              // All six cards are present from the board's entrance — the board is never
              // half-empty. Being spoken is a LIT pulse, not an entrance.
              const spoken = at >= 0 && frame >= at;
              return (
                <div key={w} style={{ opacity: spoken ? 1 : 0.42 }}>
                  <CkWordChip
                    word={w}
                    blanked={blankFor(w, team.marker)}
                    colorHex={team.colorHex}
                    // enter with the BOARD, not at the board's turn — keying this to
                    // headAt left the second board's cards unrendered for 17 seconds
                    enterFrame={6 + i * 4}
                    litFrame={at >= 0 ? at : undefined}
                    size={CARD}
                    phase={i}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// "rain" + marker "ai" → "r__n" so CkWordChip tints the digraph
const blankFor = (word: string, marker: string) => {
  const i = word.indexOf(marker);
  if (i < 0) return word;
  return word.slice(0, i) + "_".repeat(marker.length) + word.slice(i + marker.length);
};

export const AaSeeIt: React.FC<{ data: PhonicsComparison; beat: Beat; wordsMid: string[]; wordsEnd: string[] }> = ({ data, beat, wordsMid, wordsEnd }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const midHead = 0;
  const endHead = beat.word("Now") >= 0 ? beat.word("Now") - 20 : sec(16, fps);
  return (
    <>
      {/* per-word audio, on each spoken cue */}
      {[...wordsMid, ...wordsEnd].map((w) => {
        const at = beat.word(w);
        if (at < 0 || !DUR[w]) return null;
        return (
          <Sequence key={w} from={at} durationInFrames={sec(DUR[w], fps) + 6}>
            <Audio src={staticFile(wordSrc(w))} volume={0.9} />
          </Sequence>
        );
      })}
      <AbsoluteFill>
        <WordBoard team={data.teams[0]} words={wordsMid} beat={beat} headAt={midHead} side="left" />
        <WordBoard team={data.teams[1]} words={wordsEnd} beat={beat} headAt={endHead} side="right" />
      </AbsoluteFill>
      <Band top={92}>
        <Pill size={46}>More words! 📚</Pill>
      </Band>
    </>
  );
};

// ── quiz — the word with a gap, then the answer ─────────────────────────────
export const AaQuiz: React.FC<{ data: PhonicsComparison; beat: Beat; word: string; blanked: string; answer: number }> = ({ data, beat, word, blanked, answer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // nth=2: the beat opens with "Now IT'S your turn!", so the first "it's" is 8s before the
  // answer — keying the reveal to it gave the answer away immediately.
  const revealAt = beat.word("it's", 2) >= 0 ? beat.word("it's", 2) : sec(8.8, fps);
  const askAt = beat.word("Is") >= 0 ? beat.word("Is") : sec(5, fps);
  const revealed = frame >= revealAt;
  const team = data.teams[answer];
  const c = hex(team.colorHex);
  const s = spring({ frame: frame - revealAt, fps, config: { damping: 10 } });
  const suspense = !revealed && frame > askAt ? 1 + 0.4 * Math.sin((frame / fps) * 8) : 1;
  const cut = word.indexOf(team.marker);

  return (
    <>
      <Band top={72}>
        <Pill size={50}>Your turn! 🤔</Pill>
      </Band>
      {/* picture LEFT, word + choices RIGHT — uses the 16:9 width instead of stacking
          everything in a tall column, which ran the word into the choice cards */}
      <Center top={392}>
        <div style={{ display: "flex", alignItems: "center", gap: 84 }}>
          <div style={{ width: 300, height: 300, background: palette.card, border: `9px solid ${c}`, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 168, boxShadow: `0 18px 44px ${c}44`, transform: `translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
            🎨
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: font.family, fontSize: 150, fontWeight: 700, color: palette.ink, lineHeight: 1.1 }}>
              {revealed ? (
                <>
                  <span>{word.slice(0, cut)}</span>
                  <span style={{ color: c, transform: `scale(${1 + 0.18 * s})`, display: "inline-block", textShadow: `0 12px 30px ${c}55` }}>{team.marker}</span>
                  <span>{word.slice(cut + team.marker.length)}</span>
                </>
              ) : (
                blanked.split("").map((ch, i) =>
                  ch === "_" ? (
                    <span key={i} style={{ display: "inline-block", width: 66, height: 11, background: "#B9C4D6", borderRadius: 6, margin: "0 4px", transform: `translateY(-10px) scaleY(${suspense})` }} />
                  ) : (
                    <span key={i}>{ch}</span>
                  )
                )
              )}
            </div>
            <div style={{ display: "flex", gap: 52 }}>
              {data.teams.map((t, i) => {
                const tc = hex(t.colorHex);
                const isAns = i === answer;
                const lit = revealed && isAns;
                const dim = revealed && !isAns;
                return (
                  <div
                    key={t.marker}
                    style={{
                      background: lit ? tc : "#fff",
                      border: `8px solid ${tc}`,
                      borderRadius: 30,
                      padding: "14px 52px",
                      fontSize: 82,
                      fontWeight: 700,
                      fontFamily: font.family,
                      color: lit ? "#fff" : tc,
                      opacity: dim ? 0.34 : 1,
                      transform: `scale(${lit ? 1 + 0.12 * s : 1}) translateY(${bob(frame, fps, lit ? 8 : 4, 2.2, i)}px)`,
                      boxShadow: lit ? `0 18px 46px ${tc}66` : "0 10px 26px rgba(30,36,56,0.14)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.marker}
                    {lit && <span style={{ fontSize: 46, marginLeft: 12 }}>🎉</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Center>
    </>
  );
};

// ── recap ────────────────────────────────────────────────────────────────────
export const AaRecap: React.FC<{ data: PhonicsComparison; beat: Beat }> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Center top={316}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Pill size={56}>Remember! ✨</Pill>
        <div style={{ display: "flex", gap: 56 }}>
          {data.teams.map((t, i) => {
            const c = hex(t.colorHex);
            const at = i * 34;
            const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
            return (
              <div
                key={t.marker}
                style={{
                  background: "#fff", border: `8px solid ${c}`, borderRadius: 40, padding: "30px 56px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  fontFamily: font.family, minWidth: 420,
                  transform: `scale(${0.8 + 0.2 * s}) translateY(${bob(frame, fps, 7, 2.6, i)}px)`,
                  boxShadow: `0 18px 44px ${c}44`,
                }}
              >
                <span style={{ fontSize: 60 }}>{t.zoneEmoji}</span>
                <span style={{ fontSize: 108, fontWeight: 700, color: c, lineHeight: 1 }}>{t.marker}</span>
                <span style={{ fontSize: 40, fontWeight: 600, color: palette.inkSoft }}>{t.zoneHint === "middle" ? "in the middle" : "at the end"}</span>
              </div>
            );
          })}
        </div>
        {/* brand badge — one logo, in the content, on the app's own gradient */}
        <div style={{ transform: `scale(${spring({ frame: frame - 70, fps, config: { damping: 12 } })})` }}>
          <LogoBadge size={118} />
        </div>
      </div>
    </Center>
  );
};
