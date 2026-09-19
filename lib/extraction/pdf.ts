/**
 * Client-side PDF text extraction, via `pdfjs-dist`.
 *
 * This must only ever run in the browser: the whole point is that the raw
 * PDF bytes never leave the user's device, only the text pulled out of it.
 * `pdfjs-dist` is loaded with a dynamic `import()` (rather than a top-level
 * import) so this module has no side effect when it's merely imported by a
 * Client Component that also gets server-rendered for its initial HTML.
 */

export type PdfExtractionResult = {
  text: string;
  pageCount: number;
};

export async function extractPdfText(file: File): Promise<PdfExtractionResult> {
  const pdfjsLib = await import("pdfjs-dist");

  // pdf.js runs its parser on a background worker. Point it at the worker
  // script that ships inside the installed `pdfjs-dist` version, so the two
  // always stay in lockstep with whatever version is in package.json.
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
  }

  await loadingTask.destroy();

  return {
    text: pageTexts.join("\n\n"),
    pageCount,
  };
}
