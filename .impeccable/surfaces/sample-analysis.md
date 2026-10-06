---
version: 1
slug: "sample-analysis"
primary_target: "sample-analysis"
related_targets: ["landing-page", "app-shell"]
---

## Scope

Demonstrate. Public, read-only page at `/sample`, added to scope 2026-10-06 (PRODUCT.md, Capabilities and Constraints). No account, no model call on view.

## Audience, job, action, proof, constraints

- **Audience:** a hiring manager who clicked "See a sample analysis," and an owner who wants to see what they'd get before signing up.
- **Job:** show the real product, the same analysis view a signed-in User sees, on a document a small business owner would recognize: the Coldline Refrigeration equipment service agreement (a restaurant or café's refrigeration contract).
- **Action:** try it on your own contract. Secondary: how it was built (GitHub).
- **Proof:** the analysis is real Redline output, generated once by the current pipeline and stored as a fixture. A plain note says so and gives the generation date and that it was not edited. Every quote passes the exact-substring check, enforced by a test.
- **Constraints:** it reuses the analysis-view components from `app-shell`, never a separate marketing mock, so the sample can't look better than the product. The Q&A box shows one or two stored real question-and-answer pairs and is not live (no model call on a public page). A clear banner marks it as a sample document, not a real company or filing.

## Content

The overview (severity counts and a short summary), each flag tied to its highlighted sentence in the document, the counter-offer for each, the Clear checks that passed, and the stored Q&A examples.

## Direction contract

Inherits the direction chosen for `landing-page` and `app-shell`.

## Memorable moment

Same as the analysis view: selecting a flag scrolls the document to its sentence and highlights it.

## Unresolved decisions

None. The sample was regenerated on current code 2026-10-06 (`scripts/generate-sample.ts`, three paid calls: one analysis, two questions) and includes the personal-guarantee flag.
