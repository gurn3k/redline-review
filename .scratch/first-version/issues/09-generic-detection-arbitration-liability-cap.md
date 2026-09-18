# 09: Generic detection: arbitration/class-action waiver and liability cap/fee escalator

**What to build:** `analyzeDocument` flags arbitration / class-action
waiver clauses and liability-cap / fee-escalator clauses using generic
pattern detection only (ADR 0006) — no tailored counter-offer language for
either, unlike the first-class clause types in 05-08. A User uploading a
document containing one of these clauses sees it flagged with a citation,
but with generic (not clause-specific) framing.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** ready-for-agent

- [ ] Arbitration / class-action waiver clauses are detected via generic
      pattern matching and flagged (severity per the standard test — these
      typically won't show a dollar ceiling or existential-risk trigger on
      their own, so classify per whatever the matched language actually
      supports).
- [ ] Liability-cap / fee-escalator clauses are detected via generic
      pattern matching and flagged when present.
- [ ] Each flag carries a citation that is an exact substring of the
      document text.
- [ ] Neither clause type gets tailored counter-offer language — generic
      detection only, per ADR 0006. (If the `AnalysisResult` shape requires
      a counter-offer field, use clearly generic framing here, not
      clause-specific drafted language.)
- [ ] A labeled fixture for each of the two clause types is caught; the
      clean fixture set produces neither flag.
- [ ] End-to-end: uploading a document containing an arbitration clause or
      a liability cap shows the flag and its citation in the UI.
