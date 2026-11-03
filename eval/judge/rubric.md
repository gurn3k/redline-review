# Judge rubric

You are judging flags raised by a contract-review tool. The reader is a small business owner who has
been handed a contract by someone else and is deciding whether to sign it. For each flag you are
given the document, the clause type the flag names, the sentence it quoted, and the paragraph
around that sentence.

## The rule

**PASS** if the quoted sentence really is the kind of clause the flag names and really costs the
reader something. Otherwise **FAIL**.

Both halves have to hold. A sentence that is not the kind of clause the flag names fails, however
much it costs. A sentence that is the kind of clause named but costs the reader nothing fails too.

Not part of this rule, so do not weigh them:

- The severity label on the flag (Dangerous or Unusual).
- Whether the quoted sentence appears in the document. Code has already checked that.

## What each clause type means

These are the product's own words, from its PRD. The flag's clause type is one of these names.

- **Personal guarantee** (`personal-guarantee`): "Turns what the owner assumed was an LLC's
  limited-liability shield into open-ended personal financial exposure, with no dollar ceiling."
- **Indemnification** (`indemnification`): clauses, "especially 'any and all claims' language", that
  create "uncapped exposure that can outsize the business itself."
- **Auto-renewal** (`auto-renewal`): auto-renewal and negative-option clauses, where the agreement
  continues or renews unless the reader acts. The PRD's concern is "deceptive lock-in".
- **Unilateral termination** (`unilateral-termination`): unilateral termination and no-cause
  deactivation clauses, where the mechanism is "losing a business relationship unilaterally, with no
  recourse."
- **Arbitration and class-action waiver** (`arbitration-class-action-waiver`): the PRD says it "doesn't
  cost money directly, but it removes the remedy for every other clause in the document."
- **Liability cap and fee escalator** (`liability-cap-fee-escalator`): "Liability caps and fee
  escalators", flagged generically.
- **Red line** (`red-line`): a term the reader themselves said they cannot accept. Judge it by the
  same rule.

The PRD says these are not evaluated in this version: "non-compete clauses (employment context,
segment excluded), IP assignment clauses (freelance context, segment excluded), data/privacy
overreach in ToS (consumer/platform context, segment excluded)."

For background, the PRD's own test for whether a flag earns its place is: "does removing this clause
change the user's real financial exposure ceiling, or their ability to keep this business
relationship without cause?" The list below is wider than that test and is the one to apply.

## What "costs the reader something" means

The reader gives up, risks, or loses something real by signing the sentence as written. Any one of
these is enough:

- **Money.** The reader pays or may pay more than they would expect today, including costs that
  arrive later or can grow.
- **Liability.** The reader takes on exposure to claims or losses, including having to cover the other
  side's costs.
- **A lost remedy.** The reader gives up a way to get compensation or put something right.
- **Dependence on the other side's discretion.** What the reader is owed, or receives, is left to the
  other party to decide.
- **A limit on future work or business.** The reader's later opportunities are restricted.
- **A choice the reader would want to make before signing.** Knowing about the term lets the reader
  decide differently, negotiate, or take action in advance.

The cost does not have to be certain or large. A real possibility of cost, or a lost option the
reader might want, is enough. A sentence that places no cost, risk or lost option on the reader (it
only describes, or it only burdens the other party) does not meet this half of the rule.

## Edge cases

- **Clauses written for individuals.** A clause worded for an individual (a consumer, an employee,
  a member) still counts if the same cost would reach a small business owner in a similar position.
- **Conditional and potential costs.** A cost that depends on something happening still counts if
  that thing could realistically happen. Do not require the cost to be certain.

## How to answer

For each flag, give its number, a verdict of exactly `PASS` or `FAIL`, and one sentence saying why.
Use only this rubric and what is written in the flag. Do not guess at what anyone else decided.
