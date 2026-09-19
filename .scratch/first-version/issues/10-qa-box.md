# 10: Q&A box (answerFromDocument seam)

**What to build:** A logged-in User can ask a follow-up question about
their uploaded document in a Q&A box. `answerFromDocument(documentText,
question) → Answer` grounds its answer only in the document's own text,
independent of `analyzeDocument`'s output (it does not have access to the
flags). When the answer isn't supported by the document, the box declines
to answer rather than guessing.

**Blocked by:** 02 (Upload and text extraction)

**Status:** done

- [x] User can type a question into a Q&A box on an uploaded document and
      get an answer.
- [x] `answerFromDocument` is a seam independent of `analyzeDocument` — it
      does not read or depend on any `AnalysisResult`/flags.
- [x] For a question whose answer is present in the document, the response
      references content actually in the document text (grounding check,
      testable).
- [x] For a question whose answer is not supported by the document, the
      response explicitly declines rather than fabricating an answer
      (refusal check, testable).
- [x] Model calls route through OpenRouter — no direct provider SDK calls.

## Comments

Implemented `answerFromDocument` (`lib/qa/answer-from-document.ts`,
`lib/qa/types.ts`) as a sibling seam to `analyzeDocument`: same
`ModelClient` injection pattern, a typed `QAError`, and — the part that
matters — a hard grounding gate mirroring ADR 0001's citation-integrity
gate. The model's own `grounded: true` claim is never trusted outright: a
`supportingQuote` that's missing, empty, or not an exact substring of
`documentText` gets the response downgraded to an explicit, honest decline
instead of shown as a verified answer. `grounded: false` from the model
passes through unchanged.

Wired up via a new Server Action (`answer-question-action.ts`, mirroring
`analyze-action.ts`'s auth/ownership-scoped load pattern) and rewrote
`qa-box.tsx`: a question input, a per-session client-side Q&A history list,
grounded answers shown with their verified supporting quote (reusing the
`.confirmation-citation`/`.counter-label` classes from `analysis-panel.tsx`'s
`FlagCard`), and declines styled distinctly by reusing the existing
`.redlines-empty` muted-box treatment plus a "NOT IN THE DOCUMENT" label,
so a user can't mistake "the document doesn't say" for a real answer. The
whole form/history layout reuses existing classes only (`.redline-form`,
`.auth-input`, `.redline-row`, etc.) — no new CSS was added, since
`app/globals.css` is outside this ticket's file ownership. All new copy
passed through `humanizer`.

Tests (`tests/answer-from-document.test.ts`, 5 cases): grounded+valid,
fabricated-quote-gets-downgraded, model's own decline passes through,
and two malformed-response-throws cases (wrong type, missing field).
`npm run typecheck`, `npm test` (48/48 passing), and `npm run build` all
pass. No live OpenRouter call or live Supabase query was exercised in this
session — both remain unverified until run against real credentials.
