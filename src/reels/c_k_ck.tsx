import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { comparisons } from "../data/comparisons";
import { ReelBase, SfxCue } from "./ReelBase";
import { ShopWall } from "../components/KeyShop";
import { WordStreet } from "../components/WordStreet";
import { Captions } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { StoreOutroPortrait } from "../components/StoreOutroPortrait";
import { makeTrack, planBeats, BeatSpec, Beat } from "../lib/timing";

// c/k/ck keeps its richer caption palette (adds the /k/ and /s/ phoneme colours + city),
// so it passes its own keywordColor rather than the auto per-card one.
const CK_KEYWORDS: Record<string, string> = {
  c: "#1E88E5", cat: "#1E88E5", cot: "#1E88E5", cup: "#1E88E5", corn: "#1E88E5", cab: "#1E88E5", cut: "#1E88E5",
  k: "#8E24AA", key: "#8E24AA", kit: "#8E24AA", king: "#8E24AA", kite: "#8E24AA", kid: "#8E24AA", kiss: "#8E24AA",
  ck: "#F57C00", duck: "#F57C00", rock: "#F57C00", kick: "#F57C00", sock: "#F57C00", back: "#F57C00", neck: "#F57C00",
  city: "#E53935",
};
const ckKeywordColor = (raw: string): string | null => {
  if (raw.includes("/k/")) return "#2E7D32";
  if (raw.includes("/s/")) return "#E53935";
  return CK_KEYWORDS[raw.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? null;
};
import { Hook, ThreeOne, SameTag, Puzzle, RuleC, RuleK, RuleCK, SeeIt3, Quiz3, Recap3, Wrap3 } from "./c_k_ck_beats";

// ── c/k/ck reel (L5 · Short Vowel Rules → "-ck Rule") ────────────────────────
// "Meet the /k/ Crew" — a 16:9 (1920×1080) long-form YouTube teaching video,
// synced to public/audio/c_k_ck.mp3 (139.08s). Beats + word-hits are DATA-DRIVEN
// from src/data/c_k_ck.timing.json (see src/lib/timing.ts), not hand-counted.

// phrase-index ranges → beats (inclusive). See the timing JSON for the phrasing.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 1 },
  { id: "three", from: 2, to: 4 },
  { id: "same", from: 5, to: 9 },
  { id: "puzzle", from: 10, to: 11 },
  { id: "ruleC", from: 12, to: 13 },
  { id: "ruleK", from: 14, to: 16 },
  { id: "ruleCK", from: 17, to: 18 },
  { id: "seeIt", from: 19, to: 22 },
  { id: "quizQ", from: 23, to: 25 },
  { id: "reveal", from: 26, to: 26 },
  { id: "recap", from: 27, to: 30 },
  { id: "wrap", from: 31, to: 31 },
];

const track = makeTrack();
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));

export const C_K_CK_DURATION = track.totalFrames;

// Abstract SFX only — the narration already speaks every word + phoneme (/k/, /s/,
// "city"), so NO phoneme/word audio is layered (would echo). Frames = round(sec*30).
const DOCK_POPS = [419, 482, 549, 1223, 1277, 1325, 1847, 1933, 1993, 2372, 2423, 2489, 2681, 2713, 2764, 2851, 2889, 2912, 3023, 3051, 3092];
const SFX: SfxCue[] = [
  ...DOCK_POPS.map((from) => ({ from, name: "pop", vol: 0.36 })),
  { from: 167, name: "boing", vol: 0.5 }, // /k/ badge pops
  { from: 264, name: "sparkle", vol: 0.45 }, // "one sound!"
  { from: 608, name: "tick", vol: 0.4 }, // /k/ /k/ /k/
  { from: 637, name: "tick", vol: 0.4 },
  { from: 652, name: "tick", vol: 0.4 },
  { from: 869, name: "question", vol: 0.5 }, // "which one?"
  { from: 1539, name: "sparkle", vol: 0.4 }, // soft-c "city" callout
  { from: 1648, name: "whoosh", vol: 0.55 }, // k dashes in
  { from: 3157, name: "question", vol: 0.5 }, // quiz "your turn"
  { from: 3360, name: "drumroll", vol: 0.35, dur: 72 }, // suspense into reveal
  { from: 3435, name: "correct", vol: 0.6 }, // "It's ck!"
  { from: 3600, name: "tick", vol: 0.4 }, // recap c
  { from: 3707, name: "tick", vol: 0.4 }, // recap k
  { from: 3787, name: "tick", vol: 0.4 }, // recap ck
  { from: 3994, name: "whoosh", vol: 0.5 }, // logo
  { from: 4040, name: "pop", vol: 0.4 }, // badges
];

