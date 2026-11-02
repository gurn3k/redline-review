import { describe, expect, it } from "vitest";
import { findSentenceProblems, loadGoldSet } from "../eval/corpus";
import { formatRate, quoteOverlaps, scoreDocument, summarize, TYPE_MAP } from "../eval/metrics";

// No model, no network. These guard the gold set itself: a sentence that has
// drifted from its document would show up in an eval run as a recall miss the
// model never made.
describe("eval gold set", () => {
  it("loads the nine documents in the manifest", () => {
    expect(loadGoldSet().map((d) => d.id)).toHaveLength(9);
  });

  it("has every planted, exit, harmless and question sentence in its document exactly once", () => {
    expect(findSentenceProblems()).toEqual([]);
  });

  it("only uses clause types the type mapping knows", () => {
    const known = new Set(TYPE_MAP.map((m) => m.goldType));
    for (const doc of loadGoldSet()) {
      for (const p of doc.plantedClauses) expect(known.has(p.clauseType)).toBe(true);
    }
  });

  it("keeps the characters the sentences carry on purpose", () => {
    const text = loadGoldSet().map((d) => d.text).join("");
    expect(text).toContain(" ");
    expect(text).toContain("’");
    expect(text).toContain("—");
    expect(text).not.toContain("\r");
  });
});

describe("eval scoring", () => {
  const doc = loadGoldSet().find((d) => d.id === "saas-subscription")!;
  const arbitration = doc.plantedClauses.find((p) => p.clauseType === "arbitration-and-class-action-waiver")!;
  const noncompete = loadGoldSet().find((d) => d.id === "offer-letter")!;

  it("counts a flag as found when its quote overlaps the planted sentence", () => {
    const partial = arbitration.sourceSentence.slice(0, 80);
    expect(quoteOverlaps(doc.text, partial, arbitration.sourceSentence)).toBe(true);
    const score = scoreDocument(
      doc,
      [{ category: "arbitration-class-action-waiver", citation: partial, severity: "Unusual" }],
      [{ category: "arbitration-class-action-waiver", citation: partial, severity: "Unusual" }],
    );
    const record = score.planted.find((p) => p.id === arbitration.id)!;
    expect(record.found).toBe(true);
    expect(record.foundWithRightType).toBe(true);
  });

  it("reports a found clause with the wrong type separately", () => {
    const flag = { category: "indemnification", citation: arbitration.sourceSentence, severity: "Dangerous" };
    const record = scoreDocument(doc, [flag], [flag]).planted.find((p) => p.id === arbitration.id)!;
    expect(record.found).toBe(true);
    expect(record.foundWithRightType).toBe(false);
  });

  it("does not count a flag the gates dropped, and marks an invented quote as ungrounded", () => {
    const invented = { category: "auto-renewal", citation: "This sentence is not in the document.", severity: "Unusual" };
    const score = scoreDocument(doc, [invented], []);
    expect(score.flags[0].grounded).toBe(false);
    expect(score.flags[0].shown).toBe(false);
    expect(score.planted.every((p) => !p.found)).toBe(true);
  });

  it("never counts out-of-scope types in recall", () => {
    const score = scoreDocument(noncompete, [], []);
    const summary = summarize([score], []);
    const inScopePlanted = noncompete.plantedClauses.filter((p) => TYPE_MAP.find((m) => m.goldType === p.clauseType)?.inScope);
    expect(summary.recall.of).toBe(inScopePlanted.length);
    expect(summary.recall.of).toBeLessThan(noncompete.plantedClauses.length);
  });

  it("prints a rate as count/count and a percentage", () => {
    expect(formatRate({ count: 7, of: 12 })).toBe("7/12 (58.3%)");
    expect(formatRate({ count: 0, of: 0 })).toBe("0/0 (n/a)");
  });
});
