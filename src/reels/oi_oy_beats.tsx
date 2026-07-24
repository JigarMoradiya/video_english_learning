import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison, ComparisonTeam } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { DrawWord } from "../components/DrawWord";
import { WordIllustration } from "../components/WordIllustration";
import { Mascot } from "../components/Mascot";
import { Stage } from "../components/Stage";
import { Megaphone, Lightbulb } from "../components/Graphics";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette, tint } from "../data/tokens";

// Expanding "shout" rings — the loud-oy signature effect.
const ShoutRings: React.FC<{ color: string; size: number; startAt?: number }> = ({ color, size, startAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {[0, 1, 2].map((k) => {
        const p = ((frame - startAt) / fps + k * 0.33) % 1;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `6px solid ${color}`,
              opacity: (1 - p) * 0.5,
              transform: `scale(${0.6 + p * 1.6})`,
            }}
          />
        );
      })}
    </>
  );
};

// ① 0–7s "Oy! …Oiii! That's the sound oi and oy both make!"
export const OiHook: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [oi, oy] = data.teams;
  const oyIn = spring({ frame: frame - 12, fps, config: { damping: 10 } });
  const oiIn = spring({ frame: frame - 48, fps, config: { damping: 11 } });
  const soundIn = spring({ frame: frame - 100, fps, config: { damping: 10 } });

  return (
    <Stage gap={70} enter="pop">
      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        <div style={{ transform: `translateX(${interpolate(oiIn, [0, 1], [-600, 0])}px)`, opacity: oiIn }}>
          <LetterBuddy text={oi.marker} colorHex={oi.colorHex} phase={1.2} />
        </div>
        <div style={{ position: "relative", transform: `translateX(${interpolate(oyIn, [0, 1], [600, 0])}px) scale(${oyIn})` }}>
          <ShoutRings color={hex(oy.colorHex)} size={320} />
          <LetterBuddy text={oy.marker} colorHex={oy.colorHex} phase={0} />
          <div style={{ position: "absolute", top: -80, right: -90, transform: `scale(${pulse(frame, fps, 0.12, 0.7)})` }}>
            <Megaphone size={140} color={hex(oy.colorHex)} />
          </div>
        </div>
      </div>

      <div style={{ transform: `scale(${soundIn})`, fontSize: 130, fontWeight: 700, color: palette.ink }}>/oy/</div>
      <Mascot size={240} />
    </Stage>
  );
};

// ② 7–14s "You hear it in coin… and in toy. Same sound, different spelling!"
export const OiSameSound: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [oi, oy] = data.teams;
  const soundIn = spring({ frame, fps, config: { damping: 10 } });
  return (
    <Stage gap={60} enter="zoom">
      <div style={{ transform: `scale(${soundIn * pulse(frame, fps, 0.07, 0.9)})`, fontSize: 200, fontWeight: 700, color: palette.ink }}>/oy/</div>
      {/* two columns: coin lives with oi, toy lives with oy */}
      <div style={{ display: "flex", gap: 90 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <LetterBuddy text={oi.marker} colorHex={oi.colorHex} size={190} phase={0} />
          <Chip text="coin" color={hex(oi.colorHex)} delay={30} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <LetterBuddy text={oy.marker} colorHex={oy.colorHex} size={190} phase={1.5} />
          <Chip text="toy" color={hex(oy.colorHex)} delay={90} />
        </div>
      </div>
    </Stage>
  );
};

const Chip: React.FC<{ text: string; color: string; delay: number }> = ({ text, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11 } });
  return (
    <div
      style={{
        transform: `translateY(${interpolate(s, [0, 1], [40, 0]) + bob(frame, fps, 6, 2.2)}px) scale(${s})`,
        opacity: s,
        background: color,
        color: "#fff",
        fontSize: 64,
        fontWeight: 600,
        padding: "16px 44px",
        borderRadius: 999,
      }}
    >
      {text}
    </div>
  );
};

// A rule beat: concept chip + illustration + written word. Reused for oi & oy.
const RuleBeat: React.FC<{
  team: ComparisonTeam;
  word: string;
  blanked: string;
  intro: React.ReactNode; // the personified header (💡 trick / 📣 loud)
  wordStart: number;
  enter?: "slideR" | "slideL" | "slideUp" | "zoom" | "pop";
}> = ({ team, word, blanked, intro, wordStart, enter = "slideR" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);
  const zoneIn = spring({ frame: frame - (wordStart - 60), fps, config: { damping: 12 } });
  return (
    <Stage gap={44} enter={enter}>
      {intro}
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
        <WordIllustration word={word} size={230} delay={wordStart - 55} />
      </div>
      <div style={{ opacity: zoneIn }}>
        <DrawWord blanked={blanked} team={team} size={165} startAt={wordStart} drawFrames={54} />
      </div>
    </Stage>
  );
};

