# Redline — Brief

## Who this is for, specifically, and what they do today instead

A small business owner deciding whether to sign a contract someone else has
presented to them — a vendor or service agreement, a commercial lease, a
contract with a personal guarantee attached — before they sign it. Not
after. Not a document they drafted themselves.

Not served in this version, on purpose: freelancers, renters, job seekers
reviewing a job offer, anyone reviewing their own outgoing paper, and
anyone who has already signed and is now dealing with the consequences.
Each of those was considered and rejected — see "The calls I made," below.

**What they do today instead**, per the research: 67% of small business
owners with unmet legal needs skip a lawyer specifically because of cost,
and 85% of those with unmet needs report real financial harm as a result
(CA State Bar 2024 Justice Gap Study). Where they don't skip it entirely, a
lawyer's flat-fee review runs $250–$750 (avg. $520 for a business contract,
$706 for a commercial lease). The cheaper alternatives on the market today
— LegalZoom ($39/mo+), Rocket Lawyer ($35–$65/mo) — are general subscription
services, not built for a single pre-signing document pass. A small number
of AI-native tools (Pact, ContractClarifyAI, ClauseGuard, QwickContractReview)
already occupy the $0–$99 range for something close to this exact pitch.

Plainly stated: **the research has no first-person account of what a small
business owner actually does at the moment of signing.** The two verified
"I didn't understand what I signed" quotes in the research are an
individual co-signing a lease and an employee signing a non-compete —
neither is a business owner. What we know about this segment is
willingness-to-pay and stated need, not a documented moment of harm. That
gap is real and is called out again below.

## The problem

People sign binding documents that expose them to risk they didn't fully
grasp, often under time pressure, often with no real leverage to negotiate
the terms. The clearest verified illustration in the research, even though
it's an employee rather than a business owner:

> "Yes, you'll say I should've asked before signing. I couldn't - had no
> time and had to secure the job." ... "Non-compete (12 months, yeah I
> know), is with the Company: per the contract, that's the parent company."
> — Source: https://www.teamblind.com/post/how-do-i-ask-about-awkward-non-compete-ykerwv4y

The pattern — sign fast, don't fully register scope, find out later —
generalizes to what Redline is built for, even though this specific quote
comes from outside the target segment.

The harm is well quantified where it's been measured, but mostly *after*
signing, not at the moment of comprehension: auto-renewal and negative-option
clauses account for the best-quantified category found (59% of consumers
report deceptive free-trial lock-in, ~$186 avg. loss per incident, and it's
the FTC's current #1 enforcement priority — Amazon, Chegg, Uber all settled
or were sued over it). Arbitration and class-action waiver clauses don't
cause harm by themselves but remove the remedy for every other clause on
this list. Unilateral termination clauses are the strongest case for
existential (not financial) risk: in gig-platform data, nearly half of
deactivated workers were later cleared of the wrongdoing they were
deactivated for.

## What the first version does

1. Plain-English summary of the uploaded document.
2. Risk flags ranked by severity (Dangerous / Unusual), each carrying the
   exact source sentence it's based on.
3. A drafted counter-offer per flagged clause, presented as example
   language the user could propose — not a guaranteed legal fix.
4. A Q&A box that answers only from the uploaded document.
5. An editable list of the user's own red lines, which drives the analysis.
6. A saved library of past documents.
7. An explicit Clear result when nothing trips a flag, stating what was
   checked against — never silence, never an empty list.

Nothing beyond this list. See "What we are not building" for the boundary.

## What good looks like

- **Every citation is real, always.** For any flag shown, the quoted
  sentence must be an exact, findable substring of the extracted document
  text. This is checkable by machine on every single output — not a
  sampling metric, a hard pass/fail bug gate.
- **Every flag independently clears the Dangerous/Unusual test.** For a
  sample of shown flags, ask: does removing this clause change the user's
  real financial exposure ceiling, or their ability to keep this business
  relationship without cause? If the answer to both is no, the flag
  shouldn't have been shown. This is a manual review criterion until
  there's a labeled benchmark set (see below).
- **Zero false positives on a curated "clean" contract set.** Build a small
  set of ordinary, unremarkable vendor/lease contracts with no real
  Dangerous or Unusual clauses. Redline should return Clear on all of them.
  Any flag on this set is a failure, full stop.
