import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LetterItem } from "../data/letters";
import { REC_LETTERS } from "../data/recognition";
import { LETTER_SHORT_EXTRAS, SHARED, Z_FINALE, nextLetterOf, phraseStartOf, praiseFor, ctaFor, SPOKEN_MORE, SPOKEN_WORDS, WORD_GAP, letterNameSrc } from "../data/letterShorts";
import { paperBgFor, PaperMotes, PaperClouds, LetterRail, PaperTitle, paperCard, ContactShadow } from "../components/PaperSky";
import { TraceGlyph } from "../components/TraceGlyph";
import { CollapseRow } from "../components/LettersPinkFx";
import { Confetti } from "../components/Confetti";
import { Mascot } from "../components/Mascot";
import { StoreFlow } from "../components/StoreFlow";
import { HeaderLogo, LogoBadge, CardBadge, badgeCorner } from "../components/BrandMarks";
import { sec } from "../lib/timing";
import { font, palette, letterColorFor, shade, hex, lum } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import imageColors from "../data/imageColors.json";
import extraWordAudio from "../data/extraWordAudio.json";
import { LETTER_ARTICULATION } from "../data/articulation";
import { PhonicsFace, mouthOpenAt } from "../components/PhonicsMouth";

// ══ A–Z LETTER SHORTS · one 9:16 Short per letter ════════════════════════════
// The series TEMPLATE. Everything reads from the LetterItem, so episode B..Z is
// one data row, not a new build.
//
// Five beats: cover → the letter draws itself → more words → your turn → next.
//
// The teaching beat plays the app clip WHOLE. That clip is
//   "<Letter> says <sound>×3.  <Letter> for <Word>.  <example phrase>."
// — the trailing phrase is real narration (A: "A tiny ant walks fast"), so it
// gets its own staged visual instead of sitting under a static card.

const FPS = 30;
const IMG_COLORS = imageColors as Record<string, string>;
const EXTRA_WORD_AUDIO = extraWordAudio as Record<string, number>;
const imgKey = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

const GAP = 26;
const BAND_TOP = 290;
const BAND_H = 1320;
const SIDE = 90;

// ── plan ─────────────────────────────────────────────────────────────────────
export interface ShortPlan {
  it: LetterItem;
  accent: string;
  trioDur: number;
  nameDur: number;
  audLead: number;
  gapF: number;
  isLast: boolean;
  tilesDoneAt: number;
  moreLead: number; nameAt: number; wordsAt: number; moreSpeechEnd: number;
  tileCues: { key: string; word: string; at: number; dur: number | null; slot: number }[];
  hookFrom: number; hookF: number;
  teachFrom: number; teachF: number;
  moreFrom: number; moreF: number;
  echoFrom: number; echoF: number;
  ctaFrom: number; ctaF: number;
  total: number;
}

