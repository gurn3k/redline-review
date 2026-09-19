# 09: Generic detection: arbitration/class-action waiver and liability cap/fee escalator

**What to build:** `analyzeDocument` flags arbitration / class-action
waiver clauses and liability-cap / fee-escalator clauses using generic
pattern detection only (ADR 0006) — no tailored counter-offer language for
either, unlike the first-class clause types in 05-08. A User uploading a
document containing one of these clauses sees it flagged with a citation,
but with generic (not clause-specific) framing.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** done

- [x] Arbitration / class-action waiver clauses are detected via generic
      pattern matching and flagged (severity per the standard test — these
      typically won't show a dollar ceiling or existential-risk trigger on
      their own, so classify per whatever the matched language actually
      supports).
- [x] Liability-cap / fee-escalator clauses are detected via generic
      pattern matching and flagged when present.
- [x] Each flag carries a citation that is an exact substring of the
      document text.
- [x] Neither clause type gets tailored counter-offer language — generic
      detection only, per ADR 0006. (If the `AnalysisResult` shape requires
      a counter-offer field, use clearly generic framing here, not
      clause-specific drafted language.)
- [x] A labeled fixture for each of the two clause types is caught; the
      clean fixture set produces neither flag.
- [x] End-to-end: uploading a document containing an arbitration clause or
      a liability cap shows the flag and its citation in the UI (already
      satisfied structurally — `analysis-panel.tsx` already has label
      entries for both category slugs and renders any flag generically;
      not touched by this ticket).

## Comments

Both categories' `computeSeverity` is a constant function that always
returns `"Unusual"`, regardless of the candidate's content. This is a
deliberate simplification, not an oversight: per ADR 0006, arbitration/
class-action-waiver and liability-cap/fee-escalator get generic pattern
detection only, with no deep, clause-specific extraction logic. ADR 0005's
Dangerous test requires either a demonstrated open-ended financial-exposure
ceiling or an existential/relationship-ending risk trigger — auto-renewal
(ticket 07) can support that test because its `computeSeverity` reads
model-supplied structured attributes (price-escalation percentage,
cancellation-window length) extracted specifically for that purpose. Neither
generic-detection category here asks the model for that kind of structured
data (per ADR 0006's build-scope decision), so there's no honest basis to
ever call one Dangerous — defaulting to Unusual is the accurate reflection
of what generic pattern matching alone actually supports, not a shortcut
taken to save time. If usage data later shows either category warrants a
real Dangerous escalation path, that would mean promoting it out of
generic-detection-only status (see ADR 0006 consequences), which is out of
scope for this ticket.

Implementation: `lib/analysis/categories/definitions/arbitration-class-action-waiver.ts`
exports `arbitrationClassActionWaiverCategory`, and
`lib/analysis/categories/definitions/liability-cap-fee-escalator.ts` exports
`liabilityCapFeeEscalatorCategory` — both `CategoryDefinition`s with
`isGenericDetection: true`. Tests in `tests/generic-detection.test.ts` cover
both categories detected together from the shared `adhesion-contract.txt`
fixture (using the exact sidecar citations), `computeSeverity` unit tests
for both, the clean fixture producing neither flag, and a deny-list/
genericness check on the counter-offer copy used in the tests. No new
dependency was needed. `npm run typecheck`, `npm test` (43/43 passing
including the 5 new tests), and `npm run build` all pass.
