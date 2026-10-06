import type { Answer } from "@/lib/qa/types";

// One question and its answer. Shared by the live Q&A box and the stored
// examples on /sample.
export function QAEntry({ question, result }: { question: string; result: Answer }) {
  return (
    <div className="qa-entry">
      <p className="qa-question">{question}</p>
      {result.grounded ? (
        <>
          <p className="qa-answer">{result.answer}</p>
          <blockquote className="flag-quote qa-quote">{result.supportingQuote}</blockquote>
        </>
      ) : (
        <>
          <p className="list-label">Not in the document</p>
          <p className="qa-answer qa-declined">{result.answer}</p>
        </>
      )}
    </div>
  );
}
