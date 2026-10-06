import type { AnalysisResult, ClauseCategory, Flag } from "@/lib/analysis/types";

export const CATEGORY_LABELS: Record<Exclude<ClauseCategory, "red-line">, string> = {
  "personal-guarantee": "Personal guarantee",
  indemnification: "Indemnification",
  "auto-renewal": "Auto-renewal",
  "unilateral-termination": "Unilateral termination",
  "arbitration-class-action-waiver": "Arbitration / class-action waiver",
  "liability-cap-fee-escalator": "Liability cap / fee escalator",
};

export function flagTitle(flag: Flag): string {
  return flag.category === "red-line" ? "Your red line" : CATEGORY_LABELS[flag.category];
}

export function severityCounts(result: AnalysisResult): { dangerous: number; unusual: number } {
  let dangerous = 0;
  let unusual = 0;
  for (const flag of result.flags) {
    if (flag.severity === "Dangerous") dangerous += 1;
    else unusual += 1;
  }
  return { dangerous, unusual };
}

// "October 6, 2026": dates in words, never "10.06" or a raw timestamp.
export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
