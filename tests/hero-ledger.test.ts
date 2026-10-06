import { describe, expect, it } from "vitest";
import { CONFIRMATIONS, SOURCE_LINES } from "@/app/components/hero-ledger";

// The landing page promises that every flag quotes its document word for
// word, so the sample flags have to quote the sample contract shown beside
// them. Line breaks in the sample are only wrapping, so they count as spaces.
describe("HeroLedger sample", () => {
  const sampleText = SOURCE_LINES.map((line) => line.text).join(" ").replace(/\s+/g, " ");

  for (const confirmation of CONFIRMATIONS) {
    it(`quotes ${confirmation.ref} word for word from the sample contract`, () => {
      expect(sampleText).toContain(confirmation.citation);
    });
  }
});
