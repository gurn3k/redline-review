import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentIntakeCard } from "@/app/(app)/home/document-intake-card";

// A render-without-crashing smoke test. It does not simulate a file upload
// (that needs a real browser and pdf.js's worker, exercised manually via
// `next dev` instead — see BUILD-REPORT.md) but it does catch the class of
// bug where the component throws during render before a user ever gets a
// chance to interact with it.
describe("DocumentIntakeCard", () => {
  it("renders the upload screen without crashing", () => {
    const markup = renderToStaticMarkup(<DocumentIntakeCard />);
    expect(markup).toContain("Upload a document to begin");
    expect(markup).toContain("Choose file");
    expect(markup).toContain("No file chosen");
  });
});
