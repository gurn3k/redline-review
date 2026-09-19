import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Owned by ticket 03 (red-lines CRUD). Links into the full red-lines screen
// at /red-lines, with a live count when Supabase is configured and the user
// is signed in. Falls back to a static description otherwise — this must
// never throw, since home/page.tsx renders it unconditionally.
export async function RedLinesRegisterCard() {
  const count = await getRedLineCount();

  return (
    <Link href="/red-lines" className="register-card register-card-link">
      <p className="ledger-ref tabular">§ RED LINES</p>
      <h2 className="register-heading">Your red lines</h2>
      <p className="register-body">{describeCount(count)}</p>
      <span className="register-cta">Manage red lines →</span>
    </Link>
  );
}

async function getRedLineCount(): Promise<number | null> {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { count } = await supabase
    .from("red_lines")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

function describeCount(count: number | null): string {
  if (count === null) {
    return "Your personal list of dealbreakers lives here and drives what Redline flags.";
  }
  if (count === 0) {
    return "You haven't set any yet. Add the terms Redline should flag for you.";
  }
  return `${count} red line${count === 1 ? "" : "s"} on file, checked on every document you review.`;
}
