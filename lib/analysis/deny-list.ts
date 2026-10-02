/**
 * Counter-offer banned-word gate (PRD "What good looks like" — no counter-
 * offer or flag asserts a guarantee). Matching is case-insensitive.
 */
export const DENY_LIST_WORDS = [
  "guarantee",
  "guarantees",
  "guaranteed",
  "protected",
  "protects",
  "protection",
  "enforceable",
  "enforceability",
];

/**
 * A personal-guarantee counter-offer has to name the guarantee it
 * renegotiates, so the clause's own name is not a banned word there.
 * "guaranteed" stays banned: it promises an outcome rather than naming
 * the clause.
 */
export const PERSONAL_GUARANTEE_CLAUSE_WORDS = ["guarantee", "guarantees"];

export function containsDenyListedWord(text: string, allowedWords: string[] = []): boolean {
  const lower = text.toLowerCase();
  return DENY_LIST_WORDS.some((word) => !allowedWords.includes(word) && lower.includes(word));
}
