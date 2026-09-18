# 07: Auto-renewal detection

**What to build:** `analyzeDocument` detects auto-renewal / negative-option
clauses. These are Unusual by default, and escalate to Dangerous when the
renewal raises price without clear notice or the cancellation window is
unreasonably short. Each flag carries a citation and a drafted counter-offer.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** ready-for-agent

- [ ] Auto-renewal / negative-option clauses are detected and classified
      Unusual by default.
- [ ] A clause is escalated to Dangerous specifically when it combines
      price escalation on renewal with no clear notice, or an unreasonably
      short cancellation window.
- [ ] Each flag carries a citation that is an exact substring of the
      document text.
- [ ] Each flag carries a drafted counter-offer specific to auto-renewal
      terms, framed as example language to propose, not a guaranteed fix.
- [ ] Counter-offer text contains none of the deny-listed guarantee/
      certainty words.
- [ ] Labeled fixtures cover both tiers: an auto-renewal clause with fair
      notice and a reasonable window (Unusual) and one with price
      escalation plus a short window (Dangerous) — each classified
      correctly.
- [ ] End-to-end: uploading a document containing an auto-renewal clause
      shows the flag at the correct severity, its citation, and its
      counter-offer in the UI.
