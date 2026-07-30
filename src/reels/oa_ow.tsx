import React from "react";
import { Sequence } from "remotion";
import { comparisons } from "../data/comparisons";
import { ReelBase, SfxCue, beatTimeline } from "./ReelBase";
import { Quiz } from "../beats/Quiz";
import { Wrap } from "../beats/Wrap";
import { OaHook, OaSameSound, OaPuzzle, OaRuleMid, OaRuleEnd, OaSeeIt } from "./oa_ow_beats";
import { Captions, keywordColorFor } from "../components/Captions";
import { SnowSlope } from "../components/SnowSlope";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { positionCues } from "../lib/positionCues";
import { makeTrack, TPhrase } from "../lib/timing";
import oaOwPhrases from "../data/oa_ow.timing.json";

// karaoke captions driven by the recorded word timings (public/audio/oa_ow.phrases.json)
const track = makeTrack(oaOwPhrases as unknown as TPhrase[], 76.931);

// ── oa/ow reel (L13 · Vowel Teams) — "the long-O boat & wave" ───────────────
// Beats in frames @30fps, synced to public/audio/oa_ow.mp3 (76.93s = 2308f).
const BEATS = {
  hook: 210, // 0–7s
  same: 210, // 7–14s
  puzzle: 90, // 14–17s
  ruleOa: 360, // 17–29s (boat → middle → boat)
  ruleOw: 270, // 29–38s (wave → end → snow)
  seeIt: 450, // 38–53s
  quiz: 360, // 53–65s
  wrap: 358, // 65–76.9s
};

// where the recap begins: the sum of everything before it. Independent of the total, which
// now depends on how long the outro needs — deriving one from the other would be circular.
const WRAP_FROM = BEATS.hook + BEATS.same + BEATS.puzzle + BEATS.ruleOa + BEATS.ruleOw + BEATS.seeIt + BEATS.quiz;

// ── the world reacts to the narration ────────────────────────────────────────
// WORD-level cues via the shared nearest-preceding-spelling rule: the mid-slope marker
// flares on "oa … middle", a snowball runs the gate on "ow … end".
const PH = oaOwPhrases as unknown as Parameters<typeof positionCues>[0];
const MARK_CUES = positionCues(PH, "middle", "oa", "ow");
const FINISH_CUES = positionCues(PH, "end", "ow", "oa");

// The download section appears with ITS OWN audio — the frame the CTA line starts — and the
// reel runs PAST the narration so StoreFlow can finish search -> GET -> OPEN. Both of those
// were bugs on the previous two reels: an outro placed inside the recap line, then one
// truncated mid-download because only the frames left inside the audio were available.
const CTA_RE = /want more|english learning app|download/i;
const CTA_AT = PH.findIndex((ph) => CTA_RE.test((ph as { text?: string }).text ?? ""));
const OUTRO_FROM = Math.round((PH[CTA_AT]?.start ?? 0) * 30);
export const OA_OW_DURATION = OUTRO_FROM + STORE_OUTRO_PORTRAIT_F;

// the recap chips light on the words that name them, not on guessed beat offsets
const HI_OA = (MARK_CUES[MARK_CUES.length - 1] ?? WRAP_FROM) - WRAP_FROM;
const HI_OW = (FINISH_CUES[FINISH_CUES.length - 1] ?? WRAP_FROM) - WRAP_FROM;

