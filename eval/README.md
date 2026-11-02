# Eval

Two document sets feed this eval. They are described separately below and share only the harness
that runs them.

| | Gold set 1 | Gold set 2 |
|---|---|---|
| Where | `eval/gold-set/` | `eval/gold-set-2-user-created/` |
| Command | `npm run eval` | `npm run eval -- --set gold2` |
| Written by | The instructor | Us |
| Documents | 9, mostly consumer and employment | 20, business |

Read `PRD.md`, "How we measure it", before reading a number. Every figure is an upper bound: a
model wrote each set, so none of it is a promise to a reader and none of it belongs in copy.

---

## The harness (both sets)

`npm run eval` runs every document in a set's `manifest.json` through the same call `npm run
smoke` uses (`analyzeDocument(text, [], client)` with the default OpenRouter client and the
settings in `.env.local`), scores what comes back, and saves the run to `eval-runs/` as a `.txt`
and a `.json` named for the time the run started. Runs of gold set 2 end in `-gold2`. It needs
`OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in `.env.local`, makes one model call per document, and
changes no app code, prompt or model setting.

Code: `corpus.ts` (loading, and the check that every sentence is in its document exactly once),
`metrics.ts` (the type mapping and all scoring, no file or network access), `run.ts` (the
command). Tests: `tests/eval-gold-set.test.ts`, part of `npm test`, no network.

### What is measured

- **Recall.** In-scope planted clauses found, out of in-scope planted clauses. A clause is found
  when a *shown* flag quotes a sentence that shares at least one character with the planted
  sentence in the document. Whether that flag also named the right type is reported separately.
  Recall is also split by whether the planted sentence contains a curly quote or apostrophe, a
  non-breaking space, an fi or fl ligature, an em dash, or two spaces in a row.
- **Precision.** Of the flags that can be judged, how many overlap an in-scope planted clause. Two
  versions are printed: flags shown to the reader, and everything the model returned. A flag that
  lands only on an out-of-scope planted clause is left out of both counts. A flag on a sentence the
  answer key does not list counts against precision even if it is a fair catch, so read precision
  as agreement with the key, not as a verdict on the flag.
- **Groundedness.** Of everything the model returned, how many flags quote a sentence that appears
  in the document character for character. The pipeline drops the rest before a reader sees them,
  so the same figure over shown flags is 100% by construction and is printed beside it.
- **Clean documents.** How many of the documents marked benign came back Clear, and how many flags
  came back on them, shown and before the gates.
- **Severity**, only where a sidecar states what severity the product should give a clause.
- **Left out.** If the model call for a document fails or does not answer within 240 seconds, the
  document is removed from every count and listed with its error. A failed call is never a miss.
  There are no retries.

Every rate prints as count/count and as a percentage.

### Harness decisions

Each was a point where I would normally have asked. The reason is next to it.

1. **No eval existed.** `package.json` had no `eval` script, there was no eval ticket and no folder
   of run records. `.scratch/first-version/spec.md` says the PRD's "What good looks like" is
   "written to become the eval suite", which is an intention, not an eval.
2. **Branch from `main`.** The checkout was on `keepalive-more-queries`, which was left alone.
   `add-eval-suite` was created from `main`.
3. **Recall counts shown flags.** A flag the pipeline's gates drop never reaches a reader, so it is
   not a catch. Groundedness is the opposite and counts everything returned, because that is the
   only way it can be anything but 100%. To see the model's output before the gates without
   touching app code, `run.ts` wraps the real model client and records the `flags` array it
   returns. The call itself is unchanged.
4. **An empty or missing quote counts as returned and not grounded.** The model sometimes returns
   a `red-line` flag with an empty citation when no red lines were supplied.
5. **Red lines are empty.** `smoke.ts` passes `[]`, so the eval does too.
6. **No stub mode.** `smoke.ts` falls back to a stub built from the sidecars. A stub built from the
   answer key would score itself, so `npm run eval` stops with a message when the key or the model
   is not set.
7. **The model name is written into the run files**, so a run can be compared with a later one. The
   key is never read into any output.
8. **Run records are committed.** They are small, they are the history the trend in `PRD.md`
   needs, and they contain no secret.
9. **`loadDotEnvLocal` is copied from `smoke.ts`.** `smoke.ts` runs `main()` when imported, so it
   cannot be shared without editing it, and the task said to change no app code.
