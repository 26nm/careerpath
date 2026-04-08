/**
 * normalizeText
 *
 * Normalizes raw input text into a consistent format to improve the accuracy
 * of downstream token extraction and matching. This function standardizes
 * variations in casing, formatting, and common technology naming conventions.
 *
 * Processing steps:
 * 1. Converts all text to lowercase to ensure case-insensitive matching.
 * 2. Normalizes common technology terms and variants into a single canonical form:
 *    - "Node.js", "node js" → "nodejs"
 *    - "React.js" → "react"
 *    - "RESTful APIs" → "restful"
 *    - "CI/CD", "ci cd", "ci-cd" → "cicd"
 *    - "Google Cloud Platform" → "gcp"
 *    - "Amazon Web Services", "AWS Cloud" → "aws"
 *    - "HTML5", "CSS3" → "html", "css"
 * 3. Collapses multiple spaces into a single space to maintain consistent token boundaries.
 * 4. Trims leading and trailing whitespace.
 *
 * Design goals:
 * - Reduce variation in how technologies are written across resumes and job descriptions
 * - Improve match reliability by mapping equivalent terms to a unified representation
 * - Keep transformations lightweight and deterministic (no external dependencies)
 * - Maintain field-agnostic behavior while handling common technical patterns
 *
 * Example:
 * Input:
 *   "Experience with Node.js, React.js, and Amazon Web Services (AWS)."
 *
 * Output:
 *   "experience with nodejs, react, and aws."
 *
 * @param {string} text - Raw input text (resume or job description)
 * @returns {string} Normalized text string
 */
export default function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/node\.?js/g, "nodejs")
    .replace(/react\.?js/g, "react")
    .replace(/vue\.?js/g, "vue")
    .replace(/angular\.?js/g, "angular")
    .replace(/restful api(s)?/g, "restful")
    .replace(/ci\/cd|ci cd|ci-cd/g, "cicd")
    .replace(/google cloud platform/g, "gcp")
    .replace(/amazon web services|aws cloud/g, "aws")
    .replace(/tailwind css/g, "tailwind")
    .replace(/html5/g, "html")
    .replace(/css3/g, "css")
    .replace(/\s+/g, " ")
    .trim();
}
