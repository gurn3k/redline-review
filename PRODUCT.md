# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, Supabase (auth + database), deployed on Vercel — settled per CLAUDE.md, not open for reinterpretation. Uploaded files are parsed in the browser; only extracted text is stored, never the original file. All model calls go through OpenRouter, never a model provider directly.

## Users

A small business owner deciding whether to sign a contract someone else has presented to them — a vendor or service agreement, a commercial lease, a contract with a personal guarantee attached — before they sign it. Not a document they drafted themselves, and not one they've already signed.

Explicitly not served in this version: freelancers, renters, job seekers reviewing a job offer, anyone reviewing their own outgoing paper, and anyone who has already signed and is dealing with the consequences. Each alternative segment was considered and rejected (see PRD.md, "The calls I made") — this exclusion is a deliberate product decision, not an oversight, and is still current.

## Product Purpose

Redline reviews a contract a user is about to sign and returns: a plain-English summary, severity-ranked risk flags each citing its exact source sentence, a drafted counter-offer per flagged clause, a Q&A box that answers only from the uploaded document, an editable list of the user's own red lines that drives the analysis, and a saved library of past documents. When nothing trips a flag, it returns an explicit Clear result naming what was checked — never silence, never an empty list.

Success means: every citation shown is a real, findable substring of the source document (machine-checkable, hard pass/fail); every flag independently clears the Dangerous/Unusual bar; zero false positives on a curated clean-contract set; no output copy asserts a guarantee ("guarantees," "you are protected," "this is enforceable").

## Positioning

The market already has near-direct competitors (Pact, ContractClarifyAI, ClauseGuard, QwickContractReview) doing clause severity ranking, plain English, and negotiation language for adjacent audiences. Per research, none of them confirm grounding their Q&A strictly in the uploaded document. Redline's differentiation is not "this doesn't exist yet" — it's execution quality on one specific, checkable guarantee: every flag and every Q&A answer is traceable to an exact sentence in the document the user uploaded, verified by machine, not just claimed in marketing copy.

## Operating Context

The user uploads an incoming contract (vendor/service agreement, commercial lease, or similar) at the moment of deciding whether to sign it, typically under time pressure and without a lawyer on hand. They maintain a personal list of "red lines" that drives what gets flagged, and a saved library of past documents they've reviewed. The product output (summary, flags, counter-offers, Q&A) is meant to be read and acted on before signature, not after.

## Capabilities and Constraints

- Every risk flag must cite the exact source sentence it came from; a flag whose source sentence can't be shown is a bug, not a missing feature.
- The Q&A box answers only from the uploaded document — never from outside knowledge.
- Severity is binary and qualitative: Dangerous / Unusual / Clear. No numeric risk score (rejected as false precision); no hedged "possible risk" middle tier (confidence is binary, not a dial).
- Precision is prioritized over recall by deliberate choice: an unclear flag is not shown, even at the cost of missing some real risk.
- Jurisdiction-specific enforceability guidance is explicitly out of scope — a jurisdiction claim isn't grounded in the uploaded document the way every other flag is, so there's no sentence for the user to check it against.
- Out of scope on purpose (not deferred by oversight): payments/billing, OCR, and cross-user document sharing. OCR specifically undermines the product — a citation pointing at misread text is worse than no citation, and this version exists to prove citations can be trusted.
- First-class clause types in v1: personal guarantee, indemnification, auto-renewal/negative-option, unilateral termination/no-cause deactivation. Flagged generically only (no deep detection or drafted counter-offer): arbitration/class-action waivers, liability caps, fee escalators. Explicitly not evaluated in v1: non-compete, IP assignment, data/privacy overreach in ToS (all out of segment).
- If something looks like an obvious next step and isn't in the scope list, ask before building it (per CLAUDE.md).
- Secrets live in `.env.local`, gitignored, never committed. Ask before adding a dependency.

## Brand Commitments

Product name: Redline. Established terminology (see CONTEXT.md):
- **User** — the small business owner reviewing incoming paper. Avoid: Customer, client, subscriber.
- **Incoming paper** — the contract being reviewed. Avoid: Document, contract (use "Incoming paper" when distinguishing from Outgoing paper).
- **Outgoing paper** — paper the user issues to someone else; out of scope for v1.
- **Dangerous** (severity tier) — open-ended financial exposure or existential business-relationship risk, with no realistic leverage to negotiate out. Avoid: High-risk, red flag.
- **Unusual** (severity tier) — deviates from typical market terms but exposure is bounded or standard practice. Avoid: Minor, low-risk, notable.
- **Clear** (result state) — explicit positive result with a stated explanation of what was checked. Avoid: "No issues found," "all clear."

Voice: confident and unhedged in flag language, gated at generation rather than softened in prose — a deliberate choice, accepting that a mistaken severity judgment is more damaging stated plainly than proportionally hedged. Never assert a guarantee, protection, or enforceability.

## Evidence on Hand

Research base: four research-agent reports (`research/agent1–4*.md`) and a synthesis (`research/summary.md`) on who has this pain, what goes wrong, existing tools, and who would pay — sourced from CA State Bar's 2024 Justice Gap Study, FTC enforcement actions, and scattered first-person accounts.

Explicit absences future work must not fabricate:
- No verified first-person "I didn't understand what I signed" account exists from the actual target segment (small business owner, pre-signing). The two verified quotes in the research are a lease co-signer and an employee signing a non-compete — both outside the target segment.
- No real customers, beta testers, testimonials, or case studies exist yet for Redline itself.
- No willingness-to-pay data exists for this specific product shape (plain-English pre-signing AI review); the $153/hr figure and 50%-of-small-businesses-need-this figure are about legal help broadly, not this product.
- No verified real dispute was found for indemnification or personal guarantee clauses despite both being first-class clause types — their inclusion rests on the mechanism being well understood, not a documented case.
- No product-specific accessibility standard has been established.

## Product Principles

1. A citation that can't be shown as an exact substring of the source document is a bug, never a shipped feature — this is the product's core trust mechanism and its main claimed differentiator against existing competitors.
2. Precision over recall: an unclear flag stays unshown, even though this means some real risk goes uncaught.
3. State findings plainly and unhedged, but never claim a guarantee, protection, or enforceability — legal-risk framing is handled through disclaiming and citation, not by softening the product's own confidence.
4. Never render a null result as silence — an explicit Clear, with its checks named, is always shown instead.
5. Ship only what's in the defined scope; treat "obvious next steps" outside it as questions to ask, not features to add.
