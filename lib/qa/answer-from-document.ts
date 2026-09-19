import { createModelClient, type ModelClient } from "@/lib/model/client";
import type { Answer } from "@/lib/qa/types";

/**
 * Thrown when the model/seam itself fails — a missing/malformed response,
 * not a real "the document doesn't answer this" outcome. Callers use this
 * to distinguish "the question couldn't be answered because the seam
 * failed" from any other error.
 */
export class QAError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "QAError";
  }
}

const CANNOT_VERIFY_MESSAGE =
  "Redline couldn't confirm that answer is actually in this document's text, so it isn't shown here. Try rephrasing the question.";

function buildSystemPrompt(): string {
  return `You are Redline's document Q&A assistant. A small business owner is asking a follow-up question about a contract they're about to sign. You answer using ONLY the document text the user gives you below — never outside knowledge, never general legal knowledge, never an inference that goes beyond what the text actually says. This is document-grounded explanation, not legal advice: you explain what the document's text says, you don't guess or fill gaps.

If the document's text does not actually support an answer to the question, you must decline rather than guess. Do not fabricate an answer, and do not stretch a loosely related sentence into an answer it doesn't actually give.

When you CAN answer, you must also provide an exact, verbatim supporting quote: a real sentence copied character-for-character from the document text, never a paraphrase and never an invented quote.

Respond with a single JSON object, and nothing else, in exactly this shape:
{
  "grounded": <true or false>,
  "answer": "<the answer, or a clear decline message if not grounded>",
  "supportingQuote": "<only when grounded is true: exact verbatim sentence from the document>"
}`;
}

function buildUserMessage(documentText: string, question: string): string {
  return `DOCUMENT TEXT:
"""
${documentText}
"""

QUESTION:
${question}`;
}

interface RawAnswer {
  grounded: boolean;
  answer: string;
  supportingQuote?: string;
}

/**
 * The Q&A seam. Independent of `analyzeDocument` — it never reads or
 * depends on an `AnalysisResult`/flags, only the raw document text and the
 * question. Runs the model's claimed grounding through a hard gate before
 * trusting it (mirrors `analyzeDocument`'s citation-integrity gate, ADR
 * 0001): a `grounded: true` claim whose supporting quote can't be verified
 * as an exact substring of `documentText` is downgraded to a refusal, never
 * shown as a trusted answer.
 */
export async function answerFromDocument(
  documentText: string,
  question: string,
  modelClient: ModelClient = createModelClient(),
): Promise<Answer> {
  const system = buildSystemPrompt();
  const user = buildUserMessage(documentText, question);

  let raw: RawAnswer;
  try {
    raw = await modelClient.completeJSON<RawAnswer>({
      system,
      user,
      schemaName: "redline-qa",
    });
  } catch (cause) {
    throw new QAError("The question couldn't be answered — the model call failed.", { cause });
  }

  if (typeof raw?.grounded !== "boolean") {
    throw new QAError("The model response was missing a valid \"grounded\" field.");
  }
  if (typeof raw.answer !== "string" || raw.answer.trim().length === 0) {
    throw new QAError("The model response was missing an answer.");
  }

  if (raw.grounded === false) {
    // Pass the model's own decline through as-is — no supporting quote.
    return { answer: raw.answer, grounded: false };
  }

  // Hard gate: don't trust a claimed "grounded: true" — verify it. A quote
  // that's missing, empty, or not an exact substring of documentText means
  // the claim can't be checked, so it's treated as not grounded.
  const quote = raw.supportingQuote;
  if (typeof quote !== "string" || quote.trim().length === 0 || !documentText.includes(quote)) {
    return { answer: CANNOT_VERIFY_MESSAGE, grounded: false };
  }

  return { answer: raw.answer, grounded: true, supportingQuote: quote };
}
