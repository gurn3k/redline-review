# 13: Eval suite

**What to build:** `npm run eval` runs a gold set of documents with known planted clauses through
the same pipeline `npm run smoke` uses, with the OpenRouter settings in `.env.local`, and reports
recall, groundedness and clean-document results as described in `PRD.md` under "How we measure
it". It changes no app code, prompt or model setting. The decisions behind it are in
`eval/README.md`.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline), 05-09 (the clause types it measures)

**Status:** done

- [x] `npm run eval` runs every document in the gold set's `manifest.json` through
      `analyzeDocument` the way `scripts/smoke.ts` does.
- [x] The gold set's seven clause types are mapped onto this product's types, and the mapping is
      written in `eval/README.md`.
- [x] A planted clause counts as found when a shown flag quotes a sentence that overlaps the
      planted sentence. Whether the flag named the right type is reported separately.
- [x] Types the product leaves out are listed as out of scope and never counted as misses.
- [x] A document whose model call fails is left out of every denominator, and the number left out
      is printed.
- [x] Recall is split by whether the planted sentence contains a curly quote or apostrophe, a
      non-breaking space, an fi or fl ligature, an em dash, or two spaces in a row.
- [x] Every rate prints as count/count and as a percentage.
- [x] Each run is saved to `eval-runs/` as a `.txt` and a `.json` named for the time it started,
      with every flag's document, clause type, severity, quoted sentence, and whether it matched a
      planted clause.
- [x] `npm test` includes a test with no network that checks every gold-set sentence appears
      exactly once in its document.
- [x] `PRD.md` has a "How we measure it" section.

## Comments

No eval existed before this ticket. The gold set is the instructor's, copied unchanged from
`github.com/ankitvirmani/redline` (`tests/corpus` and `tests/fixtures`). The first clone converted
line endings on this machine, so it was redone with conversion off and compared byte for byte.

`eval/run.ts` wraps the real model client to record the model's flags before the pipeline's gates.
That is how groundedness is measured over everything the model returned. The call it forwards is
the same one `analyzeDocument` makes by default.

First run, 2026-11-02, nine documents, none left out:

- Recall 16/30 (53.3%); all 16 found named the right type. Auto-renewal 2/6, fee escalators and
  late fees 0/9, indemnification 6/6, arbitration 5/5, liability cap 3/4.
- Groundedness 17/20 (85.0%) over everything returned. Three flags were dropped by the citation
  gate: two retyped quotes and one flag with an empty quote.
- Clean documents: 3/3 came back Clear, 0 flags.

The 0/9 on fee escalators and late fees is the row most affected by the call to keep that type in
scope (see `eval/README.md`, decision 9). About half of its planted clauses are late and
reactivation charges, which the product's prompt does not describe. The rest are price increases
the prompt does describe, and those were missed too, so scope alone does not explain the row.

These are upper bounds, per `PRD.md`.

Second set added: `eval/gold-set-2-user-created`, twenty business documents (15 with 90 planted clauses, 5
clean), run with `npm run eval -- --set gold2`. First run, 2026-11-02, 20 of 20 scored:

- Recall 63/84 (75.0%); all 63 named the right type. Personal guarantee 4/7, unilateral
  termination 12/15, liability cap 6/13, indemnification 10/13, auto-renewal 10/12, fee escalator
  11/14, arbitration 10/10.
- Severity as expected on 51/63 found (81.0%): Dangerous 29/30, Unusual 22/33.
- Groundedness 64/86 (74.4%) of everything returned.
- Clean documents: 5/5 Clear, 0 flags. Shown flags on the loaded documents that matched nothing
  planted or only a harmless sentence: 0.
- By typography: sentences carrying a curly quote, non-breaking space, ligature, em dash or double
  space were found 10/31 (32.3%); sentences carrying none were found 53/53 (100%). Retyped
  characters are costing most of the misses.
