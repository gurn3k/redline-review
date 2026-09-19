# 12: Positioning/UPL disclaimer audit

**What to build:** A sweep across every surface that shows Redline's
output — summaries, flags, counter-offer drafts, the Q&A box, and the Clear
result — confirming each is framed as explaining document text and
patterns, never as legal advice, a determination of enforceability, or what
the User should do (ADR 0010). This is a copy/framing pass over screens
built in earlier tickets, not new product logic.

**Blocked by:** 04, 05, 06, 07, 08, 09, 10, 11 (every screen this audits
must exist first)

**Status:** done

- [x] Summary screen copy frames output as explaining the document, not
      giving advice.
- [x] Flag copy (for every clause type from 05-09) references the cited
      sentence as the thing being explained, not a freestanding legal
      verdict.
- [x] Counter-offer copy across all clause types is phrased as "example
      language you could propose," never "the legally correct fix" —
      re-verify the guarantee/certainty deny-list holds across all of them
      together, not just per-ticket.
- [x] Q&A answers are framed as document-grounded explanation, not legal
      guidance.
- [x] The Clear result's copy doesn't imply a legal determination of
      safety.
- [x] No screen anywhere in the app implies Redline determines
      enforceability or what a court would decide, or gives
      jurisdiction-specific guidance (explicitly out of scope, ADR 0010).
- [x] The footer disclaimer from ticket 01 is present on every screen
      audited here (confirm, don't re-author).

## Comments

Full sweep of every surface named in the ticket, plus the model-facing
system prompts that generate the copy on those surfaces (`analyzeDocument`'s
system prompt and `answerFromDocument`'s system prompt), since those are
what actually produce the summary/flag/counter-offer/answer text a user
reads. No code logic, props, data flow, or routing was touched — this was a
read-and-verify pass, and it turned up no violations, so no copy edits were
made and the humanizer skill wasn't invoked (nothing was written or
changed).

Surface-by-surface:

- **`app/(app)/documents/[id]/analysis-panel.tsx`** — compliant as-is. The
  idle/pending states, flag cards, and `ClearBlock` all read as explaining
  document text ("No Dangerous or Unusual clauses found against your red
  lines and Redline's standard clause set," never "this document is safe").
  Counter-offers are labeled "Example language to propose."
- **`lib/analysis/categories/definitions/*.ts`** (all six: personal
  guarantee, indemnification, auto-renewal, unilateral-termination,
  arbitration/class-action waiver, liability-cap/fee-escalator) —
  compliant as-is. Every category's `promptInstructions` already
  instructs the model to draft counter-offers "as example language the
  user could propose, never as a guaranteed outcome," and explicitly
  bans "guarantees," "guaranteed," "protected," "protects," "protection,"
  "enforceable," and "enforceability" in the counter-offer text. The two
  generic-detection categories (arbitration, liability-cap) are
  explicitly scoped to non-tailored suggestions only ("you could propose
  removing this clause"), not deep negotiated fixes. No changes made, so
  the existing test suites for these files were left untouched.
- **`lib/analysis/analyze-document.ts`** (the shared system prompt that
  wraps all six category instructions) — compliant as-is. States plainly
  up front: "you are not a lawyer, you do not give legal advice, and you
  never state or imply whether a clause is enforceable in any
  jurisdiction or what a court would decide." Also enforces the
  guarantee/certainty deny-list as a hard code gate
  (`lib/analysis/deny-list.ts`), independent of the prompt wording, on
  every counter-offer before it can reach the UI.
- **`lib/qa/answer-from-document.ts`** (the Q&A system prompt) —
  compliant as-is. Frames itself explicitly as "document-grounded
  explanation, not legal advice," answers only from the supplied text,
  and declines rather than guesses when the text doesn't support an
  answer.
- **`app/(app)/documents/[id]/qa-box.tsx`** — compliant as-is. Intro copy:
  "Ask a question and Redline will answer only from this document's own
  text. If the text doesn't cover it, it'll say so plainly." No verdict
  language anywhere in the rendered Q&A history.
- **`app/components/disclaimer-footer.tsx`** — compliant, not re-authored.
  States Redline "isn't legal advice, it isn't a lawyer, and it doesn't
  decide whether a clause is enforceable or whether you should sign."
- **`app/layout.tsx`** — confirmed (not just assumed): `DisclaimerFooter`
  renders directly in the root `<body>`, outside `{children}`. The only
  nested layout is `app/(app)/layout.tsx`, which renders a `<div>`/`<main>`
  shell and does not touch `<html>`/`<body>` or opt out of the root
  layout, so every route (landing, login, and every route under `(app)`)
  renders inside the root layout and gets the footer. No route bypasses
  it.
- **`app/page.tsx`, `app/components/hero-ledger.tsx`,
  `app/components/stamp-badge.tsx`** — compliant as-is. Landing copy
  states plainly "It won't tell you whether to sign, or what a court
  would decide." The hero ledger's sample confirmation cards use
  "Proposed edit" framing and a fabricated demo excerpt clearly labeled
  "Sample contract excerpt" / "not a real filing," not real output.
  `stamp-badge.tsx` is presentational only (SVG stamp/perforation
  helpers), no copy to audit.
- **`app/(app)/home/*.tsx`** (page, document-intake-card,
  library-register-card, red-lines-register-card) — compliant as-is.
  Upload/empty-state copy is operational ("Choose a PDF or .txt file
  first," "You haven't analyzed any documents yet") with no legal-verdict
  or guarantee language.
- **`app/login/page.tsx`** — compliant as-is. Auth-only copy ("Review a
  contract before you sign it," sign-in/sign-up flows); no analysis
  output surfaces here.
- **`app/(app)/red-lines/*.tsx`** (page, add-red-line-form, red-line-item,
  actions.ts) — compliant as-is. Describes red lines as the user's own
  terms ("Terms you personally won't accept"); no claims about
  enforceability or legal effect.
- **`app/(app)/library/page.tsx`** — compliant as-is. Status copy
  ("Clear," "N Dangerous," "N Unusual," "Not yet analyzed") mirrors the
  qualitative severity tiers from CONTEXT.md and makes no safety
  determination.
- **Server actions** (`app/(app)/documents/actions.ts`,
  `app/(app)/documents/[id]/analyze-action.ts`,
  `app/(app)/documents/[id]/answer-question-action.ts`,
  `app/(app)/red-lines/actions.ts`) — compliant as-is. All error/empty
  states are operational ("Couldn't complete the analysis. Try again."),
  no positioning language to audit.
- **Jurisdiction check** — a repo-wide grep for jurisdiction/state-law/
  enforceability/guarantee/"you should sign" language across `app/` and
  `lib/` (excluding the category definitions and deny-list files already
  covered above) turned up no matches beyond the intended ones (the
  disclaimer footer's own negation, the deny-list's own word list, and
  "personal guarantee" used only as a clause-category name). No
  jurisdiction-specific claims exist anywhere in the app.

**Overall verdict:** the product-wide positioning bar set by ADR 0010 is
met. Every surface that shows Redline's output — summary, flags,
counter-offers, Q&A, Clear result, landing page, and footer — already
frames Redline as explaining document text and patterns, never as legal
advice, an enforceability determination, or a signing recommendation, and
this was true before this ticket ran. This audit found no violations and
made no copy changes.
