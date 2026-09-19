import { createModelClient, type ModelClient } from "@/lib/model/client";
import { containsDenyListedWord } from "@/lib/analysis/deny-list";
import {
  CATEGORY_REGISTRY,
  type CandidateFlag,
  type CategoryDefinition,
} from "@/lib/analysis/categories/registry";
import type { AnalysisResult, ClauseCategory, Flag, Severity } from "@/lib/analysis/types";

const VALID_CATEGORIES: ClauseCategory[] = [
  "personal-guarantee",
  "indemnification",
  "auto-renewal",
  "unilateral-termination",
  "arbitration-class-action-waiver",
  "liability-cap-fee-escalator",
  "red-line",
];

function isValidCategory(value: unknown): value is ClauseCategory {
  return typeof value === "string" && (VALID_CATEGORIES as string[]).includes(value);
}

/**
 * Thrown when the model/seam itself fails — a missing/malformed response,
 * not a real "the document has no issues" outcome. Callers use this to
 * distinguish "the analysis couldn't run" from any other error.
 */
export class AnalysisError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AnalysisError";
  }
}

const VALID_SEVERITIES: Severity[] = ["Dangerous", "Unusual"];

function isValidSeverity(value: unknown): value is Severity {
  return typeof value === "string" && (VALID_SEVERITIES as string[]).includes(value);
}

function buildSystemPrompt(categoryRegistry: CategoryDefinition[]): string {
  const categoryInstructions = categoryRegistry.map((def) => def.promptInstructions)
    .filter((instructions) => instructions.trim().length > 0)
    .join("\n\n");

  return `You are Redline, reviewing a contract a small business owner is about to sign, before they sign it. You explain what the document's text says and flag patterns grounded in citations — you are not a lawyer, you do not give legal advice, and you never state or imply whether a clause is enforceable in any jurisdiction or what a court would decide.

SEVERITY TEST — apply this exact test to every candidate flag:
- "Dangerous": the clause creates EITHER (a) open-ended financial exposure the user can't cap in advance, OR (b) existential/relationship-ending risk (for example, termination with no cause and no cure period) — and in both cases, only where the user has no realistic leverage to negotiate it out.
- "Unusual": the clause deviates from typical market norms, but the exposure is bounded, non-existential, or standard practice in that industry.
- There is no third tier. Every flag you produce must be exactly "Dangerous" or "Unusual".

PRECISION OVER RECALL: when a candidate clause doesn't clearly clear the Dangerous/Unusual bar above, do not include it as a candidate at all. It is far better to miss a real risk than to flag something harmless — an over-flagging tool stops being trusted. Only include a candidate if you're confident it genuinely clears the bar.

PLAIN, UNHEDGED LANGUAGE: state each flag's explanation plainly and directly. Do not hedge with words like "might," "could potentially," or "may be interpreted as." A clause either clears the bar and is stated plainly, or it isn't included at all.

CITATIONS ARE MANDATORY AND EXACT: for every candidate flag, the "citation" field must be the exact, verbatim source sentence from the document text below — character-for-character as it appears in the document. Never paraphrase, summarize, truncate, or invent a citation. If you cannot quote an exact sentence that supports a candidate, do not produce that candidate.

COUNTER-OFFERS ARE EXAMPLE LANGUAGE, NOT GUARANTEES: each counter-offer is a drafted example of language the user could propose instead — never phrase it as a guaranteed fix. Do not use words like "guarantees," "guaranteed," "protected," "protects," "protection," "enforceable," or "enforceability" anywhere in a counter-offer.

${categoryInstructions}

RED LINES: the user has supplied their own list of red lines — terms they personally find unacceptable, independent of any standard category. Evaluate each red line against the document text with the same rigor and the same severity test as any standard category, using your own judgment for severity. If a red line's concern is reflected in the document, produce a candidate flag with "category": "red-line", set "redLineText" to the verbatim red line text you matched, and set "citation" to the exact source sentence that supports it, same as any other candidate.

You must always:
(a) Produce a plain-English summary of the whole document (what it is, what it covers, in plain language a non-lawyer can follow).
(b) Evaluate every standard category above and every red line supplied, using the same severity test throughout.
(c) For every candidate flag, cite the exact source sentence verbatim — never paraphrase or invent one.

Respond with a single JSON object, and nothing else, in exactly this shape:
{
  "summary": "<plain-English summary of the whole document>",
  "flags": [
    {
      "category": "<one of: personal-guarantee, indemnification, auto-renewal, unilateral-termination, arbitration-class-action-waiver, liability-cap-fee-escalator, red-line>",
      "citation": "<exact verbatim source sentence>",
      "severity": "<Dangerous or Unusual>",
      "explanation": "<plain-English explanation of what the clause says and why it matters>",
      "counterOffer": "<drafted example language the user could propose, no guarantee/certainty words>",
      "redLineText": "<only present when category is \\"red-line\\": the verbatim red line this flag matches>"
    }
  ]
}

If nothing in the document clears the bar for any standard category or any supplied red line, return an empty "flags" array — do not force a flag to fill the response.`;
}

