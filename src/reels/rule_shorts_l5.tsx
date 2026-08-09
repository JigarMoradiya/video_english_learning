import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Watermark } from "../components/Watermark";
import { EndCard } from "../components/EndCard";
import {
  Band, Beat, Dots, H, Line, Pic, Row, RulePill, S, Stack, Stamp, Theme, THEMES, Tile, Word,
} from "../components/RuleShorts";

// ── REELS · the last four Level 5 rules · 9:16 ──────────────────────────────
//   ng · nk · x · w      (double and c/k/ck already ship as their own reels)
//
// Silent, like their two sisters. One component drives all four so that alignment,
// timing and spacing are IDENTICAL across the set — the four differ only in world and
// in content, which is what makes them read as a series rather than as four attempts.
//
// Every beat is: a full-width BAND, and one centred COLUMN of content inside it. There
// is no hand-placed element anywhere in this file, so nothing can overlap anything.
//
// Each rule carries the three things a rule short has to carry:
//   ① what the rule IS      ② words it works on      ③ what it is NOT
//
// The `w` reel is deliberately hedged. w+a says /o/ in want, wash, watch, swan and wand
// but NOT in wag — so it is taught as a family to try first and then check, never as a
// rule that always fires. Teaching it as absolute would be teaching something false.

export const RULE_SHORT_DURATION = S(38);
const T_TITLE = S(3.5);
const T_WORDS = S(6.3);
const T_NOT = S(16.9);
const T_EXTRA = S(23.2);
const RECAP = S(29.6);
const END = S(33.2);

const CUES: [number, string, number][] = [
  [S(1.4), "boing", 0.34],
  [S(3.6), "chime_soft", 0.26],
  [S(6.5), "pop", 0.30], [S(8.5), "pop", 0.30], [S(10.5), "pop", 0.30],
  [S(12.5), "pop", 0.30], [S(14.5), "pop", 0.30],
  [S(17.1), "question", 0.28], [S(19.6), "drop", 0.26], [S(21.4), "correct", 0.28],
  [S(23.4), "whoosh", 0.30],
  [S(29.8), "sparkle", 0.34],
];

// Lifted off centre on purpose. In a feed the bottom of a 9:16 frame carries the profile
// name, the caption and the action buttons, so a lesson centred in the frame is centred
// under someone else's UI.
const BAND_TOP = Math.round(H * 0.165);
const BAND_H = Math.round(H * 0.545);

type Cfg = {
  theme: Theme;
  pill: string;
  hook: { word: string; end?: string; hi?: string };
  big: string;
  sub: string;
  words: string[];
  /** a picture per word — app artwork where the lessons have it, emoji otherwise */
  pics: Record<string, string>;
  end?: string;
  hi?: string;
  /** the NOT beat — what the rule is not, which every one of these has */
  notIcon: string;
  notLead: string;
  notBad: string;
  notGood: string;
  notTail: string;
  extra: React.FC<{ t: Theme; at: number }>;
  recap: [string, string][];
  endSub: string;
};

