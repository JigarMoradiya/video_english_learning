// ── One picture per word, for every short in the channel ────────────────────
//
// A child should meet the SAME picture for `ring` or `fox` wherever it appears — in the
// lesson, in the short, on the cover. This is the one place that decides, so the four new
// rule shorts and the seven that already ship cannot drift apart.
//
// A value starting with `img/` is real app artwork; anything else is an emoji. Emoji are
// single-codepoint wherever possible: a ZWJ sequence (👨‍⚖️) splits into its parts and
// renders as nonsense, which cost this project a re-render once already.

export const WORD_PIC: Record<string, string> = {
  // ‑ng / ‑nk
  sing: "\u{1F3A4}", ring: "\u{1F48D}", king: "img/p2/king.png", long: "img/p2/snake.png",
  sung: "\u{1F3B5}", bank: "\u{1F3E6}", pink: "\u{1F338}", sink: "\u{1F6B0}",
  junk: "\u{1F5D1}", thank: "\u{1F64F}", rink: "\u{26F8}",

  // x and w
  fox: "img/p3/fox.png", box: "\u{1F4E6}", six: "\u{1F3B2}", mix: "\u{1F963}",
  fix: "\u{1F527}", wax: "\u{1F56F}", want: "\u{1F381}", wash: "\u{1F9FC}",
  watch: "img/p3/watch.png", swan: "img/p3/swan.png", wand: "img/p3/wand.png",
  wag: "\u{1F415}",

  // the floss rule
  off: "\u{1F50C}", miss: "\u{1F3AF}", buzz: "\u{1F41D}", cliff: "\u{26F0}",
  dress: "\u{1F457}", leaf: "\u{1F343}", feel: "\u{270B}", sail: "\u{26F5}",

  // c / k / ck
  cat: "img/p3/cat.png", cup: "\u{2615}", cod: "\u{1F41F}", key: "\u{1F511}",
  kit: "\u{1F9F0}", duck: "\u{1F986}", rock: "\u{1FAA8}", sock: "\u{1F9E6}",

  // oo
  moon: "\u{1F319}", food: "\u{1F34E}", zoo: "\u{1F981}",
  book: "\u{1F4D6}", look: "\u{1F440}", good: "\u{1F44D}",

  // the vowel pairs
  rain: "\u{1F327}", train: "\u{1F682}", paint: "\u{1F3A8}",
  day: "\u{2600}", play: "\u{26BD}", stay: "\u{1F6D1}",
  boat: "\u{26F5}", coat: "\u{1F9E5}", road: "\u{1F6E3}",
  snow: "\u{2744}", grow: "\u{1F331}", show: "\u{1F3AD}",
  coin: "\u{1FA99}", boil: "\u{2668}", point: "\u{1F449}",
  boy: "\u{1F466}", toy: "\u{1F9F8}", joy: "\u{1F604}",
  cloud: "\u{2601}", house: "\u{1F3E0}", mouth: "\u{1F444}",
  cow: "\u{1F404}", now: "\u{23F0}", how: "\u{2753}",

  // ── L6 · word families (81 words) ──
  bat: "🦇",
  hat: "🎩",
  rat: "🐀",
  mat: "🛋",
  sat: "🪑",
  fat: "🐻",
  can: "🥫",
  man: "👨",
  fan: "🪭",
  ran: "🏃",
  pan: "🍳",
  van: "🚐",
  cap: "🧢",
  map: "🗺",
  nap: "😴",
  tap: "🚰",
  hen: "🐔",
  ten: "🔟",
  pen: "🖊",
  men: "👬",
  den: "🏕",
  big: "🐘",
  pig: "🐷",
  dig: "🪣",
  wig: "🦱",
  fig: "🌴",
  sit: "🪑",
  hit: "🏏",
  pit: "🕳",
  pin: "📌",
  win: "🏆",
  fin: "🦈",
  tin: "🥫",
  bin: "🗑",
  dog: "🐶",
  log: "🪵",
  fog: "🌫",
  hog: "🐖",
  jog: "🏃",
  hot: "🔥",
  pot: "🍲",
  dot: "🔴",
  cot: "🛏",
  top: "🔺",
  hop: "🐇",
  mop: "🧹",
  pop: "🎈",
  cop: "👮",
  sun: "☀️",
  run: "🏃",
  bun: "🥐",
  bug: "🐛",
  rug: "🧺",
  hug: "🤗",
  mug: "☕",
  jug: "🫙",
  ball: "⚽",
  tall: "🦒",
  wall: "🧱",
  fall: "🍂",
  call: "📞",
  mall: "🛍",
};

export const picFor = (word: string): string | null =>
  WORD_PIC[word.toLowerCase().replace(/[^a-z]/g, "")] ?? null;
