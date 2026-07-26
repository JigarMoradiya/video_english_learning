import React from "react";
import { Articulation } from "../data/articulation";

// A mouth that shows the REAL articulation of a sound, not just a vowel opening.
//
// Deliberately separate from components/Mouth.tsx: that one is the Short Vowels
// videos' 5-shape ellipse and they depend on its exact look, so it stays untouched.
// This one adds the consonant places of articulation (lips shut, teeth on lip,
// tongue tip, etc.) that a child has to see to copy the sound.
//
// `open` 0..1 drives the jaw / release. Pure — takes frame in, no hooks — so it can
// be driven off any time base.

const LIP = "#EE7C8C";
const LIP_DARK = "#D9647A";
const DARK = "#5A1420";
const TEETH = "#FFFFFF";
const TONGUE = "#F49BB0";
const TONGUE_DARK = "#E07E96";

type Spec = {
  rx: number; // opening half-width  (× 78)
  ry: number; // opening half-height (× 78)
  teethTop: boolean;
  teethBottom: boolean;
  tongue: "none" | "low" | "tip" | "back" | "curl";
  teethH?: number; // teeth-row height as a fraction of the opening height
  closed?: boolean; // lips pressed together (plosives)
  protrude?: boolean; // lips pushed forward (rounding)
  lipBite?: boolean; // top teeth resting on the bottom lip
};

const SPEC: Record<Articulation, Spec> = {
  openWide: { rx: 0.9, ry: 0.98, teethTop: true, teethBottom: false, tongue: "low" },
  openMid: { rx: 0.98, ry: 0.52, teethTop: true, teethBottom: false, tongue: "low" },
  openSmall: { rx: 0.82, ry: 0.3, teethTop: true, teethBottom: false, tongue: "low" },
  roundTall: { rx: 0.56, ry: 0.82, teethTop: false, teethBottom: false, tongue: "low", protrude: true },
  openRelaxed: { rx: 0.7, ry: 0.56, teethTop: false, teethBottom: false, tongue: "low" },

  lipsClosed: { rx: 0.9, ry: 0.1, teethTop: false, teethBottom: false, tongue: "none", closed: true },
  teethLip: { rx: 0.8, ry: 0.24, teethTop: true, teethBottom: false, tongue: "none", lipBite: true },
  tongueTip: { rx: 0.8, ry: 0.48, teethTop: true, teethBottom: false, tongue: "tip" },
  // /s/ needs the two teeth rows to actually READ as teeth, so they take most of
  // the (deliberately shallow) opening and leave a thin dark slit between
  teethNarrow: { rx: 0.86, ry: 0.24, teethTop: true, teethBottom: true, tongue: "none", teethH: 0.42 },
  tongueBack: { rx: 0.76, ry: 0.6, teethTop: true, teethBottom: false, tongue: "back" },
  lipsRound: { rx: 0.34, ry: 0.4, teethTop: false, teethBottom: false, tongue: "none", protrude: true },
  lipsForward: { rx: 0.6, ry: 0.44, teethTop: true, teethBottom: false, tongue: "low", protrude: true },
  tongueCurl: { rx: 0.74, ry: 0.56, teethTop: true, teethBottom: false, tongue: "curl" },
};

