# 06: Indemnification detection

**What to build:** `analyzeDocument` detects indemnification clauses,
especially "any and all claims" language, and surfaces them as Dangerous
flags with a citation and a drafted counter-offer — the same shape as
personal guarantee detection (05), for uncapped or overly broad
indemnification exposure.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** ready-for-agent

- [ ] Indemnification clauses with uncapped or "any and all claims"-style
      exposure are detected and classified Dangerous per the severity test
      (ADR 0005).
- [ ] Each flag carries a citation that is an exact substring of the
      document text.
- [ ] Each flag carries a drafted counter-offer specific to indemnification
      clauses, framed as example language to propose, not a guaranteed
      fix.
- [ ] Counter-offer text contains none of the deny-listed guarantee/
      certainty words.
- [ ] A labeled fixture with a known planted uncapped-indemnification
      clause is caught and classified Dangerous; the clean fixture set
      produces no indemnification flag.
- [ ] End-to-end: uploading a document containing an uncapped
      indemnification clause shows the flag, its citation, and its
      counter-offer in the UI.
