import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { comparisons } from "../data/comparisons";
import { OoWorldPortrait, OO_NIGHT } from "../components/OoWorldPortrait";
import { Captions } from "../components/Captions";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { Watermark } from "../components/Watermark";
import { makeTrack, planBeats, BeatSpec, Beat, TPhrase } from "../lib/timing";
import ooPhrases from "../data/oo.timing.json";
import { PHook, PTricky, PStrategy, PHint, PCaveat, PQuiz, PRemember } from "./oo_portrait_beats";
import { font } from "../data/tokens";
import { SfxCue } from "./ReelBase";

// ── oo · 9:16 cut (L13 "Which SOUND?") ───────────────────────────────────────
// SAME narration and timing track as the 16:9 lesson (public/audio/oo/oo.mp3,
// 114.29s) — this is a re-visualisation, not new content, exactly the relationship
// short_vowels_9x16 has to short_vowels.
//
// What is deliberately DIFFERENT from the 16:9:
//   · the moon/book split runs TOP/BOTTOM with a glowing horizon, not left/right
//     (two thin columns don't work in a tall frame)
//   · explanation beats take centre stage with the world dimmed behind, because
//     both halves are occupied and overlapping them is forbidden
//   · it ends on StoreOutroPortrait — the 16:9 uses the landscape StoreOutro
//
// One spelling, two sounds, NO reliable rule — teaches "try both, trust your
// ears" (see feedback_no_false_rules). The hint beat is explicitly framed as a
// tendency and the caveat beat contradicts it on purpose.

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 1 },
  { id: "long", from: 2, to: 3 },
  { id: "short", from: 4, to: 5 },
  { id: "tricky", from: 6, to: 7 },
  { id: "strategy", from: 8, to: 9 },
  { id: "hint", from: 10, to: 12 },
  { id: "caveat", from: 13, to: 15 },
  { id: "seeIt", from: 16, to: 18 },
  { id: "quizQ", from: 19, to: 20 },
  { id: "reveal", from: 21, to: 22 },
  { id: "remember", from: 23, to: 25 },
  { id: "wrap", from: 26, to: 27 },
];

const track = makeTrack(ooPhrases as unknown as TPhrase[], 114.286);
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));

// The narrated CTA is the last beat, but the portrait store outro is longer than
// that beat (it plays the full phone flow), so the reel runs past the narration.
const WRAP_FROM = byId.wrap.from;
export const OO_PORTRAIT_DURATION = WRAP_FROM + STORE_OUTRO_PORTRAIT_F;

const MOON = "#5E35B1";
const BOOK = "#E65100";
const OO_KW: Record<string, string> = {
  long: MOON, moon: MOON, zoo: MOON, food: MOON, spoon: MOON, pool: MOON, room: MOON, tooth: MOON, school: MOON,
  short: BOOK, book: BOOK, good: BOOK, foot: BOOK, wood: BOOK, cook: BOOK, look: BOOK, hook: BOOK, took: BOOK,
};
const ooKeywordColor = (raw: string): string | null => {
  const n = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n === "oo") return null;
  return OO_KW[n] ?? null;
};

const SFX: SfxCue[] = [
  ...[385, 422, 453, 677, 713, 745, 1961, 2012, 2057, 2098, 2227, 2268, 2317, 2367].map((from) => ({ from, name: "pop", vol: 0.3 })),
  { from: 807, name: "question", vol: 0.45 },
  { from: 1149, name: "sparkle", vol: 0.36 },
  ...[1398, 1440, 1484].map((from) => ({ from, name: "pop", vol: 0.36 })),
  { from: 2560, name: "drumroll", vol: 0.32, dur: 70 },
  { from: 2630, name: "correct", vol: 0.55 },
  { from: 2818, name: "tick", vol: 0.36 },
  { from: 2978, name: "tick", vol: 0.36 },
  { from: WRAP_FROM + 8, name: "chime_soft", vol: 0.34 },
];

// The world stays bright while words are docking into it; it dims to a backdrop
// during the beats whose content takes centre stage.
const CENTRE_STAGE = new Set(["tricky", "strategy", "hint", "caveat", "remember"]);
const activeBeatId = (f: number): string => {
  let id = "hook";
  for (const b of beats) if (f >= b.from) id = b.id;
  return id;
};

// The world fades out at the quiz, and the base under it is NIGHT — so the quiz
// and remember beats, whose text is palette.ink like the 16:9 original, were dark
// on dark and nearly unreadable. This light stage cross-fades in as the world
// leaves, giving those beats the bright backdrop the landscape cut gets for free.
const StageLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const q = byId.quizQ.from;
  const o = interpolate(frame, [q - 14, q + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0.01) return null;
  return (
    <AbsoluteFill style={{ opacity: o, background: "linear-gradient(180deg, #FFF6E6 0%, #FFE9CF 46%, #FFDCAE 100%)" }} />
  );
};

const WorldLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const id = activeBeatId(frame);
  const bare = CENTRE_STAGE.has(id);
  return <OoWorldPortrait data={comparisons.oo} beats={beats} dim={bare ? 0.55 : 1} showCast={!bare} />;
};

const overlayFor = (b: Beat): React.ReactNode => {
  const data = comparisons.oo;
  switch (b.id) {
    case "hook": return <PHook data={data} beat={b} />;
    case "tricky": return <PTricky data={data} beat={b} />;
    case "strategy": return <PStrategy data={data} beat={b} />;
    case "hint": return <PHint data={data} beat={b} />;
    case "caveat": return <PCaveat data={data} beat={b} />;
    case "remember": return <PRemember data={data} beat={b} />;
    default: return null; // long/short are carried by the world docking words
  }
};

export const OoPortraitReel: React.FC = () => {
  const data = comparisons.oo;
  const quiz = byId.quizQ;
  const reveal = byId.reveal;
  const quizRevealAt = reveal.from - quiz.from;

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#171436" }}>
      {/* base colour under everything so a gap can never flash white */}
      <AbsoluteFill style={{ background: OO_NIGHT }} />

      <Audio src={staticFile("audio/oo/oo.mp3")} />
      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(f) => interpolate(f, [0, 20, OO_PORTRAIT_DURATION - 40, OO_PORTRAIT_DURATION], [0, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur ?? 45}>
          <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}

      {/* persistent world — top-level so it reads the ABSOLUTE frame and its stars
          never restart at a beat cut */}
      <WorldLayer />
      <StageLayer />

      {beats.map((b) => {
        if (b.id === "reveal") return null; // folded into the quiz span
        if (b.id === "wrap") return null; // the portrait store outro covers it
        if (b.id === "quizQ") {
          return (
            <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames + reveal.durationInFrames}>
              <PQuiz data={data} beat={b} revealAt={quizRevealAt} />
            </Sequence>
          );
        }
        return (
          <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
            {overlayFor(b)}
          </Sequence>
        );
      })}

      {/* captions sit above the platform UI band */}
      <Sequence from={0} durationInFrames={WRAP_FROM}>
        <Captions track={track} keywordColor={ooKeywordColor} maxWidth={900} fontSize={34} bottom={272} />
      </Sequence>

      {/* the narrated CTA line plays over the phone flow — no new audio */}
      <Sequence from={WRAP_FROM} durationInFrames={STORE_OUTRO_PORTRAIT_F}>
        <StoreOutroPortrait />
      </Sequence>

      {/* one logo, and it steps aside for the store outro's app icon */}
      <Sequence from={0} durationInFrames={WRAP_FROM}>
        <Watermark corner="tr" widthFrac={0.13} opacity={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
