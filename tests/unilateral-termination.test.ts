import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { containsDenyListedWord } from "@/lib/analysis/deny-list";
import { unilateralTerminationCategory } from "@/lib/analysis/categories/definitions/unilateral-termination";
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
// adhesion-contract.sidecar.json's "unilateral-termination" entry.
const PLANTED_CITATION =
  "Provider may terminate this Agreement at any time, for any reason or for no reason, immediately upon written notice to Customer, without any obligation to afford Customer an opportunity to cure and without further liability to Customer of any kind.";

const COUNTER_OFFER =
  "Propose requiring Provider to state cause for termination and to give Customer a 30-day written cure period before termination takes effect, or in the alternative, propose making termination rights symmetric so Customer holds the same no-cause exit right on the same notice.";

describe("unilateralTerminationCategory", () => {
  it("detects the planted unilateral termination clause and classifies it Dangerous", async () => {
    const stub = createStubModelClient({
      summary: "A vendor SaaS master services agreement.",
      flags: [
        {
          category: "unilateral-termination",
          citation: PLANTED_CITATION,
          severity: "Dangerous",
          explanation:
            "Provider can end the Agreement at any time, for any reason or no reason, with no cure period and no obligation to give Customer a chance to fix any alleged issue first.",
          counterOffer: COUNTER_OFFER,
        },
      ],
    });

    const result = await analyzeDocument(adhesionContractText, [], stub, [unilateralTerminationCategory]);

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("unilateral-termination");
    expect(result.flags[0].severity).toBe("Dangerous");
    expect(result.flags[0].citation).toBe(PLANTED_CITATION);
    expect(adhesionContractText.includes(result.flags[0].citation)).toBe(true);
  });

  it("computeSeverity always returns Dangerous regardless of the candidate's own severity or shape", () => {
    expect(
      unilateralTerminationCategory.computeSeverity?.({
        category: "unilateral-termination",
        citation: "Some citation.",
        severity: "Unusual",
        explanation: "A fabricated candidate claiming Unusual.",
        counterOffer: "Propose a cure period.",
      }),
    ).toBe("Dangerous");

    expect(
      unilateralTerminationCategory.computeSeverity?.({
        category: "unilateral-termination",
        citation: "Another citation.",
        // @ts-expect-error — deliberately malformed severity to prove the rule ignores its input entirely.
        severity: "Possible Risk",
        explanation: "A fabricated candidate with a malformed severity.",
        counterOffer: "Propose a cause requirement.",
      }),
    ).toBe("Dangerous");
  });

  it("produces no unilateral-termination flag on the clean fixture (mutual termination-for-cause with a real cure period)", async () => {
    const stub = createStubModelClient({
      summary: "An ordinary marketing services agreement with market-standard terms.",
      flags: [],
    });

    const result = await analyzeDocument(cleanContractText, [], stub, [unilateralTerminationCategory]);

    expect(result.clear).not.toBeNull();
    expect(result.clear?.checkedStandardCategories).toContain("unilateral-termination");
  });

  it("counter-offer used above is example language, not a guarantee itself", () => {
    expect(containsDenyListedWord(COUNTER_OFFER)).toBe(false);
  });
});
