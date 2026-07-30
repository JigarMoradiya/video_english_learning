# Content & Production Plan — phonics-sequenced release across YouTube, Facebook, Instagram

## Context

Two long videos are posted (`letters_phonics`, `short_vowels`) plus 4 of the 26 A–Z
letter reels. Everything built so far was made **card-first** — whichever comparison
card was interesting next — so the catalogue does not teach in phonics order. A child
who finds the channel meets `ge/dge` before they have met soft `g`.

Three things need fixing at once:

1. **Sequence.** Posting should follow the app's own 28-level phonics order, so the
   channel is a curriculum and not a pile of tips.
2. **Formats.** Every long video needs a 4:5 for Facebook; every video and reel needs
   a thumbnail. Only 2 of 15 landscape videos have a 4:5 today, and thumbnails exist
   for 2 lessons.
3. **The 4:5 conversion keeps repeating the same layout mistakes** — letterboxing,
   overlaps, wrong store outro, background cutting to white. Those need to be enforced
   by code, not remembered.

Target cadence, confirmed: **1 reel per day + 2 long videos per week.**

---

## 1. Format → platform matrix

| Format | Size | YouTube | Facebook | Instagram |
|---|---|---|---|---|
| Long lesson | 1920×1080 | ✅ primary | — | — |
| Long lesson | 1080×1350 | — | ✅ primary | — |
| Reel / short | 1080×1920 | ✅ Shorts | ✅ Reels | ✅ primary |
| Thumbnail | 1280×720 | ✅ | — | — |
| Thumbnail | 1080×1350 | — | ✅ | — |
| Thumbnail / cover | 1080×1920 | ✅ Shorts | ✅ | ✅ |

**Instagram (my call, as delegated):** reels only — no long-form. Two additions worth
making because the assets already exist:
- **Carousels** from the 26 rendered `poll_letters/*.png` (1080×1080) and `post-quiz-q`
  — a "guess the sound" swipe post costs nothing new.
- **Covers**: Instagram shows the cover in the grid. Frame 0 of every reel is already
  required to be a finished cover (repo rule), so this is an export, not a design job.

---

## 2. What exists today

Verified against `src/reels/index.ts` and `out/`.

- **15 landscape videos**, all rendered
- **42 portrait videos** — 16 lessons + all 26 A–Z letter shorts
- **2 4:5 videos** — `letters_phonics`, `short_vowels`
- **11 of 16 comparison cards** have 16:9 + 9:16; **none** has a 4:5
- **Levels with a finished LESSON video: 2 of 28** — L1 (`letters_phonics`) and
  L2 (`short_vowels`). Those two only.
- **Levels with partial compare-card coverage, no lesson video: 5** — L5, L10, L13,
  L14, L19. A comparison video is **not** a level lesson: `ai/ay` teaches one
  discrimination *inside* Vowel Teams, it does not teach L13. And the compare series is
  itself unfinished (11 of 16 cards).
- **Levels with nothing: 21** — L3, 4, 6, 7, 8, 9, 11, 12, 15, 16, 17, 18, 20, 21, 22,
  23, 24, 25, 26, 27, 28 — plus 4 capstone features.

**Scripts are written fresh, per level.** `Phonics_Scripts.html` is NOT the source —
do not script from it. Every lesson follows the standing workflow: write the script →
Jigar confirms it → record → build. That gate exists because a script built without
confirmation has had to be thrown away before.

**Fix first:** `out/letters_phonics.mp4` and `out/short_vowels.mp4` are older than their
sources — both landscape masters were stale — re-rendered and verified ✅.

---

## 3. The release spine — 28 levels, compares slotted in

Order is authoritative from `PhonicsReadingLevelsView.swift` → `phonicsLevelItems`.
Never iterate `PhonicsListenLevelKey.allCases` — its declaration order is legacy and is
**not** the teaching order.

Comparison cards release at the level whose rule they discriminate, so they stop being
a parallel series:

"Lesson" = the level's own teaching video. "Compares" = discrimination cards that sit
inside that level. A level is only covered when its **lesson** exists.

