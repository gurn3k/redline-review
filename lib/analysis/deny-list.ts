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

export function containsDenyListedWord(text: string): boolean {
  const lower = text.toLowerCase();
  return DENY_LIST_WORDS.some((word) => lower.includes(word));
}
