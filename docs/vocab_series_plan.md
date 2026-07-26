# Plan — Themed Vocabulary Shorts (series #2)

**Status: agreed, parked on assets.** Jigar is gathering images + audio.
Asset checklist: [`vocab_assets_needed.md`](vocab_assets_needed.md) (regenerate after adding files).
Theme word lists: [`../tools/vocab_themes.py`](../tools/vocab_themes.py).

Successor to the A–Z Letter Shorts (26 × 9:16, shipped). Same "Paper Craft
Daylight" world so the channel reads as one brand, different format so it doesn't
read as repetition.

---

## 1. Why this series

The cost driver is **assets, not code**. The app has exactly four reusable audio
sets — 1859 single-word clips, 26 letter sentences (consumed by A–Z), 27 letter
names, 26 bare phonemes. Everything else in the app uses on-device TTS and so has
no reusable audio.

That makes **single-word vocabulary** the cheapest possible next series: the words
are already recorded, and 125 of them already have an image too.

Rejected alternatives, for the record:
- **Blending (`c-a-t → cat`)** — pedagogically the better sequel and needs zero new
  audio (all 26 phonemes + 223 CVC clips exist), but only **35** CVC words have an
  image. Revisit once the vocab images land; many will overlap.
- **Numbers 1–20 / Days of the week / Colours** — 9/20, 0/7 and 9/11 audio
  coverage. Not free; need recording first.

## 2. Episode list

One episode per theme, using **every** word the theme has (no arbitrary cap).
Animals and Objects are split into real themes — "Objects" as one 79-word video
has no hook and no searchable title.

Buildable **today** with zero new assets:

| Episode | Ready words | Length |
|---|---|---|
| Wild Animals | 16 | ~34s |
| Vehicles | 14 | ~29s |
| Farm Animals | 13 | ~23s |
| In My House | 12 | ~26s |
| Fruits | 10 | ~23s |
| Toys & Play | 9 | ~22s |
| Action Words | 9 | ~22s |
| Birds | 8 | ~22s |
| Nature & Sky | 7 | ~21s |
| Opposites | 6 | ~22s |
| People | 5 | ~21s |
| Insects & Small | 5 | ~22s |
| Vegetables | 5 | ~21s |
| Shapes | 5 | ~21s |
| Sea Creatures | 4 | ~20s |
| Colours | 4 | ~20s |
| Body Parts | 6 | ~21s |
| At School | 3 | — too thin, needs its 11 images first |

Each episode grows as assets arrive — Fruits 10 → 21, Vegetables 5 → 19,
Birds 8 → 18, Vehicles 14 → 21.

**Priority asset asks** (cheapest first, from the checklist):
1. `lion` + `elephant` audio — images exist, and they're the two most recognisable
   animals in the whole series.
2. The 63 audio-only gaps (image already in the app) — Vegetables 14, Fruits 11,
   Birds 10, Vehicles 7, Shapes 6, Wild Animals 6.
3. The 85 image-only gaps — heaviest are In My House 15, Nature & Sky 12,
   At School 11, Body Parts 11.

## 3. Format

**One word at a time, large — NOT a grid.** A 2×2 grid works for 4 words (the
"More \<letter\> words" beat); at 17 it doesn't. Flashcard style: big image on a
paper card, word beneath, spoken, next slides in.

Beats:
1. **Cover** — frame 0 must be a finished thumbnail (theme title + 3–4 hero images).
2. **Words** — one at a time, each on its own clip length. Small themes (<8 words)
   get a *"say it with me"* repeat, which lifts 14s episodes to ~22s; short Shorts
   watch through badly.
3. **Recap** — "How many do you remember?" grid of everything just taught. This is
   the replay hook, and the one place a grid belongs.
4. **CTA** — different closing line per episode (repo rule).

## 4. What to reuse

Almost everything from `letter_short.tsx`:

- `PaperSky.tsx` — `paperBgFor`, `PaperMotes`, `PaperClouds`, `paperCard`,
  `ContactShadow`, `LetterRail` (becomes a word-progress rail)
- `BrandMarks` — `CardBadge` on every image card, `LOGO_BADGE_SIZE`, one logo at a time
- `Mascot`, `Confetti` (seed per theme), `CollapseRow`, `bob`/`pulse`/`wiggle`
- The per-word audio + highlight machinery from the "More \<letter\> words" beat,
  and `extraWordAudio.json`'s duration-manifest pattern — a word with no clip still
  takes its turn silently, so episodes can ship before every clip lands.

**Accent colour comes from the THEME**, not `letterColorFor` — so each episode still
gets its own sky tint, and the series stays visually separable in a Shorts feed
(see the A–Z finding: one fixed sky made six covers read as a single panorama).

## 5. New pieces needed

- `src/reels/vocab_short.tsx` — the template + registry entry builder
- `src/data/vocabThemes.ts` — theme → words, accent, intro clip (generated from
  `tools/vocab_themes.py`)
- `tools/prep_vocab_assets.py` — convert app images/audio + probe durations into a
  manifest, same shape as `prep_extra_words.py`
- a flashcard component (big card + word + contact shadow) and the recap grid

## 6. Audio to record

Word clips all exist. Only framing lines are needed — **one per episode** plus three
shared, into `public/audio/common/`:

```
intro_<theme>.mp3     "Let's learn wild animals!"   (one per episode)
say_with_me.mp3       "Now say it with me!"
how_many.mp3          "How many do you remember?"
vocab_cta.mp3         "A new word video every day — follow for more!"
```

## 7. Still owed from series #1 (A–Z)

- `cta.mp3` — "A new letter every day — follow so you don't miss tomorrow's!"
  The "Tomorrow: \<next\>" card is silent on all 25 non-Z episodes until this lands.
  3–4 takes would let it rotate per letter like the praise pool does.
- Optional: 26 cover stills as uploadable thumbnails.

## 8. Verification (carry over from A–Z — these each caught a real bug)

- Every spoken cue must land on actual audio energy, not in a gap. Whisper
  collapses repeated identical words; `tools/refine_phrase_onsets.py` re-times from
  RMS peaks. 13 of 26 letters were mistimed before that check existed.
- Render stills at **beat boundaries and mid-transition**, not resting states.
- Confirm each theme's sky colour differs (A–Z: 26 distinct, verified by sampling
  the rendered pixel).
- A wrong `staticFile` path renders **silent, not an error** — measure audio energy
  in each expected window after any path change.
