/**
 * extractSkillSignals
 *
 * Core heuristic-based skill matching engine used by CareerPath.
 *
 * This function compares resume text against a job description by:
 * 1. Normalizing both inputs (case, punctuation, spacing).
 * 2. Extracting unigram "skills" (single words) from both sources.
 * 3. Extracting multi-word phrases (bigrams/trigrams) from the resume
 *    to reinforce confidence in underlying skill signals.
 *
 * Scoring strategy:
 * - A direct unigram match between resume and job description
 *   counts as a strong base signal (+2).
 * - If a resume phrase (e.g. "react nodejs") appears in the job context,
 *   the individual words inside that phrase receive a smaller bonus (+1),
 *   reinforcing related skills without treating the phrase as a new skill.
 *
 * Noise reduction:
 * - Common filler terms (defined in IGNORE_WORDS) are penalized to prevent
 *   inflated scores from generic language.
 * - Low-signal matches are filtered out to avoid clutter.
 *
 * Design goals:
 * - Avoid hardcoded skill lists or domain-specific vocabularies.
 * - Remain field-agnostic and extensible to non-CS roles.
 * - Favor transparency and debuggability over opaque ML models.
 *
 * Returns:
 * - matched: Array of { skill, score } objects representing meaningful overlaps
 * - rawScores: Internal scoring map (useful for debugging and tuning)
 *
 * By: Nolan Dela Rosa
 * February 9, 2026
 */
import normalizeText from "./NormalizeText";
import { getNGrams } from "./NGramUtils";
import IGNORE_WORDS from "./IgnoreWords";

/**
 * extractSkillSignals
 *
 * Compares resume text and job description text to identify overlapping
 * skill signals using a lightweight, heuristic-based approach.
 *
 * Processing steps:
 * 1. Normalize both inputs to ensure consistent casing, punctuation,
 *    and token boundaries.
 * 2. Extract unigram tokens (single-word skills) from both resume
 *    and job description as the primary matching surface.
 * 3. Extract multi-word phrases (bigrams and trigrams) from the resume
 *    to reinforce confidence in underlying skills when those phrases
 *    appear in the job context.
 *
 * Scoring strategy:
 * - A direct unigram match between resume and job description is treated
 *   as a strong signal and awarded a base score (+2).
 * - When a resume phrase overlaps with job content, each individual word
 *   in that phrase receives a smaller bonus (+1) if it already exists
 *   as a matched skill. This reinforces relevance without treating
 *   phrases as standalone skills.
 *
 * Noise control:
 * - Generic or non-informative terms (defined in IGNORE_WORDS) are
 *   penalized to reduce false positives.
 * - Low-signal results are filtered out to keep the output focused
 *   on meaningful overlaps.
 *
 * Design goals:
 * - Field-agnostic (no hardcoded skill dictionaries).
 * - Transparent and debuggable scoring logic.
 * - Suitable as a deterministic baseline that can be extended or
 *   replaced by more advanced NLP techniques in the future.
 *
 * @param {string} resumeText - Raw resume qualifications text
 * @param {string} jobText - Raw job description text
 * @returns {{
 *   matched: Array<{ skill: string, score: number }>,
 *   rawScores: Record<string, number>
 * }}
 */
export function extractSkillSignals(resumeText, jobText) {
  const resume = normalizeText(resumeText);
  const job = normalizeText(jobText);

  const resumeSkills = getNGrams(resume, [1]);
  const jobSkills = getNGrams(job, [1]);

  const resumePhrases = getNGrams(resume, [2, 3]);
  const jobPhrases = getNGrams(job, [1]);

  const scores = {};

  // Score overlap
  resumeSkills.forEach((skill) => {
    if (!jobSkills.includes(skill)) return;

    if (!scores[skill]) scores[skill] = 0;
    scores[skill] += 2;
  });

  resumePhrases.forEach((phrase) => {
    if (!jobPhrases.includes(phrase)) return;

    const words = phrase.split(" ");

    words.forEach((word) => {
      if (!scores[word]) return;
      scores[word] += 1;
    });
  });

  // Penalize ignored terms
  Object.keys(scores).forEach((token) => {
    if (IGNORE_WORDS.includes(token)) {
      scores[token] -= 3;
    }
  });

  // Filter low-signal junk
  const filtered = Object.entries(scores)
    .filter(([, score]) => score >= 2)
    .sort((a, b) => b[1] - a[1]);

  const matched = filtered.map(([skill, score]) => ({ skill, score }));

  return {
    matched,
    rawScores: scores,
  };
}
