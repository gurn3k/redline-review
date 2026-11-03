# Redline First Version

Status: ready-for-agent

## Problem Statement

A small business owner (the User — see `CONTEXT.md`) is about to sign
Incoming paper — a vendor or service agreement, a commercial lease, a
contract carrying a personal guarantee — and can't easily tell which
clauses expose them to real risk. A lawyer's flat-fee review runs
$250–$750, and 67% of small business owners with unmet legal needs skip a
lawyer specifically because of cost; 85% of those with unmet needs report
real financial harm as a result. So they either skip review entirely or
sign without fully grasping clauses like personal guarantees,
indemnification, or auto-renewal terms — whose danger isn't obvious from
reading alone.

## Solution

The User uploads a contract before signing it and gets back: a
plain-English summary; a ranked list of Dangerous/Unusual clauses, each
tied to the exact sentence it came from; a drafted counter-offer per
flagged clause; a Q&A box that answers only from the document; and an
explicit Clear result when nothing warrants a flag, checked against both a
standard clause set and the User's own editable red lines. Past documents
are saved to a personal library.

## User Stories

1. As a small business owner, I want to upload a contract before I sign it, so that I can review it before I'm bound by it.
2. As a small business owner, I want the text of my document extracted and stored instead of the original file, so that my original file isn't retained by Redline.
3. As a small business owner, I want a plain-English summary of the document, so that I understand what it says without reading dense legal language myself.
4. As a small business owner, I want risky clauses ranked by severity (Dangerous or Unusual), so that I know which ones deserve my attention first.
5. As a small business owner, I want every flagged clause to show me the exact sentence it's based on, so that I can verify the claim myself instead of trusting Redline's judgment blindly.
6. As a small business owner, I want a flag dropped rather than shown with a vague or unquotable claim, so that everything I see is something I can check.
7. As a small business owner, I want personal guarantee clauses evaluated for uncapped personal financial exposure, so that I know when signing puts my personal assets at risk, not just my business's.
8. As a small business owner, I want indemnification clauses evaluated for uncapped or broad "any and all claims" exposure, so that I know when I could be liable for costs far larger than the deal itself.
9. As a small business owner, I want auto-renewal clauses evaluated for price escalation and short cancellation windows, so that I don't get locked into a worse deal without noticing.
10. As a small business owner, I want unilateral termination clauses evaluated for existential risk even with no dollar figure attached, so that I know when a vendor or client relationship could end abruptly with no cause and no recourse.
11. As a small business owner, I want arbitration and class-action waiver clauses flagged even with generic detection, so that I know when I might lose the ability to pursue a claim about anything else in the document.
12. As a small business owner, I want liability cap clauses flagged when detected, so that I'm aware if my ability to recover damages is capped low.
13. As a small business owner, I want a drafted counter-offer for each flagged clause, so that I have concrete language to propose instead of just knowing something is wrong.
14. As a small business owner, I want counter-offer language to read as a suggestion rather than a guaranteed fix, so that I don't mistake Redline's draft for a legal guarantee.
15. As a small business owner, I want to ask follow-up questions about the document in a Q&A box, so that I can get clarification without re-reading the whole thing myself.
16. As a small business owner, I want Q&A answers grounded only in the document's own text, so that I'm not given information that isn't actually in what I'm about to sign.
17. As a small business owner, I want the Q&A box to decline to answer rather than guess, so that I don't act on invented information.
18. As a small business owner, I want to maintain my own list of red lines, so that Redline checks the document against terms I specifically care about, not just a generic checklist.
19. As a small business owner, I want to edit my red-lines list at any time, so that it reflects what actually matters to me as my business changes.
20. As a small business owner, I want my red-lines list to drive the analysis, so that a term I've specifically flagged as unacceptable gets checked even if it isn't on Redline's standard list.
21. As a small business owner, I want an explicit Clear result when nothing is flagged, so that I know Redline actually checked the document rather than silently finding nothing.
22. As a small business owner, I want the Clear result to state what was checked against, so that Clear is a specific, checkable claim and not a vague reassurance.
23. As a small business owner, I want flagged clauses stated in plain, direct language rather than hedged with "might" or "could potentially," so that I can act on what I'm told instead of guessing how seriously to take it.
24. As a small business owner, I want a document I've already analyzed saved to a personal library, so that I can come back to it without re-uploading and re-running the analysis.
25. As a small business owner, I want to see my past analyzed documents in one place, so that I can compare a new contract against ones I've reviewed before.
26. As a small business owner, I want to log in and have my documents and red lines tied to my account, so that only I can see them.
27. As a small business owner, I want Redline to never share my documents with other users, so that my confidential business dealings stay private.
28. As a small business owner, I want the analysis to be based only on my document and not fabricate a risk that isn't actually present in the text, so that I'm not chasing a problem that doesn't exist.
29. As a small business owner, I want the product to say nothing about whether I should sign or what a court would decide, so that I understand this is document literacy, not legal advice.
30. As a small business owner, I want to know that Redline only reviews documents presented to me for signature, not ones I draft myself, so that I don't mistakenly rely on it for the wrong direction of review.
31. As a small business owner, I want to see what "Dangerous" and "Unusual" actually mean, so that severity ratings aren't just unexplained labels.
32. As a small business owner, I want a clear error if my uploaded document's text can't be reliably extracted, so that I don't get an analysis built on garbled text.
33. As a small business owner, I want to know if a document has no extractable text at all (e.g. a scanned image with no text layer), so that I can get a proper digital copy instead of assuming Redline reviewed it.

