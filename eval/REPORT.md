# Redline eval report

This is a short account of how I measured Redline and what the measurements say. Every number comes
from a file in this repository, and I name the file. Where something is missing I have written TODO.

## What Redline does

Redline is for a small business owner who has been handed a contract by someone else and is deciding
whether to sign it. The owner uploads the document and gets back a plain-English summary, a list of
risk flags ranked Dangerous or Unusual, and a drafted counter-offer for each flagged clause. Every
flag has to quote the exact sentence it is based on. There is also a question box that answers only
from the uploaded document, and a list of the owner's own red lines that the analysis also checks.
When nothing is flagged, Redline says what it checked instead of staying silent. (`PRD.md`)

The clauses it promises to flag, from the "My red lines" section of `PRD.md`:

- **Personal guarantee**, Dangerous.
- **Indemnification**, Dangerous.
- **Auto-renewal**, Unusual by default and Dangerous if the renewal raises the price without clear
  notice or the cancellation window is unreasonably short.
- **Unilateral termination**, Dangerous.
- **Arbitration and class-action waivers**, flagged generically only.
- **Liability caps and fee escalators**, flagged generically only.

The PRD says these are not evaluated in this version: non-compete clauses, IP assignment clauses,
and data and privacy overreach.

## What I measured, and on which documents

I ran Redline's real analysis, with the real model through OpenRouter, over a set of documents whose
planted clauses are known, and scored what came back. The run I am reporting is
`eval-runs/2026-11-02T15-15-46Z.txt`, started 2026-11-02, model `z-ai/glm-5.3-flash`. All 9
documents ran and none were left out because of a failed model call.

The documents are the instructor's gold set (`eval/gold-set/`). There are nine. Six carry 40
planted clauses in total: a gym membership, a software subscription, an employment offer letter, a
storage unit rental, a consumer phone plan and an internship agreement. Three have no planted clause
and should come back clean: a garden plot licence, a library volunteer agreement and a swimming
lesson registration.

Of the 40 planted clauses, 30 are of types Redline promises to flag. Ten are out of scope, so they
are never counted as misses:

- **Unilateral modification**, 6 planted. The PRD names unilateral termination, not a right to
  rewrite the terms, and Redline has no type for it.
- **Non-compete**, 4 planted. The PRD says non-competes are not evaluated.

A planted clause counts as found when a flag shown to the reader quotes a sentence that overlaps the
planted sentence. (`eval/README.md`)

## The numbers

All from `eval-runs/2026-11-02T15-15-46Z.txt`.

- **Recall:** 18/30 (60.0%) of the in-scope planted clauses were found. Of those 18, 18/18 named
  the right clause type.
  - Arbitration and class-action waiver 5/5, indemnification 6/6, liability cap 3/4,
    auto-renewal 3/6, fee escalators and late fees 1/9.
- **Groundedness:** 20/22 (90.9%) of everything the model returned quoted a sentence that is in the
  document character for character. The other 2 were dropped before a reader would see them, so the
  flags a reader is shown are 20/20.
- **Clean documents:** 3/3 came back Clear, with 0 flags shown on them.
- **Precision:** 18/19 (94.7%) of the flags a reader would see overlapped an in-scope planted clause.
  The one that did not landed on a sentence the answer key does not list.
- **Recall split by characters a model tends to retype** (curly quotes, non-breaking spaces, fi or fl
  ligatures, em dashes, two spaces in a row):
  - Sentences with at least one of them: 5/9 (55.6%).
  - Sentences with none: 13/21 (61.9%).
  - By character: curly quote or apostrophe 2/3, non-breaking space 0/2, ligature 3/4, em dash 1/2,
    two spaces 0/1.

## My ten labels

I hand-labelled ten flags from that run in `eval/labels/labels.json`, using this rule: PASS if the
quoted sentence really is the kind of clause the flag names and really costs the reader something,
otherwise FAIL. I labelled **9 PASS and 1 FAIL**, 9/10 and 1/10. I changed my mind once: the one
flag I moved from PASS to FAIL was a non-compete clause, which the PRD says Redline does not
evaluate. The earlier PASS is kept in that label's history.

I did not pick the ten at random. `eval/labels/README.md` says how: every flag that matched no
planted clause, then every flag that matched a planted clause under a different type, then flags
from the Dangerous band spread across documents. Six of the ten are indemnification flags. None is a
liability cap or a fee escalator.

