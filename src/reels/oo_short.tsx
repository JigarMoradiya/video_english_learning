import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../components/Watermark";
import { EndCard } from "../components/EndCard";
import {
  Beat, Icon, Mark, Pill, Plate, RuleBadge, Stack, Tag, THEMES, Tile, Title, Word,
} from "../components/Shorts";

// ── SHORT · oo has TWO sounds · 9:16 ─────────────────────────────────────────
//
// `oo` gets its own component because it has NO position rule. The other four shorts
// teach "first spelling in the middle, second at the end", which is true of every word
// they use. There is no equivalent for oo: `book` and `boot` are the same shape and
// different sounds, and inventing a rule to cover that would be teaching something false.
//
// So this one teaches the STRATEGY instead: oo says two things, try one, then the other,
// and keep whichever makes a real word. That is what a reader actually does.

const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
export const OO_SHORT_DURATION = S(36);
const END = S(31.6);

const LONG = ["moon", "food", "zoo"];
const SHORT = ["book", "look", "good"];

const CUES: [number, string, number][] = [
  [S(1.4), "chime_soft", 0.30],
  [S(4.0), "blend", 0.28],
  [S(7.4), "pop", 0.30], [S(9.2), "pop", 0.30], [S(11.0), "pop", 0.30],
  [S(14.2), "blend", 0.28],
  [S(15.6), "pop", 0.30], [S(17.4), "pop", 0.30], [S(19.2), "pop", 0.30],
  [S(22.4), "question", 0.28],
  [S(24.6), "correct", 0.28],
  [S(28.6), "sparkle", 0.32],
];

export const OoShort: React.FC = () => {
  const frame = useCurrentFrame();
  const t = THEMES.doors;
  const Bg = t.bg;

  const li = Math.floor((frame - S(7.3)) / S(1.8));
  const si = Math.floor((frame - S(15.5)) / S(1.8));

  return (
    <AbsoluteFill>
      <Bg />
      {CUES.map(([at, file, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
        </Sequence>
      ))}

      {frame < END && <RuleBadge t={t} text="oo  ·  two sounds" />}

      {/* ① HOOK */}
      <Beat from={0} to={S(4.0)}>
        <Stack gap={40}>
          <Icon glyph={"\u{1F440}"} at={S(0.2)} size={150} />
          <Plate t={t} at={S(0.8)}>
            <Tile ch="oo" size={200} color={t.a} at={S(0.8)} />
          </Plate>
          <Title text={"one spelling\nTWO sounds"} size={74} at={S(1.6)} color={t.ink} />
        </Stack>
      </Beat>

      {/* ② no rule — say so plainly */}
      <Beat from={S(4.0)} to={S(7.1)}>
        <Stack gap={40}>
          <Title text={"there is NO rule\nfor which one"} size={78} at={S(4.1)} color={t.ink} />
          <Pill text="so we TRY BOTH" color={t.a} size={60} at={S(5.0)} />
        </Stack>
      </Beat>

      {/* ③ the long sound */}
      <Beat from={S(7.1)} to={S(14.2)}>
        <Stack gap={38}>
          <Tag t={t} text="SOUND 1" at={S(7.15)} />
          <Pill text={"long  oo   like  moon"} color={t.b} size={58} at={S(7.2)} />
          {li >= 0 && li < LONG.length && (
            <Plate key={LONG[li]} t={t} at={S(7.3) + li * S(1.8)}>
              <Word text={LONG[li]} target="oo" color={t.b} size={140} at={S(7.3) + li * S(1.8)} />
            </Plate>
          )}
        </Stack>
      </Beat>

      {/* ④ the short sound */}
      <Beat from={S(14.2)} to={S(22.2)}>
        <Stack gap={38}>
          <Tag t={t} text="SOUND 2" at={S(14.25)} />
          <Pill text={"short  oo   like  book"} color={t.a} size={58} at={S(14.3)} />
          {si >= 0 && si < SHORT.length && (
            <Plate key={SHORT[si]} t={t} at={S(15.5) + si * S(1.8)}>
              <Word text={SHORT[si]} target="oo" color={t.a} size={140} at={S(15.5) + si * S(1.8)} />
            </Plate>
          )}
        </Stack>
      </Beat>

      {/* ⑤ the strategy — what a reader actually does */}
      <Beat from={S(22.2)} to={S(28.2)}>
        <Stack gap={30}>
          <Tag t={t} text="HOW TO READ IT" at={S(22.3)} />
          <Plate t={t} at={S(22.5)}>
            <Word text="book" target="oo" color={t.b} size={116} at={S(22.5)} />
          </Plate>
          <Pill text="try the LONG sound…" color={t.b} size={46} at={S(22.9)} />
          <Mark kind="no" at={S(23.6)} size={94} />
          <Pill text="…now the SHORT one" color={t.a} size={46} at={S(24.6)} />
          <Mark kind="yes" at={S(25.2)} size={94} />
        </Stack>
      </Beat>

      {/* ⑥ REMEMBER */}
      <Beat from={S(28.2)} to={END}>
        <Stack gap={28}>
          <Icon glyph={"\u{1F9E0}"} at={S(28.3)} size={116} />
          <Title text="REMEMBER" size={70} at={S(28.4)} color={t.ink} />
          <Pill text="oo says TWO things" color={t.a} size={52} at={S(28.7)} />
          <Pill text="try both — keep the real word" color={t.b} size={42} at={S(29.0)} />
        </Stack>
      </Beat>

      {/* ⑦ DOWNLOAD */}
      <Beat from={END} to={OO_SHORT_DURATION}>
        <EndCard at={END + 3} sub="More sounds inside" bg="rgba(255,255,255,0.94)" />
      </Beat>

      {frame < END && <Watermark corner="tr" widthFrac={0.19} pad={54} opacity={0.9} />}
    </AbsoluteFill>
  );
};
