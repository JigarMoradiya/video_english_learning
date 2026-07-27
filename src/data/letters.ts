// A–Z letter phonics-sound data, mirrored from the iOS app's
// LettersDatabase.all (Core/Data/Letters Generation/LettersDatabase.swift).
// - audio: the app's combined clip stem (public/audio/letters/<audio>.mp3, converted from .opus)
// - image: the app's mainWord illustration (public/letters/<image>.png)
// - timings: the app's 8 hand-tuned highlight offsets (seconds into the clip), one per spoken token:
//     [ letter · "says" · sound₁ · sound₂ · sound₃ · letter · "for" · word ]
// - durSec: full clip length (measured by tools/prep_letters.sh).
//   NOTE: what follows the 8th timing is NOT trailing silence — every clip ends with a spoken
//   EXAMPLE PHRASE ("A tiny ant walks fast", "Squawk, squawk", "A big juicy watermelon"),
//   roughly 2.5–4s of real narration. Never trim it; give it a visual beat instead.
//   The phrase text + start time per letter live in src/data/letterShorts.ts.
// - accent: a distinct per-letter theme colour (readable on the light kids background).

export interface LetterItem {
  letter: string;
  word: string;
  soundToken: string; // shown ×3 (e.g. "Aaa")
  timings: number[]; // 8 offsets, seconds
  audio: string; // mp3 stem
  image: string; // png stem
  durSec: number; // full clip seconds
  accent: string; // hex — per-letter theme colour (letter + background + token highlight)
  imageColor: string; // hex — dominant colour of the word image (drives the image-card stroke)
  extras: string[]; // more words with the same sound, each a small image tile (image key = word lowercased, non-alnum stripped)
}