const SFX: SfxCue[] = [
  { from: 20, name: "pop", vol: 0.45 }, // oa card in
  { from: 44, name: "pop", vol: 0.45 }, // ow card in
  { from: 96, name: "boing", vol: 0.5 }, // /ō/ "oooh"
  { from: 236, name: "pop", vol: 0.45 }, // boat chip
  { from: 300, name: "pop", vol: 0.45 }, // snow chip
  { from: 450, name: "question", vol: 0.55 }, // "how do we know?"
  { from: 520, name: "whoosh", vol: 0.5 }, // boat sails in
  { from: 730, name: "pop", vol: 0.5 }, // boat written
  { from: 876, name: "whoosh", vol: 0.5 }, // wave rolls in
  { from: 1040, name: "pop", vol: 0.5 }, // snow written
  { from: 1260, name: "pop", vol: 0.5 }, // coat
  { from: 1300, name: "pop", vol: 0.5 }, // goat
  { from: 1340, name: "pop", vol: 0.5 }, // toast
  { from: 1440, name: "pop", vol: 0.5 }, // grow
  { from: 1480, name: "pop", vol: 0.5 }, // blow
  { from: 1520, name: "pop", vol: 0.5 }, // yellow
  // (no oa/ow phoneme here — the narration already says "oa or ow"; would double)
  { from: 1768, name: "tick", vol: 0.45 }, // oa card spotlight
  { from: 1806, name: "tick", vol: 0.45 }, // ow card spotlight
  { from: 1820, name: "drumroll", vol: 0.35, dur: 42 }, // short suspense into reveal
  { from: 1862, name: "correct", vol: 0.6 }, // "It's oa!" (62.07s)
  { from: 1965, name: "tick", vol: 0.4 }, // recap oa
  { from: 2025, name: "tick", vol: 0.4 }, // recap ow
  { from: 2160, name: "whoosh", vol: 0.5 }, // logo
  { from: 2200, name: "pop", vol: 0.45 }, // badges
];

export const OaOwReel: React.FC = () => {
  const data = comparisons.oa_ow;
  const at = beatTimeline();
  return (
    <ReelBase audio="audio/oa_ow/oa_ow.mp3" hueShift={data.hueShift} sfx={SFX} total={OA_OW_DURATION} scene="none" background={<SnowSlope oaColor={data.teams[0].colorHex} owColor={data.teams[1].colorHex} markCues={MARK_CUES} finishCues={FINISH_CUES} dimFrom={OUTRO_FROM} />} logoUntil={WRAP_FROM} logoCorner="tr">
      <Sequence {...at(BEATS.hook)}>
        <OaHook data={data} />
      </Sequence>
      <Sequence {...at(BEATS.same)}>
        <OaSameSound data={data} />
      </Sequence>
      <Sequence {...at(BEATS.puzzle)}>
        <OaPuzzle data={data} />
      </Sequence>
      <Sequence {...at(BEATS.ruleOa)}>
        <OaRuleMid data={data} />
      </Sequence>
      <Sequence {...at(BEATS.ruleOw)}>
        <OaRuleEnd data={data} />
      </Sequence>
      <Sequence {...at(BEATS.seeIt)}>
        <OaSeeIt data={data} />
      </Sequence>
      <Sequence {...at(BEATS.quiz)}>
        {/* "oa" 58.9s (rel 178), "ow" 60.2s (rel 216), "It's oa" 62.1s (rel 272) */}
        <Quiz data={data} word="road" blanked="r__d" answer={0} revealAt={272} focusA={178} focusB={216} focusLen={36} illoSize={320} />
      </Sequence>
      {/* the recap STOPS where the store outro begins, or its chips draw over the phone */}
      <Sequence from={WRAP_FROM} durationInFrames={OUTRO_FROM - WRAP_FROM}>
        {/* recap: oa 65–67 (rel 15) · ow 67–70 (rel 75); app promo 72s (rel 210) */}
        <Wrap data={data} hi0={HI_OA} hi1={HI_OW} hiLen={55} logoAt={210} store={false} demo={[["boat", "oa"], ["snow", "ow"]]} />
      </Sequence>

      {/* karaoke captions in the free band above SAFE_BOTTOM (top-level child = absolute frame) */}
      {/* captions END at the outro (the oo_portrait pattern) — the store card carries its
          own CTA text, and the caption band printed over the badges when it ran on. */}
      <Sequence from={0} durationInFrames={OUTRO_FROM}>
        <Captions track={track} keywordColor={keywordColorFor(data)} bottom={490} maxWidth={940} fontSize={40} />
      </Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={STORE_OUTRO_PORTRAIT_F}>
        <StoreOutroPortrait />
      </Sequence>
    </ReelBase>
  );
};
