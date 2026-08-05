import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Mascot } from "../components/Mascot";
import { Confetti } from "../components/Confetti";
import { StoreFlow } from "../components/StoreFlow";
import { font, palette, shade } from "../data/tokens";
import { bob, wiggle, pulse } from "../lib/motion";
import { SocialIcons } from "./abacus_crosspromo";

// ══ VARIETY SHORT · PARENT TIP — "Teach the sound, not the name" ══════════════
// A voiceover-driven explainer (vo_tip_sound_not_name is one 16.5s narration, so
// it plays ONCE at the reel level and the visuals illustrate it — no letter-sound
// audio on top, it would fight the VO). Its OWN world: a calm green "tip" stage
// with floating speech bubbles + hearts, distinct from the two quiz shorts.

const FPS = 30;
const BAND_TOP = 300;
const BAND_H = 1300;
const SIDE = 80;

const HOOK_F = 84;
const CONTRAST_F = 250;
const BLEND_F = 128;
const END_F = 200;
export const PARENT_TIP_DURATION = HOOK_F + CONTRAST_F + BLEND_F + END_F;

const HEAD_SHADOW = "0 4px 0 rgba(6,40,24,0.32), 0 12px 26px rgba(6,40,24,0.32)";

// the letters most parents get wrong: NAME (crossed) → SOUND, + a word picture
const ROWS = [
  { letter: "B", name: "Bee", sound: "buh", word: "bat", image: "bat", c: "#E8368F" },
  { letter: "C", name: "Cee", sound: "kuh", word: "cat", image: "cat", c: "#2E77E6" },
  { letter: "D", name: "Dee", sound: "duh", word: "drum", image: "drum", c: "#F5A017" },
];

const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; pad?: string }> = ({ children, bg = "#fff", color = palette.ink, size = 56, pad = "12px 40px" }) => (
  <div style={{ background: bg, color, fontSize: size, fontWeight: 800, padding: pad, borderRadius: 999, boxShadow: "0 10px 0 rgba(6,40,24,0.16), 0 18px 32px rgba(6,40,24,0.28)" }}>{children}</div>
);

// ── the world ─────────────────────────────────────────────────────────────────
const FLOAT = ["💬", "💛", "💬", "⭐", "💛", "💬", "⭐", "💛"];
const FPOS = [
  { x: 90, y: 360, s: 74 }, { x: 940, y: 300, s: 86 }, { x: 150, y: 900, s: 60 },
  { x: 980, y: 980, s: 70 }, { x: 60, y: 640, s: 52 }, { x: 1010, y: 640, s: 58 },
  { x: 250, y: 1480, s: 66 }, { x: 852, y: 1520, s: 58 },
];
const BOKEH = [
  { x: 0.16, y: 0.2, r: 340 }, { x: 0.86, y: 0.16, r: 300 }, { x: 0.1, y: 0.72, r: 260 },
  { x: 0.9, y: 0.8, r: 320 }, { x: 0.5, y: 0.5, r: 420 },
];

const TipStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(160deg,#4ADE80 0%,#22C55E 46%,#0E9E76 100%)" }} />
      {BOKEH.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * width - b.r / 2, top: b.y * height - b.r / 2, width: b.r, height: b.r, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.18), transparent)" }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(760px 760px at 50% 34%, rgba(255,255,255,0.24), transparent 62%)" }} />
      {FPOS.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.x, top: p.y, fontSize: p.s, opacity: 0.5, transform: `translateY(${bob(frame, fps, 16, 3, i)}px) rotate(${wiggle(frame, fps, 9, 4, i)}deg)` }}>{FLOAT[i]}</span>
      ))}
    </AbsoluteFill>
  );
};

// ── hook ─────────────────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ fontSize: 128, lineHeight: 1, transform: `scale(${inn}) translateY(${bob(frame, fps, 10, 2.5)}px)` }}>💡</div>
        <Pill bg="#FFE14D" size={52} pad="12px 44px">PARENT TIP</Pill>
        <div style={{ fontSize: 108, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.05, transform: `scale(${inn})`, textShadow: HEAD_SHADOW }}>
          Teach the <span style={{ color: "#FFE14D" }}>SOUND</span>,<br />not the name
        </div>
        <div style={{ transform: `translateY(${bob(frame, fps, 10, 2.1)}px)`, marginTop: 6 }}><Mascot size={200} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ── contrast — the cheat sheet: NAME (crossed) → SOUND ────────────────────────
