import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { Lightbulb } from "../components/Graphics";
import { CkWordChip } from "../components/CkWordChip";
import { Burst } from "../components/PortraitBeatKit";
import { illustrationFor } from "../data/wordImages";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";
import { Mascot } from "../components/Mascot";
import { P_BAND_H } from "../components/WordStreetPortrait";

// PORTRAIT beats for c/k/ck — the SAME beats as the 16:9 lesson (`c_k_ck_beats.tsx`),
// re-laid out for 1080×1920. Deliberately NOT a different teaching design: the user
// asked for the landscape cut's script-progress, just managed in portrait.
//
// Zones (mirrors WordStreetPortrait):
//   y    0 …  330  BAND    — the pills below live here, nothing else
//   y  350 … 1500  STAGE   — WordStreetPortrait, or a Center beat once it hides
//   y 1520 … 1920  CAPTION

type BeatProps = { data: PhonicsComparison; beat: Beat };

// The mascot lives on the Word Street, which fades out at "Let's try" — so the last
// three beats had a bare line of text. He heads each of them with a beat badge.
const MascotHead: React.FC<{ badge: string; size?: number }> = ({ badge, size = 160 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", transform: `translateY(${bob(frame, fps, 9, 2.3)}px)` }}>
      <Mascot size={size} />
      <div
        style={{
          position: "absolute",
          right: -size * 0.22,
          top: -size * 0.1,
          background: "#fff",
          borderRadius: 999,
          width: size * 0.46,
          height: size * 0.46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.26,
          boxShadow: `0 10px 24px ${palette.cardShadow}`,
          transform: `scale(${pulse(frame, fps, 0.06, 1.5)}) rotate(${wiggle(frame, fps, 5, 2.2)}deg)`,
        }}
      >
        {badge}
      </div>
    </div>
  );
};

// ── shared bits ──────────────────────────────────────────────────────────────
const Pill: React.FC<{ from?: number; color?: string; still?: boolean; children: React.ReactNode }> = ({
  from = 0,
  color = palette.cardShadow,
  still = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = still ? 1 : spring({ frame: frame - from, fps, config: { damping: 12 } });
  if (frame < from) return null;
  return (
    <div
      style={{
        transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.6)}px)`,
        background: "#ffffffee",
        border: `4px solid ${color}`,
        borderRadius: 999,
        padding: "14px 40px",
        fontSize: 48,
        fontWeight: 700,
        color: palette.ink,
        boxShadow: `0 12px 30px ${palette.cardShadow}`,
        whiteSpace: "nowrap",
        maxWidth: 1000,
      }}
    >
      {children}
    </div>
  );
};

const kw = (text: string, color: string) => <span style={{ color, fontWeight: 700 }}>{text}</span>;

// headline band container — hard-capped at P_BAND_H so nothing can reach the rows
// top = 100 keeps every pill clear of the 90px social safe margin
const Band: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 100 }) => (
  <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: P_BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: top, gap: 14, pointerEvents: "none", overflow: "hidden" }}>
    {children}
  </div>
);

// centre stage — used once the street has faded (try / quiz / remember)
const Center: React.FC<{ children: React.ReactNode; lift?: number }> = ({ children, lift = 0 }) => (
  <div style={{ position: "absolute", top: 330, left: 0, width: 1080, height: 1170, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: lift, boxSizing: "border-box", pointerEvents: "none" }}>{children}</div>
);

// ── ① Hook ───────────────────────────────────────────────────────────────────
// `still` — this beat owns frame 0, which is the upload thumbnail, so the pill
// must be complete rather than mid-spring.
export const CHook: React.FC<BeatProps> = () => (
  <Band>
    <Pill still>3 ways to spell /k/! 🔑</Pill>
  </Band>
);

// ── ② Three spellings → one sound ────────────────────────────────────────────
export const CThree: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oneAt = Math.max(0, beat.word("one"));
  const titleS = spring({ frame, fps, config: { damping: 12 } });
  const chipAt = [8, 18, 28];
  return (
    <Band>
      <div
        style={{
          transform: `scale(${titleS}) translateY(${bob(frame, fps, 5, 2.6)}px)`,
          background: "#ffffffee",
          border: `4px solid ${palette.cardShadow}`,
          borderRadius: 999,
          padding: "12px 36px",
          fontSize: 46,
          fontWeight: 700,
          color: palette.ink,
          boxShadow: `0 12px 30px ${palette.cardShadow}`,
          whiteSpace: "nowrap",
        }}
      >
        {frame >= oneAt ? <>three spellings = {kw("one /k/ sound!", "#2E7D32")}</> : "three spellings…"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {data.teams.map((t, i) => {
          const s = spring({ frame: frame - chipAt[i], fps, config: { damping: 10 } });
          const c = hex(t.colorHex);
          return (
            <div key={i} style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.2, i)}px)`, background: c, color: "#fff", borderRadius: 16, padding: "4px 22px", fontSize: 44, fontWeight: 700, boxShadow: `0 8px 20px ${c}55` }}>
              {t.marker}
            </div>
          );
        })}
        {frame >= oneAt && (
          <>
            <div style={{ fontSize: 42, fontWeight: 700, color: palette.ink }}>→</div>
            <div style={{ transform: `scale(${spring({ frame: frame - oneAt, fps, config: { damping: 9 } })})`, background: "#2E7D32", color: "#fff", borderRadius: 16, padding: "4px 26px", fontSize: 46, fontWeight: 700, boxShadow: "0 8px 22px #2E7D3255" }}>
              /k/
            </div>
          </>
        )}
      </div>
    </Band>
  );
};