| Level | Title | Lesson | Compare cards inside this level |
|---|---|---|---|
| 1 | Letter Sounds | ✅ done | — |
| 2 | Short Vowels | ✅ done | — |
| 3 | 2-Sound Blending | **new** | — |
| 4 | CVC Words | **new** | — |
| 5 | Short Vowel Spelling Rules | **needed** | `c_k_ck` ✅ |
| 6 | Word Families | **new** | — |
| 7 | Beginning Blends | **new** | — |
| 8 | Ending Blends | **new** | — |
| 9 | Digraphs | **new** | `th_two` ⚠ |
| 10 | Special Endings | **needed** | `ch_tch` ✅ · `ge_dge` ✅ |
| 11 | Open Syllable | **new** | — |
| 12 | Magic E | **new** | — |
| 13 | Vowel Teams | **needed** | `ai_ay` ✅ · `oa_ow` ✅ · `oo` ✅ · `ea_two` ⚠ · `ow_two` ⚠ |
| 14 | Diphthongs | **needed** | `oi_oy` ✅ · `ou_ow` ✅ · `au_aw` ✅ |
| 15 | R-Controlled Vowels | **new** | — |
| 16 | igh & gh Patterns | **new** | — |
| 17 | Y as a Vowel | **new** | — |
| 18 | 3-Letter Blends | **new** | — |
| 19 | Soft C & Soft G | **needed** | `c_two` ✅ · `g_two` ✅ |
| 20 | Silent Letters | **new** | — |
| 21 | Word Endings | **new** | `ed_two` ⚠ |
| 22 | Prefixes | **new** | — |
| 23 | Suffixes | **new** | `tion_sion` ⚠ |
| 24 | Contractions | **new** | — |
| 25 | Consonant + -le | **new** | — |
| 26 | Compound Words | **new** | — |
| 27 | Syllable Division | **new** | the "rabbit rule" reels belong here |
| 28 | Sight Words | **new** | — |
| — | Reading Ladder · Word Detective · Super Quiz | **new** | capstones, after L28 |

⚠ = card exists in the app (`ComparisonData.swift`, 16 cards) but is **not ported** to
`src/data/comparisons.ts`, so no composition exists. 5 cards / 10 videos outstanding.

**Long-form total: 26 level lessons (L3–L28) + 4 capstones + 5 remaining compare cards
= 35 pieces.** At 2/week that is ~18 weeks. Only L1 and L2 need no new narration — just
their 4:5 (done) and thumbnails.

Note the five levels that have compare cards but no lesson (L5, L10, L13, L14, L19) each
still need their lesson written and recorded. Their existing compare videos are a bonus
inside the level, not a substitute for it.

---

## 4. Reel streams

Five streams feed the daily reel, cheapest first.

**A. A–Z letter shorts — 22 remaining.** Built and rendered; 4 posted. Pure posting
work, ~3 weeks of runway.

**B. Long-form 9:16 cuts — 1+ per long video.** Established workflow
(`tools/cut_audio.py`, speech-region driven). A 3-minute lesson can yield 2–3 shorts,
not just one, which materially extends supply.

**C. English facts — 32 available now.** The app has two banks:
- 8 phonics facts, verbatim, in `ComparisonData.swift` → `phonicsFunFacts` (line 766).
  Ideal, because each one *is* a phonics rule.
- 24 true/false facts in `FunFactBank.swift` — general knowledge, good for a
  "guess before the reveal" format.

More fact ideas, as asked. The strongest reinforce phonics rather than being trivia:

*Phonics-reinforcing — use these first:*
1. English has ~44 sounds but only 26 letters — that's why letters team up.
2. "ough" says 6 different things: though, through, tough, cough, bough, thought.
3. Silent letters aren't mistakes — spelling froze while pronunciation kept changing.
4. `rhythm` has no vowel letters at all — y does the whole job.
5. Only one everyday word ends in `-mt`: *dreamt*.
6. `bookkeeper` has three double letters in a row.
7. `almost` is the longest word with its letters in alphabetical order.
8. Every syllable needs a vowel sound — that's why clapping counts syllables.
9. `-ck` never starts a word, only ends one.
10. No English word ends in `q`.