const Contrast: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ fontSize: 96, lineHeight: 1, transform: `scale(${title}) translateY(${bob(frame, fps, 8, 2.4)}px)` }}>🤐</div>
        <div style={{ transform: `scale(${title})` }}><Pill size={50} pad="12px 40px">Don't say the name 🚫</Pill></div>
        {ROWS.map((r, i) => {
          const s = spring({ frame: frame - 24 - i * 40, fps, config: { damping: 13 } });
          const strike = interpolate(frame, [24 + i * 40 + 14, 24 + i * 40 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={r.letter} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 900, boxSizing: "border-box", background: "#fff", borderRadius: 30, padding: "12px 26px", boxShadow: "0 10px 0 rgba(6,40,24,0.12), 0 18px 30px rgba(6,40,24,0.24)", transform: `scale(${s}) translateY(${bob(frame, fps, 5, 2, i)}px)` }}>
              <div style={{ width: 96, height: 96, borderRadius: 22, background: r.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 66, fontWeight: 800, color: "#fff" }}>{r.letter}</span>
              </div>
              {/* the wrong way: the letter NAME, struck through */}
              <div style={{ position: "relative", minWidth: 150, textAlign: "center" }}>
                <span style={{ fontSize: 46, fontWeight: 800, color: "#C2415F" }}>“{r.name}”</span>
                <div style={{ position: "absolute", top: "52%", left: -6, height: 8, borderRadius: 4, background: "#E23D4B", width: `${strike * 100}%` }} />
              </div>
              <span style={{ fontSize: 50, fontWeight: 800, color: "#8B93A5" }}>→</span>
              {/* the right way: the SOUND */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 34 }}>✅</span>
                <span style={{ fontSize: 56, fontWeight: 800, color: shade(r.c, 0.24) }}>{r.sound}</span>
              </div>
              {/* visual: a word that STARTS with that sound */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "auto", flexShrink: 0 }}>
                <Img src={staticFile(`letters/${r.image}.png`)} style={{ width: 84, height: 84, objectFit: "contain" }} />
                <span style={{ fontSize: 24, fontWeight: 800, color: "#6B7280", marginTop: -2 }}>{r.word}</span>
              </div>
            </div>
          );
        })}
        <div style={{ opacity: interpolate(frame, [150, 168], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Pill bg="#0E9E76" color="#fff" size={46} pad="12px 40px">Sounds — not letter names 🔊</Pill>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── blend — WHY sounds matter: they build words ───────────────────────────────
const BLEND = [
  { letter: "B", t: "buh", c: "#E8368F", from: -150 },
  { letter: "A", t: "aaa", c: "#2E77E6", from: 0 },
  { letter: "T", t: "tuh", c: "#F5A017", from: 150 },
];
const Blend: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const merge = interpolate(frame, [40, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revealed = frame >= 70;
  const pop = spring({ frame: frame - 70, fps, config: { damping: 11 } });
  const head = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={40} durationInFrames={20}><Audio src={staticFile("sfx/whoosh.mp3")} volume={0.3} /></Sequence>
      <Sequence from={70} durationInFrames={26}><Audio src={staticFile("sfx/sparkle.mp3")} volume={0.3} /></Sequence>
      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ fontSize: 90, lineHeight: 1, transform: `scale(${head}) translateY(${bob(frame, fps, 8, 2.4)}px)` }}>🧩</div>
        <Pill size={50} pad="12px 40px">Because sounds build words ✨</Pill>
        <div style={{ position: "relative", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!revealed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {BLEND.map((b, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 26, padding: "12px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: `0 10px 0 ${shade(b.c, 0.14)}`, transform: `translateX(${b.from * (1 - merge)}px)` }}>
                  <span style={{ fontSize: 82, fontWeight: 800, color: b.c, lineHeight: 1 }}>{b.letter}</span>
                  <span style={{ fontSize: 36, fontWeight: 800, color: shade(b.c, 0.22) }}>{b.t}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${0.9 + 0.1 * pop})` }}>
              <div style={{ background: "#fff", borderRadius: 34, padding: "16px 46px", boxShadow: "0 12px 0 rgba(6,40,24,0.16), 0 22px 40px rgba(6,40,24,0.3)" }}>
                <span style={{ fontSize: 120, fontWeight: 800, color: palette.ink }}>bat</span>
              </div>
              <div style={{ width: 200, height: 200, borderRadius: 34, background: "#fff", boxShadow: "0 12px 34px rgba(6,40,24,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Img src={staticFile("letters/bat.png")} style={{ width: 150, height: 150, objectFit: "contain" }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ color: "#fff", fontSize: 50, fontWeight: 800, textShadow: HEAD_SHADOW, opacity: revealed ? 1 : 0.001 }}>
          Names can't blend — sounds can! 💪
        </div>
      </div>
      <Confetti frame={frame} fps={fps} burstFrame={72} origin={{ x: 540, y: 900 }} colors={["#FFC24A", "#FFFFFF", "#8FD173", "#67E8F9", "#E8368F"]} count={28} seed={13} />
    </AbsoluteFill>
  );
};

// ── end — CTA + download (opens straight on the app's detail page, no search) ─
const PT_PHONE = { cx: 476, y0: 88, s: 0.72, top: 388, hold: 128 };
const End: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 44, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* short "it's free" download line — placeholder (z4_free); swap for a custom recording */}
      <Sequence from={70} durationInFrames={60}><Audio src={staticFile("audio/common/z4_free.mp3")} /></Sequence>

      {/* headline */}
      <div style={{ position: "absolute", top: 198, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${0.92 + 0.08 * inn})` }}>
        <div style={{ fontSize: 78, fontWeight: 800, color: "#fff", textShadow: HEAD_SHADOW, transform: `translateY(${bob(frame, fps, 6, 2.2)}px)` }}>Try it tonight! 💛</div>
        <div style={{ fontSize: 46, fontWeight: 800, color: "#FFE14D", textShadow: HEAD_SHADOW }}>Get the app — it's FREE 📲</div>
      </div>

      {/* download UI — no search, opens on the detail page, then GET → downloading → OPEN */}
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(540 - PT_PHONE.cx * PT_PHONE.s).toFixed(1)}px, ${(PT_PHONE.top - PT_PHONE.y0 * PT_PHONE.s).toFixed(1)}px) scale(${PT_PHONE.s})`, transformOrigin: "top left" }}>
        <Freeze frame={Math.min(frame, PT_PHONE.hold)}>
          <StoreFlow compact hideReviews />
        </Freeze>
      </div>

      {/* store badges + socials + follow (styled chip) */}
      <div style={{ position: "absolute", top: 1082, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: cta, transform: `translateY(${(1 - cta) * 16}px)` }}>
        <div style={{ display: "flex", gap: 22 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 262, height: "auto" }} />
          <Img src={staticFile("playstore.png")} style={{ width: 262, height: "auto" }} />
        </div>
        <SocialIcons size={72} />
        <div style={{ marginTop: 18, transform: `scale(${pulse(frame, fps, 0.03, 1.1)})` }}>
          <Pill bg="#FFE14D" size={40} pad="12px 36px">Follow @kidsenglishlearning.vedaavi</Pill>
        </div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={6} origin={{ x: 540, y: 300 }} colors={["#FFC24A", "#FFFFFF", "#8FD173", "#67E8F9"]} count={30} seed={41} />
    </AbsoluteFill>
  );
};

// ── reel ──────────────────────────────────────────────────────────────────────
export const ParentTipReel: React.FC = () => {
  const c2 = HOOK_F, c3 = HOOK_F + CONTRAST_F, c4 = HOOK_F + CONTRAST_F + BLEND_F;
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#22C55E" }}>
      <TipStage />

      {/* the whole tip is one narration — play it ONCE across the beats */}
      <Sequence from={20}><Audio src={staticFile("audio/shorts/vo_tip_sound_not_name.mp3")} /></Sequence>
      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, PARENT_TIP_DURATION - 40, PARENT_TIP_DURATION], [0, 0.05, 0.05, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={4} durationInFrames={40}><Audio src={staticFile("sfx/chime_soft.mp3")} volume={0.28} /></Sequence>

      {/* series banner */}
      <div style={{ position: "absolute", top: 70, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.16)", border: "3px solid rgba(255,255,255,0.5)", borderRadius: 999, padding: "12px 34px" }}>
          <Img src={staticFile("app_icon.png")} style={{ width: 60, height: 60, borderRadius: 14 }} />
          <span style={{ fontSize: 46, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Parent Tip 💡</span>
        </div>
      </div>

      <Sequence from={0} durationInFrames={HOOK_F}><Hook /></Sequence>
      <Sequence from={c2} durationInFrames={CONTRAST_F}><Contrast /></Sequence>
      <Sequence from={c3} durationInFrames={BLEND_F}><Blend /></Sequence>
      <Sequence from={c4} durationInFrames={END_F}><End /></Sequence>
    </AbsoluteFill>
  );
};
