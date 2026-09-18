# 01: Auth and app shell

**What to build:** A small business owner can visit Redline, sign up / log in
via Supabase auth, and land on an authenticated home screen. Every screen
carries footer copy positioning Redline as document literacy, not legal
advice (ADR 0010) — this ticket seeds that copy in the shell so later tickets
inherit it rather than each having to add it from scratch.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] User can sign up and log in via Supabase auth.
- [ ] Unauthenticated visitors are redirected to login; authenticated users
      land on a home screen.
- [ ] A session persists across reloads (Supabase session handling wired
      correctly).
- [ ] Every page (including this bare shell) renders a footer stating
      Redline explains document text and patterns, not legal advice or
      enforceability — this copy is reused, not re-authored, by later
      tickets.
- [ ] No document, red-line, or analysis functionality yet — this ticket is
      the shell only.
