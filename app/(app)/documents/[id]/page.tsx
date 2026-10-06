import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalysisPanel } from "./analysis-panel";
import { QABox } from "./qa-box";
import { formatDate } from "@/lib/analysis/labels";

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

// One stored document: its analysis (or a button to run one) beside the
// contract text, then the Q&A box.
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

  return (
    <div className="document-page">
      <AnalysisPanel
        documentId={document.id}
        fileName={document.file_name}
        uploadedLabel={formatDate(document.created_at)}
        documentText={document.extracted_text}
        analysisResult={document.analysis_result}
      />
      <QABox documentId={document.id} />
    </div>
  );
}
