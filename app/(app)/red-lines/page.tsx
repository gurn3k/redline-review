import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddRedLineForm } from "./add-red-line-form";
import { RedLineItem } from "./red-line-item";

export const metadata: Metadata = {
  title: "Red lines — Redline",
};

const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const LOAD_ERROR_MESSAGE = "Couldn't load your red lines. Try refreshing the page.";
const EMPTY_STATE_MESSAGE =
  "No red lines yet. Add one above so Redline knows what to flag for you.";

export default async function RedLinesPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="redlines-page">
        <p className="ledger-ref tabular">§ RED LINES</p>
        <h1 className="redlines-heading">Your red lines</h1>
        <p className="redlines-sub">{NOT_CONFIGURED_MESSAGE}</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: redLines, error } = await supabase
    .from("red_lines")
    .select("id, text")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="redlines-page">
      <p className="ledger-ref tabular">§ RED LINES</p>
      <h1 className="redlines-heading">Your red lines</h1>
      <p className="redlines-sub">
        Terms you personally won&rsquo;t accept, on top of Redline&rsquo;s standard checks.
      </p>

      <AddRedLineForm />

      <div className="redlines-list-wrap">
        {error ? (
          <p className="auth-message auth-message-error" role="alert">
            {LOAD_ERROR_MESSAGE}
          </p>
        ) : redLines && redLines.length > 0 ? (
          <ul className="redlines-list">
            {redLines.map((redLine) => (
              <RedLineItem key={redLine.id} redLine={redLine} />
            ))}
          </ul>
        ) : (
          <p className="redlines-empty">{EMPTY_STATE_MESSAGE}</p>
        )}
      </div>

      <Link href="/home" className="redlines-back">
        ← Back to home
      </Link>
    </div>
  );
}
