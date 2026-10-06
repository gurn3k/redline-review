---
version: 2
slug: "app-shell"
primary_target: "app-shell"
related_targets: ["landing-page", "sample-analysis"]
---

<!-- Version 2, 2026-10-06: rewritten for the design revamp. Version 1 is in git history. -->

## Scope

Operate, behind sign-in: home (upload), the analysis view for one document, library, red lines, login. The analysis view is also rendered read-only by `sample-analysis`.

## Audience, task, states, constraints

- **Audience:** the signed-in small business owner doing the work. Hiring managers see the analysis view through `/sample` and through screen shares, so it has to read well to a stranger too.
- **Tasks:** upload a contract; read its overview, flags, counter-offers or Clear result; check any flag against its sentence; ask questions answered only from the document; maintain red lines; reopen past documents.
- **States that must be designed, not left default:** extraction failure, text too short, analysis in progress, analysis failed, zero-flag Clear (never silence), Q&A refusal ("not in the document"), empty library, empty red lines, disabled actions.
- **Constraints:** scanability and task completion outrank expression. Same no-legal-advice and no-guarantee language rules as the landing page. Disclaimer footer on every screen from one shared component.

## Screen requirements

- **Navigation:** a persistent header with Home (upload), Library and Red lines, plus Log out. "← Back to home" must not be the only way around.
- **Analysis view:**
  1. Overview first: document name, upload date in words ("2 October 2026"), severity counts ("4 Dangerous · 1 Unusual"), and the summary in short sentences rather than one paragraph.
  2. Flags and document side by side on desktop: flag list on one side, the document on the other, with each cited sentence highlighted. Selecting a flag scrolls to and marks its sentence; selecting a highlight selects its flag. On phones, flags first, each with a "Show in document" control.
  3. Each flag: severity, clause type, the quoted sentence, what it means for the business, and the counter-offer. The counter-offer is visually distinct and easy to copy.
  4. Questions sit where they don't leave half the screen empty: below the flags, or at the foot of the document column.
- **Library:** full-width table with document, date in words, severity counts, and analyzed or not; newest first.
- **Home:** the upload area sized to its content, with red lines and library as compact links or a side panel, not two large empty cards.

## Direction contract

"Counsel Memo" (DESIGN.md), shared with `landing-page`, in its restrained, task-first form.

## Memorable moment

Selecting a Dangerous flag and watching the contract scroll to the exact sentence, highlighted.

## Unresolved decisions

- Whether the document column shows the whole text or collapses unflagged sections. Built with the whole text, since hiding text weakens "check it yourself."