- **A labeled "known-bad" benchmark still needs to be built.** The research
  gives no recall number to target (no source states "a good tool catches
  X% of dangerous clauses"), so don't invent one. What's testable now:
  build a small set of contracts with a known personal guarantee, a known
  uncapped indemnification clause, and a known no-cause termination clause
  planted in them, and track whether each gets caught — as a trend to
  improve, not a launch gate with a fabricated target.
- **The Clear explanation names its checks.** "No Dangerous or Unusual
  clauses found against your red lines and the standard checks" is
  testable — a generic "no issues found" is not, and shouldn't ship.
- **No counter-offer or flag asserts a guarantee.** Scan output copy for
  language like "guarantees," "you are protected," "this is enforceable" —
  none of it should appear. This is directly checkable.

## My red lines

- **Personal guarantee clauses — Dangerous.** Turns what the owner assumed
  was an LLC's limited-liability shield into open-ended personal financial
  exposure, with no dollar ceiling. The mechanism is well understood; the
  research found no verified dollar-figure case, so confidence here is
  lower than the severity tier implies — flagged anyway because the
  exposure, if real, is unbounded.
- **Indemnification clauses, especially "any and all claims" language —
  Dangerous.** Same shape as above: uncapped exposure that can outsize the
  business itself. Mechanism-only sourcing in the research — zero named
  disputes found — same caveat as above applies.
- **Auto-renewal / negative-option clauses — Unusual by default, Dangerous
  if the renewal escalates price without clear notice or the cancellation
  window is unreasonably short.** This is the best-quantified harm category
  in the research: 59% of consumers report deceptive lock-in, ~$186 avg.
  loss, and it's the FTC's current #1 enforcement priority (Amazon, Chegg,
  Uber).
- **Unilateral termination / no-cause deactivation clauses — Dangerous via
  the existential-risk path, even with no dollar figure attached.**
  Strongest evidence is specifically in gig-platform contracts (nearly half
  of deactivated workers later cleared of wrongdoing); weaker outside that
  context, but the mechanism — losing a business relationship unilaterally,
  with no recourse — generalizes to a vendor or client relationship.
- **Arbitration / class-action waiver clauses — flagged generically only,
  not first-class in v1.** This is the research's single highest-confidence,
  most cross-cutting finding — it doesn't cost money directly, but it
  removes the remedy for every other clause in the document. It's
  deprioritized for build reasons, not evidence reasons; see "The calls I
  made."
- **Liability caps and fee escalators — flagged generically only if
  detected.** Noted only as side mentions in the research, not independently
  investigated. No deep logic in v1.
- **Explicitly not evaluated in v1:** non-compete clauses (employment
  context, segment excluded), IP assignment clauses (freelance context,
  segment excluded), data/privacy overreach in ToS (consumer/platform
  context, segment excluded).

## How we measure it

`npm run eval` runs a set of documents with known planted clauses through the real analysis,
using the real model, and prints four things. It sits next to the "What good looks like" bar
above and adds numbers to it. It does not replace the hard citation check, which still runs on
every output.

- **Recall.** Of the planted clauses whose type this product flags (the types under "My red
  lines"), how many did a flag find? A flag finds a planted clause when the sentence it quotes
  overlaps the planted sentence. Whether the flag also named the right type is reported next to
  it, not folded into it. Types this product leaves out (non-compete, and a right to rewrite the
  terms, which is not the termination clause we flag) are listed as out of scope and are never
  counted as misses. Recall is also split by whether the planted sentence contains a curly quote
  or apostrophe, a non-breaking space, an fi or fl ligature, an em dash, or two spaces in a row,
  because a model that retypes those characters loses its citation.
- **Precision.** Of the flags that can be judged, how many overlap a planted clause of a type this
  product flags. A flag on a sentence the answer key does not list counts against it, so this
  measures agreement with the key, not whether the flag was wrong.
- **Groundedness.** Of every flag the model returned, how many quote a sentence that appears in the
  document character for character? Flags that fail are dropped before a reader sees them, so
  this measures how often the model hands the product a quote it cannot use.
- **Clean documents.** How many flags come back on the documents that should come back clean, and
  how many of those documents came back Clear.
- **Left-out documents.** If the model call for a document fails, that document is removed from
  every count above and the number removed is printed. A failed call is never a miss.

Every rate is printed as a count over a count and as a percentage, and every run is saved with
every flag in it. Where the planted sentences say what severity the product should give them, the
run also reports how often a found clause carried that severity.

Two document sets feed these numbers. One is an outside set of mostly consumer documents. The
other is twenty business documents (leases, service and software agreements, loans with a
personal guarantee, and five clean contracts) written for the segment this product serves. Only
the second can say anything about personal guarantees and one-sided termination.

**The limit.** A model wrote the gold set, and it wrote the clauses the way a model expects them
to read. The numbers are therefore an upper bound on what the product catches in real contracts,
and they are never a promise to a reader. This section sets no recall target, for the same
reason "What good looks like" sets none. Use the numbers as a trend, and to see which clause
types are weak.

## The calls I made and what I gave up

1. **Segment: small business owners** — chosen against freelancers,
   renters, and job seekers reviewing an offer. **Worse off:** renters (one
   of the only two verified pain quotes in the research is a lease case),
   freelancers (real, quantified nonpayment losses), and job seekers (the
   *other* verified pain quote is exactly this scenario, and it's arguably
   the cleanest pre-signing moment of any segment considered).
2. **Receiver-only, not drafter** — chosen against reviewing paper the user
   issues to someone else. **Worse off:** the same small business owner,
   for roughly half of their real contract exposure — the outgoing half —
   which gets no help at all in this version.
3. **Pre-signing only, not post-signing** — chosen against helping someone
   who already signed. **Worse off:** anyone who's already bound by a bad
   contract and needs to know their exposure or leverage — arguably the
   highest-urgency, highest-willingness-to-pay moment, and exactly where
   the research's best-quantified harms (auto-renewal, arbitration, gig
   deactivation) actually land.
