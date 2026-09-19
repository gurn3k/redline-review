/**
 * The shared shape for `answerFromDocument`'s output. This seam is
 * independent of `analyzeDocument`/`AnalysisResult` (see
 * lib/qa/answer-from-document.ts) — do not import anything from
 * lib/analysis here.
 */
export interface Answer {
  answer: string; // the answer text, OR a decline message when not grounded
  grounded: boolean; // true only if the answer is genuinely supported by the document
  supportingQuote?: string; // present only when grounded is true: an exact substring of documentText
}
