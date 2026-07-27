import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat, sec } from "../lib/timing";
import { LetterFace } from "./LetterFace";
import { CkWordChip } from "./CkWordChip";
import { Mascot } from "./Mascot";
import { hex, palette, tint } from "../data/tokens";
import { bob, pulse } from "../lib/motion";

// The Word Street set for the TEACHING half (hook → rule-ck): three sign-post zones
// (c · k · ck) with the character-letters.
//
// LAYOUT LAW (see BAND_H / PANEL_TOP below) — the fix for the 16:9 review:
//   y   0 … 290  HEADLINE BAND   — beat overlays only (pills, badges). Nothing else.
//   y 300 … 860  STAGE           — these panels. No overlay may enter.
//   y 880 …1080  CAPTION         — Captions.tsx only.
// The panels used to start at y=205, so every band overlay (the /k/ badge, the
// c-k-ck chip row, the lightbulb) landed ON TOP of the middle zone's street sign.
//
// EVERY PANEL SLOT IS ALWAYS OCCUPIED. A panel is sign + character + a fixed
// content slot; the slot's contents change with the script so the screen never
// sits empty while narration runs:
//   0.0 →12.5  "/k/" sound card (pops as its letter is named, rings on "same /k/ sound")
//  12.5 →26.8  the intro word (cat · kite · duck) as each is spoken
//  26.8 →33.0  a where-in-the-word position strip ("It depends on WHERE…")
//  33.0 →85.4  active zone: trigger letters → its example words.
//              INACTIVE zones keep a dimmed word instead of going blank.

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
// where in the word each spelling lives — c/k at the START, ck at the END
const WHERE_SLOT = [0, 0, 2];

// ── zone geometry ────────────────────────────────────────────────────────────
export const BAND_H = 290; // headline band reserved for beat overlays
const PANEL_TOP = 300;
const PANEL_H = 560; // 300 → 860
const SIGN_TOP = 22;
const FACE_TOP = 168;
const FACE_SIZE = 148;
const SLOT_H = 202; // fixed content slot, bottom-anchored inside the panel
const SLOT_BOTTOM = 30;
// Card width ≈ size × 1.8 (h-padding + border + a 4-char word at 0.5em).
// Panel slot is 509px inside its padding: 3 × 88 × 1.8 + 2 × 16 = 507. Fits.
const CHIP = 84;

