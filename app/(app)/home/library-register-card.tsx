import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Copy in this file has been run through the humanizer skill.

// Owned by ticket 11 (document library). Links into the full library screen
// at /library, with a live count when Supabase is configured and the user
// is signed in. Falls back to a static description otherwise — this must
// never throw, since home/page.tsx renders it unconditionally. Mirrors
// red-lines-register-card.tsx (ticket 03).
export async function LibraryRegisterCard() {
  const count = await getDocumentCount();

  return (
    <Link href="/library" className="register-card register-card-link">
      <p className="ledger-ref tabular">§ LIBRARY</p>
      <h2 className="register-heading">Library</h2>
      <p className="register-body">{describeCount(count)}</p>
      <span className="register-cta">Open your library →</span>
    </Link>
  );
}

async function getDocumentCount(): Promise<number | null> {
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
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

function describeCount(count: number | null): string {
  if (count === null) {
    return "Documents you've reviewed will be saved here so you can revisit them.";
  }
  if (count === 0) {
    return "You haven't analyzed any documents yet. Upload one to start your library.";
  }
  return `${count} document${count === 1 ? "" : "s"} saved, each one ready to reopen without re-running analysis.`;
}
