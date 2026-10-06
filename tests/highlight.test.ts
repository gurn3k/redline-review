import { describe, expect, it } from "vitest";
import { segmentByCitations } from "@/lib/analysis/highlight";

describe("segmentByCitations", () => {
  const text = "One. Two is risky. Three. Four is risky too.";

  it("returns the whole text unmarked when nothing is cited", () => {
    expect(segmentByCitations(text, [])).toEqual([{ text, flagIndexes: [] }]);
  });

  it("marks each cited sentence with its flag and keeps every character", () => {
    const segments = segmentByCitations(text, ["Two is risky.", "Four is risky too."]);
    expect(segments.map((s) => s.text).join("")).toBe(text);
    expect(segments.filter((s) => s.flagIndexes.length > 0)).toEqual([
      { text: "Two is risky.", flagIndexes: [0] },
      { text: "Four is risky too.", flagIndexes: [1] },
    ]);
  });

  it("lists both flags where two citations overlap", () => {
    const segments = segmentByCitations(text, ["Two is risky. Three.", "Three."]);
    expect(segments.map((s) => s.text).join("")).toBe(text);
    expect(segments).toContainEqual({ text: "Three.", flagIndexes: [0, 1] });
    expect(segments).toContainEqual({ text: "Two is risky. ", flagIndexes: [0] });
  });

  it("skips a citation that isn't in the text instead of guessing", () => {
    const segments = segmentByCitations(text, ["Not in the document."]);
    expect(segments).toEqual([{ text, flagIndexes: [] }]);
  });
});