// the shared "/k/" sound card that every zone shows during the hook
const SoundCard: React.FC<{ colorHex: string; enterFrame: number; green: boolean; ringAt: number[] }> = ({
  colorHex,
  enterFrame,
  green,
  ringAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = green ? "#2E7D32" : hex(colorHex);
  const s = spring({ frame: frame - enterFrame, fps, config: { damping: 11 } });
  // a ring pulse each time the /k/ sound itself is spoken
  const ring = ringAt.reduce((acc, at) => {
    if (frame < at || frame > at + 26) return acc;
    return Math.max(acc, Math.sin(((frame - at) / 26) * Math.PI));
  }, 0);
  return (
    <div style={{ position: "relative", transform: `scale(${s * (1 + ring * 0.12)}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>
      {ring > 0.02 && (
        <div
          style={{
            position: "absolute",
            inset: -20 - ring * 40,
            borderRadius: 999,
            border: `6px solid ${c}`,
            opacity: (1 - ring) * 0.7,
          }}
        />
      )}
      <div
        style={{
          background: palette.card,
          border: `7px solid ${c}`,
          borderRadius: 34,
          padding: "20px 46px",
          fontSize: 78,
          fontWeight: 700,
          color: c,
          lineHeight: 1.1,
          boxShadow: `0 14px 34px ${c}44`,
        }}
      >
        /k/
      </div>
    </div>
  );
};

// "where in the word" — three slots, the zone's letter sitting in its real position
const WhereStrip: React.FC<{ colorHex: string; slot: number; marker: string; enterFrame: number }> = ({
  colorHex,
  slot,
  marker,
  enterFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(colorHex);
  const s = spring({ frame: frame - enterFrame, fps, config: { damping: 11 } });
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", transform: `scale(${s})` }}>
      {[0, 1, 2].map((i) => {
        const on = i === slot;
        return (
          <div
            key={i}
            style={{
              width: on ? 118 : 78,
              height: 96,
              borderRadius: 22,
              border: `5px ${on ? "solid" : "dashed"} ${on ? c : palette.blank}`,
              background: on ? c : "#ffffffaa",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 700,
              transform: on ? `scale(${pulse(frame, fps, 0.05, 1.4)}) translateY(${bob(frame, fps, 5, 2.2)}px)` : "none",
              boxShadow: on ? `0 12px 28px ${c}55` : "none",
            }}
          >
            {on ? marker : ""}
          </div>
        );
      })}
    </div>
  );
};

export const WordStreet: React.FC<{ data: PhonicsComparison; beats: Beat[] }> = ({ data, beats }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const B: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
  const f = frame;

  const hideAt = B.seeIt?.from ?? Infinity;
  if (f >= hideAt + 12) return null; // fully gone for try / quiz / remember / wrap
  const streetOpacity = interpolate(f, [hideAt - 12, hideAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // The characters are present at FRAME 0 — frame 0 is the upload thumbnail and must
  // be a complete cover. Being "named" (c 2.0 · k 2.66 · ck 3.22) is a HIGHLIGHT pop,
  // not an entrance, and it is what pops the zone's /k/ sound card.
  const namedAt = [sec(2.0, fps), sec(2.66, fps), sec(3.22, fps)];
  const kSpokenAt = [sec(5.58, fps), sec(6.0, fps)]; // "…the same /k/ sound!"
  const oneSoundAt = sec(8.9, fps); // "one sound!" → all three cards go green together
  const seeHowAt = sec(10.14, fps); // "Let's see how!" → signs bounce left→right

  // SAFE_X = 5% title-safe. The panels used a 46px side margin, so the c and ck
  // zones ran into the unsafe edge band on a 1920-wide frame.
  const SAFE_X = Math.round(width * 0.05);
  const GAP = 40; // between panels only — the outer margin is SAFE_X
  const zw = (width - 2 * SAFE_X - 2 * GAP) / 3;
  const cxOf = (i: number) => SAFE_X + i * (zw + GAP) + zw / 2;

  const puzzleFrom = B.puzzle?.from ?? Infinity;
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
    | { kind: "ghost"; item: Ex }
    | { kind: "where" }
    | { kind: "intro"; item: Ex & { at: number } }
    | { kind: "sound" }
    | null;

  const contentFor = (zone: number): Content => {
    if (active >= 0) {
      // an inactive zone keeps a DIMMED word rather than going blank for 15s
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
        const cx = cxOf(i);
        const isActive = active === i || active === -1;
        // the c card stays bright while it is the soft-c "snake" star, even though k is active
        const cBright = i === 0 && f >= softStart - 10 && f < kDash + 30;
        const dim = active >= 0 && active !== i && !cBright ? 0.5 : 1;
        // being named in the hook gives the zone a short highlight lift
        const namePop = f >= namedAt[i] && f < namedAt[i] + 26 ? Math.sin(((f - namedAt[i]) / 26) * Math.PI) : 0;
        // "Let's see how!" — the three signs bounce in order, previewing the lesson
        const seeBounce = (() => {
          const at = seeHowAt + i * 7;
          return f >= at && f < at + 22 ? Math.sin(((f - at) / 22) * Math.PI) : 0;
        })();
        const panelScale = (active === i ? 1.03 : 1) * (1 + namePop * 0.03);
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
            style={{ position: "absolute", left: cx - zw / 2, top: PANEL_TOP, width: zw, height: PANEL_H, opacity: dim, transform: `scale(${panelScale})`, transformOrigin: "center bottom" }}
          >
            {/* zone panel */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: tint(team.colorHex, 0.9),
                border: `4px solid ${tint(team.colorHex, namePop > 0.05 ? 0.2 : 0.5)}`,
                borderRadius: 40,
                boxShadow: isActive || namePop > 0.05 ? `0 20px 60px ${c}${namePop > 0.05 ? "77" : "44"}` : "none",
              }}
            />

            {/* street sign */}
            <div
              style={{
                position: "absolute",
                top: SIGN_TOP,
                left: "50%",
                transform: `translateX(-50%) translateY(${bob(frame, fps, 4, 2.8, i) - seeBounce * 14}px) scale(${1 + seeBounce * 0.06})`,
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

            {/* character — present from frame 0 so the cover frame is complete */}
            <div
              style={{
                position: "absolute",
                top: FACE_TOP,
                left: "50%",
                transform: `translateX(calc(-50% + ${leanX + (isK ? kx : 0)}px)) scale(${(1 + namePop * 0.16) * (isK ? kPop : 1)})`,
                opacity: isK ? kOp : 1,
              }}
            >
              <LetterFace text={team.marker} colorHex={team.colorHex} size={FACE_SIZE} phase={i} morph={isC ? morph : 0} look={look} />
            </div>

            {/* content slot — FIXED height, always occupied while the street is up */}
            <div
              style={{
                position: "absolute",
                bottom: SLOT_BOTTOM,
                left: 0,
                width: "100%",
                height: SLOT_H,
                display: "flex",
                gap: 26,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {content?.kind === "sound" && (
                <SoundCard
                  colorHex={f >= oneSoundAt ? "2E7D32" : team.colorHex}
                  enterFrame={namedAt[i]}
                  green={f >= oneSoundAt}
                  ringAt={[...kSpokenAt, oneSoundAt]}
                />
              )}
              {content?.kind === "where" && (
                <WhereStrip colorHex={team.colorHex} slot={WHERE_SLOT[i]} marker={team.marker} enterFrame={puzzleFrom + i * 6} />
              )}
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

      {/* Mascot lives in the HEADLINE BAND, top-left — same place as the portrait cut.
          On the curb at bottom:96 he clipped the panel's bottom-left corner (panels end
          at y=860); at the old bottom:24 he sat inside the unsafe edge band. The band's
          left region is free because every headline pill is centred. */}
      <div style={{ position: "absolute", left: 96, top: 104 }}>
        <Mascot size={170} />
      </div>
    </AbsoluteFill>
  );
};
