import Link from "next/link";
import { HeroLedger } from "./components/hero-ledger";

const CLAUSE_INDEX = [
  {
    ref: "§ PG",
    name: "Personal guarantee",
    note: "checked for uncapped personal exposure — with a drafted counter-offer",
  },
  {
    ref: "§ IND",
    name: "Indemnification",
    note: "checked for uncapped or “any and all claims” exposure — with a drafted counter-offer",
  },
  {
    ref: "§ AR",
    name: "Auto-renewal",
    note: "checked for price escalation and short cancellation windows — with a drafted counter-offer",
  },
  {
    ref: "§ UT",
    name: "Unilateral termination",
    note: "checked for no-cause, no-cure-period exits — with a drafted counter-offer",
  },
  {
    ref: "§ ARB",
    name: "Arbitration & class-action waiver",
    note: "flagged when present, generic detection only",
  },
  {
    ref: "§ LC",
    name: "Liability cap & fee escalators",
    note: "flagged when present, generic detection only",
  },
];

export default function Home() {
  return (
    <div className="page">
      <header className="nav">
        <span className="wordmark">REDLINE</span>
        <Link href="/app" className="cta cta-small">
          Try it on a document
        </Link>
      </header>

      <main>
        <section className="hero">
          <h1 className="hero-heading">
            Every flag ties back to the exact sentence it came from.
          </h1>
          <p className="hero-sub">
            Upload the contract someone else wrote before you sign it. Redline reads it, ranks
            what&rsquo;s risky, and shows you the line each ranking rests on.
          </p>
          <HeroLedger />
        </section>

        <section className="mechanism measure">
          <h2>If we can&rsquo;t point to the sentence, we don&rsquo;t show the flag.</h2>
          <p>
            Every flag Redline shows carries the exact sentence it came from, taken word for word
            from your document. If a candidate flag can&rsquo;t be tied to real text, it&rsquo;s
            dropped before you ever see it — not shown with a hedge, not softened into a
            &ldquo;possible risk.&rdquo; A flag is either backed by your own document, or it
            doesn&rsquo;t appear.
          </p>
        </section>

        <section className="clause-index measure">
          <h2>What gets checked</h2>
          <ol className="ledger-list">
            {CLAUSE_INDEX.map((item) => (
              <li key={item.ref} className="ledger-row">
                <span className="ledger-ref tabular">{item.ref}</span>
                <span className="ledger-name">{item.name}</span>
                <span className="ledger-note">{item.note}</span>
              </li>
            ))}
          </ol>
          <p className="clause-index-footnote">
            Plus your own red lines — terms you add yourself get checked with the same rigor as
            the standard list above. Nothing trips a flag, and Redline says so explicitly, naming
            what it checked.
          </p>
        </section>

        <section className="constraints measure">
          <h2>What Redline won&rsquo;t do</h2>
          <ul className="constraints-list">
            <li>It won&rsquo;t tell you whether to sign, or what a court would decide.</li>
            <li>
              It won&rsquo;t work from a scanned or photographed page. If there&rsquo;s no real
              text underneath, it says so instead of guessing.
            </li>
            <li>
              It only reviews paper someone else is asking you to sign — not agreements you draft
              yourself.
            </li>
          </ul>
        </section>

        <section className="final-cta measure">
          <h2>Read it before you sign it.</h2>
          <Link href="/app" className="cta cta-large">
            Try it on a document
          </Link>
        </section>
      </main>

      <footer className="footer">
        <p>
          Redline explains what&rsquo;s in your document and how it compares to typical terms.
          It is not a lawyer, and it does not tell you whether to sign.
        </p>
      </footer>
    </div>
  );
}
