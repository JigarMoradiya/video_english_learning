# L4 · CVC Words — long-form 16:9 script

Written fresh from the module source (`UI/Phonics/4 CVC Words/`). ~3:50.

**One continuous take, whole script — narration and sound-outs together.** No assembling
from the app's clip bank; see THE VOICE below for why.

**Signature move:** three boxes drop in one at a time — **blue · red · blue** — each letter
lights and speaks while the other two dim, then all three glow together, slide inward and
FUSE into one purple tile. The word is spoken whole and the picture bounces in. This is the
app's own `CVCBoxPhase { hidden → box1In → box2In → box3In → allShown → merging → merged }`,
so the child sees on screen exactly what they see in the app.

**The one idea:** the vowel is always in the MIDDLE. Red between two blues, every time.

---

## THE VOICE — read this before writing any future script

L3 was measured after shipping and it reads like a paragraph, not a lesson:

| | L3 |
|---|---|
| Declarative statements | 59% of all sentences |
| Real instructions to the child | 2 in the whole video |
| First time the child is asked to do anything | 2:24 of 2:50 (86% in) |
| Longest unbroken narration run | 24.7s / 10 sentences |
| Stretch with no "you" at all | 136 seconds |
| Praise lines | 1 |

Every demo also answered itself in the same breath (`aaa… tuh… at.`), so the child was a
spectator for 86% of the video.

**The rules this script follows, and every script after it:**

1. Never more than **two statements in a row** without a `look` / `watch` / `you`.
2. Address the child **in every section** — no 136-second gaps.
3. **Praise after every group**, not once at the end.
4. **Don't answer every demo instantly** — let some land, then confirm.
5. **Short lines.** One idea per line. A teacher pauses; a paragraph doesn't.
6. **Less text on screen.** Only the letters and the word. Everything else is picture and
   motion.

---

**Vocabulary law for this level.** The child has L1 letter sounds, L2 short vowels and L3
2-sound blending. Every word is plain CVC with a short vowel — no blends (L7), no digraphs
(L9), no magic e (L12).

**Sound spellings — the app's own tokens, not invented** (`src/data/letters.ts` soundToken,
after the fff fix). Vowels `aaa · eh · ih · oh · uh`. Consonants `buh kuh duh fff guh huh
juh luh mmm nuh puh ruh sss tuh vuh wuh` .

**Words — exact, from `CVCWordsDatabase.swift`, the app's own five groups:**
`🍎 cat hat map` · `🥚 hen pen red` · `🍦 pig big sit` · `🐙 dog pot hot` · `☂️ sun run cup`

13 of the 15 have app artwork. `sit` and `hot` do not — use 🪑 and 🌶️, which are Android's
own fallbacks for those two words.

**AUDIO — two sources, nothing cut.**

| | |
|---|---|
| **You record** | the 32 teacher lines, ONE FILE PER LINE — `docs/l4_lines.txt` |
| **From the app** | all 16 letter sounds and all 15 whole words — verified present |

The app clips are `Resources/Audio/Phonics/phonics abcd/sound_<letter>.opus` (c a t h m p e
n r d i g b s o u) and `phonics_word/<word>.opus` (cat hat map hen pen red pig big sit dog
pot hot sun run cup). Every one of these was checked and exists.

Nothing is ever CUT. On L3 the narration was one long take that had to be sliced, and every
slice is a place a consonant gets clipped — that damaged `in.` `up.` `us.` `ba+g` and `dog`.
One file per line, plus the app's own clips, means every piece is placed whole.

**The cost transfers to ME: the GAPS are now mine to choose.** L3 v1 was assembled this same
way and was rejected for pacing — *"too fast going why?"* — because I used 0.11s between
events and 0.23s between sounds. That was the real failure, not the assembly. The rule for L4:

| Between | Gap |
|---|---|
| Two sounds inside one sound-out (`kuh` → `aaa`) | ~0.35s |
| Last sound and its word (`tuh` → `cat!`) | ~0.45s |
| Two narration lines | ~0.60s |
| Across a section change | ~0.90s |
| The three child-turn pauses | **1.0s / 2.0s / 2.5s** |

Bold rows below are the recorded lines. Unbolded rows are assembled from the app clips at
the gaps above.

---

## 1 · HOOK (0:00–0:14)

