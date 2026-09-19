import type { ClauseCategory, Severity } from "@/lib/analysis/types";
import { personalGuaranteeCategory } from "@/lib/analysis/categories/definitions/personal-guarantee";
import { indemnificationCategory } from "@/lib/analysis/categories/definitions/indemnification";
import { autoRenewalCategory } from "@/lib/analysis/categories/definitions/auto-renewal";
import { unilateralTerminationCategory } from "@/lib/analysis/categories/definitions/unilateral-termination";
import { arbitrationClassActionWaiverCategory } from "@/lib/analysis/categories/definitions/arbitration-class-action-waiver";
import { liabilityCapFeeEscalatorCategory } from "@/lib/analysis/categories/definitions/liability-cap-fee-escalator";

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
 * Every standard (non-red-line) clause type Redline currently detects.
 * Each entry was built and tested independently (tickets 05-09) against a
 * locally-scoped registry array passed through `analyzeDocument`'s 4th
 * parameter, then wired in here in one pass — this file is the only place
 * that assembles them into the real, live registry `analyzeDocument` uses
 * by default.
 */
export const CATEGORY_REGISTRY: CategoryDefinition[] = [
  personalGuaranteeCategory,
  indemnificationCategory,
  autoRenewalCategory,
  unilateralTerminationCategory,
  arbitrationClassActionWaiverCategory,
  liabilityCapFeeEscalatorCategory,
];
