import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, shade } from "../data/tokens";

// ══ VEDAAVI brand intro — a 3.7s sting prepended to every video/reel ══════════
// Alive & premium: the mascot BLINKS, squash-bounces on landing, does an excited
// wiggle at the reveal and a wink at the end; the VEDAAVI letters bounce in one by
// one; a sparkle burst pops from behind the logo on the chime peak; a ground
// shadow + sunburst glow + decor parallax add depth. FIXED mint background.
// Responsive (16:9 side-by-side / 9:16 · 4:5 stacked).
// Audio NON-TONAL/non-melodic only — a jingle would re-trigger Meta's music-rights
// flag on EVERY video. See music_copyright_meta / tools/make_intro_audio.py.

const FPS = 30;
export const VEDAAVI_INTRO_DURATION = 112;

// ── tiny colour helpers ───────────────────────────────────────────────────────
const hx = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
const lighten = (h: string, a: number) => { const [r, g, b] = hx(h); return toHex(r + (255 - r) * a, g + (255 - g) * a, b + (255 - b) * a); };

const NAME = "VEDAAVI".split("");
const COLORS = ["#FF5A5A", "#FF9A1F", "#F2B705", "#3FD168", "#1FBFD4", "#4D8DFF", "#A66BFF"];
// each letter flies in from its own off-screen spot (the approved look)
const FROM = [
  { x: -680, y: -320, r: -40 }, { x: 40, y: -700, r: 24 }, { x: 680, y: -360, r: 40 },
  { x: -560, y: 620, r: -30 }, { x: 560, y: 640, r: 30 }, { x: -60, y: 760, r: -18 },
  { x: 700, y: 260, r: 46 },
];
// per-letter playful resting tilt/height
const REST = [
  { dy: 8, rot: -8 }, { dy: -18, rot: 6 }, { dy: 6, rot: -4 }, { dy: -14, rot: 7 },
  { dy: 4, rot: -6 }, { dy: -16, rot: 5 }, { dy: 12, rot: -6 },
];

const STAR = "M50 4 L61 37 L96 37 L67 58 L79 92 L50 71 L21 92 L33 58 L4 37 L39 37 Z";
const HEART = "M50 84 C18 58 6 40 6 25 C6 12 17 5 28 5 C39 5 47 13 50 21 C53 13 61 5 72 5 C83 5 94 12 94 25 C94 40 82 58 50 84 Z";
const SPARK = "M50 3 C55 33 67 45 97 50 C67 55 55 67 50 97 C45 67 33 55 3 50 C33 45 45 33 50 3 Z";

type D = { t: "star" | "spark" | "heart" | "note"; fx: number; fy: number; s: number; c: string; d: number };
const DECOR: D[] = [
  { t: "note", fx: 0.27, fy: 0.09, s: 96, c: "#FF9A1F", d: 10 }, { t: "star", fx: 0.5, fy: 0.05, s: 64, c: "#4D8DFF", d: 5 },
  { t: "note", fx: 0.69, fy: 0.08, s: 104, c: "#3FD168", d: 12 }, { t: "heart", fx: 0.14, fy: 0.13, s: 68, c: "#FF5A8A", d: 7 },
  { t: "spark", fx: 0.4, fy: 0.17, s: 56, c: "#F2B705", d: 9 }, { t: "spark", fx: 0.6, fy: 0.18, s: 46, c: "#A66BFF", d: 14 },
  { t: "note", fx: 0.87, fy: 0.15, s: 72, c: "#1FBFD4", d: 16 }, { t: "star", fx: 0.09, fy: 0.35, s: 58, c: "#FF5A5A", d: 8 },
  { t: "heart", fx: 0.93, fy: 0.36, s: 60, c: "#A66BFF", d: 11 }, { t: "star", fx: 0.06, fy: 0.74, s: 66, c: "#3FD168", d: 13 },
  { t: "spark", fx: 0.95, fy: 0.72, s: 58, c: "#FF9A1F", d: 15 }, { t: "heart", fx: 0.16, fy: 0.88, s: 58, c: "#FF5A8A", d: 12 },
  { t: "star", fx: 0.85, fy: 0.9, s: 66, c: "#4D8DFF", d: 10 }, { t: "spark", fx: 0.5, fy: 0.93, s: 52, c: "#F2B705", d: 14 },
];

