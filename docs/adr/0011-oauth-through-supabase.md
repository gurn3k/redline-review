# 11. Add Google and LinkedIn sign-in through Supabase Auth

## Decision

Readers can sign in with Google, LinkedIn, or email and password. Google
and LinkedIn go through Supabase Auth's built-in providers (`google`,
`linkedin_oidc`) using the PKCE flow, with one server route,
`/auth/callback`, that always lands the reader on `/home`.

## Alternatives

- A separate auth library (Auth.js, Clerk): adds a second user store
  next to Supabase, and row-level security keys off `auth.uid()`, so
  every policy would need rework.
- Magic links in place of passwords: fewer passwords to manage, but it
  changes the existing email flow, which wasn't asked for.
- A `next` parameter so the callback returns readers to the page they
  started from: every signed-in reader starts at `/home` anyway, and the
  parameter is the usual source of open-redirect bugs.

## Why

Small business owners already have a Google account, and hiring managers
reviewing the portfolio already have LinkedIn open. One click beats making
up a password to try the product. Supabase links an OAuth identity to an
existing account with the same verified email, so documents and red lines
follow the person whichever way they sign in.

## Consequences

- Google's consent screen names the Supabase project domain
  (`<project>.supabase.co`) until a Supabase custom domain is added.
- The LinkedIn developer app must be tied to a LinkedIn Company Page.
- Provider client secrets live only in the Supabase dashboard, never in
  this repo or in Vercel.
- The Supabase redirect allow-list must list each deployed origin; preview
  deployments can't use OAuth unless their URL pattern is added.
