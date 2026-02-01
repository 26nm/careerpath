/* eslint-disable no-useless-escape */
/**
 * ResumeParse()
 *
 * This React component allows users to compare their resume qualifications
 * with a job description and analyze how well they match.
 *
 * Features:
 * - Textareas for users to input resume qualifications and job descriptions
 * - "Analyze Match" button compares skill overlap and returns match data
 * - Match result includes percentage and matched skills displayed as tags
 * - Option to save analysis results to Firestore under the user's account
 * - Displays a list of previously saved analyses (if any)
 *
 * Firebase Integration:
 * - Reads and writes analysis data from the user's `resumeAnalysis` subcollection
 *
 * Returns:
 * - JSX containing form inputs, match results, and saved result display
 *
 * By: Nolan Dela Rosa
 * July 26, 2025
 */

import React, { useState, useEffect } from "react";
import ignoreWords from "../utils/IgnoreWords";
import normalizeText from "../utils/NormalizeText";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { getNGrams } from "../utils/NGramUtils";
import "../styles/ResumeAnalyzer.css";

/**
 * ResumeParse()
 *
 * Renders the Resume Analyzer UI and manages logic for analyzing and saving match results.
 *
 * Responsibilities:
 * - Accepts user input for resume qualifications and job description
 * - Calculates skill match using `analyzeMatch()` when "Analyze Match" is clicked
 * - Displays match rate and matched skills visually
 * - Saves analysis result to Firestore under the current user's account
 * - Fetches and displays a list of previously saved analyses on load
 *
 * State:
 * - qualifications: resume input from the user
 * - jobDescription: job description input from the user
 * - analysis: object containing match rate and matched skills
 * - savedAnalyses: array of previously saved analysis objects from Firestore
 *
 * Firebase:
 * - Reads/writes from/to `users/{uid}/resumeAnalysis` collection
 */
