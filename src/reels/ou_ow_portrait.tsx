import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { TreehouseSky, owlAt } from "../components/PortraitWorlds";
import { PSlotRow } from "../components/PortraitBeatKit";
import { PPairBonus, PPairHook, PPairQuiz, PPairRecap, PPairRule, PPairSame, PPairSeeIt, PPairWhere } from "./pair_9x16_beats";
import { POuTwoSounds } from "./pair_9x16_special";
import {
  OU_OW_16X9_DURATION, OU_OW_COPY, OU_OW_TWO_SOUND_CUES, OU_OW_WORDS_END, OU_OW_WORDS_MID,
  OU_OW_SFX, ouOwBeats, ouOwColorFor, ouOwP, ouOwStateFor, ouOwTrack, ouOwW,
} from "./ou_ow_16x9";

// ── ou/ow, 9:16 ─────────────────────────────────────────────────────────────
// The SAME narration and the SAME beat map as the landscape cut — imported, not copied, so
// a corrected cue can never apply to only one of the two. What changes is the world: a
// TREEHOUSE at dusk instead of the big top, with an owl hopping the branch (owl is one of
// this card's own words). A re-crop of the circus would just be the same video squeezed.
const data = comparisons.ou_ow;
const byId: Record<string, Beat> = Object.fromEntries(ouOwBeats.map((b) => [b.id, b]));
// The store flow is a FIXED 344-frame animation (phone search → detail →
// download → badges). The narration finishes before it does, so the video used to cut mid
// download. Pad the composition so the flow always gets to play out.
const OUTRO_PAD = Math.max(0, STORE_OUTRO_PORTRAIT_F - byId.wrap.durationInFrames);
export const OU_OW_PORTRAIT_DURATION = OU_OW_16X9_DURATION + OUTRO_PAD;

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <PPairHook data={data} />;
    case "same": return <PPairSame data={data} copy={OU_OW_COPY} />;
    case "where": return <PPairWhere beat={b} />;
    case "ruleMid": return <PPairRule data={data} teamIdx={0} />;
    case "ruleEnd": return <PPairRule data={data} teamIdx={1} />;
    case "bonus": return <PPairBonus data={data} ruleAt={ouOwP(26) - b.from} guards="a final n or l" examples={["brown", "owl"]} />;
    case "twoSounds": return <POuTwoSounds data={data} beat={b} cues={OU_OW_TWO_SOUND_CUES} />;
    case "seeIt": return <PPairSeeIt data={data} beat={b} wordsMid={OU_OW_WORDS_MID} wordsEnd={OU_OW_WORDS_END} />;
    case "quiz": return <PPairQuiz data={data} beat={b} copy={OU_OW_COPY} word="brown" blanked="br__n" answer={1} />;
    case "recap": return <PPairRecap data={data} beat={b} />;
    // the 9:16 store outro is its own component — the landscape one pins its text
    // column at left 770, which runs clean off a 1080-wide frame
    case "wrap": return <StoreOutroPortrait bg="rgba(255,252,248,0.80)" />;
    default: return null;
  }
};

export const OuOwPortraitReel: React.FC = () => (
  <ReelBase
    audio="audio/ou_ow_16x9/ou_ow_16x9.mp3"
    hueShift={data.hueShift}
    sfx={OU_OW_SFX}
    total={OU_OW_PORTRAIT_DURATION}
    background={<TreehouseSky />}
    logoUntil={byId.wrap.from}
    // bottom-left in portrait: a two-line headline pill reaches the top-right corner
    logoCorner="tl"
  >
    <PSlotRow
      data={data}
      stateFor={ouOwStateFor}
      colorFor={ouOwColorFor}
      showLabelsFrom={ouOwP(12)}
      labelLitAt={[ouOwW("beginning"), ouOwW("middle"), ouOwP(20)]}
      hideAt={byId.twoSounds.from}
      hopFrames={12}
      renderCharacter={owlAt}
    />

    {ouOwBeats.map((b) => {
      const node = overlayFor(b);
      return node ? (
        <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames + (b.id === "wrap" ? OUTRO_PAD : 0)}>
          {node}
        </Sequence>
      ) : null;
    })}

    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Captions track={ouOwTrack} keywordColor={keywordColorFor(data)} maxWidth={900} fontSize={44} bottom={230} />
    </Sequence>
  </ReelBase>
);
