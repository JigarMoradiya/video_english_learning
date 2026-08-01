// ── THE COVER RULES ──────────────────────────────────────────────────────────
// One place for everything that must look identical on every thumbnail in the channel,
// so a new cover cannot drift: badge, headline, mascot, logo.
//
// The values are lifted from shortvowels_thumb / shortvowels_thumb_portrait, which are
// the covers the channel already ships. Import `cover(W, H)` and spread these — do NOT
// retype a number into a new thumbnail, because that is exactly how the L3 covers ended
// up with a 900-weight headline at 84px next to short_vowels' 800 at 104.
//
// WHAT EVERY COVER MUST HAVE, and nothing more — it is read at ~120px in a grid:
//   1. the gold badge, top-left, tilted        4. the mascot, bottom-left
//   2. the headline, centred, dark ink         5. the logo, bottom-right
//   3. ONE key visual (the lesson in a glance)
//
// AND MUST NOT:
//   * wear a world other than its own video's — a cover promises what the video shows
//   * draw a second mascot; a world component may already carry one for its lesson
//   * put white text on these worlds; they are pale, so ink is dark and the ground bright
//
// Portrait values scale with H because the frame is taller, not because the elements are
// "bigger" — at a 120px tile both orientations read the same.
export const GOLD = "#FFC42A";
export const BADGE_SHADOW = "0 10px 24px rgba(30,36,56,0.30)";

export const cover = (W: number, H: number) => {
  const portrait = H > W;
  return {
    badge: {
      left: portrait ? W * 0.024 : 22,
      top: portrait ? H * 0.016 : 20,
      transform: "rotate(-11deg)",
      background: GOLD,
      borderRadius: portrait ? W * 0.019 : 20,
      padding: portrait ? `${H * 0.008}px ${W * 0.021}px` : "8px 20px",
      fontSize: portrait ? H * 0.032 : 34,
      fontWeight: 800 as const,
      lineHeight: 1.05,
      textAlign: "center" as const,
      boxShadow: BADGE_SHADOW,
    },
    /** second line of the badge is a size down */
    badgeSub: { fontSize: portrait ? H * 0.023 : 24 },
    head: {
      top: portrait ? H * 0.16 : H * 0.145,
      fontSize: portrait ? H * 0.095 : 104,
      fontWeight: 800 as const,
      lineHeight: 1.04,
      letterSpacing: portrait ? 0 : 1,
    },
    mascot: {
      width: portrait ? W * 0.34 : 184,
      left: portrait ? W * 0.005 : 6,
      // mascot.png is 923×1063 with ~7px of bottom padding: the feet are the last pixel
      // row, so any positive bottom leaves it floating and any negative one crops them
      bottom: portrait ? H * 0.022 : 0,
      aspect: 1063 / 923,
    },
    /** Cap the headline size so LONG titles fit their band. The base sizes suit ~13
     * characters ("SHORT VOWELS", "CV · VC BLENDING"); "LETTER RECOGNITION" at the base
     * 104 runs under the badge at 16:9 and clean off a 1080 frame at 9:16. Pass the
     * longest LINE of the title; 0.62 is the face's average glyph-width ratio at w800. */
    headSize(longestLine: number): number {
      const base = portrait ? H * 0.095 : 104;
      const room = portrait ? W - 60 : W - 470; // 16:9 leaves the badge corner clear
      return Math.min(base, room / (longestLine * 0.62));
    },
    logo: {
      width: portrait ? W * 0.13 : 104,
      right: portrait ? W * 0.022 : 20,
      bottom: portrait ? H * 0.018 : 16,
    },
  };
};
