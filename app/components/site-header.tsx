import Link from "next/link";
import { Wordmark } from "./wordmark";

// Header for the public pages (landing, sample, sign-in). Signed-in readers
// who click "Try it" are sent on to /home by the proxy.
export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Wordmark href="/" />
        {minimal ? null : (
          <nav className="header-nav" aria-label="Main">
            <Link href="/sample">Sample analysis</Link>
            <Link href="/#how-it-was-built" className="hide-sm">
              How it was built
            </Link>
            <Link href="/login" className="btn btn-small btn-primary">
              Try it
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
