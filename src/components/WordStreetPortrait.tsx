import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat, sec } from "../lib/timing";
import { LetterFace } from "./LetterFace";
import { CkWordChip } from "./CkWordChip";
import { Mascot } from "./Mascot";
import { hex, palette, tint } from "../data/tokens";
import { bob, pulse } from "../lib/motion";

// PORTRAIT Word Street — the SAME set and the SAME script-progress machine as the
// 16:9 `WordStreet.tsx`, re-laid out for 1080×1920. Three lanes side by side don't
// fit a tall frame, so each zone becomes a full-width ROW stacked vertically:
//
//   [ sign: emoji · marker · hint ] [ character ] [ content slot ]
//
// LAYOUT LAW (same idea as the landscape cut — zones, nothing crosses):
//   y    0 …  330   HEADLINE BAND  — beat overlays only
//   y  350 … 1500   STAGE          — these three rows
//   y 1520 … 1920   CAPTION        — Captions.tsx only
//
// Content states are identical to the landscape cut so the two videos teach the
// same beats in the same order:
//   0.0 →12.5  "/k/" sound card (pops as its letter is named, rings on "same /k/")
//  12.5 →26.8  the intro word (cat · kite · duck) as each is spoken
//  26.8 →33.0  a where-in-the-word position strip
//  33.0 →85.4  active row: trigger letters → its example words.
//              INACTIVE rows keep a dimmed word instead of going blank.

interface Ex {
  word: string;
  blanked: string;
}
const INTRO: Ex[] = [
  { word: "cat", blanked: "_at" },
  { word: "kite", blanked: "_ite" },
  { word: "duck", blanked: "du__" },
];
const RULE: { beatId: string; words: Ex[] }[] = [
  { beatId: "ruleC", words: [{ word: "cat", blanked: "_at" }, { word: "cot", blanked: "_ot" }, { word: "cup", blanked: "_up" }] },
  { beatId: "ruleK", words: [{ word: "key", blanked: "_ey" }, { word: "kit", blanked: "_it" }, { word: "king", blanked: "_ing" }] },
  { beatId: "ruleCK", words: [{ word: "duck", blanked: "du__" }, { word: "rock", blanked: "ro__" }, { word: "kick", blanked: "ki__" }] },
];
const TRIGGERS = [["a", "o", "u"], ["e", "i"], ["a", "e", "i", "o", "u"]];
const WHERE_SLOT = [0, 0, 2];

// ── zone geometry (1080×1920) ────────────────────────────────────────────────
export const P_BAND_H = 330;
const ROW_TOP = 340;
const ROW_W = 900; // 90px safe margin each side of a 1080-wide frame
const ROW_H = 375;
const ROW_GAP = 28;
const ROW_LEFT = (1080 - ROW_W) / 2;
const SIGN_W = 214;
const FACE_SIZE = 140;
// slot = 900 - 40 padding - 214 sign - 32 gaps - 140 face = 474.
// 3 × 82 × 1.8 + 2 × 12 = 467. Fits.
const CHIP = 78;