// ③ 14–18s "So… how do we know which one?" — a spinning coin (oi/oy theme).
export const OiPuzzle: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [oi, oy] = data.teams;
  // coin flip via horizontal squish (upright text, no mirroring); swap face at the pinch
  const t2 = (frame / fps) * 3.2;
  const sx = Math.max(0.06, Math.abs(Math.cos(t2)));
  const face = Math.floor(t2 / Math.PI) % 2;
  const cur = face === 0 ? oi : oy;
  const q = spring({ frame: frame - 6, fps, config: { damping: 9 } });
  return (
    <Stage gap={70} enter="pop">
      {/* flipping coin showing oi / oy alternately */}
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `linear-gradient(145deg, ${hex(cur.colorHex)}, ${tint(cur.colorHex, 0.35)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scaleX(${sx}) translateY(${bob(frame, fps, 12, 1.6)}px)`,
          boxShadow: `0 20px 50px ${hex(cur.colorHex)}55`,
          border: "10px solid rgba(255,255,255,0.6)",
        }}
      >
        <span style={{ fontSize: 130, fontWeight: 700, color: "#fff" }}>{cur.marker}</span>
      </div>
      <div style={{ transform: `scale(${q * pulse(frame, fps, 0.08, 0.8)})`, fontSize: 150 }}>🤷‍♀️</div>
    </Stage>
  );
};

// ④ 18–29s calm oi: "simple trick! oi stays in the MIDDLE → coin"
export const OiRuleMid: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oi = data.teams[0];
  const bulb = spring({ frame: frame - 8, fps, config: { damping: 9 } });
  return (
    <RuleBeat
      team={oi}
      word="coin"
      blanked="c__n"
      wordStart={165}
      enter="slideL"
      intro={
        <div style={{ transform: `scale(${bulb}) translateY(${bob(frame, fps, 10, 2)}px)` }}>
          <Lightbulb size={230} />
        </div>
      }
    />
  );
};

// ⑤ 29–38s loud oy: "oy jumps to the END → toy"
export const OyRuleEnd: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oy = data.teams[1];
  const in0 = spring({ frame, fps, config: { damping: 10 } });
  return (
    <RuleBeat
      team={oy}
      word="toy"
      blanked="t__"
      wordStart={120}
      enter="slideR"
      intro={
        <div style={{ position: "relative", transform: `scale(${in0}) translateY(${bob(frame, fps, 8, 1.6)}px)` }}>
          <ShoutRings color={hex(oy.colorHex)} size={200} />
          <Megaphone size={200} color={hex(oy.colorHex)} />
        </div>
      }
    />
  );
};

// ⑥ 38–54s. Side-by-side TWO-COLUMN comparison (oi | oy) — a distinct layout
// vs ai/ay's one-word cards. oi column fills 40–47s, oy column fills 47–54s.
export const OiSeeIt: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const [oi, oy] = data.teams;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={62}>
        <SeeIntro />
      </Sequence>
      <Sequence from={62} durationInFrames={418}>
        <TwoColumns oi={oi} oy={oy} />
      </Sequence>
    </AbsoluteFill>
  );
};

const REVEAL_OI = [0, 40, 80];
const REVEAL_OY = [210, 250, 290];

const TwoColumns: React.FC<{ oi: ComparisonTeam; oy: ComparisonTeam }> = ({ oi, oy }) => {
  return (
    <Stage enter="slideUp" gap={40}>
      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        <Column team={oi} reveal={REVEAL_OI} headerAt={0} words={[{ w: "soil", b: "s__l" }, { w: "point", b: "p__nt" }, { w: "foil", b: "f__l" }]} />
        <Column team={oy} reveal={REVEAL_OY} headerAt={210} words={[{ w: "boy", b: "b__" }, { w: "joy", b: "j__" }, { w: "coy", b: "c__" }]} />
      </div>
    </Stage>
  );
};

const Column: React.FC<{ team: ComparisonTeam; words: { w: string; b: string }[]; reveal: number[]; headerAt: number }> = ({ team, words, reveal, headerAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);
  const head = spring({ frame: frame - headerAt, fps, config: { damping: 12 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, width: 440 }}>
      <div
        style={{
          transform: `scale(${head})`,
          opacity: head,
          background: c,
          color: "#fff",
          fontSize: 46,
          fontWeight: 700,
          padding: "12px 30px",
          borderRadius: 999,
        }}
      >
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
            <TintedWord word={it.w} blanked={it.b} color={c} size={92} />
          </div>
        );
      })}
    </div>
  );
};

const SeeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 11 } });
  return (
    <Stage>
      <div style={{ transform: `scale(${s * pulse(frame, fps, 0.05, 1.1)}) translateY(${bob(frame, fps, 12, 1.8)}px)`, fontSize: 96, fontWeight: 700, color: palette.ink }}>
        More words! 📣
      </div>
    </Stage>
  );
};

// tint the oi/oy letters inside a word (from its blanked pattern)
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