*Alphabet / letter trivia:*
11. The dot on `i` and `j` has a name — a *tittle*.
12. `&` was once taught as the 27th letter of the alphabet.
13. "The quick brown fox jumps over the lazy dog" uses all 26 letters.
14. `E` is the most common letter; `Z` the rarest.
15. *Alphabet* comes from the first two Greek letters — alpha + beta.
16. `uncopyrightable` — longest common word with no repeated letter.
17. `stewardesses` — longest word typed with only the left hand.
18. Capitals and lowercase exist because scribes wanted to write faster.
19. `set` has more dictionary meanings than any other English word.
20. New words are added to the dictionary every single year.

**D. Decoding / "rabbit rule" reels — the format you described.** This is L27 Syllable
Division, already implemented in the app. Format: mark the vowels, mark the consonants,
split between the two consonants, read each chunk.
- `atlantic` → vowels a·a·i → `at | lan | tic` (VC · CVC · CVC)
- `napkin` → `nap | kin` · `rabbit` → `rab | bit` · `basket` → `bas | ket`
- Then L27's other two patterns: V/CV `ti-ger`, `pi-lot`, `pa-per`; VC/V `cam-el`, `lem-on`

Open each reel with CVC words the child already owns (hat, bin, red, dog) so the long
word feels like the same skill twice. ~10–12 reels.

**E. Vocabulary themes — 16 themes, plan already agreed.** `docs/vocab_series_plan.md`
is written and approved, **parked on assets**. Buildable today with zero new assets:
Wild Animals (16 words), Vehicles (14), Farm Animals (13), In My House (12), Fruits (10).
Note the app has 7 categories (168 words) while `tools/vocab_themes.py` has 16 themes,
and the two are **not synced** — decide which is canonical before scripting.

**F. App-module reels — later, deliberately.** 60 module IDs exist (`ModuleID.swift`).
Park until the phonics spine is posted.

### Honest supply math

Daily reels = **364/year**. Identified unique supply: 22 letters + ~40 long-form cuts +
32 facts + 12 decoding + 16 vocab ≈ **120 reels ≈ 17 weeks**. Daily is sustainable into
roughly month four, then it needs stream F or a second cut per long video.
Recommendation: **5 reels/week (weekdays)** stretches the same library to ~6 months and
protects recording time for the two long videos. Your call — the plan works either way.

---

## 5. The 4:5 conversion pattern — codifying the mistakes

Your instruction: same theme, rearrange content only, spacing correct, nothing
overlapping, download section correct, **and don't repeat past mistakes**. Every item
below cost a review round. The fix is to make them enforced, not remembered.

**Method (proven on `letters_phonics` and `short_vowels`):** one reel serves both
aspects. Gate on `const portrait = height > width`, give each aspect its own band table,
register a second composition at 1080×1350. The 16:9 stays byte-identical.

```
❌ NEVER letterbox. Compositing the 16:9 into a 4:5 surround is a 16:9 video with
   decoration. It was built, rejected, and deleted.
```

**Enforced rules — the actual bugs:**