const Decor: React.FC<D & { W: number; H: number; idx: number }> = ({ t, fx, fy, s, c, d, W, H, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: frame - d, fps, config: { damping: 12 } });
  const yb = Math.sin(frame * 0.09 + fx * 22) * 9;
  const rot = Math.sin(frame * 0.06 + fx * 10) * 8;
  // DEPTH PARALLAX: bigger element = "closer" → drifts more, on a slow cycle.
  const par = Math.sin(frame * 0.02 + fx * 6) * (s * 0.06);
  const parY = Math.cos(frame * 0.017 + fy * 5) * (s * 0.03);
  const gid = `ve-g${idx}`;
  const style: React.CSSProperties = { position: "absolute", left: fx * W - s / 2, top: fy * H - s / 2, transform: `translate(${par}px, ${(1 - inn) * -60 + yb + parY}px) scale(${inn}) rotate(${rot}deg)`, filter: "drop-shadow(0 5px 7px rgba(60,90,40,0.22))" };
  const grad = (
    <radialGradient id={gid} cx="36%" cy="30%" r="75%">
      <stop offset="0%" stopColor={lighten(c, 0.5)} /><stop offset="55%" stopColor={c} /><stop offset="100%" stopColor={shade(c, 0.16)} />
    </radialGradient>
  );
  if (t === "note") {
    return (
      <svg width={s} height={s * 1.16} viewBox="0 0 64 78" style={style}>
        <defs>{grad}</defs>
        <rect x="34" y="8" width="7" height="46" rx="3" fill={`url(#${gid})`} />
        <path d="M34 8 C48 8 57 15 59 30 C53 21 44 20 41 25 L41 12 Z" fill={`url(#${gid})`} />
        <ellipse cx="20" cy="56" rx="16" ry="12" fill={`url(#${gid})`} transform="rotate(-18 20 56)" />
        <ellipse cx="15" cy="51" rx="5" ry="3.4" fill="#fff" opacity="0.5" transform="rotate(-18 15 51)" />
      </svg>
    );
  }
  const path = t === "star" ? STAR : t === "heart" ? HEART : SPARK;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={style}>
      <defs>{grad}</defs>
      <path d={path} fill={`url(#${gid})`} stroke={shade(c, 0.24)} strokeWidth={t === "spark" ? 0 : 3} strokeLinejoin="round" />
      <ellipse cx="38" cy="30" rx="14" ry="9" fill="#fff" opacity="0.42" transform="rotate(-20 38 30)" />
    </svg>
  );
};

