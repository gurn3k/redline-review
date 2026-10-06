---
version: 2
slug: "landing-page"
primary_target: "landing-page"
related_targets: ["sample-analysis", "app-shell"]
---

<!-- Version 2, 2026-10-06: rewritten for the design revamp. Version 1 (The Wire Confirmation) is in git history. -->

## Scope

Persuade. Public, unauthenticated landing page at `/`.

## Audience, job, action, proof, constraints

- **Audience, in order:** (1) a hiring manager or recruiter arriving from GitHub or LinkedIn, deciding in under a minute whether the builder is worth a conversation; (2) a small business owner about to sign paper they didn't write.
- **Job:** in one screen, show that Redline is a real working product for small business owners, built on one checkable rule, by a named person.
- **Actions, in priority order:**
  1. **See a sample analysis** (to `/sample`, no account). Primary for hiring managers.
  2. **Try it on your contract** (to sign-up, or `/home` when signed in). Primary for owners.
  3. **How it was built** (to the GitHub repo). Quiet, in the byline.
- **Proof:** a real flag tied visibly to its real sentence, rendered from the same sample fixture `/sample` uses, so the landing page can never drift from the product's real output. Every quote passes the exact-substring check (`tests/hero-ledger.test.ts` or its successor).
- **Must say out loud:** who it's for ("small business owners"), the kinds of paper (vendor and service agreements, equipment contracts, commercial leases), and the rule ("if Redline can't point to the sentence, it doesn't show the flag").
- **Byline:** "Built by Gurnek Khaira with AI coding agents · Source on GitHub", matching the AI PM Job Radar's convention.
- **Constraints:** no verdict on whether to sign; no legal-advice framing; no claim of handling scans or photos; no invented customers, testimonials, logos, prices or usage numbers. Disclaimer footer applies.

## Sections, top to bottom

1. **Hero:** headline naming the reader and the outcome; one line on the rule; the two actions; the byline.
2. **Proof panel:** a short excerpt of the sample contract beside one or two of its real flags, with the cited sentence highlighted in the excerpt. Not five cards.
3. **What gets checked:** the six clause types, one line each, in plain business language.
4. **What Redline won't do:** the three honest limits.
5. **Closing action:** see the sample, or try it.

## Direction contract

Pending the 2026-10-06 direction round. Must satisfy PRODUCT.md "Design goals."

## Memorable moment

Hovering or tapping a flag lights up the exact sentence it came from in the contract beside it.

## Unresolved decisions

Visual direction (one of three, chosen by the owner).
