import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Band, Center, Pill } from "../components/LandscapeBeatKit";
import { TilePart, WordTiles } from "../components/WordTiles";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob } from "../lib/motion";

// ── the "letter BEFORE" teaching device ─────────────────────────────────────
// Shared by the two cards whose rule is not about WHERE the sound sits but about what letter
// sits immediately before it: ch/tch (Match Day) and ge/dge (The Word Court). Both ask the
// same question of a word, so both use the same three shapes:
//
//   LetterBeforeCase  a worked word that REBUILDS as each new example is named
//   PlaceCard         the card a case beat opens on, so the naming line has something to show
//   VowelWord         a finished word with its deciding vowel underlined
//
// `depth3d` switches every surface to the extruded-slab look (see slab() in tokens). ch/tch
// leaves it off and renders exactly as it always has.

export type CaseCues = {
  introAt?: number;   // "The first is at the start of a word" / "Here is the rule"
  ruleAt?: number;    // the generic [short vowel] + [tch] diagram
  build: number; done: number; label: number; more: number[]; allAt: number;
};

export const LetterBeforeCase: React.FC<{
  headline: React.ReactNode; base: TilePart[]; endingColor: string;
  focusLabel?: string; focusColor?: string; cues: CaseCues;
  // ge/dge additions: the Word Court's extruded tiles, and a rule diagram whose left
  // card is not always "short vowel"
  depth3d?: boolean; ruleLabel?: string; verdictTop?: number;
  examples: { parts: TilePart[]; emoji: React.ReactNode }[]; allWords?: string[];
  baseEmoji?: React.ReactNode; introNode?: React.ReactNode;
}> = ({ headline, base, endingColor, focusLabel, focusColor, cues, examples, allWords, baseEmoji, introNode, depth3d = false, ruleLabel = "short vowel", verdictTop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = -1;
  for (let i = 0; i < cues.more.length; i++) if (frame >= cues.more[i]) idx = i;
  const showAll = allWords && frame >= cues.allAt;
  const preRule = cues.ruleAt !== undefined && frame >= cues.ruleAt && frame < cues.build;
  const preIntro = cues.introAt !== undefined && frame >= cues.introAt && frame < (cues.ruleAt ?? cues.build);
  const parts = idx < 0 ? base : examples[idx].parts;
  const emoji = idx < 0 ? baseEmoji ?? "" : examples[idx].emoji;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>{headline}</Pill>
      </Band>
      {preIntro || preRule ? (
        <Center top={400}>
          {preRule ? (
            // the rule itself, before any example word — this stretch used to be blank
            <div style={{ display: "flex", alignItems: "center", gap: 26, fontFamily: font.family }}>
              <div style={{ background: "#FFF8E1", border: `8px solid ${hex(focusColor ?? "D81B60")}`, color: hex(focusColor ?? "D81B60"), borderRadius: 30, padding: "20px 40px", fontSize: 58, fontWeight: 700, whiteSpace: "nowrap", transform: `translateY(${bob(frame, fps, 6, 2.4)}px)`, boxShadow: depth3d ? slab(focusColor ?? "D81B60", 16) : undefined }}>
                {ruleLabel}
              </div>
              <span style={{ fontSize: 60, color: palette.inkSoft }}>+</span>
              <div style={{ background: tint(endingColor, 0.88), border: `8px solid ${hex(endingColor)}`, color: hex(endingColor), borderRadius: 30, padding: "20px 46px", fontSize: 72, fontWeight: 700, transform: `translateY(${bob(frame, fps, 6, 2.4, 1)}px)`, boxShadow: depth3d ? slab(endingColor, 18) : undefined }}>
                {base[base.length - 1].text}
              </div>
              <span style={{ fontSize: 54 }}>✅</span>
            </div>
          ) : (
            introNode
          )}
        </Center>
      ) : showAll ? (
        <Center top={400}>
          <div style={{ display: "flex", gap: 30 }}>
            {allWords!.map((w, i) => (
              <VowelWord key={w} word={w} at={cues.allAt + i * 6} ending={base[base.length - 1].text} tone={endingColor} depth3d={depth3d} vowelColor={focusColor} />
            ))}
          </div>
        </Center>
      ) : (
        <WordTiles
          key={idx}
          parts={parts}
          endingColor={endingColor}
          focusLabel={focusLabel}
          focusColor={focusColor}
          enterAt={idx < 0 ? cues.build : cues.more[idx]}
          endingAt={idx < 0 ? cues.done : cues.more[idx] + 4}
          labelAt={idx < 0 ? cues.label : cues.more[idx] + 8}
          emoji={emoji}
          depth3d={depth3d}
          verdictTop={verdictTop}
        />
      )}
    </>
  );
};

// the card each of the three ch beats opens on, so the naming line has something to show
export const PlaceCard: React.FC<{ n: string; label: string; emoji: string; tone?: string; depth3d?: boolean }> = ({ n, label, emoji, tone = "1565C0", depth3d = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(tone);
  return (
    <div style={{ background: tint(tone, 0.9), border: `9px solid ${c}`, borderRadius: 38, padding: "28px 56px", display: "flex", alignItems: "center", gap: 26, fontFamily: font.family, transform: `scale(${0.86 + 0.14 * spring({ frame, fps, config: { damping: 12 } })}) translateY(${bob(frame, fps, 6, 2.6)}px)`, boxShadow: depth3d ? slab(tone, 18) : `0 20px 48px ${c}55` }}>
      <span style={{ fontSize: 70 }}>{emoji}</span>
      <span style={{ fontSize: 64, fontWeight: 700, color: c }}>{n}</span>
      <span style={{ fontSize: 52, fontWeight: 700, color: palette.ink }}>{label}</span>
    </div>
  );
};

// a word with its short vowel underlined and its ending tinted
// The vowel colour must CONTRAST with the ending, or the two run together. ch/tch is fine on
// the default (#D81B60 pink vowel against tch's orange-red), but ge/dge's dge is #AD1457 — so
// close to that pink that "badge" read as one blob and the child could not see where the vowel
// stopped. It takes the colour of the focus tile that taught it, so the two always agree.
export const VowelWord: React.FC<{
  word: string; at: number; ending: string; tone: string; depth3d?: boolean; vowelColor?: string;
}> = ({ word, at, ending, tone, depth3d = false, vowelColor = "D81B60" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11 } });
  const c = hex(tone);
  const vc = hex(vowelColor);
  const stem = word.slice(0, word.length - ending.length);
  const vowel = stem.slice(-1);
  return (
    <div style={{ background: "#FFFFFFF2", border: `7px solid ${c}`, borderRadius: 28, padding: "14px 30px", fontSize: 66, fontWeight: 700, fontFamily: font.family, color: palette.ink, whiteSpace: "nowrap", transform: `scale(${0.74 + 0.26 * s}) translateY(${bob(frame, fps, 6, 2.4)}px)`, boxShadow: depth3d ? slab(tone, 14) : `0 16px 40px ${c}44` }}>
      {stem.slice(0, -1)}
      <span style={{ color: vc, borderBottom: `8px solid ${vc}`, paddingBottom: 2 }}>{vowel}</span>
      <span style={{ color: c }}>{ending}</span>
    </div>
  );
};
