// npm run eval:build-gold-set-2
// Turns eval/business-set/src/*.src.txt into documents/, sidecars/ and manifest.json.
//
// Why a build step: every planted sentence has to be an exact substring of its
// document. The source files mark each planted sentence in place, and this script
// cuts the sentence out of the same text it writes, so the two cannot drift.
//
// Source syntax (one paragraph per line, no hard wrapping):
//   @kind: <what kind of document this is>          header line, not part of the document
//   «P|<clause-type>|<Dangerous|Unusual|n/a>»text«/P»  a planted clause
//   «H»text«/H»                                      unusual-but-harmless: a flag here is an over-flag
//   {nbsp} {fi} {fl} {2sp}                           a non-breaking space, a ﬁ or ﬂ ligature, two spaces
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "eval", "gold-set-2-user-created");
const SRC = path.join(ROOT, "src");
const CLAUSE_TYPES = [
  "arbitration-and-class-action-waiver",
  "unilateral-modification",
  "non-compete",
  "auto-renewal",
  "limitation-of-liability",
  "indemnification",
  "fee-escalators-and-late-fees",
  "personal-guarantee",
  "unilateral-termination",
  "fee-escalator",
  "ip-assignment",
  "data-privacy-overreach",
];
const TOKENS: [string, string][] = [
  ["{nbsp}", " "],
  ["{fi}", "ﬁ"],
  ["{fl}", "ﬂ"],
  ["{2sp}", "  "],
];

interface Planted {
  id: string;
  clauseType: string;
  sourceSentence: string;
  expectedSeverity: string;
  exit: null;
}

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function build() {
  rmSync(path.join(ROOT, "documents"), { recursive: true, force: true });
  rmSync(path.join(ROOT, "sidecars"), { recursive: true, force: true });
  mkdirSync(path.join(ROOT, "documents"), { recursive: true });
  mkdirSync(path.join(ROOT, "sidecars"), { recursive: true });

  const files = readdirSync(SRC).filter((f) => f.endsWith(".src.txt")).sort();
  const manifest: object[] = [];

  for (const file of files) {
    const id = file.replace(/^\d+-/, "").replace(/\.src\.txt$/, "");
    let raw = readFileSync(path.join(SRC, file), "utf-8").replace(/\r/g, "");
    for (const [token, char] of TOKENS) raw = raw.split(token).join(char);

    const lines = raw.split("\n");
    let kind = "";
    while (lines.length > 0 && lines[0].startsWith("@")) {
      const header = lines.shift()!;
      if (header.startsWith("@kind:")) kind = header.slice(6).trim();
    }
    if (!kind) fail(file, "missing @kind header");
    const body = lines.join("\n").replace(/^\n+/, "").replace(/\s+$/, "") + "\n";

    // Cut the markers out, in document order, recording each sentence.
    const planted: Planted[] = [];
    const harmless: string[] = [];
    const marker = /«P\|([a-z-]+)\|([A-Za-z/]+)»([\s\S]*?)«\/P»|«H»([\s\S]*?)«\/H»/g;
    let text = "";
    let last = 0;
    for (const m of body.matchAll(marker)) {
      text += body.slice(last, m.index);
      if (m[3] !== undefined) {
        if (!CLAUSE_TYPES.includes(m[1])) fail(file, `unknown clause type "${m[1]}"`);
        const sentence = m[3];
        planted.push({
          id: `P-${String(planted.length + 1).padStart(2, "0")}`,
          clauseType: m[1],
          sourceSentence: sentence,
          expectedSeverity: m[2],
          exit: null,
        });
        text += sentence;
      } else {
        harmless.push(m[4]);
        text += m[4];
      }
      last = m.index! + m[0].length;
    }
    text += body.slice(last);

    if (/[«»]|«|»|\{(nbsp|fi|fl|2sp)\}/.test(text)) fail(file, "a marker or token was left unresolved");
    if (text.includes("\t")) fail(file, "tab in document");
    for (const p of planted) {
      if (text.split(p.sourceSentence).length !== 2) fail(file, `${p.id} does not appear exactly once`);
      if (p.sourceSentence.includes("\n")) fail(file, `${p.id} spans more than one paragraph`);
    }
    for (const h of harmless) {
      if (text.split(h).length !== 2) fail(file, `a harmless sentence does not appear exactly once: ${h.slice(0, 50)}`);
    }

    const title = text.split("\n").find((l) => l.trim().length > 0)!.trim();
    writeFileSync(path.join(ROOT, "documents", `${id}.txt`), text);
    writeFileSync(
      path.join(ROOT, "sidecars", `${id}.json`),
      JSON.stringify(
        { document: `${id}.txt`, title, kind, sourceKind: "pasted", plantedClauses: planted },
        null,
        2,
      ) + "\n",
    );
    manifest.push({
      id,
      document: `documents/${id}.txt`,
      sidecar: `sidecars/${id}.json`,
      provenance: "written-for-this-suite",
      benign: planted.length === 0,
      unusualButHarmless: harmless,
    });
    console.log(`${id}: ${planted.length} planted, ${harmless.length} harmless decoys`);
  }

  writeFileSync(
    path.join(ROOT, "manifest.json"),
    JSON.stringify(
      {
        corpus: "redline-business-v1",
        version: 1,
        whatThisIs:
          "Twenty business documents, fifteen with planted clauses and five clean, written to test Redline's own purpose: a small business owner reviewing paper a counterparty presented. Generated by build.ts from src/. None was collected from the world.",
        documents: manifest,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`\n${files.length} documents written.`);
}

build();
