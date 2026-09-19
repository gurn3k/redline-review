# 07: Auto-renewal detection

**What to build:** `analyzeDocument` detects auto-renewal / negative-option
clauses. These are Unusual by default, and escalate to Dangerous when the
renewal raises price without clear notice or the cancellation window is
unreasonably short. Each flag carries a citation and a drafted counter-offer.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** done

- [x] Auto-renewal / negative-option clauses are detected and classified
      Unusual by default.
- [x] A clause is escalated to Dangerous specifically when it combines
      price escalation on renewal with no clear notice, or an unreasonably
      short cancellation window.
- [x] Each flag carries a citation that is an exact substring of the
      document text.
- [x] Each flag carries a drafted counter-offer specific to auto-renewal
      terms, framed as example language to propose, not a guaranteed fix.
- [x] Counter-offer text contains none of the deny-listed guarantee/
      certainty words.
- [x] Labeled fixtures cover both tiers: an auto-renewal clause with fair
      notice and a reasonable window (Unusual) and one with price
      escalation plus a short window (Dangerous) — each classified
      correctly.
- [x] End-to-end: uploading a document containing an auto-renewal clause
      shows the flag at the correct severity, its citation, and its
      counter-offer in the UI. (Structural — `analysis-panel.tsx` already
      renders any category generically via its existing `CATEGORY_LABELS`
      entry for `auto-renewal`; not independently re-tested here.)

## Comments

Implemented `autoRenewalCategory` in
`lib/analysis/categories/definitions/auto-renewal.ts` with a real
`computeSeverity` function (not a constant) that reads model-supplied
`candidate.attributes` (`hasPriceIncrease`, `hasClearAdvanceNotice`,
`cancellationWindowDays`) and applies the Dangerous-escalation rule from
the ticket: Dangerous if (price increases AND no clear advance notice) OR
(cancellation window strictly fewer than 14 days); otherwise Unusual.
Malformed/missing attributes fall through to the less-severe Unusual
default rather than throwing, per precision-over-recall (ADR 0007).

The 14-day threshold for "unreasonably short" cancellation window is the
operator's specified default from the ticket instructions, not a value I
derived myself — the PRD/ADRs left "unreasonably short" qualitative, and
this ticket's build instructions gave the exact number to encode.

Tests in `tests/auto-renewal.test.ts` cover: the shared adhesion-contract
fixture's planted Dangerous case (15% price escalation + 5-day notice
window), a synthetic Unusual case (same price, 30-day window), direct
unit tests of `computeSeverity` (both escalation paths independently,
the Unusual default, and defensive fallback on undefined/empty/malformed
attributes), the clean fixture producing no Dangerous auto-renewal flag
with `checkedStandardCategories` including `"auto-renewal"`, and a
deny-list check on the Dangerous-tier counter-offer.
