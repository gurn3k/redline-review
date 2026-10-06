"use client";

import { useState, useTransition, type FormEvent } from "react";
import { QAEntry } from "@/app/components/qa-entry";
import { answerQuestionAction } from "./answer-question-action";
import type { Answer } from "@/lib/qa/types";

// Copy in this file has been run through the humanizer skill.

const HEADING = "Ask about this contract";
const INTRO =
  "Redline answers only from this document's own text. If the text doesn't cover it, it says so.";
const BUTTON_IDLE_LABEL = "Ask";
const BUTTON_PENDING_LABEL = "Asking…";

interface QAHistoryEntry {
  id: string;
  question: string;
  result: Answer;
}

// Keeps a client-side, per-page-load history of asked questions; nothing is
// persisted. Each answer routes through `answerQuestionAction` ->
// `answerFromDocument`, a seam independent of `analyzeDocument`.
export function QABox({ documentId }: { documentId: string }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAHistoryEntry[]>([]);
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
    <section className="panel qa-panel">
      <h2 className="panel-title">{HEADING}</h2>
      <p className="panel-intro">{INTRO}</p>

      <form onSubmit={handleSubmit} className="qa-form">
        <label className="sr-only" htmlFor="qa-question">
          Your question
        </label>
        <input
          id="qa-question"
          name="question"
          type="text"
          required
          className="input"
          placeholder="e.g. Can I cancel before the renewal date?"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={isPending}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending || question.trim().length === 0}
        >
          {isPending ? BUTTON_PENDING_LABEL : BUTTON_IDLE_LABEL}
        </button>
      </form>
      {error ? (
        <p className="message message-error" role="alert">
          {error}
        </p>
      ) : null}

      {history.length > 0 ? (
        <div className="qa-history">
          {[...history].reverse().map((entry) => (
            <QAEntry key={entry.id} question={entry.question} result={entry.result} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
