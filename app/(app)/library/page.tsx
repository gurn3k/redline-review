import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/analysis/labels";

export const metadata: Metadata = {
  title: "Library — Redline",
};

// Copy in this file has been run through the humanizer skill.
const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up on this deployment yet. Ask whoever runs Redline to add the Supabase credentials.";
const LOAD_ERROR_MESSAGE = "Couldn't load your library. Try refreshing the page.";
const SUB_COPY =
  "Every contract you've uploaded, newest first. A reviewed contract reopens as it was, without running again.";

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
      <div className="page-section">
        <h1 className="page-title">Library</h1>
        <p className="page-intro">{NOT_CONFIGURED_MESSAGE}</p>
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
    <div className="page-section">
      <div className="page-head">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-intro">{SUB_COPY}</p>
        </div>
        <Link href="/home" className="btn btn-primary">
          Upload a contract
        </Link>
      </div>

      {error ? (
        <p className="message message-error" role="alert">
          {LOAD_ERROR_MESSAGE}
        </p>
      ) : documents && documents.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Document</th>
              <th scope="col">Uploaded</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => {
              const status = describeStatus(document.analysis_result);
              return (
                <tr key={document.id}>
                  <td>
                    <Link href={`/documents/${document.id}`} className="table-link">
                      {document.file_name}
                    </Link>
                  </td>
                  <td className="table-muted">{formatDate(document.created_at)}</td>
                  <td>
                    <span className={`status status-${status.tone}`}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>No contracts yet. Upload one and it&rsquo;ll be saved here once Redline has reviewed it.</p>
          <Link href="/home" className="btn btn-primary">
            Upload a contract
          </Link>
        </div>
      )}
    </div>
  );
}

function describeStatus(analysisResult: unknown): { label: string; tone: "none" | "clear" | "dangerous" | "unusual" } {
  if (!analysisResult || typeof analysisResult !== "object") {
    return { label: "Not reviewed yet", tone: "none" };
  }

  const record = analysisResult as { flags?: unknown };
  if (!Array.isArray(record.flags)) {
    return { label: "Not reviewed yet", tone: "none" };
  }

  if (record.flags.length === 0) {
    return { label: "Clear", tone: "clear" };
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
    return { label: `${dangerous} Dangerous · ${unusual} Unusual`, tone: "dangerous" };
  }
  if (dangerous > 0) {
    return { label: `${dangerous} Dangerous`, tone: "dangerous" };
  }
  if (unusual > 0) {
    return { label: `${unusual} Unusual`, tone: "unusual" };
  }
  return { label: "Clear", tone: "clear" };
}
