---
version: 1
slug: "app-shell"
primary_target: "app-shell"
related_targets: ["landing-page"]
---

## Scope

Operate, behind sign-in. Not built today — brief only, per explicit instruction. The frame that holds: paste/upload a document, the result (summary, ranked flags, Clear verdict), the question box, the reader's red lines, and the library.

## Audience, task, states, constraints

- **Audience:** the same User as the landing page, now signed in and doing the work rather than being persuaded.
- **Task:** upload or paste a document; read its summary, ranked flags (each with citation and counter-offer), or Clear result; ask follow-up questions grounded only in the document; maintain a personal red-lines list; revisit past analyses in the library.
- **Important states:** extraction failure / no-text-layer error; zero-flag Clear state (must never read as silence); Q&A refusal state (declines rather than guesses); empty library / empty red-lines states.
- **Constraints:** scanability and task completion outrank expression — Operate mode. Same uninventable-claims constraint as the landing page (no verdict on signing, no legal advice). Footer disclaimer present on every screen, reused from the app shell's shell layer, not re-authored per screen.

## Direction contract

THESIS: The same verified-confirmation mechanism the landing page demonstrated now IS the working tool — flags render as the literal confirmation slips the visitor saw, not a redesigned dashboard.

OWN-WORLD: The Wire Confirmation, inherited unchanged from `landing-page`: ledger cream `#f2ede1` ground; confirmation green `#1f5c3f` (Clear), stamp red `#9b1c1c` (Dangerous, reserved), amber-brown `#8a5a2b` (Unusual), charcoal `#242220` (body); tabular monospace for citations/labels, plain grotesk for prose; perforated tear-lines and ledger rules as structural dividers, not decoration. Operate mode restrains the expression: no full-bleed drama, brand lives in the precision of the stamp, tear-line, and tag details.

STORY: The User uploads or pastes a document and watches it become a filed ledger of confirmations they can act on — flag, verify, question, or file away — never a black box.

FIRST VIEWPORT: The authenticated home is a document intake surface (paste or upload) foregrounded, with the User's red-lines ledger and library reachable as clearly labeled adjacent registers rather than a buried settings menu. A document's analysis view keeps the landing page's source-tape / confirmation-slip pairing as the actual reading interface, with the Q&A box docked beside the tape as one more line a User can add to.

FORM: The Wire Confirmation, inherited from `landing-page`'s direction round (seed key `970d5bb0`, candidate 7, assigned by the roll) — no independent direction round for this surface, per instruction that one round covers both.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. (Applies once this surface is actually built — not today.)

## Memorable moment

Opening a past analyzed document in the library and seeing its confirmations exactly as they were stamped at analysis time — nothing decays, nothing silently re-runs.

## Unresolved decisions

Screen-by-screen layout (upload flow, Q&A box placement, red-lines CRUD interface, library list view) is not resolved by this brief — deferred to a future `shape` or build round, which resumes here rather than re-deciding the visual world.
