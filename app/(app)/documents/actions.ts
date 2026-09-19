"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Copy here has been run through the humanizer skill.
const NOT_CONFIGURED_MESSAGE =
  "Saving isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const NOT_SIGNED_IN_MESSAGE = "You need to be signed in to save a document.";
const SAVE_FAILED_MESSAGE =
  "The text came out fine, but we couldn't save it. Give it another try.";
const MISSING_INPUT_MESSAGE = "There's no text to save. Choose a file and try again.";

export type CreateDocumentResult = { ok: false; message: string };

/**
 * Persists extracted document text for the signed-in user, then redirects
 * to the new document's detail page. The original file is never part of
 * this call — only the text already extracted client-side.
 *
 * Returns a result object on failure. On success it redirects and never
 * returns (Next.js's `redirect` throws), so callers only need to handle
 * the failure case.
 */
export async function createDocument(input: {
  fileName: string;
  extractedText: string;
}): Promise<CreateDocumentResult> {
  const fileName = input.fileName.trim();
  const extractedText = input.extractedText.trim();

  if (!fileName || !extractedText) {
    return { ok: false, message: MISSING_INPUT_MESSAGE };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED_MESSAGE };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: NOT_SIGNED_IN_MESSAGE };
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      file_name: fileName,
      extracted_text: extractedText,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: SAVE_FAILED_MESSAGE };
  }

  redirect(`/documents/${data.id}`);
}