export const planShort = (it: LetterItem): ShortPlan => {
  const rec = REC_LETTERS.find((r) => r.letter === it.letter)!;
  const trioDur = rec.d0 + rec.d1 + rec.d2;
  const nameDur = rec.d0; // the bare letter name, e.g. "A"
  const audLead = 6;
  const gapF = 54; // 1.8s of silence for the child to say it back

  const hookF = 16 + sec(trioDur, FPS) + 22;
  // FULL clip — never trimmed: the tail is the example phrase.
  const teachF = audLead + sec(it.durSec, FPS) + 18;

  // "More · <letter> · words" plays first, THEN the tiles cascade — the line
  // introduces the words rather than talking over them arriving.
  const moreLead = 8;
  const nameAt = moreLead + sec(SPOKEN_MORE.dur + WORD_GAP, FPS);
  const wordsAt = nameAt + sec(nameDur + WORD_GAP, FPS);
  const moreSpeechEnd = wordsAt + sec(SPOKEN_WORDS.dur, FPS);

  // then each tile is spoken and highlighted in turn. Only 60 of the 103 extra
  // words exist in the app's word bank, so a tile with no clip still gets its
  // turn — it just holds for a fixed beat instead of a clip length. Drop an mp3
  // into public/audio/words/ and it picks it up automatically.
  const SILENT_SLOT = 0.5;
  let wcur = moreSpeechEnd + 22; // let all four land before the first highlight
  const tileCues = it.extras.slice(0, 6).map((w) => {
    const k = imgKey(w);
    const d = EXTRA_WORD_AUDIO[k] ?? null;
    const at = wcur;
    const slot = sec((d ?? SILENT_SLOT) + 0.24, FPS);
    wcur += slot;
    return { key: k, word: w, at, dur: d, slot };
  });
  // once every word has had its turn, all four cards go back to their normal
  // state (no dim, no ring) and hold for ~1.6s before the beat hands over —
  // otherwise the last card stays lit and the other three stay greyed out.
  const tilesDoneAt = wcur;
  const moreF = tilesDoneAt + 48;
  const echoF = 26 + sec(SHARED.yourTurn.dur, FPS) + sec(trioDur, FPS) + gapF + Math.max(sec(praiseFor(it.letter).dur, FPS), 30) + 24;
  // Z is the last episode: no "Tomorrow", it ends on the app download instead,
  // which needs room for the device mock to play its GET -> OPEN flow.
  const isLast = it.letter.toUpperCase() === "Z";
  const zNarr = 8 + Z_FINALE.reduce((a, c) => a + sec(c.dur + 0.12, FPS), 0);
  const ctaF = isLast
    ? Math.max(zNarr + 30, 320) // the full store flow AND the four-part narration
    : Math.max(sec(ctaFor(it.letter).dur, FPS) + 34, 140);

  let c = 0;
  const hookFrom = c; c += hookF;
  const teachFrom = c; c += teachF;
  const moreFrom = c; c += moreF;
  const echoFrom = c; c += echoF;
  const ctaFrom = c; c += ctaF;

  return {
    it, accent: letterColorFor(it.letter, it.imageColor), trioDur, nameDur, audLead, gapF,
    isLast, tilesDoneAt, moreLead, nameAt, wordsAt, moreSpeechEnd, tileCues,
    hookFrom, hookF, teachFrom, teachF, moreFrom, moreF, echoFrom, echoF, ctaFrom, ctaF, total: c,
  };
};

export const letterShortDuration = (it: LetterItem) => planShort(it).total;

// ── small shared bits ────────────────────────────────────────────────────────

// karaoke token: dim → pops as it's spoken → stays lit. `f0` is a beat frame.
const tokAt = (frame: number, f0: number) => {
  const lit = interpolate(frame, [f0 - 2, f0 + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = interpolate(frame, [f0, f0 + 5, f0 + 13], [1, 1.26, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: 0.28 + 0.72 * lit, transform: `scale(${pop})` };
};

// the word image on its paper card, with a contact shadow under it.
// Every image card carries the brand badge straddling a corner.
const WordCard: React.FC<{ image: string; accent: string; size?: number; alive?: number; word?: string; badgeSize?: number }> = ({
  image,
  accent,
  size = 340,
  alive = 0,
  word,
  badgeSize,
}) => {
  const frame = useCurrentFrame();
  // `alive` > 0 during the example-phrase beat: the subject gets a little
  // walk-cycle so the phrase is illustrated, not just captioned.
  const hop = alive > 0 ? Math.abs(Math.sin(frame * 0.34)) * 16 * alive : 0;
  const sway = alive > 0 ? Math.sin(frame * 0.34) * 20 * alive : 0;
  const tilt = alive > 0 ? Math.sin(frame * 0.34) * 5 * alive : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...paperCard(accent), position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* per-word corner so the badge never sits on top of the subject */}
        <CardBadge size={badgeSize ?? Math.round(size * 0.2)} corner={word ? badgeCorner(word) : "tr"} />
        <Img
          src={staticFile(`letters/${image}.png`)}
          style={{
            width: size * 0.76,
            height: size * 0.76,
            objectFit: "contain",
            transform: `translate(${sway}px, ${-hop}px) rotate(${tilt}deg)`,
          }}
        />
      </div>
      <div style={{ marginTop: -10 }}><ContactShadow width={size * 0.8} lift={hop / 16} /></div>
    </div>
  );
};

// ── beat 1 · cover ───────────────────────────────────────────────────────────
// Frame 0 IS this beat's first frame and it must read as a finished thumbnail,
// so nothing here springs from zero — only sine-based idle motion, which has a
// defined value at frame 0.
const Cover: React.FC<{ p: ShortPlan }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { it, accent } = p;
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={10} durationInFrames={sec(p.trioDur, FPS) + 10}>
        <Audio src={staticFile(`audio/recognition/${it.letter.toLowerCase()}_trio.mp3`)} />
      </Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, transform: `scale(${pulse(frame, fps, 0.022, 2.4)}) translateY(${bob(frame, fps, 8, 2.8)}px)` }}>
          <span style={{ fontSize: 300, fontWeight: 800, color: accent, lineHeight: 1, textShadow: `0 6px 0 ${shade(accent, 0.26)}, 0 22px 40px rgba(92,64,32,0.28)` }}>{it.letter}</span>
          <span style={{ fontSize: 210, fontWeight: 800, color: shade(accent, 0.14), lineHeight: 1, textShadow: `0 5px 0 ${shade(accent, 0.34)}, 0 18px 34px rgba(92,64,32,0.24)` }}>{it.letter.toLowerCase()}</span>
        </div>

        <div style={{ transform: `translateY(${bob(frame, fps, 10, 2.2, 1)}px)` }}>
          <WordCard image={it.image} accent={accent} size={330} word={it.word} />
        </div>

        <div style={{ ...paperCard(accent, 999), padding: "12px 44px", fontSize: 72, fontWeight: 800, color: palette.ink }}>
          {it.letter} for {it.word}
        </div>
      </div>

    </AbsoluteFill>
  );
};

