// ── position cues ────────────────────────────────────────────────────────────
// The frames a "position" lesson (ai/ay, oi/oy, oa/ow …) actually SAYS that one of its
// two spellings sits in the middle / at the end. Worlds use these to react on the word —
// the metro stop flashes, the dig site's coin seam glints — instead of sitting inert.
//
// TWO THINGS THIS GETS RIGHT, both of which were bugs first:
//
// 1. WORD timings, never phrase starts. "Remember: ai in the middle, ay at the end." is one
//    phrase whose two halves are 63 frames apart, so a phrase-start cue fires up to 58
//    frames early and cannot serve both halves.
//
// 2. NEAREST PRECEDING SPELLING WINS. A bare search for "end" is wrong:
//      ai/ay phrase 8  "She never sits at the END of a word, so ai stays in the middle."
//    is about i NOT going to the end, so flashing `ay` there teaches the opposite. Scanning
//    backwards from the word — through its own phrase, then the one before it — and taking
//    whichever spelling appears first excludes that case, while still catching
//      oi/oy  "It's oy!" / "Because it's at the END!"
//    where the spelling sits in the PREVIOUS phrase.
export interface CuePhrase {
  start: number;
  end: number;
  text?: string;
  words?: { word: string; start: number; end?: number }[];
}

const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

/**
 * @param phrases  the reel's forced-aligned timing JSON
 * @param needle   the position word, e.g. "middle" or "end"
 * @param mine     the spelling this cue belongs to, e.g. "ai"
 * @param theirs   the other spelling, e.g. "ay"
 * @param fps      frames per second
 * @returns        frames, ascending
 */
export const positionCues = (
  phrases: CuePhrase[],
  needle: string,
  mine: string,
  theirs: string,
  fps = 30
): number[] => {
  const out: number[] = [];
  phrases.forEach((ph, pi) => {
    const ws = ph.words ?? [];
    ws.forEach((w, k) => {
      if (clean(w.word) !== needle) return;
      // scan backwards: this phrase up to the word, then the whole previous phrase
      const back = [...ws.slice(0, k)].reverse().concat([...(phrases[pi - 1]?.words ?? [])].reverse());
      const hit = back.find((q) => clean(q.word) === mine || clean(q.word) === theirs);
      if (hit && clean(hit.word) === mine) out.push(Math.round(w.start * fps));
    });
  });
  return out.sort((a, b) => a - b);
};
