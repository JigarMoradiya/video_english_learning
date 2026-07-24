import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat, sec } from "../lib/timing";
import { LetterFace } from "./LetterFace";
import { CkWordChip } from "./CkWordChip";
import { Mascot } from "./Mascot";
import { hex, palette, tint } from "../data/tokens";
import { bob } from "../lib/motion";

// The Word Street set for the TEACHING half (hook → rule-ck): three sign-post zones
// (c · k · ck) with the character-letters. Behaviour:
//  • Before the rules ("Listen: cat/kite/duck") each card shows its ONE intro word.
//  • When a rule starts, the intro words CLEAR — only the ACTIVE card shows anything:
//    first its trigger letters (a/o/u · e/i · short vowels) during the spoken
//    explanation, then its example words accumulating.
//  • The set fades out at "Let's try" so the later beats get clean screens.

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
// trigger letters shown during each rule's spoken explanation (before its examples)
const TRIGGERS = [["a", "o", "u"], ["e", "i"], ["a", "e", "i", "o", "u"]];

export const WordStreet: React.FC<{ data: PhonicsComparison; beats: Beat[] }> = ({ data, beats }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const B: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
  const f = frame;

  const hideAt = B.seeIt?.from ?? Infinity;
  if (f >= hideAt + 12) return null; // fully gone for try / quiz / remember / wrap
  const streetOpacity = interpolate(f, [hideAt - 12, hideAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const introIn = interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" }); // set fades in at the very start
  // each character pops in as its letter is named in the hook ("c" 2.0s · "k" 2.66s · "ck" 3.22s)
  const charEnterAt = [sec(2.0, fps), sec(2.66, fps), sec(3.22, fps)];

  const GAP = 46;
  const zw = (width - 4 * GAP) / 3;
  const panelTop = 205;
  const panelH = 630;
  const cxOf = (i: number) => GAP + i * (zw + GAP) + zw / 2;

  const ruleCKFrom = B.ruleCK?.from ?? Infinity;
  const active = f >= ruleCKFrom ? 2 : f >= (B.ruleK?.from ?? Infinity) ? 1 : f >= (B.ruleC?.from ?? Infinity) ? 0 : -1;

  // soft-c snake morph + k's dash-in
  const softStart = sec(48.84, fps);
  const kDash = sec(54.92, fps);
  const morph = interpolate(f, [softStart, softStart + 70, kDash, kDash + 55], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let kx = 0;
  let kOp = 1;
  let kPop = 1;
  if (f >= softStart && f < kDash) {
    const t = interpolate(f, [softStart, softStart + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    kOp = 1 - 0.82 * t;
    kx = 70 * t;
  }
  if (f >= kDash) {
    kx = interpolate(f, [kDash, kDash + 18], [220, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    kOp = interpolate(f, [kDash, kDash + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    kPop = 1 + 0.28 * spring({ frame: f - kDash, fps, config: { damping: 9 } }) * (f < kDash + 26 ? 1 : 0);
  }

  // when the trigger letters pop in for each zone (≈ when the vowels are spoken)
  const triggerBase = [sec(37.1, fps), sec(58.4, fps), sec(72.0, fps)];

  type Content =
    | { kind: "words"; items: (Ex & { at: number })[] }
    | { kind: "triggers" }
    | { kind: "intro"; item: Ex & { at: number } }
    | null;
  const contentFor = (zone: number): Content => {
    if (active >= 0) {
      if (zone !== active) return null; // only the active card shows anything
      const rb = B[RULE[zone].beatId];
      const items = RULE[zone].words.map((w) => ({ ...w, at: rb.from + rb.word(w.word) })).filter((x) => x.at >= rb.from && f >= x.at);
      return items.length > 0 ? { kind: "words", items } : { kind: "triggers" };
    }
    const same = B.same;
    const introAt = same ? same.from + same.word(INTRO[zone].word) : -1;
    return introAt >= 0 && f >= introAt ? { kind: "intro", item: { ...INTRO[zone], at: introAt } } : null;
  };

  return (
    <AbsoluteFill style={{ opacity: streetOpacity * introIn }}>
      {data.teams.map((team, i) => {
        const c = hex(team.colorHex);
        const cx = cxOf(i);
        const isActive = active === i || active === -1;
        // the c card stays bright while it is the soft-c "snake" star, even though k is active
        const cBright = i === 0 && f >= softStart - 10 && f < kDash + 30;
        const dim = active >= 0 && active !== i && !cBright ? 0.5 : 1;
        const panelScale = active === i ? 1.03 : 1;
        const content = contentFor(i);
        const look = i === 0 ? "r" : i === 2 ? "l" : "c";
        const isC = i === 0;
        const isK = i === 1;
        const leanX = isC ? morph * 120 : 0;
        const tCount = TRIGGERS[i].length;
        const tSize = tCount >= 5 ? 78 : 96;

        return (
          <div
            key={team.marker}
            style={{ position: "absolute", left: cx - zw / 2, top: panelTop, width: zw, height: panelH, opacity: dim, transform: `scale(${panelScale})`, transformOrigin: "center bottom" }}
          >
            {/* zone panel */}
            <div style={{ position: "absolute", inset: 0, background: tint(team.colorHex, 0.9), border: `4px solid ${tint(team.colorHex, 0.5)}`, borderRadius: 40, boxShadow: isActive ? `0 20px 60px ${c}44` : "none" }} />

            {/* street sign */}
            <div
              style={{
                position: "absolute",
                top: 26,
                left: "50%",
                transform: `translateX(-50%) translateY(${bob(frame, fps, 4, 2.8, i)}px)`,
                background: c,
                borderRadius: 28,
                padding: "16px 34px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                boxShadow: `0 12px 30px ${c}55`,
                minWidth: zw * 0.62,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 46 }}>{team.zoneEmoji}</span>
                <span style={{ fontSize: 72, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{team.marker}</span>
              </div>
              <span style={{ fontSize: 30, fontWeight: 600, color: "#ffffffdd" }}>{team.zoneHint}</span>
            </div>

            {/* character */}
            <div
              style={{
                position: "absolute",
                top: 205,
                left: "50%",
                transform: `translateX(calc(-50% + ${leanX + (isK ? kx : 0)}px)) scale(${spring({ frame: f - charEnterAt[i], fps, config: { damping: 11 } }) * (isK ? kPop : 1)})`,
                opacity: isK ? kOp : 1,
              }}
            >
              <LetterFace text={team.marker} colorHex={team.colorHex} size={168} phase={i} morph={isC ? morph : 0} look={look} />
            </div>

            {/* content area — intro word · trigger letters · accumulating example words */}
            <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 16, alignItems: "flex-end" }}>
              {content?.kind === "words" &&
                content.items.map((ex) => (
                  <CkWordChip key={ex.word} word={ex.word} blanked={ex.blanked} colorHex={team.colorHex} enterFrame={ex.at} size={120} markVowel={i === 2 && f >= ruleCKFrom} />
                ))}
              {content?.kind === "intro" && (
                <CkWordChip key={content.item.word} word={content.item.word} blanked={content.item.blanked} colorHex={team.colorHex} enterFrame={content.item.at} size={120} />
              )}
              {content?.kind === "triggers" && (
                <div style={{ display: "flex", gap: 14 }}>
                  {TRIGGERS[i].map((v, k) => {
                    const at = triggerBase[i] + k * 8;
                    if (f < at) return null;
                    const s = spring({ frame: f - at, fps, config: { damping: 11 } });
                    return (
                      <div
                        key={v}
                        style={{
                          transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.2, k)}px)`,
                          background: "#fff",
                          color: c,
                          border: `5px solid ${c}`,
                          borderRadius: 20,
                          width: tSize,
                          height: tSize,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: tSize * 0.62,
                          fontWeight: 700,
                          boxShadow: `0 10px 24px ${c}44`,
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
        );
      })}

      {/* mascot on the curb, far left */}
      <div style={{ position: "absolute", left: 24, bottom: 24 }}>
        <Mascot size={170} />
      </div>
    </AbsoluteFill>
  );
};
