"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { extractPdfText } from "@/lib/extraction/pdf";
import { extractPlainText } from "@/lib/extraction/text-file";
import { evaluateExtractedText } from "@/lib/extraction/validate";
import { createDocument } from "../documents/actions";

// Copy in this file has been run through the humanizer skill.
const NO_FILE_MESSAGE = "Choose a PDF or .txt file first.";
const UNSUPPORTED_TYPE_MESSAGE =
  "Redline only reads PDF and .txt files right now. Save the document in one of those formats and try again.";
const GENERIC_EXTRACTION_ERROR =
  "We couldn't reliably extract text from this file. Try exporting it again, or upload a different copy.";
const NO_TEXT_LAYER_ERROR =
  "This looks like a scanned document with no text layer, so there's no text to pull out. You'll need a proper digital copy: a PDF with selectable text, not a photo or scan.";

type Stage = "idle" | "reading" | "saving";

// Owned by ticket 02 (upload and text extraction). home/page.tsx imports
// this component as-is with no props.
export function DocumentIntakeCard() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = stage !== "idle" || isPending;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError(NO_FILE_MESSAGE);
      return;
    }

    const extension = file.name.toLowerCase().split(".").pop() ?? "";
    const isPdf = extension === "pdf" || file.type === "application/pdf";
    const isTxt = extension === "txt" || file.type === "text/plain";

    if (!isPdf && !isTxt) {
      setError(UNSUPPORTED_TYPE_MESSAGE);
      return;
    }

    setStage("reading");

    try {
      let text: string;
      let hasPages = false;

      if (isPdf) {
        const extracted = await extractPdfText(file);
        text = extracted.text;
        hasPages = extracted.pageCount > 0;
      } else {
        text = await extractPlainText(file);
      }

      const outcome = evaluateExtractedText({
        text,
        fileSizeBytes: file.size,
        hasPages,
      });

      if (!outcome.ok) {
        setError(outcome.reason === "no-text-layer" ? NO_TEXT_LAYER_ERROR : GENERIC_EXTRACTION_ERROR);
        setStage("idle");
        return;
      }

      setStage("saving");
      const fileName = file.name;
      const extractedText = outcome.text;

      startTransition(async () => {
        const result = await createDocument({ fileName, extractedText });
        // A successful save redirects from inside the action and never
        // returns, so reaching this line means it failed.
        setError(result.message);
        setStage("idle");
      });
    } catch {
      setError(GENERIC_EXTRACTION_ERROR);
      setStage("idle");
    }
  }

  return (
    <section className="intake-card">
      <p className="ledger-ref tabular">§ INTAKE</p>
      <h1 className="intake-heading">Upload a document to begin</h1>
      <p className="intake-body">
        Upload the contract, lease, or agreement you&rsquo;re about to sign. Redline reads it in
        your browser, so the file itself never reaches our servers: only the text does.
      </p>

      <form className="intake-form" onSubmit={handleSubmit}>
        <div className="intake-file-row">
          <input
            ref={fileInputRef}
            id="document-file"
            name="document-file"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="sr-only"
            onChange={handleFileChange}
            disabled={busy}
          />
          <label htmlFor="document-file" className="cta cta-small intake-file-label">
            Choose file
          </label>
          <span className="intake-file-name tabular">{file ? file.name : "No file chosen"}</span>
        </div>

        <p className="intake-hint">Accepts PDF and .txt files.</p>

        {error ? (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="cta cta-large intake-submit" disabled={busy || !file}>
          {stage === "reading" ? "Reading document…" : busy ? "Saving…" : "Extract and save"}
        </button>
      </form>
    </section>
  );
}
