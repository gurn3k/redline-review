// Positioning copy per docs/adr/0010-upl-disclaimer-and-positioning.md — Redline
// is document literacy, not legal advice. Rendered once here, in the root
// layout, so every page (including this bare shell) carries it without each
// later ticket having to re-author it.
export function DisclaimerFooter() {
  return (
    <footer className="footer">
      <p>
        Redline explains what your document says and points out patterns, each
        tied to the sentence it came from. It isn&rsquo;t legal advice, it
        isn&rsquo;t a lawyer, and it doesn&rsquo;t decide whether a clause is
        enforceable or whether you should sign.
      </p>
    </footer>
  );
}
