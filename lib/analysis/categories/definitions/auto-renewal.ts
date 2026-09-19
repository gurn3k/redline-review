import type { CandidateFlag, CategoryDefinition } from "@/lib/analysis/categories/registry";
import type { Severity } from "@/lib/analysis/types";

/**
 * Unreasonably short cancellation window, per the operator's specified
 * default in ticket 07: strictly fewer than this many days counts as
 * "short" for the Dangerous-escalation test below.
 */
const SHORT_CANCELLATION_WINDOW_DAYS = 14;

/**
 * Auto-renewal / negative-option clauses automatically extend the agreement
 * for another term unless the user affirmatively cancels. Per the PRD's "My
 * red lines" and ADR 0005, this is the one first-class category whose
 * severity is genuinely conditional rather than a fixed constant: auto-
 * renewal itself is common and not inherently dangerous, so it's Unusual by
 * default, and escalates to Dangerous only when it combines with either an
 * undisclosed price increase or an unreasonably short cancellation window.
 * Per the operator's standing architecture decision that severity math
 * belongs in deterministic code rather than the model's own say-so wherever
 * a rule can be stated precisely, the model is asked only to extract
 * structured facts (`candidate.attributes`) about the clause — this
 * function, not the model, decides the tier.
 */
export function computeSeverity(candidate: CandidateFlag): Severity {
  const attributes = candidate.attributes;

  const hasPriceIncrease =
    attributes && typeof attributes === "object" && attributes.hasPriceIncrease === true;

  const hasClearAdvanceNotice =
    attributes && typeof attributes === "object" && attributes.hasClearAdvanceNotice === true;

  const cancellationWindowDays =
    attributes &&
    typeof attributes === "object" &&
    typeof attributes.cancellationWindowDays === "number" &&
    Number.isFinite(attributes.cancellationWindowDays)
      ? attributes.cancellationWindowDays
      : undefined;

  const priceEscalationWithoutNotice = hasPriceIncrease && !hasClearAdvanceNotice;
  const unreasonablyShortWindow =
    typeof cancellationWindowDays === "number" &&
    cancellationWindowDays < SHORT_CANCELLATION_WINDOW_DAYS;

  if (priceEscalationWithoutNotice || unreasonablyShortWindow) {
    return "Dangerous";
  }

  return "Unusual";
}

export const autoRenewalCategory: CategoryDefinition = {
  category: "auto-renewal",
  isGenericDetection: false,
  computeSeverity,
  promptInstructions: `AUTO-RENEWAL / NEGATIVE-OPTION DETECTION: an auto-renewal (or "negative option") clause is one where the agreement automatically extends for another term unless the user affirmatively takes action to cancel before the renewal date. Look for language like "will automatically renew," "shall renew for successive terms unless," or similar, describing a term that renews by default rather than requiring the user's opt-in.

Auto-renewal is common and not inherently dangerous — it is Unusual by default, not automatically Dangerous. It escalates to Dangerous specifically when it combines with either: (a) the renewal price increasing without clear advance notice of that increase, or (b) an unreasonably short window in which the user can cancel before the renewal locks in. You do not decide the final severity tier yourself for this category — the surrounding system applies a deterministic rule to the structured facts you extract below. Still extract those facts as accurately as you can, since the rule depends entirely on them.

For every "auto-renewal" candidate, also populate an "attributes" object on that candidate with exactly these three fields:
- "hasPriceIncrease": boolean — true if the renewal term's fees increase compared to the prior term, false if the price stays the same (or the clause doesn't say the price changes).
- "hasClearAdvanceNotice": boolean — true only if any price increase on renewal is clearly disclosed to the user with reasonable advance notice before it takes effect; false if there's no such notice, or the notice is vague, or there is no price increase to begin with.
- "cancellationWindowDays": number — your best reading, in days, of how much advance notice the user must give (or how long before the renewal date the user must act) to cancel and avoid the renewal. Use the clause's own stated notice period; if the clause states a deadline as "no later than N days before" renewal, that N is the cancellation window.

Cite the exact sentence describing the auto-renewal mechanism (the renewal term, the notice/cancellation deadline, and the price if it changes — quote the sentence that carries this, verbatim).

When you produce an auto-renewal candidate, draft a counter-offer that proposes concrete alternative language specific to auto-renewal — for example, proposing the renewal require the user's affirmative opt-in instead of defaulting to automatic renewal, proposing a longer and more reasonable cancellation window, or proposing clear advance notice of any price change before it takes effect. Draft it as example language the user could propose, never as a guaranteed outcome — do not use words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability" in the counter-offer itself.`,
};
