// Loads the gold set under eval/gold-set/corpus and checks that every sentence
// the sidecars name is really in its document. No network, no model.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export interface PlantedClause {
  id: string;
  clauseType: string;
  sourceSentence: string;
  exit?: { text: string; sourceSentence: string } | null;
  /** "Dangerous" or "Unusual" when the sidecar says what the product should call it. The instructor's gold set has bands instead. */
  expectedSeverity?: string;
}

export interface GoldDocument {
  id: string;
  text: string;
  benign: boolean;
  plantedClauses: PlantedClause[];
  unusualButHarmless: string[];
}

interface ManifestEntry {
  id: string;
  document: string;
  sidecar: string;
  questions?: string;
  benign: boolean;
  unusualButHarmless: string[];
}

interface QuestionSet {
  grounded?: { question: string; expectedSourceSentence: string }[];
}

/** The sets `npm run eval -- --set <name>` can run. "gold" is the instructor's; "gold2" is the business set in eval/gold-set 2. */
export const CORPUS_DIRS: Record<string, string> = {
  gold: path.join(process.cwd(), "eval", "gold-set", "corpus"),
  gold2: path.join(process.cwd(), "eval", "gold-set 2"),
};

export const DEFAULT_CORPUS_DIR = CORPUS_DIRS.gold;

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf-8")) as T;
}

function loadManifest(corpusDir: string): ManifestEntry[] {
  return readJson<{ documents: ManifestEntry[] }>(path.join(corpusDir, "manifest.json")).documents;
}

export function loadGoldSet(corpusDir: string = DEFAULT_CORPUS_DIR): GoldDocument[] {
  return loadManifest(corpusDir).map((entry) => {
    // Read as UTF-8 with no newline or whitespace changes: the sentences carry
    // curly quotes, ligatures and non-breaking spaces on purpose.
    const text = readFileSync(path.join(corpusDir, entry.document), "utf-8");
    const sidecar = readJson<{ plantedClauses: PlantedClause[] }>(path.join(corpusDir, entry.sidecar));
    return {
      id: entry.id,
      text,
      benign: entry.benign,
      plantedClauses: sidecar.plantedClauses,
      unusualButHarmless: entry.unusualButHarmless,
    };
  });
}

export function countOccurrences(text: string, sentence: string): number {
  if (sentence.length === 0) return 0;
  let count = 0;
  let from = 0;
  for (;;) {
    const at = text.indexOf(sentence, from);
    if (at === -1) return count;
    count += 1;
    from = at + 1;
  }
}

/**
 * Every sentence the gold set names must appear in its document exactly once,
 * character for character. Returns one message per sentence that does not.
 * Covers planted sentences, exit sentences, unusual-but-harmless sentences and
 * the question sets' expected source sentences.
 */
export function findSentenceProblems(corpusDir: string = DEFAULT_CORPUS_DIR): string[] {
  const problems: string[] = [];
  const manifest = loadManifest(corpusDir);
  const docs = loadGoldSet(corpusDir);

  const check = (docId: string, label: string, text: string, sentence: string) => {
    const n = countOccurrences(text, sentence);
    if (n !== 1) {
      problems.push(`${docId} ${label}: appears ${n} times, expected exactly 1 ("${sentence.slice(0, 60)}...")`);
    }
  };

  for (const doc of docs) {
    for (const planted of doc.plantedClauses) {
      check(doc.id, `${planted.id} sourceSentence`, doc.text, planted.sourceSentence);
      if (planted.exit) check(doc.id, `${planted.id} exit.sourceSentence`, doc.text, planted.exit.sourceSentence);
    }
    doc.unusualButHarmless.forEach((s, i) => check(doc.id, `unusualButHarmless[${i}]`, doc.text, s));
  }

  for (const entry of manifest) {
    if (!entry.questions) continue;
    const file = path.join(corpusDir, entry.questions);
    if (!existsSync(file)) {
      problems.push(`${entry.id}: questions file ${entry.questions} not found`);
      continue;
    }
    const doc = docs.find((d) => d.id === entry.id);
    if (!doc) continue;
    readJson<QuestionSet>(file).grounded?.forEach((q, i) =>
      check(entry.id, `questions.grounded[${i}]`, doc.text, q.expectedSourceSentence),
    );
  }

  return problems;
}