TODO: the label I changed has no note in `labels.json` at the moment. I need to write one sentence
on why.

## How far the judge agrees with me

I wrote a rubric (`eval/judge/rubric.md`) from the PRD and my own notes, and had a separate model act
as a judge. The judge saw only the rubric and the flags, never my labels. Against my current labels,
the judge's second run (`eval/judge/run-2.json`) gives these two numbers:

- Of the 9 flags I passed, the judge passed 9.
- Of the 1 flag I failed, the judge failed 1.

The first run (`eval/judge/run-1.json`) was made before I changed my mind. It passed 9 of the 10 flags I
had passed then, and failed the one I later failed. Its verdicts were the same on both runs, so the
change in agreement came from my label moving and not from the judge.

I also ran the judge on every flag the reader was shown in that run (`eval/judge/all-flags-run-1.json`).
It **passed 19 of 20**. The one it failed is the non-compete flag. Ten of those 20 are flags I have
not labelled.

## Limits

- **A model wrote the gold set.** It wrote the clauses the way a model expects them to read, and the
  same kind of model is being measured. The numbers above are an upper bound on what Redline would
  catch in real contracts, and they are not a promise to a reader.
- **The gold set is mostly not my customer's paper.** It is mostly consumer and employment
  documents, and it plants no personal guarantee and no unilateral termination, which are two of the
  clauses the PRD ranks Dangerous. It says nothing about those two.
- **Counts are small.** Liability cap has 4 planted clauses, so one clause moves it 25 points. The
  character split has 9 and 21 sentences.
- **Ten labels is a start.** They are not a random sample, six are indemnification, and I failed
  only one. The judge agreeing on 1 failed flag shows little about whether it catches a bad flag.
- **Model output varies between runs.** An earlier run of the same set found 16/30, not 18/30. I
  treat differences of a few clauses as noise.
- **The PRD sets no recall target,** deliberately, so there is nothing to compare 60.0% against.
- TODO: I also had a second set of twenty business documents drafted
  (`eval/gold-set-2-user-created/`). I have set it aside for now, so no numbers from it are in this
  report. I need to decide whether to add its results.

## What I would fix next

### What I fixed first

I chose fee escalators and late fees, which were found 1/9 in the run above. The prompt only asked
for fees that rise "without clear notice or an exit", so the model skipped price rises it could make
on its own, late and reactivation charges, interest and costly repayment terms. I widened that one
paragraph of the prompt (`lib/analysis/categories/definitions/liability-cap-fee-escalator.ts`, commit
`c33fbb2` on `fix-fee-escalator-prompt`, not merged) and added a test that failed 3 of 3 before the
change. I did not touch the gold set or the eval.

I then ran the eval twice more, and both runs scored 9/9 documents:

| | Before | After, run 1 | After, run 2 |
|---|---|---|---|
| Fee escalators and late fees found | 1/9 | 8/9 | 7/9 |
| Recall overall | 18/30 | 25/30 | 24/30 |
| Groundedness, everything returned | 20/22 | 31/33 | 25/28 |
| Clean documents Clear | 3/3 | 3/3 | 3/3 |
| Precision, flags shown | 18/19 | 25/28 | 24/25 |

The fee row accounts for almost all of the recall gain. The other rows moved by one clause or none,
which is inside the run-to-run swing I saw before. Three more runs hit upstream rate limits (429)
and scored 4/9, 8/9 and 0/9 documents, so I left them out. Two runs is a small sample.

TODO: run 1's precision fell to 25/28. I have not looked at the three flags that landed on sentences
the answer key does not list, so I do not know if they are fair catches.

### What I would fix next

- **Auto-renewal,** found 3/6 before and 3/6 and 4/6 after. Two planted renewal clauses were never
  flagged, in the gym membership and the software subscription, in both of which the model flagged
  the other renewal clause and skipped the second. Fixing this should move the auto-renewal row of
  recall and the overall count.
- **Quotes the model retypes.** Before the fix, 2 of 22 returned flags were not in the document
  character for character: one swapped a non-breaking space for an ordinary one and one dropped a
  phrase. Non-breaking spaces are still 0/2 after the fix. Fixing this should move groundedness
  toward all returned flags, and the non-breaking space row of the character split.
