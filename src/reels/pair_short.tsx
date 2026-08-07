import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../components/Watermark";
import { EndCard } from "../components/EndCard";
import {
  Beat, Icon, Mark, Pill, Plate, RuleBadge, Stack, Tag, Theme, THEMES, Tile, Title, Word,
} from "../components/Shorts";

// ── VOWEL-PAIR SHORTS · 9:16 ─────────────────────────────────────────────────
//
// One component, five shorts. They all teach the same shape of rule — the first spelling
// in the MIDDLE of a word, the second at the END — so they share a layout engine and
// differ only by theme and word list.
//
// The rule is a POSITION rule and it is true for every word used here. Where a pair also
// has a second sound (ow says /ow/ in cow and /ō/ in snow) the short says so out loud
// rather than leaving a half-rule standing.
//
// `oo` is NOT in this file. It has no position rule, so giving it one would be teaching
// something false; it gets its own component.

const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
export const PAIR_SHORT_DURATION = S(36);
const END = S(31.6);

export type PairSpec = {
  id: string;
  theme: keyof typeof THEMES;
  first: string;          // the middle spelling
  second: string;         // the end spelling
  sound: string;          // what they both say, in plain words
  icon: string;
  mid: string[];          // words with the FIRST spelling in the middle
  end: string[];          // words with the SECOND spelling at the end
  /** said out loud when the pair has a second sound, so no half-rule is left standing */
  caution?: { text: string; word: string };
};

const CUES: [number, string, number][] = [
  [S(1.4), "chime_soft", 0.30],
  [S(4.0), "blend", 0.28],
  [S(7.4), "pop", 0.30], [S(9.2), "pop", 0.30], [S(11.0), "pop", 0.30],
  [S(14.2), "blend", 0.28],
  [S(15.6), "pop", 0.30], [S(17.4), "pop", 0.30], [S(19.2), "pop", 0.30],
  [S(22.4), "question", 0.28],
  [S(26.0), "tick", 0.26],
  [S(28.6), "sparkle", 0.32],
];

