# Eval

`npm run eval` runs every document in `eval/gold-set/corpus/manifest.json` through the same call
`npm run smoke` uses (`analyzeDocument(text, [], client)` with the default OpenRouter client and
the settings in `.env.local`), scores what comes back, and saves the run to `eval-runs/` as a
`.txt` and a `.json` named for the time the run started.

It needs `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in `.env.local`. It makes one model call per
document and no other network calls. It changes no app code, prompt or model setting.

Read `PRD.md`, "How we measure it", before reading a number. Every figure here is an upper bound:
a model wrote the gold set, so none of it is a promise to a reader and none of it belongs in copy.

## What is in this folder

| Path | What it is |
|---|---|
| `gold-set/corpus`, `gold-set/fixtures` | The instructor's gold set, copied byte for byte from `tests/corpus` and `tests/fixtures` of `github.com/ankitvirmani/redline`. Relative paths in `manifest.json` (`../fixtures/...`) work because both folders sit side by side. Its own README is `gold-set/corpus/README.md`. |
| `corpus.ts` | Loads the manifest, the documents and the sidecars. Checks that every sentence is in its document exactly once. |
| `metrics.ts` | The type mapping and all the scoring. No file or network access. |
| `run.ts` | The `npm run eval` entry point. |
| `../tests/eval-gold-set.test.ts` | Part of `npm test`. No network. Checks the sentences and the scoring. |
| `../eval-runs/` | One `.txt` and one `.json` per run. |

## Clause type mapping

The gold set has seven clause types. This product has six standard types plus red lines
(`lib/analysis/types.ts`).

| Gold-set type | Product type that counts as the right one | In scope? |
|---|---|---|
| `arbitration-and-class-action-waiver` | `arbitration-class-action-waiver` | Yes |
| `auto-renewal` | `auto-renewal` | Yes |
| `indemnification` | `indemnification` | Yes |
| `limitation-of-liability` | `liability-cap-fee-escalator` | Yes |
| `fee-escalators-and-late-fees` | `liability-cap-fee-escalator` | Yes, reported on its own row |
| `unilateral-modification` | none | **No** |
| `non-compete` | none | **No** |

Product types with no gold-set counterpart: `personal-guarantee` and `unilateral-termination`. The
gold set plants neither, so recall cannot say anything about them. A flag of either type is
still scored: it counts as found if its quote overlaps a planted sentence, and is reported as the
wrong type.

Why the two types are out of scope:

- **Non-compete.** `PRD.md`, "My red lines": "Explicitly not evaluated in v1: non-compete clauses
  (employment context, segment excluded)." Four planted clauses, in the offer letter and the
  internship agreement.
- **Unilateral modification.** `PRD.md` names unilateral *termination* and no-cause deactivation.
  A right to rewrite the terms is a different clause, and the termination prompt
  (`lib/analysis/categories/definitions/unilateral-termination.ts`) looks only for the right to
  end the relationship. Six planted clauses.

Out-of-scope clauses are listed in every run and never counted as misses. A flag that lands on
one is reported separately and is not counted for or against recall.

## Decisions made without asking

Each of these was a point where I would normally have asked. The reason is next to it.

1. **No eval existed, so I built one.** `package.json` had no `eval` script, there is no eval
   ticket and no folder of run records. `.scratch/first-version/spec.md` says the PRD's "What good
   looks like" is "written to become the eval suite", which is an intention, not an eval.
2. **Branch from `main`.** The checkout was on `keepalive-more-queries`, which was left alone.
   `add-eval-suite` was created from `main`.
3. **The first clone converted line endings.** This machine has `core.autocrlf=true`, so the first
   clone wrote CRLF into the corpus files. The gold set's documents are meant to be LF, one
   paragraph per line. I deleted that copy, cloned again with `core.autocrlf=false`, copied again,
   and compared every file against the clone by SHA-256: identical. `eval/gold-set/.gitattributes`
   sets `* -text` so git never rewrites a byte of it on this or any machine, the same protection
   the source repo gives its fixtures.
4. **"Found" means the quote shares at least one character with the planted sentence in the
   document.** The task said "overlaps". A quote can be shorter or longer than the planted
   sentence and still count. A quote that is not in the document cannot be placed, so it matches
   nothing.
5. **Recall counts shown flags, not everything the model returned.** A flag the pipeline's gates
   drop never reaches a reader, so it is not a catch. Groundedness is the opposite: it counts
   everything the model returned, because that is the only way it can be anything but 100%. To see
   the model's own output before the gates without touching app code, `run.ts` wraps the real
   model client and records the `flags` array it returns. The call itself is unchanged. The
   groundedness line for shown flags is printed as well and is 100% by construction.
6. **An empty or missing quote counts as returned and not grounded.** The model sometimes returns a
   `red-line` flag with an empty citation when no red lines were supplied. That is a flag the model
   returned whose quote is not in the document.
7. **Red lines are empty.** `smoke.ts` passes `[]`, so the eval does too.
8. **Clean documents are the three the manifest marks `benign`.** The clean-document result is
   reported as documents that came back Clear out of documents run, plus the number of flags shown
   on them and the number the model returned before the gates.
9. **Fee escalators and late fees stay in scope.** `PRD.md` lists "liability caps and fee
   escalators" as flagged generically, and the product's category is `liability-cap-fee-escalator`.
   Its prompt describes fees that escalate over time, which is narrower than late charges and
   reactivation fees (about half of this gold-set row; the rest are price increases). I kept the row in scope rather than drop nine
   clauses from the denominator on my own reading, and gave it its own line so a low number there
   is visibly about that row. If you decide late fees are out of scope, move the row in
   `TYPE_MAP` in `metrics.ts` and the numbers follow.
10. **A failed model call leaves the document out of every denominator.** It is listed with its
    error. A call that has not answered after 240 seconds counts as failed. There are no retries,
    so a flaky run shows up as left-out documents instead of being quietly smoothed over. If every
    document fails the run exits non-zero.
11. **No stub mode.** `smoke.ts` falls back to a stub built from the sidecars. A stub built from
    the answer key would score itself, so `npm run eval` stops with a message when the key or the
    model is not set.
12. **The model name is written into the run files.** A run record without it cannot be compared
    with a later one. The key is never read into any output.
13. **Run records are committed.** They are small, they are the history the trend in `PRD.md`
    needs, and they contain no secret.
14. **`loadDotEnvLocal` is copied from `smoke.ts`.** `smoke.ts` runs `main()` when imported, so it
    cannot be shared without editing it, and the task said to change no app code.
15. **No dependency was added.** `tsx` was already a dev dependency.
16. **The gold set's README mentions `npm run verify:corpus`, `scripts/eval/corpus.ts` and
    `tests/eval-corpus.test.ts`.** Those belong to the instructor's repo. Their equivalents here
    are `eval/corpus.ts` and `tests/eval-gold-set.test.ts`. There is no `verify:corpus` script.

## How to read a run

- **Recall** is in-scope planted clauses found, out of in-scope planted clauses, over the
  documents that ran. "Right type" is out of the ones found and is a separate question.
- Small rows move a lot. `limitation-of-liability` has four clauses, so one clause is 25 points.
  The counts are printed beside every rate for that reason.
- The character split shows whether a model that retypes instead of copying loses flags. A flag
  whose quote differs by one curly apostrophe is dropped by the citation gate and never shown.
- **Groundedness** over everything returned is where retyped quotes show up.
- **Clean documents** is three documents. A clean result on three is evidence, not proof.
