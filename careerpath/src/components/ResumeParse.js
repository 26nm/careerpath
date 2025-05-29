/**
 * ResumeParse Component
 * ---------------------
 * A React component that allows users to compare their resume qualifications
 * against a job description to evaluate skill alignment.
 *
 * Features:
 * - Users can manually paste their qualifications and a job description
 * - A basic matching algorithm identifies overlapping skills from a predefined list
 * - Displays an analysis result showing found skills, job-required skills,
 *   matched items, and a match rate percentage
 *
 * This component serves as the foundation for future resume parsing automation
 * and job-to-resume relevance scoring.
 *
 * Props:
 * - resumeText (optional): placeholder prop for future integration with auto-parsed resumes
 *
 * By: Nolan Dela Rosa
 *
 * May 29, 2025
 */
import React, { useState } from "react";

/**
 * ResumeParse
 * -----------
 * A React functional component that allows users to manually input resume qualifications
 * and a job description, then compares the two to identify overlapping skills.
 *
 * Functionality:
 * - Captures user input for resume content and job posting content via textareas
 * - On analysis, runs a simple keyword-based comparison to detect skill overlap
 * - Displays an analysis summary, including:
 *    • Skills found in the resume
 *    • Skills required in the job posting
 *    • Matched skills
 *    • A match percentage score
 *
 * This component is part of the resume parsing pipeline and is useful for early-stage
 * manual testing before automated text extraction is fully integrated.
 *
 * Props:
 * - resumeText (optional): placeholder prop for future integration with auto-parsed data
 */
function ResumeParse({ resumeText }) {
  const [qualifications, setQualifications] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);

  /**
   * handleAnalyze
   * -------------
   * Triggers the resume-to-job matching process when the user clicks "Analyze Match."
   *
   * Steps:
   * - Calls the analyzeMatch() function with the user's input from the qualifications
   *   and job description textareas
   * - Stores the resulting analysis object in component state via setAnalysis()
   *   so it can be displayed in the UI
   *
   * The analysis includes found skills, job-required skills, matched skills,
   * and a calculated match rate percentage.
   */
  const handleAnalyze = () => {
    const result = analyzeMatch(qualifications, jobDescription);
    setAnalysis(result);
  };

  return (
    <div className="resume-parser">
      <h3>Resume Analyzer</h3>

      <textarea
        placeholder="Paste Qualifications from Resume"
        value={qualifications}
        onChange={(e) => setQualifications(e.target.value)}
      />

      <textarea
        placeholder="Paste Job Description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <button onClick={handleAnalyze}>Analyze Match</button>

      {analysis && (
        <div className="analysis-result">
          <h4>Analysis Result</h4>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * analyzeMatch
 * ------------
 * Compares a user's resume qualifications against a job description
 * to identify overlapping skills and calculate a match rate.
 *
 * Steps:
 * - Uses a predefined list of common tech skills
 * - Filters for skills found in the resume text (`foundSkills`)
 * - Filters for skills mentioned in the job description (`jobSkills`)
 * - Computes the intersection of both sets (`matched`)
 * - Calculates a match rate as a percentage of job skills that are also found in the resume
 *
 * Returns:
 * An object containing:
 * - foundSkills: Skills detected in the resume
 * - jobSkills: Skills required by the job description
 * - matched: Skills that appear in both
 * - matchRate: A percentage score representing resume-to-job alignment
 */
function analyzeMatch(qualifications, jobDescription) {
  const skills = ["JavaScript", "React", "Firebase", "SQL", "Python"];

  const foundSkills = skills.filter((skill) =>
    qualifications.toLowerCase().includes(skill.toLowerCase())
  );

  const jobSkills = skills.filter((skill) =>
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );

  const matched = foundSkills.filter((skill) => jobSkills.includes(skill));

  return {
    foundSkills,
    jobSkills,
    matched,
    matchRate: `${Math.round((matched.length / jobSkills.length) * 100)}%`,
  };
}

export default ResumeParse;
