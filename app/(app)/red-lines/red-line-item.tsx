"use client";

import { useState, useTransition } from "react";
import { deleteRedLine, updateRedLine } from "./actions";

export type RedLine = {
  id: string;
  text: string;
};

export function RedLineItem({ redLine }: { redLine: RedLine }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateRedLine(redLine.id, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsEditing(false);
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteRedLine(redLine.id);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <li className="redline-row redline-row-editing">
        <form action={handleSave} className="redline-edit-form">
          <textarea
            name="text"
            className="input textarea"
            defaultValue={redLine.text}
            required
            rows={2}
            autoFocus
          />
          {error ? (
            <p className="message message-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="redline-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="text-button"
              disabled={isPending}
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="redline-row">
      <p className="redline-text">{redLine.text}</p>
      {error ? (
        <p className="message message-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="redline-actions">
        <button
          type="button"
          className="text-button"
          disabled={isPending}
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
        <button
          type="button"
          className="text-button text-button-danger"
          disabled={isPending}
          onClick={handleDelete}
        >
          {isPending ? "Removing…" : "Delete"}
        </button>
      </div>
    </li>
  );
}