export const PhonicsMouth: React.FC<{
  articulation: Articulation;
  open: number; // 0..1
  size: number;
  color: string;
}> = ({ articulation, open, size, color }) => {
  const s = SPEC[articulation];
  const o = Math.max(0, Math.min(1, open));
  const cx = 100;
  const cy = 100;
  const clip = `pm-${articulation}`;

  // ── lips pressed together: no opening at all. The "open" value becomes the
  // plosive build-and-release — the lips bulge slightly, then pop.
  if (s.closed) {
    const bulge = 1 + o * 0.16;
    const seam = 6 + o * 3;
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
        <g transform={`translate(${cx} ${cy}) scale(${bulge}) translate(${-cx} ${-cy})`}>
          <ellipse cx={cx} cy={cy} rx={82} ry={34} fill={LIP} stroke={color} strokeWidth={6} />
          {/* the seam where the lips meet */}
          <path d={`M ${cx - 74} ${cy} Q ${cx} ${cy + 8} ${cx + 74} ${cy}`} fill="none" stroke={LIP_DARK} strokeWidth={seam} strokeLinecap="round" />
          {/* upper-lip cupid's bow, so it reads as two lips not one blob */}
          <path d={`M ${cx - 30} ${cy - 16} Q ${cx} ${cy - 26} ${cx + 30} ${cy - 16}`} fill="none" stroke={LIP_DARK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
        </g>
      </svg>
    );
  }

  // ── f / v: the top teeth rest ON the bottom lip. There is essentially no dark
  // opening — the readable cue is a white teeth row biting a raised lower lip.
  // (Trying to express this as ellipse + clip produced a broken shape.)
  if (s.lipBite) {
    const bite = 0.55 + o * 0.45; // how far the lip rides up
    const teethY = cy - 14;
    const teethH = 26;
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
        {/* upper lip */}
        <path d={`M ${cx - 88} ${cy - 6} Q ${cx} ${cy - 62} ${cx + 88} ${cy - 6} Z`} fill={LIP} stroke={color} strokeWidth={6} strokeLinejoin="round" />
        {/* dark gap behind the teeth */}
        <path d={`M ${cx - 78} ${cy - 8} Q ${cx} ${cy - 40} ${cx + 78} ${cy - 8} L ${cx + 78} ${cy + 12} L ${cx - 78} ${cy + 12} Z`} fill={DARK} />
        {/* top teeth row */}
        <rect x={cx - 66} y={teethY} width={132} height={teethH} rx={7} fill={TEETH} />
        {[-40, -13, 14, 41].map((x) => (
          <line key={x} x1={cx + x} y1={teethY + 3} x2={cx + x} y2={teethY + teethH - 3} stroke="#E7E2DE" strokeWidth={2.5} />
        ))}
        {/* bottom lip pushed UP under the teeth — this is the whole cue */}
        <path
          d={`M ${cx - 92} ${cy + 60} Q ${cx} ${cy + 6 - 22 * bite} ${cx + 92} ${cy + 60} Q ${cx} ${cy + 78} ${cx - 92} ${cy + 60} Z`}
          fill={LIP}
          stroke={color}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path d={`M ${cx - 60} ${cy + 46} Q ${cx} ${cy + 20 - 16 * bite} ${cx + 60} ${cy + 46}`} fill="none" stroke={LIP_DARK} strokeWidth={4} opacity={0.55} strokeLinecap="round" />
      </svg>
    );
  }

  const rx = 78 * s.rx;
  const ry = 78 * s.ry * Math.max(0.1, o);
  const lipW = s.protrude ? 20 : 12;
  const lipRx = rx + lipW;
  const lipRy = ry + lipW;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={clip}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>

      {/* lips. Protruding sounds get a second outer ring so the pucker reads as
          coming toward the viewer rather than just being a smaller hole. */}
      {s.protrude && <ellipse cx={cx} cy={cy} rx={lipRx + 10} ry={lipRy + 10} fill={LIP_DARK} opacity={0.45} />}
      <ellipse cx={cx} cy={cy} rx={lipRx} ry={lipRy} fill={LIP} stroke={color} strokeWidth={6} />

      {/* the dark opening */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={DARK} />

      <g clipPath={`url(#${clip})`}>
        {s.teethTop && <rect x={cx - rx - 4} y={cy - ry - 2} width={rx * 2 + 8} height={Math.max(8, ry * 2 * (s.teethH ?? 0.25))} rx={9} fill={TEETH} />}
        {s.teethBottom && <rect x={cx - rx - 4} y={cy + ry - Math.max(8, ry * 2 * (s.teethH ?? 0.25))} width={rx * 2 + 8} height={Math.max(8, ry * 2 * (s.teethH ?? 0.25))} rx={9} fill={TEETH} />}

        {s.tongue === "low" && <ellipse cx={cx} cy={cy + ry * 0.62} rx={rx * 0.82} ry={ry * 0.62} fill={TONGUE} />}

        {/* tongue TIP up behind the top teeth — the whole point of t/d/n/l */}
        {s.tongue === "tip" && (
          <>
            <ellipse cx={cx} cy={cy + ry * 0.78} rx={rx * 0.8} ry={ry * 0.7} fill={TONGUE} />
            <path d={`M ${cx - rx * 0.42} ${cy + ry * 0.3} Q ${cx} ${cy - ry * 0.62} ${cx + rx * 0.42} ${cy + ry * 0.3} Z`} fill={TONGUE} stroke={TONGUE_DARK} strokeWidth={3} />
          </>
        )}

        {/* k/g — the tongue BODY humps up toward the soft palate. Drawn as a raised
            arch (not the low mound the vowels use) so it doesn't just look like
            another open mouth; the dark left under the front is the giveaway. */}
        {s.tongue === "back" && (
          <>
            <path
              d={`M ${cx - rx} ${cy + ry} L ${cx - rx} ${cy + ry * 0.34} Q ${cx} ${cy - ry * 0.42} ${cx + rx} ${cy + ry * 0.34} L ${cx + rx} ${cy + ry} Z`}
              fill={TONGUE}
            />
            <path d={`M ${cx - rx * 0.72} ${cy + ry * 0.24} Q ${cx} ${cy - ry * 0.2} ${cx + rx * 0.72} ${cy + ry * 0.24}`} fill="none" stroke={TONGUE_DARK} strokeWidth={3.5} opacity={0.6} strokeLinecap="round" />
          </>
        )}

        {/* r — the tongue tip curls UP AND BACK, leaving a hollow in front of it.
            The dip-then-rise profile is what separates this from the t/d/n/l tip. */}
        {s.tongue === "curl" && (
          <>
            <path
              d={`M ${cx - rx} ${cy + ry} L ${cx - rx} ${cy + ry * 0.5} Q ${cx - rx * 0.3} ${cy + ry * 0.86} ${cx} ${cy + ry * 0.1} Q ${cx + rx * 0.34} ${cy - ry * 0.38} ${cx + rx} ${cy + ry * 0.46} L ${cx + rx} ${cy + ry} Z`}
              fill={TONGUE}
            />
            <path d={`M ${cx - rx * 0.2} ${cy + ry * 0.5} Q ${cx + rx * 0.28} ${cy - ry * 0.16} ${cx + rx * 0.72} ${cy + ry * 0.3}`} fill="none" stroke={TONGUE_DARK} strokeWidth={3.5} opacity={0.65} strokeLinecap="round" />
          </>
        )}
      </g>

      {/* f/v — the bottom lip rides up under the top teeth. Drawn OUTSIDE the clip
          so it sits over the opening, which is what the child needs to see. */}
      {s.lipBite && (
        <path
          d={`M ${cx - rx - 14} ${cy + ry + 12} Q ${cx} ${cy - ry * 0.55} ${cx + rx + 14} ${cy + ry + 12} Z`}
          fill={LIP}
          stroke={color}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

// The face that wears it. Same construction as VowelFace so the two families look
// related, but driven by Articulation.
export const PhonicsFace: React.FC<{
  articulation: Articulation;
  open: number;
  size: number;
  color: string;
  frame: number;
  fps: number;
}> = ({ articulation, open, size, color, frame, fps }) => {
  const blink = Math.sin((frame / fps) * 2.1) > 0.96 ? 0.15 : 1;
  const eyeR = size * 0.05;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 42% 38%, #FFE7C9, #FCD3A8)",
          border: `${size * 0.02}px solid ${color}`,
          boxShadow: `0 18px 46px ${color}33`,
        }}
      />
      <div style={{ position: "absolute", left: size * 0.18, top: size * 0.56, width: size * 0.16, height: size * 0.1, borderRadius: "50%", background: `${color}33` }} />
      <div style={{ position: "absolute", right: size * 0.18, top: size * 0.56, width: size * 0.16, height: size * 0.1, borderRadius: "50%", background: `${color}33` }} />
      {[0.36, 0.64].map((ex, i) => (
        <div key={i} style={{ position: "absolute", left: size * ex - eyeR, top: size * 0.36, width: eyeR * 2, height: eyeR * 2 * blink, borderRadius: "50%", background: "#3A2A22" }} />
      ))}
      <div style={{ position: "absolute", left: "50%", top: "63%", transform: "translate(-50%,-50%)" }}>
        <PhonicsMouth articulation={articulation} open={open} size={size * 0.6} color={color} />
      </div>
    </div>
  );
};

// Openness from a list of spoken-token times: a smooth cosine bump around each,
// so the mouth moves with the narration instead of on a generic loop.
export const mouthOpenAt = (tSec: number, times: number[], w = 0.3): number => {
  let m = 0;
  for (const t of times) {
    const d = Math.abs(tSec - t);
    if (d < w) m = Math.max(m, Math.cos((d / w) * (Math.PI / 2)));
  }
  return m;
};