export const LETTERS: LetterItem[] = [
  { letter: "A", word: "Ant", soundToken: "Aaa", audio: "a_ant_sound", image: "ant", durSec: 8.124, accent: "#1E88E5", imageColor: "#88422D", extras: ["Apple", "Alligator", "Ambulance", "Axe", "Arrow", "Antelope"], timings: [0.20, 0.75, 1.35, 1.90, 2.40, 3.40, 3.95, 4.20] },
  { letter: "B", word: "Bat", soundToken: "Buh", audio: "b_bat_sound", image: "bat", durSec: 7.158, accent: "#E53935", imageColor: "#EFC28F", extras: ["Ball", "Bear", "Banana", "Bus", "Bee", "Book"], timings: [0.20, 0.65, 1.15, 1.60, 2.00, 3.05, 3.70, 3.95] },
  { letter: "C", word: "Cat", soundToken: "Kuh", audio: "c_cat_sound", image: "cat", durSec: 7.549, accent: "#2E7D32", imageColor: "#C7753A", extras: ["Car", "Cake", "Cow", "Corn", "Cap", "Crown"], timings: [0.15, 0.70, 1.35, 1.80, 2.10, 3.25, 3.75, 4.00] },
  { letter: "D", word: "Drum", soundToken: "Duh", audio: "d_drum_sound", image: "drum", durSec: 7.549, accent: "#F57C00", imageColor: "#A92023", extras: ["Dog", "Duck", "Deer", "Door", "Doll", "Donkey"], timings: [0.20, 0.70, 1.25, 1.65, 2.05, 3.20, 3.85, 4.10] },
  { letter: "E", word: "Elephant", soundToken: "Eh", audio: "e_elephant_sound", image: "elephant", durSec: 8.829, accent: "#8E24AA", imageColor: "#6D6D6D", extras: ["Egg", "Envelope", "Eagle", "Ear", "Eye"], timings: [0.35, 0.90, 1.60, 2.10, 2.55, 3.60, 4.30, 4.65] },
  { letter: "F", word: "Fish", soundToken: "Fuh", audio: "f_fish_sound", image: "fish", durSec: 8.281, accent: "#0097A7", imageColor: "#F8A640", extras: ["Frog", "Fan", "Fox", "Flower", "Fig", "Flamingo"], timings: [0.20, 0.70, 1.45, 1.85, 2.25, 3.50, 4.10, 4.60] },
  { letter: "G", word: "Goat", soundToken: "Guh", audio: "g_goat_sound", image: "goat", durSec: 8.438, accent: "#D84315", imageColor: "#A39074", extras: ["Girl", "Gift", "Grapes", "Guitar", "Giraffe", "Guava"], timings: [0.20, 0.70, 1.50, 1.90, 2.30, 3.35, 4.05, 4.30] },
  { letter: "H", word: "Hat", soundToken: "Huh", audio: "h_hat_sound", image: "hat", durSec: 7.314, accent: "#3949AB", imageColor: "#D39154", extras: ["House", "Hand", "Hammer", "Hen", "Horse", "Heart"], timings: [0.20, 0.70, 1.50, 1.90, 2.30, 3.35, 4.05, 4.30] },
  { letter: "I", word: "Icecream", soundToken: "Ih", audio: "i_icecream_sound", image: "icecream", durSec: 7.706, accent: "#43A047", imageColor: "#94F8C7", extras: ["Igloo", "Insect", "Iron", "Ice"], timings: [0.25, 0.80, 1.35, 1.80, 2.25, 3.45, 4.20, 4.60] },
  { letter: "J", word: "Joker", soundToken: "Juh", audio: "j_joker_sound", image: "joker", durSec: 8.359, accent: "#D81B60", imageColor: "#7654A1", extras: ["Jam", "Jug", "Jacket", "Jeep", "Jar", "Jet"], timings: [0.20, 0.75, 1.55, 1.95, 2.35, 3.45, 4.10, 4.45] },
  { letter: "K", word: "Kiwi", soundToken: "Kuh", audio: "k_kiwi_sound", image: "kiwi", durSec: 8.124, accent: "#00897B", imageColor: "#785626", extras: ["Kite", "Key", "King", "Koala", "Knife", "Kangaroo"], timings: [0.20, 0.75, 1.50, 1.95, 2.50, 3.45, 4.10, 4.35] },
  { letter: "L", word: "Lion", soundToken: "Luh", audio: "l_lion_sound", image: "lion", durSec: 7.706, accent: "#F9A825", imageColor: "#AC702A", extras: ["Leaf", "Lamp", "Lemon", "Lock", "Leg", "Ladder"], timings: [0.20, 0.75, 1.50, 2.0, 2.65, 3.85, 4.65, 4.95] },
  { letter: "M", word: "Monkey", soundToken: "Mmm", audio: "m_monkey_sound", image: "monkey", durSec: 8.673, accent: "#5E35B1", imageColor: "#C8A68C", extras: ["Moon", "Mouse", "Mango", "Map", "Mitten", "Mushroom"], timings: [0.20, 0.75, 1.50, 2.00, 2.55, 3.6, 4.20, 4.45] },
  { letter: "N", word: "Nest", soundToken: "Nuh", audio: "n_nest_sound", image: "nest", durSec: 7.236, accent: "#0277BD", imageColor: "#8A765C", extras: ["Nose", "Net", "Neck", "Nurse"], timings: [0.20, 0.75, 1.60, 2.15, 2.7, 3.65, 4.25, 4.50] },
  { letter: "O", word: "Orange", soundToken: "Oh", audio: "o_orange_sound", image: "orange", durSec: 7.811, accent: "#EF6C00", imageColor: "#EF721E", extras: ["Octopus", "Ostrich", "Owl", "Onion", "Ox", "Octagon"], timings: [0.25, 0.85, 1.40, 1.8, 2.35, 3.50, 4.0, 4.50] },
  { letter: "P", word: "Parrot", soundToken: "Puh", audio: "p_parrot_sound", image: "parrot", durSec: 6.531, accent: "#AD1457", imageColor: "#A8211E", extras: ["Pig", "Pen", "Panda", "Pear", "Pot", "Peacock"], timings: [0.20, 0.75, 1.40, 1.8, 2.2, 3.30, 3.85, 4.30] },
  { letter: "Q", word: "Queen", soundToken: "Kwuh", audio: "q_queen_sound", image: "queen", durSec: 7.967, accent: "#6D4C41", imageColor: "#D85D8A", extras: ["Quilt", "Quail", "Quill", "Qtip", "Questionmark", "Quiz"], timings: [0.25, 0.85, 1.55, 2.00, 2.45, 3.50, 4.3, 4.65] },
  { letter: "R", word: "Rose", soundToken: "Ruh", audio: "r_rose_sound", image: "rose", durSec: 7.236, accent: "#C62828", imageColor: "#D72B28", extras: ["Rabbit", "Rainbow", "Robot", "Rocket", "Rat", "Ring"], timings: [0.20, 0.75, 1.25, 1.6, 2.1, 3.2, 3.9, 4.3] },
  { letter: "S", word: "Sun", soundToken: "Sss", audio: "s_sun_sound", image: "sun", durSec: 8.359, accent: "#FBC02D", imageColor: "#FBDF57", extras: ["Snake", "Star", "Spoon", "Snail", "Soap", "Ship"], timings: [0.20, 0.75, 1.65, 2.35, 2.90, 4.10, 4.70, 5.0] },
  { letter: "T", word: "Tiger", soundToken: "Tuh", audio: "t_tiger_sound", image: "tiger", durSec: 6.687, accent: "#00838F", imageColor: "#AA763D", extras: ["Train", "Tomato", "Tree", "Turtle", "Table", "Teeth"], timings: [0.20, 0.75, 1.30, 1.70, 2.10, 3.05, 3.70, 4.05] },
  { letter: "U", word: "Umbrella", soundToken: "Uh", audio: "u_umbrella_sound", image: "umbrella", durSec: 8.516, accent: "#7B1FA2", imageColor: "#DE8C3C", extras: ["Unicorn", "Ufo", "Uniform", "Utensil"], timings: [0.25, 0.85, 1.70, 2.15, 2.60, 3.75, 4.65, 4.90] },
  { letter: "V", word: "Van", soundToken: "Vuh", audio: "v_van_sound", image: "van", durSec: 8.046, accent: "#1565C0", imageColor: "#58A3C0", extras: ["Violin", "Vase", "Volcano", "Vulture"], timings: [0.20, 0.75, 1.45, 1.95, 2.35, 3.40, 4.10, 4.35] },
  { letter: "W", word: "Watermelon", soundToken: "Wuh", audio: "w_watermelon_sound", image: "watermelon", durSec: 9.404, accent: "#388E3C", imageColor: "#D62824", extras: ["Wolf", "Watch", "Wand", "Wheel", "Window", "Wood"], timings: [0.25, 0.85, 1.65, 2.20, 2.65, 3.85, 4.40, 4.95] },
  { letter: "X", word: "Xylophone", soundToken: "Ks", audio: "x_xylophone_sound", image: "xylophone", durSec: 7.549, accent: "#E64A19", imageColor: "#E2A260", extras: ["X-ray", "Fox", "Taxi", "Xenops", "Xmas-tree"], timings: [0.30, 0.95, 1.45, 1.90, 2.35, 3.60, 4.20, 4.70] },
  { letter: "Y", word: "Yoga", soundToken: "Yuh", audio: "y_yoga_sound", image: "yoga", durSec: 8.359, accent: "#7CB342", imageColor: "#FDC29F", extras: ["Yak", "Yarn", "Yacht", "Yo-yo"], timings: [0.20, 0.80, 1.5, 1.95, 2.4, 3.70, 4.50, 4.75] },
  { letter: "Z", word: "Zebra", soundToken: "Zuh", audio: "z_zebra_sound", image: "zebra", durSec: 8.594, accent: "#512DA0", imageColor: "#292521", extras: ["Zip", "Zoo", "Zero", "Zucchini", "Zigzag"], timings: [0.20, 0.80, 1.65, 2.10, 2.55, 3.70, 4.50, 4.75] },
];
