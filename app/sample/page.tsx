import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisOverview } from "@/app/components/analysis-overview";
import { AnalysisWorkspace } from "@/app/components/analysis-workspace";
import { QAEntry } from "@/app/components/qa-entry";
import { SiteHeader } from "@/app/components/site-header";
import { formatDate } from "@/lib/analysis/labels";
import { SAMPLE } from "@/lib/sample";

export const metadata: Metadata = {
  title: "Sample analysis — Redline",
  description:
    "A real, unedited Redline review of a small business's refrigeration service contract: every risky clause tied to the exact sentence it came from.",
};

// Public, read-only, no model call: renders the stored sample from
// lib/sample with the same components a signed-in reader gets.
export default function SamplePage() {
  const generated = formatDate(SAMPLE.generatedAt);

  return (
    <div className="page">
      <SiteHeader />
      <main className="container app-main">
        <div className="sample-banner" role="note">
          <strong>Sample contract.</strong> Coldline Refrigeration is a made-up company, and this
          is the kind of service contract a restaurant or caf&eacute; gets handed. The review below
          is Redline&rsquo;s real output, unedited, generated {generated}. One red line was set
          for it: &ldquo;{SAMPLE.redLines.join("; ")}&rdquo;
        </div>

        <AnalysisOverview
          title="Equipment service agreement"
          meta={`Coldline Refrigeration Services, Inc. · reviewed ${generated}`}
          result={SAMPLE.analysis}
        />
        <AnalysisWorkspace
          documentText={SAMPLE.documentText}
          result={SAMPLE.analysis}
          showRedLinesLink={false}
        />

        <section className="panel qa-panel">
          <h2 className="panel-title">Questions asked about this contract</h2>
          <p className="panel-intro">
            Redline answers only from the document. When the text doesn&rsquo;t cover something,
            it says so instead of guessing.
          </p>
          <div className="qa-history">
            {SAMPLE.qa.map((entry) => (
              <QAEntry key={entry.question} question={entry.question} result={entry} />
            ))}
          </div>
        </section>

        <section className="closing">
          <h2>Have a contract on your desk?</h2>
          <p>Upload a PDF or text file and get the same review of your own paper.</p>
          <div className="actions">
            <Link href="/login" className="btn btn-primary btn-large">
              Try it on your contract
            </Link>
            <a href="https://github.com/gurn3k/redline-review" className="btn btn-ghost btn-large">
              How it was built
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