const RuleShort: React.FC<{ cfg: Cfg }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const t = cfg.theme;
  const { Bg } = t;
  const wi = Math.floor((frame - T_WORDS) / S(2.0));

  return (
    <AbsoluteFill>
      <Bg />
      {CUES.map(([at, file, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
        </Sequence>
      ))}

      {frame < END && <RulePill t={t} text={cfg.pill} />}

      {/* ① HOOK — the rule happens before it is named */}
      <Beat from={0} to={T_TITLE}>
        <Band color={t.band[0]} top={BAND_TOP} height={BAND_H} at={S(0.1)} skew={-3} />
        <Stack top={BAND_TOP} height={BAND_H} gap={34}>
          <Pic src={cfg.pics[cfg.hook.word]} size={330} at={S(0.15)} />
          <Word t={t} text={cfg.hook.word} end={cfg.hook.end} hi={cfg.hook.hi} size={168} at={S(0.5)} />
          <Line t={t} text={cfg.sub} size={58} at={S(1.9)} color={t.a} />
        </Stack>
      </Beat>

      {/* ② WHAT IT IS */}
      <Beat from={T_TITLE} to={T_WORDS}>
        <Band color={t.band[1]} top={BAND_TOP} height={BAND_H} at={T_TITLE + 2} skew={-4} />
        <Stack top={BAND_TOP} height={BAND_H} gap={34}>
          <Line t={t} text={cfg.big} size={210} at={T_TITLE + 2} color={t.a} />
          <Line t={t} text={cfg.sub} size={72} at={T_TITLE + 8} />
        </Stack>
      </Beat>

      {/* ③ WORDS IT WORKS ON */}
      <Beat from={T_WORDS} to={T_NOT}>
        <Band color={t.band[0]} top={BAND_TOP} height={BAND_H} at={T_WORDS + 2} skew={-2} />
        <Stack top={BAND_TOP} height={BAND_H} gap={30}>
          <Line t={t} text="READ THESE" size={54} at={T_WORDS + 2} color={t.b} icon={"\u{1F440}"} />
          {wi >= 0 && wi < cfg.words.length && (
            <React.Fragment key={cfg.words[wi]}>
              <Pic src={cfg.pics[cfg.words[wi]]} size={330} at={T_WORDS + wi * S(2.0)} seed={wi} />
              <Word t={t} text={cfg.words[wi]} end={cfg.end} hi={cfg.hi}
                size={170} at={T_WORDS + wi * S(2.0) + 4} />
            </React.Fragment>
          )}
        </Stack>
        <Dots t={t} total={cfg.words.length} on={Math.max(0, Math.min(cfg.words.length - 1, wi))} y={H * 0.735} />
      </Beat>

      {/* ④ WHAT IT IS NOT — every rule short carries this */}
      <Beat from={T_NOT} to={T_EXTRA}>
        <Band color={t.band[2]} top={BAND_TOP} height={BAND_H} at={T_NOT + 2} skew={3} />
        <Stack top={BAND_TOP} height={BAND_H} gap={30}>
          <Line t={t} text={cfg.notLead} size={58} at={T_NOT + 2} color={t.bad} icon={cfg.notIcon} />
          <Row gap={26}>
            <Word t={t} text={cfg.notBad} size={132} at={T_NOT + 6} dim />
            <Stamp t={t} kind="no" at={T_NOT + 14} size={116} />
          </Row>
          <Row gap={22}>
            {cfg.pics[cfg.notGood] && <Pic src={cfg.pics[cfg.notGood]} size={168} at={T_NOT + 38} seed={4} />}
            <Word t={t} text={cfg.notGood} end={cfg.end} hi={cfg.hi} size={132} at={T_NOT + 40} />
            <Stamp t={t} kind="yes" at={T_NOT + 48} size={116} />
          </Row>
          <Line t={t} text={cfg.notTail} size={52} at={T_NOT + 58} color={t.good} />
        </Stack>
      </Beat>

      {/* ⑤ the part of the rule the words alone cannot show */}
      <Beat from={T_EXTRA} to={RECAP}>
        <Band color={t.band[1]} top={BAND_TOP} height={BAND_H} at={T_EXTRA + 2} skew={-3} />
        <Stack top={BAND_TOP} height={BAND_H} gap={34}>
          <cfg.extra t={t} at={T_EXTRA + 4} />
        </Stack>
      </Beat>

      {/* ⑥ REMEMBER */}
      <Beat from={RECAP} to={END}>
        <Band color={t.band[0]} top={BAND_TOP} height={BAND_H} at={RECAP + 2} skew={-2} />
        <Stack top={BAND_TOP} height={BAND_H} gap={26}>
          <Line t={t} text="REMEMBER" size={72} at={RECAP + 2} color={t.b} icon={"\u{1F9E0}"} />
          {cfg.recap.map(([n, text], i) => (
            <Row key={n} gap={20}>
              <Tile t={t} ch={n} size={72} at={RECAP + 4 + i * 4} tone="a" />
              <Line t={t} text={text} size={52} at={RECAP + 5 + i * 4} />
            </Row>
          ))}
        </Stack>
      </Beat>

      {/* ⑦ DOWNLOAD */}
      <Beat from={END} to={RULE_SHORT_DURATION}>
        <EndCard at={END + 3} sub={cfg.endSub} bg={t.a} ink="#141414" />
      </Beat>

      {frame < END && <Watermark corner="tr" widthFrac={0.19} pad={54} opacity={0.9} />}
    </AbsoluteFill>
  );
};

// ── ng ──────────────────────────────────────────────────────────────────────
const NG: Cfg = {
  theme: THEMES.chalk,
  pill: "n + g  =  ONE SOUND",
  hook: { word: "sing", end: "ng" },
  big: "ng", sub: "ONE SOUND, NOT TWO",
  words: ["sing", "ring", "king", "long", "sung"], end: "ng",
  pics: {
    sing: "\u{1F3A4}", ring: "\u{1F48D}", king: "img/p2/king.png",
    long: "img/p2/snake.png", sung: "\u{1F3B5}", "n g": "\u{1F3A4}",
  },
  notIcon: "\u{1F6AB}",
  notLead: "NOT  /n/  THEN  /g/",
  notBad: "n g", notGood: "sing",
  notTail: "THEY JOIN INTO ONE SOUND",
  extra: ({ t, at }) => (
    <>
      <Line t={t} text="THE VOWEL BEFORE IT" size={58} at={at} color={t.b} icon={"\u{1F524}"} />
      <Row gap={22}>
        <Word t={t} text="sing" hi="i" size={128} at={at + 4} />
      </Row>
      <Line t={t} text="IS A SHORT VOWEL" size={62} at={at + 14} color={t.a} />
    </>
  ),
  recap: [["1", "AT THE END OF A WORD"], ["2", "ONE SOUND  /ng/"], ["3", "SHORT VOWEL BEFORE"]],
  endSub: "More spelling rules inside",
};