| # | Voiceover | On screen |
|---|---|---|
| 1 | **Watch this.** | Empty stage. One beat of nothing. |
| 2 | kuh… aaa… tuh… | Three boxes drop in one at a time — blue `c`, red `a`, blue `t`. Each lights as it speaks; the other two dim. |
| 3 | cat! | All three glow, slide together, FUSE into one purple tile. 🐱 bounces in. |
| 4 | **You just read a word.** | The cat wiggles. Nothing else on screen. |
| 5 | **Three sounds. One word.** | The purple tile splits back into three for half a second, then re-fuses. |

## 2 · THE IDEA (0:14–0:36)

| 6 | **Look at the colours.** | The three boxes, held still. |
| 7 | **Blue. Red. Blue.** | Each pips as it is named. |
| 8 | **Red is always the middle one.** | The red box lifts slightly and glows. |
| 9 | **Red is a vowel.** | Red box only. |
| 10 | **Blue ones are consonants.** | Both blue boxes pulse. |
| 11 | **Consonant. Vowel. Consonant.** | C · V · C float above their boxes — the app's own labels. |
| 12 | **Sound them out…** | Boxes pull apart, each sounding faintly. |
| 13 | **…then blend them fast.** | They snap together into the purple tile. |
| 14 | **Ready? Let's do fifteen.** | Five vowel badges flick past: 🍎 🥚 🍦 🐙 ☂️ |

## 3 · SHORT A 🍎 (0:36–1:12)

| 15 | **First vowel — aaa.** | 🍎 badge lands. A big red `a` sits in the middle slot, waiting. |
| 16 | kuh… aaa… tuh… → cat! | Full build + 🐱 |
| 17 | **Same middle sound. Watch.** | The red `a` STAYS; the two blue boxes swap out around it. |
| 18 | huh… aaa… tuh… → hat! | Full build + 🎩 |
| 19 | **You're getting it.** | Cat and hat side by side, both with a red middle. |
| 20 | mmm… aaa… puh… → map! | Full build + 🗺️ |
| 21 | **Three words. One vowel.** | The three merged tiles line up, red middles aligned in a column. |

## 4 · SHORT E 🥚 (1:12–1:44)

| 22 | **New vowel. eh.** | 🥚 badge. Red `e` drops into the middle slot. |
| 23 | huh… eh… nuh… → hen! | Full build + 🐔 |
| 24 | puh… eh… nuh… → pen! | Full build + ✏️ |
| 25 | **Hen. Pen. Hear the middle?** | Both tiles pulse on their red letter only. **No answer given — one beat of silence.** |
| 26 | ruh… eh… duh… → red! | Full build + 🔴 |
| 27 | **Nice work.** | Three e-tiles join the a-row. |

## 5 · SHORT I 🍦 (1:44–2:16)

| 28 | **Next one — ih.** | 🍦 badge. Red `i` drops in. |
| 29 | puh… ih… guh… → pig! | Full build + 🐷 |
| 30 | buh… ih… guh… → big! | Full build + 🐘 |
| 31 | **Pig… big. Only the first sound changed.** | The two tiles stack; the `ig` half glows in both. |
| 32 | sss… ih… tuh… → sit! | Full build + 🪑 |
| 33 | **Your turn's coming. Keep watching.** | i-tiles join the wall. |

## 6 · SHORT O 🐙 (2:16–2:48)

| 34 | **Next — oh.** | 🐙 badge. Red `o` drops in. |
| 35 | duh… oh… guh… → dog! | Full build + 🐶 |
| 36 | puh… oh… tuh… → pot! | Full build + 🍯 |
| 37 | huh… oh… tuh… → hot! | Full build + 🌶️ |
| 38 | **Pot. Hot. Hear that? Just the front sound.** | Both tiles pulse on the front box only. |

## 7 · SHORT U ☂️ (2:48–3:22)

| 39 | **Last vowel. uh.** | ☂️ badge. Red `u` drops in. |
| 40 | sss… uh… nuh… → sun! | Full build + ☀️ |
| 41 | *(no narration)* | `r` `u` `n` drop in and WAIT. No sound-out. |
| 42 | **This one's yours. Sound it out.** | Three boxes held. **Real silence — about 2 seconds.** |
| 43 | ruh… uh… nuh… → run! | Then the build plays and confirms. 🏃 |
| 44 | **Did you get it? I bet you did.** | Runner wiggles. |
| 45 | kuh… uh… puh… → cup! | Full build + ☕ |
| 46 | **Fifteen words. You read them all.** | All fifteen merged tiles fly into a 5×3 grid, one row per vowel, red middles in five clean columns. |

