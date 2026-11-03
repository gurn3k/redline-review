import { describe, expect, it } from "vitest";
import { analyzeDocument } from "@/lib/analysis/analyze-document";
import { liabilityCapFeeEscalatorCategory } from "@/lib/analysis/categories/definitions/liability-cap-fee-escalator";
import type { ModelClient } from "@/lib/model/client";

/**
 * The eval (eval-runs/2026-11-02T15-15-46Z) found 1 of 9 fee clauses in the
 * gold set. The prompt only asked for fees that escalate "without clear
 * notice or an exit", so the model skipped price rises the company can make
 * at its own discretion, late-payment charges, interest and repayment terms.
 * These tests pin down that the instructions the model receives name them.
 */
async function promptSentToModel(): Promise<string> {
  let sent = "";
  const recorder: ModelClient = {
    async completeJSON<T>(params: { system: string; user: string; schemaName: string }): Promise<T> {
      sent = `${params.system}\n${params.user}`;
      return { summary: "A contract.", flags: [] } as T;
    },
  };
  await analyzeDocument("Some contract text.", [], recorder, [liabilityCapFeeEscalatorCategory]);
  return sent.toLowerCase();
}

describe("fee-escalator instructions reach the model", () => {
  it("asks for price or rent increases the other side can make on its own", async () => {
    const prompt = await promptSentToModel();
    const instructions = liabilityCapFeeEscalatorCategory.promptInstructions.toLowerCase();
    expect(prompt).toContain(instructions);
    expect(instructions).toMatch(/increase|adjust|revise/);
    expect(instructions).toMatch(/own discretion|at (its|their|our) discretion/);
  });

  it("asks for late-payment charges and interest on unpaid amounts", async () => {
    const prompt = await promptSentToModel();
    const instructions = liabilityCapFeeEscalatorCategory.promptInstructions.toLowerCase();
    expect(prompt).toContain(instructions);
    expect(instructions).toContain("late");
    expect(instructions).toContain("interest");
  });

  it("does not limit fee clauses to ones lacking notice or an exit", async () => {
    const instructions = liabilityCapFeeEscalatorCategory.promptInstructions.toLowerCase();
    // A fee clause that gives 30 days' notice still costs the reader money.
    expect(instructions).toMatch(/even (if|when|where)[^.]*notice/);
  });
});
