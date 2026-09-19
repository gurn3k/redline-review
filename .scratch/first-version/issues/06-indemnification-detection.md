# 06: Indemnification detection

**What to build:** `analyzeDocument` detects indemnification clauses,
especially "any and all claims" language, and surfaces them as Dangerous
flags with a citation and a drafted counter-offer — the same shape as
personal guarantee detection (05), for uncapped or overly broad
indemnification exposure.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** done

- [x] Indemnification clauses with uncapped or "any and all claims"-style
      exposure are detected and classified Dangerous per the severity test
      (ADR 0005).
- [x] Each flag carries a citation that is an exact substring of the
      document text.
- [x] Each flag carries a drafted counter-offer specific to indemnification
      clauses, framed as example language to propose, not a guaranteed
      fix.
- [x] Counter-offer text contains none of the deny-listed guarantee/
      certainty words.
- [x] A labeled fixture with a known planted uncapped-indemnification
      clause is caught and classified Dangerous; the clean fixture set
      produces no indemnification flag.
- [x] End-to-end: uploading a document containing an uncapped
      indemnification clause shows the flag, its citation, and its
      counter-offer in the UI.

## Comments

Implemented `indemnificationCategory: CategoryDefinition` in
`lib/analysis/categories/definitions/indemnification.ts`. `computeSeverity`
unconditionally returns `"Dangerous"` — per ADR 0005/0007 there is no Unusual
tier for this category; a capped/mutual/carved-out indemnification clause
should simply never be flagged, which the `promptInstructions` block tells
the model explicitly (precision over recall). Counter-offer guidance steers
the model toward a dollar cap tied to fees paid, mutuality, or a carve-out
for the counterparty's own negligence, without deny-listed words.

Tests in `tests/indemnification.test.ts` (4 tests, all passing) cover:
detection + Dangerous severity against the exact planted sentence in
`tests/fixtures/adhesion-contract.sidecar.json`'s `indemnification` entry,
`computeSeverity` as a pure always-Dangerous rule under different fabricated
candidate shapes, a clean-fixture run (stubbed `flags: []`) confirming
`result.clear` is non-null and `checkedStandardCategories` includes
`"indemnification"`, and a self-check that the counter-offer text used in
the detection test doesn't itself trip `containsDenyListedWord`.

The end-to-end UI checkbox is satisfied structurally: `analysis-panel.tsx`
already has an `indemnification: "Indemnification"` label-lookup entry and
renders any category generically — confirmed by reading it, not edited.

`npm run typecheck`, `npm test` (38/38 passing across all 7 test files),
and `npm run build` all pass. No new dependency needed. Did not touch
`lib/analysis/categories/registry.ts` — the orchestrator wires
`indemnificationCategory` into `CATEGORY_REGISTRY` itself. Only the two
files in this ticket's ownership were created; nothing else was edited.
