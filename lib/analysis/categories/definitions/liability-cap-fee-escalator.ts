import type { CategoryDefinition } from "@/lib/analysis/categories/registry";

/**
 * Per ADR 0006, liability-cap / fee-escalator clauses get generic pattern
 * detection only in v1 — noted in the research only as side mentions, not
 * independently investigated, with no deep negotiation logic built for
 * them. `computeSeverity` always returns "Unusual" — see this category's
 * `computeSeverity` doc comment and ticket 09's Comments for the reasoning.
 */
export const liabilityCapFeeEscalatorCategory: CategoryDefinition = {
  category: "liability-cap-fee-escalator",
  isGenericDetection: true,
  // Always "Unusual": generic pattern detection alone doesn't extract the
  // structured facts (e.g. whether the cap is truly unreasonably low
  // relative to the user's real exposure, or whether a fee escalation
  // lacks notice/an exit) that would support a responsible Dangerous call.
  // Deliberate simplification for a generic-detection-only category
  // (ADR 0006), not an oversight — see ticket 09 Comments.
  computeSeverity: () => "Unusual",
  promptInstructions: `LIABILITY CAP / FEE ESCALATOR DETECTION (generic detection only — see product note below): look for clauses that cap the counterparty's total liability to the user at a low fixed dollar amount or a short lookback period on fees paid (for example, "liability shall not exceed the fees paid during the one month period preceding the claim"), and/or clauses that escalate the fees the user owes over time without clear notice or an exit (a "fee escalator"). Cite the exact sentence stating the cap or the fee escalation.

This category is generic-detection-only in this product: do not attempt deep, clause-specific negotiation analysis (for example, don't try to model what a "reasonable" cap would be for this specific deal). If you find qualifying language, produce a candidate with a plain explanation of what the clause does and why it matters (it limits what the user could recover if things go wrong, or increases what the user pays over time), and a GENERIC, non-tailored counter-offer — something in the spirit of "you could propose raising this cap" or "you could propose negotiating the fee schedule," not deeply negotiated language specific to liability-cap mechanics. Do not use words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability" in the counter-offer.`,
};