const SoundCard: React.FC<{ colorHex: string; enterFrame: number; green: boolean; ringAt: number[] }> = ({ colorHex, enterFrame, green, ringAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = green ? "#2E7D32" : hex(colorHex);
  const s = spring({ frame: frame - enterFrame, fps, config: { damping: 11 } });
  const ring = ringAt.reduce((acc, at) => (frame < at || frame > at + 26 ? acc : Math.max(acc, Math.sin(((frame - at) / 26) * Math.PI))), 0);
  return (
    <div style={{ position: "relative", transform: `scale(${s * (1 + ring * 0.12)}) translateY(${bob(frame, fps, 4, 2.4)}px)` }}>
      {ring > 0.02 && <div style={{ position: "absolute", inset: -16 - ring * 32, borderRadius: 999, border: `5px solid ${c}`, opacity: (1 - ring) * 0.7 }} />}
      <div style={{ background: palette.card, border: `6px solid ${c}`, borderRadius: 30, padding: "18px 44px", fontSize: 76, fontWeight: 700, color: c, lineHeight: 1.1, boxShadow: `0 12px 28px ${c}44` }}>/k/</div>
    </div>
  );
};

const WhereStrip: React.FC<{ colorHex: string; slot: number; marker: string; enterFrame: number }> = ({ colorHex, slot, marker, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(colorHex);
  const s = spring({ frame: frame - enterFrame, fps, config: { damping: 11 } });
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", transform: `scale(${s})` }}>
      {[0, 1, 2].map((i) => {
        const on = i === slot;
        return (
          <div
            key={i}
            style={{
              width: on ? 96 : 62,
              height: 78,
              borderRadius: 18,
              border: `4px ${on ? "solid" : "dashed"} ${on ? c : palette.blank}`,
              background: on ? c : "#ffffffaa",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 700,
              transform: on ? `scale(${pulse(frame, fps, 0.05, 1.4)}) translateY(${bob(frame, fps, 4, 2.2)}px)` : "none",
              boxShadow: on ? `0 10px 22px ${c}55` : "none",
            }}
          >
            {on ? marker : ""}
          </div>
        );
      })}
    </div>
  );
};

export const WordStreetPortrait: React.FC<{ data: PhonicsComparison; beats: Beat[] }> = ({ data, beats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const B: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
  const f = frame;

  const hideAt = B.seeIt?.from ?? Infinity;
  if (f >= hideAt + 12) return null;
  const streetOpacity = interpolate(f, [hideAt - 12, hideAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // characters present at FRAME 0 (cover frame); being named is a highlight, not an entrance
  const namedAt = [sec(2.0, fps), sec(2.66, fps), sec(3.22, fps)];
  const kSpokenAt = [sec(5.58, fps), sec(6.0, fps)];
  const oneSoundAt = sec(8.9, fps);
  const seeHowAt = sec(10.14, fps);

  const puzzleFrom = B.puzzle?.from ?? Infinity;
  const ruleCKFrom = B.ruleCK?.from ?? Infinity;
  const active = f >= ruleCKFrom ? 2 : f >= (B.ruleK?.from ?? Infinity) ? 1 : f >= (B.ruleC?.from ?? Infinity) ? 0 : -1;

  const softStart = sec(48.84, fps);
  const kDash = sec(54.92, fps);
  const morph = interpolate(f, [softStart, softStart + 70, kDash, kDash + 55], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let kx = 0;
  let kOp = 1;
  let kPop = 1;
  if (f >= softStart && f < kDash) {
    const t = interpolate(f, [softStart, softStart + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    kOp = 1 - 0.82 * t;
    kx = 60 * t;
  }
  if (f >= kDash) {
    kx = interpolate(f, [kDash, kDash + 18], [-200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    kOp = interpolate(f, [kDash, kDash + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    kPop = 1 + 0.28 * spring({ frame: f - kDash, fps, config: { damping: 9 } }) * (f < kDash + 26 ? 1 : 0);
  }

  const triggerBase = [sec(37.1, fps), sec(58.4, fps), sec(72.0, fps)];

  type Content =
    | { kind: "words"; items: (Ex & { at: number })[] }
    | { kind: "triggers" }
    | { kind: "ghost"; item: Ex }
    | { kind: "where" }
    | { kind: "intro"; item: Ex & { at: number } }
    | { kind: "sound" }
    | null;

  const contentFor = (zone: number): Content => {
    if (active >= 0) {
      if (zone !== active) return { kind: "ghost", item: INTRO[zone] };
      const rb = B[RULE[zone].beatId];
      const items = RULE[zone].words.map((w) => ({ ...w, at: rb.from + rb.word(w.word) })).filter((x) => x.at >= rb.from && f >= x.at);
      return items.length > 0 ? { kind: "words", items } : { kind: "triggers" };
    }
    if (f >= puzzleFrom) return { kind: "where" };
    const same = B.same;
    const introAt = same ? same.from + same.word(INTRO[zone].word) : -1;
    if (introAt >= 0 && f >= introAt) return { kind: "intro", item: { ...INTRO[zone], at: introAt } };
    return f >= namedAt[zone] ? { kind: "sound" } : null;
  };

  return (
    <AbsoluteFill style={{ opacity: streetOpacity }}>
      {data.teams.map((team, i) => {
        const c = hex(team.colorHex);
        const isActive = active === i || active === -1;
        const cBright = i === 0 && f >= softStart - 10 && f < kDash + 30;
        const dim = active >= 0 && active !== i && !cBright ? 0.5 : 1;
        const namePop = f >= namedAt[i] && f < namedAt[i] + 26 ? Math.sin(((f - namedAt[i]) / 26) * Math.PI) : 0;
        const seeBounce = (() => {
          const at = seeHowAt + i * 7;
          return f >= at && f < at + 22 ? Math.sin(((f - at) / 22) * Math.PI) : 0;
        })();
        const rowScale = (active === i ? 1.02 : 1) * (1 + namePop * 0.02);
        const content = contentFor(i);
        const look = i === 0 ? "r" : i === 2 ? "l" : "c";
        const isC = i === 0;
        const isK = i === 1;
        const leanX = isC ? morph * 60 : 0;
        const tCount = TRIGGERS[i].length;
        const tSize = tCount >= 5 ? 68 : 84;

        return (
          <div
            key={team.marker}
            style={{
              position: "absolute",
              left: ROW_LEFT,
              top: ROW_TOP + i * (ROW_H + ROW_GAP),
              width: ROW_W,
              height: ROW_H,
              opacity: dim,
              transform: `scale(${rowScale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: tint(team.colorHex, 0.9),
                border: `4px solid ${tint(team.colorHex, namePop > 0.05 ? 0.2 : 0.5)}`,
                borderRadius: 44,
                boxShadow: isActive || namePop > 0.05 ? `0 18px 50px ${c}${namePop > 0.05 ? "77" : "44"}` : "none",
              }}
            />

            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, boxSizing: "border-box" }}>
              {/* street sign */}
              <div
                style={{
                  width: SIGN_W,
                  flexShrink: 0,
                  background: c,
                  borderRadius: 30,
                  padding: "16px 10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  boxShadow: `0 12px 28px ${c}55`,
                  transform: `translateY(${bob(frame, fps, 4, 2.8, i) - seeBounce * 12}px) scale(${1 + seeBounce * 0.05})`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 44 }}>{team.zoneEmoji}</span>
                  <span style={{ fontSize: 70, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{team.marker}</span>
                </div>
                <span style={{ fontSize: 26, fontWeight: 600, color: "#ffffffdd", textAlign: "center" }}>{team.zoneHint}</span>
              </div>

              {/* character */}
              <div
                style={{
                  width: FACE_SIZE,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                  transform: `translateX(${leanX + (isK ? kx : 0)}px) scale(${(1 + namePop * 0.14) * (isK ? kPop : 1)})`,
                  opacity: isK ? kOp : 1,
                }}
              >
                <LetterFace text={team.marker} colorHex={team.colorHex} size={FACE_SIZE} phase={i} morph={isC ? morph : 0} look={look} />
              </div>

              {/* content slot — always occupied while the street is up */}
              <div style={{ flex: 1, display: "flex", gap: 24, alignItems: "center", justifyContent: "center" }}>
                {content?.kind === "sound" && (
                  <SoundCard colorHex={f >= oneSoundAt ? "2E7D32" : team.colorHex} enterFrame={namedAt[i]} green={f >= oneSoundAt} ringAt={[...kSpokenAt, oneSoundAt]} />
                )}
                {content?.kind === "where" && <WhereStrip colorHex={team.colorHex} slot={WHERE_SLOT[i]} marker={team.marker} enterFrame={puzzleFrom + i * 6} />}
                {content?.kind === "ghost" && (
                  <div style={{ opacity: 0.55 }}>
                    <CkWordChip word={content.item.word} blanked={content.item.blanked} colorHex={team.colorHex} enterFrame={-999} size={CHIP} phase={i} />
                  </div>
                )}
                {content?.kind === "words" &&
                  content.items.map((ex) => (
                    <CkWordChip key={ex.word} word={ex.word} blanked={ex.blanked} colorHex={team.colorHex} enterFrame={ex.at} size={CHIP} markVowel={i === 2 && f >= ruleCKFrom} />
                  ))}
                {content?.kind === "intro" && (
                  <CkWordChip key={content.item.word} word={content.item.word} blanked={content.item.blanked} colorHex={team.colorHex} enterFrame={content.item.at} size={CHIP} />
                )}
                {content?.kind === "triggers" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    {TRIGGERS[i].map((v, k) => {
                      const at = triggerBase[i] + k * 8;
                      if (f < at) return null;
                      const s = spring({ frame: f - at, fps, config: { damping: 11 } });
                      return (
                        <div
                          key={v}
                          style={{
                            transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2.2, k)}px)`,
                            background: "#fff",
                            color: c,
                            border: `4px solid ${c}`,
                            borderRadius: 16,
                            width: tSize,
                            height: tSize,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: tSize * 0.62,
                            fontWeight: 700,
                            boxShadow: `0 8px 20px ${c}44`,
                          }}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ~90px social safe margin on the sides. At left:18 the mascot's raised arm was
          clipped by the frame edge and sat inside the platform's overlay zone. */}
      <div style={{ position: "absolute", left: 96, top: ROW_TOP - 182 }}>
        <Mascot size={150} />
      </div>
    </AbsoluteFill>
  );
};
