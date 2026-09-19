import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Redline",
};

// Per .impeccable/surfaces/app-shell.md: the authenticated home is a
// document intake surface (paste or upload) foregrounded, with red lines and
// the library reachable as clearly labeled adjacent registers. None of that
// functionality is built yet (tickets 02/03/11) — this is shell and layout
// only, so those tickets can fill these cards in without fighting this
// structure.
export default function HomePage() {
  return (
    <div className="home-shell">
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

      <div className="registers">
        <section className="register-card">
          <p className="ledger-ref tabular">§ RED LINES</p>
          <h2 className="register-heading">Your red lines</h2>
          <p className="register-body">
            Your personal list of dealbreakers will live here and drive what
            Redline flags.
          </p>
        </section>

        <section className="register-card">
          <p className="ledger-ref tabular">§ LIBRARY</p>
          <h2 className="register-heading">Library</h2>
          <p className="register-body">
            Documents you&rsquo;ve reviewed will be saved here so you can
            revisit them.
          </p>
        </section>
      </div>
    </div>
  );
}
