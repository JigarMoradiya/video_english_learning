import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison, ComparisonTeam } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { DrawWord } from "../components/DrawWord";
import { WordIllustration } from "../components/WordIllustration";
import { Mascot } from "../components/Mascot";
import { Stage } from "../components/Stage";
import { Boat, Wave } from "../components/Graphics";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette, tint } from "../data/tokens";

// ① 0–7s "Ohhh! Meet oa and ow — both make the long-O sound… oooh!"
export const OaHook: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [oa, ow] = data.teams;
  const inA = spring({ frame: frame - 16, fps, config: { damping: 12 } });
  const inB = spring({ frame: frame - 40, fps, config: { damping: 12 } });
  const soundIn = spring({ frame: frame - 96, fps, config: { damping: 10 } });
  return (
    <Stage gap={60} enter="slideUp">
      <div style={{ display: "flex", gap: 70, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `translateY(${interpolate(inA, [0, 1], [80, 0])}px)`, opacity: inA }}>
          <Boat size={185} color={hex(oa.colorHex)} />
          <LetterBuddy text={oa.marker} colorHex={oa.colorHex} size={190} phase={0} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `translateY(${interpolate(inB, [0, 1], [80, 0])}px)`, opacity: inB }}>
          <Wave size={185} color={hex(ow.colorHex)} />
          <LetterBuddy text={ow.marker} colorHex={ow.colorHex} size={190} phase={1.4} />
        </div>
      </div>
      <div style={{ transform: `scale(${soundIn})`, fontSize: 120, fontWeight: 700, color: palette.ink }}>/ō/</div>
      <Mascot size={220} />
    </Stage>
  );
};

// ② 7–14s "boat… snow. Same sound, different spelling!"
export const OaSameSound: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [oa, ow] = data.teams;
  const soundIn = spring({ frame, fps, config: { damping: 10 } });
  return (
    <Stage gap={56} enter="zoom">
      <div style={{ transform: `scale(${soundIn * pulse(frame, fps, 0.07, 0.9)})`, fontSize: 200, fontWeight: 700, color: palette.ink }}>/ō/</div>
      <div style={{ display: "flex", gap: 90 }}>
        <SoundCol team={oa} word="boat" delay={26} />
        <SoundCol team={ow} word="snow" delay={90} />
      </div>
    </Stage>
  );
};

const SoundCol: React.FC<{ team: ComparisonTeam; word: string; delay: number }> = ({ team, word, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <LetterBuddy text={team.marker} colorHex={team.colorHex} size={180} phase={delay / 40} />
      <div
        style={{
          transform: `translateY(${interpolate(s, [0, 1], [40, 0]) + bob(frame, fps, 6, 2.2)}px) scale(${s})`,
          opacity: s,
          background: hex(team.colorHex),
          color: "#fff",
          fontSize: 62,
          fontWeight: 600,
          padding: "14px 42px",
          borderRadius: 999,
        }}
      >
        {word}
      </div>
    </div>
  );
};

// ③ 14–17s "But how do we know which one?" — cards bob on a wave + compass.
export const OaPuzzle: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [oa, ow] = data.teams;
  const q = spring({ frame: frame - 6, fps, config: { damping: 9 } });
  const waveY = (i: number) => Math.sin((frame / fps) * Math.PI * 1.6 + i) * 22;
  return (
    <Stage gap={60} enter="pop">
      <div style={{ display: "flex", gap: 70 }}>
        <div style={{ transform: `translateY(${waveY(0)}px) rotate(${wiggle(frame, fps, 5, 1.5)}deg)` }}>
          <LetterBuddy text={oa.marker} colorHex={oa.colorHex} size={200} />
        </div>
        <div style={{ transform: `translateY(${waveY(1)}px) rotate(${wiggle(frame, fps, 5, 1.5, 1)}deg)` }}>
          <LetterBuddy text={ow.marker} colorHex={ow.colorHex} size={200} />
        </div>
      </div>
      <div style={{ transform: `scale(${q * pulse(frame, fps, 0.08, 0.8)})`, fontSize: 150 }}>🧭</div>
    </Stage>
  );
};

