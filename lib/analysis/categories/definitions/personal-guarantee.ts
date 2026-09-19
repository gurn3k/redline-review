import type { CategoryDefinition } from "@/lib/analysis/categories/registry";

/**
 * Personal guarantee clauses make an individual — not just the business
 * entity signing the contract — personally liable for the business's
 * obligations under the agreement. When the guarantee has no stated dollar
 * cap, it converts what the owner assumed was an LLC's limited-liability
 * shield into open-ended personal financial exposure, with no realistic way
 * to negotiate around it once signed. Per the PRD's "My red lines" and
 * ADR 0005's exposure-ceiling prong, that always clears the Dangerous bar
 * when detected at all — there is no Unusual tier for this category.
 */
export const personalGuaranteeCategory: CategoryDefinition = {
  category: "personal-guarantee",
  isGenericDetection: false,
  computeSeverity: () => "Dangerous",
  promptInstructions: `PERSONAL GUARANTEE DETECTION: a personal guarantee clause is one where an individual — the person signing on behalf of the business, an owner, or another named individual — agrees to be personally liable for the business entity's obligations under the contract, rather than liability staying with the business entity alone (e.g. an LLC or corporation). Look for language where an individual "personally guarantees," "personally and unconditionally guarantees," or otherwise agrees in an individual capacity to answer for the business's payment or performance obligations if the business itself doesn't satisfy them.

Only produce a "personal-guarantee" candidate when the guarantee is genuinely open-ended: no stated dollar cap or ceiling on the individual's exposure, and no realistic way for the user to negotiate it out (for example, it's presented as a standard, non-negotiable term of a take-it-or-leave-it contract). Per the precision-over-recall rule, do not flag a personal guarantee that is clearly capped at a stated dollar amount, limited to a specific bounded obligation, or otherwise structured so the individual's exposure has a ceiling — that is not what this category is for, and it should be left out entirely rather than flagged with lower confidence. Cite the exact sentence that states the individual's personal liability.

When you do produce a personal-guarantee candidate, draft a counter-offer that proposes concrete alternative language specific to personal guarantees — for example, proposing a stated dollar cap on the individual's exposure, proposing that the guarantee be removed entirely so liability stays at the business-entity level, or proposing that any personal liability expire after a fixed period. Draft it as example language the user could propose, never as a guaranteed outcome — do not use words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability" in the counter-offer itself.`,
};
