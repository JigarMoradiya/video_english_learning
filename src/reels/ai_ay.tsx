import React from "react";
import { Sequence } from "remotion";
import { comparisons } from "../data/comparisons";
import { ReelBase, SfxCue, beatTimeline } from "./ReelBase";
import { Hook } from "../beats/Hook";
import { SameSound } from "../beats/SameSound";
import { Puzzle } from "../beats/Puzzle";
import { ShyI } from "../beats/ShyI";
import { BraveY } from "../beats/BraveY";
import { SeeIt } from "../beats/SeeIt";
import { Quiz } from "../beats/Quiz";
import { Wrap } from "../beats/Wrap";
import { Captions, keywordColorFor } from "../components/Captions";
import { MetroLine } from "../components/MetroLine";
import { StoreOutroPortrait } from "../components/StoreOutroPortrait";
import { positionCues } from "../lib/positionCues";
import { makeTrack, TPhrase } from "../lib/timing";
import aiAyPhrases from "../data/ai_ay.timing.json";

// karaoke captions driven by the recorded word timings (public/audio/ai_ay.phrases.json)
const track = makeTrack(aiAyPhrases as unknown as TPhrase[], 72.829);

// ── ai/ay reel (L13 · Vowel Teams) ─────────────────────────────────────────
// Beat lengths in frames @30fps, synced to public/audio/ai_ay.mp3 (72.83s).
const BEATS = {
  hook: 210, // 0–7s
  same: 120, // 7–11s
  puzzle: 150, // 11–16s
  shyI: 330, // 16–27s
  braveY: 240, // 27–35s
  seeIt: 390, // 35–48s
  quiz: 360, // 48–60s
  wrap: 385, // 60–72.8s
};

export const AI_AY_DURATION = Object.values(BEATS).reduce((a, b) => a + b, 0);

// ── download section: EXACTLY the oo_portrait pattern ────────────────────────
//   captions live in a Sequence that ENDS at OUTRO_FROM · StoreOutroPortrait is used
//   bare, no offset, no nudge. An ad-hoc translateY here is what made it sit too high.
// Frames come from the phrase timings: the outro takes over once "Remember: ai in the
// middle, ay at the end." has finished, and the recap holds until then.
const PH = aiAyPhrases as unknown as Parameters<typeof positionCues>[0];
const F = (sec: number) => Math.round(sec * 30);
const OUTRO_FROM = F(PH[22].end);
// cues come from the shared nearest-preceding-spelling rule (src/lib/positionCues.ts) —
// same helper oi_oy uses, and verified to produce byte-identical frames to the local
// version this replaced.
const BLINK_AI = positionCues(PH, "middle", "ai", "ay");
const BLINK_AY = positionCues(PH, "end", "ay", "ai");

const SFX: SfxCue[] = [
  { from: 30, name: "pop", vol: 0.4 },
  { from: 80, name: "pop", vol: 0.4 },
  { from: 115, name: "twinkle", vol: 0.5 },
  { from: 240, name: "boing", vol: 0.5 },
  { from: 390, name: "question", vol: 0.55 },
  { from: 510, name: "twinkle", vol: 0.55 },
  { from: 559, name: "sparkle", vol: 0.6 },
  { from: 736, name: "pop", vol: 0.5 },
  { from: 810, name: "brave", vol: 0.55 },
  { from: 966, name: "pop", vol: 0.5 },
  { from: 1152, name: "pop", vol: 0.5 },
  { from: 1227, name: "pop", vol: 0.5 },
  { from: 1302, name: "pop", vol: 0.5 },
  { from: 1377, name: "pop", vol: 0.5 },
  { from: 1590, name: "drumroll", vol: 0.4, dur: 92 },
  { from: 795, name: "say_rain", vol: 0.75, dur: 60 },
  { from: 1025, name: "say_day", vol: 0.75, dur: 60 },
  { from: 1565, name: "say_paint", vol: 0.75, dur: 60 },
  { from: 1680, name: "correct", vol: 0.6 },
  { from: 1830, name: "tick", vol: 0.4 },
  { from: 1890, name: "tick", vol: 0.4 },
  { from: 2010, name: "whoosh", vol: 0.5 },
  { from: 2055, name: "pop", vol: 0.45 },
];

export const AiAyReel: React.FC = () => {
  const data = comparisons.ai_ay;
  const at = beatTimeline();
  // THE METRO LINE. The rainbow never became a place; the railway station I tried first
  // put a panel BEHIND the beats and every version of it collided with one of them. A
  // subway diagram is drawn vertically in real life, so it fits 9:16 natively, and its
  // spine runs down the LEFT edge — x200…1080 stays free, so no beat can ever land on it.
  // It also teaches: ai is an interchange mid-line, ay is the terminus with buffers.
  return (
    <ReelBase audio="audio/ai_ay/ai_ay.mp3" hueShift={data.hueShift} sfx={SFX} total={AI_AY_DURATION} scene="none" background={<MetroLine lineColor={data.teams[0].colorHex} endColor={data.teams[1].colorHex} blinkAi={BLINK_AI} blinkAy={BLINK_AY} dimFrom={OUTRO_FROM} />} logoUntil={AI_AY_DURATION - BEATS.wrap} logoCorner="tr">
      <Sequence {...at(BEATS.hook)}>
        <Hook data={data} />
      </Sequence>
      <Sequence {...at(BEATS.same)}>
        <SameSound data={data} />
      </Sequence>
      <Sequence {...at(BEATS.puzzle)}>
        <Puzzle data={data} />
      </Sequence>
      <Sequence {...at(BEATS.shyI)}>
        <ShyI data={data} />
      </Sequence>
      <Sequence {...at(BEATS.braveY)}>
        <BraveY data={data} />
      </Sequence>
      <Sequence {...at(BEATS.seeIt)}>
        <SeeIt data={data} />
      </Sequence>
      <Sequence {...at(BEATS.quiz)}>
        <Quiz data={data} word="paint" blanked="p__nt" answer={0} />
      </Sequence>
{/* The wrap used to end on a bare logo + two store badges. Every other video ends on
          the shared StoreOutroPortrait — phone store-flow, then the CTA, then both badges —
          so this reel now does too. The recap holds for 155f first, then the outro takes
          the last 230f (its springs settle by ~70f, so 230 is comfortable). */}
      <Sequence from={AI_AY_DURATION - BEATS.wrap} durationInFrames={OUTRO_FROM - (AI_AY_DURATION - BEATS.wrap)}>
        <Wrap data={data} store={false} />
      </Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={AI_AY_DURATION - OUTRO_FROM}>
        <StoreOutroPortrait />
      </Sequence>

      {/* karaoke captions in the free band above SAFE_BOTTOM (top-level child = absolute frame) */}
      {/* captions END at the outro — the store card carries its own CTA text, and the
          caption band printed straight over the badges. Same as oo_portrait. */}
      <Sequence from={0} durationInFrames={OUTRO_FROM}>
        <Captions track={track} keywordColor={keywordColorFor(data)} bottom={490} maxWidth={940} fontSize={40} />
      </Sequence>
    </ReelBase>
  );
};
