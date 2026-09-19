"use client";

import { useRef, useState, useTransition } from "react";
import { addRedLine } from "./actions";

export function AddRedLineForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addRedLine(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="redline-form">
      <label className="auth-label" htmlFor="new-red-line">
        Add a red line
      </label>
      <textarea
        id="new-red-line"
        name="text"
        required
        rows={2}
        className="auth-input redline-textarea"
        placeholder="e.g. No personal guarantee, under any circumstances."
      />
      {error ? (
        <p className="auth-message auth-message-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="cta cta-small redline-submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add red line"}
      </button>
    </form>
  );
}
