import Link from "next/link";
import { AnalysisWorkspace } from "./components/analysis-workspace";
import { SiteHeader } from "./components/site-header";
import { SAMPLE } from "@/lib/sample";

// Copy in this file has been run through the humanizer skill.

const REPO = "https://github.com/gurn3k/redline-review";

const CHECKS = [
  {
    name: "Personal guarantee",
    note: "Whether you're on the hook yourself if the business can't pay, and for how much.",
  },
  {
    name: "Indemnification",
    note: "Whether you'd cover the other side's losses, even ones they caused.",
  },
  {
    name: "Auto-renewal",
    note: "Renewals that lock you in, raise the price, or need notice months ahead.",
  },
  {
    name: "Unilateral termination",
    note: "Whether they can walk away at any time while you can't.",
  },
  {
    name: "Arbitration and class-action waivers",
    note: "Flagged when present, so you know you're giving up court.",
  },
  {
    name: "Liability caps and fee escalators",
    note: "Flagged when present: limits on what they owe you, and built-in price rises.",
  },
];

const BUILD_STEPS = [
  { label: "Research", text: "Four research passes on who has this problem and what already exists." },
  { label: "Spec", text: "A product spec and ten decision records, written before any code." },
  { label: "Tests", text: "Contracts with planted clauses and known answers, checked on every change." },
  { label: "Live test", text: "An adversarial test of the deployed site, and a security review." },
];

export default function Home() {
  return (
    <div className="page">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="container">
            <p className="eyebrow">Contract review for small business owners</p>
            <h1 className="hero-title">
              Know what you&rsquo;re signing <em>before</em> you sign it.
            </h1>
            <p className="hero-lede">
              Redline reads the vendor agreements, equipment contracts and commercial leases you
              get handed, ranks what&rsquo;s risky, and drafts what to ask for instead. Every flag
              shows the exact sentence it came from. If Redline can&rsquo;t point to the sentence,
              it doesn&rsquo;t show the flag.
            </p>
            <div className="actions">
              <Link href="/sample" className="btn btn-primary btn-large">
                See a sample analysis
              </Link>
              <Link href="/login" className="btn btn-ghost btn-large">
                Try it on your contract
              </Link>
            </div>
            <p className="byline">
              Built by Gurnek Khaira with AI coding agents · <a href={REPO}>Source on GitHub</a>
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">A real review, unedited</p>
              <h2 className="section-title">A refrigeration service contract, the way a caf&eacute; owner would get it</h2>
              <p className="section-lede">
                Select a flag to see its sentence in the contract, or select a highlighted
                sentence to see its flag.
              </p>
            </div>
            <AnalysisWorkspace
              documentText={SAMPLE.documentText}
              result={SAMPLE.analysis}
              showRedLinesLink={false}
            />
            <p className="section-foot">
              <Link href="/sample">Open the full sample, with its summary and questions →</Link>
            </p>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container two-col">
            <div>
              <h2 className="section-title">What Redline checks</h2>
              <p className="section-lede">
                Six clause types checked on every contract, plus your own red lines:
                terms you won&rsquo;t accept, checked with the same rigor. When nothing clears the
                bar, Redline says so and lists what it checked.
              </p>
            </div>
            <ul className="check-grid">
              {CHECKS.map((check) => (
                <li key={check.name}>
                  <strong>{check.name}</strong>
                  <span>{check.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container two-col">
            <div>
              <h2 className="section-title">What Redline won&rsquo;t do</h2>
            </div>
            <ul className="limits">
              <li>Tell you whether to sign, or what a court would decide. It isn&rsquo;t legal advice.</li>
              <li>Read a scanned or photographed page. With no real text underneath, it says so instead of guessing.</li>
              <li>Review agreements you drafted yourself. It&rsquo;s for paper someone else hands you.</li>
            </ul>
          </div>
        </section>

        <section className="section section-alt" id="how-it-was-built">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">How it was built</h2>
              <p className="section-lede">
                Built by AI coding agents, directed from a product spec. Every step is written up
                in the repository.
              </p>
            </div>
            <ol className="build-steps">
              {BUILD_STEPS.map((step) => (
                <li key={step.label}>
                  <strong>{step.label}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
            <p className="section-foot">
              <a href={REPO}>Read the spec, decisions and test reports on GitHub →</a>
            </p>
          </div>
        </section>

        <section className="closing container">
          <h2>Read it before you sign it.</h2>
          <div className="actions">
            <Link href="/sample" className="btn btn-primary btn-large">
              See a sample analysis
            </Link>
            <Link href="/login" className="btn btn-ghost btn-large">
              Try it on your contract
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
