import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { PHead, PP_SAFE_X } from "../components/PortraitBeatKit";
import { CkWordChip } from "../components/CkWordChip";
import { hex, palette, tint, font } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { TwoSoundCues } from "./ou_ow_beats";
import { OneSoundCues } from "./au_aw_beats";

// The two long beats, in portrait. Both stack what the landscape versions put side by side,
// and both keep the staging: the screen advances on every narration line, never once.

const LONG_O = "00897B"; // the oa/ow video's colour — the callback has to look like it
const BOARD_W = 900;

// ── ou/ow · ow has two sounds (85 seconds) ──────────────────────────────────
const PRing: React.FC<{
  label: string; sub: string; colorHex: string; words: string[]; marker: string; top: number;
  enterAt: number; wordAt: [number, number, number]; dim: boolean;
  badge?: string; badgeAt?: number; subAt?: number; curtainUntil?: number;
}> = ({ label, sub, colorHex, words, marker, top, enterAt, wordAt, dim, badge, badgeAt = 0, subAt = 0, curtainUntil = -1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(colorHex);
  const inn = spring({ frame: frame - enterAt, fps, config: { damping: 14 } });
  return (
    <>
      <div style={{ position: "absolute", left: PP_SAFE_X, top, width: BOARD_W, height: 470, borderRadius: 34, background: "#fff", opacity: inn, boxShadow: "0 18px 44px rgba(20,14,40,0.4)" }} />
      <div
        style={{
          position: "absolute", left: PP_SAFE_X, top, width: BOARD_W, height: 470, borderRadius: 34,
          background: tint(colorHex, 0.9), border: `6px solid ${tint(colorHex, 0.42)}`,
          opacity: inn * (dim ? 0.5 : 1), fontFamily: font.family, overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 14, left: "50%", transform: `translateX(-50%) translateY(${bob(frame, fps, 3, 2.4)}px)`, background: c, color: "#fff", borderRadius: 999, padding: "6px 26px", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 38, fontWeight: 700 }}>{label}</span>
          {frame >= subAt && <span style={{ fontSize: 24, fontWeight: 600, opacity: 0.92, display: "inline-block", transform: `scale(${spring({ frame: frame - subAt, fps, config: { damping: 10 } })})` }}>· {sub}</span>}
        </div>
        {badge && frame >= badgeAt && (
          <div style={{ position: "absolute", top: 78, left: "50%", transform: `translateX(-50%) scale(${spring({ frame: frame - badgeAt, fps, config: { damping: 9 } })})`, background: "#fff", border: `3px solid ${c}`, color: c, borderRadius: 999, padding: "2px 16px", fontSize: 20, fontWeight: 700, whiteSpace: "nowrap" }}>
            {badge}
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: badge ? 136 : 118, display: "flex", justifyContent: "center", gap: 30 }}>
          {words.map((w, i) => (
            <div key={w} style={{ opacity: frame >= wordAt[i] ? 1 : 0.34 }}>
              <CkWordChip word={w} blanked={w.replace(marker, "_".repeat(marker.length))} colorHex={colorHex} enterFrame={enterAt + 6 + i * 5} litFrame={wordAt[i]} size={120} phase={i} />
            </div>
          ))}
        </div>
        {/* the curtain — the act that hasn't started yet is covered, never absent */}
        {curtainUntil > 0 && frame < curtainUntil + 26 && (() => {
          const open = interpolate(frame, [curtainUntil, curtainUntil + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <>
              {[0, 1].map((h) => (
                <div key={h} style={{ position: "absolute", top: 0, bottom: 0, width: "50.5%", ...(h ? { right: 0 } : { left: 0 }), background: `repeating-linear-gradient(90deg, ${c} 0 22px, #A31545 22px 44px)`, transform: `translateX(${(h ? 1 : -1) * open * 102}%)` }} />
              ))}
              {open < 0.12 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff" }}>
                  <span style={{ fontSize: 76, fontWeight: 700 }}>?</span>
                  <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2 }}>NEXT ACT</span>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </>
  );
};

const PTestRow: React.FC<{ spelled: string; result: string; ok: boolean; at: number; verdictAt: number; note: string; color: string }> = ({ spelled, result, ok, at, verdictAt, note, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const inn = spring({ frame: frame - at, fps, config: { damping: 13 } });
  const v = spring({ frame: frame - verdictAt, fps, config: { damping: 9 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: inn, transform: `translateY(${(1 - inn) * 16}px)`, fontFamily: font.family }}>
      <span style={{ fontSize: 46, fontWeight: 700, color: palette.inkSoft, minWidth: 190, textAlign: "right" }}>{spelled}</span>
      <span style={{ fontSize: 34, color: palette.inkSoft }}>→</span>
      <span style={{ fontSize: 62, fontWeight: 700, color: hex(color), minWidth: 190 }}>{result}</span>
      {frame >= verdictAt && (
        <span style={{ display: "flex", alignItems: "center", gap: 10, transform: `scale(${0.7 + 0.3 * v})` }}>
          <span style={{ fontSize: 48 }}>{ok ? "✅" : "❌"}</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: ok ? "#2E7D32" : "#C62828", whiteSpace: "nowrap" }}>{note}</span>
        </span>
      )}
    </div>
  );
};

export const POuTwoSounds: React.FC<{ data: PhonicsComparison; beat: Beat; cues: TwoSoundCues }> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const owC = data.teams[1].colorHex;

  // ── D · WRITE vs READ ──
  if (frame >= cues.writeRead) {
    const panels = [
      { k: "WRITE", icon: "✏️", line: "use the rule", sub: "ou inside · ow at the end", c: data.teams[0].colorHex, at: cues.writeRule, focus: frame < cues.readFocus },
      { k: "READ", icon: "👀", line: "test the sound", sub: "try long O, then ow", c: owC, at: cues.readFocus, focus: frame >= cues.readFocus },
    ];
    return (
      <>
        <PHead size={46}>Two different jobs 💡</PHead>
        <div style={{ position: "absolute", top: 430, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: font.family }}>
          {panels.map((p, i) => {
            const c = hex(p.c);
            const e = spring({ frame: frame - cues.writeRead - i * 12, fps, config: { damping: 12 } });
            return (
              <div key={p.k} style={{ position: "relative", width: 860, background: "#fff", border: `8px solid ${p.focus ? c : tint(p.c, 0.5)}`, borderRadius: 38, padding: "26px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${(0.88 + 0.12 * e) * (p.focus ? 1 + 0.02 * Math.sin((frame / fps) * 5) : 0.97)})`, boxShadow: p.focus ? `0 20px 48px ${c}66` : "0 12px 30px rgba(20,14,40,0.3)" }}>
                {i === 0 && frame >= cues.writeStamp && (
                  <div style={{ position: "absolute", top: -22, right: -12, background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "5px 18px", fontSize: 24, fontWeight: 700, whiteSpace: "nowrap", transform: `rotate(-8deg) scale(${spring({ frame: frame - cues.writeStamp, fps, config: { damping: 8 } })})` }}>
                    ✓ still works!
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: p.focus ? 1 : 0.5 }}>
                  <span style={{ fontSize: 54 }}>{p.icon}</span>
                  <span style={{ fontSize: 56, fontWeight: 700, color: c, letterSpacing: 2 }}>{p.k}</span>
                  <span style={{ fontSize: 36, fontWeight: 700, color: palette.ink }}>{p.line}</span>
                  {frame >= p.at && <span style={{ fontSize: 27, fontWeight: 600, color: palette.inkSoft, display: "inline-block", transform: `scale(${spring({ frame: frame - p.at, fps, config: { damping: 11 } })})` }}>{p.sub}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // ── C · the test, worked twice ──
  if (frame >= cues.test1) {
    return (
      <>
        <PHead size={44}>{frame >= cues.trick ? "Keep the one that's a real word ✅" : "So… test it! 🔍"}</PHead>
        <div style={{ position: "absolute", top: 500, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 38, padding: "34px 34px", boxShadow: "0 20px 50px rgba(20,14,40,0.42)", display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
            <PTestRow spelled="sn + ow" result="snow" ok at={cues.test1Word} verdictAt={cues.test1Ok} note="a real word!" color={LONG_O} />
            <PTestRow spelled="c + ow" result="coe" ok={false} at={cues.test2Word} verdictAt={cues.test2Bad} note="not a word" color={LONG_O} />
            <PTestRow spelled="c + ow" result="cow" ok at={cues.test2Ok} verdictAt={cues.test2Ok + 8} note="that's the one!" color={owC} />
          </div>
        </div>
      </>
    );
  }

  // ── B · there is no rule ──
  if (frame >= cues.noRule) {
    const owBig = hex(owC);
    const showShrug = frame >= cues.letters;
    const stamp = spring({ frame: frame - cues.noRuleStamp, fps, config: { damping: 9 } });
    const testS = spring({ frame: frame - cues.testIt, fps, config: { damping: 8 } });
    const ask = Math.floor((frame - cues.noRule) / 20) % 2;
    const guess = (label: string, col: string, i: number) => {
      const on = !showShrug && ask === i;
      const c = hex(col);
      return (
        <div style={{ background: "#fff", border: `6px solid ${c}`, color: c, borderRadius: 28, padding: "12px 28px", fontSize: 40, fontWeight: 700, whiteSpace: "nowrap", opacity: showShrug ? 0.4 : 1, transform: `scale(${on ? 1.09 : 1}) translateY(${bob(frame, fps, on ? 8 : 4, 2.4, i)}px)`, boxShadow: on ? `0 14px 34px ${c}66` : "0 8px 20px rgba(20,14,40,0.3)" }}>
          {label} ?
        </div>
      );
    };
    return (
      <>
        <PHead size={44}>Which sound do you say? 🤔</PHead>
        <div style={{ position: "absolute", top: 450, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontFamily: font.family }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 150, fontWeight: 700, color: owBig, transform: `scale(${pulse(frame - cues.noRule, fps, 0.05, 1.1)})`, textShadow: `0 14px 34px ${owBig}66` }}>ow</span>
            {showShrug && <span style={{ position: "absolute", top: -96, left: "50%", marginLeft: -38, fontSize: 72, transform: `scale(${spring({ frame: frame - cues.letters, fps, config: { damping: 9 } })})` }}>🤷</span>}
          </div>
          <div style={{ display: "flex", gap: 26 }}>
            {guess("long O", LONG_O, 0)}
            {guess("ow", owC, 1)}
          </div>
          {showShrug && (
            <div style={{ background: "#FFFFFFEE", borderRadius: 999, padding: "10px 30px", fontSize: 36, fontWeight: 700, color: palette.ink, transform: `scale(${0.86 + 0.14 * spring({ frame: frame - cues.letters, fps, config: { damping: 12 } })})` }}>
              the letters don't tell you
            </div>
          )}
          {frame >= cues.noRuleStamp && (
            <div style={{ background: "#fff", border: "8px dashed #C2185B", borderRadius: 34, padding: "16px 40px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 20px 48px rgba(20,14,40,0.42)", transform: `scale(${0.7 + 0.3 * stamp}) rotate(${(1 - stamp) * -7}deg)` }}>
              <span style={{ fontSize: 44 }}>🔄</span>
              <span style={{ fontSize: 48, fontWeight: 700, color: "#C2185B", whiteSpace: "nowrap" }}>There's no rule here</span>
            </div>
          )}
          {frame >= cues.testIt && (
            <div style={{ background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "10px 36px", fontSize: 40, fontWeight: 700, whiteSpace: "nowrap", transform: `scale(${0.6 + 0.4 * testS}) translateY(${bob(frame, fps, 7, 3)}px)` }}>
              🔍 You have to TEST it!
            </div>
          )}
        </div>
      </>
    );
  }

  // ── A · the two rings, stacked ──
  const sameL = frame >= cues.sameLetters;
  const leftFocus = frame < cues.owSound;
  return (
    <>
      <PHead size={44}>
        {sameL ? (
          <>Same two letters — <span style={{ color: hex(owC) }}>TWO</span> sounds!</>
        ) : (
          <><span style={{ color: hex(owC) }}>ow</span> has two jobs 🌳</>
        )}
      </PHead>
      <PRing label="ow" sub="long O" colorHex={LONG_O} marker="ow" words={["snow", "grow", "show"]} top={430} enterAt={0} wordAt={cues.longWords} dim={!sameL && !leftFocus} badge="as seen in oa ⚡ ow" badgeAt={cues.callback} subAt={cues.longLabel} />
      <PRing label="ow" sub="ow!" colorHex={owC} marker="ow" words={["cow", "brown", "owl"]} top={950} enterAt={8} wordAt={cues.owWords} dim={false} subAt={cues.owSound} curtainUntil={cues.owSound} />
    </>
  );
};

// ── au/aw · aw only ever says one sound ─────────────────────────────────────
export const PAwOneSound: React.FC<{ data: PhonicsComparison; beat: Beat; cues: OneSoundCues }> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const awC = hex(data.teams[1].colorHex);
  const OW = "F57F17";
  const showAw = frame >= cues.notLike;
  const awIn = spring({ frame: frame - cues.notLike, fps, config: { damping: 12 } });
  const trustS = spring({ frame: frame - cues.trust, fps, config: { damping: 9 } });
  const beatPulse = frame >= cues.always ? 1 + 0.06 * Math.sin((frame / fps) * 7) : 1;

  const card = (text: string, c: string, dim: boolean, scale = 1) => (
    <div style={{ background: "#fff", border: `9px solid ${c}`, borderRadius: 34, padding: "12px 40px", fontSize: 92, fontWeight: 700, color: c, fontFamily: font.family, lineHeight: 1, opacity: dim ? 0.55 : 1, transform: `scale(${scale}) translateY(${bob(frame, fps, 6, 2.4)}px)`, boxShadow: dim ? "0 10px 26px rgba(20,14,40,0.3)" : `0 18px 42px ${c}55` }}>
      {text}
    </div>
  );
  const branch = (label: string, col: string, at: number) => {
    const s = spring({ frame: frame - at, fps, config: { damping: 13 } });
    const c = hex(col);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: s, transform: `translateX(${(1 - s) * -20}px)` }}>
        <svg width={54} height={30}><path d="M0 15 h 40" fill="none" stroke="#B9A9C8" strokeWidth={6} strokeLinecap="round" /></svg>
        <div style={{ background: "#fff", border: `5px solid ${c}`, color: c, borderRadius: 999, padding: "5px 20px", fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</div>
      </div>
    );
  };

  return (
    <>
      <PHead size={44}>
        {frame >= cues.oneSound ? (<><span style={{ color: awC }}>aw</span> always says ONE sound 🚀</>) : (<>Good news! 🚀</>)}
      </PHead>
      <div style={{ position: "absolute", top: 460, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: font.family }}>
        {/* ow forks in two */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {card("ow", hex(OW), showAw)}
            <div style={{ background: "#FFFFFFE8", border: `3px solid ${hex(OW)}`, color: hex(OW), borderRadius: 999, padding: "2px 14px", fontSize: 19, fontWeight: 700, whiteSpace: "nowrap" }}>as seen in ou ⚡ ow</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {branch("long O", "00897B", cues.fork)}
            {branch("ow!", OW, cues.fork + 10)}
          </div>
        </div>

        {/* aw doesn't fork at all */}
        {showAw && (
          <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: awIn, transform: `translateY(${(1 - awIn) * 26}px)` }}>
            {card("aw", awC, false, beatPulse)}
            {frame >= cues.oneSound && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, transform: `scale(${spring({ frame: frame - cues.oneSound, fps, config: { damping: 12 } })})` }}>
                <svg width={54} height={30}><path d="M0 15 h 40" fill="none" stroke="#B9A9C8" strokeWidth={6} strokeLinecap="round" /></svg>
                <div style={{ background: "#fff", border: `5px solid ${awC}`, color: awC, borderRadius: 999, padding: "5px 22px", fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }}>aw — that's it</div>
              </div>
            )}
          </div>
        )}

        {frame >= cues.trust && (
          <div style={{ background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "12px 40px", fontSize: 38, fontWeight: 700, whiteSpace: "nowrap", transform: `scale(${0.6 + 0.4 * trustS}) translateY(${bob(frame, fps, 7, 3)}px)`, boxShadow: "0 16px 40px rgba(46,125,50,0.5)" }}>
            ✅ You can trust it every time
          </div>
        )}
      </div>
    </>
  );
};
