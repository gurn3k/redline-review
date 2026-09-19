import type { ModelClient } from "@/lib/model/client";

/**
 * A `ModelClient` stub that always returns the given response, regardless
 * of what's asked. Used by tests to stand in for "what the model said" so
 * the gating/severity/Clear-state logic that runs after the model responds
 * can be exercised deterministically, without a real API call.
 */
export function createStubModelClient(response: unknown): ModelClient {
  return {
    async completeJSON<T>(): Promise<T> {
      return response as T;
    },
  };
}
