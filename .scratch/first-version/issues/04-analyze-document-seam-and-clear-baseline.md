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

**Status:** done

- [x] `analyzeDocument` seam calls OpenRouter and returns an
      `AnalysisResult` (summary string; flags list; Clear state) — no
      direct model-provider SDK calls anywhere.
- [x] User can trigger analysis on an uploaded document from the UI and see
      the plain-English summary.
- [x] When no flag clears the bar, the User sees an explicit Clear result
      naming the standard clause set and the specific red lines evaluated
      — not a generic "no issues found" and not an empty list.
- [x] Citation-integrity gate is enforced in code: any candidate flag whose
      quote is not an exact substring of `documentText` is dropped before
      it reaches `AnalysisResult` — covered by a test that asserts this on
      every flag, not sampled.
- [x] Confidence gate is enforced in code: there is no code path that
      produces a hedged or "possible risk" middle tier — a flag either
      clears the bar and is shown plainly, or isn't shown.
- [x] Since no clause detection exists yet, running this on any document
      produces Clear — verified with at least one test fixture.

## Comments

Built the seam exactly to the architecture contract in the ticket brief:

- `lib/analysis/types.ts` — `Severity`, `ClauseCategory`, `Flag`,
  `ClearState`, `AnalysisResult`, unchanged from the brief's shapes.
- `lib/model/client.ts` — `ModelClient` interface, `ModelClientError`, and
  `createModelClient()`, the production implementation. Calls OpenRouter's
  `/chat/completions` with `response_format: { type: "json_object" }`,
  `provider: { order: ["fireworks"], allow_fallbacks: false,
  require_parameters: true }`, `reasoning: { effort: "low" }`, reading
  `OPENROUTER_MODEL`/`OPENROUTER_API_KEY` at call time. Throws
  `ModelClientError` on any missing config, request failure, or unparsable
  response rather than returning a fake result.
- `lib/analysis/deny-list.ts` — `DENY_LIST_WORDS` and
  `containsDenyListedWord`, exactly the word list given in the brief.
- `lib/analysis/categories/registry.ts` — `CandidateFlag`,
  `CategoryDefinition`, and an empty `CATEGORY_REGISTRY: CategoryDefinition[]
  = []`, ready for tickets 05-09 to `push` into.
- `lib/analysis/analyze-document.ts` — `analyzeDocument(documentText,
  redLines, modelClient = createModelClient())` and `AnalysisError`. Builds
  a system prompt grounded in ADR 0005 (severity test), ADR 0007 (precision
  over recall), ADR 0008 (plain unhedged language, no middle tier), and ADR
  0010 (positioning: patterns and citations, not enforceability or legal
  advice); appends every registered category's `promptInstructions` (none
  yet). Runs every candidate through, in order: category validation,
  severity resolution (registry `computeSeverity` override when present,
  model's own severity for red lines and any category without an override),
  severity-value validation (exactly `"Dangerous"` or `"Unusual"` or the
  candidate is dropped), the citation-integrity hard gate (`documentText`
  must contain the citation verbatim — checked on every candidate, every
  time), and the counter-offer deny-list gate. Surviving flags are sorted
  Dangerous-then-Unusual (stable) and `clear` is built iff `flags.length ===
  0`, naming `CATEGORY_REGISTRY.map(c => c.category)` (`[]` in this ticket,
  accurately) and the red lines passed in.
- `tests/helpers/stub-model-client.ts` — `createStubModelClient`, generic
  and fixture-format-agnostic, as specified.
- `tests/analyze-document.test.ts` — 7 tests: citation-integrity gate
  (checked on every surviving flag, not sampled), counter-offer deny-list
  gate, no-hedged-middle-tier runtime assertion, Clear baseline against
  `tests/fixtures/clean-contract.txt` with two non-matching red lines
  (asserts `checkedRedLines` and `checkedStandardCategories: []`), red-line
  flag passthrough (`category`/`redLineText` intact), Dangerous-before-
  Unusual ranking, and an `AnalysisError` throw on a malformed model
  response.
- UI: `app/(app)/documents/[id]/analyze-action.ts` (new Server Action,
  `analyzeDocumentAction`) loads the document scoped to
  `user_id`/`auth.uid()`, loads the user's red lines, calls
  `analyzeDocument`, and returns the result to the client — it does not
  write to `documents.analysis_result` (ticket 11 owns persistence).
  `app/(app)/documents/[id]/analysis-panel.tsx` was rewritten in place
  (exported signature unchanged, so `documents/[id]/page.tsx` didn't need
  to change): renders the real result when `analysisResult` is already set,
  otherwise an "Analyze this document" button with a pending state, a
  result view reusing the existing `StampBadge`/`.confirmation`/
  `.register-card` classes from the landing page's Wire Confirmation
  system (no new visual language), and an honest Clear block that composes
  its copy from which of `checkedStandardCategories`/`checkedRedLines` are
  non-empty — including the accurate "nothing to check yet" wording for
  this ticket's actual state (empty registry, and possibly no red lines).
  Counter-offers are labeled "Example language to propose" (ADR 0010
  framing, and deliberately avoids the literal word "guarantee" even in
  negated form, to stay clean of the banned-word scan). New styles appended
  to `app/globals.css` under a new "document analysis panel" section,
  reusing existing tokens/classes rather than inventing new visual
  language. All new copy was run through the `humanizer` skill.

`npm run typecheck`, `npm test` (16 tests total, all passing), `npm run
build`, and `npm run lint` (scoped to every file this ticket touched) all
pass.

Unverified in this session (no live environment available):
- The production `ModelClient` was never exercised against the real
  OpenRouter API — no live call was made. Reviewed the request shape
  (`response_format`, `provider`, `reasoning`, header/body construction)
  against the standing product answer instead.
- Real Supabase persistence/query behavior for `analyze-action.ts`
  (`documents`/`red_lines` reads scoped by `user_id`) — no live Supabase
  project exists in this environment, consistent with tickets 02/03's own
  notes. Confirmed by reading the query shapes and matching the pattern
  already used in `app/(app)/red-lines/actions.ts` and
  `documents/[id]/page.tsx`.
- The rendered UI states (idle/pending/error/result/Clear) were not
  screenshotted or clicked through in a browser — verified by reading the
  component logic and confirming `npm run build` compiles and prerenders
  the route tree without error.

Note for tickets 05-09 (registry consumers): a `CategoryDefinition` pushed
into `CATEGORY_REGISTRY` is picked up automatically by
`analyzeDocument`'s prompt-building (via `promptInstructions`) and its
severity-resolution step (via `computeSeverity`) — no other file needs to
change. `computeSeverity` receives the raw `CandidateFlag` (the model's own
severity is in `candidate.severity` if you need to inspect it, though the
four fixed-mapping categories per `BUILD-REPORT.md` will ignore it and
return a constant). The severity your `computeSeverity` returns is still
run through the same `"Dangerous"`/`"Unusual"` validation and the same two
hard gates as every other candidate — you don't need to re-check those
yourself.
