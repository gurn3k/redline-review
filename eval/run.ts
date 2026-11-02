// npm run eval
// Runs every document in the gold set's manifest.json through analyzeDocument
// exactly as scripts/smoke.ts does (same call, empty red lines, the default
// OpenRouter client from .env.local) and scores the result. The only addition
// is a thin wrapper around the real model client that records what the model
// returned before the pipeline's gates, so groundedness can be measured on all
// of the model's flags and not only on the ones that survived.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { analyzeDocument } from "../lib/analysis/analyze-document";
import { createModelClient, type ModelClient } from "../lib/model/client";
import { CORPUS_DIRS, findSentenceProblems, loadGoldSet } from "./corpus";
import {
  formatRate,
  scoreDocument,
  summarize,
  TYPE_MAP,
  type DocumentScore,
  type RawCandidate,
  type Summary,
} from "./metrics";

loadDotEnvLocal();

const RUNS_DIR = path.join(process.cwd(), "eval-runs");
const CALL_TIMEOUT_MS = 240_000;

async function main() {
  const setName = parseSetName();
  const corpusDir = CORPUS_DIRS[setName];
  if (!corpusDir) {
    console.error(`Unknown set "${setName}". Use one of: ${Object.keys(CORPUS_DIRS).join(", ")}.`);
    process.exitCode = 1;
    return;
  }
  if (!process.env.OPENROUTER_API_KEY || !process.env.OPENROUTER_MODEL) {
    console.error("OPENROUTER_API_KEY and OPENROUTER_MODEL must be set in .env.local. The eval has no stub mode: a stub would only score itself.");
    process.exitCode = 1;
    return;
  }

  const problems = findSentenceProblems(corpusDir);
  if (problems.length > 0) {
    console.error("The gold set has sentences that are not in their documents exactly once:\n" + problems.join("\n"));
    process.exitCode = 1;
    return;
  }

  const startedAt = new Date();
  const docs = loadGoldSet(corpusDir);
  const scores: DocumentScore[] = [];
  const leftOut: { document: string; reason: string }[] = [];

  console.log(`Set: ${setName}. Running ${docs.length} documents against ${process.env.OPENROUTER_MODEL} via OpenRouter.\n`);

  for (const doc of docs) {
    const captured: { raw: RawCandidate[] } = { raw: [] };
    const client = recordingClient(createModelClient(), captured);
    try {
      const result = await withTimeout(analyzeDocument(doc.text, [], client), CALL_TIMEOUT_MS);
      const score = scoreDocument(
        doc,
        captured.raw,
        result.flags.map((f) => ({ category: f.category, citation: f.citation, severity: f.severity })),
      );
      scores.push(score);
      console.log(`  ${doc.id}: ${score.rawFlagCount} returned, ${score.shownFlagCount} shown`);
    } catch (error) {
      const reason = error instanceof Error ? `${error.message}${error.cause instanceof Error ? ` (${error.cause.message})` : ""}` : String(error);
      leftOut.push({ document: doc.id, reason });
      console.log(`  ${doc.id}: LEFT OUT, model call failed`);
    }
  }

  const summary = summarize(scores, leftOut.map((l) => l.document));
  const report = renderReport(setName, startedAt, docs.length, summary, scores, leftOut);
  console.log("\n" + report);

  mkdirSync(RUNS_DIR, { recursive: true });
  const stamp =
    startedAt.toISOString().replace(/\.\d+Z$/, "Z").replace(/:/g, "-") + (setName === "gold" ? "" : `-${setName}`);
  writeFileSync(path.join(RUNS_DIR, `${stamp}.txt`), report + "\n");
  writeFileSync(
    path.join(RUNS_DIR, `${stamp}.json`),
    JSON.stringify(
      {
        set: setName,
        startedAt: startedAt.toISOString(),
        model: process.env.OPENROUTER_MODEL,
        documentsInManifest: docs.length,
        documentsLeftOut: leftOut,
        summary,
        // Every flag the model returned, with whether it was shown and whether it matched a planted clause.
        flags: scores.flatMap((s) =>
          s.flags.map((f) => ({
            document: f.document,
            clauseType: f.clauseType,
            severity: f.severity,
            quotedSentence: f.quotedSentence,
            groundedInDocument: f.grounded,
            shownToReader: f.shown,
            matchedPlantedClause: f.matchedPlanted.length > 0,
            matchedPlantedIds: f.matchedPlanted,
            matchedOutOfScopeType: f.matchedOutOfScope,
            matchedUnusualButHarmless: f.matchedUnusualButHarmless,
            namedRightType: f.typeCorrect,
          })),
        ),
        plantedClauses: scores.flatMap((s) => s.planted),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`\nSaved eval-runs/${stamp}.txt and eval-runs/${stamp}.json`);

  if (scores.length === 0) process.exitCode = 1;
}

function recordingClient(inner: ModelClient, captured: { raw: RawCandidate[] }): ModelClient {
  return {
    async completeJSON<T>(params: { system: string; user: string; schemaName: string }): Promise<T> {
      const out = await inner.completeJSON<T>(params);
      const flags = (out as { flags?: unknown } | null)?.flags;
      if (params.schemaName === "redline-analysis" && Array.isArray(flags)) {
        captured.raw = flags.filter((f) => f && typeof f === "object") as RawCandidate[];
      }
      return out;
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`No response within ${ms / 1000} seconds.`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function renderReport(
  setName: string,
  startedAt: Date,
  documentsInManifest: number,
  s: Summary,
  scores: DocumentScore[],
  leftOut: { document: string; reason: string }[],
): string {
  const L: string[] = [];
  L.push(`Redline eval, set "${setName}", started ${startedAt.toISOString()}`);
  L.push(`Model: ${process.env.OPENROUTER_MODEL}`);
  L.push("");
  L.push("These numbers are an upper bound. A model wrote the gold set, so they are not a promise to a reader.");
  L.push("");
  L.push(`Documents scored: ${s.documentsScored}/${documentsInManifest}. Left out because the model call failed: ${leftOut.length}.`);
  for (const l of leftOut) L.push(`  - ${l.document}: ${l.reason}`);
  L.push("A document left out is removed from every denominator below. It is not a miss.");
  L.push("");
  L.push("RECALL (planted clauses of in-scope types that a shown flag overlaps)");
  L.push(`  Found:               ${formatRate(s.recall)}`);
  L.push(`  Found, right type:   ${formatRate(s.recallRightType)} of those found`);
  if (s.severity.overall.of > 0) {
    L.push(`  Severity as expected: ${formatRate(s.severity.overall)} of those found with the right type`);
    L.push(`    expected Dangerous: ${formatRate(s.severity.expectedDangerous)}   expected Unusual: ${formatRate(s.severity.expectedUnusual)}`);
  }
  L.push("  By clause type (found / planted; right type / found):");
  for (const t of s.recallByType) {
    L.push(`    ${t.goldType.padEnd(38)} ${formatRate(t.recall).padEnd(16)} right type ${formatRate(t.rightType)}`);
  }
  L.push("  By characters in the planted sentence:");
  for (const c of s.recallByCharacters) L.push(`    ${c.label.padEnd(44)} ${formatRate(c.recall)}`);
  L.push("");
  L.push("OUT OF SCOPE (never counted as misses)");
  for (const o of s.outOfScope) L.push(`  ${o.goldType}: ${o.planted} planted in scored documents. ${o.reason}`);
  L.push("");
  L.push("GROUNDEDNESS (quoted sentence appears in the document character for character)");
  L.push(`  Everything the model returned: ${formatRate(s.groundedness)}`);
  L.push(`  Flags shown to the reader:     ${formatRate(s.shownGroundedness)} (the pipeline drops ungrounded flags, so this is 100% by construction)`);
  L.push("");
  L.push("CLEAN DOCUMENTS");
  L.push(`  Came back Clear:        ${formatRate(s.cleanDocuments.returnedClear)}`);
  L.push(`  Flags shown on them:    ${s.cleanDocuments.flagsShown}`);
  L.push(`  Flags the model returned on them, before the gates: ${s.cleanDocuments.flagsRaw}`);
  L.push("");
  L.push("SHOWN FLAGS ON THE DOCUMENTS WITH PLANTED CLAUSES");
  const f = s.flagsOnLoadedDocuments;
  L.push(`  Total ${f.total}: ${f.onInScopePlanted} on an in-scope planted clause, ${f.onOutOfScopePlanted} on an out-of-scope one, ${f.onUnusualButHarmless} on an unusual-but-harmless sentence, ${f.onNothingPlanted} on nothing listed.`);
  L.push("");
  L.push("Type mapping used: " + TYPE_MAP.map((m) => `${m.goldType} -> ${m.inScope ? m.productTypes.join("") : "(out of scope)"}`).join("; "));
  L.push("");
  L.push("PER DOCUMENT");
  for (const sc of scores) {
    const found = sc.planted.filter((p) => p.inScope && p.found).length;
    const inScope = sc.planted.filter((p) => p.inScope).length;
    L.push(`  ${sc.document}${sc.benign ? " (clean)" : ""}: ${sc.rawFlagCount} returned, ${sc.shownFlagCount} shown${sc.benign ? "" : `, found ${found}/${inScope}`}`);
  }
  L.push("");
  L.push("EVERY FLAG THE MODEL RETURNED");
  for (const sc of scores) {
    for (const fl of sc.flags) {
      const tag = [
        fl.shown ? "shown" : "dropped by gates",
        fl.grounded ? "grounded" : "NOT in document",
        fl.matchedPlanted.length > 0 ? `matches ${fl.matchedPlanted.join(",")}${fl.matchedOutOfScope ? " (out of scope)" : fl.typeCorrect ? ", right type" : ", wrong type"}` : fl.matchedUnusualButHarmless ? "on unusual-but-harmless" : "matches no planted clause",
      ].join("; ");
      L.push(`  [${sc.document}] ${fl.clauseType} / ${fl.severity} / ${tag}`);
      L.push(`      "${fl.quotedSentence}"`);
    }
  }
  return L.join("\n");
}

function parseSetName(): string {
  const i = process.argv.indexOf("--set");
  return i === -1 ? "gold" : (process.argv[i + 1] ?? "");
}

// Same loader scripts/smoke.ts uses; smoke.ts runs main() on import, so it cannot be shared.
function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

main();
