# Build report

Autonomous build of Redline's first version, run end-to-end via
`/mattpocock-skills:implement` with no operator present. Every ticket is
done. This report is the operator's entry point back into the work.

## Status: all 12 tickets done

| # | Ticket | Status |
|---|--------|--------|
| — | Fixtures (`tests/fixtures/`) | done |
| 01 | Auth and app shell | done |
| 02 | Upload and text extraction | done |
| 03 | Red-lines CRUD | done |
| 04 | analyzeDocument seam + Clear baseline | done |
| 05 | Personal guarantee detection | done |
| 06 | Indemnification detection | done |
| 07 | Auto-renewal detection | done |
| 08 | Unilateral termination detection | done |
| 09 | Generic detection (arbitration, liability cap) | done |
| 10 | Q&A box | done |
| 11 | Document library | done |
| 12 | Positioning copy audit | done — confirmed compliant, no copy changes needed |

Each ticket's own Status line and `## Comments` section in
`.scratch/first-version/issues/*.md` has the implementing subagent's
own account of what it built; this report is the orchestrator's
synthesis and verification, not a restatement of those.

## Finished-means checklist (per the build instructions)

- `npm run build` — passes.
- `npm test` — passes, 48 tests across 9 files.
- `npm run smoke` — exists, runs both shared fixtures through the real
  `analyzeDocument`/`answerFromDocument` pipeline end to end and prints
  every flag with its source citation. Falls back to a stub model client
  built from the fixtures' own sidecar ground truth when no API key is
  configured (verified: all 6 planted clauses surface correctly in stub
  mode). `OPENROUTER_API_KEY` **was** set in this environment's
  `.env.local` this session — see "Live smoke run" below for what came
  back from the real model.
- `npm run typecheck` — passes (this required one infra fix: `tsc`
  depends on Next's generated route types, which don't exist on a clean
  checkout until something generates them; `npm run typecheck` now runs
  `next typegen` first so it works standalone, not just after a build).
- `npm run lint` — one pre-existing error in `app/components/hero-ledger.tsx`
  (a `setState`-in-effect React Compiler warning), present since commit
  `c78dd0f`, before this build session started. No ticket in this build
  touched that file; left as-is, out of scope for this pass. Every other
  file this build touched lints clean.

## Live smoke run against the real model

Ran with `OPENROUTER_API_KEY`/`OPENROUTER_MODEL` (`z-ai/glm-5.3-flash`)
present, via `npm run smoke`:

