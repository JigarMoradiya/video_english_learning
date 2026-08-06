// ── COVER RULES v2 — built for CLICK-THROUGH, not for consistency ───────────
//
// WHY THIS FILE EXISTS ALONGSIDE ../cover.ts
// The v1 covers are well made and score 1.4% CTR on 6,600 impressions. Healthy for
// this niche is 4–6%. v1 optimises for one thing (every cover in the channel looks
// identical) and loses on another (a cover has to win a click at ~210px wide in a
// phone feed, against a wall of competitors).
//
// v2 deliberately BREAKS three of v1's rules. Each break is a measured bet, not taste:
//
//   1. PALE GROUND → DEEP SATURATED GROUND.
//      v1 grounds are cream/white, which is the same colour as YouTube's own UI, so the
//      thumbnail dissolves into the page. A dark saturated ground cuts a hard edge
//      around the tile. This is the single biggest expected gain.
//
//   2. SMALL SUBJECT → ONE GIANT SUBJECT.
//      v1 spreads 8 elements over the frame (badge, headline, subtitle, letter, image
//      card, mascot, A–Z strip, logo). At 210px that is grey mush, and the A–Z strip is
//      not merely small, it is unreadable — it spends a fifth of the canvas returning
//      nothing. v2 allows FOUR elements: badge, headline, ONE key visual, mascot+logo.
//
//   3. TINY MASCOT → BIG MASCOT WITH A FACE.
//      Faces drive click-through more than any other single element, and in kids content
//      decisively so. v1 draws the bear at 184px (8% of frame) in a corner, facing away.
//      v2 draws it at 300px, front-left, turned toward the subject.
//
// KEPT FROM v1 so the channel still reads as one channel: the gold rotated badge
// top-left, the logo bottom-right, Fredoka at weight 800, the mascot bottom-left.
//
// WHITE INK HERE, unlike v1. v1's note "do not put white text on these worlds; they are
// pale" is correct FOR v1. v2 grounds are dark, so the rule inverts: white headline with
// a dark drop, never dark ink.
//
// THE ONLY TEST THAT COUNTS: render, scale to 210px wide, and look. If the headline is
// not readable and the subject is not identifiable at that size, it does not ship.

export const GOLD = "#FFC42A";
export const BADGE_SHADOW = "0 10px 24px rgba(0,0,0,0.38)";

/** Deep saturated grounds, one per lesson — a cover still wears its own video's world,
 *  it just wears a richer version of it. Left→right so the mascot side stays darkest and
 *  the subject side lifts, which separates the bear from the key visual without a stroke. */
export const GROUND = {
  letters: "linear-gradient(105deg, #1A1250 0%, #2E1F86 46%, #4733C4 100%)",
  vowels: "linear-gradient(105deg, #241245 0%, #46228A 48%, #6A3AB0 100%)",
  blending: "linear-gradient(105deg, #06303E 0%, #0C5468 47%, #128199 100%)",
  // warm, and deliberately the only warm ground in the set — letters/vowels/blending are
  // all cool, so CVC separates from its own siblings in a subscriptions feed
  cvc: "linear-gradient(105deg, #45140A 0%, #97300F 46%, #D2571B 100%)",
} as const;

export const W = 1280;
export const H = 720;

/** Mascot geometry. mascot.png is 923×1063 and the feet are the last pixel row, so a
 *  bottom of 0 reads as cropped — v1 learned this twice. 18 gives real clearance. */
export const MASCOT = { width: 300, left: 8, bottom: 18, aspect: 1063 / 923 };
export const mascotRight = MASCOT.left + MASCOT.width;

/** Everything the key visual is allowed to occupy: clear of the mascot on the left and
 *  of the logo on the right. Assert against this in every cover rather than eyeballing —
 *  the c/k/ck video shipped overlapping panels precisely because nobody declared a band. */
export const STAGE = { left: mascotRight + 28, right: W - 150, top: 214, bottom: H - 34 };
export const stageW = STAGE.right - STAGE.left;
export const stageCx = STAGE.left + stageW / 2;

export const badge = {
  position: "absolute" as const,
  left: 22,
  top: 18,
  transform: "rotate(-11deg)",
  background: GOLD,
  color: "#1B1330",
  borderRadius: 20,
  padding: "9px 22px",
  fontSize: 38,
  fontWeight: 800 as const,
  lineHeight: 1.02,
  textAlign: "center" as const,
  boxShadow: BADGE_SHADOW,
};
export const badgeSub = { fontSize: 26 };

/** White headline, hard dark drop so it survives over the brighter end of the ground. */
export const head = {
  position: "absolute" as const,
  left: 0,
  top: 52,
  width: W,
  textAlign: "center" as const,
  color: "#FFFFFF",
  fontWeight: 800 as const,
  lineHeight: 1.02,
  letterSpacing: 1,
  textShadow: "0 7px 0 rgba(0,0,0,0.30), 0 14px 34px rgba(0,0,0,0.45)",
};

/** Cap the headline so a long title cannot run under the badge or off the frame.
 *  0.62 is Fredoka's average glyph-width ratio at weight 800. v2 sits at 128 rather than
 *  v1's 104 — bigger is the whole point, and three words is the budget. */
export const headSize = (longestLine: number, base = 128): number =>
  Math.min(base, (W - 300) / (longestLine * 0.62));

export const logo = { position: "absolute" as const, right: 22, bottom: 18, width: 96 };

/** Fail the render rather than ship an overlap. */
export const assertInStage = (label: string, left: number, right: number) => {
  if (left < STAGE.left || right > STAGE.right) {
    throw new Error(
      `coverV2: ${label} spans ${Math.round(left)}–${Math.round(right)}, stage is ${STAGE.left}–${STAGE.right}`
    );
  }
};
