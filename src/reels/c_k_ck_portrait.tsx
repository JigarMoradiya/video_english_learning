import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { comparisons } from "../data/comparisons";
import { CkBackground } from "../components/CkBackground";
import { Captions } from "../components/Captions";
import { WordStreetPortrait } from "../components/WordStreetPortrait";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { Watermark } from "../components/Watermark";
import { makeTrack, planBeats, BeatSpec, Beat } from "../lib/timing";
import { CHook, CThree, CSame, CPuzzle, CRule, CSeeIt, CQuiz, CRecap } from "./c_k_ck_portrait_beats";
import { font } from "../data/tokens";
import { SfxCue } from "./ReelBase";

// ── c/k/ck · 9:16 cut (L5 "-ck Rule") ────────────────────────────────────────
// SAME narration and timing track as the 16:9 lesson (public/audio/c_k_ck/c_k_ck.mp3,
// 139.08s) — a re-visualisation, not new content.
//
// Deliberately DIFFERENT from the 16:9:
//   · the three spellings are FULL-WIDTH STACKED cards, not the horizontal
//     "Word Street" — three lanes side by side don't fit a tall frame
//   · full-width example word cards, each landing as the narration says it
//   · ends on StoreOutroPortrait rather than the landscape StoreOutro
//
// The world is LIGHT, matching the 16:9. A dark version was tried and rejected:
// on a dark background every foreground element needs a white card behind it
// first, and dark body text silently disappears (it did, twice). Light background
// = foreground colours are free, which is exactly why the landscape cut reads well.

export const CK_BG = "linear-gradient(180deg, #EAF4FF 0%, #F4EEFF 38%, #FFF3E8 72%, #FFF7E9 100%)";

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 1 },
  { id: "three", from: 2, to: 4 },
  { id: "same", from: 5, to: 9 },
  { id: "puzzle", from: 10, to: 11 },
  { id: "ruleC", from: 12, to: 13 },
  { id: "ruleK", from: 14, to: 16 },
  { id: "ruleCK", from: 17, to: 18 },
  { id: "seeIt", from: 19, to: 22 },
  { id: "quizQ", from: 23, to: 25 },
  { id: "reveal", from: 26, to: 26 },
  { id: "recap", from: 27, to: 30 },
  { id: "wrap", from: 31, to: 31 },
];

const RULE_TEAM: Record<string, number> = { ruleC: 0, ruleK: 1, ruleCK: 2 };

const track = makeTrack(); // defaults to c_k_ck.timing.json / 139.08s
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));

const WRAP_FROM = byId.wrap.from;
export const CK_PORTRAIT_DURATION = WRAP_FROM + STORE_OUTRO_PORTRAIT_F;

const CK_KEYWORDS: Record<string, string> = {
  c: "#1E88E5", cat: "#1E88E5", cot: "#1E88E5", cup: "#1E88E5", corn: "#1E88E5", cab: "#1E88E5", cut: "#1E88E5",
  k: "#8E24AA", key: "#8E24AA", kit: "#8E24AA", king: "#8E24AA", kite: "#8E24AA", kid: "#8E24AA", kiss: "#8E24AA",
  ck: "#F57C00", duck: "#F57C00", rock: "#F57C00", kick: "#F57C00", sock: "#F57C00", back: "#F57C00", neck: "#F57C00",
  city: "#E53935",
};
const ckKeywordColor = (raw: string): string | null => {
  if (raw.includes("/k/")) return "#2E7D32";
  if (raw.includes("/s/")) return "#E53935";
  return CK_KEYWORDS[raw.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? null;
};

const DOCK_POPS = [419, 482, 549, 1223, 1277, 1325, 1847, 1933, 1993, 2372, 2423, 2489, 2681, 2713, 2764, 2851, 2889, 2912, 3023, 3051, 3092];
const SFX: SfxCue[] = [
  ...DOCK_POPS.map((from) => ({ from, name: "pop", vol: 0.3 })),
  { from: 167, name: "boing", vol: 0.44 },
  { from: 264, name: "sparkle", vol: 0.4 },
  ...[608, 637, 652].map((from) => ({ from, name: "tick", vol: 0.34 })),
  { from: 869, name: "question", vol: 0.45 },
  { from: 1539, name: "sparkle", vol: 0.36 },
  { from: 1648, name: "whoosh", vol: 0.48 },
  { from: 3157, name: "question", vol: 0.45 },
  { from: 3360, name: "drumroll", vol: 0.32, dur: 72 },
  { from: 3435, name: "correct", vol: 0.55 },
  ...[3600, 3707, 3787].map((from) => ({ from, name: "tick", vol: 0.34 })),
  { from: WRAP_FROM + 8, name: "chime_soft", vol: 0.34 },
];

export const CkCkPortraitReel: React.FC = () => {
  const data = comparisons.c_k_ck;
  const quiz = byId.quizQ;
  const reveal = byId.reveal;
  const quizRevealAt = reveal.from - quiz.from;
  // the short-vowel underline appears only when "short vowel" is spoken
  const quizUnderlineAt = Math.max(0, track.wordAbs("vowel", { afterSec: 115 }) - quiz.from);

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#EAF4FF" }}>
      {/* the SAME animated background as the 16:9 cut — drifting colour orbs and
          twinkling sparkles. CkBackground is fractional/dimension-aware, so it fills
          1080×1920 too; the portrait was using a flat static gradient. */}
      <CkBackground hueShift={data.hueShift} />

      <Audio src={staticFile("audio/c_k_ck/c_k_ck.mp3")} />
      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(f) => interpolate(f, [0, 20, CK_PORTRAIT_DURATION - 40, CK_PORTRAIT_DURATION], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur ?? 45}>
          <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}

      {/* persistent set — the same script-progress machine as the 16:9 cut */}
      <Sequence from={0} durationInFrames={WRAP_FROM}>
        <WordStreetPortrait data={data} beats={beats} />
      </Sequence>

      {beats.map((b) => {
        if (b.id === "reveal" || b.id === "wrap") return null;
        if (b.id === "quizQ") {
          return (
            <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames + reveal.durationInFrames}>
              <CQuiz data={data} beat={b} revealAt={quizRevealAt} underlineAt={quizUnderlineAt} />
            </Sequence>
          );
        }
        const team = RULE_TEAM[b.id];
        return (
          <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
            {b.id === "hook" ? <CHook data={data} beat={b} />
              : b.id === "three" ? <CThree data={data} beat={b} />
              : b.id === "same" ? <CSame data={data} beat={b} />
              : b.id === "puzzle" ? <CPuzzle data={data} beat={b} />
              : team !== undefined ? <CRule data={data} beat={b} team={team} />
              : b.id === "seeIt" ? <CSeeIt data={data} beat={b} />
              : b.id === "recap" ? <CRecap data={data} beat={b} />
              : null}
          </Sequence>
        );
      })}

      <Sequence from={0} durationInFrames={WRAP_FROM}>
        <Captions track={track} keywordColor={ckKeywordColor} maxWidth={900} fontSize={34} bottom={272} />
      </Sequence>

      <Sequence from={WRAP_FROM} durationInFrames={STORE_OUTRO_PORTRAIT_F}>
        {/* no bg — the reel's own CK_BG keeps running. The dark teal was a jump cut. */}
        <StoreOutroPortrait />
      </Sequence>

      <Sequence from={0} durationInFrames={WRAP_FROM}>
        <Watermark corner="tr" widthFrac={0.13} opacity={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
