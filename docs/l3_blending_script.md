# L3 · 2-Sound Blending — long-form 16:9 script

Written fresh from the module source (`UI/Phonics/3 2-Sound Blending/`). ~2:50.

**Signature move:** two boxes fly in, each sound is said alone, then they MERGE and the
blend is said. This is the app's own `BlendBoxPhase { hidden → box1In → box2In → allShown →
merging → merged }`, so the child sees on screen exactly what they see in the app.

**The one idea:** VC and CV are the same trick from opposite ends.
VC = add a letter at the **front** (`at` → b‑at). CV = add one at the **back** (`ba` → ba‑t).

**Vocabulary law for this level.** The child has L1 letter sounds and L2 short vowels and
NOTHING else. Every example word is plain CVC with a short vowel — no blends (L7), no
digraphs (L9), no magic e (L12). This is why `plus` is banned for `us`.

**Sound spellings — the app's own tokens, not invented.** Vowels `aaa · eh · ih · oh · uh`
(src/data/shortvowels.ts). Consonants `buh kuh duh guh mmm nuh puh sss tuh wuh ks`
(src/data/letters.ts soundToken). Never write "Aah" or "nnn" — the child hears these exact
sounds in the app and the video must not drift from them.

**Word lists — exact, from the module:**
VC `at an am in it ox up us` · CV `ba ma me we go no si do`

---

## 1 · HOOK (0:00–0:10)

| # | Voiceover — read exactly | On screen |
|---|---|---|
| 1 | aaa… tuh… | Two boxes fly in from opposite sides: red `a`, blue `t`. Each lights as its sound plays. |
| 2 | AT! | They SLAM together and merge into one box: `at`. Confetti tick. |
| 3 | Two sounds just became a word. | The merged box pulses; a ghost replay shows the two halves sliding back together. |
| 4 | Today you're going to do that sixteen times. | Sixteen empty boxes flick into a grid, then fly off screen. |

## 2 · THE BLEND IDEA (0:10–0:24)

| # | Voiceover | On screen |
|---|---|---|
| 5 | Blending is easy. Say the sounds apart… | `a` and `t` pull APART slowly, each sounding. |
| 6 | …then squeeze them together. | They slide back and merge. |
| 7 | Slow first. | Merge plays at half speed. |
| 8 | Fast after. | Merge snaps at full speed. |
| 9 | Red box is a vowel. Blue box is a consonant. | The colours label themselves — red pip on `a`, blue pip on `t`. No text legend. |

## 3 · VC SET — the vowel comes first (0:24–1:05)

Each word: boxes in → two sounds → merge → the whole word. One line per word.

| # | Voiceover | On screen |
|---|---|---|
| 10 | When the vowel goes first, we get these. | Tab label slides in: **VC**. A red box leads, blue follows. |
| 11 | aaa… tuh… at. | `a`+`t` → **at** |
| 12 | aaa… nuh… an. | `a`+`n` → **an** |
| 13 | aaa… mmm… am. | `a`+`m` → **am** |
| 14 | ih… nuh… in. | `i`+`n` → **in** |
| 15 | ih… tuh… it. | `i`+`t` → **it** |
| 16 | oh… ks… ox. | `o`+`x` → **ox** |
| 17 | uh… puh… up. | `u`+`p` → **up** |
| 18 | uh… sss… us. | `u`+`s` → **us** |
| 19 | Eight words. Vowel first, every time. | All eight merged boxes land in one row, red pip leading on each. |

## 4 · CV SET — the consonant comes first (1:05–1:46)

| # | Voiceover | On screen |
|---|---|---|
| 20 | Now flip it. Consonant first. | Tab flips to **CV**. The row mirrors — blue box leads now. |
| 21 | buh… aaa… ba. | `b`+`a` → **ba** |
| 22 | mmm… aaa… ma. | `m`+`a` → **ma** |
| 23 | mmm… eh… me. | `m`+`e` → **me** |
| 24 | wuh… eh… we. | `w`+`e` → **we** |
| 25 | guh… oh… go. | `g`+`o` → **go** |
| 26 | nuh… oh… no. | `n`+`o` → **no** |
| 27 | sss… ih… si. | `s`+`i` → **si** |
| 28 | duh… oh… do. | `d`+`o` → **do** |
| 29 | Eight more. Consonant first, every time. | All eight land in a row, blue pip leading. |

## 5 · LISTEN — the word machines (1:46–2:24)

**The payoff.** Every chunk builds real words — VC by adding a letter at the FRONT, CV by
adding one at the BACK. Same trick, both directions. Only plain CVC words are used.

| # | Voiceover | On screen |
|---|---|---|
| 30 | Here's the secret. These aren't just little words. | The sixteen chunks float back in. |
| 31 | Put a sound in FRONT of them… | An empty box slides in to the LEFT of `at`. |
| 32 | at… b‑at. bat! at… c‑at. cat! | `b`+`at`→**bat** (🦇) then `c`+`at`→**cat** (🐱) |
| 33 | an… m‑an. f‑an. | **man** 🧍 · **fan** 🌀 |
| 34 | am… j‑am. r‑am. | **jam** 🍓 · **ram** 🐏 |
| 35 | in… p‑in. w‑in. | **pin** 📌 · **win** 🏆 |
| 36 | it… s‑it. h‑it. | **sit** 🪑 · **hit** 🥎 |
| 37 | ox… b‑ox. f‑ox. | **box** 📦 · **fox** 🦊 |
| 38 | up… c‑up. | **cup** ☕ (only `-up` word in the bank) |
| 39 | us… b‑us. | **bus** 🚌 (only clean CVC for `us` — `plus` is a blend) |
| 40 | And the other eight? Put the sound at the BACK. | The empty box slides to the RIGHT of `ba` instead. |
| 41 | ba… ba‑t. bat! ba‑g. bag! | `ba`+`t`→**bat** 🦇 · `ba`+`g`→**bag** 🎒 |
| 42 | ma… ma‑p. ma‑n. | **map** 🗺️ · **man** 🧍 |
| 43 | me… me‑n. | **men** 👥 |
| 44 | we… we‑t. | **wet** 💧 |
| 45 | go… go‑t. | **got** ✋ |
| 46 | no… no‑t. no‑d. | **not** ❌ · **nod** 🙂 |
| 47 | si… si‑t. si‑x. | **sit** 🪑 · **six** 6️⃣ |
| 48 | do… do‑g. do‑t. | **dog** 🐕 · **dot** ⚫ |
| 49 | You didn't learn sixteen little words. You learned sixteen word machines. | `bat` builds twice on screen — once as b+at, once as ba+t — landing on the same word. |
| 49a | Blended along with me? Tap the thumbs up — I want to know you did it! | A thumbs-up bounces in beside the merged `bat`. OPTIONAL — cut for tighter retention. |

## 6 · PRACTICE (2:24–2:38)

| # | Voiceover | On screen |
|---|---|---|
| 50 | Your turn. Blend it with me. | Two boxes appear, unmerged, with a beat of silence. |
| 51 | aaa… nuh…? | `a`+`n` held apart. Pause. |
| 52 | an! | Merge + tick. |
| 53 | duh… oh…? | `d`+`o` held apart. Pause. |
| 54 | do! | Merge + tick. |

## 7 · QUIZ (2:38–2:50)

| # | Voiceover | On screen |
|---|---|---|
| 55 | Last one — which word is this? | `c` + `up` boxes, three answer cards: **cap · cup · cop** |
| 56 | kuh… uh… puh… | Each box lights in turn. |
| 57 | Cup! You blended a whole word by yourself. | **cup** ☕ lights, confetti. |
| 57a | Hit subscribe, because next time we blend THREE sounds — cat, dog, pig. | The subscribe button presses itself; `cat` `dog` `pig` fly in as teaser boxes. |

## 8 · DOWNLOAD (2:50–end)

| # | Voiceover | On screen |
|---|---|---|
| 58 | Blend all sixteen yourself in English Learning — tap the boxes, hear every sound, free on both stores. | Store flow: search → GET → OPEN, then the two badges. |

**Like / subscribe asks.** Both sit immediately after the child has WON something, never
before. The subscribe line names what is actually coming — L4 · CVC Words (cat, dog, pig) —
so it is a real promise rather than a generic beg, and it will still be true when L4 ships.

**Closing line check:** unique to this video — no earlier reel uses "tap the boxes, hear
every sound". App named "English Learning". The word "games" does not appear.

---

## AUDIO — assembled from the app, not re-recorded

Every SOUND in this video comes from the app's own bank, so it cannot drift from what the
child hears in the app. That is the whole reason the letter sounds were being corrected.

- 26 phonemes — `iOS/Learn English/Resources/Audio/Phonics/phonics abcd/sound_*.opus`
- 1885 word clips — `.../Phonics/phonics_word/*.opus`, which covers all 16 blending chunks
  and every Listen/quiz word after the four swaps above

So `aaa… tuh… at.` is not a recorded line — it is `sound_a` + `sound_t` + `at.opus`, three
clips fired one per box. That is BETTER than a single read: each sound can be timed exactly
to its own box appearing, and the merge lands on the blended clip, instead of the animation
having to chase however the line was paced.

**ONLY THESE 21 LINES NEED RECORDING** — the connective narration:
3, 4, 5, 6, 7, 8, 9, 10, 19, 20, 29, 30, 31, 40, 49, 49a, 50, 55, 57, 57a, 58.

Line 2 ("AT!") can use `at.opus`, but a shouted take is better for the hook — record it if
you want the energy.

**Prep step still to write:** the bank is `.opus` and the pipeline's existing audio is
`.mp3`. Chrome decodes opus so Remotion can play it directly, but a `tools/prep_l3_audio.py`
should copy the needed clips into `public/audio/blending/` and probe durations into a
manifest, the same shape as `prep_extra_words.py`.

## Notes for the build

- FIVE chunks get ONE example, not two, and each for a real reason:
  `us` → bus (`plus`/`thus` are blends, `Gus` is a name) · `go` → got (only plain CVC) ·
  `up` → cup · `me` → men · `we` → wet (no second clip in the bank).
- **bat** deliberately appears in BOTH halves (b+at and ba+t). That collision is the
  point of line 49 and should be staged as the video's closing visual idea.
- Every emoji listed is single-codepoint — no ZWJ sequences, which do not render.
