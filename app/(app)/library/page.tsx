import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Library — Redline",
};

// Copy in this file has been run through the humanizer skill.
const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const LOAD_ERROR_MESSAGE = "Couldn't load your library. Try refreshing the page.";
const SUB_COPY =
  "Every document you've analyzed lives here, so you can pull it back up without re-running the check.";

type DocumentRow = {
  id: string;
  file_name: string;
  created_at: string;
  analysis_result: unknown;
};

// Plain read-through list of the signed-in user's saved documents, scoped
// via user_id (RLS backs this up too — see supabase/migrations/0001_documents.sql).
// This is read-only CRUD over a seam that already exists (analyzeDocument /
// analyze-action.ts), so it ships without its own dedicated test suite, same
// as the red-lines list (app/(app)/red-lines/page.tsx, ticket 03).
export default async function LibraryPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="redlines-page">
        <p className="ledger-ref tabular">§ LIBRARY</p>
        <h1 className="redlines-heading">Your library</h1>
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

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, file_name, created_at, analysis_result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<DocumentRow[]>();

  return (
    <div className="redlines-page">
      <p className="ledger-ref tabular">§ LIBRARY</p>
      <h1 className="redlines-heading">Your library</h1>
      <p className="redlines-sub">{SUB_COPY}</p>

      <div className="redlines-list-wrap">
        {error ? (
          <p className="auth-message auth-message-error" role="alert">
            {LOAD_ERROR_MESSAGE}
          </p>
        ) : documents && documents.length > 0 ? (
          <ol className="ledger-list">
            {documents.map((document) => (
              <li key={document.id}>
                <Link href={`/documents/${document.id}`} className="ledger-row">
                  <span className="ledger-ref tabular">{formatRef(document.created_at)}</span>
                  <span className="ledger-name">{document.file_name}</span>
                  <span className="ledger-note">{describeStatus(document.analysis_result)}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="redlines-empty">
            No documents yet.{" "}
            <Link href="/home" className="register-cta">
              Upload one from home
            </Link>{" "}
            and it&rsquo;ll land here once Redline&rsquo;s reviewed it.
          </p>
        )}
      </div>

      <Link href="/home" className="redlines-back">
        ← Back to home
      </Link>
    </div>
  );
}

function formatRef(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function describeStatus(analysisResult: unknown): string {
  if (!analysisResult || typeof analysisResult !== "object") {
    return "Not yet analyzed";
  }

  const record = analysisResult as { flags?: unknown };
  if (!Array.isArray(record.flags)) {
    return "Not yet analyzed";
  }

  if (record.flags.length === 0) {
    return "Clear";
  }

  let dangerous = 0;
  let unusual = 0;
  for (const flag of record.flags) {
    if (!flag || typeof flag !== "object") continue;
    const severity = (flag as { severity?: unknown }).severity;
    if (severity === "Dangerous") dangerous += 1;
    else if (severity === "Unusual") unusual += 1;
  }

  if (dangerous > 0 && unusual > 0) {
    return `${dangerous} Dangerous, ${unusual} Unusual`;
  }
  if (dangerous > 0) {
    return `${dangerous} Dangerous`;
  }
  if (unusual > 0) {
    return `${unusual} Unusual`;
  }
  return "Clear";
}