| # | Rule | What went wrong |
|---|---|---|
| 1 | Hooks before any early `return` | `useVideoConfig()` after `return null` changed hook count per frame → React #310, render died at frame 63 |
| 2 | Wash covers the **content zone only** | A full-width wash erased the entire Paint Studio it was added to reveal |
| 3 | Wash fades to zero at its own edges | A 55%-opaque edge cut a hard line across the sky — measured as a 20-level blue jump in one row |
| 4 | Portrait frames use `StoreOutroPortrait` | short_vowels 4:5 shipped the **landscape** outro |
| 5 | Outro centres itself in short frames | Content y110…1350 in a 1350 frame = badges flush to the bottom. `Math.min(0, (H-1240)/2-110)`, clamped so 9:16 is untouched |
| 6 | The world runs to the **end** | Sky stopped at `OUTRO_FROM`, so the download section fell through to white — a jump cut |
| 7 | Header clearance ≥ 40px | Title pill ends y96; content started y104. 8px. |
| 8 | `mascot.png` has only 7px bottom padding | Feet are effectively the last pixel row — any `bottom ≤ 0` slices them, and `0` still reads as cropped |
| 9 | `slab(c, d)` draws its face `d+16`px **below** | Text drawn inside the extrusion in three worlds |
| 10 | `WordTiles` centres the picture on its coordinate | Passing the band top put half the glyph on the sign above |
| 11 | Verify **frame counts**, not container duration | An ffmpeg composite produced a 1-frame video stream; the copied audio kept the container looking correct |
| 12 | Thumbnails checked at **120px** | That is where they are actually read |

**Deliverable — make these structural, not documentary:**
- **`src/components/PortraitBands.ts`** — one helper returning the band table for a given
  aspect, plus `assertBands()` that throws at module load when any gap is negative or
  below a floor. `VowelScene` and `LetterScene` already do this ad-hoc; lift it out so
  every future conversion inherits it.
- **`VIDEO_CHECKLIST.md`** — add "§6 · 4:5 conversion" with the table above.
- **`tools/check_video.sh`** — for any `*-4x5` composition, assert the portrait store
  outro is used and the world sequence runs to full duration.

**Per-card conversion order** — by the LEVEL each card posts at, not by card index. The
first version of this list was card-index order, which would have converted `ai_ay` (L13)
months before it posts and left `c_k_ck` (L5, the first one needed) until last:

| # | Card | Posts at |
|---|---|---|
| 1 | `c_k_ck` | L5 |
| 2 | `ch_tch` | L10 |
| 3 | `ge_dge` | L10 |
| 4 | `ai_ay` | L13 |
| 5 | `oa_ow` | L13 |
| 6 | `oo` | L13 |
| 7 | `oi_oy` | L14 |
| 8 | `ou_ow` | L14 |
| 9 | `au_aw` | L14 |
| 10 | `c_soft_hard` | L19 |
| 11 | `g_soft_hard` | L19 |

Convert each one shortly before its level, not in a batch — that way each gets real
review and nothing is built long before it is needed.

---

## 6. Thumbnails — DESIGNED, not frame grabs

```
❌ Do NOT export frames from the video as thumbnails. YouTube, Facebook and Instagram
   all offer "pick a frame" at upload. A frame grab adds nothing the upload flow does
   not already give for free. tools/export_covers.sh does exactly this and should be
   deleted — it was built on a misreading of the requirement.
```

A thumbnail is a **separate designed still**: a headline that is not in the video, a
hook, the hero art, and the mascot/logo — composed to be read at 120px in a feed. That
is what the four existing ones are.

Current: 4 designed thumbnails, covering 2 lessons.
Needed: **15 landscape videos × 3 sizes** (1280×720 YouTube, 1080×1350 Facebook,
1080×1920 Shorts/Reels) **+ 42 reels × 1** (1080×1920) ≈ **87 stills**.

### The scale problem, and the answer

Each of the four hand-built thumbnails took several review rounds (headline wrapping,
row spacing, mascot clipping, strip margins). Eighty-seven hand-built components is not
feasible and would not stay consistent.

**Make it data-driven, the way the 26 letter shorts already are.** `letter_short.tsx`
plus a `LETTERS` row generates 26 reels from one template; thumbnails should work the
same way:

- **`src/thumbs/thumb_template.tsx`** — one aspect-aware component taking:
  `{ title, hook, sub, heroArt, accent, world, strip? }`
- **`src/data/thumbs.ts`** — one row per video/reel. A new thumbnail becomes a data
  row, not a build.
- Registered by mapping over that data at all required sizes, exactly as
  `...LETTERS.map(letterShortEntry)` does in `src/reels/index.ts`.

