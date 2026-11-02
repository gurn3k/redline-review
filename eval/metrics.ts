// Pure scoring for the eval. No network, no file access: everything here takes
// documents and flags in and returns numbers out, so tests can drive it.
import type { GoldDocument, PlantedClause } from "./corpus";

/** The gold set's seven clause types, mapped onto this product's clause types. */
export interface TypeMapping {
  goldType: string;
  inScope: boolean;
  /** Product clause types that count as "the right type" for this gold type. */
  productTypes: string[];
  reason: string;
}

export const TYPE_MAP: TypeMapping[] = [
  {
    goldType: "arbitration-and-class-action-waiver",
    inScope: true,
    productTypes: ["arbitration-class-action-waiver"],
    reason: "PRD.md red lines: arbitration / class-action waiver is flagged, generically.",
  },
  {
    goldType: "auto-renewal",
    inScope: true,
    productTypes: ["auto-renewal"],
    reason: "PRD.md red lines: auto-renewal / negative-option is a first-class type.",
  },
  {
    goldType: "indemnification",
    inScope: true,
    productTypes: ["indemnification"],
    reason: "PRD.md red lines: indemnification is a first-class type.",
  },
  {
    goldType: "limitation-of-liability",
    inScope: true,
    productTypes: ["liability-cap-fee-escalator"],
    reason: "PRD.md red lines: liability caps are flagged generically.",
  },
  {
    goldType: "fee-escalators-and-late-fees",
    inScope: true,
    productTypes: ["liability-cap-fee-escalator"],
    reason:
      "PRD.md red lines: fee escalators are flagged generically. Late and reactivation charges are the edge of that definition; this row is reported on its own.",
  },
  // Types the business set plants (eval/business-set). They use this product's own names.
  {
    goldType: "personal-guarantee",
    inScope: true,
    productTypes: ["personal-guarantee"],
    reason: "PRD.md red lines: personal guarantee is a first-class Dangerous type.",
  },
  {
    goldType: "unilateral-termination",
    inScope: true,
    productTypes: ["unilateral-termination"],
    reason: "PRD.md red lines: unilateral termination / no-cause deactivation is a first-class Dangerous type.",
  },
  {
    goldType: "fee-escalator",
    inScope: true,
    productTypes: ["liability-cap-fee-escalator"],
    reason: "PRD.md red lines: fee escalators are flagged generically. This is a price rise at the provider's discretion, not a late charge.",
  },
  {
    goldType: "ip-assignment",
    inScope: false,
    productTypes: [],
    reason: "PRD.md: IP assignment clauses are explicitly not evaluated in v1 (freelance context, segment excluded).",
  },
  {
    goldType: "data-privacy-overreach",
    inScope: false,
    productTypes: [],
    reason: "PRD.md: data and privacy overreach in terms of service is explicitly not evaluated in v1.",
  },
  {
    goldType: "unilateral-modification",
    inScope: false,
    productTypes: [],
    reason:
      "PRD.md names unilateral termination and no-cause deactivation, not a right to rewrite the terms. The product has no type for it.",
  },
  {
    goldType: "non-compete",
    inScope: false,
    productTypes: [],
    reason: "PRD.md: non-compete clauses are explicitly not evaluated in v1 (employment context, segment excluded).",
  },
];

export function mappingFor(goldType: string): TypeMapping | undefined {
  return TYPE_MAP.find((m) => m.goldType === goldType);
}

// ---------- characters a model tends to retype ----------

export const CHARACTER_CLASSES: { name: string; test: (s: string) => boolean }[] = [
  { name: "curly quote or apostrophe", test: (s) => /[‘’“”]/.test(s) },
  { name: "non-breaking space", test: (s) => s.includes(" ") },
  { name: "fi or fl ligature", test: (s) => /[ﬁﬂ]/.test(s) },
  { name: "em dash", test: (s) => s.includes("—") },
  { name: "two spaces in a row", test: (s) => s.includes("  ") },
];

export function characterClassesIn(sentence: string): string[] {
  return CHARACTER_CLASSES.filter((c) => c.test(sentence)).map((c) => c.name);
}

// ---------- overlap ----------

export function occurrenceStarts(text: string, sentence: string): number[] {
  const starts: number[] = [];
  if (sentence.length === 0) return starts;
  let from = 0;
  for (;;) {
    const at = text.indexOf(sentence, from);
    if (at === -1) return starts;
    starts.push(at);
    from = at + 1;
  }
}

/** True when the quoted text sits in the document and shares at least one character with the target sentence. */
export function quoteOverlaps(documentText: string, quote: string, target: string): boolean {
  const targetStarts = occurrenceStarts(documentText, target);
  if (targetStarts.length === 0) return false;
  for (const q of occurrenceStarts(documentText, quote)) {
    const qEnd = q + quote.length;
    for (const t of targetStarts) {
      if (q < t + target.length && t < qEnd) return true;
    }
  }
  return false;
}

// ---------- per-flag and per-document scoring ----------

export interface RawCandidate {
  category?: unknown;
  citation?: unknown;
  severity?: unknown;
}

