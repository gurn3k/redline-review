import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { containsDenyListedWord } from "@/lib/analysis/deny-list";
import { personalGuaranteeCategory } from "@/lib/analysis/categories/definitions/personal-guarantee";
import { createStubModelClient } from "./helpers/stub-model-client";

const adhesionContractText = readFileSync(
  path.join(__dirname, "fixtures", "adhesion-contract.txt"),
  "utf-8",
);

const cleanContractText = readFileSync(
  path.join(__dirname, "fixtures", "clean-contract.txt"),
  "utf-8",
);

// Exact sentence planted in adhesion-contract.txt, taken from
// adhesion-contract.sidecar.json's "personal-guarantee" entry.
const PLANTED_CITATION =
  "In consideration of Provider entering into this Agreement with Customer, the individual signing this Agreement on behalf of Customer in the signature block below, in his or her individual capacity, personally and unconditionally guarantees the full and prompt payment and performance of all of Customer's obligations under this Agreement, and this guarantee shall remain in full force and effect until all such obligations have been satisfied in full, regardless of any extension, renewal, or modification of this Agreement.";

const COUNTER_OFFER =
  "Propose capping the signer's individual exposure at a stated dollar amount, or removing the individual liability clause entirely and keeping liability at the Customer entity level.";

describe("personalGuaranteeCategory", () => {
  it("detects the planted personal guarantee clause and classifies it Dangerous", async () => {
    const stub = createStubModelClient({
      summary: "A vendor SaaS master services agreement.",
      flags: [
        {
          category: "personal-guarantee",
          citation: PLANTED_CITATION,
          severity: "Dangerous",
          explanation:
            "The individual signing on behalf of Customer personally guarantees all of Customer's payment and performance obligations, with no stated dollar cap.",
          counterOffer: COUNTER_OFFER,
        },
      ],
    });

    const result = await analyzeDocument(adhesionContractText, [], stub, [personalGuaranteeCategory]);

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("personal-guarantee");
    expect(result.flags[0].severity).toBe("Dangerous");
    expect(result.flags[0].citation).toBe(PLANTED_CITATION);
    expect(adhesionContractText.includes(result.flags[0].citation)).toBe(true);
  });

  it("computeSeverity always returns Dangerous regardless of the candidate's own severity or shape", () => {
    expect(
      personalGuaranteeCategory.computeSeverity?.({
        category: "personal-guarantee",
        citation: "Some citation.",
        severity: "Unusual",
        explanation: "A fabricated candidate claiming Unusual.",
        counterOffer: "Propose a cap.",
      }),
    ).toBe("Dangerous");

    expect(
      personalGuaranteeCategory.computeSeverity?.({
        category: "personal-guarantee",
        citation: "Another citation.",
        // @ts-expect-error — deliberately malformed severity to prove the rule ignores its input entirely.
        severity: "Possible Risk",
        explanation: "A fabricated candidate with a malformed severity.",
        counterOffer: "Propose a different cap.",
      }),
    ).toBe("Dangerous");
  });

  it("produces no personal-guarantee flag on the clean fixture", async () => {
    const stub = createStubModelClient({
      summary: "An ordinary marketing services agreement with market-standard terms.",
      flags: [],
    });

    const result = await analyzeDocument(cleanContractText, [], stub, [personalGuaranteeCategory]);

    expect(result.clear).not.toBeNull();
    expect(result.clear?.checkedStandardCategories).toContain("personal-guarantee");
  });

  it("counter-offer used above is example language, not a guarantee itself", () => {
    expect(containsDenyListedWord(COUNTER_OFFER)).toBe(false);
  });
});
