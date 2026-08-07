import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../components/Watermark";
import { EndCard } from "../components/EndCard";
import { Band, Beat, Block, C, Dots, INK, Mark, Pill, Icon, Plate, Sky, Stack, Tag, Title, Word } from "../components/Glossy";

// ── REEL · c / k / ck · 9:16 ─────────────────────────────────────────────────
//
// Silent, like its sister reel, and wearing a different world on purpose: glossy
// extruded blocks on a pastel sky, where the doubling reel is flat sticker on white.
//
// The teaching order is the app's own: c before a·o·u → k before e·i → ck at the end
// after a short vowel → the three spellings that are never right.

const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
export const RULE_CK_DURATION = S(40);
// the recap HOLDS until the download card takes over — no empty frame between them
const END = S(34.6);
const RECAP_END = END;

const CUES: [number, string, number][] = [
  [S(1.2), "question", 0.30],
  [S(3.8), "chime_soft", 0.26],
  [S(6.4), "pop", 0.28], [S(8.2), "pop", 0.28], [S(10.0), "pop", 0.28],
  [S(13.0), "blend", 0.28],
  [S(14.6), "pop", 0.28], [S(16.4), "pop", 0.28], [S(18.2), "pop", 0.28],
  [S(21.0), "blend", 0.28],
  [S(22.6), "pop", 0.28], [S(24.4), "pop", 0.28], [S(26.2), "pop", 0.28],
  [S(28.4), "boing", 0.30], [S(29.8), "boing", 0.30], [S(31.2), "boing", 0.30],
  [S(32.6), "sparkle", 0.32],
];

const C_WORDS = ["cat", "cup", "cod"];
const K_WORDS = ["key", "kit", "king"];
const CK_WORDS = ["duck", "rock", "sock"];
const WRONG = ["kat", "ducc", "dukk"];