10. **No dependency was added.** `tsx` was already a dev dependency.

---

## Gold set 1: the instructor's set

**What it is.** Nine documents with a known clause inventory, copied byte for byte from `tests/corpus`
and `tests/fixtures` of `github.com/ankitvirmani/redline` into `eval/gold-set/corpus` and
`eval/gold-set/fixtures`. Relative paths in its `manifest.json` (`../fixtures/...`) work because the
two folders sit side by side. Its own README is `eval/gold-set/corpus/README.md`.

- Six documents carry 40 planted clauses: a gym membership, a software subscription terms of
  service, an employment offer letter, a storage unit rental, a consumer phone plan and an
  internship agreement. Three are benign: a garden plot licence, a library volunteer agreement and
  a swimming lesson registration.
- Most of it is consumer and employment paper, which the PRD excludes. It plants no personal
  guarantee and no unilateral termination, so it cannot say anything about those two types.
- Its sidecars give a severity *band* (critical, high, moderate), not a product severity, so the
  severity line is not printed for this set.

**Run it.** `npm run eval`

### Clause type mapping

| Gold-set type | Product type that counts as the right one | In scope? |
|---|---|---|
| `arbitration-and-class-action-waiver` | `arbitration-class-action-waiver` | Yes |
| `auto-renewal` | `auto-renewal` | Yes |
| `indemnification` | `indemnification` | Yes |
| `limitation-of-liability` | `liability-cap-fee-escalator` | Yes |
| `fee-escalators-and-late-fees` | `liability-cap-fee-escalator` | Yes, reported on its own row |
| `unilateral-modification` | none | **No** |
| `non-compete` | none | **No** |

Why the two are out of scope, and never counted as misses:

- **Non-compete** (4 planted). `PRD.md`, "My red lines": "Explicitly not evaluated in v1:
  non-compete clauses (employment context, segment excluded)."
- **Unilateral modification** (6 planted). `PRD.md` names unilateral *termination* and no-cause
  deactivation. A right to rewrite the terms is a different clause, and the termination prompt
  (`lib/analysis/categories/definitions/unilateral-termination.ts`) looks only for the right to end
  the relationship.

### Decisions specific to gold set 1

1. **The first clone converted line endings.** This machine has `core.autocrlf=true`, so the first
   clone wrote CRLF into the corpus files, and the documents are meant to be LF, one paragraph per
   line. I deleted that copy, cloned again with `core.autocrlf=false`, copied again, and compared
   every file against the clone by SHA-256: identical. `eval/gold-set/.gitattributes` sets `* -text`
   so git never rewrites a byte of it on any machine.
2. **Fee escalators and late fees stay in scope.** `PRD.md` lists "liability caps and fee
   escalators" as flagged generically, and the product's category is `liability-cap-fee-escalator`.
   Its prompt describes fees that escalate over time, which is narrower than late charges and
   reactivation fees (about half of this row; the rest are price increases). I kept the row in scope
   rather than drop nine clauses from the denominator on my own reading, and gave it its own line so
   a low number there is visibly about that row. If late fees should be out of scope, move the row
   in `TYPE_MAP` in `metrics.ts`.
3. **The instructor's README mentions `npm run verify:corpus`, `scripts/eval/corpus.ts` and
   `tests/eval-corpus.test.ts`.** Those belong to the instructor's repo. Their equivalents here are
   `eval/corpus.ts` and `tests/eval-gold-set.test.ts`. There is no `verify:corpus` script.
4. **Clean documents** are the three the manifest marks `benign`.

### How to read it

- Small rows move a lot. `limitation-of-liability` has four clauses, so one clause is 25 points.
  The counts are printed beside every rate for that reason.
- The instructor's README says ten of its forty planted sentences carry the typography characters.
  The character split shows whether retyping costs flags.
- Three clean documents is evidence, not proof.

---

## Gold set 2: business documents

**What it is.** Twenty documents written for a small business owner reviewing paper someone else
presented, which is what `PRD.md` says the product is for. Written by us, in `eval/gold-set-2-user-created/`
(the folder name has a space, as requested).

