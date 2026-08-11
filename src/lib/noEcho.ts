// ── A caption is not a visual ────────────────────────────────────────────────
//
// This rule was written into the header of l5_rules_p1.tsx, recorded in memory, and
// enforced by hand on L5 Part 2 where 39 echo lines were stripped. It was then broken a
// third time on L6, where the reel rendered the caption STRING as the on-screen text on
// ~130 lines.
//
// Writing a rule down does not enforce it. This does: any text a scene puts on screen goes
// through `say()`, which THROWS if it repeats the line being spoken. A violation fails the
// render instead of reaching the user.

const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter(Boolean);

/**
 * @param onScreen the words a scene is about to draw
 * @param caption  the line being spoken at that moment
 */
export const say = (onScreen: string, caption: string): string => {
  const a = norm(onScreen);
  const b = new Set(norm(caption));
  if (a.length >= 3) {
    const overlap = a.filter((w) => b.has(w)).length / a.length;
    if (overlap >= 0.6) {
      throw new Error(
        `caption echo: the screen says ${JSON.stringify(onScreen)} while the teacher says ` +
        `${JSON.stringify(caption)} — ${Math.round(overlap * 100)}% the same. Show it, don't caption it.`
      );
    }
  }
  return onScreen;
};

/** words that are the LESSON OBJECT — a word being read, a letter, an ending — are never
 *  an echo, however much they match the caption. `sing` on screen while the teacher says
 *  "Sing." is the lesson, not a repetition of it. */
export const lessonWord = (s: string): string => s;
