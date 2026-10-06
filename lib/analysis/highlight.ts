/**
 * Splits a document into runs of text so the analysis view can highlight
 * each flag's cited sentence in place. Every citation is an exact substring
 * of the document (ADR 0001), so its first occurrence is where it came from.
 * Citations can overlap (two flags citing the same sentence), so a run lists
 * every flag that covers it. A citation that can't be found is skipped
 * rather than guessed at.
 */
export interface TextSegment {
  text: string;
  flagIndexes: number[];
}

export function segmentByCitations(text: string, citations: string[]): TextSegment[] {
  const ranges: { start: number; end: number; index: number }[] = [];
  citations.forEach((citation, index) => {
    if (citation.length === 0) return;
    const start = text.indexOf(citation);
    if (start === -1) return;
    ranges.push({ start, end: start + citation.length, index });
  });

  const boundaries = new Set<number>([0, text.length]);
  for (const range of ranges) {
    boundaries.add(range.start);
    boundaries.add(range.end);
  }
  const points = [...boundaries].sort((a, b) => a - b);

  const segments: TextSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const flagIndexes = ranges
      .filter((range) => range.start <= from && range.end >= to)
      .map((range) => range.index);
    const previous = segments[segments.length - 1];
    if (previous && previous.flagIndexes.length === 0 && flagIndexes.length === 0) {
      previous.text += text.slice(from, to);
    } else {
      segments.push({ text: text.slice(from, to), flagIndexes });
    }
  }
  return segments;
}
