// Owned by ticket 02 (upload and text extraction). Replace this placeholder
// with the real paste/upload intake surface — home/page.tsx imports this
// component as-is and should not need to change.
export function DocumentIntakeCard() {
  return (
    <section className="intake-card">
      <p className="ledger-ref tabular">§ INTAKE</p>
      <h1 className="intake-heading">Paste or upload a document to begin</h1>
      <p className="intake-body">
        Document intake is coming soon. You&rsquo;ll be able to paste text or
        upload a file here.
      </p>
      <button type="button" className="cta cta-large" disabled>
        Coming soon
      </button>
    </section>
  );
}
