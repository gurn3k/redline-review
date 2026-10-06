import type { ReactNode } from "react";
import type { AnalysisResult } from "@/lib/analysis/types";
import { severityCounts } from "@/lib/analysis/labels";

// The top of an analysis: what the document is and how many flags it got,
// before any detail. Shared by /documents/[id] and /sample.
export function AnalysisOverview({
  title,
  meta,
  result,
  children,
}: {
  title: string;
  meta: string;
  result: AnalysisResult | null;
  children?: ReactNode;
}) {
  const counts = result ? severityCounts(result) : null;

  return (
    <section className="overview">
      <div className="overview-main">
        <h1 className="overview-title">{title}</h1>
        <p className="overview-meta">{meta}</p>
        {result ? <p className="overview-summary">{result.summary}</p> : null}
        {children}
      </div>
      {counts ? (
        <div className="overview-counts" aria-label="Result">
          {result?.clear ? (
            <div className="count count-clear">
              <strong>Clear</strong>
              <span>Nothing cleared the bar for a flag</span>
            </div>
          ) : (
            <>
              <div className="count count-dangerous">
                <strong>{counts.dangerous}</strong>
                <span>Dangerous</span>
              </div>
              <div className="count count-unusual">
                <strong>{counts.unusual}</strong>
                <span>Unusual</span>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
