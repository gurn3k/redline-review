// Placeholder owned by ticket 02, replaced by ticket 10 (Q&A box). Keep
// this file's exported signature stable — documents/[id]/page.tsx imports
// it as-is and should not need to change when ticket 10 fills this in.
export function QABox({ documentId }: { documentId: string }) {
  void documentId;

  return (
    <section className="register-card">
      <p className="ledger-ref tabular">§ QUESTIONS</p>
      <h2 className="register-heading">Questions are coming soon</h2>
      <p className="register-body">
        You&rsquo;ll be able to ask about this document once the Q&amp;A box is built.
      </p>
    </section>
  );
}