4. **Severity covers existential risk, not just dollar exposure** — chosen
   against a simpler financial-only test. Nobody is excluded by this one;
   the cost is build complexity (two independent checks instead of one),
   paid in exchange for catching a class of clause a dollar-only test
   would miss entirely.
5. **First-class clause types: personal guarantee, indemnification,
   auto-renewal — not arbitration** — chosen against building deep logic
   for the research's single best-evidenced, most cross-cutting finding.
   **Worse off:** any user whose actual danger is an arbitration clause;
   it gets only generic detection and no drafted counter-offer language in
   v1.
6. **Precision over recall** — chosen against flagging liberally.
   **Worse off:** the user with a real dangerous clause that doesn't
   clearly clear the bar — it goes unflagged, and they sign something that
   hurts them, which is the exact harm this product exists to prevent.
7. **Confident, unhedged language, gated at generation not softened in
   prose** — chosen against proportional hedging. **Worse off:** the user
   who receives a flag stated plainly that turns out to be a mistaken
   severity judgment — the plain language makes that specific failure more
   damaging than a hedge would have been.
8. **An explicit Clear result, never silence** — chosen against saying
   nothing when nothing is found. **Worse off:** anyone who over-trusts a
   wrong Clear verdict — a confident "Clear" is read as verified safety in
   a way that silence never would be, so a false Clear does more damage
   than a false silence would have.
9. **Mitigate legal-advice risk through framing and citations, not by
   softening the product** — chosen against hedging the product itself.
   **Left unaddressed, not chosen against:** jurisdiction. The same clause
   is evaluated the same way regardless of state, though real enforceability
   varies by state — a business owner in a more protective state may get a
   flag that overstates their real exposure, and one in a less protective
   state may get a flag that understates it. Deliberately deferred, not
   resolved here.

## What we are not building, and why

- **Outgoing-paper review** — see call #2. Not because it's less
  valuable, but because it's a distinct, additive problem this version
  doesn't take on.
- **Post-signing support** — see call #3.
- **Freelancer, renter, and job-seeker workflows** — see call #1.
- **Deep detection/negotiation logic for arbitration, liability caps,
  non-compete, IP assignment, and data-privacy clauses** — see call #5 and
  "My red lines."
- **Jurisdiction-specific enforceability guidance** — a jurisdiction claim
  ("this is unenforceable in your state") isn't grounded in the uploaded
  document the way every other flag is; there's no sentence for the user to
  check it against. It also personalizes the product's claims in exactly
  the direction the disclaimer/positioning decision (call #9) is trying to
  move away from. Revisit later; not addressed here.
- **A numeric risk score (e.g. a 0–100 scale, as some competitors use)** —
  rejected as false precision. Dangerous / Unusual / Clear stays
  qualitative.
- **Hedged or "possible risk" middle-tier language** — rejected; confidence
  is binary (shown plainly, or not shown), not a dial.
- **Payments/billing, OCR, and cross-user document sharing** — excluded on
  purpose, per existing project scope. OCR specifically undermines the
  product: a citation pointing at misread text is worse than no citation at
  all, and this version exists to prove citations can be trusted.

## What the research could not tell us

- **No first-person account exists from the actual target segment.** Both
  verified "I didn't understand what I signed" quotes are outside it (a
  lease co-signer, an employee) — stated plainly here because it's a real
  gap, not a rounding error: the research's search tool was blocked from
  Reddit and Quora, described as the highest-density source for exactly
  this kind of account. Thin quote count may be an access artifact, not
  proof the pain is rare for this segment.
- **Whether better comprehension at signing time actually prevents the
  documented harms is unresolved.** The research's own read: most of the
  hard-quantified harm (auto-renewal lock-in, arbitration blocking
  remedies, gig deactivation) is about what happens *after* signing —
  situations where the person may have understood the clause fine and
  simply had no leverage to negotiate it or no recourse when it was
  invoked. A clearer explanation at signing wouldn't obviously have
  changed any of these documented cases.
- **No willingness-to-pay data exists for this specific product shape.**
  The $153/hr and 50%-need figures are about legal help broadly, not an AI
  plain-English pre-signing pass specifically. The one data point that is
  specific to this shape — Pact's ~$5–13/analysis, QwickContractReview's
  flat $99 — suggests the market is already pricing this category low,
  which constrains unit economics more than the lawyer-fee comparison
  implies.
- **Where existing near-direct competitors (Pact, ContractClarifyAI,
  ClauseGuard) actually fail users is unknown.** They're too new to have
  accumulated independent reviews; their only sourced complaints are
  self-disclosed disclaimers, not real user friction.
- **Whether any competitor grounds its Q&A strictly in the uploaded
  document — Redline's core citation constraint — was not confirmed present
  or absent for any of them.** It simply wasn't mentioned in their
  marketing either way, so "we're more trustworthy on this axis" can't be
  checked against competitors directly, only claimed.
- **No verified real dispute was found for indemnification or personal
  guarantee clauses**, despite both being first-class clause types in this
  version. Their inclusion rests on the mechanism being well understood,
  not on a documented case.
