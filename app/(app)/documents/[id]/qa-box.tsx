"use client";

import { useState, useTransition, type FormEvent } from "react";
import { answerQuestionAction } from "./answer-question-action";
import type { Answer } from "@/lib/qa/types";

// Copy in this file has been run through the humanizer skill.

const HEADING = "Ask about this document";
const INTRO =
  "Ask a question and Redline will answer only from this document's own text. If the text doesn't cover it, it'll say so plainly.";
const EMPTY_HISTORY = "You haven't asked anything yet this session.";
const BUTTON_IDLE_LABEL = "Ask";
const BUTTON_PENDING_LABEL = "Asking…";
const DECLINED_LABEL = "NOT IN THE DOCUMENT";
const QUOTE_LABEL = "SUPPORTING QUOTE";

interface QAEntry {
  id: string;
  question: string;
  result: Answer;
}

// Replaces the placeholder from ticket 02. Keeps a client-side, per-page-load
// history of asked questions — no persistence in this ticket. Each answer
// routes through `answerQuestionAction` -> `answerFromDocument`, a seam
// independent of `analyzeDocument`. Styling reuses the existing register
// card, auth form, and confirmation/citation classes rather than adding new
// CSS. Keep this file's exported signature stable — documents/[id]/page.tsx
// imports it as-is.
export function QABox({ documentId }: { documentId: string }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length === 0) return;

    setError(null);
    startTransition(async () => {
      const outcome = await answerQuestionAction(documentId, trimmed);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      setHistory((previous) => [
        ...previous,
        { id: `${Date.now()}-${previous.length}`, question: trimmed, result: outcome.result },
      ]);
      setQuestion("");
    });
  }

  return (
    <section className="register-card qa-box">
      <p className="ledger-ref tabular">§ QUESTIONS</p>
      <h2 className="register-heading">{HEADING}</h2>
      <p className="register-body">{INTRO}</p>

      <form onSubmit={handleSubmit} className="redline-form">
        <label className="auth-label" htmlFor="qa-question">
          Your question
        </label>
        <input
          id="qa-question"
          name="question"
          type="text"
          required
          className="auth-input"
          placeholder="e.g. Can I cancel before the renewal date?"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={isPending}
        />
        {error ? (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="cta cta-small redline-submit"
          disabled={isPending || question.trim().length === 0}
        >
          {isPending ? BUTTON_PENDING_LABEL : BUTTON_IDLE_LABEL}
        </button>
      </form>

      <div className="redlines-list-wrap">
        {history.length === 0 ? (
          <p className="redlines-empty">{EMPTY_HISTORY}</p>
        ) : (
          <div className="redlines-list">
            {[...history].reverse().map((entry) => (
              <QAEntryView key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function QAEntryView({ entry }: { entry: QAEntry }) {
  const { question, result } = entry;

  return (
    <div className="redline-row">
      <p className="redline-text">{question}</p>
      {result.grounded ? (
        <>
          <p className="register-body">{result.answer}</p>
          <p className="counter-label">{QUOTE_LABEL}</p>
          <p className="confirmation-citation">&ldquo;{result.supportingQuote}&rdquo;</p>
        </>
      ) : (
        <>
          <p className="counter-label">{DECLINED_LABEL}</p>
          <p className="redlines-empty">{result.answer}</p>
        </>
      )}
    </div>
  );
}
