"use client";

import { useState, useTransition } from "react";
import { AnalysisOverview } from "@/app/components/analysis-overview";
import { AnalysisWorkspace } from "@/app/components/analysis-workspace";
import { analyzeDocumentAction } from "./analyze-action";
import type { AnalysisResult } from "@/lib/analysis/types";

// Copy in this file has been run through the humanizer skill.

const IDLE_BODY =
  "Run the review to get a plain-English summary and every risky clause, each tied to its sentence, checked against your red lines too.";
const PENDING_BODY = "Reading the contract and checking it against your red lines. This takes a few moments.";
const BUTTON_IDLE_LABEL = "Review this contract";
const BUTTON_PENDING_LABEL = "Reviewing…";

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.summary === "string" && Array.isArray(record.flags);
}

// One document's analysis: the overview, then flags beside the contract.
// A saved analysis renders straight away and never re-runs; a document that
// hasn't been analyzed shows its text with a button to run the review.
export function AnalysisPanel({
  documentId,
  fileName,
  uploadedLabel,
  documentText,
  analysisResult,
}: {
  documentId: string;
  fileName: string;
  uploadedLabel: string;
  documentText: string;
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
    <>
      <AnalysisOverview title={fileName} meta={`Uploaded ${uploadedLabel}`} result={result}>
        {result ? null : (
          <div className="run-review">
            <p className="overview-summary">{isPending ? PENDING_BODY : IDLE_BODY}</p>
            {error ? (
              <p className="message message-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={runAnalysis} disabled={isPending}>
              {isPending ? BUTTON_PENDING_LABEL : BUTTON_IDLE_LABEL}
            </button>
          </div>
        )}
      </AnalysisOverview>

      {result ? (
        <AnalysisWorkspace documentText={documentText} result={result} />
      ) : (
        <article className="doc-paper doc-paper-solo" aria-label="The contract">
          <p className="doc-label">The contract</p>
          <div className="doc-text">{documentText}</div>
        </article>
      )}
    </>
  );
}