function ResumeParse({ resumeText }) {
  const [qualifications, setQualifications] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const { currentUser } = useAuth();
  const location = useLocation();
  const resumeTextFromNav = location.state?.resumeText;

  /**
   * Auto-fills the qualifications textarea with extracted resume text
   * whenever a new `resumeText` prop is passed to the component.
   * This ensures the analyzer starts with the actual parsed content
   * instead of requiring manual copy-paste.
   */
  useEffect(() => {
    const textToUse = resumeText || resumeTextFromNav;

    if (textToUse) {
      const formatted = Array.isArray(textToUse)
        ? textToUse.join(", ")
        : textToUse;
      setQualifications(formatted);
    }
  }, [resumeText, resumeTextFromNav]);

  /**
   * handleAnalyze()
   *
   * Triggers the analysis process by comparing resume qualifications
   * with the job description using `analyzeMatch()`, then updates the
   * component state with the result.
   */
  const handleAnalyze = () => {
    const result = analyzeMatch(qualifications, jobDescription);
    setAnalysis(result);
  };

  /**
   * handleSave()
   *
   * Saves the current analysis result to Firestore under the user's
   * `resumeAnalysis` subcollection, along with a timestamp.
   *
   * Aborts if there is no logged-in user or no analysis to save.
   */
  const handleSave = async () => {
    if (!currentUser || !analysis) return;

    const docRef = collection(db, "users", currentUser.uid, "resumeAnalysis");
    await addDoc(docRef, {
      ...analysis,
      savedAt: new Date().toISOString(),
    });

    alert("Analysis saved!");
  };

  const handleDelete = async (id) => {
    if (!currentUser) return;

    await deleteDoc(doc(db, "users", currentUser.uid, "resumeAnalysis", id));

    setSavedAnalyses((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Fetches saved resume analysis results from Firestore when a user is authenticated.
   *
   * - Runs once when `currentUser` is available or changes
   * - Queries the user's `resumeAnalysis` subcollection in Firestore
   * - Updates `savedAnalyses` state with retrieved documents
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchSavedAnalyses = async () => {
      const analysisRef = collection(
        db,
        "users",
        currentUser.uid,
        "resumeAnalysis"
      );
      const snapshot = await getDocs(analysisRef);
      const saved = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSavedAnalyses(saved);
    };

    fetchSavedAnalyses();
  }, [currentUser]);

  return (
    <div className="resume-parser">
      <h3>Resume Analysis 📊</h3>

      <div className="input-section">
        <div className="input-block">
          <label htmlFor="qualifications">📄 Resume Qualifications</label>
          <textarea
            id="qualifications"
            placeholder="Paste Qualifications from Resume"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
          />
        </div>

        <div className="input-block">
          <label htmlFor="jobDesc">📌 Job Description</label>
          <textarea
            id="jobDesc"
            placeholder="Paste Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleAnalyze}>🔍 Analyze Match</button>

      {analysis && (
        <div className="analysis-result">
          <div>
            <strong>Match Rate:</strong>{" "}
            <span className="match-score">{analysis.matchRate}</span>
          </div>

          {analysis.matched.length > 0 && (
            <div>
              <strong>Matched Skills:</strong>
              <div className="skill-list">
                {analysis.matched.map((skill, idx) => (
                  <span key={idx} className="skill-tag matched">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.missing.length > 0 && (
            <div>
              <strong>Missing Skills:</strong>
              <div className="skill-list">
                {analysis.missing.map((skill, idx) => (
                  <span key={idx} className="skill-tag missing">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSave}>💾 Save Analysis</button>
        </div>
      )}

      <div className="saved-analyses">
        <h4>Saved Analyses</h4>
        {savedAnalyses.length === 0 ? (
          <div className="empty-state">
            📝 No saved results yet. Start by pasting your resume and a job
            description above!
          </div>
        ) : (
          savedAnalyses.map((item) => (
            <div key={item.id} className="saved-analysis-item">
              <div>
                <strong>Match Rate:</strong>{" "}
                <span className="match-rate">{item.matchRate}</span>
              </div>
              <div>
                <strong>Matched Skills:</strong>
                {item.matched.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this analysis?"
                  );
                  if (confirmDelete) handleDelete(item.id);
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * analyzeMatch()
 *
 * Compares two comma-separated strings (resume qualifications and job description)
 * to determine which skills overlap and calculates a match percentage.
 *
 * Parameters:
 * - qualifications: string of resume skills (e.g., "JavaScript, React, Firebase")
 * - jobDescription: string of desired job skills (e.g., "React, Node.js, CSS")
 *
 * Returns:
 * - foundSkills: parsed and normalized skills from the resume
 * - jobSkills: parsed and normalized skills from the job description
 * - matched: array of skills present in both lists
 * - matchRate: percentage string representing overlap (e.g., "67%")
 */
const analyzeMatch = (qualifications, jobDescription) => {
  /**
   * filterOutIgnored
   *
   * Filters out non-skill terms from a given array of words using the ignoreWords list.
   * This is used to clean up both matched and missing skill lists by removing generic,
   * non-technical, or filler terms (e.g., "candidate", "responsibilities", "preferred").
   *
   * @param {string[]} skills - Array of skill tokens to be filtered
   * @returns {string[]} - Array with only relevant, non-ignored skill terms
   */
  const filterOutIgnored = (skills) => {
    return skills.filter((word) => !ignoreWords.includes(word.toLowerCase()));
  };

  const extractSkills = (text) => {
    const normalized = normalizeText(text);
    const ngrams = getNGrams(normalized, [1]);
    const filtered = filterOutIgnored(ngrams);
    return [...new Set(filtered.map((w) => w.toLowerCase()))];
  };

  const resumeSkills = extractSkills(qualifications);
  const jobSkills = extractSkills(jobDescription);

  const matched = jobSkills.filter((skill) => resumeSkills.includes(skill));
  const missing = jobSkills.filter((skill) => !resumeSkills.includes(skill));

  const matchRate =
    jobSkills.length > 0
      ? `${Math.round((matched.length / jobSkills.length) * 100)}%`
      : "0%";

  return {
    matched,
    missing,
    matchRate,
  };
};

export default ResumeParse;
