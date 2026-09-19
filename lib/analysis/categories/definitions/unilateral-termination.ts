import type { CategoryDefinition } from "@/lib/analysis/categories/registry";

/**
 * Ticket 08: unilateral termination / no-cause deactivation detection. This
 * is the existential-risk prong of ADR 0005's severity test — a clause that
 * lets the counterparty end the relationship at any time, for any reason or
 * no reason, with no cure period and no realistic leverage for the user to
 * negotiate it out. Unlike auto-renewal (07), there is no bounded/Unusual
 * version of this category: losing the relationship unilaterally, with no
 * recourse, is always Dangerous when it's genuinely present at all —
 * `computeSeverity` only confirms detection, it never grades degrees of it.
 */
export const unilateralTerminationCategory: CategoryDefinition = {
  category: "unilateral-termination",
  isGenericDetection: false,
  computeSeverity: () => "Dangerous",
  promptInstructions: `UNILATERAL TERMINATION / NO-CAUSE DEACTIVATION DETECTION: a unilateral termination clause is one where the counterparty can end the relationship at any time, for any reason or for no reason at all, without being required to show cause — and critically, without giving the user any cure period (a chance to fix an alleged problem before the termination takes effect) or any advance-notice opportunity that would let the user address the issue first. This is an existential-risk clause, not a financial-exposure one: it is dangerous because it can end the user's core business relationship unilaterally, independent of any dollar figure attached to it.

Only produce a "unilateral-termination" candidate when the clause genuinely lacks BOTH a cause requirement AND a cure period, and the user has no realistic leverage to negotiate it out — for example, it's presented as a standard, non-negotiable term of a take-it-or-leave-it contract, or it's a one-sided right that only the counterparty holds. Per precision over recall, an ordinary "either party may terminate for cause after a 30-day cure period" clause is NOT dangerous and must not be flagged — a cure period defeats this category entirely. Likewise, a mutual or bilateral termination-for-convenience clause where BOTH sides hold the same, symmetric right to terminate without cause, on reasonable advance notice, is ordinary market practice and must not be flagged — symmetry is what makes it acceptable, since the user has the same exit right the counterparty has. Only flag when the right is one-sided (the counterparty can end it unilaterally but the user cannot, or cannot on comparable terms) or when even a mutual clause gives unreasonably short or no notice. When a clause doesn't clearly show both the missing cause requirement and the missing cure period, leave it out rather than flagging it with lower confidence.

When you do produce a unilateral-termination candidate, cite the exact sentence that grants the counterparty this no-cause, no-cure termination right, and draft a counter-offer specific to this category as example language the user could propose — such as proposing a cause requirement before termination is permitted, proposing a defined cure period (e.g. 30 days' written notice with an opportunity to fix the issue) before any termination takes effect, or proposing that termination rights be made symmetric between both parties with equal, reasonable advance notice. Draft it as example language the user could propose, never as a guaranteed outcome — do not use words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability" in the counter-offer itself.`,
};