export const PairShort: React.FC<{ spec: PairSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const t: Theme = THEMES[spec.theme];
  const Bg = t.bg;

  const mi = Math.floor((frame - S(7.3)) / S(1.8));
  const ei = Math.floor((frame - S(15.5)) / S(1.8));

  return (
    <AbsoluteFill>
      <Bg />
      {CUES.map(([at, file, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
        </Sequence>
      ))}

      {frame < END && <RuleBadge t={t} text={`${spec.first}  ·  ${spec.second}`} />}

      {/* ① HOOK — one sound, two spellings */}
      <Beat from={0} to={S(4.0)}>
        <Stack gap={40}>
          <Icon glyph={spec.icon} at={S(0.2)} size={150} />
          <Title text={spec.sound} size={70} at={S(0.6)} color={t.ink} />
          <Plate t={t} at={S(1.2)}>
            <Tile ch={spec.first} size={170} color={t.a} at={S(1.2)} />
            <Tile ch={spec.second} size={170} color={t.b} at={S(1.6)} seed={2} />
          </Plate>
          <Title text="two spellings" size={58} at={S(2.2)} color={t.ink} />
        </Stack>
      </Beat>

      {/* ② TITLE — the rule, in one line */}
      <Beat from={S(4.0)} to={S(7.1)}>
        <Stack gap={40}>
          <Title text={"SAME SOUND\nTWO SPELLINGS"} size={92} at={S(4.1)} color={t.ink} />
          <Pill text="so WHICH one?" color={t.a} size={58} at={S(4.9)} />
        </Stack>
      </Beat>

      {/* ③ the FIRST spelling, in the middle */}
      <Beat from={S(7.1)} to={S(14.2)}>
        <Stack gap={38}>
          <Tag t={t} text="RULE 1" at={S(7.15)} />
          <Pill text={`${spec.first}  in the  MIDDLE`} color={t.a} size={62} at={S(7.2)} />
          {mi >= 0 && mi < spec.mid.length && (
            <Plate key={spec.mid[mi]} t={t} at={S(7.3) + mi * S(1.8)}>
              <Word text={spec.mid[mi]} target={spec.first} color={t.a} size={136} at={S(7.3) + mi * S(1.8)} />
            </Plate>
          )}
          <Mark kind="yes" at={S(7.7)} />
        </Stack>
      </Beat>

      {/* ④ the SECOND spelling, at the end */}
      <Beat from={S(14.2)} to={S(22.2)}>
        <Stack gap={38}>
          <Tag t={t} text="RULE 2" at={S(14.25)} />
          <Pill text={`${spec.second}  at the  END`} color={t.b} size={62} at={S(14.3)} />
          {ei >= 0 && ei < spec.end.length && (
            <Plate key={spec.end[ei]} t={t} at={S(15.5) + ei * S(1.8)}>
              <Word text={spec.end[ei]} target={spec.second} color={t.b} size={136} at={S(15.5) + ei * S(1.8)} />
            </Plate>
          )}
          <Mark kind="yes" at={S(14.8)} />
        </Stack>
      </Beat>

      {/* ⑤ the contrast, side by side — or the caution, where the pair has two sounds */}
      <Beat from={S(22.2)} to={S(28.2)}>
        <Stack gap={34}>
          <Tag t={t} text={spec.caution ? "CAREFUL" : "SEE IT"} at={S(22.3)} />
          {spec.caution ? (
            <>
              <Pill text={spec.caution.text} color={t.warn} size={46} at={S(22.4)} />
              <Plate t={t} at={S(23.2)}>
                <Word text={spec.caution.word} target={spec.second} color={t.warn} size={130} at={S(23.2)} />
              </Plate>
              <Title text="listen for it!" size={54} at={S(25.4)} color={t.ink} />
            </>
          ) : (
            <>
              <Plate t={t} at={S(22.4)}>
                <Word text={spec.mid[0]} target={spec.first} color={t.a} size={112} at={S(22.4)} />
              </Plate>
              <Title text="middle" size={48} at={S(22.8)} color={t.a} />
              <Plate t={t} at={S(24.6)}>
                <Word text={spec.end[0]} target={spec.second} color={t.b} size={112} at={S(24.6)} />
              </Plate>
              <Title text="end" size={48} at={S(25.0)} color={t.b} />
            </>
          )}
        </Stack>
      </Beat>

      {/* ⑥ REMEMBER */}
      <Beat from={S(28.2)} to={END}>
        <Stack gap={30}>
          <Icon glyph={"\u{1F9E0}"} at={S(28.3)} size={120} />
          <Title text="REMEMBER" size={70} at={S(28.4)} color={t.ink} />
          <Pill text={`${spec.first}  →  MIDDLE`} color={t.a} size={54} at={S(28.7)} />
          <Pill text={`${spec.second}  →  END`} color={t.b} size={54} at={S(29.0)} />
        </Stack>
      </Beat>

      {/* ⑦ DOWNLOAD */}
      <Beat from={END} to={PAIR_SHORT_DURATION}>
        <EndCard at={END + 3} sub="More sounds inside" bg="rgba(255,255,255,0.94)" />
      </Beat>

      {frame < END && <Watermark corner="tr" widthFrac={0.19} pad={54} opacity={0.9} />}
    </AbsoluteFill>
  );
};

// ── the five specs ───────────────────────────────────────────────────────────

export const PAIRS: PairSpec[] = [
  {
    id: "ai-ay", theme: "notebook", first: "ai", second: "ay", sound: "both say  long A",
    icon: "\u{1F327}", mid: ["rain", "train", "paint"], end: ["day", "play", "stay"],
  },
  {
    id: "oa-ow", theme: "sea", first: "oa", second: "ow", sound: "both say  long O",
    icon: "\u{1F6A4}", mid: ["boat", "coat", "road"], end: ["snow", "grow", "show"],
  },
  {
    id: "oi-oy", theme: "party", first: "oi", second: "oy", sound: "both say  oy",
    icon: "\u{1F3B2}", mid: ["coin", "boil", "point"], end: ["boy", "toy", "joy"],
  },
  {
    id: "ou-ow", theme: "sky", first: "ou", second: "ow", sound: "both say  ow",
    icon: "\u{2601}", mid: ["cloud", "house", "mouth"], end: ["cow", "now", "how"],
    // ow is the one spelling here that carries a second sound, so the short says so
    caution: { text: "ow can also say  long O", word: "snow" },
  },
];
