// Illustration lookup for example words.
// Preferred: a clean cutout image from the app (public/words/<word>.png).
// Fallback: a matching emoji placeholder (swap for real art later).

export const wordImages: Record<string, string> = {
  train: "words/train.png",
  snail: "words/snail.png",
  play: "words/play.png",
  rain: "words/rain.png", // rainbow umbrella cutout
  day: "words/day.png", // smiling sun cutout
  boy: "words/boy.png", // app cutout
  road: "words/road.png", // app cutout
};

// Emoji placeholders for words with no app cutout yet.
export const wordEmojis: Record<string, string> = {
  paint: "🎨",
  stay: "🏡",
  sail: "⛵",
  // oi/oy set
  coin: "🪙",
  toy: "🧸",
  soil: "🌱",
  point: "👉",
  foil: "✨",
  joy: "😄",
  coy: "😊",
  enjoy: "🥳",
  // oa/ow + oi/oy fills — illustrationFor returns null with no entry, which draws an
  // EMPTY picture box (the CkWordChip bug class), so every example word needs one.
  oil: "🛢️",
  boil: "♨️",
  annoy: "😤",
  soap: "🧼",
  slow: "🐌",
  show: "🎪",
  // c/k/ck set
  cat: "🐱",
  cot: "🛏️",
  cup: "☕",
  kite: "🪁",
  key: "🔑",
  kit: "🧰",
  king: "👑",
  duck: "🦆",
  rock: "🪨",
  kick: "🦵⚽", // kicking a ball (no single "kick" emoji)
  city: "🏙️",
  // oa/ow set (See-it lists + hook)
  boat: "🚤",
  coat: "🧥",
  goat: "🐐",
  toast: "🍞",
  snow: "❄️",
  grow: "🌱",
  blow: "💨",
  low: "⬇️",
  yellow: "🟡",
  // extra ai/ay + oi/oy words that were missing art
  join: "🤝",
  chain: "⛓️",
  tail: "🐕",
  // ai/ay 16:9 example boards — the app has no art for these three
  say: "💬",
  tray: "🍽️",
  hay: "🌾",
  // oo set — long 🌙 and short 📖
  moon: "🌙",
  food: "🍔",
  zoo: "🦁",
  spoon: "🥄",
  pool: "🏊",
  room: "🛏️",
  tooth: "🦷",
  school: "🏫",
  book: "📖",
  good: "👍",
  foot: "🦶",
  wood: "🪵",
  cook: "👨‍🍳",
  look: "👀",
  hook: "🪝",
};

export type Illustration = { kind: "image"; src: string } | { kind: "emoji"; char: string } | null;

export const illustrationFor = (word: string): Illustration => {
  if (wordImages[word]) return { kind: "image", src: wordImages[word] };
  if (wordEmojis[word]) return { kind: "emoji", char: wordEmojis[word] };
  return null;
};
