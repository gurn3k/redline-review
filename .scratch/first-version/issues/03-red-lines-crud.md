# 03: Red-lines list (CRUD)

**What to build:** A logged-in User maintains their own editable list of
red lines — terms they specifically care about, independent of Redline's
standard clause set. This list is scoped to their account and persists
across sessions. It doesn't drive any analysis yet (that's ticket 04) —
this ticket only makes the list itself creatable, editable, and durable.

**Blocked by:** 01 (Auth and app shell)

**Status:** done

- [x] User can add a red line (free text) from an authenticated screen.
- [x] User can edit and delete an existing red line at any time.
- [x] Red lines are persisted to Supabase, scoped to the authenticated user
      (no cross-user access).
- [x] The list is visible and reflects the current state after add/edit/
      delete without a manual refresh.

## Comments

Built `/red-lines` (`app/(app)/red-lines/page.tsx`), a Server Component that
loads the signed-in user's red lines and renders an add form plus an
editable, deletable list. Add/edit/delete run through Server Actions in
`app/(app)/red-lines/actions.ts`, each re-checking auth/ownership
server-side (not just trusting the authenticated route) and calling
`revalidatePath` so the list and the home card reflect the change in the
same round trip, no manual refresh. `red-lines-register-card.tsx` now links
to `/red-lines` and shows a live count of the user's red lines (falls back
to static copy if Supabase isn't configured or the user isn't resolved).
Migration: `supabase/migrations/0002_red_lines.sql`, matching the schema in
the ticket brief exactly (table + RLS policies scoped to `auth.uid()`).

Unverified: real persistence against a live Supabase project — no project
exists yet in this environment, so add/edit/delete/RLS scoping could only
be verified by reading the code and confirming the query shapes, not by
exercising them against a database. Confirmed instead that hitting
`/red-lines` while logged out redirects to `/login` via the existing
proxy + `(app)` layout guard, and that the Supabase-not-configured path
(both in the page and the register card) renders a plain message rather
than throwing.

`npm run typecheck` and `npm run build` both pass for every file this
ticket owns. At the time this ticket finished, `npm run build`'s TypeScript
check fails on `lib/extraction/pdf.ts` (`Property 'destroy' does not exist
on type 'PDFDocumentProxy'`) and `.next/types/validator.ts` flags
`/documents/[id]` — both are ticket 02's in-progress files, not touched by
this ticket; confirmed by re-running `npm run typecheck` earlier in the
session before those files existed, when it passed cleanly.
