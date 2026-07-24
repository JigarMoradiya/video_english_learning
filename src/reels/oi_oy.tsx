import React from "react";
import { Sequence } from "remotion";
import { comparisons } from "../data/comparisons";
import { ReelBase, SfxCue, beatTimeline } from "./ReelBase";
import { Quiz } from "../beats/Quiz";
import { Wrap } from "../beats/Wrap";
import { OiHook, OiSameSound, OiPuzzle, OiRuleMid, OyRuleEnd, OiSeeIt } from "./oi_oy_beats";
import { Captions, keywordColorFor } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import oiOyPhrases from "../data/oi_oy.timing.json";

// karaoke captions driven by the recorded word timings (public/audio/oi_oy.phrases.json)
const track = makeTrack(oiOyPhrases as unknown as TPhrase[], 78.524);

// ── oi/oy reel (L14 · Diphthongs) — "the noisy twins" ───────────────────────
// Beats in frames @30fps, synced to public/audio/oi_oy.mp3 (78.52s = 2356f).
const BEATS = {
  hook: 210, // 0–7s
  same: 210, // 7–14s
  puzzle: 120, // 14–18s
  ruleOi: 330, // 18–29s (calm oi → coin)
  ruleOy: 270, // 29–38s (loud oy → toy)
  seeIt: 480, // 38–54s (soil·point·foil / boy·joy·coy)
  quiz: 390, // 54–67s
  wrap: 346, // 67–78.5s
};

export const OI_OY_DURATION = Object.values(BEATS).reduce((a, b) => a + b, 0);

const SFX: SfxCue[] = [
  { from: 12, name: "whoosh", vol: 0.5 }, // "Oy!" shout
  { from: 45, name: "pop", vol: 0.45 }, // "Oiii" oi card
  { from: 100, name: "boing", vol: 0.5 }, // /oy/ label
  { from: 234, name: "pop", vol: 0.45 }, // coin chip
  { from: 300, name: "pop", vol: 0.45 }, // toy chip
  { from: 480, name: "question", vol: 0.55 }, // "how do we know?"
  { from: 545, name: "twinkle", vol: 0.55 }, // 💡 "simple trick!"
  { from: 730, name: "pop", vol: 0.5 }, // coin written
  { from: 875, name: "brave", vol: 0.55 }, // 📣 loud oy entrance
  { from: 1010, name: "pop", vol: 0.5 }, // toy written
  { from: 1202, name: "pop", vol: 0.5 }, // see-it soil
  { from: 1242, name: "pop", vol: 0.5 }, // point
  { from: 1282, name: "pop", vol: 0.5 }, // foil
  { from: 1412, name: "pop", vol: 0.5 }, // boy
  { from: 1452, name: "pop", vol: 0.5 }, // joy
  { from: 1492, name: "pop", vol: 0.5 }, // coy
  { from: 1845, name: "drumroll", vol: 0.4, dur: 85 }, // quiz suspense
  { from: 1930, name: "correct", vol: 0.6 }, // "It's oy!" reveal (64.4s)
  { from: 2070, name: "tick", vol: 0.4 }, // recap oi
  { from: 2130, name: "tick", vol: 0.4 }, // recap oy
  { from: 2220, name: "whoosh", vol: 0.5 }, // logo
  { from: 2260, name: "pop", vol: 0.45 }, // badges
];

export const OiOyReel: React.FC = () => {
  const data = comparisons.oi_oy;
  const at = beatTimeline();
  return (
    <ReelBase audio="audio/oi_oy/oi_oy.mp3" hueShift={data.hueShift} sfx={SFX} total={OI_OY_DURATION} floater="bubble" scene="party">
      <Sequence {...at(BEATS.hook)}>
        <OiHook data={data} />
      </Sequence>
      <Sequence {...at(BEATS.same)}>
        <OiSameSound data={data} />
      </Sequence>
      <Sequence {...at(BEATS.puzzle)}>
        <OiPuzzle data={data} />
      </Sequence>
      <Sequence {...at(BEATS.ruleOi)}>
        <OiRuleMid data={data} />
      </Sequence>
      <Sequence {...at(BEATS.ruleOy)}>
        <OyRuleEnd data={data} />
      </Sequence>
      <Sequence {...at(BEATS.seeIt)}>
        <OiSeeIt data={data} />
      </Sequence>
      <Sequence {...at(BEATS.quiz)}>
        {/* "oi" spoken 59.9s (rel 177), "oy" 61.1s (rel 214), "It's oy!" 64.4s (rel 310) */}
        <Quiz data={data} word="enjoy" blanked="enj__" answer={1} revealAt={310} focusA={177} focusB={214} focusLen={36} />
      </Sequence>
      <Sequence {...at(BEATS.wrap)}>
        {/* recap: oi 69–71s (rel 60) · oy 71–73s (rel 120); app promo 74s (rel 210) */}
        <Wrap data={data} hi0={60} hi1={120} hiLen={60} logoAt={210} />
      </Sequence>

      {/* karaoke captions in the free band above SAFE_BOTTOM (top-level child = absolute frame) */}
      <Captions track={track} keywordColor={keywordColorFor(data)} bottom={490} maxWidth={940} fontSize={40} />
    </ReelBase>
  );
};
