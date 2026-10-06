import type { AnalysisResult } from "@/lib/analysis/types";
import type { Answer } from "@/lib/qa/types";
import sample from "./coldline-analysis.json";

/**
 * The public sample analysis shown on /sample and the landing page. It is
 * real Redline output, written once by `scripts/generate-sample.ts` and
 * never edited by hand; tests/sample-analysis.test.ts checks that every
 * quote in it is an exact substring of the sample contract.
 */
export interface SampleAnalysis {
  fileName: string;
  generatedAt: string;
  model: string;
  redLines: string[];
  documentText: string;
  analysis: AnalysisResult;
  qa: (Answer & { question: string })[];
}

export const SAMPLE = sample as SampleAnalysis;
