import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalysisPanel } from "./analysis-panel";
import { QABox } from "./qa-box";

export const metadata: Metadata = {
  title: "Document — Redline",
};

type DocumentRow = {
  id: string;
  file_name: string;
  extracted_text: string;
  analysis_result: unknown;
  created_at: string;
};

// Shell page for a single stored document (ticket 02). Shows the file name
// and the extracted source text read-only, plus two placeholder panels that
// later tickets (04: analysis, 10: Q&A) replace without touching this file.
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: document } = await supabase
    .from("documents")
    .select("id, file_name, extracted_text, analysis_result, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<DocumentRow>();

  if (!document) {
    notFound();
  }

  const uploadedAt = new Date(document.created_at).toLocaleString();

  return (
    <div className="document-shell">
      <div>
        <p className="ledger-ref tabular">§ DOCUMENT</p>
        <h1 className="document-title">{document.file_name}</h1>
        <p className="document-meta">Uploaded {uploadedAt}</p>
      </div>

      <section className="tape">
        <p className="tape-label">SOURCE TEXT</p>
        <div className="tape-body document-tape-body">{document.extracted_text}</div>
      </section>

      <div className="document-panels">
        <AnalysisPanel documentId={document.id} analysisResult={document.analysis_result} />
        <QABox documentId={document.id} />
      </div>
    </div>
  );
}