## Implementation Decisions

- **Two seams, and only two, for the model-driven logic:**
  - `analyzeDocument(documentText, redLines) → AnalysisResult`: the sole
    producer of the plain-English summary, the ranked flags, the
    counter-offers, and the Clear verdict.
  - `answerFromDocument(documentText, question) → Answer`: the Q&A seam.
    Operates directly against the document text and the question,
    independent of `analyzeDocument`'s output — it does not have access to
    the flags.
  - Kept as two seams rather than one because they carry different
    grounding contracts: verifying a pre-existing quote against a fixed
    clause/red-line set, versus grounding an arbitrary open-ended
    question.
- **`AnalysisResult` shape:** a summary string; a list of flags, each
  carrying a citation (a verbatim substring of `documentText`), a severity
  (Dangerous or Unusual), a category, and a counter-offer string; and a
  Clear state used when no flag clears the bar, which itself carries a
  description of what was checked (the standard clause set plus which red
  lines were evaluated).
- **Citation integrity is a hard gate (ADR 0001):** a candidate flag whose
  citation cannot be found as an exact substring of `documentText` is
  dropped before it reaches `AnalysisResult`, never shown degraded or
  paraphrased.
- **Severity test (ADR 0005):** Dangerous requires either (a) open-ended,
  uncapped financial exposure, or (b) existential/relationship-ending risk
  (e.g. termination with no cause and no cure period) — in both cases only
  where the User has no realistic leverage to negotiate it out. Unusual is
  everything else that deviates from market norms but is bounded.
- **First-class vs. generic clause detection (ADR 0006):** personal
  guarantee, indemnification, and auto-renewal clauses get specific
  detection heuristics and tailored counter-offer language. Arbitration /
  class-action waiver and liability-cap / fee-escalator clauses get only
  generic pattern detection, with no tailored counter-offer language, in
  this version. Non-compete, IP assignment, and data/privacy-overreach
  clause types are not evaluated at all (out of scope, see below).
- **Confidence gate, not a confidence dial (ADR 0007, 0008):** a candidate
  flag either clears the Dangerous/Unusual bar with a valid citation and is
  shown in plain, unhedged language, or it is not shown. There is no
  lower-confidence or softly-worded middle tier.
- **Explicit Clear state, never silence (ADR 0009):** when zero flags
  clear the bar, `AnalysisResult` carries a Clear state naming what was
  checked, not an empty flags array rendered as an implicit "all good."
- **Counter-offer copy constraint:** counter-offer text must not use
  guarantee/certainty language ("guarantees," "protected," "enforceable").
  This is a testable property of `analyzeDocument`'s output.
