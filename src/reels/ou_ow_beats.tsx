import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { Band, Center, Pill, STAGE_TOP, safeX } from "../components/LandscapeBeatKit";
import { CkWordChip } from "../components/CkWordChip";
import { hex, palette, tint, font } from "../data/tokens";
import { bob, pulse } from "../lib/motion";

// Beats that exist only on the ou/ow card.
//
// Nothing here may enter the caption band (y 880…1080), and while the circus set is up
// nothing may enter the stage (y 300…860) either.

// ── the bonus rule — ow also guards a final n or l ───────────────────────────
// The plain "ow finishes the word" is false and this card's own word list disproves it
// (brown, town, clown, crown, frown, gown, owl). This beat is where the honest version
// gets taught, so it is a beat and not a footnote.
export const OuBonus: React.FC<{ data: PhonicsComparison; beat: Beat; ruleAt: number }> = ({ data, beat, ruleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(data.teams[1].colorHex);
  const s = spring({ frame: frame - ruleAt, fps, config: { damping: 12 } });
  return (
    <Band top={84}>
      {frame < ruleAt ? (
        <Pill size={56}>And here's a bonus &#127873;</Pill>
      ) : (
        <div style={{ transform: `scale(${0.9 + 0.1 * s})` }}>
          <Pill color={palette.ink} size={48}>
            <span style={{ color: c }}>ow</span> also guards a final{" "}
            <span style={{ color: c }}>n</span> or <span style={{ color: c }}>l</span> &nbsp;·&nbsp; br<span style={{ color: c }}>ow</span>n · <span style={{ color: c }}>ow</span>l
          </Pill>
        </div>
      )}
    </Band>
  );
};

// ── the two-sound centrepiece ────────────────────────────────────────────────
// 85 seconds, the longest beat in any of these videos, and the reason the card is a
// TWO-RING circus: one performer, two acts. It runs as four screens so no layout is ever
// held for more than ~20s:
//   A  the two rings          — long O (as taught in the oa/ow video) vs /ow/
//   B  there is no rule       — said plainly, because there genuinely isn't one
//   C  the test, worked twice — snow ✓, then coe ✗ → cow ✓
//   D  WRITE vs READ          — the spelling rule still stands; only the sound is tested
export type TwoSoundCues = {
  longO: number;
  longWords: [number, number, number];
  owSound: number;
  owWords: [number, number, number];
  sameLetters: number;
  noRule: number;
  letters: number;
  noRuleStamp: number;
  testIt: number;
  test1: number;
  test1Word: number;
  test1Ok: number;
  test2: number;
  test2Word: number;
  test2Bad: number;
  test2Ok: number;
  trick: number;
  writeRead: number;
};

const LONG_O = "00897B"; // the oa/ow video's own colour — the callback has to LOOK like it
const RING_W = 844;
const RING_TOP = 322;
const RING_H = 462;

const Ring: React.FC<{
  label: string; sub: string; colorHex: string; words: string[]; marker: string;
  side: "left" | "right"; enterAt: number; wordAt: [number, number, number]; dim: boolean; badge?: string;
}> = ({ label, sub, colorHex, words, marker, side, enterAt, wordAt, dim, badge }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const c = hex(colorHex);
  const inn = spring({ frame: frame - enterAt, fps, config: { damping: 14 } });
  const x = side === "left" ? safeX(width) : width - safeX(width) - RING_W;
  return (
    <>
      {/* opaque backing: the big top behind is busy, and a dimmed panel over it is unreadable */}
      <div style={{ position: "absolute", left: x, top: RING_TOP, width: RING_W, height: RING_H, borderRadius: 36, background: "#FFFFFF", opacity: inn, boxShadow: "0 20px 50px rgba(20,10,26,0.35)" }} />
      <div
        style={{
          position: "absolute", left: x, top: RING_TOP, width: RING_W, height: RING_H,
          borderRadius: 36, background: tint(colorHex, 0.9), border: `6px solid ${tint(colorHex, 0.42)}`,
          opacity: inn * (dim ? 0.5 : 1), transform: `translateX(${(1 - inn) * (side === "left" ? -70 : 70)}px)`,
          fontFamily: font.family,
        }}
      >
        <div style={{ position: "absolute", top: 16, left: "50%", transform: `translateX(-50%) translateY(${bob(frame, fps, 3, 2.6)}px)`, background: c, color: "#fff", borderRadius: 999, padding: "8px 30px", display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap", boxShadow: `0 10px 26px ${c}66` }}>
          <span style={{ fontSize: 40, fontWeight: 700 }}>{label}</span>
          <span style={{ fontSize: 26, fontWeight: 600, opacity: 0.92 }}>· {sub}</span>
        </div>

        {/* "as seen in oa ⚡ ow" — the reminder the callback is built around */}
        {badge && (
          <div style={{ position: "absolute", top: 86, left: "50%", transform: "translateX(-50%)", background: "#FFFFFF", border: `3px solid ${c}`, color: c, borderRadius: 999, padding: "3px 18px", fontSize: 22, fontWeight: 700, whiteSpace: "nowrap" }}>
            {badge}
          </div>
        )}

        <div style={{ position: "absolute", left: 0, right: 0, top: badge ? 150 : 132, display: "flex", justifyContent: "center", gap: 44 }}>
          {words.map((w, i) => (
            <div key={w} style={{ opacity: frame >= wordAt[i] ? 1 : 0.34 }}>
              <CkWordChip
                word={w}
                blanked={w.replace(marker, "_".repeat(marker.length))}
                colorHex={colorHex}
                enterFrame={enterAt + 6 + i * 5}
                litFrame={wordAt[i]}
                size={116}
                phase={i}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// one line of the worked test: the word, what that sound gives you, and a verdict
const TestRow: React.FC<{
  spelled: string; result: string; ok: boolean; at: number; verdictAt: number; note: string; color: string;
}> = ({ spelled, result, ok, at, verdictAt, note, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const inn = spring({ frame: frame - at, fps, config: { damping: 13 } });
  const shown = frame >= verdictAt;
  const v = spring({ frame: frame - verdictAt, fps, config: { damping: 9 } });
  const vc = ok ? "#2E7D32" : "#C62828";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: inn, transform: `translateY(${(1 - inn) * 18}px)`, fontFamily: font.family }}>
      <div style={{ fontSize: 74, fontWeight: 700, color: palette.inkSoft, minWidth: 250, textAlign: "right" }}>{spelled}</div>
      <span style={{ fontSize: 46, color: palette.inkSoft }}>&rarr;</span>
      <div style={{ fontSize: 86, fontWeight: 700, color: hex(color), minWidth: 260 }}>{result}</div>
      {shown && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, transform: `scale(${0.7 + 0.3 * v})` }}>
          <span style={{ fontSize: 68 }}>{ok ? "✅" : "❌"}</span>
          <span style={{ fontSize: 40, fontWeight: 700, color: vc, whiteSpace: "nowrap" }}>{note}</span>
        </div>
      )}
    </div>
  );
};

export const OuTwoSounds: React.FC<{ data: PhonicsComparison; beat: Beat; cues: TwoSoundCues }> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const owC = data.teams[1].colorHex;

  // ── D · WRITE vs READ ──
  if (frame >= cues.writeRead) {
    const s = spring({ frame: frame - cues.writeRead, fps, config: { damping: 13 } });
    const panels = [
      { k: "WRITE", icon: "✏️", line: "use the rule", sub: "ou inside · ow at the end", c: data.teams[0].colorHex },
      { k: "READ", icon: "👀", line: "test the sound", sub: "try long O, then ow", c: owC },
    ];
    return (
      <>
        <Band top={92}><Pill size={50}>Two different jobs &#128161;</Pill></Band>
        <Center top={372}>
          <div style={{ display: "flex", gap: 64 }}>
            {panels.map((p, i) => {
              const c = hex(p.c);
              const e = spring({ frame: frame - cues.writeRead - i * 12, fps, config: { damping: 12 } });
              return (
                <div key={p.k} style={{ width: 640, background: "#fff", border: `8px solid ${c}`, borderRadius: 40, padding: "30px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, fontFamily: font.family, transform: `scale(${0.86 + 0.14 * e}) translateY(${bob(frame, fps, 7, 2.6, i)}px)`, boxShadow: `0 20px 48px ${c}55` }}>
                  <span style={{ fontSize: 62 }}>{p.icon}</span>
                  <span style={{ fontSize: 66, fontWeight: 700, color: c, letterSpacing: 2 }}>{p.k}</span>
                  <span style={{ fontSize: 40, fontWeight: 700, color: palette.ink }}>{p.line}</span>
                  <span style={{ fontSize: 30, fontWeight: 600, color: palette.inkSoft, textAlign: "center" }}>{p.sub}</span>
                </div>
              );
            })}
          </div>
        </Center>
        <AbsoluteFill style={{ opacity: 0.0001 * s }} />
      </>
    );
  }

  // ── C · the test, worked twice ──
  if (frame >= cues.test1) {
    return (
      <>
        <Band top={92}>
          <Pill size={50}>
            {frame >= cues.trick ? "Try one, then the other — keep the real word ✅" : "So… test it! 🔍"}
          </Pill>
        </Band>
        <Center top={352}>
          {/* an opaque panel: the tent behind is a busy magenta gradient with spotlights and
              falling confetti, and grey text straight on it is unreadable */}
          <div style={{ background: "#FFFFFF", borderRadius: 44, padding: "40px 60px", boxShadow: "0 22px 56px rgba(20,10,26,0.4)", display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start", minWidth: 1180 }}>
            <TestRow spelled="sn + ow" result="snow" ok at={cues.test1Word} verdictAt={cues.test1Ok} note="a real word!" color={LONG_O} />
            <TestRow spelled="c + ow" result="coe" ok={false} at={cues.test2Word} verdictAt={cues.test2Bad} note="not a word" color={LONG_O} />
            <TestRow spelled="c + ow" result="cow" ok at={cues.test2Ok} verdictAt={cues.test2Ok + 8} note="that's the one!" color={owC} />
          </div>
        </Center>
      </>
    );
  }

  // ── B · there is no rule ──
  // Four narration lines land in this 11s stretch, so it advances four times. Holding one
  // card for all of them is exactly the stalled-screen failure.
  if (frame >= cues.noRule) {
    const owBig = hex(owC);
    const showShrug = frame >= cues.letters;
    const showCard = frame >= cues.noRuleStamp;
    const showTest = frame >= cues.testIt;
    const stamp = spring({ frame: frame - cues.noRuleStamp, fps, config: { damping: 9 } });
    const testS = spring({ frame: frame - cues.testIt, fps, config: { damping: 8 } });
    // before the shrug lands, the two candidate sounds take turns asking
    const ask = Math.floor((frame - cues.noRule) / 20) % 2;
    const guess = (label: string, col: string, i: number) => {
      const on = !showShrug && ask === i;
      const c = hex(col);
      return (
        <div
          style={{
            background: "#fff", border: `7px solid ${c}`, color: c, borderRadius: 34,
            padding: "16px 34px", fontSize: 46, fontWeight: 700, whiteSpace: "nowrap",
            opacity: showShrug ? 0.4 : 1,
            transform: `scale(${on ? 1.09 : 1}) translateY(${bob(frame, fps, on ? 8 : 4, 2.4, i)}px)`,
            boxShadow: on ? `0 16px 40px ${c}66` : "0 10px 26px rgba(20,10,26,0.3)",
          }}
        >
          {label} ?
        </div>
      );
    };
    return (
      <>
        <Band top={88}><Pill size={48}>Which sound do you say? &#129300;</Pill></Band>
        <Center top={336}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: font.family }}>
            {/* the two candidates, and the letters themselves between them */}
            <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
              {guess("long O", LONG_O, 0)}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 150, fontWeight: 700, color: owBig, transform: `scale(${pulse(frame - cues.noRule, fps, 0.05, 1.1)})`, textShadow: `0 14px 34px ${owBig}66` }}>ow</span>
                {showShrug && (
                  <span style={{ position: "absolute", top: -104, left: "50%", marginLeft: -38, fontSize: 76, transform: `scale(${spring({ frame: frame - cues.letters, fps, config: { damping: 9 } })})` }}>🤷</span>
                )}
              </div>
              {guess("ow", owC, 1)}
            </div>

            {/* "the letters don't tell you" */}
            {showShrug && (
              <div style={{ background: "#FFFFFFEE", borderRadius: 999, padding: "10px 34px", fontSize: 40, fontWeight: 700, color: palette.ink, transform: `scale(${0.86 + 0.14 * spring({ frame: frame - cues.letters, fps, config: { damping: 12 } })})` }}>
                the letters don't tell you
              </div>
            )}

            {/* the verdict, stamped in */}
            {showCard && (
              <div style={{ background: "#fff", border: "9px dashed #C2185B", borderRadius: 40, padding: "20px 56px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 22px 54px rgba(20,10,26,0.4)", transform: `scale(${0.7 + 0.3 * stamp}) rotate(${(1 - stamp) * -7}deg)` }}>
                <span style={{ fontSize: 52 }}>&#128260;</span>
                <span style={{ fontSize: 58, fontWeight: 700, color: "#C2185B", whiteSpace: "nowrap" }}>There's no rule here</span>
              </div>
            )}

            {/* …so test it */}
            {showTest && (
              <div style={{ background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "12px 44px", fontSize: 46, fontWeight: 700, whiteSpace: "nowrap", transform: `scale(${0.6 + 0.4 * testS}) translateY(${bob(frame, fps, 7, 3)}px)`, boxShadow: "0 16px 40px rgba(46,125,50,0.5)" }}>
                🔍 You have to TEST it!
              </div>
            )}
          </div>
        </Center>
      </>
    );
  }

  // ── A · the two rings ──
  const sameL = frame >= cues.sameLetters;
  const leftFocus = frame < cues.owSound;
  return (
    <>
      <Band top={92}>
        <Pill size={48} color={palette.ink}>
          {sameL ? (
            <>
              Same two letters &mdash; <span style={{ color: hex(owC) }}>TWO</span> different sounds!
            </>
          ) : (
            <>
              <span style={{ color: hex(owC) }}>ow</span> has two jobs &#127914;
            </>
          )}
        </Pill>
      </Band>
      <AbsoluteFill>
        <Ring
          label="ow" sub="long O" colorHex={LONG_O} marker="ow" side="left"
          words={["snow", "grow", "show"]} enterAt={0} wordAt={cues.longWords}
          dim={!sameL && !leftFocus}
          badge="as seen in oa ⚡ ow"
        />
        <Ring
          label="ow" sub="ow!" colorHex={owC} marker="ow" side="right"
          words={["cow", "brown", "owl"]} enterAt={8} wordAt={cues.owWords}
          dim={!sameL && leftFocus}
        />
      </AbsoluteFill>
    </>
  );
};
