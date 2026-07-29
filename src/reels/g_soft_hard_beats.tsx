import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Band, Center, Pill } from "../components/LandscapeBeatKit";
import { GardenChip } from "../components/GardenWorld";
import { RuleArrow } from "../components/Connector";
import { LogoBadge } from "../components/BrandMarks";
import { WordArt } from "../components/WordArt";
import { decidingLetter } from "./c_soft_hard_beats";
import { hex, palette, tint, font, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// Beats for hard g / soft g — The Magic Garden.
//
// Sibling of hard/soft c and deliberately built from the same parts: same colour language
// (green = soft, orange-red = hard, purple = the deciding letter), same tile device, same
// see-it boards. The script itself says "it is the same secret we used for c", so the visual
// grammar matching is the point — what changes is the world and the ending.
//
// The ending is where this card differs and where the work is: c's rule is airtight, g's is
// not. get / give / girl / gift / begin / tiger all break it, so they get their own beat.
//
// LAYOUT — derived from the fence, never typed by feel. Same arithmetic as the Bakery.

const HARD = "D84315";
const SOFT = "2E7D32";
const DEC = "8E24AA";
export const G_TONES = { HARD, SOFT, DEC };

export const PIC_TOP = 208;
export const PIC_H = 160;
const TILE_H = 200;
const TILE_SLAB = 22 + 16;
const LABEL_H = 64;
const NOTE_H = 64;

export const TILE_TOP = PIC_TOP + PIC_H + 30;                 // 398
export const LABEL_TOP = TILE_TOP + TILE_H + TILE_SLAB + 26;  // 662
export const NOTE_TOP = LABEL_TOP + LABEL_H + 34;             // 760
const FENCE_TOP = 856;
if (NOTE_TOP + NOTE_H + 26 > FENCE_TOP) {
  throw new Error(`g/soft-hard layout: the note row runs past the fence (${NOTE_TOP + NOTE_H + 26} > ${FENCE_TOP})`);
}

export type Note = { at: number; node: React.ReactNode | null };
const pick = (notes: Note[], frame: number): Note | null => {
  let cur: Note | null = null;
  for (const n of notes) if (frame >= n.at) cur = n;
  return cur;
};

export const GSwapNote: React.FC<{ notes: Note[]; top?: number }> = ({ notes, top = NOTE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cur = pick(notes, frame);
  if (!cur || !cur.node) return null;
  const s = spring({ frame: frame - cur.at, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `scale(${0.84 + 0.16 * s}) translateY(${bob(frame, fps, 5, 2.4)}px)` }}>{cur.node}</div>
    </div>
  );
};

// ── hook (0–9) ──────────────────────────────────────────────────────────────
export type GHookCues = {
  gee: number; two: number; hear1: number; goat: number; g: number;
  hear2: number; gem: number; j: number; same: number; two2: number;
};

const SoundBubble: React.FC<{ sound: string; word: string; tone: string; at: number; lit: boolean; ring: boolean }> = ({ sound, word, tone, at, lit, ring }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const c = hex(tone);
  const sp = spring({ frame: frame - at, fps, config: { damping: 12 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 42, fontFamily: font.family, transform: `scale(${0.78 + 0.22 * sp}) translateY(${bob(frame, fps, 6, 2.4)}px)` }}>
      <div style={{ background: "#FFFFFF", border: `${ring ? 12 : 9}px solid ${c}`, borderRadius: 34, padding: "16px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: slab(tone, ring ? 26 : lit ? 20 : 13) }}>
        <WordArt word={word} size={92} />
        <span style={{ fontSize: 54, fontWeight: 700, color: palette.ink }}>
          <span style={{ color: c }}>g</span>{word.slice(1)}
        </span>
      </div>
      <div style={{ background: lit ? c : "#FFFFFF", color: lit ? "#fff" : c, border: `7px solid ${c}`, borderRadius: 999, padding: "6px 30px", fontSize: 52, fontWeight: 700, boxShadow: slab(tone, 11) }}>
        {sound}
      </div>
    </div>
  );
};

export const GHook: React.FC<{ cues: GHookCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const same = frame >= cues.same;
  const both = frame >= cues.two2;
  const gPulse = same && !both ? 1 + 0.07 * Math.sin(((frame - cues.same) / fps) * 5) : 1;
  const sidePulse = both ? 1 + 0.06 * Math.sin(((frame - cues.two2) / fps) * 5) : 1;
  return (
    <>
      <Band top={92}>
        <Pill size={46} still>
          {both ? (<>One letter, <span style={{ color: hex(DEC) }}>two sounds</span>!</>)
            : same ? (<>The <span style={{ color: hex(DEC) }}>same letter</span>…</>)
            : (<>Look at this letter 👀</>)}
        </Pill>
      </Band>
      <Center top={352}>
        <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
          <div style={{ transform: `scale(${sidePulse})` }}>
            <SoundBubble sound="/g/" word="goat" tone={HARD} at={cues.goat} lit={frame >= cues.g} ring={both} />
          </div>
          {/* the letter is face-down until it is named */}
          {frame < cues.gee ? (
            <div
              style={{
                width: 260, height: 300, borderRadius: 40, border: `12px dashed ${hex(DEC)}88`,
                background: "#FFFFFFAA", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 150, fontWeight: 700, color: `${hex(DEC)}88`, fontFamily: font.family,
                transform: `translateY(${bob(frame, fps, 8, 2.4)}px) scale(${1 + 0.04 * Math.sin((frame / fps) * 4)})`,
              }}
            >
              ?
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
              <div
                style={{
                  position: "relative",
                  background: "#FFFFFF", border: `12px solid ${hex(DEC)}`, borderRadius: 40,
                  padding: "16px 54px", fontSize: 170, fontWeight: 700, color: hex(DEC), fontFamily: font.family,
                  boxShadow: slab(DEC, same && !both ? 34 : 24),
                  transform: `scale(${(0.8 + 0.2 * spring({ frame: frame - cues.gee, fps, config: { damping: 11 } })) * gPulse}) translateY(${bob(frame, fps, 7, 3)}px)`,
                }}
              >
                g
                {same && !both && (
                  <div style={{ position: "absolute", inset: -10 - 26 * (((frame - cues.same) % 26) / 26), borderRadius: 52, border: `8px solid ${hex(DEC)}`, opacity: 0.55 * (1 - ((frame - cues.same) % 26) / 26) }} />
                )}
              </div>
              {frame >= cues.two && (
                <div style={{ fontSize: 42, fontWeight: 700, color: palette.inkSoft, fontFamily: font.family }}>
                  {both ? "the same letter!" : "two sounds"}
                </div>
              )}
            </div>
          )}
          <div style={{ transform: `scale(${sidePulse})` }}>
            <SoundBubble sound="/j/" word="gem" tone={SOFT} at={cues.gem} lit={frame >= cues.j} ring={both} />
          </div>
        </div>
      </Center>
      {frame >= cues.hear1 && frame < cues.goat && (
        <GSwapNote top={214} notes={[{ at: cues.hear1, node: <GardenChip tone={hex(DEC)}><span style={{ fontSize: 40 }}>👂</span>listen to the first one</GardenChip> }]} />
      )}
      {frame >= cues.hear2 && frame < cues.gem && (
        <GSwapNote top={214} notes={[{ at: cues.hear2, node: <GardenChip tone={hex(DEC)}><span style={{ fontSize: 40 }}>👂</span>now listen to the second one</GardenChip> }]} />
      )}
    </>
  );
};

// ── lookAfter (10–12) ───────────────────────────────────────────────────────
// No arrow-flip here: this script does not re-teach the reversal, it says "the same secret we
// used for c". So the callback IS the visual — c's own word, then g's.
export const GLookAfter: React.FC<{ secretAt: number; afterAt: number; gAt: number }> = ({ secretAt, afterAt, gAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showG = frame >= afterAt;
  return (
    <>
      <Band top={92}>
        <Pill size={46}>
          {showG ? (<>Look at the letter that comes <span style={{ color: hex(DEC) }}>after</span> ➡️</>)
            : frame >= secretAt ? (<>The same secret we used for <span style={{ color: hex(SOFT) }}>c</span> 🔁</>)
            : (<>So how do we know which sound to say? 🤔</>)}
        </Pill>
      </Band>
      <Center top={392}>
        {frame < secretAt ? (
          <span style={{ fontSize: 170, display: "inline-block", transform: `scale(${1 + 0.08 * Math.sin((frame / fps) * 3.4)}) rotate(${wiggle(frame, fps, 1.8, 9)}deg) translateY(${bob(frame, fps, 10, 2.2)}px)` }}>🤷</span>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: font.family }}>
            <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
              {/* the word from the c video, then this card's own — the secret is the same */}
              {[{ w: ["c", "i", "ty"], tone: SOFT, faded: showG }, ...(showG ? [{ w: ["g", "e", "m"], tone: SOFT, faded: false }] : [])].map((x, k) => (
                <div
                  key={k}
                  style={{
                    background: "#FFFFFF", border: `9px solid ${hex(x.tone)}`, borderRadius: 34,
                    padding: "18px 44px", fontSize: 100, fontWeight: 700, color: palette.ink,
                    fontFamily: font.family, boxShadow: slab(x.tone, 17),
                    opacity: x.faded ? 0.45 : 1,
                    transform: `translateY(${bob(frame, fps, 7, 2.4, k)}px) scale(${k === 1 ? 0.7 + 0.3 * spring({ frame: frame - afterAt, fps, config: { damping: 11 } }) : 1})`,
                  }}
                >
                  <span style={{ position: "relative", display: "inline-block", color: hex(x.tone) }}>
                    {x.w[0]}
                    {k === (showG ? 1 : 0) && gAt !== undefined && frame >= gAt && (
                      <span
                        style={{
                          position: "absolute", left: "50%", top: "50%", width: 112, height: 112,
                          marginLeft: -56, marginTop: -56, borderRadius: "50%",
                          border: `9px solid ${hex(x.tone)}`,
                          opacity: 0.75 * (1 - ((frame - gAt) % 28) / 28),
                          transform: `scale(${0.7 + 0.5 * (((frame - gAt) % 28) / 28)})`,
                        }}
                      />
                    )}
                  </span>
                  <span style={{ color: hex(DEC) }}>{x.w[1]}</span>
                  <span>{x.w[2]}</span>
                </div>
              ))}
            </div>
            <GardenChip tone={hex(DEC)}>the letter <span style={{ color: hex(DEC) }}>after</span> decides — for c <b>and</b> for g</GardenChip>
          </div>
        )}
      </Center>
    </>
  );
};

// ── the tricky words (52–69) — this card's own beat ─────────────────────────
export type BreakCues = {
  important: number; tidy: number; withC: number; withG: number; some: number; listen: number;
  words: number[]; shouldBe: number; everyday: number; bySight: number;
  trick: number; tryHard: number; ears: number;
};

const TRICKY = ["get", "give", "girl", "gift", "begin", "tiger"];

export const GBreakers: React.FC<{ cues: BreakCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anyWord = frame >= cues.words[0];
  const trick = frame >= cues.trick;
  const bars = frame >= cues.tidy && !anyWord;
  return (
    <>
      <Band top={92}>
        <Pill size={44}>
          {trick ? (<>A trick that always helps 👂</>)
            : frame >= cues.bySight ? (<>Learn these by sight ⭐</>)
            : anyWord ? (<>These ones break the rule ⚠️</>)
            : (<>The g rule is <span style={{ color: hex(HARD) }}>not</span> as tidy as c ⚠️</>)}
        </Pill>
      </Band>
      <Center top={300}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          {/* "But now I must tell you something important." — its own beat, not silence */}
          {frame < cues.tidy && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, fontFamily: font.family }}>
              <span style={{ fontSize: 150, transform: `scale(${1 + 0.09 * Math.sin((frame / fps) * 4)}) rotate(${wiggle(frame, fps, 2.6, 7)}deg)` }}>⚠️</span>
              <GardenChip tone={hex(HARD)} size={40}>something important…</GardenChip>
            </div>
          )}

          {/* c is airtight, g is not — shown as two reliability bars, not asserted in a caption */}
          {bars && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, fontFamily: font.family }}>
              {frame < cues.withC && (
                <GardenChip tone={hex(DEC)} size={38}>
                  how often does the rule <b>actually</b> work? 📊
                </GardenChip>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {[
                { l: "c", tone: SOFT, pct: 1, note: "every single time", at: cues.withC },
                { l: "g", tone: HARD, pct: 0.66, note: "most of the time", at: cues.withG },
              ].map((r) => {
                const on = frame >= r.at;
                const grow = interpolate(frame - r.at, [0, 26], [0, r.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 24, opacity: on ? 1 : 0.3 }}>
                    <div style={{ width: 108, height: 108, borderRadius: 28, background: "#FFFFFF", border: `9px solid ${hex(r.tone)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 66, fontWeight: 700, color: hex(r.tone), boxShadow: slab(r.tone, 16), transform: `translateY(${bob(frame, fps, 5, 2.4, r.l === "c" ? 0 : 1)}px)` }}>
                      {r.l}
                    </div>
                    <div style={{ width: 620, height: 46, borderRadius: 999, background: "#FFFFFF", border: `6px solid ${hex(r.tone)}55`, overflow: "hidden", transform: `translateY(${bob(frame, fps, 4, 2.4, r.l === "c" ? 0 : 1)}px)` }}>
                      {/* a shimmer travels along the filled bar, so it keeps living after it
                          has finished growing — a bar that stops is a frozen line */}
                      <div style={{ width: `${grow * 100}%`, height: "100%", background: hex(r.tone), borderRadius: 999, position: "relative", overflow: "hidden" }}>
                        <div
                          style={{
                            position: "absolute", top: 0, bottom: 0, width: 120,
                            left: `${((frame * 1.6) % (620 + 120)) - 120}px`,
                            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))",
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 34, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>{r.note}</span>
                  </div>
                );
              })}
              </div>
              {/* "Some words have e or i after the g, and the g stays hard anyway." */}
              {frame >= cues.some && (
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>
                  {["e", "i"].map((l, k) => (
                    <div key={l} style={{ width: 76, height: 76, borderRadius: 20, background: tint(DEC, 0.9), border: `7px solid ${hex(DEC)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 700, color: hex(DEC), boxShadow: slab(DEC, 12), transform: `translateY(${bob(frame, fps, 5, 2.2, k)}px)` }}>{l}</div>
                  ))}
                  <span style={{ fontSize: 40 }}>➜</span>
                  <div style={{ background: hex(HARD), color: "#fff", borderRadius: 20, padding: "8px 28px", fontSize: 44, fontWeight: 700, boxShadow: slab(HARD, 12), transform: `scale(${1 + 0.05 * Math.sin((frame / fps) * 4)}) rotate(${wiggle(frame, fps, 2, 2)}deg)` }}>still /g/ ?!</div>
                  {frame >= cues.listen && (
                    <>
                      <span style={{ fontSize: 62, marginLeft: 10, transform: `scale(${1 + 0.14 * Math.sin((frame / fps) * 5)}) rotate(${wiggle(frame, fps, 2.4, 6)}deg)`, display: "inline-block" }}>👂</span>
                      {[0, 1, 2].map((k) => (
                        <div key={k} style={{ width: 62, height: 62, borderRadius: 16, border: "5px dashed #C9B79E", background: "#FFFFFF88", transform: `translateY(${bob(frame, fps, 5, 2.2, k)}px)` }} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* the six, arriving one per spoken word, in two rows of three */}
          {anyWord && !trick && (
            <>
              {[TRICKY.slice(0, 3), TRICKY.slice(3)].map((row, r) => (
                <div key={r} style={{ display: "flex", gap: 26 }}>
                  {row.map((w, i) => {
                    const idx = r * 3 + i;
                    const on = frame >= cues.words[idx];
                    if (!on) return <div key={w} style={{ width: 232 }} />;
                    const { ci, ni } = decidingLetter(w, "g");
                    const sp = spring({ frame: frame - cues.words[idx], fps, config: { damping: 12 } });
                    return (
                      <div
                        key={w}
                        style={{
                          width: 232, background: "#FFFFFF", border: `8px solid ${hex(HARD)}`, borderRadius: 28,
                          padding: "12px 0 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                          fontFamily: font.family, boxShadow: slab(HARD, 16),
                          transform: `scale(${0.74 + 0.26 * sp}) translateY(${bob(frame, fps, 6, 2.4, idx)}px)`,
                        }}
                      >
                        <WordArt word={w} size={64} />
                        <span style={{ fontSize: 52, fontWeight: 700, color: palette.ink }}>
                          {w.slice(0, ci)}
                          <span style={{ color: hex(HARD) }}>{w[ci]}</span>
                          <span style={{ color: hex(DEC), borderBottom: `6px solid ${hex(DEC)}` }}>{w[ni]}</span>
                          {w.slice(ni + 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* "These are little words you already say every day." then "learn by sight" */}
              {frame >= cues.everyday && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 56, transform: `scale(${1 + 0.1 * Math.sin((frame / fps) * 4)})`, display: "inline-block" }}>
                    {frame >= cues.bySight ? "👁️" : "🗣️"}
                  </span>
                  <GardenChip tone={hex(frame >= cues.bySight ? DEC : HARD)} size={36}>
                    {frame >= cues.bySight ? (<>learn them <span style={{ color: hex(DEC) }}>by sight</span> — they will never trick you</>)
                      : (<>you already say these <b>every day</b></>)}
                  </GardenChip>
                </div>
              )}

              {/* they SHOULD be soft — shown, then crossed out */}
              {frame >= cues.shouldBe && frame < cues.everyday && (
                <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: font.family }}>
                  <span style={{ fontSize: 34, fontWeight: 700, color: palette.inkSoft }}>e or i after the g → should be</span>
                  <div style={{ position: "relative", background: "#fff", border: `6px solid ${hex(SOFT)}`, color: hex(SOFT), borderRadius: 20, padding: "6px 26px", fontSize: 46, fontWeight: 700 }}>
                    /j/
                    <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
                      <line x1="6%" y1="12%" x2="94%" y2="88%" stroke="#C62828" strokeWidth={9} strokeLinecap="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 36 }}>➜</span>
                  <div style={{ background: hex(HARD), color: "#fff", borderRadius: 20, padding: "6px 30px", fontSize: 46, fontWeight: 700 }}>/g/</div>
                </div>
              )}
            </>
          )}

          {/* the strategy: if soft sounds wrong, try hard — your ears decide */}
          {trick && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, fontFamily: font.family }}>
              <RuleArrow
                color={HARD}
                drawAt={cues.tryHard}
                rightAt={cues.tryHard + 22}
                label="try the other one"
                left={
                  <div
                    style={{
                      position: "relative", background: "#FFFFFF", border: `10px solid ${hex(SOFT)}`,
                      borderRadius: 34, padding: "16px 44px", fontSize: 78, fontWeight: 700,
                      color: hex(SOFT), boxShadow: slab(SOFT, 18),
                      // it "sounds strange", so the card itself sounds strange — it wobbles
                      transform: frame < cues.tryHard
                        ? `rotate(${Math.sin((frame - cues.trick) / 3.2) * 4}deg) scale(${1 + 0.03 * Math.sin((frame - cues.trick) / 5)})`
                        : "none",
                    }}
                  >
                    soft /j/
                    {frame >= cues.tryHard && (
                      <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
                        <line x1="6%" y1="14%" x2="94%" y2="86%" stroke="#C62828" strokeWidth={10} strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                }
                right={
                  <div style={{ background: tint(HARD, 0.9), border: `10px solid ${hex(HARD)}`, borderRadius: 34, padding: "16px 44px", fontSize: 78, fontWeight: 700, color: hex(HARD), boxShadow: slab(HARD, 18) }}>
                    hard /g/
                  </div>
                }
                picture={<span style={{ fontSize: 124, display: "inline-block", transform: `scale(${1 + 0.1 * Math.sin((frame / fps) * 4.2)})` }}>👂</span>}
                pictureAt={cues.ears}
              />
              {frame >= cues.ears && (
                <GardenChip tone={hex(DEC)} size={38}>your ears will tell you which one is right 👂</GardenChip>
              )}
            </div>
          )}
        </div>
      </Center>
    </>
  );
};

// ── the quiz (86–91) — green, and the answer is HARD ───────────────────────
export const GQuiz: React.FC<{ wordAt: number; askAt: number; revealAt: number; whyAt: number }> = ({ wordAt, askAt, revealAt, whyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAt;
  const tension = interpolate(frame, [revealAt - 50, revealAt], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Band top={72}><Pill size={50}>Your turn! 🤔</Pill></Band>
      <Center top={340}>
        <div style={{ display: "flex", alignItems: "center", gap: 76 }}>
          <div style={{ width: 280, height: 280, background: "#FFFFFF", border: `10px solid ${hex(revealed ? HARD : DEC)}`, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: slab(revealed ? HARD : DEC, 18), transform: `translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
            <WordArt word="green" size={170} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: font.family }}>
            <div style={{ fontSize: 130, fontWeight: 700, color: palette.ink, opacity: frame >= wordAt ? 1 : 0.2, transform: `scale(${frame >= wordAt ? 1 : 0.94})` }}>
              <span style={{ color: revealed ? hex(HARD) : hex(DEC) }}>g</span>
              <span style={{ color: revealed ? hex(DEC) : palette.ink, borderBottom: revealed ? `9px solid ${hex(DEC)}` : "none" }}>r</span>
              een
            </div>
            <div style={{ display: "flex", gap: 46 }}>
              {[{ t: "hard /g/", tone: HARD, ok: true }, { t: "soft /j/", tone: SOFT, ok: false }].map((o, i) => {
                const lit = revealed && o.ok;
                const dim = revealed && !o.ok;
                return (
                  <div
                    key={o.t}
                    style={{
                      background: lit ? hex(o.tone) : "#FFFFFF", color: lit ? "#fff" : hex(o.tone),
                      border: `9px solid ${hex(o.tone)}`, borderRadius: 30, padding: "14px 44px",
                      fontSize: 62, fontWeight: 700, whiteSpace: "nowrap", opacity: dim ? 0.3 : 1,
                      boxShadow: slab(o.tone, lit ? 22 : 13),
                      transform: `scale(${lit ? 1 + 0.14 * spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1}) rotate(${lit || dim ? 0 : wiggle(frame, fps, 2 * tension, 1.4 / tension, i)}deg)`,
                    }}
                  >
                    {o.t}{lit && <span style={{ fontSize: 46, marginLeft: 12 }}>🎉</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Center>
      {frame >= whyAt ? (
        <GSwapNote top={718} notes={[{ at: whyAt, node: <GardenChip tone={hex(DEC)} size={38}>the <span style={{ color: hex(DEC) }}>r</span> comes right after the g — not e, i or y</GardenChip> }]} />
      ) : frame >= askAt && !revealed ? (
        <GSwapNote top={718} notes={[{ at: askAt, node: <GardenChip tone={hex(DEC)} size={38}>hard, or soft? 🤔</GardenChip> }]} />
      ) : null}
    </>
  );
};

// ── the recap (92–99) ───────────────────────────────────────────────────────
// Ends on the tricky words, because this card's honest takeaway is "the rule usually works,
// and here are the ones that do not".
export const GRecap: React.FC<{ softAt: number; hardAt: number; kAt: number; trickyAt: number; wordAt: number[] }> = ({ softAt, hardAt, kAt, trickyAt, wordAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tricky = frame >= trickyAt;
  const rows = [
    { tone: SOFT, marker: "/j/", icon: "💎", line: <>before <span style={{ color: hex(DEC) }}>e, i or y</span></>, at: softAt },
    { tone: HARD, marker: "/g/", icon: "🐐", line: <>everywhere else</>, at: hardAt },
  ];
  return (
    <>
      <Band top={78}>
        <Pill size={50} still><span style={{ fontSize: 52, marginRight: 12 }}>🧠</span>Remember! ✨</Pill>
      </Band>
      <Center top={262}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
          <div style={{ display: "flex", gap: 46 }}>
            {rows.map((r, i) => {
              const lit = frame >= r.at;
              const c = hex(r.tone);
              const kick = lit ? 1 + 0.14 * Math.max(0, 1 - (frame - r.at) / 20) : 1;
              // each badge pulses only while ITS line is being spoken: the /j/ stops when the
              // hard line starts, and both stop when the tricky words arrive
              const bAt = r.marker === "/g/" ? kAt : r.at;
              const until = r.marker === "/j/" ? hardAt : trickyAt;
              const badge = frame >= bAt && frame < until;
              return (
                <div
                  key={r.marker}
                  style={{
                    background: lit ? tint(r.tone, 0.9) : "#FFFFFF",
                    border: `10px solid ${lit ? c : "#C9B79E"}`, borderRadius: 40, padding: "20px 42px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    fontFamily: font.family, minWidth: 400, opacity: lit ? 1 : 0.6,
                    boxShadow: lit ? slab(r.tone, 22) : slab("C9B79E", 10),
                    transform: `scale(${(tricky ? 0.86 : 1) * kick}) translateY(${bob(frame, fps, lit ? 8 : 5, 2.6, i)}px)`,
                  }}
                >
                  <span style={{ fontSize: 56 }}>{r.icon}</span>
                  <span style={{ fontSize: 84, fontWeight: 700, color: c, lineHeight: 1, display: "inline-block", transform: `scale(${badge ? 1 + 0.09 * Math.sin(((frame - bAt) / fps) * 6) : 1})` }}>
                    {r.marker}
                  </span>
                  <span style={{ fontSize: 34, fontWeight: 700, color: lit ? c : palette.inkSoft }}>{r.line}</span>
                </div>
              );
            })}
          </div>

          {/* the four tricky friends, each landing on its own spoken word */}
          {tricky ? (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 44 }}>⭐</span>
              {["get", "give", "girl", "gift"].map((w, i) => (
                <div
                  key={w}
                  style={{
                    background: "#FFFFFF", border: `7px solid ${hex(HARD)}`, borderRadius: 22,
                    padding: "8px 22px", fontSize: 46, fontWeight: 700, color: palette.ink, fontFamily: font.family,
                    boxShadow: slab(HARD, 12),
                    opacity: frame >= wordAt[i] ? 1 : 0.25,
                    transform: `scale(${frame >= wordAt[i] ? 0.8 + 0.2 * spring({ frame: frame - wordAt[i], fps, config: { damping: 11 } }) : 0.94}) translateY(${bob(frame, fps, 5, 2.2, i)}px)`,
                  }}
                >
                  {w.slice(0, 1)}
                  <span style={{ color: hex(DEC) }}>{w.slice(1, 2)}</span>
                  {w.slice(2)}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ transform: `scale(${spring({ frame: frame - 40, fps, config: { damping: 12 } }) * (1 + 0.06 * Math.sin((frame / fps) * 3.2))})` }}>
              <LogoBadge size={172} />
            </div>
          )}
        </div>
      </Center>
    </>
  );
};
