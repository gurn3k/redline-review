"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import type { AnalysisResult } from "@/lib/analysis/types";

// Copy here has been run through the humanizer skill.
const NOT_CONFIGURED_MESSAGE =
  "Analysis isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const SESSION_EXPIRED_MESSAGE = "Your session's expired. Log in again to run the analysis.";
const NOT_FOUND_MESSAGE = "Couldn't find that document in your account.";
const RED_LINES_LOAD_FAILED_MESSAGE = "Couldn't load your red lines. Try again.";
const MODEL_FAILED_MESSAGE = "Couldn't complete the analysis. Try again.";

export type AnalyzeDocumentActionResult =
  | { ok: true; result: AnalysisResult }
  | { ok: false; message: string };

/**
 * Runs `analyzeDocument` for a document the signed-in user owns and returns
 * the result to the client. Re-checks auth and ownership server-side rather
 * than trusting the caller, per Next.js's Server Actions security guidance
 * (every action is an untrusted, directly reachable entry point).
 *
 * On success, also persists the result to `documents.analysis_result`
 * (scoped to this id AND this user_id) so the document's page can show it
 * again later without re-running analysis. A save failure is logged
 * server-side but doesn't fail the action — the user already has a correct
 * answer in hand, and surfacing a "the analysis failed" message when it
 * actually succeeded would be worse than a library entry that just doesn't
 * pick up the saved copy this one time.
 */
export async function analyzeDocumentAction(documentId: string): Promise<AnalyzeDocumentActionResult> {
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

  const { data: redLineRows, error: redLinesError } = await supabase
    .from("red_lines")
    .select("text")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (redLinesError) {
    return { ok: false, message: RED_LINES_LOAD_FAILED_MESSAGE };
  }

  const redLines = (redLineRows ?? []).map((row: { text: string }) => row.text);

  let result: AnalysisResult;
  try {
    result = await analyzeDocument(document.extracted_text, redLines);
  } catch {
    // Covers AnalysisError (malformed model response) and any other
    // failure from the seam alike — the user never sees a raw stack trace.
    return { ok: false, message: MODEL_FAILED_MESSAGE };
  }

  const { error: saveError } = await supabase
    .from("documents")
    .update({ analysis_result: result })
    .eq("id", document.id)
    .eq("user_id", user.id);

  if (saveError) {
    // The analysis itself succeeded — the user still gets their answer.
    // Only the "load it again later without re-running" behavior is lost
    // for this document, so this is a server log, not a user-facing error.
    console.error(`Failed to save analysis result for document ${document.id}:`, saveError);
  }

  return { ok: true, result };
}
