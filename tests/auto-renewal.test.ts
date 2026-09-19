import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { containsDenyListedWord } from "@/lib/analysis/deny-list";
import { autoRenewalCategory, computeSeverity } from "@/lib/analysis/categories/definitions/auto-renewal";
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
// adhesion-contract.sidecar.json's "auto-renewal" entry: price escalates
// 15% per renewal term and the non-renewal notice window is only 5 days.
const DANGEROUS_CITATION =
  'Following the Initial Term, this Agreement will automatically renew for successive one (1) year terms (each, a "Renewal Term," and together with the Initial Term, the "Term") unless either Party provides written notice of non-renewal, provided that Customer\'s written notice of non-renewal must be received by Provider no later than five (5) days prior to the expiration of the then-current Term, and further provided that the fees payable by Customer for each Renewal Term shall increase by fifteen percent (15%) over the fees in effect during the immediately preceding Term.';

const DANGEROUS_COUNTER_OFFER =
  "Propose that renewal require Customer's affirmative opt-in rather than automatic renewal, and that any Renewal Term fee increase be disclosed at least sixty (60) days in advance, with a cancellation window of at least thirty (30) days.";

describe("autoRenewalCategory", () => {
  it("detects the planted auto-renewal clause and classifies it Dangerous (price escalation + short window)", async () => {
    const stub = createStubModelClient({
      summary: "A vendor SaaS master services agreement.",
      flags: [
        {
          category: "auto-renewal",
          citation: DANGEROUS_CITATION,
          severity: "Unusual", // the model's own call is irrelevant — computeSeverity overrides it
          explanation:
            "The agreement automatically renews each year, the fees increase by 15% each renewal term, and Customer has only five days' notice to cancel before the term locks in.",
          counterOffer: DANGEROUS_COUNTER_OFFER,
          attributes: {
            hasPriceIncrease: true,
            hasClearAdvanceNotice: false,
            cancellationWindowDays: 5,
          },
        },
      ],
    });

    const result = await analyzeDocument(adhesionContractText, [], stub, [autoRenewalCategory]);

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("auto-renewal");
    expect(result.flags[0].severity).toBe("Dangerous");
    expect(result.flags[0].citation).toBe(DANGEROUS_CITATION);
    expect(adhesionContractText.includes(result.flags[0].citation)).toBe(true);
  });

  it("classifies a synthetic auto-renewal clause with fair notice and a reasonable window as Unusual", async () => {
    const syntheticDocumentText = `MASTER SERVICES AGREEMENT

1. Term. This Agreement begins on the Effective Date and continues for an Initial Term of one (1) year.

2. Renewal. Following the Initial Term, this Agreement will automatically renew for successive one (1) year terms at the same fees then in effect, unless either Party provides written notice of non-renewal at least thirty (30) days before the end of the then-current Term.

3. Governing Law. This Agreement is governed by the laws of the state in which Provider is headquartered.`;

    const citation =
      "Following the Initial Term, this Agreement will automatically renew for successive one (1) year terms at the same fees then in effect, unless either Party provides written notice of non-renewal at least thirty (30) days before the end of the then-current Term.";

    const stub = createStubModelClient({
      summary: "A short synthetic services agreement.",
      flags: [
        {
          category: "auto-renewal",
          citation,
          severity: "Unusual",
          explanation:
            "The agreement automatically renews annually at the same price, with thirty days' notice to cancel before each renewal.",
          counterOffer:
            "Propose that renewal require Customer's affirmative opt-in rather than automatic renewal.",
          attributes: {
            hasPriceIncrease: false,
            hasClearAdvanceNotice: true,
            cancellationWindowDays: 30,
          },
        },
      ],
    });

    const result = await analyzeDocument(syntheticDocumentText, [], stub, [autoRenewalCategory]);

    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("auto-renewal");
    expect(result.flags[0].severity).toBe("Unusual");
    expect(result.flags[0].citation).toBe(citation);
  });

  describe("computeSeverity", () => {
    it("is Dangerous when the price increases without clear advance notice, regardless of window", () => {
      expect(
        computeSeverity({
          category: "auto-renewal",
          citation: "x",
          severity: "Unusual",
          explanation: "x",
          counterOffer: "x",
          attributes: {
            hasPriceIncrease: true,
            hasClearAdvanceNotice: false,
            cancellationWindowDays: 90,
          },
        }),
      ).toBe("Dangerous");
    });

    it("is Dangerous when the cancellation window is short, regardless of price fields", () => {
      expect(
        computeSeverity({
          category: "auto-renewal",
          citation: "x",
          severity: "Unusual",
          explanation: "x",
          counterOffer: "x",
          attributes: {
            hasPriceIncrease: false,
            hasClearAdvanceNotice: true,
            cancellationWindowDays: 3,
          },
        }),
      ).toBe("Dangerous");
    });

    it("is Unusual when the price doesn't increase and the window is reasonable", () => {
      expect(
        computeSeverity({
          category: "auto-renewal",
          citation: "x",
          severity: "Dangerous", // model's own call is irrelevant — code decides
          explanation: "x",
          counterOffer: "x",
          attributes: {
            hasPriceIncrease: false,
            hasClearAdvanceNotice: true,
            cancellationWindowDays: 45,
          },
        }),
      ).toBe("Unusual");
    });

    it("does not throw and falls back to Unusual when attributes is undefined", () => {
      expect(
        computeSeverity({
          category: "auto-renewal",
          citation: "x",
          severity: "Dangerous",
          explanation: "x",
          counterOffer: "x",
        }),
      ).toBe("Unusual");
    });

    it("does not throw and falls back to Unusual when attributes is an empty object", () => {
      expect(
        computeSeverity({
          category: "auto-renewal",
          citation: "x",
          severity: "Dangerous",
          explanation: "x",
          counterOffer: "x",
          attributes: {},
        }),
      ).toBe("Unusual");
    });

    it("does not throw and falls back to Unusual when attribute fields are malformed", () => {
      expect(
        computeSeverity({
          category: "auto-renewal",
          citation: "x",
          severity: "Dangerous",
          explanation: "x",
          counterOffer: "x",
          attributes: {
            hasPriceIncrease: "yes",
            hasClearAdvanceNotice: "no",
            cancellationWindowDays: "five",
          },
        }),
      ).toBe("Unusual");
    });
  });

  it("produces no Dangerous auto-renewal flag on the clean fixture, and the Clear result checks auto-renewal", async () => {
    const stub = createStubModelClient({
      summary: "An ordinary marketing services agreement with market-standard terms.",
      flags: [],
    });

    const result = await analyzeDocument(cleanContractText, [], stub, [autoRenewalCategory]);

    expect(result.clear).not.toBeNull();
    expect(result.clear?.checkedStandardCategories).toContain("auto-renewal");
    expect(result.flags.find((f) => f.category === "auto-renewal" && f.severity === "Dangerous")).toBeUndefined();
  });

  it("the Dangerous-tier counter-offer is example language, not a guarantee", () => {
    expect(containsDenyListedWord(DANGEROUS_COUNTER_OFFER)).toBe(false);
  });
});
