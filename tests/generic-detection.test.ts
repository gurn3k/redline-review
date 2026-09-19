import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { containsDenyListedWord } from "@/lib/analysis/deny-list";
import { arbitrationClassActionWaiverCategory } from "@/lib/analysis/categories/definitions/arbitration-class-action-waiver";
import { liabilityCapFeeEscalatorCategory } from "@/lib/analysis/categories/definitions/liability-cap-fee-escalator";
import { createStubModelClient } from "./helpers/stub-model-client";

const adhesionContractText = readFileSync(
  path.join(__dirname, "fixtures", "adhesion-contract.txt"),
  "utf-8",
);

const cleanContractText = readFileSync(
  path.join(__dirname, "fixtures", "clean-contract.txt"),
  "utf-8",
);

const REGISTRY = [arbitrationClassActionWaiverCategory, liabilityCapFeeEscalatorCategory];

// Exact sentence planted in adhesion-contract.txt, taken from
// adhesion-contract.sidecar.json's "arbitration-class-action-waiver" entry.
const ARBITRATION_CITATION =
  "Any dispute arising out of or relating to this Agreement shall be resolved exclusively through binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, conducted on an individual basis, and Customer hereby waives any right to participate in a class action, class arbitration, or representative proceeding against Provider, whether as a plaintiff or a class member.";

// Exact sentence planted in adhesion-contract.txt, taken from
// adhesion-contract.sidecar.json's "liability-cap-fee-escalator" entry.
const LIABILITY_CAP_CITATION =
  "Provider's total cumulative liability arising out of or relating to this Agreement, whether in contract, tort, or otherwise, shall not exceed the total fees paid by Customer to Provider during the one (1) month period immediately preceding the event giving rise to the claim.";

// Deliberately generic, non-tailored counter-offers per ADR 0006 — neither
// category gets clause-specific negotiation language.
const ARBITRATION_COUNTER_OFFER =
  "You could propose removing this clause, or preserving your right to pursue claims in court.";

const LIABILITY_CAP_COUNTER_OFFER =
  "You could propose raising this cap, or negotiating the fee schedule.";

describe("generic detection: arbitration/class-action waiver and liability-cap/fee-escalator", () => {
  it("detects both categories from the shared fixture in a single pass", async () => {
    const stub = createStubModelClient({
      summary: "A vendor SaaS master services agreement.",
      flags: [
        {
          category: "arbitration-class-action-waiver",
          citation: ARBITRATION_CITATION,
          severity: "Unusual",
          explanation:
            "The agreement requires disputes to go through binding arbitration and waives the customer's right to participate in a class action, removing the option to go to court or join with other affected parties.",
          counterOffer: ARBITRATION_COUNTER_OFFER,
        },
        {
          category: "liability-cap-fee-escalator",
          citation: LIABILITY_CAP_CITATION,
          severity: "Unusual",
          explanation:
            "The provider's total liability is capped at just one month of fees, which limits what the customer could recover if something goes wrong.",
          counterOffer: LIABILITY_CAP_COUNTER_OFFER,
        },
      ],
    });

    const result = await analyzeDocument(adhesionContractText, [], stub, REGISTRY);

    expect(result.flags).toHaveLength(2);

    const arbitrationFlag = result.flags.find(
      (f) => f.category === "arbitration-class-action-waiver",
    );
    const liabilityCapFlag = result.flags.find(
      (f) => f.category === "liability-cap-fee-escalator",
    );

    expect(arbitrationFlag).toBeDefined();
    expect(arbitrationFlag?.severity).toBe("Unusual");
    expect(arbitrationFlag?.isGenericDetection).toBe(true);
    expect(arbitrationFlag?.citation).toBe(ARBITRATION_CITATION);
    expect(adhesionContractText.includes(arbitrationFlag!.citation)).toBe(true);

    expect(liabilityCapFlag).toBeDefined();
    expect(liabilityCapFlag?.severity).toBe("Unusual");
    expect(liabilityCapFlag?.isGenericDetection).toBe(true);
    expect(liabilityCapFlag?.citation).toBe(LIABILITY_CAP_CITATION);
    expect(adhesionContractText.includes(liabilityCapFlag!.citation)).toBe(true);
  });

  it("arbitrationClassActionWaiverCategory.computeSeverity always returns Unusual", () => {
    expect(
      arbitrationClassActionWaiverCategory.computeSeverity?.({
        category: "arbitration-class-action-waiver",
        citation: "Some citation.",
        severity: "Dangerous",
        explanation: "A fabricated candidate claiming Dangerous.",
        counterOffer: "Propose removing this clause.",
      }),
    ).toBe("Unusual");

    expect(
      arbitrationClassActionWaiverCategory.computeSeverity?.({
        category: "arbitration-class-action-waiver",
        citation: "Another citation.",
        // @ts-expect-error — deliberately malformed severity to prove the rule ignores its input entirely.
        severity: "Possible Risk",
        explanation: "A fabricated candidate with a malformed severity.",
        counterOffer: "Propose court instead.",
      }),
    ).toBe("Unusual");
  });

  it("liabilityCapFeeEscalatorCategory.computeSeverity always returns Unusual", () => {
    expect(
      liabilityCapFeeEscalatorCategory.computeSeverity?.({
        category: "liability-cap-fee-escalator",
        citation: "Some citation.",
        severity: "Dangerous",
        explanation: "A fabricated candidate claiming Dangerous.",
        counterOffer: "Propose raising the cap.",
      }),
    ).toBe("Unusual");

    expect(
      liabilityCapFeeEscalatorCategory.computeSeverity?.({
        category: "liability-cap-fee-escalator",
        citation: "Another citation.",
        // @ts-expect-error — deliberately malformed severity to prove the rule ignores its input entirely.
        severity: "Possible Risk",
        explanation: "A fabricated candidate with a malformed severity.",
        counterOffer: "Propose a different fee schedule.",
      }),
    ).toBe("Unusual");
  });

  it("produces neither flag on the clean fixture (litigation venue, no unusual cap)", async () => {
    const stub = createStubModelClient({
      summary: "An ordinary marketing services agreement with market-standard terms.",
      flags: [],
    });

    const result = await analyzeDocument(cleanContractText, [], stub, REGISTRY);

    expect(result.clear).not.toBeNull();
    expect(result.clear?.checkedStandardCategories).toContain("arbitration-class-action-waiver");
    expect(result.clear?.checkedStandardCategories).toContain("liability-cap-fee-escalator");
  });

  it("counter-offers used above are generic (not tailored) and clean of deny-listed words", () => {
    expect(containsDenyListedWord(ARBITRATION_COUNTER_OFFER)).toBe(false);
    expect(containsDenyListedWord(LIABILITY_CAP_COUNTER_OFFER)).toBe(false);

    // Soft sanity check, per ADR 0006: generic framing should read as short,
    // clause-agnostic suggestions — not deeply negotiated, mechanics-specific
    // drafted language the way the first-class categories (05-08) produce.
    expect(ARBITRATION_COUNTER_OFFER.length).toBeLessThan(120);
    expect(LIABILITY_CAP_COUNTER_OFFER.length).toBeLessThan(120);
  });
});
