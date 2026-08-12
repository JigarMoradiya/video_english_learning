# L6 · Word Families — Part 2 · Practice · script

**The promise this keeps:** Part 1 closed with *"Next time we will keep going with Level
Six and practise these families until they are easy."* This is that video.

One continuous take, same teacher. Target ≈ **5:45**.

---

## Source of truth — the app's own Practice screen

`WordFamiliesPracticeViewModel.swift` · the game is **Find the First Letter**: a picture,
the word with its first letter blank, three letter choices, *"Which letter starts this
word?"*, a score, and "Well done!" / "Good try!".

The questions below are the app's own — same words, same three letters each. **One thing
is deliberately different: the ORDER the options are spoken.** In the app's data the
correct letter is always listed first, and read aloud that way a child learns "say the
first one" instead of reading. Here the right answer lands 1st four times, 2nd six times
and 3rd four times, never three times running in the same slot. One change, on purpose: the app's 15th question
is `fox`, and it is **left out** — `‑ox` is not one of the thirteen families the lesson
taught, and a practice video must never quiz what was not taught.

| # | word | options | family |
|---|------|---------|--------|
| 1 | cat | b · c · h | ‑at |
| 2 | bat | b · c · r | ‑at |
| 3 | hat | c · m · h | ‑at |
| 4 | rat | c · r · f | ‑at |
| 5 | fan | m · v · f | ‑an |
| 6 | van | v · f · m | ‑an |
| 7 | hen | p · h · t | ‑en |
| 8 | pen | d · p · h | ‑en |
| 9 | dog | l · f · d | ‑og |
| 10 | pig | p · b · d | ‑ig |
| 11 | pot | h · p · d | ‑ot |
| 12 | sun | r · f · s | ‑un |
| 13 | map | m · c · n | ‑ap |
| 14 | jug | b · j · r | ‑ug |

Grouped into three rounds so the video has a shape: **warm-up** (the ‑at family, 1–4,
full support), **friends** (5–8, pairs from the same family), **the quick round** (9–14,
six families, one word each, faster).

## The rules this script obeys (from the L6 lesson's review)

* The quiz never spells its answer — picture and ending only, until the child answers.
* A line that names a word shows that word from its first frame.
* Real pauses (≈2.5s) after every question; the answer is never rushed.
* Praise after every round, not once at the end. "Good try" exists too — one question
  deliberately walks through recovering from a wrong first pick, because the app does.

---

# THE SCRIPT

## 1 · WELCOME BACK (0:00 – 0:35)

Welcome back to Level Six!

Last time we walked down Word Family Lane, and you read eighty-one words. Do you remember
the trick? If you can read the ending, you only need to find the letter at the front.

Today we are going to practise, and this is exactly the game the app plays with you. It is
called Find the First Letter.

Here is how it works. I will show you a picture, and a word with its first letter missing.
You will see three letters. Only one of them is right.

Say your answer out loud. Ready? Let's warm up.

## 2 · WARM-UP · the ‑at family (0:35 – 1:55)

We will start at the house you know best. The ‑at family.

Here is the picture. A cat. And here is the word. Something… at.

Which letter starts this word? Is it b, c, or h?

*(pause ≈ 2.5 seconds)*

C! C… at. Cat. Well done!

Next picture. A bat. Something… at again.

Which letter starts it? B, c, or r?

*(pause ≈ 2.5 seconds)*

B! B… at. Bat. That was quick!

Here is a hat. Which letter — c, m, or h?

*(pause ≈ 2.5 seconds)*

H! Hat. You are on fire.

One more from this family. A rat! Which letter — c, r, or f?

*(pause ≈ 2.5 seconds)*

R! Rat. Four out of four. The ‑at family is easy for you now.

If you are enjoying this, please tap like and subscribe — it really helps us. Now, let's keep going!

## 3 · FRIENDS · ‑an and ‑en (1:55 – 3:10)

Let's visit two more houses. Same game.

Here is a fan. Something… an. Which letter — m, v, or f?

*(pause ≈ 2.5 seconds)*

F! Fan. Lovely.

And here is a van. Which letter — v, f, or m?

*(pause ≈ 2.5 seconds)*

V! Van. Fan and van — only the front changed. You spotted it.

Now the ‑en house. Here is a hen. Which letter — p, h, or t?

*(pause ≈ 2.5 seconds)*

H! Hen.

And here is a pen. Which letter — d, p, or h?

Hmm. Is it d? D… en. Den. But look at the picture. That is not a den, that is a pen!

*(short beat)*

So it is p. P… en. Pen. Good try — and that is exactly what to do. If the word you build
does not match the picture, try another letter. That is not a mistake. That is checking.

## 4 · THE QUICK ROUND · six families (3:10 – 4:40)

You are ready for the quick round. Six pictures, six different families. Say the letter as
fast as you can.

A dog! L, f, or d?

*(pause ≈ 2 seconds)*

D! Dog.

A pig! P, b, or d?

*(pause ≈ 2 seconds)*

P! Pig.

A pot! H, p, or d?

*(pause ≈ 2 seconds)*

P! Pot.

The sun! R, f, or s?

*(pause ≈ 2 seconds)*

S! Sun.

A map! M, c, or n?

*(pause ≈ 2 seconds)*

M! Map.

Last one. A jug! B, j, or r?

*(pause ≈ 2 seconds)*

J! Jug. You finished the quick round!

## 5 · THE SCORE (4:40 – 5:05)

Look at your score. Fourteen questions, and you answered every single one.

Do you see what happened? You did not sound out fourteen whole words. You read the ending,
found the front, and the word was just… there. That is what practice does.

## 6 · CLOSE (5:05 – 5:40)

I am so proud of you. Level Six is yours now.

Play Find the First Letter in the English Learning app — it mixes the questions up every
time, so it is never the same game twice.

The English Learning app is free on the Apple App Store and Google Play.

Next time, a brand new adventure. Don't miss it!

See you next time!

---

## Build notes (after the recording exists)

1. `align_audio.py --model small` against the REAL text the teacher speaks (ask for it, as
   with Part 1 — forced alignment against the true text gave 1 drift in 214).
2. **Hand-authored scene table.** No classifier, ever. The WORD/quiz beats map from this
   script's fixed question order.
3. The world is Word Family Lane again — same street, revisited; each question stands at
   its family's house, so the settings do the section-changing.
4. Quiz beats: picture + `?`+ending + the THREE option tiles (the app's own distractors).
   Answer beat: the letter flies in, the word builds, washing line pegs it.
5. The pen question is the "good try" beat: d is tried first, builds `den`, the picture
   disagrees, then p — exactly the app's Try Again flow.
6. Score chip counts 1–14 (the app has a score; this video's counter is the score, not a
   progress bar of empty boxes).
7. Audio length from the MP3. One file per ratio at the end, intro + music baked.