Reuse from the four that exist: the aspect-size switch (`H/W > 1.5` grows the card,
strip and mascot), the rotated gold corner badge, dark-ink-on-bright for pale worlds,
and the asserted band gaps. Those are the parts that took the review rounds.

**Per-family art, not per-video:** the 26 letter reels share one layout with the letter
and word swapped; the 11 comparison videos share one layout with the pair swapped. So
87 stills需 roughly **4 layouts**, not 87 designs.

- **Note:** the two 16:9 `letters_phonics` thumbnails still show the old flat-gradient
  look and no longer match the Paint Studio video. Redo with the rest.

---

## 7. Weekly rhythm and phase order

```
Mon    long video #1  → YouTube 16:9  +  Facebook 4:5   (+ 3 thumbnails)
Thu    long video #2  → YouTube 16:9  +  Facebook 4:5   (+ 3 thumbnails)
daily  reel           → YT Shorts + FB Reels + Instagram (+ designed 9:16 thumb)
```

One narration session per long video; reels batch-recorded weekly. Rendering is not a
constraint — every composition renders in minutes.

1. **Unblock (week 1).** Re-render the two stale landscape masters ✅ done. Delete
   `tools/export_covers.sh` and `out/covers/`. Build the thumbnail template + data, then
   the stills for what is already posted. No new narration.
2. **Backfill formats, card-wise (weeks 1–6, alongside).** 4:5 for the 11 existing
   comparison videos in the order above, one per long-video slot, each reviewed.
3. **Port the 5 missing compare cards** into `comparisons.ts` (`th_two`, `ea_two`,
   `ow_two`, `ed_two`, `tion_sion`) so L9/L13/L21/L23 get their discrimination videos.
4. **Walk the spine (weeks 2–19).** L3 → L28 in order, 2/week. Script written fresh per
   level and **confirmed before recording**. Each level ships 16:9 + 4:5 + a 9:16 cut +
   3 thumbnails.
5. **Capstones.** Reading Ladder, Word Detective, Super Quiz.
6. **Then** the vocabulary series (unpark when assets land) and app-module reels.

---

## 8. Files to create / change

**New**
- `src/components/PortraitBands.ts` — shared band table + `assertBands()`
- `src/thumbs/thumb_template.tsx` + `src/data/thumbs.ts` — data-driven thumbnails
- `src/thumbs/<lesson>_thumb.tsx` — one per new lesson, registered at 3 sizes
- `src/reels/l<N>_<name>.tsx` + `..._beats.tsx` per new level, following
  `c_soft_hard_16x9.tsx` / `c_soft_hard_beats.tsx` as the reference pair
- `docs/posting_schedule.md` — the live calendar, updated as things post

**Changed**
- `src/data/comparisons.ts` — add the 5 missing cards from `ComparisonData.swift`
- `VIDEO_CHECKLIST.md` — add §6 · 4:5 conversion
- `tools/check_video.sh` — aspect assertions for `*-4x5`
- `src/reels/index.ts` — one 4:5 entry per existing landscape video
- `Video_Scripts.html` — dashboard is stale: says 7 cards remain (it is 5) and still
  lists soft c/g as unmade

**Reuse, do not rebuild:** `tools/cut_audio.py` (speech-region audio cutting),
`tools/asr_check.py` (independent transcript check), `tools/align_audio.py`,
`tools/check_video.sh`, `src/lib/timing.ts` (`makeTrack`/`planBeats`), the world
components (`ChirpWire`, `PaintStudio`, `BakeryWorld`, `GardenWorld`, …), `WordTiles`,
`Connector`, `StoreOutroPortrait`, `docs/vocab_series_plan.md`.

---

## 9. Verification

Per piece, before it is called done:

1. `npx tsc --noEmit` clean.
2. `bash tools/check_video.sh <id> <timing.json>` → **0 stale, 0 quiet, 0 frozen**.
3. **Independent transcript** on any cut audio — `tools/asr_check.py`. Forced alignment
   proves nothing; it forces whatever script it is handed onto the audio.
4. **Read the whole phrase sheet by eye.** The automated checks catch pixel staleness,
   not a wrong letter highlighted.
