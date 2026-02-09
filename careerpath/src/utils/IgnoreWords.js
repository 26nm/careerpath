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
const IGNORE_WORDS = [
  "bachelor",
  "master",
  "degree",
  "graduation",
  "years",
  "experience",
  "responsible for",
  "compensation",
  "benefits",
  "salary",
  "meetings",
  "stand ups",
];

export default IGNORE_WORDS;
