# 08: Unilateral termination / no-cause deactivation detection

**What to build:** `analyzeDocument` detects unilateral termination /
no-cause deactivation clauses and classifies them Dangerous via the
existential-risk path (ADR 0005) — even when no dollar figure is attached
— when the clause lets the counterparty end the relationship with no cause
and no cure period, and the User has no realistic leverage to negotiate it
out. Each flag carries a citation and a drafted counter-offer.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** done

- [x] Unilateral termination / no-cause deactivation clauses are detected
      and classified Dangerous via the existential-risk check (no cause,
      no cure period, no realistic leverage) independent of any dollar
      exposure.
- [x] Each flag carries a citation that is an exact substring of the
      document text.
- [x] Each flag carries a drafted counter-offer (e.g. proposing a cure
      period or cause requirement), framed as example language to propose,
      not a guaranteed fix.
- [x] Counter-offer text contains none of the deny-listed guarantee/
      certainty words.
- [x] A labeled fixture with a known planted no-cause termination clause is
      caught and classified Dangerous; the clean fixture set produces no
      termination flag.
- [x] End-to-end: uploading a document containing a no-cause termination
      clause shows the flag, its citation, and its counter-offer in the UI.
      (Satisfied structurally — `analysis-panel.tsx` already renders any
      category generically, including `unilateral-termination`, via its
      existing label lookup; not independently tested here per ticket
      scope.)

## Comments

Implemented `unilateralTerminationCategory` in
`lib/analysis/categories/definitions/unilateral-termination.ts` with
`computeSeverity` a pure `() => "Dangerous"` rule (existential-risk prong of
ADR 0005 has no gradations) and `promptInstructions` guiding the model to
require BOTH a missing cause requirement AND a missing cure period, plus no
realistic leverage, before flagging — explicitly excluding ordinary
for-cause-with-cure-period clauses and mutual/symmetric termination-for-
convenience clauses per ADR 0007 (precision over recall).

Tests added in `tests/unilateral-termination.test.ts` (4 cases, mirroring
`tests/personal-guarantee.test.ts`'s pattern): fixture-based Dangerous
detection against the exact planted sentence in
`tests/fixtures/adhesion-contract.sidecar.json`, a pure `computeSeverity`
check against fabricated candidate shapes, a clean-fixture no-flag check
(clean-contract.txt's mutual for-cause/cure-period termination clause is
exactly the case this category must NOT flag), and a deny-list check on the
test's own counter-offer text.

`npm run typecheck`, `npm test` (43/43 across 8 files), and `npm run build`
all pass. Only two files created, per file-ownership scope: this
definitions file and its test. No existing files edited, no dependencies
added.