- **`adhesion-contract.txt`** (6 planted clauses: personal-guarantee,
  indemnification, auto-renewal, unilateral-termination,
  arbitration-class-action-waiver, liability-cap-fee-escalator — the
  first four Dangerous, the last two Unusual): **5 of 6 survived** —
  indemnification, auto-renewal, unilateral-termination,
  arbitration-class-action-waiver, and liability-cap-fee-escalator all
  came back with the correct severity and an exact, verifiable source
  citation. **Personal-guarantee was not flagged this run**, even though
  the model's own summary explicitly described the personal-guarantee
  language ("the individual signing on behalf of the business personally
  and unconditionally guarantees all of the business's obligations") —
  it recognized the clause in prose but didn't produce a structured
  candidate for it, so nothing reached the citation/deny-list gates to
  fail. This is not a pipeline bug (the gates did their job on the
  candidates that were produced; there's no code path that could have
  silently dropped this one without dropping its citation too, and no
  such citation ever appeared) — it's a single real-model miss on one
  run, consistent with precision-over-recall (ADR 0007) sometimes costing
  a real catch. Worth a second live run before launch to see if it's
  consistent or a one-off; not something this build session should tune
  the prompt against based on a single sample.
- **`clean-contract.txt`** (0 planted clauses, designed to be genuinely
  unremarkable): the model returned **1 Unusual flag** — its own
  same-price, 60-day-notice, 75-day-reminder auto-renewal clause,
  reasoned as "you still need to calendar the deadline." This is a
  legitimate borderline call, not a pipeline defect (citation is exact,
  severity is Unusual not Dangerous, no banned words) — but it's worth
  flagging against the PRD's "zero false positives on a curated clean
  contract set" bar. Whether an ordinary, fairly-noticed auto-renewal
  clause should ever be Unusual is a real product judgment call the
  operator should look at with fresh eyes; this build did not alter the
  auto-renewal prompt to chase a single sample's zero-flag outcome.
- Q&A sample question ("What does this document say about ending the
  agreement?") came back grounded, with a real supporting quote, on both
  fixtures.

Full transcript of this run is in the session log; re-run `npm run smoke`
any time to reproduce (it always runs against the real model when the
env vars are set, so each run consumes real API usage).

## Decisions made in the operator's absence

### Environment file naming (a fix, not a product decision)
Found `env.local` (no leading dot) at repo root, containing
`OPENROUTER_API_KEY`/`OPENROUTER_MODEL`. Next.js only auto-loads dotenv
files with a leading dot, so this file was never actually being read.
Copied it to `.env.local` (confirmed still gitignored via the `*.local`
wildcard pattern) without deleting the original. No Supabase env vars
exist yet, consistent with "no Supabase project exists yet."

### Test runner: Vitest
No test infra existed at all. Added `vitest` + `@vitejs/plugin-react` +
`jsdom` (node environment by default; jsdom available for any future
component-rendering test). `@types/node` was bumped `^20` → `^24`
because vitest's peer dependency requires `>=22`, and the real Node
runtime here is v24 — the bump matches reality, it doesn't just silence
a peer-dependency warning.

### Smoke script runner: tsx
Added as a devDependency so `scripts/smoke.ts` runs directly via
`npm run smoke` with no separate build step.

### File-parsing dependency scope (ticket 02)
Client-side extraction supports PDF (`pdfjs-dist`) and plain `.txt`
(native `FileReader`, no dependency) — satisfies "PDF and at least one
other common format" with minimal dependency surface. `.docx` was
considered and deliberately deferred: not in the ticket's acceptance
criteria, and CLAUDE.md asks to keep dependencies to what's needed.

### Supabase client library
`@supabase/supabase-js` + `@supabase/ssr` — the current, non-deprecated
pattern for Next.js App Router cookie-based sessions.

### Next.js 16 renamed `middleware.ts` to `proxy.ts` (ticket 01)
Confirmed in `node_modules/next/dist/docs/`. Same behavior, new
filename; used `proxy.ts` as the current convention. Documented in that
file's own header comment.

### `npm run typecheck` needed `next typegen` first
`tsc --noEmit` depends on Next's generated route-type helpers
(`.next/types/`), which don't exist on a fresh checkout until something
generates them — previously this "worked" only because a stale `.next/`
happened to be lying around from an earlier `next dev`/`next build`.
Fixed so a clean checkout's first `npm run typecheck` just works, since
subagents in this build ran it without necessarily building first.

### `analyzeDocument` / `answerFromDocument` architecture (binding across tickets 04-11)
The core contract, for reference:
- `ModelClient` (`lib/model/client.ts`): `completeJSON<T>({system, user,
  schemaName}): Promise<T>`. Production implementation calls OpenRouter's
  `/chat/completions` with `provider: {order: ["fireworks"],
  allow_fallbacks: false, require_parameters: true}`, `reasoning:
  {effort: "low"}`, `response_format: {type: "json_object"}`. Model id
  read from `process.env.OPENROUTER_MODEL` at call time, never
  hardcoded. Both seams take an optional injected `ModelClient`,
  defaulting to the real one.
- The model returns *candidate* flags; severity for personal-guarantee,
  indemnification, and unilateral-termination is a fixed "always
  Dangerous" rule in **code** (`lib/analysis/categories/definitions/`);
  arbitration/liability-cap is a fixed "always Unusual" rule in code;
  auto-renewal is the one real conditional rule in code (Dangerous when
  price escalates without clear notice, or the cancellation window is
  under 14 days — the 14-day threshold is this build's own specified
  default, not independently sourced). User-authored red lines are the
  one category where the model's own Dangerous/Unusual judgment is
  trusted, since no fixed taxonomy is possible for arbitrary text.
- Two hard gates run on every candidate, every time, in
  `lib/analysis/analyze-document.ts`: citation-integrity (must be an
  exact substring of the document text or it's dropped) and a
  counter-offer banned-word gate (deny-listed guarantee/certainty words
  drop the candidate rather than being edited out). `answerFromDocument`
  has its own mirror of this same principle: a `grounded: true` claim is
  never trusted outright — it's downgraded to an explicit decline unless
  its supporting quote verifies as a real substring of the document.
- `analyzeDocument` takes an optional 4th parameter, an injectable
  category registry, added specifically so tickets 05-09 could each be
  built and tested as **true parallel subagents** — each created only
  its own new category-definition file and test file, tested end-to-end
  through the real pipeline with a locally-scoped registry, and never
  touched the shared `lib/analysis/categories/registry.ts`. The
  orchestrator wired all six into the real, live registry in one pass
  afterward. This is the main structural decision that made this build
  faster than doing all six sequentially.
- Test stubs build `ModelClient` responses directly from
  `tests/fixtures/*.sidecar.json` or hand-built payloads — this is the
  one sanctioned exception to "don't mock the thing you're testing" in
  this build: the thing under test is the gating/severity logic that
  runs for real on top of the stub, not the model call itself.

### Testing scope: no browser E2E framework added
Tickets 05-11 each list an "end-to-end: shows in the UI" acceptance
criterion. Playwright/Cypress were not added — too heavy for this pass,
not asked for. Satisfied instead by: vitest tests against both seams
directly, `npm run smoke` running real fixtures through the real
pipeline, and the orchestrator manually curling a running `next dev`
server for the primary auth/routing flows. A scope decision, not an
oversight — worth adding real browser E2E before this ships, especially
for the upload-parse-analyze-display flow which no automated test
exercises visually.

### Parallel-build file ownership (how six people didn't step on each other)
Several tickets ran as literal parallel subagents against the same
working directory (no git worktrees — a deliberate simplification for
this session). To make that safe: `app/(app)/home/page.tsx`'s three
cards were pre-split into their own component files before dispatching
02/03 in parallel; migration files were pre-assigned numbers
(`0001_documents.sql`, `0002_red_lines.sql`) before dispatching 02/03;
the category registry was made injectable before dispatching 05-09 in
parallel, so none of the five needed to touch the same file to prove
their own category worked. Every parallel dispatch was verified by a
clean combined `git status` (no unexpected overlapping files) before
being trusted.

## What couldn't be verified

No live Supabase project or OpenRouter key existed as durable
infrastructure for this build (the `.env.local` key was used for one
live smoke run, see above, but there's no CI/persistent environment
behind it). Specifically unverified, across every ticket that touches
Supabase:

- **Real sign-up / log-in** (ticket 01) — Supabase client wiring follows
  `@supabase/ssr`'s documented pattern exactly, but was never exercised
  against a real project. Session persistence across reloads is
  implemented per that library's own cookie-refresh mechanism, not a
  custom implementation, so it should work — but "should" is doing real
  work in that sentence.
- **Real document upload → extraction → persistence** (ticket 02) — the
  `documents` table insert, RLS scoping, and the `/documents/[id]`
  owner-scoped read were typechecked and manually reasoned through
  against the migration SQL, never run against Postgres.
- **Real red-lines CRUD** (ticket 03) — same caveat: Server Actions and
  RLS policies were never exercised against a live `red_lines` table.
- **Real analysis persistence** (ticket 11) — the `UPDATE
  documents.analysis_result` after a successful analysis run was never
  exercised against a live row; the query shape matches the
  already-established pattern from tickets 02/03's own inserts/updates.
- **Real library list / RLS cross-user isolation** — the `no cross-user
  access` acceptance criterion for tickets 02/03/11 rests entirely on
  the RLS policies in the migration SQL files being correct, which is
  standard `auth.uid() = user_id` scoping but has never been tested
  against actual concurrent users.
- **The production `ModelClient`'s exact request/response handling under
  real failure modes** (rate limits, partial JSON, non-`fireworks`
  routing when `require_parameters: true` can't be satisfied) — only the
  happy path was exercised live, in the smoke runs above. Error-path
  behavior (a `ModelClientError`/`AnalysisError`/`QAError` surfacing a
  clear message rather than a stack trace) was verified with a stub that
  simulates failure, not a real failed OpenRouter call.
- **Browser-driven UI verification** — every route's HTML was checked
  with `curl` against a running server (status codes, redirect behavior,
  presence of expected text), and the full pipeline was checked via the
  smoke script's console output, but no screenshot or real-browser
  interaction (clicking through upload → analyze → see flags, typing
  into the Q&A box) happened this session.

## Commands to run first

1. Create a Supabase project, then set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. Run the two migrations against it, in order:
   `supabase/migrations/0001_documents.sql`, then
   `supabase/migrations/0002_red_lines.sql` (via the Supabase CLI, the
   dashboard's SQL editor, or `supabase db push` — whichever this
   project's workflow already uses).
3. `npm install`
4. `npm run typecheck && npm test && npm run build` — confirm all three
   still pass in your environment before doing anything else.
5. `npm run smoke` — confirms the real OpenRouter key still works and
   shows current model output on both fixtures; compare against the
   "Live smoke run" section above to see if the personal-guarantee miss
   or the clean-contract false-positive reproduce.
6. `npm run dev`, sign up for a real account, and manually walk the
   actual flow once end-to-end (upload a document, run analysis, ask a
   question, add a red line, revisit it in the library) — this build
   verified the pipeline and the routes, not a human clicking through a
   real browser session against a real database.
7. Decide on the two open product judgment calls flagged above: whether
   the clean-contract auto-renewal flag is correct product behavior or
   over-flagging, and whether the personal-guarantee miss on the
   adhesion contract was a one-off (re-run the smoke script a few times
   to get a feel for consistency before concluding anything from a
   single sample).
