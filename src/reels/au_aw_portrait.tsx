import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { LaunchSky, astronautAt } from "../components/PortraitWorlds";
import { PSlotRow } from "../components/PortraitBeatKit";
import { PPairBonus, PPairHook, PPairNotThis, PPairQuiz, PPairRecap, PPairRule, PPairSame, PPairSeeIt, PPairWhere } from "./pair_9x16_beats";
import { PAwOneSound } from "./pair_9x16_special";
import {
  AU_AW_16X9_DURATION, AU_AW_COPY, AU_AW_ONE_SOUND_CUES, AU_AW_WORDS_END, AU_AW_WORDS_MID,
  AU_AW_SFX, auAwBeats, auAwColorFor, auAwP, auAwStateFor, auAwTrack, auAwW,
} from "./au_aw_16x9";

// ── au/aw, 9:16 ─────────────────────────────────────────────────────────────
// Same narration and same beat map as the landscape cut, imported rather than copied. The
// world is a NIGHT LAUNCH: the rocket climbs a little further every second of the video, so
// the tall frame has an arc of its own — and it is nothing like the sleepy lawn.
const data = comparisons.au_aw;
const byId: Record<string, Beat> = Object.fromEntries(auAwBeats.map((b) => [b.id, b]));
export const AU_AW_PORTRAIT_DURATION = AU_AW_16X9_DURATION;

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <PPairHook data={data} />;
    case "same": return <PPairSame data={data} copy={AU_AW_COPY} />;
    case "where": return <PPairWhere beat={b} />;
    case "ruleMid": return <PPairRule data={data} teamIdx={0} />;
    case "ruleEnd": return <PPairRule data={data} teamIdx={1} />;
    case "bonus": return <PPairBonus data={data} ruleAt={auAwP(26) - b.from} guards="a final letter" examples={["yawn", "crawl"]} />;
    case "notThis": return <PPairNotThis data={data} beat={b} copy={AU_AW_COPY} />;
    case "oneSound": return <PAwOneSound data={data} beat={b} cues={AU_AW_ONE_SOUND_CUES} />;
    case "seeIt": return <PPairSeeIt data={data} beat={b} wordsMid={AU_AW_WORDS_MID} wordsEnd={AU_AW_WORDS_END} />;
    case "quiz": return <PPairQuiz data={data} beat={b} copy={AU_AW_COPY} word="yawn" blanked="y__n" answer={1} />;
    case "recap": return <PPairRecap data={data} beat={b} />;
    case "wrap": return <StoreOutro silent compact total={b.durationInFrames} bg="rgba(255,252,248,0.80)" />;
    default: return null;
  }
};

export const AuAwPortraitReel: React.FC = () => (
  <ReelBase
    audio="audio/au_aw_16x9/au_aw_16x9.mp3"
    hueShift={data.hueShift}
    sfx={AU_AW_SFX}
    total={AU_AW_PORTRAIT_DURATION}
    background={<LaunchSky />}
    logoUntil={byId.wrap.from}
    // bottom-left in portrait: a two-line headline pill reaches the top-right corner
    logoCorner="bl"
  >
    <PSlotRow
      data={data}
      stateFor={auAwStateFor}
      colorFor={auAwColorFor}
      showLabelsFrom={auAwP(12)}
      labelLitAt={[auAwW("beginning"), auAwW("middle"), auAwP(20)]}
      hideAt={byId.oneSound.from}
      hopFrames={16}
      renderCharacter={astronautAt}
    />

    {auAwBeats.map((b) => {
      const node = overlayFor(b);
      return node ? (
        <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
          {node}
        </Sequence>
      ) : null;
    })}

    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Captions track={auAwTrack} keywordColor={keywordColorFor(data)} maxWidth={900} fontSize={44} bottom={230} />
    </Sequence>
  </ReelBase>
);