// ── ③ Same-sound tag ─────────────────────────────────────────────────────────
export const CSame: React.FC<BeatProps> = () => (
  <Band>
    <Pill from={6}>same sound</Pill>
  </Band>
);

// ── ④ Puzzle ─────────────────────────────────────────────────────────────────
export const CPuzzle: React.FC<BeatProps> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = Math.max(0, beat.fRel(28.96));
  const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
  return (
    <Band>
      <Pill from={0}>which one? 🤔</Pill>
      {frame >= at && (
        <div style={{ transform: `scale(${s})`, width: 124, height: 124, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 14px 34px ${palette.cardShadow}` }}>
          <Lightbulb size={80} />
        </div>
      )}
    </Band>
  );
};

// ── ⑤⑥⑦ Rules ───────────────────────────────────────────────────────────────
export const CRule: React.FC<BeatProps & { team: number }> = ({ data, beat, team }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(data.teams[team].colorHex);

  if (team === 1) {
    // k also carries the soft-c "c says /s/ like city" callout before it takes over
    const cityAt = Math.max(0, beat.word("city"));
    const kAt = Math.max(0, beat.fRel(54.92));
    const cCol = hex(data.teams[0].colorHex);
    const cityS = spring({ frame: frame - (cityAt - 20), fps, config: { damping: 11 } });
    return (
      <Band>
        {frame >= cityAt - 20 && frame < kAt + 10 && (
          <div style={{ transform: `scale(${cityS}) translateY(${bob(frame, fps, 5, 2.4)}px)`, background: "#FFEBEE", border: "4px solid #E53935", borderRadius: 26, padding: "12px 32px", fontSize: 46, fontWeight: 700, color: palette.ink, boxShadow: `0 12px 30px ${palette.cardShadow}`, whiteSpace: "nowrap" }}>
            {kw("c", cCol)} says {kw("/s/", "#E53935")} — like in {kw("city", "#E53935")}!
          </div>
        )}
        {frame >= kAt + 10 && (
          <Pill from={kAt + 10} color={c}>
            before {kw("e, i", c)} → use {kw("k", c)}
          </Pill>
        )}
      </Band>
    );
  }

  return (
    <Band>
      <Pill from={4} color={c}>
        {team === 0 ? (
          <>
            before {kw("a, o, u", c)} → use {kw("c", c)}
          </>
        ) : (
          <>
            end + short vowel → {kw("ck", c)}
          </>
        )}
      </Pill>
    </Band>
  );
};

// ── ⑧ See-it — one group at a time, three fixed slots ────────────────────────
const SEEIT_GROUPS: { g: number; words: { word: string; blanked: string }[] }[] = [
  { g: 0, words: [{ word: "cat", blanked: "_at" }, { word: "cup", blanked: "_up" }, { word: "cot", blanked: "_ot" }] },
  { g: 1, words: [{ word: "key", blanked: "_ey" }, { word: "kit", blanked: "_it" }, { word: "king", blanked: "_ing" }] },
  { g: 2, words: [{ word: "duck", blanked: "du__" }, { word: "rock", blanked: "ro__" }, { word: "kick", blanked: "ki__" }] },
];
export const CSeeIt: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groups = SEEIT_GROUPS.map((gr) => ({ ...gr, words: gr.words.map((w) => ({ ...w, at: Math.max(0, beat.word(w.word)) })) }));
  const labelAt = [Math.max(0, beat.word("c")), Math.max(0, beat.word("k")), Math.max(0, beat.word("ck"))];
  let gi = 0;
  for (let j = 0; j < 3; j++) if (frame >= labelAt[j]) gi = j;
  // the first group's label is present from the BEAT start — keyed to labelAt[0]
  // (87.9s) it spent the beat's first ~2.5s at scale 0, so the row had a heading-
  // shaped hole above it while the narration was already running
  const labelPop = spring({ frame: frame - (gi === 0 ? 0 : labelAt[gi]), fps, config: { damping: 10 } });
  const group = groups[gi];
  const c = hex(data.teams[gi].colorHex);

  return (
    <Center lift={150}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <MascotHead badge="👀" />
        <div style={{ fontSize: 62, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 6, 2.6)}px)` }}>Let's try!</div>

        {/* clear space under the group letter so it reads as the row's heading */}
        <div
          style={{
            marginBottom: 26,
            background: c,
            color: "#fff",
            border: `5px solid ${c}`,
            borderRadius: 22,
            padding: "8px 42px",
            fontSize: 60,
            fontWeight: 700,
            boxShadow: `0 12px 28px ${c}66`,
            transform: `scale(${labelPop}) translateY(${bob(frame, fps, 5, 2.4)}px)`,
          }}
        >
          {group.g === 0 ? "c" : group.g === 1 ? "k" : "ck"}
        </div>

        {/* three fixed slots — ghost until the word is spoken, so never a blank stage */}
        <div style={{ display: "flex", gap: 44, alignItems: "center", justifyContent: "center" }}>
          {group.words.map((w, k) => {
            const on = frame >= w.at;
            return (
              <div key={`${gi}-${w.word}`} style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on ? (
                  <CkWordChip word={w.word} blanked={w.blanked} colorHex={data.teams[gi].colorHex} enterFrame={w.at} size={148} />
                ) : (
                  <div style={{ width: 250, height: 232, borderRadius: 54, border: `6px dashed ${c}55`, background: "#ffffff55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 78, fontWeight: 700, color: `${c}55`, transform: `translateY(${bob(frame, fps, 6, 2.2, k)}px)` }}>?</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Center>
  );
};

// ── ⑨+⑩ Quiz + reveal ───────────────────────────────────────────────────────
export const CQuiz: React.FC<BeatProps & { revealAt: number; underlineAt: number }> = ({ data, beat, revealAt, underlineAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const answer = 2;
  const revealed = frame >= revealAt;
  const underlined = frame >= underlineAt;
  const aCol = hex(data.teams[answer].colorHex);
  const suspense = interpolate(frame, [revealAt - 55, revealAt], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wordAt = Math.max(0, beat.fRel(107.22));
  const optionAt = [beat.fRel(109.34), beat.fRel(110.42), beat.fRel(111.36)];
  const wordIn = spring({ frame: frame - wordAt, fps, config: { damping: 12 } });
  let pointed = -1;
  for (let j = 0; j < 3; j++) if (!revealed && frame >= optionAt[j]) pointed = j;
  const before = "du";

  return (
    <Center lift={150}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <MascotHead badge="🤔" size={150} />
        <div style={{ fontSize: 58, fontWeight: 700, color: palette.ink, textAlign: "center", transform: `translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
          Your turn!
        </div>

        {/* word slot is HELD (ghosted) from the beat start — no hole before 107.22 */}
        <div style={{ fontSize: 168, fontWeight: 700, letterSpacing: 6, opacity: frame >= wordAt ? 1 : 0.22, transform: `scale(${(frame >= wordAt ? wordIn : 0.92) * (revealed ? pulse(frame - revealAt, fps, 0.05, 0.8) : 1)})` }}>
          {revealed ? (
            <>
              <span style={{ color: palette.ink }}>{before.slice(0, -1)}</span>
              <span style={underlined ? { color: palette.ink, textDecoration: "underline", textDecorationColor: "#00897B", textDecorationThickness: "11px", textUnderlineOffset: "10px" } : { color: palette.ink }}>{before.slice(-1)}</span>
              <span style={{ color: aCol }}>ck</span>
            </>
          ) : (
            <>
              <span style={{ color: palette.ink }}>{before}</span>
              <span style={{ color: palette.blank }}>__</span>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 34 }}>
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
                {isPointed && (
                  <div style={{ position: "absolute", top: -70, left: "50%", transform: `translateX(-50%) scale(${pointS}) translateY(${bob(frame, fps, 9, 3.4)}px)`, fontSize: 54 }}>👇</div>
                )}
                <div
                  style={{
                    transform: `scale(${scale * (1 + pointS * 0.1)}) rotate(${lit ? 0 : wiggle(frame, fps, 2 * suspense, 1.6 / suspense, i)}deg)`,
                    opacity: dim ? 0.3 : 1,
                    background: lit ? c : palette.card,
                    color: lit ? "#fff" : c,
                    border: `8px solid ${c}`,
                    borderRadius: 30,
                    padding: "22px 52px",
                    fontSize: 86,
                    fontWeight: 700,
                    boxShadow: lit || isPointed ? `0 14px 40px ${c}88` : `0 14px 34px ${palette.cardShadow}`,
                  }}
                >
                  {team.marker} {lit ? "🎉" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Burst start={revealAt} top="42%" />
    </Center>
  );
};

// ── ⑪ Recap — three stacked summary cards ────────────────────────────────────
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
        <span style={{ color: palette.ink, textDecoration: "underline", textDecorationColor: "#00897B", textDecorationThickness: `${size * 0.09}px`, textUnderlineOffset: `${size * 0.08}px` }}>{before.slice(-1)}</span>
      )}
      <span style={{ color }}>{target}</span>
      <span style={{ color: palette.ink }}>{after}</span>
    </span>
  );
};
export const CRecap: React.FC<BeatProps> = ({ data, beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // first card lands on "Remember:" (beat start), not 0.6s later
  const ats = [0, beat.fRel(123.56), beat.fRel(126.22)];
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <MascotHead badge="🧠" size={140} />
        <div style={{ fontSize: 66, fontWeight: 700, color: palette.ink, transform: `translateY(${bob(frame, fps, 5, 2.6)}px)` }}>Remember!</div>
        {RECAP.map((r, idx) => {
          const at = Math.max(0, ats[idx]);
          const on = frame >= at;
          const team = data.teams[r.i];
          const c = hex(team.colorHex);
          const illo = illustrationFor(r.word);
          const emoji = illo && illo.kind === "emoji" ? illo.char : "";
          const cardS = spring({ frame: frame - at, fps, config: { damping: 12 } });
          const glow = on && frame < at + 34 ? Math.sin(((frame - at) / 34) * Math.PI) : 0;
          return (
            <div
              key={r.i}
              style={{
                width: 900,
                transform: `scale(${(on ? cardS : 0.94) * (1 + glow * 0.02)}) translateY(${bob(frame, fps, 5, 2.4, idx)}px)`,
                opacity: on ? 1 : 0.25,
                background: palette.card,
                border: `7px solid ${c}`,
                borderRadius: 36,
                padding: "20px 30px",
                display: "flex",
                alignItems: "center",
                gap: 24,
                boxShadow: on ? `0 16px 44px ${c}${glow > 0.05 ? "aa" : "55"}` : `0 14px 34px ${palette.cardShadow}`,
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: 92, fontWeight: 700, color: c, lineHeight: 1, minWidth: 130, textAlign: "center", textShadow: glow > 0.1 ? `0 0 ${glow * 40}px ${c}` : undefined }}>{team.marker}</span>
              <span style={{ flex: 1, fontSize: 38, fontWeight: 700, color: c }}>{r.rule}</span>
              <span style={{ fontSize: 74, transform: `translateY(${bob(frame, fps, 5, 2, idx)}px)` }}>{emoji}</span>
              <TintWord word={r.word} blanked={r.blanked} color={c} size={62} markVowel={r.i === 2} />
            </div>
          );
        })}
      </div>
    </Center>
  );
};
