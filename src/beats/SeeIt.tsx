import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison, ComparisonTeam } from "../data/types";
import { DrawWord } from "../components/DrawWord";
import { WordIllustration } from "../components/WordIllustration";
import { Stage } from "../components/Stage";
import { bob, pulse } from "../lib/motion";
import { hex, palette, tint } from "../data/tokens";

// ⑥ 35–48s. Intro (35–38) → snail, train (38–43, ai) → play, stay (43–48, ay).
export const SeeIt: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const [ai, ay] = data.teams;
  const cards: { blanked: string; word: string; team: ComparisonTeam; zone: string }[] = [
    { blanked: "sn__l", word: "snail", team: ai, zone: "🏠 middle" },
    { blanked: "tr__n", word: "train", team: ai, zone: "🏠 middle" },
    { blanked: "pl__", word: "play", team: ay, zone: "🏁 end" },
    { blanked: "st__", word: "stay", team: ay, zone: "🏁 end" },
  ];
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={90}>
        <Intro />
      </Sequence>
      {cards.map((c, i) => (
        <Sequence key={c.word} from={90 + i * 75} durationInFrames={75}>
          <WordCard {...c} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 11 } });
  return (
    <Stage gap={40}>
      <div
        style={{
          transform: `scale(${s * pulse(frame, fps, 0.04, 1.2)}) translateY(${bob(frame, fps, 12, 2)}px)`,
          fontSize: 96,
          fontWeight: 700,
          color: palette.ink,
          textAlign: "center",
        }}
      >
        More words! 📚
      </div>
    </Stage>
  );
};

const WordCard: React.FC<{ blanked: string; word: string; team: ComparisonTeam; zone: string }> = ({
  blanked,
  word,
  team,
  zone,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);
  const chip = spring({ frame, fps, config: { damping: 12 } });

  return (
    <Stage caption="you got it! ✨" captionColor={c} gap={46}>
      <WordIllustration word={word} size={300} />
      <div
        style={{
          transform: `scale(${chip})`,
          background: tint(team.colorHex, 0.86),
          border: `8px solid ${c}`,
          borderRadius: 999,
          padding: "14px 44px",
          fontSize: 54,
          fontWeight: 600,
          color: c,
        }}
      >
        {zone}
      </div>
      <DrawWord blanked={blanked} team={team} size={185} startAt={8} drawFrames={28} />
    </Stage>
  );
};
