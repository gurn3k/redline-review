import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { containsDenyListedWord } from "@/lib/analysis/deny-list";
import { indemnificationCategory } from "@/lib/analysis/categories/definitions/indemnification";
import { createStubModelClient } from "./helpers/stub-model-client";

const adhesionContractText = readFileSync(
  path.join(__dirname, "fixtures", "adhesion-contract.txt"),
  "utf-8",
);

const cleanContractText = readFileSync(
  path.join(__dirname, "fixtures", "clean-contract.txt"),
  "utf-8",
);

const INDEMNIFICATION_CITATION =
  "Customer shall indemnify, defend, and hold harmless Provider from and against any and all claims, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way related to Customer's use of the Services, Customer's breach of this Agreement, or Customer's violation of any applicable law.";

const COUNTER_OFFER =
  "Propose capping Customer's indemnification obligation at the total fees paid under this Agreement, making the obligation mutual so Provider indemnifies Customer on the same terms, and excluding any claims arising from Provider's own negligence or misconduct.";

describe("indemnificationCategory", () => {
  it("detects the planted uncapped indemnification clause in the adhesion fixture and classifies it Dangerous", async () => {
    expect(adhesionContractText.includes(INDEMNIFICATION_CITATION)).toBe(true);

    const stub = createStubModelClient({
      summary: "A vendor SaaS master services agreement.",
      flags: [
        {
          category: "indemnification",
          citation: INDEMNIFICATION_CITATION,
          severity: "Dangerous",
          explanation:
            "Customer must cover any and all of Provider's claims, damages, losses, and expenses with no dollar cap and no carve-out for Provider's own negligence.",
          counterOffer: COUNTER_OFFER,
        },
      ],
    });

    const result = await analyzeDocument(
      adhesionContractText,
      [],
      stub,
      [indemnificationCategory],
    );

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("indemnification");
    expect(result.flags[0].severity).toBe("Dangerous");
    expect(result.flags[0].citation).toBe(INDEMNIFICATION_CITATION);
  });

  it("computeSeverity always returns Dangerous regardless of candidate shape", () => {
    const compute = indemnificationCategory.computeSeverity;
    expect(compute).toBeDefined();

    expect(
      compute?.({
        category: "indemnification",
        citation: "Some indemnification sentence.",
        severity: "Unusual",
        explanation: "A model-supplied severity that should be overridden.",
        counterOffer: "Propose a cap.",
      }),
    ).toBe("Dangerous");

    expect(
      compute?.({
        category: "indemnification",
        citation: "Another indemnification sentence.",
        severity: "Dangerous",
        explanation: "Already Dangerous per the model.",
        counterOffer: "Propose mutuality.",
        attributes: { unrelatedField: 123 },
      }),
    ).toBe("Dangerous");
  });

  it("produces no indemnification flag on the clean fixture (model finds nothing)", async () => {
    const stub = createStubModelClient({
      summary: "An ordinary marketing services agreement with market-standard terms.",
      flags: [],
    });

    const result = await analyzeDocument(
      cleanContractText,
      [],
      stub,
      [indemnificationCategory],
    );

    expect(result.flags).toEqual([]);
    expect(result.clear).not.toBeNull();
    expect(result.clear?.checkedStandardCategories).toContain("indemnification");
  });

  it("counter-offer used in detection is example language, not a guarantee", () => {
    expect(containsDenyListedWord(COUNTER_OFFER)).toBe(false);
  });
});
