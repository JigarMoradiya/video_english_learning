import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { comparisons } from "../data/comparisons";
import { ReelBase, SfxCue } from "./ReelBase";
import { CkBackground } from "../components/CkBackground";
import { OoWorld } from "../components/OoWorld";
import { Captions } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { makeTrack, planBeats, BeatSpec, Beat, TPhrase } from "../lib/timing";
import ooPhrases from "../data/oo.timing.json";
import { Hook, Tricky, Strategy, Hint, Caveat, Quiz2, Remember2, Wrap2 } from "./oo_beats";

// ── oo reel (L13 · "Which SOUND?") — "moon 🌙 or book 📖" ────────────────────
// 16:9 (1920×1080) long-form lesson, DATA-DRIVEN from src/data/oo.timing.json
// (public/audio/oo/oo.mp3, 114.29s). One spelling, two sounds, NO reliable rule —
// teaches "try both + trust your ears" (see feedback_no_false_rules).

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
export const OO_DURATION = track.totalFrames;

// caption keyword colours: long words indigo 🌙, short words orange 📖 (bare "oo" stays
// neutral — it's in every line, so colouring it would just add noise).
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
  ...[385, 422, 453, 677, 713, 745, 1961, 2012, 2057, 2098, 2227, 2268, 2317, 2367].map((from) => ({ from, name: "pop", vol: 0.34 })), // docked words (long/short intro + see-it)
  { from: 807, name: "question", vol: 0.5 }, // tricky "?"
  { from: 1149, name: "sparkle", vol: 0.4 }, // strategy: short ✓
  { from: 1398, name: "pop", vol: 0.4 }, // hint chips
  { from: 1440, name: "pop", vol: 0.4 },
  { from: 1484, name: "pop", vol: 0.4 },
  { from: 2560, name: "drumroll", vol: 0.35, dur: 70 }, // quiz suspense
  { from: 2630, name: "correct", vol: 0.6 }, // "It's short — good!"
  { from: 2818, name: "tick", vol: 0.4 }, // remember long card
  { from: 2978, name: "tick", vol: 0.4 }, // remember short card
  { from: 3215, name: "whoosh", vol: 0.5 }, // logo
  { from: 3260, name: "pop", vol: 0.45 }, // badges
];

const overlayFor = (b: Beat): React.ReactNode => {
  const data = comparisons.oo;
  switch (b.id) {
    case "hook":
      return <Hook data={data} beat={b} />;
    case "tricky":
      return <Tricky data={data} beat={b} />;
    case "strategy":
      return <Strategy data={data} beat={b} />;
    case "hint":
      return <Hint data={data} beat={b} />;
    case "caveat":
      return <Caveat data={data} beat={b} />;
    case "remember":
      return <Remember2 data={data} beat={b} />;
    case "wrap":
      return <Wrap2 data={data} beat={b} />;
    default:
      return null; // long/short intros are carried by the OoWorld set
  }
};

export const OoReel: React.FC = () => {
  const { width: _w, height: _h } = useVideoConfig();
  // maxWidth 1360 is wider than a 1080 frame, so in the 4:5 cut a long caption had no side
  // margin at all. The 16:9 keeps its own numbers.
  const portrait = _h > _w;
  const data = comparisons.oo;
  const quiz = byId.quizQ;
  const reveal = byId.reveal;
  const quizRevealAt = reveal.from - quiz.from;

  return (
    <ReelBase audio="audio/oo/oo.mp3" hueShift={data.hueShift} sfx={SFX} total={OO_DURATION} background={<CkBackground hueShift={data.hueShift} />} logoUntil={byId.wrap.from} logoCorner="bl">
      {/* persistent split moon/book world + captions (top-level = absolute frame) */}
      <OoWorld data={data} beats={beats} />
      <Sequence from={0} durationInFrames={byId.wrap.from}>
        <Captions track={track} keywordColor={ooKeywordColor} maxWidth={portrait ? 950 : 1360} fontSize={portrait ? 36 : 40} bottom={portrait ? 96 : 70} />
      </Sequence>

      {beats.map((b) => {
        if (b.id === "reveal") return null; // folded into the quiz span
        if (b.id === "wrap") {
          // download visual over the existing narrated CTA line (no new audio)
          return (
            <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
              <StoreOutro silent compact total={b.durationInFrames} />
            </Sequence>
          );
        }
        if (b.id === "quizQ") {
          return (
            <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames + reveal.durationInFrames}>
              <Quiz2 data={data} beat={b} revealAt={quizRevealAt} />
            </Sequence>
          );
        }
        return (
          <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
            {overlayFor(b)}
          </Sequence>
        );
      })}
    </ReelBase>
  );
};
