/**
 * The seam every model call in this app goes through. Per the standing
 * product answer (CLAUDE.md, PRD.md): all model calls route through
 * OpenRouter's OpenAI-compatible endpoint — never a provider SDK directly.
 *
 * `analyzeDocument` (lib/analysis/analyze-document.ts) and, later, ticket
 * 10's `answerFromDocument` both take a `ModelClient` as an optional,
 * injectable dependency, defaulting to `createModelClient()`. Tests inject
 * `createStubModelClient` (tests/helpers/stub-model-client.ts) instead.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ModelClient {
  completeJSON<T>(params: { system: string; user: string; schemaName: string }): Promise<T>;
}

export class ModelClientError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ModelClientError";
  }
}

/**
 * Production `ModelClient`. Calls OpenRouter's chat-completions endpoint
 * with `response_format: { type: "json_object" }` (broad-compatibility JSON
 * mode, not strict `json_schema` mode — that isn't reliably supported across
 * every OpenRouter provider). Throws a clear `ModelClientError` on any
 * missing config, request failure, or unparsable response — it never
 * returns a fake/empty result silently. Callers are responsible for turning
 * a thrown error into a user-facing message.
 */
export function createModelClient(): ModelClient {
  return {
    async completeJSON<T>({
      system,
      user,
      schemaName,
    }: {
      system: string;
      user: string;
      schemaName: string;
    }): Promise<T> {
      const apiKey = process.env.OPENROUTER_API_KEY;
      const model = process.env.OPENROUTER_MODEL;

      if (!apiKey) {
        throw new ModelClientError(
          "OPENROUTER_API_KEY isn't set — can't reach the model.",
        );
      }
      if (!model) {
        throw new ModelClientError(
          "OPENROUTER_MODEL isn't set — can't reach the model.",
        );
      }

      let response: Response;
      try {
        response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
            provider: {
              order: ["fireworks"],
              allow_fallbacks: false,
              require_parameters: true,
            },
            reasoning: { effort: "low" },
          }),
        });
      } catch (cause) {
        throw new ModelClientError(
          `Request to OpenRouter failed for schema "${schemaName}".`,
          { cause },
        );
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new ModelClientError(
          `OpenRouter returned ${response.status} for schema "${schemaName}": ${body}`,
        );
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch (cause) {
        throw new ModelClientError(
          `OpenRouter response for schema "${schemaName}" wasn't valid JSON.`,
          { cause },
        );
      }

      const content = (
        payload as { choices?: { message?: { content?: string } }[] }
      )?.choices?.[0]?.message?.content;

      if (typeof content !== "string" || content.trim().length === 0) {
        throw new ModelClientError(
          `OpenRouter response for schema "${schemaName}" had no message content.`,
        );
      }

      try {
        return JSON.parse(content) as T;
      } catch (cause) {
        throw new ModelClientError(
          `Model output for schema "${schemaName}" wasn't valid JSON.`,
          { cause },
        );
      }
    },
  };
}
