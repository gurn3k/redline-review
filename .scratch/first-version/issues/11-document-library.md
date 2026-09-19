# 11: Document library

**What to build:** A logged-in User's analyzed documents are saved to a
personal library: extracted text plus the full `AnalysisResult`, scoped to
their account. The User can see their past documents in one place and open
a past one to view its saved analysis again, without re-uploading or
re-running it.

**Blocked by:** 01 (Auth and app shell), 04 (Core analyzeDocument seam and
Clear baseline)

**Status:** done

- [x] After analysis completes, the document's extracted text and full
      `AnalysisResult` are persisted to Supabase, scoped to the
      authenticated user.
- [x] User sees a list of their previously analyzed documents.
- [x] Opening a past document shows its previously computed summary, flags
      (or Clear result), and counter-offers without re-running analysis.
- [x] No cross-user access: a User can only see their own library entries.

## Comments

- Extracted text was already persisted on upload (ticket 02,
  `documents/actions.ts`); this ticket adds the missing half: persisting
  `analysis_result` once `analyzeDocument` completes
  (`app/(app)/documents/[id]/analyze-action.ts`), scoped to `id` AND
  `user_id` in the `UPDATE`'s `WHERE` clause — never trusting a
  client-supplied id alone. If the save fails, the action still returns the
  analysis result to the client (the user got their answer) and logs the
  failure server-side instead of surfacing a broken response.
- Added `app/(app)/library/page.tsx`: a Server Component listing the
  signed-in user's documents (file name, short date ref, and a quick status
  — "Not yet analyzed" / "Clear" / flag counts by severity), newest first,
  each row linking to `/documents/[id]`. Reuses existing `ledger-list` /
  `ledger-row` / `register-card` / `redlines-*` classes from
  `app/globals.css` rather than adding new ones, since RLS + explicit
  `user_id` scoping plus this being a plain read-through list (no seam)
  meant it didn't need its own file ownership over styles. Empty state
  links back to `/home`.
- Rewrote `app/(app)/home/library-register-card.tsx` to mirror
  `red-lines-register-card.tsx`: links to `/library`, shows a live document
  count when Supabase/auth resolve, falls back to static copy otherwise.
  Exported signature (`LibraryRegisterCard()`) unchanged.
- `analysis-panel.tsx`'s existing "already-saved result" branch needed no
  changes — it already treats a non-null `analysisResult` prop as done deal,
  which is exactly what `documents/[id]/page.tsx` now passes on repeat
  visits once a save has landed.
- Verified (dev server, logged out): `/library` redirects to `/login`, same
  as `/red-lines`. `npm run typecheck`, `npm test` (48 passed), and
  `npm run build` all pass. No live Supabase project exists in this
  environment, so real insert/update/select behavior against Postgres and
  RLS policies is unverified beyond reading the migration and matching the
  already-proven query patterns used elsewhere in this codebase (red lines,
  document detail page).
- No new dependency needed.
