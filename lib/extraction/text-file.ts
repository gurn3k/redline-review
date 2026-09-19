/**
 * Reads a plain `.txt` file's contents in the browser. No dependency needed
 * — `File` already implements the `Blob` `.text()` method.
 */
export async function extractPlainText(file: File): Promise<string> {
  return file.text();
}