// Shared rule beat: ocean graphic + zone chip + written word.
const RuleBeat: React.FC<{
  team: ComparisonTeam;
  word: string;
  blanked: string;
  graphic: React.ReactNode;
  wordStart: number;
  enter?: "slideR" | "slideL" | "slideUp" | "zoom" | "pop";
}> = ({ team, word, blanked, graphic, wordStart, enter = "slideR" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);
  const zoneIn = spring({ frame: frame - (wordStart - 60), fps, config: { damping: 12 } });
  return (
    <Stage gap={46} enter={enter}>
      {graphic}
      <div
        style={{
          opacity: zoneIn,
          transform: `scale(${zoneIn})`,
          background: tint(team.colorHex, 0.86),
          border: `8px solid ${c}`,
          borderRadius: 999,
          padding: "16px 44px",
          fontSize: 58,
          fontWeight: 600,
          color: c,
        }}
      >
        {team.zoneEmoji} {team.marker} · {team.zoneHint}
      </div>
      <div style={{ opacity: zoneIn }}>
        <DrawWord blanked={blanked} team={team} size={165} startAt={wordStart} drawFrames={54} />
      </div>
    </Stage>
  );
};

// ④ 17–29s "oa is the boat — sails in the MIDDLE → boat" (boat sails in from left)
export const OaRuleMid: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oa = data.teams[0];
  const sail = spring({ frame: frame - 10, fps, config: { damping: 13 } });
  return (
    <RuleBeat
      team={oa}
      word="boat"
      blanked="b__t"
      wordStart={200}
      enter="slideL"
      graphic={
        <div style={{ transform: `translateX(${interpolate(sail, [0, 1], [-420, 0])}px)` }}>
          <Boat size={310} color={hex(oa.colorHex)} />
        </div>
      }
    />
  );
};

// ⑤ 29–38s "ow is the wave — rolls to the END → snow" (wave rolls in from right)
export const OaRuleEnd: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ow = data.teams[1];
  const roll = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  return (
    <RuleBeat
      team={ow}
      word="snow"
      blanked="sn__"
      wordStart={150}
      enter="slideR"
      graphic={
        <div style={{ transform: `translateX(${interpolate(roll, [0, 1], [420, 0])}px)` }}>
          <Wave size={330} color={hex(ow.colorHex)} />
        </div>
      }
    />
  );
};

// ⑥ 38–53s two-column comparison (oa | ow) — themed word lists.
const TintedWord: React.FC<{ word: string; blanked: string; color: string; size: number }> = ({ word, blanked, color, size }) => {
  const m = blanked.match(/_+/);
  const g = m ? m.index! : word.length;
  const tlen = m ? m[0].length : 0;
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: 2 }}>
      <span style={{ color: palette.ink }}>{word.slice(0, g)}</span>
      <span style={{ color }}>{word.slice(g, g + tlen)}</span>
      <span style={{ color: palette.ink }}>{word.slice(g + tlen)}</span>
    </span>
  );
};

const Column: React.FC<{ team: ComparisonTeam; words: { w: string; b: string }[]; reveal: number[]; headerAt: number }> = ({ team, words, reveal, headerAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);
  const head = spring({ frame: frame - headerAt, fps, config: { damping: 12 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, width: 450 }}>
      <div style={{ transform: `scale(${head})`, opacity: head, background: c, color: "#fff", fontSize: 46, fontWeight: 700, padding: "12px 30px", borderRadius: 999 }}>
        {team.zoneEmoji} {team.marker} · {team.zoneHint}
      </div>
      {words.map((it, i) => {
        const s = spring({ frame: frame - reveal[i], fps, config: { damping: 9, mass: 0.6 } });
        return (
          <div
            key={it.w}
            style={{
              transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2.2, i)}px)`,
              opacity: Math.min(1, s + 0.001),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <WordIllustration word={it.w} size={118} delay={reveal[i]} />
            <TintedWord word={it.w} blanked={it.b} color={c} size={90} />
          </div>
        );
      })}
    </div>
  );
};

export const OaSeeIt: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const [oa, ow] = data.teams;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={110}>
        <SeeIntro />
      </Sequence>
      <Sequence from={110} durationInFrames={340}>
        <Stage enter="slideUp" gap={40}>
          <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
            <Column team={oa} reveal={[10, 50, 90]} headerAt={0} words={[{ w: "coat", b: "c__t" }, { w: "goat", b: "g__t" }, { w: "toast", b: "t__st" }]} />
            <Column team={ow} reveal={[190, 230, 270]} headerAt={190} words={[{ w: "grow", b: "gr__" }, { w: "blow", b: "bl__" }, { w: "yellow", b: "yell__" }]} />
          </div>
        </Stage>
      </Sequence>
    </AbsoluteFill>
  );
};

const SeeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 11 } });
  return (
    <Stage>
      <div style={{ transform: `scale(${s * pulse(frame, fps, 0.05, 1.1)}) translateY(${bob(frame, fps, 12, 1.8)}px)`, fontSize: 96, fontWeight: 700, color: palette.ink }}>
        More words! 🌊
      </div>
    </Stage>
  );
};
