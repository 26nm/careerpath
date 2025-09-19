/**
 * ignoreWords.js
 *
 * This module exports an array of common stop words and generic terms
 * that should be excluded from skill matching in the Resume Analyzer component.
 *
 * These words are typically non-technical, overly broad, or context-irrelevant
 * (e.g., "responsibilities", "preferred", "job", etc.), and would otherwise
 * skew the match rate by being falsely interpreted as skills.
 *
 * The ignore list improves accuracy when calculating matched vs. missing skills.
 *
 * Exported:
 * - ignoreWords: Array<string>
 *
 * By: Nolan Dela Rosa
 * August 31, 2025
 */
const ignoreWords = [
  "a",
  "ability",
  "an",
  "and",
  "apply",
  "are",
  "as",
  "at",
  "be",
  "bonus",
  "by",
  "candidate",
  "developed",
  "environment",
  "etc",
  "experience",
  "familiarity",
  "for",
  "have",
  "ideal",
  "include",
  "if",
  "in",
  "is",
  "it",
  "job",
  "knowledge",
  "looking",
  "management",
  "manager",
  "must",
  "of",
  "on",
  "our",
  "or",
  "perform",
  "please",
  "plus",
  "position",
  "preferred",
  "proficient",
  "projects",
  "required",
  "responsibilities",
  "responsible",
  "role",
  "resume",
  "seeking",
  "should",
  "similar",
  "skilled",
  "skills",
  "someone",
  "strong",
  "tasks",
  "team",
  "that",
  "the",
  "this",
  "time",
  "to",
  "tools",
  "used",
  "using",
  "we",
  "will",
  "with",
  "work",
  "you",
  "your",
];

export default ignoreWords;