5. **4:5 specifically:** assert band gaps arithmetically *before* rendering; confirm the
   portrait outro is used and centred; confirm the world runs to the final frame;
   confirm frame count matches the source.
6. **Thumbnails:** view at 120px, 246px and full size.
7. `ffprobe` the output — dimensions, duration, and **video frame count** vs expected.

---

## 10. Open question, not blocking

Daily reels needs ~364/year against ~120 identified. Recommendation is 5/week
(weekdays), which stretches the library to ~6 months and protects recording time for the
two long videos. Everything above works at either cadence.


---

## 11. The next 10 videos

Split by **whether they need your voice** — that is the real constraint, not build time.

### Two prerequisites first (not videos, but they gate everything)

- **`src/components/PortraitBands.ts`** — the shared band table + `assertBands()`. Build
  this before the first conversion so the twelve bugs in §5 are enforced by the first
  one rather than rediscovered in it.
- **`src/thumbs/thumb_template.tsx` + `src/data/thumbs.ts`** — the data-driven thumbnail
  template from §6, with L1 and L2 migrated onto it as the proof. Every video below then
  gets its 3 thumbnails as a data row.

### Batch A — I can build these alone, no recording (4:5 conversions)

Ordered by the level each posts at. Each is a portrait branch on the existing reel plus
one composition entry; the 16:9 stays byte-identical.

| # | Video | Posts at | Needs from you |
|---|---|---|---|
| 1 | `c_k_ck` 4:5 | L5 | nothing |
| 2 | `ch_tch` 4:5 | L10 | nothing |
| 3 | `ge_dge` 4:5 | L10 | nothing |
| 4 | `ai_ay` 4:5 | L13 | nothing |
| 5 | `oa_ow` 4:5 | L13 | nothing |

### Batch B — these need a confirmed script and your narration

New level lessons, in phonics order. Each ships **16:9 + 4:5 + a 9:16 cut + 3 thumbnails**.

| # | Level | Teaches | Blocked on |
|---|---|---|---|
| 6 | L3 · 2-Sound Blending | blend two sounds: VC + CV (at, an, in, on, up) | script → your OK → recording |
| 7 | L4 · CVC Words | say each sound then blend fast (cat, hat, pan, map) | script → your OK → recording |
| 8 | L5 · Short Vowel Spelling Rules | ff·ll·ss·zz doubling · c/k/ck · -ng/-nk/x | script → your OK → recording |
| 9 | L6 · Word Families | know one family, read the whole family (-at, -an, -en) | script → your OK → recording |
| 10 | L7 · Beginning Blends | blends keep BOTH sounds (bl, cl, fl, gl, pl, st) | script → your OK → recording |

Scripts written fresh per level — **not** from `Phonics_Scripts.html`.

### Order of work

1. `PortraitBands.ts`, then thumbnail template — one session
2. Batch A conversions, one at a time with review between
3. Batch B: I write the L3 script → you confirm → you record → I build. Then L4, and so on.

Batch A and Batch B run in parallel: A needs none of your time, so it fills the gaps
while scripts and recordings are in flight.

### After these 10

L8 → L28 continue the same way (21 more lessons), then the 5 unported compare cards at
their levels (`th_two` L9, `ea_two`/`ow_two` L13, `ed_two` L21, `tion_sion` L23), then
the 4 capstones. Reels run alongside from the five streams in §4.


---

## 12. DESIGN LAW — more visuals, less text

**From a real user, so this is evidence, not preference.** The audience is 3–8 year olds.
A child watching a phonics video *cannot read fluently yet* — that is the entire reason
they are here. Every sentence on screen is content they cannot access.

### The rule

Text on screen may only be:

1. **The thing being taught** — the letter, the word, the spelling pattern. Always.
2. **A label of 1–4 words** — `SOFT FLOOR`, `A for Ant`, `e · i · y`.

Never a sentence. Never a line the narrator is speaking at the same time.

```
The narration carries the EXPLANATION.
The screen carries the EVIDENCE.
```