// ── glossy candy letter — flies in from its own off-screen spot (approved look) ──
const Letter: React.FC<{ ch: string; color: string; size: number; i: number }> = ({ ch, color, size, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - 14 - i * 4, fps, config: { damping: 13, stiffness: 120 } });
  const f = FROM[i], rest = REST[i];
  const dark = shade(color, 0.32);
  const e = size * 0.02;
  const idle = Math.sin(frame * 0.08 + i) * 3;
  const tx = (1 - sp) * f.x;
  const ty = (1 - sp) * f.y + sp * rest.dy + idle;
  const rot = (1 - sp) * f.r + sp * rest.rot;
  return (
    <span
      style={{
        fontSize: size, fontWeight: 800, color, lineHeight: 0.9, display: "inline-block",
        WebkitTextStroke: `${size * 0.05}px ${dark}`,
        paintOrder: "stroke fill" as unknown as undefined,
        textShadow: `0 ${e}px 0 ${dark}, 0 ${e * 2}px 0 ${dark}, 0 ${e * 3}px 0 ${dark}, 0 ${e * 4}px ${size * 0.08}px rgba(30,60,20,0.32)`,
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sp})`,
      }}
    >{ch}</span>
  );
};

// ── sparkle burst that pops from behind the logo at the chime peak ─────────────
const BURST = Array.from({ length: 16 }, (_, i) => ({
  ang: (i / 16) * Math.PI * 2 + (i % 2) * 0.19,
  dist: 0.85 + ((i * 37) % 55) / 100,
  sz: 15 + ((i * 53) % 20),
  c: ["#FF5A5A", "#FF9A1F", "#F2B705", "#3FD168", "#1FBFD4", "#4D8DFF", "#A66BFF", "#FF5A8A"][i % 8],
  delay: (i % 3) * 2,
}));
const SparkleBurst: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: size / 2, top: size * 0.5, width: 0, height: 0 }}>
      {BURST.map((p, i) => {
        const t = interpolate(frame, [50 + p.delay, 82 + p.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (t <= 0 || t >= 1) return null;
        const travel = t * p.dist * size * 0.95;
        const x = Math.cos(p.ang) * travel, y = Math.sin(p.ang) * travel;
        const sc = interpolate(t, [0, 0.3, 1], [0, 1, 0.55]);
        const op = interpolate(t, [0, 0.15, 0.7, 1], [0, 1, 1, 0]);
        return (
          <svg key={i} width={p.sz} height={p.sz} viewBox="0 0 100 100"
            style={{ position: "absolute", left: x - p.sz / 2, top: y - p.sz / 2, transform: `scale(${sc}) rotate(${t * 200}deg)`, opacity: op, filter: "drop-shadow(0 2px 3px rgba(60,90,40,0.25))" }}>
            <path d={SPARK} fill={p.c} />
            <ellipse cx="40" cy="32" rx="12" ry="8" fill="#fff" opacity="0.5" />
          </svg>
        );
      })}
    </div>
  );
};

const MascotFace: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: frame - 4, fps, config: { damping: 9, stiffness: 118, mass: 0.9 } });
  const clamped = Math.min(1, inn);
  const bob = Math.sin(frame * 0.08) * 7 * clamped;
  const sway = Math.sin(frame * 0.045) * 2.5;
  // excited happy shimmy right at the reveal, then it calms down
  const exc = frame >= 48 ? Math.sin((frame - 48) * 0.62) * 7 * Math.exp(-(frame - 48) * 0.05) : 0;
  const baseRot = (1 - clamped) * -16 + clamped * (-6 + sway);
  const rot = baseRot + exc;
  // squash-and-stretch from the landing overshoot
  const over = inn - 1;
  const sx = inn + over * 0.6;
  const sy = inn - over * 0.6;

  // ground shadow breathes with the bob (up → smaller/lighter)
  const shadowScaleX = 1 - (bob / size) * 1.2;
  const shadowOp = interpolate(clamped, [0, 1], [0, 0.30]) * (1 - (bob / size) * 1.4);
  // sunburst glow ramps in as the bear lands
  const glowOp = interpolate(frame, [22, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
      {/* sunburst glow + slow rays behind the bear */}
      <div style={{ position: "absolute", left: size / 2 - size * 0.9, top: size * 0.5 - size * 0.9, width: size * 1.8, height: size * 1.8, borderRadius: "50%", opacity: glowOp, transform: `rotate(${frame * 0.5}deg)`, background: "repeating-conic-gradient(from 0deg, rgba(255,243,190,0.20) 0deg 6deg, transparent 6deg 24deg)", WebkitMaskImage: "radial-gradient(closest-side, #000 30%, transparent 68%)", maskImage: "radial-gradient(closest-side, #000 30%, transparent 68%)" }} />
      <div style={{ position: "absolute", left: size / 2 - size * 0.8, top: size * 0.5 - size * 0.8, width: size * 1.6, height: size * 1.6, borderRadius: "50%", opacity: glowOp, background: "radial-gradient(closest-side, rgba(255,247,205,0.6), rgba(255,240,190,0.16) 46%, transparent 70%)" }} />

      {/* ground shadow */}
      <div style={{ position: "absolute", left: size / 2 - size * 0.3, top: size * 0.9, width: size * 0.6, height: size * 0.12, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(45,75,25,0.5), transparent)", transform: `scaleX(${shadowScaleX})`, opacity: shadowOp, filter: "blur(3px)" }} />

      {/* the animated bear (with eyelids that ride along) */}
      <div style={{ position: "relative", width: size, height: size, transform: `translateY(${bob}px) rotate(${rot}deg) scale(${sx}, ${sy})`, transformOrigin: "50% 66%", opacity: interpolate(frame, [3, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <Img src={staticFile("intro/mascot_face.png")} style={{ width: size, height: "auto", display: "block", filter: "drop-shadow(0 14px 18px rgba(60,90,40,0.28))" }} />
      </div>

      {/* reveal sparkle burst (paints over the bear) */}
      <SparkleBurst size={size} />
    </div>
  );
};

const Name: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
    {NAME.map((ch, i) => <Letter key={i} ch={ch} color={COLORS[i]} size={size} i={i} />)}
  </div>
);

const Tagline: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sub = spring({ frame: frame - 56, fps, config: { damping: 13 } });
  return (
    <div style={{ opacity: sub, transform: `translateY(${(1 - sub) * 20}px) scale(${0.9 + 0.1 * sub})` }}>
      <div style={{ background: "linear-gradient(180deg,#67A2FF,#4D8DFF)", color: "#fff", fontSize: size, fontWeight: 800, letterSpacing: 2, padding: "11px 40px", borderRadius: 999, boxShadow: "0 8px 0 rgba(40,90,160,0.42), 0 18px 28px rgba(40,90,160,0.3), inset 0 2px 0 rgba(255,255,255,0.4)" }}>
        Kids&nbsp;English&nbsp;Learning
      </div>
    </div>
  );
};

const BOKEH = [{ x: 0.2, y: 0.28, r: 300 }, { x: 0.82, y: 0.24, r: 260 }, { x: 0.14, y: 0.78, r: 240 }, { x: 0.88, y: 0.8, r: 280 }];

export const VedaaviIntroReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const landscape = W > H;

  // gentle diagonal shine sweep across the logo once it settles
  const shineX = interpolate(frame, [58, 88], [-W * 0.5, W * 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shineOp = interpolate(frame, [58, 66, 80, 88], [0, 0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(170deg,#EAF8E0 0%,#DBF3D0 55%,#CDEEC4 100%)" }} />
      {BOKEH.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * W - b.r / 2, top: b.y * H - b.r / 2, width: b.r, height: b.r, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.5), transparent)" }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(920px 920px at 50% 34%, rgba(255,255,255,0.55), transparent 62%)" }} />

      {/* WARM blooming reveal chime — soft xylophone/synth notes that swell in with
          NO attack transient (no "hit on the ear"), rise to the settle, then land on a
          warm root. Pentatonic + non-melodic → still safe for Meta on every video. */}
      <Sequence from={4} durationInFrames={120}><Audio src={staticFile("sfx/intro_sting.mp3")} volume={1} /></Sequence>

      {DECOR.map((e, i) => <Decor key={i} {...e} W={W} H={H} idx={i} />)}

      {landscape ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <MascotFace size={470} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Name size={168} />
            <Tagline size={50} />
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <MascotFace size={510} />
          <Name size={150} />
          <Tagline size={46} />
        </div>
      )}

      {/* shine sweep — a premium gloss pass */}
      <div style={{ position: "absolute", top: -H * 0.2, left: shineX, width: W * 0.16, height: H * 1.4, transform: "rotate(14deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)", opacity: shineOp, mixBlendMode: "screen", pointerEvents: "none" }} />

      {/* soft vignette for depth */}
      <AbsoluteFill style={{ background: "radial-gradient(130% 120% at 50% 44%, transparent 62%, rgba(50,85,35,0.16) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
