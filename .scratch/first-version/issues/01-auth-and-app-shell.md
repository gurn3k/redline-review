# 01: Auth and app shell

**What to build:** A small business owner can visit Redline, sign up / log in
via Supabase auth, and land on an authenticated home screen. Every screen
carries footer copy positioning Redline as document literacy, not legal
advice (ADR 0010) — this ticket seeds that copy in the shell so later tickets
inherit it rather than each having to add it from scratch.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] User can sign up and log in via Supabase auth.
- [x] Unauthenticated visitors are redirected to login; authenticated users
      land on a home screen.
- [x] A session persists across reloads (Supabase session handling wired
      correctly).
- [x] Every page (including this bare shell) renders a footer stating
      Redline explains document text and patterns, not legal advice or
      enforceability — this copy is reused, not re-authored, by later
      tickets.
- [x] No document, red-line, or analysis functionality yet — this ticket is
      the shell only.

## Comments

Built: browser/server Supabase client factories at `lib/supabase/client.ts`
/ `lib/supabase/server.ts`; session refresh + auth gating at `proxy.ts`
(Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` — same
behavior, see the file's header comment); `/login` (sign up + log in, one
form, mode toggle); authenticated home at `/home` under the `app/(app)/`
route group; shared `<DisclaimerFooter>` wired into the root layout. No live
Supabase project exists, so sign-up/log-in is unverified against a real
database — `npm run typecheck` and `npm run build` both pass. Full detail in
the implementing agent's report to the orchestrator.