const overlayFor = (b: Beat, data: typeof comparisons.c_k_ck): React.ReactNode => {
  switch (b.id) {
    case "hook":
      return <Hook data={data} beat={b} />;
    case "three":
      return <ThreeOne data={data} beat={b} />;
    case "same":
      return <SameTag data={data} beat={b} />;
    case "puzzle":
      return <Puzzle data={data} beat={b} />;
    case "ruleC":
      return <RuleC data={data} beat={b} />;
    case "ruleK":
      return <RuleK data={data} beat={b} />;
    case "ruleCK":
      return <RuleCK data={data} beat={b} />;
    case "seeIt":
      return <SeeIt3 data={data} beat={b} />;
    case "recap":
      return <Recap3 data={data} beat={b} />;
    case "wrap":
      return <Wrap3 data={data} beat={b} />;
    default:
      return null;
  }
};

export const CkCkReel: React.FC = () => {
  const data = comparisons.c_k_ck;
  const quiz = byId.quizQ;
  const reveal = byId.reveal;
  const quizRevealAt = reveal.from - quiz.from; // reveal flip, relative to quiz start
  // 4:5 for Facebook. The three cards side by side ARE the teaching — stacking them
  // would break the very comparison the video exists to make — and the row needs 1340px,
  // so the stage is fitted to the width instead and the height it frees goes to the
  // shop. Content ends up filling 96% of the width against 70% in the 16:9, so it reads
  // LARGER on a phone, not smaller. Every gap and alignment inside the stage is
  // preserved exactly, which is what makes an overlap impossible.
  const { width: FW, height: FH } = useVideoConfig();
  const portrait = FH > FW;
  const wrapBeat = beats.find((b) => b.id === "wrap");
  // 4:5 for Facebook. The three cards side by side ARE the teaching — stacking them
  // would break the comparison the video exists to make — and the beats are flex rows,
  // so the cards already shrink to fit 1080 on their own. No scaling is needed or wanted:
  // scaling about the top-left pulled the children's centre from 540 to 416 and the whole
  // video sat left-aligned with dead space down the right. All that is required is to
  // centre the 1080-tall design in the taller frame; the shop fills the height it frees.
  const stageStyle: React.CSSProperties = portrait
    ? { position: "absolute", left: 0, top: 0, width: FW, height: 1080,
        // 0.94 about the CENTRE (never the top-left — that pulls the children's 540
        // centre to 416 and the whole video sits left-aligned). Flex already shrinks the
        // three cards to fit 1080, but only ~55px from each edge where the 16:9 has 290;
        // this buys a real side margin out of the height the taller frame gives us.
        transform: `translateY(${(FH - 1080) / 2}px) scale(0.94)`, transformOrigin: "50% 50%" }
    : { position: "absolute", inset: 0 };

  // the short-vowel underline appears only when "short vowel" is spoken (after "It's ck —")
  const quizUnderlineAt = Math.max(0, track.wordAbs("vowel", { afterSec: 115 }) - quiz.from);

  return (
    <ReelBase
      audio="audio/c_k_ck/c_k_ck.mp3"
      hueShift={data.hueShift}
      sfx={SFX}
      total={C_K_CK_DURATION}
      // THE KEY SHOP — /k/ is "key", and three keys opening one lock IS the rule
      background={<ShopWall />}
      logoUntil={byId.wrap.from}
      logoCorner="tr"
    >
      {/* persistent set — inside the stage so it scales with the cards */}
      <div style={stageStyle}>
        <WordStreet data={data} beats={beats} />
      </div>
      {/* captions stay OUTSIDE the stage: they belong to the frame, not the teaching
          area, and must sit at the real bottom in either aspect */}
      <Sequence from={0} durationInFrames={byId.wrap.from}>
        <Captions track={track} keywordColor={ckKeywordColor} maxWidth={portrait ? 940 : 1360} fontSize={portrait ? 34 : 40} bottom={portrait ? 150 : 70} />
      </Sequence>

      {/* per-beat foreground overlays, inside the fitted stage */}
      <div style={stageStyle}>
      {beats.map((b) => {
        if (b.id === "reveal") return null; // folded into the quiz span
        // the download beat is rendered OUTSIDE this wrapper — see below
        if (b.id === "wrap") return null;
        if (b.id === "quizQ") {
          return (
            <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames + reveal.durationInFrames}>
              <Quiz3 data={data} beat={b} revealAt={quizRevealAt} underlineAt={quizUnderlineAt} />
            </Sequence>
          );
        }
        return (
          <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
            {overlayFor(b, data)}
          </Sequence>
        );
      })}
      </div>

      {/* The download beat sits OUTSIDE the fitted stage — it belongs to the frame, not
          to the teaching area. Rendered inside it, the 0.94 scale plus the stage's own
          translate pushed the two store badges to y1387 in a 1350-tall frame and sliced
          them in half. 4:5 also gets the PORTRAIT outro: the landscape one lays the phone
          on the left with the CTA beside it, so in a 1080-wide frame the text ran clean
          off the right edge — the same bug short_vowels 4:5 shipped with. bg stays
          undefined so the Key Shop keeps running underneath and the download section
          isn't a jump cut to another background. */}
      {wrapBeat && (
        <Sequence from={wrapBeat.from} durationInFrames={wrapBeat.durationInFrames}>
          {portrait ? <StoreOutroPortrait /> : <StoreOutro silent compact total={wrapBeat.durationInFrames} />}
        </Sequence>
      )}
    </ReelBase>
  );
};