export const RuleCkReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  const ci = Math.floor((frame - S(6.2)) / S(1.8));
  const ki = Math.floor((frame - S(14.4)) / S(1.8));
  const cki = Math.floor((frame - S(22.4)) / S(1.8));
  const wi = Math.floor((frame - S(28.2)) / S(1.4));

  return (
    <AbsoluteFill>
      <Sky />

      {CUES.map(([at, file, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
        </Sequence>
      ))}

      {/* the rule, always on screen, so the reel says what it is about from frame 1 */}
      {frame < END && (
        // centred in the space LEFT OF THE LOGO, not on the frame — centring on the frame
        // put a 600px pill under a logo that starts at x819 however small the type got
        <div style={{ position: "absolute", left: 0, top: height * 0.055, width: "76%", display: "flex", justifyContent: "center" }}>
          <div style={{
            // sized to CLEAR the corner logo: the first version was 38 characters at 50px,
            // which needs ~1144px in a 1080 frame — cut at both edges and under the logo
            padding: "13px 26px", borderRadius: 999, background: INK, color: "#FFFFFF",
            fontFamily: "inherit", fontWeight: 800, fontSize: 33, letterSpacing: 0.8,
            transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
          }}>
            THE  C · K · CK  RULE
          </div>
        </div>
      )}

      {/* ① HOOK — one sound, three spellings, which goes in the slot? */}
      <Beat from={0} to={S(3.6)}>
        <Stack gap={64}>
          <Title text="/k/" size={190} at={S(0.2)} color={C.ck} />
          <Title text="one sound" size={62} at={S(0.6)} />
          <div style={{ display: "flex", gap: 26 }}>
            <Block ch="c" size={168} color={C.c} at={S(1.2)} />
            <Block ch="k" size={168} color={C.k} at={S(1.4)} seed={1} />
            <Block ch="ck" size={210} color={C.ck} at={S(1.6)} seed={2} />
          </div>
          <Title text="three spellings" size={62} at={S(2.0)} />
        </Stack>
      </Beat>

      {/* ② TITLE */}
      <Beat from={S(3.6)} to={S(6.0)}>
        <Stack gap={56}>
          <Title text="WHICH ONE?" size={126} at={S(3.7)} color={C.ck} />
          <Title text="there is a rule" size={64} at={S(4.2)} />
        </Stack>
      </Beat>

      {/* ③ c before a o u */}
      <Beat from={S(6.0)} to={S(13.0)}>
        <Band color={C.c} at={S(6.1)} top={height * 0.305} height={height * 0.35} />
        <Stack gap={54}>
          <Tag text="RULE 1" at={S(6.1)} />
          <Pill text="c  BEFORE  a · o · u" color={C.c} size={64} at={S(6.2)} onBand />
          {ci >= 0 && ci < C_WORDS.length && (() => {
            const w = C_WORDS[ci];
            const at = S(6.2) + ci * S(1.8);
            return <Plate key={w} at={at}><Word text={w} size={182} at={at} colors={{ 0: C.c, 1: C.sun }} stagger={2} /></Plate>;
          })()}
          <Mark kind="yes" at={S(6.7)} size={118} />
        </Stack>
        <Dots total={3} on={Math.max(0, Math.min(2, ci))} y={height * 0.80} color={C.c} />
      </Beat>

      {/* ④ k before e i */}
      <Beat from={S(13.0)} to={S(21.0)}>
        <Band color={C.k} at={S(13.1)} top={height * 0.305} height={height * 0.35} tilt={2.5} />
        <Stack gap={54}>
          <Tag text="RULE 2" at={S(13.1)} />
          <Pill text="k  BEFORE  e · i" color={C.k} size={64} at={S(13.2)} onBand />
          {ki >= 0 && ki < K_WORDS.length && (() => {
            const w = K_WORDS[ki];
            const at = S(14.4) + ki * S(1.8);
            return <Plate key={w} at={at}><Word text={w} size={182} at={at} colors={{ 0: C.k, 1: C.sun }} stagger={2} /></Plate>;
          })()}
          <Mark kind="yes" at={S(13.6)} size={118} />
        </Stack>
        <Dots total={3} on={Math.max(0, Math.min(2, ki))} y={height * 0.80} color={C.k} />
      </Beat>

      {/* ⑤ ck at the end, after a short vowel */}
      <Beat from={S(21.0)} to={S(28.2)}>
        <Band color={C.ck} at={S(21.1)} top={height * 0.295} height={height * 0.37} />
        <Stack gap={50}>
          <Tag text="RULE 3" at={S(21.1)} />
          <Pill text="ck  at the  END" color={C.ck} size={64} at={S(21.2)} onBand />
          <Pill text="AFTER  a short vowel" color={C.ck} size={46} at={S(21.5)} onBand />
          {cki >= 0 && cki < CK_WORDS.length && (() => {
            const w = CK_WORDS[cki];
            const at = S(22.4) + cki * S(1.8);
            const head = w.slice(0, w.length - 2);
            return (
              <Plate key={w} at={at}>
                {head.split("").map((ch, i) => (
                  <Block key={i} ch={ch} size={164} color={i === 1 ? C.sun : "#EEF1F7"} at={at + i * 2} seed={i} />
                ))}
                <Block ch="ck" size={210} color={C.ck} at={at + 4} seed={5} />
              </Plate>
            );
          })()}
          <Mark kind="yes" at={S(21.9)} size={118} />
        </Stack>
        <Dots total={3} on={Math.max(0, Math.min(2, cki))} y={height * 0.80} color={C.ck} />
      </Beat>

      {/* ⑥ never these */}
      <Beat from={S(28.2)} to={S(32.4)}>
        <Band color={C.bad} at={S(28.3)} top={height * 0.295} height={height * 0.37} tilt={2.5} />
        <Stack gap={54}>
          {/* white on the solid red band — as C.bad it was red text on red */}
          <Title text="NEVER" size={126} at={S(28.3)} color="#FFFFFF" />
          {wi >= 0 && wi < WRONG.length && (() => {
            const w = WRONG[wi];
            const at = S(28.2) + wi * S(1.4);
            return (
              <div key={w} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
                <Plate at={at}><Word text={w} size={152} at={at} colors={{}} stagger={2} /></Plate>
                <Mark kind="no" at={at + 4} size={118} />
              </div>
            );
          })()}
        </Stack>
      </Beat>

      {/* ⑦ RECAP */}
      <Beat from={S(32.4)} to={RECAP_END}>
        <Stack gap={40}>
          <Icon glyph={"\u{1F9E0}"} at={S(32.3)} size={150} />
          <Title text="REMEMBER" size={72} at={S(32.4)} color={INK} />
          <Pill text="c  BEFORE  a o u" color={C.c} size={54} at={S(32.5)} />
          <Pill text="k  BEFORE  e i" color={C.k} size={54} at={S(32.7)} />
          <Pill text="ck  AFTER a short vowel,  at the END" color={C.ck} size={40} at={S(32.9)} />
        </Stack>
      </Beat>

      {/* ⑧ DOWNLOAD */}
      <Beat from={END} to={RULE_CK_DURATION}>
        <EndCard at={END + 3} sub="Every phonics rule inside" bg="rgba(255,255,255,0.94)" />
      </Beat>

      {frame < END && <Watermark corner="tr" widthFrac={0.19} pad={54} opacity={0.9} />}
    </AbsoluteFill>
  );
};