function buildUserMessage(documentText: string, redLines: string[]): string {
  const redLinesBlock =
    redLines.length > 0
      ? redLines.map((line, i) => `${i + 1}. ${line}`).join("\n")
      : "(none supplied)";

  return `DOCUMENT TEXT:
"""
${documentText}
"""

USER'S RED LINES (evaluate each of these against the document text above, same rigor as any standard category):
${redLinesBlock}`;
}

interface RawModelResponse {
  summary: string;
  flags: CandidateFlag[];
}

/**
 * The sole producer of the plain-English summary, ranked flags,
 * counter-offers, and Clear verdict. Runs every candidate the model
 * proposes through two hard, unconditional gates (citation integrity,
 * counter-offer banned words) before it can become a shown `Flag` — see
 * ADR 0001 and ADR 0007/0008.
 */
export async function analyzeDocument(
  documentText: string,
  redLines: string[],
  modelClient: ModelClient = createModelClient(),
  categoryRegistry: CategoryDefinition[] = CATEGORY_REGISTRY,
): Promise<AnalysisResult> {
  const system = buildSystemPrompt(categoryRegistry);
  const user = buildUserMessage(documentText, redLines);

  let raw: RawModelResponse;
  try {
    raw = await modelClient.completeJSON<RawModelResponse>({
      system,
      user,
      schemaName: "redline-analysis",
    });
  } catch (cause) {
    throw new AnalysisError("The analysis couldn't be completed — the model call failed.", {
      cause,
    });
  }

  if (typeof raw?.summary !== "string" || raw.summary.trim().length === 0) {
    throw new AnalysisError("The model response was missing a summary.");
  }
  if (!Array.isArray(raw.flags)) {
    throw new AnalysisError("The model response's flags field wasn't an array.");
  }

  const categoryByName = new Map(categoryRegistry.map((def) => [def.category, def]));

  const survivingFlags: Flag[] = [];

  for (const candidate of raw.flags) {
    if (!candidate || typeof candidate !== "object") continue;
    if (!isValidCategory(candidate.category)) continue; // malformed category — drop, don't guess

    const definition = categoryByName.get(candidate.category);

    // Step 5: determine final severity.
    let finalSeverity: unknown = candidate.severity;
    if (candidate.category !== "red-line" && definition?.computeSeverity) {
      finalSeverity = definition.computeSeverity(candidate);
    }
    if (!isValidSeverity(finalSeverity)) {
      continue; // malformed severity — drop, don't guess
    }

    // Step 6: citation-integrity hard gate (ADR 0001). Runs on every
    // candidate, every time.
    if (
      typeof candidate.citation !== "string" ||
      candidate.citation.trim().length === 0 ||
      !documentText.includes(candidate.citation)
    ) {
      continue;
    }

    // Step 7: counter-offer banned-word gate.
    if (typeof candidate.counterOffer !== "string" || containsDenyListedWord(candidate.counterOffer)) {
      continue;
    }

    if (typeof candidate.explanation !== "string" || candidate.explanation.trim().length === 0) {
      continue;
    }

    survivingFlags.push({
      category: candidate.category,
      severity: finalSeverity,
      citation: candidate.citation,
      explanation: candidate.explanation,
      counterOffer: candidate.counterOffer,
      redLineText: candidate.redLineText,
      isGenericDetection: candidate.category === "red-line" ? false : (definition?.isGenericDetection ?? false),
    });
  }

  // Step 9: rank — all Dangerous before all Unusual, stable order within
  // each tier.
  const dangerous = survivingFlags.filter((f) => f.severity === "Dangerous");
  const unusual = survivingFlags.filter((f) => f.severity === "Unusual");
  const flags = [...dangerous, ...unusual];

  const clear =
    flags.length === 0
      ? {
          checkedStandardCategories: categoryRegistry.map((def) => def.category),
          checkedRedLines: redLines,
        }
      : null;

  return {
    summary: raw.summary,
    flags,
    clear,
  };
}
