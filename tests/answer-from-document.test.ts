import { describe, expect, it } from "vitest";
import { answerFromDocument } from "@/lib/qa/answer-from-document";
import { createStubModelClient } from "./helpers/stub-model-client";

const SAMPLE_DOCUMENT = `This Agreement is entered into by Acme Vendor LLC and the Customer. Provider shall invoice Customer monthly in arrears. Customer shall indemnify Provider against ordinary claims arising from Customer's own negligence. This Agreement automatically renews for successive one-year terms unless either party gives 90 days' written notice.`;

describe("answerFromDocument", () => {
  it("returns a grounded answer with its supporting quote when the quote is a real substring of the document", async () => {
    const supportingQuote =
      "This Agreement automatically renews for successive one-year terms unless either party gives 90 days' written notice.";

    const stub = createStubModelClient({
      grounded: true,
      answer: "Yes, this contract automatically renews unless you give 90 days' notice.",
      supportingQuote,
    });

    const result = await answerFromDocument(SAMPLE_DOCUMENT, "Does this contract auto-renew?", stub);

    expect(result.grounded).toBe(true);
    expect(result.supportingQuote).toBe(supportingQuote);
    expect(result.answer).toBe("Yes, this contract automatically renews unless you give 90 days' notice.");
  });

  it("downgrades a grounded claim with a fabricated quote to an ungrounded decline", async () => {
    const stub = createStubModelClient({
      grounded: true,
      answer: "Yes, this contract auto-renews.",
      supportingQuote: "this sentence is not in the document",
    });

    const result = await answerFromDocument(SAMPLE_DOCUMENT, "Does this contract auto-renew?", stub);

    expect(result.grounded).toBe(false);
    expect(result.supportingQuote).toBeUndefined();
    expect(result.answer).not.toBe("Yes, this contract auto-renews.");
    expect(result.answer.length).toBeGreaterThan(0);
  });

  it("passes through the model's own decline when it says the document doesn't answer the question", async () => {
    const stub = createStubModelClient({
      grounded: false,
      answer: "The document doesn't say anything about that.",
    });

    const result = await answerFromDocument(SAMPLE_DOCUMENT, "What's the CEO's home address?", stub);

    expect(result.grounded).toBe(false);
    expect(result.answer).toBe("The document doesn't say anything about that.");
    expect(result.supportingQuote).toBeUndefined();
  });

  it("throws a QAError when the model response has a malformed grounded field", async () => {
    const stub = createStubModelClient({
      grounded: "yes", // wrong type — must not be coerced
      answer: "This shouldn't be trusted.",
    });

    await expect(answerFromDocument(SAMPLE_DOCUMENT, "Does this auto-renew?", stub)).rejects.toThrow();
  });

  it("throws a QAError when the model response is missing the grounded field entirely", async () => {
    const stub = createStubModelClient({
      answer: "This shouldn't be trusted either.",
    });

    await expect(answerFromDocument(SAMPLE_DOCUMENT, "Does this auto-renew?", stub)).rejects.toThrow();
  });
});
