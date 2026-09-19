"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RedLineActionResult = {
  error: string | null;
};

const EMPTY_TEXT_ERROR = "Enter a red line before saving.";
const NOT_CONFIGURED_ERROR =
  "Sign-in isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const SESSION_EXPIRED_ERROR = "Your session's expired. Log in again to keep editing your red lines.";
const SAVE_FAILED_ERROR = "Couldn't save that red line. Try again.";
const DELETE_FAILED_ERROR = "Couldn't delete that red line. Try again.";

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) {
    return { supabase: null, user: null, error: NOT_CONFIGURED_ERROR } as const;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, user: null, error: SESSION_EXPIRED_ERROR } as const;
  }

  return { supabase, user, error: null } as const;
}

export async function addRedLine(formData: FormData): Promise<RedLineActionResult> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return { error: EMPTY_TEXT_ERROR };
  }

  const { supabase, user, error } = await requireUser();
  if (!supabase || !user) {
    return { error };
  }

  const { error: insertError } = await supabase
    .from("red_lines")
    .insert({ user_id: user.id, text });

  if (insertError) {
    return { error: SAVE_FAILED_ERROR };
  }

  revalidatePath("/red-lines");
  revalidatePath("/home");
  return { error: null };
}

export async function updateRedLine(
  id: string,
  formData: FormData,
): Promise<RedLineActionResult> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return { error: EMPTY_TEXT_ERROR };
  }

  const { supabase, user, error } = await requireUser();
  if (!supabase || !user) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("red_lines")
    .update({ text, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: SAVE_FAILED_ERROR };
  }

  revalidatePath("/red-lines");
  return { error: null };
}

export async function deleteRedLine(id: string): Promise<RedLineActionResult> {
  const { supabase, user, error } = await requireUser();
  if (!supabase || !user) {
    return { error };
  }

  const { error: deleteError } = await supabase
    .from("red_lines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: DELETE_FAILED_ERROR };
  }

  revalidatePath("/red-lines");
  revalidatePath("/home");
  return { error: null };
}
