import { TPhrase } from "./timing";

// ── Light it when it is SAID ─────────────────────────────────────────────────
//
// The alignment already carries a timestamp for every word of the take. So an element on
// screen never has to be hand-timed: it declares which spoken word it belongs to, and
// lights at that word's real moment in the audio.
//
// Before this, a line like "Only F, L, S and Z double." showed all four letters lit at
// once for four seconds. Now F lights at 267.56, L at 268.84, S at 269.84, Z at 270.68 —
// the same law the captions already follow, applied to the picture.

const strip = (s: string) => s.toLowerCase().replace(/[^a-z/]/g, "");

export type Said = {
  /** has this token been spoken yet in the current line? */
  said: (token: string) => boolean;
  /** is it being spoken right now (within a short window)? */
  saying: (token: string) => boolean;
  /** 0-based position of the word being spoken, or -1 */
  at: number;
};

/**
 * Build the lighting oracle for one phrase.
 *
 * `nth` disambiguates repeats: `said("l", 1)` is not offered on purpose — where a line
 * says the same token twice, pass distinct tokens (e.g. "ll") rather than counting, so a
 * cue can never silently bind to the wrong occurrence.
 */
export const spokenIn = (
  phrase: TPhrase | undefined,
  frame: number,
  fps: number
): Said => {
  const t = frame / fps;
  const words = phrase?.words ?? [];

  let at = -1;
  for (let i = 0; i < words.length; i++) {
    if (words[i].start <= t) at = i;
    else break;
  }

  const findStart = (token: string): number | null => {
    const want = strip(token);
    if (!want) return null;
    const hits = words.filter((w) => {
      const got = strip(w.word);
      return got === want || (want.length > 1 && got.startsWith(want));
    });
    if (!hits.length) return null;
    // "Use C at the start of A word when the next letter is A, O or U" contains "a" twice:
    // the article first, the LETTER NAME last. A letter name is written capitalised in the
    // script, so prefer that; otherwise take the last occurrence, never the first.
    const named = hits.find((w) => /^[A-Z][^a-z]*$/.test(w.word.replace(/[^A-Za-z]/g, "")));
    return (named ?? hits[hits.length - 1]).start;
  };

  return {
    at,
    said: (token: string) => {
      const s = findStart(token);
      // a token the line never says stays lit — the caller is not making a timing claim
      return s === null ? true : t >= s;
    },
    saying: (token: string) => {
      const s = findStart(token);
      if (s === null) return false;
      return t >= s && t < s + 0.75;
    },
  };
};
