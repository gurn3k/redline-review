import type { CategoryDefinition } from "@/lib/analysis/categories/registry";

/**
 * Per ADR 0006, arbitration / class-action-waiver clauses get generic
 * pattern detection only in v1 — no clause-specific negotiation logic, no
 * deep counter-offer drafting. The research (PRD "My red lines") rates this
 * the single highest-confidence, most cross-cutting finding — it doesn't
 * cost money directly, but it removes the remedy for every other flagged
 * clause — yet it's deprioritized for build-scope reasons, not evidence
 * reasons. `computeSeverity` always returns "Unusual": generic detection
 * doesn't extract the structured facts (a dollar ceiling, a termination-
 * without-cure trigger) that would support a real Dangerous escalation
 * test the way, e.g., auto-renewal's does — see this category's
 * `computeSeverity` doc comment for the full reasoning.
 */
export const arbitrationClassActionWaiverCategory: CategoryDefinition = {
  category: "arbitration-class-action-waiver",
  isGenericDetection: true,
  // Always "Unusual": generic pattern detection alone doesn't surface the
  // structured signal (dollar ceiling or existential-risk trigger) needed
  // to responsibly call this Dangerous on its own, per ADR 0005's two-prong
  // test. This is a deliberate simplification for a generic-detection-only
  // category (ADR 0006), not an oversight — see ticket 09 Comments.
  computeSeverity: () => "Unusual",
  promptInstructions: `ARBITRATION / CLASS-ACTION WAIVER DETECTION (generic detection only — see product note below): look for clauses that require the user to resolve disputes through binding arbitration instead of court, and/or that waive the user's right to participate in a class action, class arbitration, or representative proceeding. Look for language like "binding arbitration," "resolved exclusively through arbitration," "waives any right to participate in a class action," or similar. Cite the exact sentence that imposes the arbitration requirement and/or the class-action waiver.

This category is generic-detection-only in this product: do not attempt deep, clause-specific negotiation analysis (for example, don't try to evaluate the arbitration forum, the administering body, or the specific procedural rules named). If you find qualifying language, produce a candidate with a plain explanation of what the clause requires and why it matters (it limits the user's ability to go to court or to join with other affected parties), and a GENERIC, non-tailored counter-offer — something in the spirit of "you could propose removing this clause" or "you could propose preserving your right to pursue claims in court," not deeply negotiated language specific to arbitration mechanics. Do not use words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability" in the counter-offer.`,
};
