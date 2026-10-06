import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLE } from "@/lib/sample";

// The public sample is the first real output a visitor sees, so it has to
// keep the product's promise: every quote is the contract's own words.
// Replaces tests/hero-ledger.test.ts, whose hand-written sample is gone.
describe("public sample analysis", () => {
  it("is built from the sample contract on disk", () => {
    const onDisk = readFileSync(
      path.join(__dirname, "..", "lib", "sample", "coldline-equipment-service-agreement.txt"),
      "utf-8",
    );
    expect(SAMPLE.documentText).toBe(onDisk);
  });

  it("has flags to show", () => {
    expect(SAMPLE.analysis.flags.length).toBeGreaterThan(0);
  });

  for (const [index, flag] of SAMPLE.analysis.flags.entries()) {
    it(`flag ${index + 1} (${flag.category}) quotes the contract word for word`, () => {
      expect(SAMPLE.documentText).toContain(flag.citation);
    });
  }

  it("ranks every Dangerous flag before every Unusual one", () => {
    const severities = SAMPLE.analysis.flags.map((flag) => flag.severity);
    const firstUnusual = severities.indexOf("Unusual");
    if (firstUnusual !== -1) {
      expect(severities.slice(firstUnusual)).not.toContain("Dangerous");
    }
  });

  it("only shows grounded answers whose quote is in the contract", () => {
    for (const entry of SAMPLE.qa) {
      if (entry.grounded) {
        expect(SAMPLE.documentText).toContain(entry.supportingQuote);
      } else {
        expect(entry.supportingQuote).toBeUndefined();
      }
    }
  });
});