export interface ShownFlag {
  category: string;
  citation: string;
  severity: string;
}

export interface FlagRecord {
  document: string;
  clauseType: string;
  severity: string;
  quotedSentence: string;
  /** The quote appears in the document character for character. */
  grounded: boolean;
  /** The flag survived the pipeline's gates and would reach the reader. */
  shown: boolean;
  /** Planted clause ids whose sentence the quote overlaps. */
  matchedPlanted: string[];
  matchedOutOfScope: boolean;
  matchedUnusualButHarmless: boolean;
  /** For a match on an in-scope planted clause: did the flag name the mapped type? */
  typeCorrect: boolean | null;
}

export interface PlantedRecord {
  document: string;
  id: string;
  goldType: string;
  inScope: boolean;
  sentence: string;
  characterClasses: string[];
  found: boolean;
  foundWithRightType: boolean;
  /** What the sidecar says the product should call it, when it says. */
  expectedSeverity?: string;
  /** For a clause found with the right type and an expected severity: did a right-type flag carry that severity? Null otherwise. */
  severityAgrees: boolean | null;
}

export interface DocumentScore {
  document: string;
  benign: boolean;
  rawFlagCount: number;
  shownFlagCount: number;
  flags: FlagRecord[];
  planted: PlantedRecord[];
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function scoreDocument(doc: GoldDocument, raw: RawCandidate[], shown: ShownFlag[]): DocumentScore {
  // Which raw candidates survived the gates? Match them to the shown flags one for one.
  const remaining = new Map<string, number>();
  for (const f of shown) {
    const key = `${f.category}\u0000${f.citation}`;
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }

  const flags: FlagRecord[] = raw.map((c) => {
    const category = asString(c.category);
    const quote = asString(c.citation);
    const key = `${category}\u0000${quote}`;
    const left = remaining.get(key) ?? 0;
    const isShown = left > 0;
    if (isShown) remaining.set(key, left - 1);

    const grounded = quote.length > 0 && doc.text.includes(quote);
    const matched = grounded ? doc.plantedClauses.filter((p) => quoteOverlaps(doc.text, quote, p.sourceSentence)) : [];
    const inScopeMatches = matched.filter((p) => mappingFor(p.clauseType)?.inScope);

    return {
      document: doc.id,
      clauseType: category,
      severity: asString(c.severity),
      quotedSentence: quote,
      grounded,
      shown: isShown,
      matchedPlanted: matched.map((p) => p.id),
      matchedOutOfScope: matched.length > 0 && inScopeMatches.length === 0,
      matchedUnusualButHarmless: grounded && doc.unusualButHarmless.some((s) => quoteOverlaps(doc.text, quote, s)),
      typeCorrect:
        inScopeMatches.length === 0
          ? null
          : inScopeMatches.some((p) => mappingFor(p.clauseType)?.productTypes.includes(category)),
    };
  });

  const planted: PlantedRecord[] = doc.plantedClauses.map((p: PlantedClause) => {
    const mapping = mappingFor(p.clauseType);
    const overlapping = flags.filter((f) => f.shown && f.matchedPlanted.includes(p.id));
    const rightType = overlapping.filter((f) => mapping?.productTypes.includes(f.clauseType));
    const expected = p.expectedSeverity === "Dangerous" || p.expectedSeverity === "Unusual" ? p.expectedSeverity : undefined;
    return {
      expectedSeverity: expected,
      severityAgrees: expected && rightType.length > 0 ? rightType.some((f) => f.severity === expected) : null,
      document: doc.id,
      id: p.id,
      goldType: p.clauseType,
      inScope: mapping?.inScope ?? false,
      sentence: p.sourceSentence,
      characterClasses: characterClassesIn(p.sourceSentence),
      found: overlapping.length > 0,
      foundWithRightType: overlapping.some((f) => mapping?.productTypes.includes(f.clauseType)),
    };
  });

  return {
    document: doc.id,
    benign: doc.benign,
    rawFlagCount: raw.length,
    shownFlagCount: shown.length,
    flags,
    planted,
  };
}

// ---------- aggregate ----------

export interface Rate {
  count: number;
  of: number;
}

export function rate(count: number, of: number): Rate {
  return { count, of };
}

/** "7/12 (58.3%)", or "0/0 (n/a)" when there is nothing to divide by. */
export function formatRate(r: Rate): string {
  if (r.of === 0) return `${r.count}/${r.of} (n/a)`;
  return `${r.count}/${r.of} (${((r.count / r.of) * 100).toFixed(1)}%)`;
}

export interface Summary {
  documentsScored: number;
  documentsLeftOut: string[];
  recall: Rate;
  recallRightType: Rate;
  /** Right-type finds whose flag carried the severity the sidecar expects. Rate is n/a for sets with no expected severities. */
  severity: { overall: Rate; expectedDangerous: Rate; expectedUnusual: Rate };
  recallByType: { goldType: string; recall: Rate; rightType: Rate }[];
  recallByCharacters: { label: string; recall: Rate }[];
  outOfScope: { goldType: string; planted: number; reason: string }[];
  /**
   * Of the flags that could be judged, how many overlap an in-scope planted clause. A flag that lands only
   * on an out-of-scope planted clause is neither right nor wrong and is left out of both counts. A flag on
   * nothing the answer key lists counts against precision, even though the key may be incomplete.
   */
  precision: { shown: Rate; returned: Rate };
  groundedness: Rate;
  shownGroundedness: Rate;
  cleanDocuments: { documents: number; returnedClear: Rate; flagsShown: number; flagsRaw: number };
  flagsOnLoadedDocuments: {
    total: number;
    onInScopePlanted: number;
    onOutOfScopePlanted: number;
    onUnusualButHarmless: number;
    onNothingPlanted: number;
  };
}

export function summarize(scores: DocumentScore[], leftOut: string[]): Summary {
  const planted = scores.flatMap((s) => s.planted);
  const inScope = planted.filter((p) => p.inScope);
  const foundCount = (list: PlantedRecord[]) => list.filter((p) => p.found).length;
  const rightCount = (list: PlantedRecord[]) => list.filter((p) => p.foundWithRightType).length;

  const recallByType = TYPE_MAP.filter((m) => m.inScope)
    .map((m) => {
      const list = inScope.filter((p) => p.goldType === m.goldType);
      return {
        goldType: m.goldType,
        recall: rate(foundCount(list), list.length),
        rightType: rate(rightCount(list), foundCount(list)),
      };
    })
    .filter((row) => row.recall.of > 0);

  const judged = inScope.filter((p) => p.severityAgrees !== null);
  const agreeing = (list: PlantedRecord[]) => list.filter((p) => p.severityAgrees === true).length;
  const severity = {
    overall: rate(agreeing(judged), judged.length),
    expectedDangerous: rate(
      agreeing(judged.filter((p) => p.expectedSeverity === "Dangerous")),
      judged.filter((p) => p.expectedSeverity === "Dangerous").length,
    ),
    expectedUnusual: rate(
      agreeing(judged.filter((p) => p.expectedSeverity === "Unusual")),
      judged.filter((p) => p.expectedSeverity === "Unusual").length,
    ),
  };

  const withChars = inScope.filter((p) => p.characterClasses.length > 0);
  const withoutChars = inScope.filter((p) => p.characterClasses.length === 0);
  const recallByCharacters = [
    { label: "sentence carries at least one of the five", recall: rate(foundCount(withChars), withChars.length) },
    { label: "sentence carries none of them", recall: rate(foundCount(withoutChars), withoutChars.length) },
    ...CHARACTER_CLASSES.map((c) => {
      const list = inScope.filter((p) => p.characterClasses.includes(c.name));
      return { label: `  ${c.name}`, recall: rate(foundCount(list), list.length) };
    }),
  ];

  const outOfScope = TYPE_MAP.filter((m) => !m.inScope)
    .map((m) => ({
      goldType: m.goldType,
      planted: planted.filter((p) => p.goldType === m.goldType).length,
      reason: m.reason,
    }))
    .filter((row) => row.planted > 0);

  const allFlags = scores.flatMap((s) => s.flags);
  const judgeable = allFlags.filter((f) => !f.matchedOutOfScope);
  const correctShown = judgeable.filter((f) => f.shown && f.matchedPlanted.length > 0).length;
  const clean = scores.filter((s) => s.benign);
  const loaded = scores.filter((s) => !s.benign).flatMap((s) => s.flags.filter((f) => f.shown));

  return {
    documentsScored: scores.length,
    documentsLeftOut: leftOut,
    recall: rate(foundCount(inScope), inScope.length),
    recallRightType: rate(rightCount(inScope), foundCount(inScope)),
    severity,
    recallByType,
    recallByCharacters,
    outOfScope,
    precision: {
      shown: rate(correctShown, judgeable.filter((f) => f.shown).length),
      returned: rate(correctShown, judgeable.length),
    },
    groundedness: rate(allFlags.filter((f) => f.grounded).length, allFlags.length),
    shownGroundedness: rate(
      allFlags.filter((f) => f.shown && f.grounded).length,
      allFlags.filter((f) => f.shown).length,
    ),
    cleanDocuments: {
      documents: clean.length,
      returnedClear: rate(clean.filter((s) => s.shownFlagCount === 0).length, clean.length),
      flagsShown: clean.reduce((n, s) => n + s.shownFlagCount, 0),
      flagsRaw: clean.reduce((n, s) => n + s.rawFlagCount, 0),
    },
    flagsOnLoadedDocuments: {
      total: loaded.length,
      onInScopePlanted: loaded.filter((f) => f.matchedPlanted.length > 0 && !f.matchedOutOfScope).length,
      onOutOfScopePlanted: loaded.filter((f) => f.matchedOutOfScope).length,
      onUnusualButHarmless: loaded.filter((f) => f.matchedUnusualButHarmless).length,
      onNothingPlanted: loaded.filter((f) => f.matchedPlanted.length === 0 && !f.matchedUnusualButHarmless).length,
    },
  };
}
