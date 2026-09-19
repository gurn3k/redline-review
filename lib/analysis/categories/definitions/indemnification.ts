import type { CategoryDefinition } from "@/lib/analysis/categories/registry";

/**
 * Ticket 06: indemnification detection. Same shape as personal-guarantee
 * (05) — open-ended financial exposure per ADR 0005's "open-ended financial
 * exposure" prong, always Dangerous when detected at all. There is no
 * Unusual tier for this category: a properly capped, mutual, carved-out
 * indemnification clause is ordinary and shouldn't be flagged in the first
 * place (ADR 0007, precision over recall) — `computeSeverity` never has to
 * distinguish degrees of indemnification risk, only confirm detection.
 */
export const indemnificationCategory: CategoryDefinition = {
  category: "indemnification",
  isGenericDetection: false,
  computeSeverity: () => "Dangerous",
  promptInstructions: `INDEMNIFICATION: an indemnification clause requires the user (or their business) to cover the counterparty's losses, claims, damages, or expenses — sometimes including the counterparty's legal fees — arising from some set of triggering events. What makes an indemnification clause dangerous: the exposure is uncapped, with no dollar ceiling tied to fees paid or any other bound; the triggering language is broad, such as "any and all claims, damages, losses, and expenses" with a wide "arising out of or in any way related to" scope rather than a narrow, specific trigger; the obligation runs one way only, from the user to the counterparty, with no mutual or reciprocal indemnification running the other direction; and there is no carve-out excluding claims caused by the counterparty's own negligence, misconduct, or breach — meaning the user could end up covering losses the counterparty itself caused. Only produce an "indemnification" candidate when the clause is genuinely uncapped or overly broad in one or more of these ways. A capped, mutual, or narrowly-scoped indemnification clause — for example, one limited to the user's own breach or negligence, capped at fees paid, or reciprocal between both parties — is ordinary and common in commercial contracts and must not be flagged; per precision over recall, when a clause doesn't clearly show uncapped or overly broad exposure, leave it out rather than flagging it. When a genuine candidate is found, cite the exact sentence imposing the indemnification obligation, and draft a counter-offer specific to indemnification as example language the user could propose — such as adding a dollar cap tied to fees paid under the agreement, making the indemnification obligation mutual so both parties indemnify each other on the same terms, or adding a carve-out excluding claims arising from the counterparty's own negligence or misconduct. As with every counter-offer, never use guarantee or certainty words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability."`,
};
