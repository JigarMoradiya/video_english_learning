import React from "react";
import { Sequence } from "remotion";
import { comparisons } from "../data/comparisons";
import { ReelBase, SfxCue, beatTimeline } from "./ReelBase";
import { Quiz } from "../beats/Quiz";
import { Wrap } from "../beats/Wrap";
import { OiHook, OiSameSound, OiPuzzle, OiRuleMid, OyRuleEnd, OiSeeIt } from "./oi_oy_beats";
import { Captions, keywordColorFor } from "../components/Captions";
import { DigSite } from "../components/DigSite";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { positionCues } from "../lib/positionCues";
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

// where the recap beat begins: the sum of everything before it. Stable, and independent of
// the total — the total now depends on how long the outro needs, so deriving WRAP_FROM from
// it would be circular.
const WRAP_FROM = BEATS.hook + BEATS.same + BEATS.puzzle + BEATS.ruleOi + BEATS.ruleOy + BEATS.seeIt + BEATS.quiz;

// ── the world reacts to the narration ────────────────────────────────────────
// Cues come from the WORD timings via the shared nearest-preceding-spelling rule, so the
// coin seam glints on "oi … middle" and a prize falls to the chest on "oy … end" — and
// "Because it's at the end!", whose `oy` sits in the previous phrase, is still caught.
const PH = oiOyPhrases as unknown as Parameters<typeof positionCues>[0];
const SEAM_CUES = positionCues(PH, "middle", "oi", "oy");
const CHEST_CUES = positionCues(PH, "end", "oy", "oi");
// The download section appears with ITS OWN audio — the frame the first CTA line STARTS.
// Two earlier attempts were both early: a hardcoded `- 236` put it at f2120, which is 65
// frames INSIDE "oi goes in the middle, oy goes at the end!" (f2084-2185); then the END of
// that teaching line (f2185) still left the phone on screen for 47 frames of silence before
// "Want more fun phonics?" begins at f2232. The recap now holds through that gap.
const CTA_RE = /want more|english learning app|download/i;
const CTA_AT = PH.findIndex((ph) => CTA_RE.test((ph as { text?: string }).text ?? ""));
const OUTRO_FROM = Math.round((PH[CTA_AT]?.start ?? 0) * 30);
// THE REEL RUNS PAST ITS AUDIO so the store flow can finish. The narration ends at f2350,
// but StoreFlow needs the full STORE_OUTRO_PORTRAIT_F to play search -> tap GET ->
// downloading -> OPEN; at the 124 frames left inside the audio it was cut off mid-download.
// The music bed carries the tail and ReelBase fades it against this same total.
export const OI_OY_DURATION = OUTRO_FROM + STORE_OUTRO_PORTRAIT_F;

// the recap chips light on the words that name them, not on guessed beat offsets
const HI_OI = (SEAM_CUES[SEAM_CUES.length - 1] ?? WRAP_FROM) - WRAP_FROM;
const HI_OY = (CHEST_CUES[CHEST_CUES.length - 1] ?? WRAP_FROM) - WRAP_FROM;

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
    <ReelBase audio="audio/oi_oy/oi_oy.mp3" hueShift={data.hueShift} sfx={SFX} total={OI_OY_DURATION} scene="none" background={<DigSite oiColor={comparisons.oi_oy.teams[0].colorHex} oyColor={comparisons.oi_oy.teams[1].colorHex} seamCues={SEAM_CUES} chestCues={CHEST_CUES} dimFrom={OUTRO_FROM} />} logoUntil={WRAP_FROM} logoCorner="tr">
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
      {/* The recap must STOP where the store outro begins. Running the full beat left the
          oi/oy chips drawn on top of the phone card, with one clipped at the right edge. */}
      <Sequence from={WRAP_FROM} durationInFrames={OUTRO_FROM - WRAP_FROM}>
        {/* recap: oi 69–71s (rel 60) · oy 71–73s (rel 120) */}
        <Wrap data={data} hi0={HI_OI} hi1={HI_OY} hiLen={60} logoAt={210} store={false} demo={[["coin", "oi"], ["boy", "oy"]]} />
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
