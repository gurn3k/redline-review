import type { ClauseCategory, Severity } from "@/lib/analysis/types";

/**
 * What the model proposes for one clause, before the gates in
 * `analyzeDocument` run. `severity` here is the model's own judgment —
 * `CategoryDefinition.computeSeverity`, when present, overrides it.
 */
export interface CandidateFlag {
  category: ClauseCategory;
  citation: string;
  severity: Severity;
  explanation: string;
  counterOffer: string;
  redLineText?: string;
  /**
   * Optional category-specific structured fields the model was asked to
   * supply (in that category's `promptInstructions`), for categories whose
   * `computeSeverity` needs more than the model's own severity call — e.g.
   * auto-renewal's price-escalation/cancellation-window Dangerous test.
   * Absent for categories that don't need it.
   */
  attributes?: Record<string, unknown>;
}

/**
 * The extension point tickets 05-09 each register one clause type into.
 * `analyzeDocument` reads this registry to (a) build the prompt's
 * category-specific instructions and (b) decide, per category, whether to
 * trust the model's own severity call or override it with a deterministic
 * rule.
 */
export interface CategoryDefinition {
  category: ClauseCategory;
  /** Detection guidance text appended into the model prompt for this category. */
  promptInstructions: string;
  /** True only for the two generic-detection categories (ticket 09). */
  isGenericDetection: boolean;
  /**
   * If provided, OVERRIDES the model's severity judgment with a
   * deterministic code rule. If omitted, the model's own (validated)
   * severity is trusted.
   */
  computeSeverity?: (candidate: CandidateFlag) => Severity;
}

/**
 * Empty in this ticket (04) — the mechanism and the pipeline that consumes
 * it are what's being built here, not any entries. Tickets 05-09 each
 * `push` one `CategoryDefinition` in here later:
 *   05: personal-guarantee, computeSeverity always "Dangerous"
 *   06: indemnification, computeSeverity always "Dangerous"
 *   07: auto-renewal, computeSeverity reads model-supplied structured
 *       attributes to decide the Dangerous-escalation test
 *   08: unilateral-termination, computeSeverity always "Dangerous"
 *   09: arbitration-class-action-waiver / liability-cap-fee-escalator,
 *       computeSeverity always "Unusual", isGenericDetection: true
 */
export const CATEGORY_REGISTRY: CategoryDefinition[] = [];
