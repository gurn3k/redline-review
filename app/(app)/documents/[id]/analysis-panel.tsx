// Placeholder owned by ticket 02, replaced by ticket 04 (analyzeDocument
// seam + Clear baseline). Keep this file's exported signature stable —
// documents/[id]/page.tsx imports it as-is and should not need to change
// when ticket 04 fills this in for real.
export function AnalysisPanel({
  documentId,
  analysisResult,
}: {
  documentId: string;
  analysisResult: unknown;
}) {
  void documentId;

  if (analysisResult != null) {
    // Ticket 04 replaces this branch with the real summary/flags/Clear
    // render. Nothing renders here yet on purpose.
    return null;
  }

  return (
    <section className="register-card">
      <p className="ledger-ref tabular">§ ANALYSIS</p>
      <h2 className="register-heading">Analysis is coming soon</h2>
      <p className="register-body">
        We haven&rsquo;t built the risk read yet. Once we do, your summary, flags, and
        counter-offers will show up right here.
      </p>
    </section>
  );
}
