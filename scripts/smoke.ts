// Runs the shared fixture contracts through the real analyzeDocument /
// answerFromDocument pipeline end to end and prints the results, including
// every flag's source citation. With OPENROUTER_API_KEY and
// OPENROUTER_MODEL set, it calls the real model. Without them, it falls
// back to a stub ModelClient built from the fixtures' own sidecar files, so
// the pipeline (prompt building, both hard gates, severity resolution,
// Clear-state construction) can still be exercised end to end with no key.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { analyzeDocument } from "../lib/analysis/analyze-document";
import { answerFromDocument } from "../lib/qa/answer-from-document";
import type { ModelClient } from "../lib/model/client";
import type { CandidateFlag } from "../lib/analysis/categories/registry";
import type { AnalysisResult } from "../lib/analysis/types";

loadDotEnvLocal();

const FIXTURES_DIR = path.join(__dirname, "..", "tests", "fixtures");

interface SidecarClause {
  category: string;
  expectedSeverity: "Dangerous" | "Unusual";
  sentence: string;
}

interface Sidecar {
  description: string;
  plantedClauses: SidecarClause[];
}

async function main() {
  const hasRealModel = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL);
  console.log(
    hasRealModel
      ? `Running against the real model (${process.env.OPENROUTER_MODEL}) via OpenRouter.\n`
      : "OPENROUTER_API_KEY / OPENROUTER_MODEL not set — running against a stub model client built from the fixtures' sidecar files.\n",
  );

  await runDocument("adhesion-contract", hasRealModel);
  await runDocument("clean-contract", hasRealModel);
}

async function runDocument(fixtureName: string, hasRealModel: boolean) {
  const text = readFileSync(path.join(FIXTURES_DIR, `${fixtureName}.txt`), "utf-8");
  const sidecar: Sidecar = JSON.parse(
    readFileSync(path.join(FIXTURES_DIR, `${fixtureName}.sidecar.json`), "utf-8"),
  );

  console.log("=".repeat(72));
  console.log(`${fixtureName}.txt — ${sidecar.description}`);
  console.log("=".repeat(72));

  const modelClient = hasRealModel ? undefined : stubClientFor(sidecar);

  let result: AnalysisResult;
  try {
    result = modelClient
      ? await analyzeDocument(text, [], modelClient)
      : await analyzeDocument(text, []);
  } catch (error) {
    console.error(`analyzeDocument failed for ${fixtureName}:`, error);
    process.exitCode = 1;
    return;
  }

  console.log(`\nSummary:\n  ${result.summary}\n`);

  if (result.clear) {
    console.log("Result: CLEAR");
    console.log(`  Standard categories checked: ${result.clear.checkedStandardCategories.join(", ") || "(none)"}`);
    console.log(`  Red lines checked: ${result.clear.checkedRedLines.length}`);
  } else {
    console.log(`Result: ${result.flags.length} flag(s)\n`);
    for (const flag of result.flags) {
      console.log(`  [${flag.severity}] ${flag.category}${flag.isGenericDetection ? " (generic detection)" : ""}`);
      console.log(`    Source sentence: "${flag.citation}"`);
      console.log(`    Explanation: ${flag.explanation}`);
      console.log(`    Counter-offer: ${flag.counterOffer}`);
      console.log("");
    }
  }

  const question = "What does this document say about ending the agreement?";
  try {
    const answer = modelClient
      ? await answerFromDocument(text, question, modelClient)
      : await answerFromDocument(text, question);
    console.log(`Q&A sample — "${question}"`);
    console.log(`  Grounded: ${answer.grounded}`);
    console.log(`  Answer: ${answer.answer}`);
    if (answer.supportingQuote) {
      console.log(`  Supporting quote: "${answer.supportingQuote}"`);
    }
  } catch (error) {
    console.error(`answerFromDocument failed for ${fixtureName}:`, error);
    process.exitCode = 1;
  }

  console.log("");
}

/**
 * Stub client used only when no real model is configured. Returns
 * candidates built directly from the fixture's own sidecar data (the
 * "known-planted" ground truth), so the real gates/severity-resolution
 * pipeline in analyzeDocument still runs for real on top of it — this
 * demonstrates the pipeline end to end, it does not simulate "the model
 * found this on its own."
 */
function stubClientFor(sidecar: Sidecar): ModelClient {
  const flags: CandidateFlag[] = sidecar.plantedClauses.map((clause) => {
    const base: CandidateFlag = {
      category: clause.category as CandidateFlag["category"],
      citation: clause.sentence,
      severity: clause.expectedSeverity,
      explanation: `This sentence matches the ${clause.category} pattern Redline checks for.`,
      counterOffer: "Consider proposing alternate language that limits or removes this obligation.",
    };

    if (clause.category === "auto-renewal") {
      base.attributes = {
        hasPriceIncrease: true,
        hasClearAdvanceNotice: false,
        cancellationWindowDays: 5,
      };
    }

    return base;
  });

  return {
    async completeJSON<T>({ schemaName }: { schemaName: string }): Promise<T> {
      if (schemaName === "redline-qa") {
        const firstSentence = sidecar.plantedClauses[0]?.sentence ?? "";
        return {
          grounded: firstSentence.length > 0,
          answer: firstSentence
            ? "The document addresses this in the sentence quoted below."
            : "This document's text doesn't cover that.",
          supportingQuote: firstSentence || undefined,
        } as T;
      }

      return {
        summary: `A stub-generated summary of this fixture document (${sidecar.plantedClauses.length} planted clause(s)).`,
        flags,
      } as T;
    },
  };
}

function loadDotEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

main();
