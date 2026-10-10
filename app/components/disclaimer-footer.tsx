import Link from "next/link";
import { MakerMark } from "./maker-mark";
import { Wordmark } from "./wordmark";

// Who built Redline. One place to change it. The copyright holder matches
// LICENSE.
const OWNER = "Gurnek Khaira";
const CREDIT = { label: "Built by gurn3k", href: "https://www.gurn3k.com" };

// Positioning copy per docs/adr/0010-upl-disclaimer-and-positioning.md — Redline
// is document literacy, not legal advice. Rendered once here, in the root
// layout, so every page (including this bare shell) carries it without each
// later ticket having to re-author it.
//
// Signed-in pages get a slim version: the (app) layout marks its shell with
// .app-shell, and the CSS hides the brand row and shrinks the band there.
export function DisclaimerFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <Wordmark href="/" tone="inverse" />
          <nav className="footer-nav" aria-label="Footer">
            <Link href="/sample">Sample analysis</Link>
            <Link href="/#how-it-was-built">How it was built</Link>
            <Link href="/login">Try it</Link>
          </nav>
        </div>
        <div className="footer-body">
          <p className="footer-disclaimer">
            Redline explains what your document says and points out patterns,
            each tied to the sentence it came from. It isn&rsquo;t legal advice,
            it isn&rsquo;t a lawyer, and it doesn&rsquo;t decide whether a
            clause is enforceable or whether you should sign.
          </p>
          <p className="footer-meta">
            <span>&copy; 2026 {OWNER}</span>
            <a
              href={CREDIT.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit"
              aria-label={CREDIT.label}
            >
              Built by
              <MakerMark />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
