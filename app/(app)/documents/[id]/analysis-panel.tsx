"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { InkGrainFilter, Perforation, StampBadge } from "@/app/components/stamp-badge";
import { analyzeDocumentAction } from "./analyze-action";
import type { AnalysisResult, ClauseCategory, ClearState, Flag } from "@/lib/analysis/types";

// Copy in this file has been run through the humanizer skill.

const CATEGORY_LABELS: Record<Exclude<ClauseCategory, "red-line">, string> = {
  "personal-guarantee": "Personal guarantee",
  indemnification: "Indemnification",
  "auto-renewal": "Auto-renewal",
  "unilateral-termination": "Unilateral termination",
  "arbitration-class-action-waiver": "Arbitration / class-action waiver",
  "liability-cap-fee-escalator": "Liability cap / fee escalator",
};

const IDLE_HEADING = "Ready when you are";
const IDLE_BODY =
  "Run the risk read against your red lines and get a plain-English summary of this document.";
const PENDING_HEADING = "Running the risk read";
const PENDING_BODY =
  "Checking this document against your red lines. This can take a few moments.";
const BUTTON_IDLE_LABEL = "Analyze this document";
const BUTTON_PENDING_LABEL = "Analyzing…";

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.summary === "string" && Array.isArray(record.flags);
}

function flagTitle(flag: Flag): string {
  if (flag.category === "red-line") {
    return flag.redLineText ? `Your red line: “${flag.redLineText}”` : "Your red line";
  }
  return CATEGORY_LABELS[flag.category];
}

// Runs and renders `analyzeDocument`'s output for one document. Ticket 11
// (document library / persistence) will start passing an already-saved
// `analysisResult` for some documents — the first branch below already
// handles that case, so this file shouldn't need to change for it. Keep
// this file's exported signature stable — documents/[id]/page.tsx imports
// it as-is.
export function AnalysisPanel({
  documentId,
  analysisResult,
}: {
  documentId: string;
  analysisResult: unknown;
}) {
  const initialResult = isAnalysisResult(analysisResult) ? analysisResult : null;
  const [result, setResult] = useState<AnalysisResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAnalysis() {
    setError(null);
    startTransition(async () => {
      const outcome = await analyzeDocumentAction(documentId);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      setResult(outcome.result);
    });
  }

  return (
    <section className="register-card analysis-panel">
      <p className="ledger-ref tabular">§ ANALYSIS</p>

      {result ? (
        <AnalysisResultView result={result} />
      ) : (
        <>
          <h2 className="register-heading">{isPending ? PENDING_HEADING : IDLE_HEADING}</h2>
          <p className="register-body">{isPending ? PENDING_BODY : IDLE_BODY}</p>
          {error ? (
            <p className="auth-message auth-message-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            className="cta cta-small analysis-cta"
            onClick={runAnalysis}
            disabled={isPending}
          >
            {isPending ? BUTTON_PENDING_LABEL : BUTTON_IDLE_LABEL}
          </button>
        </>
      )}
    </section>
  );
}

function AnalysisResultView({ result }: { result: AnalysisResult }) {
  return (
    <div className="analysis-result">
      <InkGrainFilter />
      <p className="counter-label analysis-label">SUMMARY</p>
      <p className="register-body analysis-summary">{result.summary}</p>

      {result.clear ? (
        <ClearBlock clear={result.clear} />
      ) : (
        <div className="confirmations analysis-confirmations">
          {result.flags.map((flag, index) => (
            <FlagCard key={`${flag.category}-${index}`} flag={flag} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlagCard({ flag }: { flag: Flag }) {
  const tier = flag.severity === "Dangerous" ? "dangerous" : "unusual";
  return (
    <div className={`confirmation ${tier}`}>
      <div className="confirmation-head">
        <StampBadge tier={tier} label={flag.severity.toUpperCase()} />
      </div>
      <p className="confirmation-title">{flagTitle(flag)}</p>
      <p className="confirmation-citation">&ldquo;{flag.citation}&rdquo;</p>
      <p className="register-body analysis-explanation">{flag.explanation}</p>
      {flag.counterOffer.trim().length > 0 ? (
        <>
          <Perforation orientation="horizontal" />
          <p className="confirmation-counter">
            <span className="counter-label">Example language to propose</span> {flag.counterOffer}
          </p>
        </>
      ) : null}
    </div>
  );
}

function ClearBlock({ clear }: { clear: ClearState }) {
  const hasCategories = clear.checkedStandardCategories.length > 0;
  const hasRedLines = clear.checkedRedLines.length > 0;

  let headline: string;
  if (hasCategories && hasRedLines) {
    headline = "No Dangerous or Unusual clauses found against your red lines and Redline's standard clause set.";
  } else if (hasRedLines) {
    headline = "No Dangerous or Unusual clauses found against your red lines.";
  } else if (hasCategories) {
    headline = "No Dangerous or Unusual clauses found against Redline's standard clause set.";
  } else {
    headline = "Nothing here to check yet.";
  }

  return (
    <div className="confirmation clear analysis-clear">
      <div className="confirmation-head">
        <StampBadge tier="clear" label="CLEAR" />
      </div>
      <p className="confirmation-title">{headline}</p>

      {!hasCategories && (
        <p className="register-body analysis-clear-note">
          Redline&rsquo;s standard clause set isn&rsquo;t live in this build yet, so it wasn&rsquo;t part of
          this check.
        </p>
      )}

      {hasRedLines ? (
        <>
          <p className="counter-label analysis-label">RED LINES CHECKED</p>
          <ul className="analysis-clear-list">
            {clear.checkedRedLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="register-body analysis-clear-note">
          You haven&rsquo;t added any red lines yet, so none were checked either.{" "}
          <Link href="/red-lines" className="register-cta">
            Add a red line
          </Link>
        </p>
      )}

      {hasCategories ? (
        <>
          <p className="counter-label analysis-label">STANDARD CATEGORIES CHECKED</p>
          <ul className="analysis-clear-list">
            {clear.checkedStandardCategories.map((category) => (
              <li key={category}>{CATEGORY_LABELS[category as Exclude<ClauseCategory, "red-line">]}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