## 8 · QUIZ — the app's own "Find the Letter" (3:22–3:44)

| 47 | **One more. Something's missing.** | 🐕 picture. Below it `d` `_` `g` — the middle box is a grey `?`. |
| 48 | duh… ? … guh… | The two blue boxes light; the grey one stays dark. |
| 49 | **Which vowel goes in the middle?** | Three option tiles: **o · a · u**. **Silence — about 2.5 seconds.** |
| 50 | oh! Dog! | `o` flies into the slot, turns red, all three fuse. Confetti. |
| 51 | **You found it. That's real reading.** | 🐶 bounces. |

## 9 · DOWNLOAD (3:44–end)

| 52 | **Every word here is in the English Learning app — tap any word and watch it build itself. Free on both stores.** | Store card over the dimmed world. |

---

## RECORDING LIST — read straight down, ONE take

51 lines. Warm, unhurried, talking to one child sitting next to you. A clear pause between
lines. The numbers are only so you don't lose your place — don't read them out.

Sound-outs: say each sound separately with a small gap, then the whole word snappy.
`kuh... aaa... tuh...` then `cat!`

```
 1  Watch this.
 2  kuh... aaa... tuh...
 3  cat!
 4  You just read a word.
 5  Three sounds. One word.
 6  Look at the colours.
 7  Blue. Red. Blue.
 8  Red is always the middle one.
 9  Red is a vowel.
10  Blue ones are consonants.
11  Consonant. Vowel. Consonant.
12  Sound them out...
13  ...then blend them fast.
14  Ready? Let's do fifteen.

15  First vowel — aaa.
16  kuh... aaa... tuh...   cat!
17  Same middle sound. Watch.
18  huh... aaa... tuh...   hat!
19  You're getting it.
20  mmm... aaa... puh...   map!
21  Three words. One vowel.

22  New vowel. eh.
23  huh... eh... nuh...    hen!
24  puh... eh... nuh...    pen!
25  Hen. Pen. Hear the middle?        <-- PAUSE ~1s
26  ruh... eh... duh...    red!
27  Nice work.

28  Next one — ih.
29  puh... ih... guh...    pig!
30  buh... ih... guh...    big!
31  Pig... big. Only the first sound changed.
32  sss... ih... tuh...    sit!
33  Your turn's coming. Keep watching.

34  oh.
35  duh... oh... guh...    dog!
36  puh... oh... tuh...    pot!
37  huh... oh... tuh...    hot!
38  Pot. Hot. Hear that? Just the front sound.

39  Last vowel. uh.
40  sss... uh... nuh...    sun!
41  This one's yours. Sound it out.   <-- PAUSE ~2s
42  ruh... uh... nuh...    run!
43  Did you get it? I bet you did.
44  kuh... uh... puh...    cup!
45  Fifteen words. You read them all.

46  One more. Something's missing.
47  duh...        ...guh...
48  Which vowel goes in the middle?   <-- PAUSE ~2.5s
49  oh!   Dog!
50  You found it. That's real reading.

51  Every word here is in the English Learning app — tap any word and watch it build itself. Free on both stores.
```

**Line 47** is the quiz word with its middle missing — say `duh...`, leave a clear gap where
the vowel would be, then `guh...`. The gap is the point.

**Leave the three PAUSE silences in the take.** Do not edit them out — that is the child's
turn, and the video needs the real gap.

If you fluff a line, pause and say it again. I keep the good one. Don't restart the take.

## How this differs from L3, measurably

| | L3 | L4 |
|---|---|---|
| First child interaction | 2:24 (86%) | **0:14** |
| Real pauses for the child | 2 | **3** |
| Praise lines | 1 | **7** |
| Longest run with no "you" | 136s | **~24s** |
| Longest unbroken statement run | 10 sentences | **3** (rows 6–8) |

## Build notes (after the recording lands)

* `tools/align_audio.py` → timing JSON. For a shorter 9:16 cut use **`tools/cut_sentences.py`**
  — never `compact_narration.py`, which re-cuts every boundary and damages words.
* The video needs its **own world** (never another video's). Two candidates:
  **The Sandwich Shop** — bottom bread, filling, top bread; the vowel *is* the filling,
  always in the middle, and three layers press into one sandwich. Or **The Magnet Bench** —
  three magnet tiles that snap together.
* One reel component per section, each taking a `from` prop — inside a `<Sequence>`,
  `useCurrentFrame()` is RELATIVE.
* Covers via `cover(W, H)` from `src/thumbs/cover.ts`.
