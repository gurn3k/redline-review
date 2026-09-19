import { describe, expect, it } from "vitest";
import { evaluateExtractedText } from "@/lib/extraction/validate";

describe("evaluateExtractedText", () => {
  it("accepts a normal, non-trivial block of prose", () => {
    const text = "This Agreement is entered into by and between the parties below, " +
      "effective as of the date of last signature, and governs the terms of service.";
    const result = evaluateExtractedText({ text, fileSizeBytes: text.length, hasPages: false });
    expect(result).toEqual({ ok: true, text });
  });

  it("rejects an empty .txt file as unreliable", () => {
    const result = evaluateExtractedText({ text: "", fileSizeBytes: 0, hasPages: false });
    expect(result).toEqual({ ok: false, reason: "unreliable" });
  });

  it("rejects whitespace-only text as unreliable", () => {
    const result = evaluateExtractedText({ text: "   \n\n   ", fileSizeBytes: 8, hasPages: false });
    expect(result).toEqual({ ok: false, reason: "unreliable" });
  });

  it("treats a PDF with pages but ~no extracted text as no-text-layer, not generic unreliable", () => {
    const result = evaluateExtractedText({
      text: "  ",
      fileSizeBytes: 500_000,
      hasPages: true,
    });
    expect(result).toEqual({ ok: false, reason: "no-text-layer" });
  });

  it("does not call a real PDF with a healthy text layer a no-text-layer document", () => {
    const text = "Section 1. This is a real contract clause with real words in it, repeated " +
      "across a full page of a normal document so the extractor has plenty to work with.";
    const result = evaluateExtractedText({ text, fileSizeBytes: text.length, hasPages: true });
    expect(result).toEqual({ ok: true, text });
  });

  it("rejects text that is mostly control/replacement characters as garbled", () => {
    const garbled = "���������� abc";
    const result = evaluateExtractedText({ text: garbled, fileSizeBytes: 200, hasPages: false });
    expect(result).toEqual({ ok: false, reason: "unreliable" });
  });

  it("rejects text far too short for a large file", () => {
    const result = evaluateExtractedText({
      text: "a few stray words only",
      fileSizeBytes: 2_000_000,
      hasPages: false,
    });
    expect(result).toEqual({ ok: false, reason: "unreliable" });
  });

  it("does not penalize a short file for being small", () => {
    const text = "A brief, genuine one-page notice with enough real words in it.";
    const result = evaluateExtractedText({ text, fileSizeBytes: text.length, hasPages: false });
    expect(result).toEqual({ ok: true, text });
  });
});
