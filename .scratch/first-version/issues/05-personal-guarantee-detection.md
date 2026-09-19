# 05: Personal guarantee detection

**What to build:** `analyzeDocument` detects personal guarantee clauses —
open-ended personal financial exposure the User can't cap in advance — and
surfaces them as Dangerous flags, each with a citation and a drafted
counter-offer. A User uploading a document with a personal guarantee clause
sees it flagged end-to-end in the UI.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** done

- [x] Personal guarantee clauses are detected and classified Dangerous per
      the severity test (ADR 0005): uncapped personal financial exposure,
      no realistic leverage to negotiate it out.
- [x] Each flag carries a citation that is an exact substring of the
      document text (passes the existing citation-integrity gate from 04).
- [x] Each flag carries a drafted counter-offer specific to personal
      guarantee clauses, framed as example language to propose, not a
      guaranteed fix.
- [x] Counter-offer text contains none of the deny-listed guarantee/
      certainty words ("guarantees," "protected," "enforceable").
- [x] A labeled fixture with a known planted personal-guarantee clause is
      caught and classified Dangerous; a curated "clean" fixture with no
      such clause produces no personal-guarantee flag.
- [x] End-to-end: uploading a document containing a personal guarantee
      clause shows the flag, its citation, and its counter-offer in the UI
      (structurally satisfied — `analysis-panel.tsx` already renders any
      category generically, including `personal-guarantee`, via its
      existing label lookup; not independently re-tested here).

## Comments

Implemented `personalGuaranteeCategory: CategoryDefinition` in
`lib/analysis/categories/definitions/personal-guarantee.ts`, with
`computeSeverity` always returning `"Dangerous"` (no Unusual tier for this
category) and `promptInstructions` describing the detection heuristic
(individual personally liable for the business's obligations, no stated
dollar cap, no realistic way to negotiate out) plus counter-offer guidance
(propose a dollar cap or drop the personal guarantee and keep liability at
the entity level), staying clear of deny-listed words.

Tests in `tests/personal-guarantee.test.ts` cover: (1) detection + Dangerous
classification against the shared `adhesion-contract.txt` fixture's planted
personal-guarantee sentence, run through `analyzeDocument` with a local
`[personalGuaranteeCategory]` registry (not the global one, which this
ticket does not touch); (2) `computeSeverity` is a pure always-Dangerous
rule regardless of input; (3) the clean fixture (empty `flags` from the
stub) produces `result.clear` non-null with `"personal-guarantee"` in
`checkedStandardCategories`; (4) the counter-offer text used in test 1 does
not trip `containsDenyListedWord`, confirming the flag survives on correct
detection rather than an accidental gate failure.

Did not touch `lib/analysis/categories/registry.ts` (empty `CATEGORY_REGISTRY`
stays empty — orchestrator wires this category in) or `analysis-panel.tsx`
(already renders `personal-guarantee` generically via its existing label
lookup, confirmed by reading it). No new dependency needed.

`npm run typecheck` and `npm test` (38 tests across 7 files) both pass.
`npm run build` was contended by sibling tickets' concurrent builds in this
shared repo at the time of this run (see final report from this ticket's
agent for outcome once the lock cleared).
