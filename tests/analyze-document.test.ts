import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { createStubModelClient } from "./helpers/stub-model-client";

const cleanContractText = readFileSync(
  path.join(__dirname, "fixtures", "clean-contract.txt"),
  "utf-8",
);

const SAMPLE_DOCUMENT = `This Agreement is entered into by Acme Vendor LLC and the Customer. Provider shall invoice Customer monthly in arrears. Customer shall indemnify Provider against ordinary claims arising from Customer's own negligence.`;

describe("analyzeDocument", () => {
  it("drops a candidate whose citation is fabricated, keeps the one with a real citation", async () => {
    const realCitation = "Customer shall indemnify Provider against ordinary claims arising from Customer's own negligence.";
    const fabricatedCitation = "This sentence does not appear anywhere in the document text.";

    const stub = createStubModelClient({
      summary: "A vendor services agreement.",
      flags: [
        {
          category: "red-line",
          citation: realCitation,
          severity: "Dangerous",
          explanation: "This is the real, quotable clause.",
          counterOffer: "Propose removing this obligation entirely.",
          redLineText: "No indemnification of any kind.",
        },
        {
          category: "red-line",
          citation: fabricatedCitation,
          severity: "Dangerous",
          explanation: "This citation was invented by the model.",
          counterOffer: "Propose alternate language.",
          redLineText: "No fabricated clauses.",
        },
      ],
    });

    const result = await analyzeDocument(
      SAMPLE_DOCUMENT,
      ["No indemnification of any kind.", "No fabricated clauses."],
      stub,
    );

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].citation).toBe(realCitation);

    // Citation integrity checked on every flag in the result, not sampled.
    for (const flag of result.flags) {
      expect(SAMPLE_DOCUMENT.includes(flag.citation)).toBe(true);
    }
  });

  it("drops a candidate whose counter-offer contains a deny-listed word", async () => {
    const citation = "Customer shall indemnify Provider against ordinary claims arising from Customer's own negligence.";

    const stub = createStubModelClient({
      summary: "A vendor services agreement.",
      flags: [
        {
          category: "red-line",
          citation,
          severity: "Dangerous",
          explanation: "This clause is a real risk.",
          counterOffer: "This language guarantees you won't be liable for anything.",
          redLineText: "No indemnification of any kind.",
        },
      ],
    });

    const result = await analyzeDocument(SAMPLE_DOCUMENT, ["No indemnification of any kind."], stub);

    expect(result.flags).toHaveLength(0);
    expect(result.clear).not.toBeNull();
  });

  it("never produces a flag with a severity outside Dangerous/Unusual", async () => {
    const citation = "Customer shall indemnify Provider against ordinary claims arising from Customer's own negligence.";

    const stub = createStubModelClient({
      summary: "A vendor services agreement.",
      flags: [
        {
          category: "red-line",
          citation,
          severity: "Dangerous",
          explanation: "A real, plainly-stated risk.",
          counterOffer: "Propose capped liability instead.",
          redLineText: "No indemnification of any kind.",
        },
        {
          // Malformed severity from an untyped JSON parse — must be dropped,
          // never coerced into some middle tier.
          category: "red-line",
          citation,
          severity: "Possible Risk",
          explanation: "A hedged middle-tier severity that must never survive.",
          counterOffer: "Propose capped liability instead.",
          redLineText: "No hedged severities.",
        },
      ],
    });

    const result = await analyzeDocument(
      SAMPLE_DOCUMENT,
      ["No indemnification of any kind.", "No hedged severities."],
      stub,
    );

    expect(result.flags.length).toBeGreaterThan(0);
    for (const flag of result.flags) {
      expect(["Dangerous", "Unusual"]).toContain(flag.severity);
    }
  });

  it("returns an explicit Clear result naming the checked red lines when nothing is flagged", async () => {
    const redLines = ["No arbitration clauses.", "No liability caps under $1,000,000."];

    const stub = createStubModelClient({
      summary: "An ordinary marketing services agreement with market-standard terms.",
      flags: [],
    });

    // Isolated from the real global registry (which now has six categories
    // registered, per tickets 05-09) so this test keeps verifying the Clear
    // baseline mechanism itself, not any particular registry state.
    const result = await analyzeDocument(cleanContractText, redLines, stub, []);

    expect(result.flags).toEqual([]);
    expect(result.clear).not.toBeNull();
    expect(result.clear?.checkedRedLines).toEqual(redLines);
    expect(result.clear?.checkedStandardCategories).toEqual([]);
  });

  it("passes a valid red-line flag through with its category and redLineText intact", async () => {
    const citation = "Customer shall indemnify Provider against ordinary claims arising from Customer's own negligence.";
    const redLineText = "No indemnification obligations of any kind.";

    const stub = createStubModelClient({
      summary: "A vendor services agreement.",
      flags: [
        {
          category: "red-line",
          citation,
          severity: "Dangerous",
          explanation: "This clause matches a red line the user set.",
          counterOffer: "Propose removing the indemnification obligation.",
          redLineText,
        },
      ],
    });

    const result = await analyzeDocument(SAMPLE_DOCUMENT, [redLineText], stub);

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("red-line");
    expect(result.flags[0].redLineText).toBe(redLineText);
    expect(result.clear).toBeNull();
  });

  it("ranks Dangerous flags before Unusual flags", async () => {
    const citation1 = "This Agreement is entered into by Acme Vendor LLC and the Customer.";
    const citation2 = "Provider shall invoice Customer monthly in arrears.";

    const stub = createStubModelClient({
      summary: "A vendor services agreement.",
      flags: [
        {
          category: "red-line",
          citation: citation1,
          severity: "Unusual",
          explanation: "A bounded, non-existential deviation from market norms.",
          counterOffer: "Propose standard market terms.",
          redLineText: "Unusual payment structure.",
        },
        {
          category: "red-line",
          citation: citation2,
          severity: "Dangerous",
          explanation: "An open-ended exposure with no realistic leverage.",
          counterOffer: "Propose a capped liability amount.",
          redLineText: "No open-ended invoicing.",
        },
      ],
    });

    const result = await analyzeDocument(
      SAMPLE_DOCUMENT,
      ["Unusual payment structure.", "No open-ended invoicing."],
      stub,
    );

    expect(result.flags).toHaveLength(2);
    expect(result.flags[0].severity).toBe("Dangerous");
    expect(result.flags[1].severity).toBe("Unusual");
  });

  it("throws an AnalysisError when the model response is malformed", async () => {
    const stub = createStubModelClient({ summary: "", flags: "not-an-array" });

    await expect(analyzeDocument(SAMPLE_DOCUMENT, [], stub)).rejects.toThrow();
  });
});