// ── nk ──────────────────────────────────────────────────────────────────────
const NK: Cfg = {
  theme: THEMES.blueprint,
  pill: "n + k  =  /ng/  +  /k/",
  hook: { word: "bank", end: "nk" },
  big: "nk", sub: "A  /k/  JOINS ON THE END",
  words: ["bank", "pink", "sink", "junk", "thank"], end: "nk",
  pics: {
    bank: "\u{1F3E6}", pink: "\u{1F338}", sink: "\u{1F6B0}",
    junk: "\u{1F5D1}", thank: "\u{1F64F}", ring: "\u{1F48D}", rink: "\u{26F8}",
  },
  notIcon: "\u{1F442}",
  notLead: "HEAR A  /k/  AT THE END ?",
  notBad: "ring", notGood: "rink",
  notTail: "IF YOU HEAR IT, WRITE  nk",
  extra: ({ t, at }) => (
    <>
      <Line t={t} text="SAME SOUND AS" size={56} at={at} color={t.b} icon={"\u{1F50A}"} />
      <Row gap={22}>
        <Tile t={t} ch="ng" size={148} at={at + 4} tone="b" />
        <Line t={t} text="+" size={86} at={at + 8} />
        <Tile t={t} ch="k" size={148} at={at + 12} tone="a" glow />
      </Row>
      <Line t={t} text="THAT  /k/  IS THE DIFFERENCE" size={52} at={at + 18} color={t.a} />
    </>
  ),
  recap: [["1", "AT THE END OF A WORD"], ["2", "/ng/  PLUS  /k/"], ["3", "SHORT VOWEL BEFORE"]],
  endSub: "More spelling rules inside",
};

// ── x ───────────────────────────────────────────────────────────────────────
const X: Cfg = {
  theme: THEMES.neon,
  pill: "x  =  TWO SOUNDS",
  hook: { word: "fox", end: "x" },
  big: "x", sub: "ONE LETTER, TWO SOUNDS",
  words: ["fox", "box", "six", "mix", "wax"], end: "x",
  pics: {
    fox: "img/p3/fox.png", box: "\u{1F4E6}", six: "\u{1F3B2}",
    mix: "\u{1F963}", wax: "\u{1F56F}", foxx: "img/p3/fox.png",
  },
  notIcon: "\u{1F6AB}",
  notLead: "NEVER DOUBLE IT",
  notBad: "foxx", notGood: "fox",
  notTail: "ONE  x  IS ALWAYS ENOUGH",
  extra: ({ t, at }) => (
    <>
      <Line t={t} text="x  SAYS" size={62} at={at} color={t.b} icon={"\u{1F50A}"} />
      <Row gap={22}>
        <Tile t={t} ch="/k/" size={148} at={at + 4} tone="a" glow />
        <Line t={t} text="+" size={86} at={at + 8} />
        <Tile t={t} ch="/s/" size={148} at={at + 12} tone="b" glow />
      </Row>
      <Line t={t} text="SAY THEM FAST:  /ks/" size={58} at={at + 18} color={t.a} />
    </>
  ),
  recap: [["1", "ONE LETTER"], ["2", "TWO SOUNDS  /ks/"], ["3", "NEVER DOUBLED"]],
  endSub: "More spelling rules inside",
};

// ── w ───────────────────────────────────────────────────────────────────────
const WRULE: Cfg = {
  theme: THEMES.papercut,
  pill: "w  CHANGES  THE  a",
  hook: { word: "want", hi: "a" },
  big: "w + a", sub: "THE  a  SAYS  /o/",
  words: ["want", "wash", "watch", "swan", "wand"], hi: "a",
  pics: {
    want: "\u{1F381}", wash: "\u{1F9FC}", watch: "img/p3/watch.png",
    swan: "img/p3/swan.png", wand: "img/p3/wand.png", wag: "\u{1F415}",
  },
  notIcon: "\u{2757}",
  notLead: "BUT NOT EVERY TIME",
  notBad: "wag", notGood: "want",
  notTail: "TRY  /o/  FIRST, THEN  /a/",
  extra: ({ t, at }) => (
    <>
      <Line t={t} text="WHAT GOOD READERS DO" size={62} at={at} color={t.b} icon={"\u{1F4A1}"} />
      <Row gap={20}>
        <Tile t={t} ch="w" size={132} at={at + 4} tone="a" />
        <Tile t={t} ch="a" size={132} at={at + 8} tone="b" />
        <Line t={t} text="→" size={78} at={at + 12} />
        <Tile t={t} ch="/o/" size={132} at={at + 16} tone="a" />
      </Row>
      <Line t={t} text={"IS IT A REAL WORD ?\nIF NOT, TRY  /a/"} size={50} at={at + 22} color={t.ink} />
    </>
  ),
  recap: [["1", "LOOK FOR  w  BEFORE  a"], ["2", "TRY THE  /o/  SOUND"], ["3", "CHECK IT IS A REAL WORD"]],
  endSub: "More spelling rules inside",
};

export const RuleNgReel: React.FC = () => <RuleShort cfg={NG} />;
export const RuleNkReel: React.FC = () => <RuleShort cfg={NK} />;
export const RuleXReel: React.FC = () => <RuleShort cfg={X} />;
export const RuleWReel: React.FC = () => <RuleShort cfg={WRULE} />;
