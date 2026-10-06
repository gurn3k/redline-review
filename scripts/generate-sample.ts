// Generates the public sample analysis (/sample) by running the Coldline
// sample contract through the real analyzeDocument / answerFromDocument
// pipeline once, and writes the result to lib/sample/coldline-analysis.json.
// The sample page and the landing page render that file as-is: nothing in it
// is hand-written. Paid: one analysis call plus one call per sample question,
// so it refuses to run without a real model configured, and prints what it
// is about to do first.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { analyzeDocument } from "../lib/analysis/analyze-document";
import { answerFromDocument } from "../lib/qa/answer-from-document";

loadDotEnvLocal();

const SAMPLE_DIR = path.join(__dirname, "..", "lib", "sample");
const TEXT_FILE = "coldline-equipment-service-agreement.txt";
const OUTPUT_FILE = "coldline-analysis.json";

// One red line, so the sample shows the red-lines feature working too.
const RED_LINES = ["No late-payment interest above 1% per month."];

// One question the document answers and one it doesn't, so the sample shows
// both a grounded answer and a refusal.
const QUESTIONS = [
  "How do I stop this agreement from renewing?",
  "Does the monthly fee cover replacement parts?",
];

async function main() {
  const model = process.env.OPENROUTER_MODEL;
  if (!process.env.OPENROUTER_API_KEY || !model) {
    console.error("OPENROUTER_API_KEY and OPENROUTER_MODEL must be set (.env.local). No stub: the sample must be real output.");
    process.exit(1);
  }

  const documentText = readFileSync(path.join(SAMPLE_DIR, TEXT_FILE), "utf-8");
  console.log(`Model: ${model}. Paid calls: 1 analysis + ${QUESTIONS.length} questions.`);

  const analysis = await analyzeDocument(documentText, RED_LINES);
  const qa = [];
  for (const question of QUESTIONS) {
    qa.push({ question, ...(await answerFromDocument(documentText, question)) });
  }

  const sample = {
    fileName: "Coldline equipment service agreement.txt",
    generatedAt: new Date().toISOString(),
    model,
    redLines: RED_LINES,
    documentText,
    analysis,
    qa,
  };
  writeFileSync(path.join(SAMPLE_DIR, OUTPUT_FILE), JSON.stringify(sample, null, 2) + "\n");

  console.log(`\nSummary: ${analysis.summary}\n`);
  for (const flag of analysis.flags) {
    console.log(`[${flag.severity}] ${flag.category}: "${flag.citation}"`);
  }
  for (const entry of qa) {
    console.log(`\nQ: ${entry.question}\nA (${entry.grounded ? "grounded" : "declined"}): ${entry.answer}`);
  }
  console.log(`\nWrote lib/sample/${OUTPUT_FILE}`);
}

function loadDotEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
