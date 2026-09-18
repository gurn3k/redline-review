# 10: Q&A box (answerFromDocument seam)

**What to build:** A logged-in User can ask a follow-up question about
their uploaded document in a Q&A box. `answerFromDocument(documentText,
question) → Answer` grounds its answer only in the document's own text,
independent of `analyzeDocument`'s output (it does not have access to the
flags). When the answer isn't supported by the document, the box declines
to answer rather than guessing.

**Blocked by:** 02 (Upload and text extraction)

**Status:** ready-for-agent

- [ ] User can type a question into a Q&A box on an uploaded document and
      get an answer.
- [ ] `answerFromDocument` is a seam independent of `analyzeDocument` — it
      does not read or depend on any `AnalysisResult`/flags.
- [ ] For a question whose answer is present in the document, the response
      references content actually in the document text (grounding check,
      testable).
- [ ] For a question whose answer is not supported by the document, the
      response explicitly declines rather than fabricating an answer
      (refusal check, testable).
- [ ] Model calls route through OpenRouter — no direct provider SDK calls.
