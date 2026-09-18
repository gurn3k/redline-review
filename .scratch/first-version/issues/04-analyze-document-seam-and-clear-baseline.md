# 04: Core analyzeDocument seam and Clear baseline

**What to build:** The `analyzeDocument(documentText, redLines) →
AnalysisResult` seam exists end-to-end: a User can run analysis on an
uploaded document and see a plain-English summary plus an explicit Clear
result, naming what was checked (the standard clause set and which red
lines were evaluated) — never silence, never an empty list (ADR 0009). The
citation-integrity hard gate (ADR 0001) and the confidence gate (ADR 0007 /
0008: shown plainly or not shown at all, no hedged middle tier) are built
into the seam now, even though no clause type produces a real flag yet —
those land in tickets 05-09 and must pass through this same gate. All model
calls route through OpenRouter (no direct provider SDK calls).

**Blocked by:** 02 (Upload and text extraction), 03 (Red-lines CRUD)

**Status:** ready-for-agent

- [ ] `analyzeDocument` seam calls OpenRouter and returns an
      `AnalysisResult` (summary string; flags list; Clear state) — no
      direct model-provider SDK calls anywhere.
- [ ] User can trigger analysis on an uploaded document from the UI and see
      the plain-English summary.
- [ ] When no flag clears the bar, the User sees an explicit Clear result
      naming the standard clause set and the specific red lines evaluated
      — not a generic "no issues found" and not an empty list.
- [ ] Citation-integrity gate is enforced in code: any candidate flag whose
      quote is not an exact substring of `documentText` is dropped before
      it reaches `AnalysisResult` — covered by a test that asserts this on
      every flag, not sampled.
- [ ] Confidence gate is enforced in code: there is no code path that
      produces a hedged or "possible risk" middle tier — a flag either
      clears the bar and is shown plainly, or isn't shown.
- [ ] Since no clause detection exists yet, running this on any document
      produces Clear — verified with at least one test fixture.
