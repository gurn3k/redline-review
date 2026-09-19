"use server";

import { createClient } from "@/lib/supabase/server";
import { answerFromDocument } from "@/lib/qa/answer-from-document";
import type { Answer } from "@/lib/qa/types";

// Copy here has been run through the humanizer skill.
const NOT_CONFIGURED_MESSAGE =
  "Q&A isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const SESSION_EXPIRED_MESSAGE = "Your session's expired. Log in again to ask a question.";
const NOT_FOUND_MESSAGE = "Couldn't find that document in your account.";
const EMPTY_QUESTION_MESSAGE = "Type a question first.";
const MODEL_FAILED_MESSAGE = "Couldn't get an answer. Try again.";

export type AnswerQuestionActionResult =
  | { ok: true; result: Answer }
  | { ok: false; message: string };

/**
 * Runs `answerFromDocument` for a document the signed-in user owns and
 * returns the result to the client. Re-checks auth and ownership
 * server-side rather than trusting the caller, mirroring
 * `analyzeDocumentAction` in ./analyze-action.ts. Independent of the
 * analysis seam — this action never reads `analysis_result`.
 */
export async function answerQuestionAction(
  documentId: string,
  question: string,
): Promise<AnswerQuestionActionResult> {
  const trimmedQuestion = question.trim();
  if (trimmedQuestion.length === 0) {
    return { ok: false, message: EMPTY_QUESTION_MESSAGE };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED_MESSAGE };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: SESSION_EXPIRED_MESSAGE };
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, extracted_text")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string; extracted_text: string }>();

  if (documentError || !document) {
    return { ok: false, message: NOT_FOUND_MESSAGE };
  }

  try {
    const result = await answerFromDocument(document.extracted_text, trimmedQuestion);
    return { ok: true, result };
  } catch {
    // Covers QAError (malformed model response) and any other failure from
    // the seam alike — the user never sees a raw stack trace.
    return { ok: false, message: MODEL_FAILED_MESSAGE };
  }
}