- **Red lines are evaluated with the same rigor as standard clauses:** a
  User-authored red line is passed into `analyzeDocument` alongside the
  standard clause set and is subject to the same citation requirement and
  severity test — not a separate, weaker-standard check.
- **Document handling (existing stack decision, unchanged):** files are
  parsed client-side; only extracted text is sent to the backend or
  stored. The original file is never persisted. If no reliable text can be
  extracted, the User gets an explicit error rather than an analysis run
  on garbled or absent text.
- **Model calls (existing stack decision, unchanged):** both seams route
  through OpenRouter; no direct provider SDK calls.
- **Persistence:** analyzed documents are saved per-user as extracted text
  plus the full `AnalysisResult` (not flags-only), scoped to the
  authenticated user via Supabase auth. No cross-user access. The library
  itself is plain CRUD and is not a tested seam.
- **Positioning copy (ADR 0010):** UI copy accompanying summaries, flags,
  and Clear results states that Redline explains document text and
  patterns, not legal advice or enforceability. A content decision, not a
  logic decision, but binding on what ships.

## Testing Decisions

Tests assert on the external behavior of the two seams — the shape and
content of `AnalysisResult` / `Answer` given a `documentText` input — never
on internal prompt structure or model-call details.

- **`analyzeDocument`:**
  - Citation integrity, checked on every test case, not sampled: every
    flag's citation must be an exact substring of the input document text.
    Mirrors the hard-bug-gate testing rule in ADR 0001.
  - Severity correctness on a small labeled fixture set: documents with a
    known planted personal-guarantee clause, a known uncapped
    indemnification clause, and a known no-cause termination clause — each
    must be caught and classified Dangerous.
  - Zero false positives on a curated "clean" fixture set of ordinary,
    unremarkable contracts — must return Clear on all of them, per the
    "what good looks like" bar in `docs/PRD.md`. No recall percentage is
    asserted; `docs/PRD.md` deliberately does not set one.
  - Clear-state specificity: when Clear is returned, the result must name
    what was checked (standard clause set plus the red lines passed in for
    that test case), not a generic message.
  - Counter-offer copy check: scan counter-offer text for a small
    deny-list of guarantee/certainty words; none should appear.
  - Red-line evaluation: a red line supplied for a test case that matches
    document text produces a flag through the same citation and severity
    path as standard clauses.
- **`answerFromDocument`:**
  - Grounding check: for a question whose answer is present in the
    document, the response must reference content actually in the
    document text.
  - Refusal check: for a question whose answer is not supported by the
    document, the response must decline rather than fabricate an answer.
- No prior art exists in this codebase for either kind of test — this is a
  greenfield repo with no code yet.

## Out of Scope

- Outgoing-paper review (documents the User drafts/issues themselves) —
  ADR 0003.
- Post-signing support (documents already signed) — ADR 0004.
- Freelancer, renter, and job-seeker-specific workflows — ADR 0002.
- Deep detection or negotiation logic for non-compete, IP assignment, and
  data/privacy-overreach clause types — segment excluded, ADR 0002/0006.
- Tailored counter-offer language for arbitration/class-action-waiver and
  liability-cap/fee-escalator clauses — generic detection only, ADR 0006.
- Jurisdiction-specific enforceability guidance — ADR 0010, deferred.
- A numeric 0–100 risk score — rejected, ADR 0010.
- Payments/billing, OCR, and cross-user document sharing — out of scope
  per `CLAUDE.md`.
- A hard numeric recall target for `analyzeDocument` — deliberately not
  set; see `docs/PRD.md`.

## Further Notes

- This spec covers the entire first version as one unit, by explicit
  choice, rather than being broken into per-feature specs.
- `docs/PRD.md`'s "What good looks like" section is the source for the testing
  bar above; it's written to become the eval suite these tests should
  build toward.
- Read `CONTEXT.md` (User, Incoming/Outgoing paper, Dangerous/Unusual,
  Clear) and ADRs 0001–0010 in `docs/adr/` before implementing — this spec
  assumes that vocabulary and those decisions throughout.