// ── beat 2 · the letter draws itself + word + example phrase ─────────────────
const Teach: React.FC<{ p: ShortPlan }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { it, accent, audLead } = p;
  const t = it.timings;
  const extra = LETTER_SHORT_EXTRAS[it.letter];

  const a = (s: number) => audLead + sec(s, FPS); // clip-seconds → beat frames

  const drawStart = a(t[0]);
  const drawEnd = a(t[4] + 0.3);
  const drawP = interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lowerP = interpolate(frame, [drawStart + 10, drawEnd + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const revealF = a(t[7]);
  // CollapseRow scales its content by `p`, which is right for a beat HANDING OVER
  // but wrong for one arriving — driving it with a spring made the word card
  // appear as a squished speck and grow. So the ROW opens on a fast linear ramp
  // and the card does its own bounce inside it.
  const revealRow = interpolate(frame, [revealF, revealF + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revealPop = spring({ frame: frame - revealF, fps, config: { damping: 12 } });
  // the sound tokens have done their job — clear them BEFORE the card lands, so
  // the column isn't collapsing and expanding in the same frames
  const tokensOut = interpolate(frame, [revealF - 14, revealF - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // The mouth is ONLY for the sound itself — the three "aaa" repeats (t[2..4]).
  // Not "A says", not "A for Ant", not the phrase: those are words, and showing
  // the /a/ articulation under them would be wrong.
  const art = LETTER_ARTICULATION[it.letter];
  const clipSec = (frame - audLead) / fps;
  const soundTimes = [t[2], t[3], t[4]];
  const mouthOpen = mouthOpenAt(clipSec, soundTimes, 0.28);
  // grows in just before the first sound, shrinks away after the last
  const faceP = Math.min(
    interpolate(frame, [a(t[2]) - 10, a(t[2])], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [a(t[4]) + 12, a(t[4]) + 26], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  const phraseF = extra ? a(phraseStartOf(extra)) : -1;
  const phraseIn = extra ? spring({ frame: frame - phraseF, fps, config: { damping: 13 } }) : 0;
  const alive = extra ? interpolate(frame, [phraseF, phraseF + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={audLead} durationInFrames={sec(it.durSec, FPS) + 12}>
        <Audio src={staticFile(`audio/letters/${it.audio}.mp3`)} />
      </Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: GAP, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        {/* the letter writes itself, exactly while its sound is spoken */}
        {/* the mouth sits ABOVE the letters and only exists while the sound plays.
            CollapseRow gives it its own height, so when it leaves the column
            closes up instead of holding a hole. */}
        <CollapseRow p={faceP} gap={GAP}>
          <PhonicsFace articulation={art} open={mouthOpen} size={250} color={accent} frame={frame} fps={fps} />
        </CollapseRow>

        {/* the glyph pair stays bottom-aligned so the lowercase sits on its
            baseline instead of floating level with the capital */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, transform: `translateY(${bob(frame, fps, 6, 2.9)}px)` }}>
          <TraceGlyph char={it.letter} color={accent} box={350} progress={drawP} />
          <TraceGlyph char={it.letter.toLowerCase()} color={shade(accent, 0.16)} box={232} progress={lowerP} />
        </div>

        {/* "A says a · a · a" — each token pops as it is spoken. The three sound
            tokens sit in their own chips: run together as plain text they read as
            one long blob ("aaaaaaaaa") instead of three separate sounds. */}
        <CollapseRow p={tokensOut} gap={GAP}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: 66, fontWeight: 800, color: palette.ink, ...tokAt(frame, a(t[0])) }}>{it.letter}</span>
            <span style={{ fontSize: 58, fontWeight: 700, color: palette.inkSoft, ...tokAt(frame, a(t[1])) }}>says</span>
            {[2, 3, 4].map((k) => {
              const tk = tokAt(frame, a(t[k]));
              return (
                <span
                  key={k}
                  style={{
                    ...paperCard(accent, 999),
                    padding: "4px 26px",
                    fontSize: 64,
                    fontWeight: 800,
                    color: accent,
                    ...tk,
                  }}
                >
                  {it.soundToken.toLowerCase()}
                </span>
              );
            })}
          </div>
        </CollapseRow>

        {/* the word lands */}
        <CollapseRow p={revealRow} gap={GAP}>
          <div style={{ transform: `scale(${0.86 + 0.14 * revealPop})` }}>
            <WordCard image={it.image} accent={accent} size={330} alive={alive} word={it.word} />
          </div>
          <div style={{ ...paperCard(accent, 999), padding: "10px 40px", fontSize: 66, fontWeight: 800, color: palette.ink }}>
            {it.letter} for <span style={{ color: accent }}>{it.word}</span>
          </div>
        </CollapseRow>

        {/* the example phrase at the end of the clip gets its own beat */}
        {extra && (
          <CollapseRow p={phraseIn} gap={GAP}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: 860 }}>
              {extra.words.map((pw, i) => {
                // MEASURED word time (tools/align_audio.py), not an even stagger —
                // an even stagger drifted badly against the real speech
                const wf = a(pw.at);
                const lit = interpolate(frame, [wf - 1, wf + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const pop = interpolate(frame, [wf, wf + 4, wf + 11], [1, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <span
                    key={i}
                    style={{
                      fontSize: 54,
                      fontWeight: 800,
                      color: lit > 0.5 ? accent : "rgba(30,36,56,0.3)",
                      transform: `scale(${pop}) translateY(${(1 - lit) * 8}px)`,
                    }}
                  >
                    {pw.w}
                  </span>
                );
              })}
            </div>
          </CollapseRow>
        )}
      </div>

      {/* burst FROM the word card (it lands there), not from the middle of the
          glyphs — origin y is the card's centre once the row is open */}
      <Confetti frame={frame} fps={fps} burstFrame={revealF + 4} origin={{ x: 540, y: 1040 }} colors={[accent, "#FFC24A", "#FF8A5B", "#5FC8E0", "#8FD173"]} count={30} seed={it.letter.charCodeAt(0)} />
    </AbsoluteFill>
  );
};

// ── beat 3 · more words with the same sound ──────────────────────────────────
const MoreWords: React.FC<{ p: ShortPlan }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { it, accent, moreLead, nameAt, wordsAt } = p;
  const tiles = it.extras.slice(0, 6);

  // "More" + the app's own letter-name clip + "words" — three clips, so the pair
  // of shared takes works for every letter.
  const tok = (f0: number) => {
    const lit = interpolate(frame, [f0 - 2, f0 + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pop = interpolate(frame, [f0, f0 + 5, f0 + 13], [1, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { opacity: 0.3 + 0.7 * lit, display: "inline-block", transform: `scale(${pop})` } as React.CSSProperties;
  };

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={moreLead} durationInFrames={sec(SPOKEN_MORE.dur, FPS) + 6}>
        <Audio src={staticFile(SPOKEN_MORE.src!)} />
      </Sequence>
      <Sequence from={nameAt} durationInFrames={sec(p.nameDur, FPS) + 6}>
        <Audio src={staticFile(letterNameSrc(it.letter))} />
      </Sequence>
      <Sequence from={wordsAt} durationInFrames={sec(SPOKEN_WORDS.dur, FPS) + 6}>
        <Audio src={staticFile(SPOKEN_WORDS.src!)} />
      </Sequence>

      {/* each word spoken in turn (where a clip exists) */}
      {p.tileCues.map((c) =>
        c.dur == null ? null : (
          <Sequence key={c.key} from={c.at} durationInFrames={sec(c.dur, FPS) + 6}>
            <Audio src={staticFile(`audio/words/${c.key}.mp3`)} />
          </Sequence>
        )
      )}

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        {/* the letter's own word, small — keeps "A / Ant" anchored while the
            extra words come in, so the sound stays attached to something known */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${spring({ frame, fps, config: { damping: 12 } })})` }}>
          <span style={{ fontSize: 104, fontWeight: 800, color: accent, textShadow: `0 4px 0 ${shade(accent, 0.26)}` }}>
            {it.letter}
            {it.letter.toLowerCase()}
          </span>
          <div style={{ ...paperCard(accent, 30), position: "relative", width: 168, height: 168, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardBadge size={52} corner={badgeCorner(it.word)} />
            <Img src={staticFile(`letters/${it.image}.png`)} style={{ width: 128, height: 128, objectFit: "contain" }} />
          </div>
        </div>

        {/* each word lights as its own clip plays */}
        <div style={{ fontSize: 72, fontWeight: 800, color: palette.ink, transform: `scale(${spring({ frame, fps, config: { damping: 12 } })})` }}>
          <span style={tok(moreLead)}>More</span>{" "}
          <span style={{ ...tok(nameAt), color: accent }}>{it.letter}</span>{" "}
          <span style={tok(wordsAt)}>words!</span>
        </div>

        {/* 2 columns x up to 3 rows. Tiles are smaller than the old 2x2 so six fit
            between the reference card and the captions.
            An ODD last tile (a 5-word letter: X, Z) would otherwise sit alone in
            the LEFT column and read as a mistake, so it spans both columns and
            centres instead — 2x2 with a centred 5th underneath. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {tiles.map((w, i) => {
            const centredLast = tiles.length === 5 && i === 4;
            const key = imgKey(w);
            const tint = hex(IMG_COLORS[key] ?? it.imageColor);
            // start once "More <letter> words" has been said, then a tight
            // stagger so the grid never sits half-empty for long
            const inn = spring({ frame: frame - p.moreSpeechEnd - i * 5, fps, config: { damping: 12 } });
            // …then each card takes its turn as its word is spoken
            const cue = p.tileCues[i];
            const allDone = frame >= p.tilesDoneAt;
            const on = !allDone && cue && frame >= cue.at - 2 && frame < cue.at + cue.slot;
            const anyTurnStarted = !allDone && p.tileCues.length > 0 && frame >= p.tileCues[0].at - 2;
            const lift = on ? spring({ frame: frame - cue.at, fps, config: { damping: 11 } }) : 0;
            const scale = inn * (1 + 0.09 * lift);
            return (
              <div
                key={w}
                style={{
                  ...paperCard(tint, 38),
                  position: "relative",
                  ...(centredLast ? { gridColumn: "1 / -1", justifySelf: "center" } : null),
                  width: 390,
                  height: 340,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transform: `scale(${scale}) translateY(${bob(frame, fps, 6, 2.4, i * 1.3)}px)`,
                  // the others recede while one is being said, so the eye is told
                  // which word it is hearing
                  opacity: inn * (anyTurnStarted && !on ? 0.45 : 1),
                  outline: on ? `9px solid ${tint}` : "none",
                  outlineOffset: 5,
                }}
              >
                {/* badge straddles the top-right corner — clear of the subject and
                    of the label underneath (the parent must stay unclipped) */}
                <CardBadge size={54} corner="tr" />
                <Img src={staticFile(`letters/${key}.png`)} style={{ width: 186, height: 186, objectFit: "contain" }} />
                {/* pale images (ambulance, axe) give a pale tint — darken those far
                    harder or the label washes out against the white card */}
                <div style={{ fontSize: 40, fontWeight: 800, color: shade(tint, lum(tint) > 0.55 ? 0.58 : 0.32), whiteSpace: "nowrap" }}>{w}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── beat 4 · your turn (say it back) ─────────────────────────────────────────
const YourTurn: React.FC<{ p: ShortPlan }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { it, accent, trioDur, gapF } = p;

  const askF = 10;
  const playF = askF + sec(SHARED.yourTurn.dur, FPS) + 8;
  const gapStart = playF + sec(trioDur, FPS) + 4;
  const gapEnd = gapStart + gapF;

  const inn = spring({ frame, fps, config: { damping: 12 } });
  const listening = frame >= gapStart && frame < gapEnd;

  const praise = praiseFor(it.letter);
  const gapP = interpolate(frame, [gapStart, gapEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const doneIn = spring({ frame: frame - gapEnd, fps, config: { damping: 11 } });

  const R = 150;
  const C = 2 * Math.PI * R;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {SHARED.yourTurn.src && (
        <Sequence from={askF} durationInFrames={sec(SHARED.yourTurn.dur, FPS) + 10}><Audio src={staticFile(SHARED.yourTurn.src)} /></Sequence>
      )}
      <Sequence from={playF} durationInFrames={sec(trioDur, FPS) + 10}>
        <Audio src={staticFile(`audio/recognition/${it.letter.toLowerCase()}_trio.mp3`)} />
      </Sequence>
      {/* this letter's own praise take — one of the app's seven */}
      <Sequence from={gapEnd + 4} durationInFrames={sec(praise.dur, FPS) + 10}>
        <Audio src={staticFile(praise.src)} />
      </Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ fontSize: 78, fontWeight: 800, color: palette.ink, transform: `scale(${inn})` }}>
          {frame >= gapEnd ? praise.text : "Your turn!"}
        </div>

        {/* the letter inside a listening ring; the ring fills over the silent gap */}
        <div style={{ position: "relative", width: 360, height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={360} height={360} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            {/* the track has to be a tint of the accent, not white — white on this
                light background is invisible and the countdown reads as nothing */}
            <circle cx={180} cy={180} r={R} fill="none" stroke={`${accent}2E`} strokeWidth={22} />
            {listening && (
              <circle cx={180} cy={180} r={R} fill="none" stroke={accent} strokeWidth={22} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - gapP)} />
            )}
            {frame >= gapEnd && <circle cx={180} cy={180} r={R} fill="none" stroke={accent} strokeWidth={22} />}
          </svg>
          <span style={{ fontSize: 210, fontWeight: 800, color: accent, transform: `scale(${listening ? pulse(frame, fps, 0.06, 0.9) : 1})`, textShadow: `0 6px 0 ${shade(accent, 0.26)}` }}>
            {it.letter}
          </span>
        </div>

        <div style={{ fontSize: 56, fontWeight: 800, color: listening ? accent : palette.inkSoft }}>
          {frame >= gapEnd ? `${it.letter} for ${it.word}!` : listening ? "…say it!" : `Say "${it.soundToken.toLowerCase()}"`}
        </div>

        <div style={{ transform: `translateY(${bob(frame, fps, 10, 2.1)}px) scale(${frame >= gapEnd ? 1 + 0.08 * doneIn : 1})` }}>
          <Mascot size={210} />
        </div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={gapEnd + 2} origin={{ x: 540, y: 760 }} colors={[accent, "#FFC24A", "#FF8A5B", "#8FD173"]} count={26} seed={it.letter.charCodeAt(0) + 7} />
    </AbsoluteFill>
  );
};

// StoreFlow's phone geometry, needed to centre and scale it (see Finale below).
const PHONE_CX = 476;   // phone centre x in StoreFlow's own coords (226..726)
const PHONE_Y0 = 88;    // phone top y
const PHONE_S = 0.92;   // scale — larger than the first pass, which read as small
const PHONE_TOP = 300;  // where the phone's top edge should land in the frame
const STORE_HOLD = 276; // freeze just after the download hits OPEN (DETAIL_AT 156 + d 108)

// ── beat 5b · Z only · the series finale ─────────────────────────────────────
// Z is the LAST episode, so "Tomorrow: A" would be wrong — there is no next
// letter. It ends on the app instead, using the SAME full device mock as
// letters_p1/p2: store search → our app → detail page → GET → downloading →
// OPEN. (An earlier pass used StoreFlow's `compact` mode to save runtime, but
// that skips the search phase, which is half the point of showing the store.)
const Finale: React.FC<{ p: ShortPlan }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { accent } = p;
  const head = spring({ frame, fps, config: { damping: 12 } });
  // "It's completely free!" is the 4th clip — bring the CTA + badges in with it
  const freeAt = 8 + sec(Z_FINALE[0].dur + Z_FINALE[1].dur + Z_FINALE[2].dur + 0.36, 30);
  const cta = spring({ frame: frame - freeAt, fps, config: { damping: 12 } });
  const apple = spring({ frame: frame - freeAt - 12, fps, config: { damping: 11 } });
  const play = spring({ frame: frame - freeAt - 24, fps, config: { damping: 11 } });

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* four takes, laid end to end: completion → intent → where to get it → free */}
      {Z_FINALE.reduce<{ at: number; els: React.ReactNode[] }>((acc, c, i) => {
        acc.els.push(
          <Sequence key={i} from={acc.at} durationInFrames={sec(c.dur, FPS) + 6}>
            <Audio src={staticFile(c.src)} />
          </Sequence>
        );
        acc.at += sec(c.dur + 0.12, FPS);
        return acc;
      }, { at: 8, els: [] }).els}

      <div style={{ position: "absolute", top: 74, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${0.9 + 0.1 * head})` }}>
        <div style={{ fontSize: 62, fontWeight: 800, color: palette.ink }}>
          You know all <span style={{ color: accent }}>26</span> letters!
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, color: palette.inkSoft }}>A to Z — complete 🎉</div>
      </div>

      {/* The real store mock.
          StoreFlow draws its phone at x 226..726, i.e. centred on 476 — 64px LEFT
          of the 1080 frame centre (that's why StoreOutroPortrait offsets it by
          translate(64px,...)). Scaling about "top center" does NOT fix that, so
          the X offset is solved explicitly here from a top-left origin:
            translateX = 540 - phoneCentre*scale   -> dead centre
            translateY = top   - phoneTop*scale    -> exact top edge
          Freeze holds it once the download reaches OPEN: past d=128 StoreFlow
          scrolls the detail page down to its Reviews block, which has no place
          in a kids' end card. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${(540 - PHONE_CX * PHONE_S).toFixed(1)}px, ${(PHONE_TOP - PHONE_Y0 * PHONE_S).toFixed(1)}px) scale(${PHONE_S})`,
          transformOrigin: "top left",
        }}
      >
        <Freeze frame={Math.min(frame, STORE_HOLD)}>
          <StoreFlow hideReviews />
        </Freeze>
      </div>

      <div style={{ position: "absolute", top: 1186, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        {/* dark ink, not the gold the dark-themed outro uses — gold on this cream
            background is unreadable */}
        <div style={{ opacity: cta, fontSize: 56, fontWeight: 800, color: shade(accent, 0.32), textAlign: "center" }}>
          Keep learning — the app is FREE!
        </div>
        <div style={{ display: "flex", gap: 30 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 340, height: "auto", transform: `scale(${apple})` }} />
          <Img src={staticFile("playstore.png")} style={{ width: 340, height: "auto", transform: `scale(${play})` }} />
        </div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={8} origin={{ x: 540, y: 300 }} colors={[accent, "#FFC24A", "#FF8A5B", "#5FC8E0", "#8FD173"]} count={34} seed={90} />
    </AbsoluteFill>
  );
};

// ── beat 5 · tomorrow's letter ───────────────────────────────────────────────
const NextUp: React.FC<{ p: ShortPlan }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { it, accent } = p;
  const nxt = nextLetterOf(it.letter);
  const cta_ = ctaFor(it.letter);
  const inn = spring({ frame, fps, config: { damping: 12 } });
  const nxtIn = spring({ frame: frame - 16, fps, config: { damping: 11 } });
  const ctaIn = spring({ frame: frame - 26, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* this letter's closing take — one of four, rotated */}
      <Sequence from={8} durationInFrames={sec(cta_.dur, FPS) + 10}>
        <Audio src={staticFile(cta_.src)} />
      </Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ transform: `scale(${inn})` }}><LogoBadge /></div>

        <div style={{ fontSize: 46, fontWeight: 800, color: palette.inkSoft, letterSpacing: 6, opacity: inn }}>TOMORROW</div>

        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ ...paperCard(accent, 56), width: 380, height: 380, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${nxtIn}) rotate(${-3 + Math.sin(frame * 0.06) * 2}deg)` }}>
            <span style={{ fontSize: 250, fontWeight: 800, color: accent, textShadow: `0 6px 0 ${shade(accent, 0.26)}` }}>{nxt}</span>
          </div>
          <div style={{ transform: `scale(${nxtIn}) translateY(${bob(frame, fps, 10, 2.3)}px)` }}>
            <Mascot size={200} />
          </div>
        </div>

        <div style={{ fontSize: 62, fontWeight: 800, color: palette.ink, opacity: ctaIn, transform: `translateY(${(1 - ctaIn) * 14}px)` }}>
          A new letter every day!
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: accent, opacity: ctaIn }}>Kids English Learning</div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={6} origin={{ x: 540, y: 520 }} colors={[accent, "#FFC24A", "#FF8A5B", "#5FC8E0"]} count={28} seed={it.letter.charCodeAt(0) + 13} />
    </AbsoluteFill>
  );
};

// ── SFX ──────────────────────────────────────────────────────────────────────
type Cue = { from: number; name: string; vol: number };
const cuesFor = (p: ShortPlan): Cue[] => {
  const { it, audLead } = p;
  const t = it.timings;
  const extra = LETTER_SHORT_EXTRAS[it.letter];
  return [
    { from: 6, name: "chime_soft", vol: 0.34 },
    { from: p.teachFrom, name: "swoosh_soft", vol: 0.22 },
    { from: p.teachFrom + audLead + sec(t[7], FPS), name: "sparkle", vol: 0.42 },
    ...(extra ? [{ from: p.teachFrom + audLead + sec(phraseStartOf(extra), FPS), name: "twinkle", vol: 0.3 }] : []),
    { from: p.moreFrom, name: "swoosh_soft", vol: 0.22 },
    ...[0, 1, 2, 3].map((i) => ({ from: p.moreFrom + 10 + i * 9, name: "pop", vol: 0.26 })),
    { from: p.echoFrom, name: "swoosh_soft", vol: 0.22 },
    { from: p.echoFrom + 26 + sec(SHARED.yourTurn.dur, FPS) + sec(p.trioDur, FPS) + p.gapF + 2, name: "correct", vol: 0.4 },
    { from: p.ctaFrom + 4, name: "chime_soft", vol: 0.34 },
  ];
};

// ── the reel ─────────────────────────────────────────────────────────────────
export const LetterShortReel: React.FC<{ item: LetterItem }> = ({ item }) => {
  const p = planShort(item);
  const frame = useCurrentFrame();
  const sfx = cuesFor(p);

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#EAF4FF" }}>
      {/* ONE global background + ambient, direct children of the root so they run
          on the ABSOLUTE frame and never reset at a beat change */}
      <AbsoluteFill style={{ background: paperBgFor(p.accent) }} />
      <PaperClouds seed={item.letter.charCodeAt(0)} />
      <PaperMotes seed={item.letter.charCodeAt(0) + 5} />

      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(f) => interpolate(f, [0, 20, p.total - 40, p.total], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {sfx.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}

      {/* top furniture — self-gating on the absolute frame, gone for the end card
          so the CTA's LogoBadge is the only logo then (exactly one, always) */}
      {frame < p.ctaFrom && (
        <>
          <div style={{ position: "absolute", top: 52, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
            <PaperTitle title="Letter Sounds" accent={p.accent} logo={<HeaderLogo height={54} />} />
          </div>
          <div style={{ position: "absolute", top: 146, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
            <LetterRail active={item.letter} accent={p.accent} startFrame={4} />
          </div>
        </>
      )}

      <Sequence from={p.hookFrom} durationInFrames={p.hookF}><Cover p={p} /></Sequence>
      <Sequence from={p.teachFrom} durationInFrames={p.teachF}><Teach p={p} /></Sequence>
      <Sequence from={p.moreFrom} durationInFrames={p.moreF}><MoreWords p={p} /></Sequence>
      <Sequence from={p.echoFrom} durationInFrames={p.echoF}><YourTurn p={p} /></Sequence>
      <Sequence from={p.ctaFrom} durationInFrames={p.ctaF}>
        {p.isLast ? <Finale p={p} /> : <NextUp p={p} />}
      </Sequence>
    </AbsoluteFill>
  );
};

// Registry entry for one letter. Built here (a .tsx module) rather than in
// reels/index.ts, which is plain .ts and can't hold JSX — same reason
// LETTER_TILE_ENTRIES lives in thumbs/poll_options.tsx.
// Adding B–Z = `...LETTERS.map(letterShortEntry)`.
export const letterShortEntry = (it: LetterItem) => ({
  id: `letter-${it.letter.toLowerCase()}-short`,
  component: () => <LetterShortReel item={it} />,
  durationInFrames: letterShortDuration(it),
  width: 1080,
  height: 1920,
});
