/**
 * Quality gate for extracted document text. Runs after client-side
 * extraction (PDF or .txt) and before anything is persisted or analyzed.
 *
 * Two distinct failure reasons, per the product decision that a scanned
 * (no-text-layer) document gets a different message than any other
 * extraction failure:
 *
 * - "no-text-layer": the file has pages (it's a real PDF) but pdf.js pulled
 *   out ~nothing — the classic signature of a scanned image with no text
 *   layer, not a parsing bug.
 * - "unreliable": empty, far too short for the file's size, or mostly
 *   control/replacement characters (garbled).
 */

const MIN_TRIMMED_LENGTH = 20;
const NO_TEXT_LAYER_THRESHOLD = 20;
const GARBLED_CHAR_RATIO = 0.05;
const REPLACEMENT_CHAR = "�";
// Below this file size, the size-ratio check is skipped — a short but
// genuine document (e.g. a one-page notice) shouldn't be flagged just for
// being a small file.
const SIZE_RATIO_CHECK_FLOOR_BYTES = 20_000;
const MIN_CHARS_PER_BYTE = 0.002;

export type ExtractionOutcome =
  | { ok: true; text: string }
  | { ok: false; reason: "no-text-layer" }
  | { ok: false; reason: "unreliable" };

export function evaluateExtractedText(params: {
  text: string;
  fileSizeBytes: number;
  /** True when the source had at least one page (i.e. it's a PDF). */
  hasPages?: boolean;
}): ExtractionOutcome {
  const trimmed = params.text.trim();

  if (params.hasPages && trimmed.length < NO_TEXT_LAYER_THRESHOLD) {
    return { ok: false, reason: "no-text-layer" };
  }

  if (trimmed.length < MIN_TRIMMED_LENGTH) {
    return { ok: false, reason: "unreliable" };
  }

  let badChars = 0;
  for (const char of trimmed) {
    const code = char.codePointAt(0) ?? 0;
    const isControlChar = code < 32 && char !== "\n" && char !== "\r" && char !== "\t";
    if (isControlChar || char === REPLACEMENT_CHAR) {
      badChars += 1;
    }
  }
  if (badChars / trimmed.length > GARBLED_CHAR_RATIO) {
    return { ok: false, reason: "unreliable" };
  }

  if (
    params.fileSizeBytes > SIZE_RATIO_CHECK_FLOOR_BYTES &&
    trimmed.length < params.fileSizeBytes * MIN_CHARS_PER_BYTE
  ) {
    return { ok: false, reason: "unreliable" };
  }

  return { ok: true, text: trimmed };
}
