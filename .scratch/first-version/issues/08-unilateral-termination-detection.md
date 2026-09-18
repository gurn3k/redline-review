# 08: Unilateral termination / no-cause deactivation detection

**What to build:** `analyzeDocument` detects unilateral termination /
no-cause deactivation clauses and classifies them Dangerous via the
existential-risk path (ADR 0005) — even when no dollar figure is attached
— when the clause lets the counterparty end the relationship with no cause
and no cure period, and the User has no realistic leverage to negotiate it
out. Each flag carries a citation and a drafted counter-offer.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** ready-for-agent

- [ ] Unilateral termination / no-cause deactivation clauses are detected
      and classified Dangerous via the existential-risk check (no cause,
      no cure period, no realistic leverage) independent of any dollar
      exposure.
- [ ] Each flag carries a citation that is an exact substring of the
      document text.
- [ ] Each flag carries a drafted counter-offer (e.g. proposing a cure
      period or cause requirement), framed as example language to propose,
      not a guaranteed fix.
- [ ] Counter-offer text contains none of the deny-listed guarantee/
      certainty words.
- [ ] A labeled fixture with a known planted no-cause termination clause is
      caught and classified Dangerous; the clean fixture set produces no
      termination flag.
- [ ] End-to-end: uploading a document containing a no-cause termination
      clause shows the flag, its citation, and its counter-offer in the UI.
