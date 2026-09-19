# Build report

This report is updated as work lands, not written retroactively at the end.
Read the "Tickets" table first for current status; decisions and gaps are
below it.

## How to resume this build

Run `/mattpocock-skills:implement` again (or just tell the agent to keep
going per this file). Each ticket's Status line in
`.scratch/first-version/issues/*.md` is the source of truth for what's
done.

## Tickets

| # | Ticket | Status |
|---|--------|--------|
| — | Fixtures (`tests/fixtures/`) | in progress |
| 01 | Auth and app shell | in progress |
| 02 | Upload and text extraction | not started |
| 03 | Red-lines CRUD | not started |
| 04 | analyzeDocument seam + Clear baseline | not started |
| 05 | Personal guarantee detection | not started |
| 06 | Indemnification detection | not started |
| 07 | Auto-renewal detection | not started |
| 08 | Unilateral termination detection | not started |
| 09 | Generic detection (arbitration, liability cap) | not started |
| 10 | Q&A box | not started |
| 11 | Document library | not started |
| 12 | Positioning copy audit | not started |

## Decisions made in the operator's absence

### Environment file naming (fixed, not a product decision)
Found `env.local` (no leading dot) at repo root containing
`OPENROUTER_API_KEY` and `OPENROUTER_MODEL`. Next.js only auto-loads
dotenv files with a leading dot (`.env.local`), so this file was never
actually being read by the app. Copied it to `.env.local` (already
gitignored via the `*.local` pattern, confirmed with `git check-ignore`)
without deleting the original, in case it's referenced elsewhere. No
Supabase env vars exist yet, consistent with "no Supabase project exists
yet."

### Test runner: Vitest
No test infra existed. Added `vitest` + `@vitejs/plugin-react` + `jsdom`
(node environment used by default; jsdom available if a future ticket
needs component-level rendering). `@types/node` was bumped from `^20` to
`^24` because the installed vitest's peer dependency requires
`@types/node >= 22`, and the actual Node runtime here is v24 — the bump
makes the types match the real runtime, not just satisfies the peer
dependency. `npm run typecheck` (`tsc --noEmit`) and `npm test`
(`vitest run`) were added as scripts.

### Smoke script runner: tsx
Added `tsx` as a devDependency to run `scripts/smoke.ts` (a TypeScript
file) directly via `npm run smoke`, per the "finished means" checklist.
The script itself is written once the analysis pipeline (ticket 04+)
exists.

### File-parsing dependency scope
Client-side extraction will support PDF (via `pdfjs-dist`) and plain
`.txt` (native `FileReader`, no dependency) to satisfy "PDF and at least
one other common format" with minimal dependency surface. `.docx` support
was considered and deliberately deferred — not in ticket 02's acceptance
criteria, and CLAUDE.md asks to keep dependencies to what's needed.

### Supabase client library
`@supabase/supabase-js` + `@supabase/ssr` (the current, non-deprecated
pattern for Next.js App Router cookie-based sessions) will be added in
ticket 01, since auth is that ticket's job.

### analyzeDocument / answerFromDocument architecture (binding on tickets 04-11)
Full contract written in each ticket's brief before dispatch; summarized
here so it doesn't have to be re-derived by reading every brief:

- `ModelClient` interface (`lib/model/client.ts`): `completeJSON<T>({system,
  user, schemaName}): Promise<T>`. Production implementation calls
  OpenRouter's `/chat/completions` with `provider: {order: ["fireworks"],
  allow_fallbacks: false, require_parameters: true}`, `reasoning: {effort:
  "low"}`, and JSON response formatting. Model id is read from
  `process.env.OPENROUTER_MODEL` at call time, never hardcoded. Both
  `analyzeDocument` and `answerFromDocument` accept an optional injected
  `ModelClient`, defaulting to the real one, so tests can inject a stub.
- The model returns *candidate* flags (category, citation, category-specific
  attributes, draft counter-offer, explanation). Severity for the four
  fixed-mapping categories (personal-guarantee, indemnification,
  unilateral-termination → always Dangerous; arbitration/liability-cap →
  always Unusual) is computed in **code**, not trusted from the model —
  auto-renewal's Dangerous-escalation test (price escalation without clear
  notice, or an unreasonably short cancellation window) is also a **code**
  rule over model-supplied structured attributes, not a model judgment call.
  User-authored red lines are the one category where the model's own
  Dangerous/Unusual judgment is trusted (no fixed taxonomy is possible for
  arbitrary text), constrained to the two allowed enum values.
- Two hard gates run in code after the model responds, on every candidate,
  every time: (1) citation-integrity — the citation must be an exact
  substring of `documentText` or the candidate is dropped; (2) counter-offer
  banned-word gate — if the counter-offer contains a deny-listed
  guarantee/certainty word, the candidate is dropped rather than shown
  edited or degraded (same "drop, don't soften" spirit as ADR 0001/0007).
- Test stubs build their `ModelClient` responses directly from
  `tests/fixtures/*.sidecar.json`, so the citation/severity/gate tests run
  deterministically with no API key and without re-testing whether the real
  model can find a clause — that question is answered separately by
  `npm run smoke` against the real model when a key is present.

### Testing scope: no browser E2E framework added
Tickets 05-11 each list an "end-to-end: shows in the UI" criterion.
Playwright/Cypress were not added — too heavy for this pass and not asked
for. "End-to-end" is verified instead by: (a) vitest tests against the
seams directly, (b) `npm run smoke` running real fixtures through the real
pipeline (stub or live model) and printing flags with source sentences, and
(c) the orchestrator manually checking rendered HTML via `curl` against a
running `next dev`/`next build` server for the primary flows. This is a
scope decision, not an oversight — flag if a real browser check is wanted
later.

## What couldn't be verified

(filled in as the build proceeds — Supabase-dependent behavior can't be
verified against a real database since no project exists yet; the live
OpenRouter smoke run only happens if `OPENROUTER_API_KEY` is set when this
report is finalized.)

## Commands to run first

(filled in at the end.)
