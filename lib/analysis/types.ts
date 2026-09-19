/**
 * The shared shape for `analyzeDocument`'s output. Five more tickets (05-09,
 * 11) build directly on top of these exact names — do not rename a type or
 * field here without updating every one of them.
 */

export type Severity = "Dangerous" | "Unusual";

export type ClauseCategory =
  | "personal-guarantee"
  | "indemnification"
  | "auto-renewal"
  | "unilateral-termination"
  | "arbitration-class-action-waiver"
  | "liability-cap-fee-escalator"
  | "red-line";

export interface Flag {
  category: ClauseCategory;
  severity: Severity;
  citation: string; // exact substring of documentText
  explanation: string; // plain-English explanation of what the clause says and why it matters
  counterOffer: string; // drafted example language the user could propose
  redLineText?: string; // present only when category === "red-line": the verbatim red line this flag matches
  isGenericDetection: boolean; // true only for arbitration-class-action-waiver / liability-cap-fee-escalator
}

export interface ClearState {
  checkedStandardCategories: ClauseCategory[]; // every standard (non-red-line) category currently registered and evaluated
  checkedRedLines: string[]; // verbatim text of every red line evaluated (may be empty)
}

export interface AnalysisResult {
  summary: string;
  flags: Flag[]; // ranked: all Dangerous flags before all Unusual flags
  clear: ClearState | null; // non-null if and only if flags.length === 0
}