### What we are doing wrong now

Real strings currently on screen, each one a narrator line duplicated as text:

- `Short vowels make a QUICK sound — not the letter's NAME!`
- `Open your mouth wide — like at the doctor! aaa`
- `the same c — two different sounds`
- `When the c is followed by two vowels like that, it says /sh/`
- `Every one of them should be soft, but it is not!`

The child hears all of that. Printing it as well helps nobody and crowds the frame — and
crowding is what produced most of the overlap bugs in §5.

### Replace text with

| Instead of a sentence saying… | Show |
|---|---|
| "the c is soft here" | the letter turning the soft colour, and the soft gumball/floor lighting |
| "look at the letter after" | the arrow drawing itself to that letter, the letter scaling up |
| "two different sounds" | the two sound cards side by side, each pulsing as it is said |
| "open your mouth wide" | the mouth doing it — the `VowelFace` already animates |
| "should be soft but it is not" | the purple gumball flipping to green |
| "these five words all end the same way" | the five endings lighting in turn |
| a rule restated | the mascot demonstrating, or a ❌ on the wrong reading |

We already own the vocabulary for this: `VowelFace` (animated mouths), `Connector` /
`RuleArrow` (self-drawing arrows), `Gumball` (colour flip), `WordTiles` (per-tile
highlight), `SoundCreature`, `Puzzled`, `EmptySlots`, the floor/chute signs. The tools
exist — we have been leaning on captions instead of using them.

### Applies to

- **Every new lesson (L3–L28)** — at script stage. When a script line explains, ask what
  the screen *shows* for that line; the answer must not be "the line".
- **Every 4:5 conversion** — the re-layout is the moment to cut the sentence pills. A
  narrower frame makes long text worse, so this is not extra work, it removes work.
- **Thumbnails (§6)** — headline + 1 hook line + art. Nothing else.
- **Captions stay.** They are for the scrolling adult with sound off, sit in their own
  band, and are not part of the teaching frame. This rule is about the teaching area.

### How to check it

Count on-screen words per beat, excluding captions and the word being taught. **More than
4 is a fail.** Cheap to eyeball on the existing phrase sheet — the sheet is already
generated for every build.


---

## 13. QUALITY BAR — what "proper" means

§12 says cut the text. This says what must replace it. Deleting a sentence and leaving a
gap makes the video worse, not better. The bar is: **more visual, real motion, real
transitions, playful, kid-friendly.** Below is that stated so it can be checked.

### 1. Nothing hard-cuts

Beats currently swap instantly. A child reads a cut as "that thing vanished". Every beat
change needs a *reason* on screen: the card slides out as the next slides in, the world
pans, a curtain/door/lid moves, the mascot carries the object off. The world already
gives us the device in each case — the lift travels, the claw lowers, the tin opens.

### 2. Things move because something caused them

The strongest teaching we have built is cause-and-effect, not labelling:
- the gumball **flips colour** on the word "not" (g, tricky words)
- the word **rides to a floor** (c, the lift)
- the bird **opens its beak** on its own phoneme

Every rule application should be an event like that, not a card appearing. If a beat can
only be expressed by a card appearing, the visual idea is not finished.

### 3. The mascot acts

It currently bobs and nothing else. It is the only character and can carry everything a
sentence used to: point at the deciding letter, cheer a correct answer, look puzzled
before a reveal, cover its ears for a wrong sound, lean in to listen. Cheapest single
upgrade available — one component, used everywhere.

### 4. Anticipation, then payoff

Reveals currently just appear. Give each one a wind-up: squash before the pop, a
drumroll beat, the object shaking, slots pulsing empty. Then land it — overshoot and
settle, not a linear fade. `spring()` is already used; the missing part is the *beat of
waiting* before it.

### 5. Everything alive, nothing busy

Idle bob is in place. What is missing is follow-through: a card that lands should settle,
a letter that pops should overshoot then snap back, a dropped object should bounce once.
Motion should never be uniform — vary period and phase per element (already done for the
birds and brushes; extend it everywhere).

