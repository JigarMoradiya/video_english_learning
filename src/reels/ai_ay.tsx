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
  return (
    <ReelBase audio="audio/ai_ay/ai_ay.mp3" hueShift={data.hueShift} sfx={SFX} total={AI_AY_DURATION} scene="sky" logoUntil={AI_AY_DURATION - BEATS.wrap} logoCorner="tr">
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
      <Sequence {...at(BEATS.wrap)}>
        <Wrap data={data} />
      </Sequence>

      {/* karaoke captions in the free band above SAFE_BOTTOM (top-level child = absolute frame) */}
      <Captions track={track} keywordColor={keywordColorFor(data)} bottom={490} maxWidth={940} fontSize={40} />
    </ReelBase>
  );
};
