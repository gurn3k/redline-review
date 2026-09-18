# 05: Personal guarantee detection

**What to build:** `analyzeDocument` detects personal guarantee clauses —
open-ended personal financial exposure the User can't cap in advance — and
surfaces them as Dangerous flags, each with a citation and a drafted
counter-offer. A User uploading a document with a personal guarantee clause
sees it flagged end-to-end in the UI.

**Blocked by:** 04 (Core analyzeDocument seam and Clear baseline)

**Status:** ready-for-agent

- [ ] Personal guarantee clauses are detected and classified Dangerous per
      the severity test (ADR 0005): uncapped personal financial exposure,
      no realistic leverage to negotiate it out.
- [ ] Each flag carries a citation that is an exact substring of the
      document text (passes the existing citation-integrity gate from 04).
- [ ] Each flag carries a drafted counter-offer specific to personal
      guarantee clauses, framed as example language to propose, not a
      guaranteed fix.
- [ ] Counter-offer text contains none of the deny-listed guarantee/
      certainty words ("guarantees," "protected," "enforceable").
- [ ] A labeled fixture with a known planted personal-guarantee clause is
      caught and classified Dangerous; a curated "clean" fixture with no
      such clause produces no personal-guarantee flag.
- [ ] End-to-end: uploading a document containing a personal guarantee
      clause shows the flag, its citation, and its counter-offer in the UI.