| Kind | Documents |
|---|---|
| With planted clauses (15, 90 planted) | retail lease, IT services MSA, B2B software subscription, merchant processing, equipment lease, franchise agreement, business loan and guaranty, business internet service, janitorial services, marketing agency, payroll/PEO, freight and logistics, supplier credit application and guaranty, construction subcontract, temporary staffing |
| Clean (5, nothing planted) | mutual NDA, short-term office lease, one-time purchase order terms, event venue rental, bookkeeping engagement letter |

- Every loaded document plants three to seven clauses under ordinary headings. 84 of the 90 are of
  types the product flags. 6 are out of scope on purpose, so the harness shows it does not count
  them: 3 non-compete or no-hire, 2 data and privacy overreach, 1 IP assignment.
- Each document carries one or two **unusual-but-harmless** sentences (an insurance requirement, a
  reporting deadline, a retainage hold) so over-flagging has something to show up against.
- The clean documents have real obligations on both sides, fixed terms and mutual notice, and no
  renewal.
- About a third of the planted sentences carry a curly quote or apostrophe, a non-breaking space,
  a ligature, an em dash or a double space.
- Each planted clause has an expected severity, Dangerous or Unusual, from the PRD's rules:
  personal guarantee, broad indemnification and one-sided termination are Dangerous; auto-renewal
  is Unusual unless the cancellation window is under 14 days or the renewal price is set without
  telling the customer, which makes it Dangerous; arbitration, liability caps and fee escalators
  are Unusual. The run reports how often a found clause carried the expected severity.

**Run it.** `npm run eval -- --set gold2`

**Rebuild it.** The documents are written in `src/*.src.txt` with the planted sentences marked in
place. `npm run eval:build-gold-set-2` cuts each marked sentence out of the same text it writes, so
a sentence cannot drift from its document. Edit the source and rebuild; do not edit `documents/` or
`sidecars/` by hand. The syntax is described at the top of `build.ts`.

### Clause type mapping

| Gold set 2 type | Product type that counts as the right one | In scope? |
|---|---|---|
| `personal-guarantee` | `personal-guarantee` | Yes |
| `unilateral-termination` | `unilateral-termination` | Yes |
| `arbitration-and-class-action-waiver` | `arbitration-class-action-waiver` | Yes |
| `auto-renewal` | `auto-renewal` | Yes |
| `indemnification` | `indemnification` | Yes |
| `limitation-of-liability` | `liability-cap-fee-escalator` | Yes |
| `fee-escalator` | `liability-cap-fee-escalator` | Yes |
| `non-compete` | none | **No** |
| `ip-assignment` | none | **No** |
| `data-privacy-overreach` | none | **No** |

Out of scope, never counted as misses:

- **Non-compete** (3 planted, here as no-hire and conversion-fee clauses). `PRD.md`: explicitly not
  evaluated in v1.
- **IP assignment** (1 planted). `PRD.md`: explicitly not evaluated in v1 (freelance context).
- **Data and privacy overreach** (2 planted). `PRD.md`: explicitly not evaluated in v1.

### Decisions specific to gold set 2

1. **Documents are generated from marked-up sources**, so every planted sentence is an exact
   substring of its document. `tests/eval-gold-set.test.ts` checks it on every commit.
2. **`fee-escalator` is its own type.** It means a price rise at the provider's discretion, so late
   charges do not muddy the row. The product type it maps to is the same one the instructor's
   `fee-escalators-and-late-fees` maps to.
3. **Expected severity comes from the PRD's rules**, not from what the product currently does. Where
   the product's code decides severity (arbitration, liability cap and fee escalator are always
   Unusual; unilateral termination and personal guarantee are always Dangerous), agreement with the
   expectation is close to automatic. The informative rows are auto-renewal and indemnification.
4. **The set key is `gold2`**, a short name so the command does not carry the folder name.
5. **`.gitattributes` sets `* -text`** here too, so git keeps the non-breaking spaces and ligatures
   byte for byte.

### How to read it

- A high number here says the product can read this kind of clause, not that it will find one in a
  stranger's lease. A model wrote the set, the same kind of model the eval measures, and wrote the
  clauses the way a model expects them to read. Every planted sentence is a complete sentence under
  a plain heading. Real contracts bury them in definitions, exhibits and cross-references.
- Five clean documents is evidence, not proof.
- Replace these with redacted real contracts when you can get them.