### 6. Reward every success

`Confetti` exists and is barely used. Every correct answer, completed word and finished
recap should feel earned — burst, sparkle, the mascot celebrating, the pot filling.

### 7. Every sound has a visual

SFX are cued but often land with nothing moving. If a sound plays, something on screen
must react on that frame — a pulse, a bounce, a flash of colour.

### How to check it

Additions to the existing gate, since taste is not a check:

- **`motion_check.py` gets stricter.** Today it passes if *anything* in the content region
  moves. Raise it: the **teaching element itself** must move during its beat, so a frozen
  card behind a bobbing mascot no longer passes.
- **Transition audit.** For each beat boundary, sample the frames either side; if the diff
  is a step change with no intermediate frames, it is a hard cut → fail.
- **Word count per beat** (§12) ≤ 4, excluding captions and the taught word.
- **Read the contact sheet.** Still the only check that catches "technically animated but
  lifeless".

### Consequence for scheduling

A conversion is no longer a layout job. Per card it is: text pass → visual replacements →
transitions → 4:5 layout → verify, across two beat files (16:9+4:5 share one; 9:16 has its
own). That is a **design pass, not a mechanical one**, and 2 long videos a week only holds
if the new lessons are built to this bar from the start rather than retrofitted.


---

## 14. Worlds — the two videos still on a bare gradient

Every long video built since ge/dge has its own world. Two predate the approach and are
still a plain gradient:

| Video | World |
|---|---|
| `c_k_ck` (L5) | **THE KEY SHOP** — decided, not built |
| `oo` (L13) | none yet — needs one |

All others: Word Train (ai/ay) · Lily Pond (oi/oy) · Open Sea (oa/ow) · Two-Ring Circus
(ou/ow) · Sleepy Lawn (au/aw) · Word Court (ge/dge) · Match Day + Claw Machine (ch/tch) ·
Bakery + Lift (soft/hard c) · Garden + Gumball Tower (soft/hard g) · Chirp Wire (short
vowels) · Paint Studio (letters, 4:5).

### THE KEY SHOP — c/k/ck

Chosen because **/k/ is "key"** — a pun a four-year-old gets — and because the video is
already reaching for it: its headline says "3 ways to spell /k/! 🔑" and it calls them
"the /k/ Crew". The concept was latent; it was never built.

The rule is *three spellings, one sound, chosen by what comes before*. In a key shop that
is literal: **three different keys that all open the same lock.**

- **Three keys on hooks** — `c`, `k`, `ck` — each a different shape, each labelled with
  when it is used. They hang and sway.
- **One lock.** The chosen key lifts off its hook, travels, turns, and the lock **clicks
  open**. That is the §13.2 cause-and-effect the video currently lacks entirely — today
  the answer just appears.
- **`ck` is a two-part key** — two teeth, one turn. Shows "two letters, one sound"
  without saying it.
- **The workbench** is the teaching band; keyrings, blanks and metal shavings live in the
  margins, pushed back per the bright-world rule.
- **The mascot is the locksmith** — it can point at the deciding letter, try a key, shake
  its head at the wrong one, cheer the click. Satisfies §13.3 with the character we have.

Bands to be measured from the finished video first, as with the Paint Studio — do not
guess them.

### Build order for this card

1. ~~Text trim (16:9 + 9:16)~~ ✅ done
2. **The Key Shop world** — the §13 pass: world, transitions, mascot acting, anticipation
3. Verify both aspects, render, review
4. **Only then** the 4:5 (`PortraitBands` + aspect branch)

### Open refinement to §12

The "≤4 words" test is too blunt. `before a, o, u → use c` is 6 words and must STAY — it
is the rule as a formula, with an arrow doing the work. `And at the end of a word, right
after one short vowel, we use ck` is narration and must go. The real test is **sentence
vs formula**, not length. Word count is a useful smell, not the rule.

Also note: an audit must walk composed JSX. The headline rule pills are built from nested
spans so each letter can be coloured, so a text-node regex never sees them.
