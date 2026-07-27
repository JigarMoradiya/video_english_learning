import { PhonicsComparison } from "./types";

// Mirrored from ComparisonData.swift (phonicsComparisons).
// Pilot batch: ai_ay only. The other 15 cards get ported in Phase 3.
export const comparisons: Record<string, PhonicsComparison> = {
  ai_ay: {
    id: "ai_ay",
    cardTitle: "ai ⚡ ay",
    shortTitle: "ai vs ay",
    rule: "AI hides in the MIDDLE… AY loves being LAST!",
    explanation:
      "Both teams make the same long-A sound /ā/. The trick is WHERE the sound lives:\n• **Inside the word** → spell it **ai** (r-ai-n).\n• At the **end of a word** → English always picks **ay** (d-ay).",
    example: "rain · day",
    group: "spelling",
    hueShift: 0,
    teams: [
      { marker: "ai", colorHex: "1565C0", zoneEmoji: "🏠", zoneHint: "middle", markerAudio: "ai" },
      { marker: "ay", colorHex: "E65100", zoneEmoji: "🏁", zoneHint: "end", markerAudio: "ay" },
    ],
    quiz: [
      { word: "rain", blanked: "r__n", answerTeam: 0 },
      { word: "tail", blanked: "t__l", answerTeam: 0 },
      { word: "wait", blanked: "w__t", answerTeam: 0 },
      { word: "pain", blanked: "p__n", answerTeam: 0 },
      { word: "paint", blanked: "p__nt", answerTeam: 0 },
      { word: "mail", blanked: "m__l", answerTeam: 0 },
      { word: "chain", blanked: "ch__n", answerTeam: 0 },
      { word: "day", blanked: "d__", answerTeam: 1 },
      { word: "play", blanked: "pl__", answerTeam: 1 },
      { word: "stay", blanked: "st__", answerTeam: 1 },
      { word: "say", blanked: "s__", answerTeam: 1 },
      { word: "clay", blanked: "cl__", answerTeam: 1 },
      { word: "pray", blanked: "pr__", answerTeam: 1 },
      { word: "spray", blanked: "spr__", answerTeam: 1 },
    ],
  },

  oi_oy: {
    id: "oi_oy",
    cardTitle: "oi ⚡ oy",
    shortTitle: "oi vs oy",
    rule: "OI stays in the MIDDLE… OY jumps to the END!",
    explanation:
      "Both teams make the /oy/ sound you hear in coin and boy.\n• **Inside the word** → write **oi** (c-oi-n).\n• At the **end of the word** → write **oy** (b-oy).",
    example: "coin · boy",
    group: "spelling",
    hueShift: 45, // warm/peach mood — distinct from ai/ay
    teams: [
      { marker: "oi", colorHex: "7B1FA2", zoneEmoji: "🏠", zoneHint: "middle", markerAudio: "oi" },
      { marker: "oy", colorHex: "E65100", zoneEmoji: "🏁", zoneHint: "end", markerAudio: "oy" },
    ],
    quiz: [
      { word: "coin", blanked: "c__n", answerTeam: 0 },
      { word: "soil", blanked: "s__l", answerTeam: 0 },
      { word: "point", blanked: "p__nt", answerTeam: 0 },
      { word: "foil", blanked: "f__l", answerTeam: 0 },
      { word: "join", blanked: "j__n", answerTeam: 0 },
      { word: "boy", blanked: "b__", answerTeam: 1 },
      { word: "toy", blanked: "t__", answerTeam: 1 },
      { word: "joy", blanked: "j__", answerTeam: 1 },
      { word: "coy", blanked: "c__", answerTeam: 1 },
      { word: "enjoy", blanked: "enj__", answerTeam: 1 },
    ],
  },

  oa_ow: {
    id: "oa_ow",
    cardTitle: "oa ⚡ ow",
    shortTitle: "oa vs ow",
    rule: "OA sits in the MIDDLE… OW takes the END!",
    explanation:
      "Both teams say the long-O sound /ō/.\n• **Inside a word** → usually **oa** (b-oa-t).\n• At the **end of a word** → almost always **ow** (sn-ow).",
    example: "boat · snow",
    group: "spelling",
    hueShift: 190, // cool ocean mood
    teams: [
      { marker: "oa", colorHex: "1565C0", zoneEmoji: "🏠", zoneHint: "middle", markerAudio: "oa" },
      { marker: "ow", colorHex: "00897B", zoneEmoji: "🏁", zoneHint: "end", markerAudio: "ow" },
    ],
    quiz: [
      { word: "boat", blanked: "b__t", answerTeam: 0 },
      { word: "coat", blanked: "c__t", answerTeam: 0 },
      { word: "road", blanked: "r__d", answerTeam: 0 },
      { word: "goat", blanked: "g__t", answerTeam: 0 },
      { word: "toast", blanked: "t__st", answerTeam: 0 },
      { word: "snow", blanked: "sn__", answerTeam: 1 },
      { word: "grow", blanked: "gr__", answerTeam: 1 },
      { word: "blow", blanked: "bl__", answerTeam: 1 },
      { word: "low", blanked: "l__", answerTeam: 1 },
      { word: "yellow", blanked: "yell__", answerTeam: 1 },
    ],
  },

  // 3-way (L5 · Short Vowel Rules → "-ck Rule"). Structure mirrors ComparisonData.swift's
  // c_k_ck, but the three colorHex use the in-app L5 LESSON palette (C blue / K purple /
  // CK orange) rather than the comparison-card greens — so the video matches the Level 5
  // lesson its narration + CTA point at. Team order [c, k, ck] = Word Street left→mid→end.
  ou_ow: {
    id: "ou_ow",
    cardTitle: "ou ⚡ ow",
    shortTitle: "ou vs ow",
    rule: "OU works INSIDE… OW finishes the word, or guards the last letter!",
    explanation:
      "Both teams shout the /ow!/ sound you hear in cloud and cow.\n• **At the start or inside** → write **ou** (out, cl-ou-d).\n• At the **end**, or right before a final letter → write **ow** (c-ow, br-ow-n).",
    example: "cloud · cow",
    group: "spelling",
    // circus magenta + gold — distinct from ai/ay blue, oi/oy purple, oa/ow teal
    hueShift: 320,
    teams: [
      // 🎪 not 🏠: "house" is one of this card's own example words, and a house badge next to
      // a house card reads as a mistake
      { marker: "ou", colorHex: "C2185B", zoneEmoji: "🎪", zoneHint: "middle", zonePhrase: "inside the word", markerAudio: "ou" },
      { marker: "ow", colorHex: "F57F17", zoneEmoji: "🏁", zoneHint: "end", zonePhrase: "at the end", markerAudio: "ow" },
    ],
    quiz: [
      { word: "cloud", blanked: "cl__d", answerTeam: 0 },
      { word: "house", blanked: "h__se", answerTeam: 0 },
      { word: "mouth", blanked: "m__th", answerTeam: 0 },
      { word: "round", blanked: "r__nd", answerTeam: 0 },
      { word: "cow", blanked: "c__", answerTeam: 1 },
      { word: "now", blanked: "n__", answerTeam: 1 },
      { word: "brown", blanked: "br__n", answerTeam: 1 },
      { word: "owl", blanked: "__l", answerTeam: 1 },
    ],
  },
  c_k_ck: {
    id: "c_k_ck",
    cardTitle: "c ⚡ k ⚡ ck",
    shortTitle: "c vs k vs ck",
    rule: "C, K and CK all make /k/ — which one depends on WHERE in the word and WHAT comes before it.",
    explanation:
      "All three make the same /k/ sound!\n• At the **start** before **a, o, u** → use **c** (c-at, c-ot, c-up).\n• Before **e, i** (where c goes soft /s/, like city) → use **k** (k-ey, k-ing).\n• At the **end** right after a short vowel → use **ck** (du-ck) — two letters, one sound.",
    example: "cat · kite · duck",
    group: "spelling",
    hueShift: 120, // fresh green/street mood — distinct from the first three reels
    teams: [
      { marker: "c", colorHex: "1E88E5", zoneEmoji: "🐱", zoneHint: "before a, o, u", markerAudio: "sound_c" },
      { marker: "k", colorHex: "8E24AA", zoneEmoji: "🪁", zoneHint: "before e, i", markerAudio: "sound_k" },
      { marker: "ck", colorHex: "F57C00", zoneEmoji: "🦆", zoneHint: "after a short vowel", markerAudio: "ck" },
    ],
    quiz: [
      { word: "cat", blanked: "_at", answerTeam: 0 },
      { word: "cot", blanked: "_ot", answerTeam: 0 },
      { word: "cup", blanked: "_up", answerTeam: 0 },
      { word: "cap", blanked: "_ap", answerTeam: 0 },
      { word: "corn", blanked: "_orn", answerTeam: 0 },
      { word: "cub", blanked: "_ub", answerTeam: 0 },
      { word: "kite", blanked: "_ite", answerTeam: 1 },
      { word: "kit", blanked: "_it", answerTeam: 1 },
      { word: "key", blanked: "_ey", answerTeam: 1 },
      { word: "king", blanked: "_ing", answerTeam: 1 },
      { word: "kid", blanked: "_id", answerTeam: 1 },
      { word: "kiss", blanked: "_iss", answerTeam: 1 },
      { word: "duck", blanked: "du__", answerTeam: 2 },
      { word: "rock", blanked: "ro__", answerTeam: 2 },
      { word: "kick", blanked: "ki__", answerTeam: 2 },
      { word: "sock", blanked: "so__", answerTeam: 2 },
      { word: "back", blanked: "ba__", answerTeam: 2 },
      { word: "neck", blanked: "ne__", answerTeam: 2 },
    ],
  },

  // "Which SOUND?" — one spelling (oo), TWO sounds. NO reliable rule (see
  // feedback_no_false_rules): teach "try both + learn by sight". team0 = long 🌙,
  // team1 = short 📖. Mirrors ComparisonData.swift oo_two (L13). Cool moon vs warm book.
  oo: {
    id: "oo",
    cardTitle: "oo 🌙 ⚡ 📖",
    shortTitle: "oo — moon or book?",
    rule: "oo is usually LONG like the moon… but a small family is SHORT like a book!",
    explanation:
      "The same two letters make two sounds!\n• Most **oo** words are **long** — moon, zoo, food.\n• A small family is **short** — book, good, foot.\nThere's no strict rule — try both sounds and pick the real word. (Hint: **oo** before **k** is often short.)",
    example: "moon · book",
    group: "sound",
    hueShift: 235, // deep indigo/night mood
    teams: [
      { marker: "oo", colorHex: "5E35B1", zoneEmoji: "🌙", zoneHint: "long /oo/", markerAudio: "oo" },
      { marker: "oo", colorHex: "E65100", zoneEmoji: "📖", zoneHint: "short /u/", markerAudio: "oo2" },
    ],
    quiz: [
      { word: "moon", blanked: "moon", answerTeam: 0 },
      { word: "food", blanked: "food", answerTeam: 0 },
      { word: "zoo", blanked: "zoo", answerTeam: 0 },
      { word: "spoon", blanked: "spoon", answerTeam: 0 },
      { word: "pool", blanked: "pool", answerTeam: 0 },
      { word: "room", blanked: "room", answerTeam: 0 },
      { word: "tooth", blanked: "tooth", answerTeam: 0 },
      { word: "school", blanked: "school", answerTeam: 0 },
      { word: "book", blanked: "book", answerTeam: 1 },
      { word: "good", blanked: "good", answerTeam: 1 },
      { word: "foot", blanked: "foot", answerTeam: 1 },
      { word: "wood", blanked: "wood", answerTeam: 1 },
      { word: "cook", blanked: "cook", answerTeam: 1 },
      { word: "look", blanked: "look", answerTeam: 1 },
      { word: "hook", blanked: "hook", answerTeam: 1 },
      { word: "took", blanked: "took", answerTeam: 1 },
    ],
  },
};
