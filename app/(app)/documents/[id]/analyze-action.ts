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
 * the result to the client. Does NOT persist to `documents.analysis_result`
 * — ticket 11 owns writing that column. Re-checks auth and ownership
 * server-side rather than trusting the caller, per Next.js's Server Actions
 * security guidance (every action is an untrusted, directly reachable
 * entry point).
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

  try {
    const result = await analyzeDocument(document.extracted_text, redLines);
    return { ok: true, result };
  } catch {
    // Covers AnalysisError (malformed model response) and any other
    // failure from the seam alike — the user never sees a raw stack trace.
    return { ok: false, message: MODEL_FAILED_MESSAGE };
  }
}
