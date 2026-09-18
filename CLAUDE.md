# CLAUDE.md

Redline: upload a contract/lease/freelance agreement/ToS, get back a
plain-English summary, severity-ranked risk flags, and a counter-offer per
flag.

## Stack — settled, not open for reinterpretation

- Next.js, Supabase (auth + database), deployed on Vercel.
- Uploaded files are parsed in the browser. Only the extracted text is
  stored — never the original file.
- All model calls go through OpenRouter. Never call a model provider
  directly.

## Non-negotiable: citations

- Every risk flag must cite the exact source sentence it came from. A flag
  whose source sentence cannot be shown is a bug, not a missing feature.
- State only what the document's text supports. Where the text doesn't
  support a claim, don't make the claim.

## Scope — build this, then stop

- Plain-English summary
- Risk flags ranked by severity, each with its source sentence
- A drafted counter-offer per flagged clause
- A Q&A box that answers only from the uploaded document
- An editable list of the user's own red lines, which drives the analysis
- A saved library of past documents

## Out of scope on purpose

- Payments/billing, OCR, and cross-user document sharing are excluded on
  purpose, not deferred by oversight.
- OCR specifically undermines the product: a citation pointing at misread
  text is worse than no citation, and this version exists to prove citations
  can be trusted.
- If something looks like the obvious next step and isn't in the scope list
  above, ask before building it.

## Standing rules

- Secrets live in `.env.local` (gitignored). Never commit a key — it's
  public the moment it's pushed and has to be rotated.
- Ask before adding a dependency.
- Every piece of copy a user reads — landing page, UI labels, error
  messages, empty states — must go through the `humanizer` skill before it
  gets committed. Text that reads like a model wrote it is a defect, not a
  taste call.

## Where to look

- `research/summary.md` — user research findings; read before deciding what
  the product should do.
- `PRD.md` (once it exists) — the brief; read before building anything.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/`. See
`docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`). See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root. See
`docs/agents/domain.md`.
