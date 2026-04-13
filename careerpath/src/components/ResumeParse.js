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
import {
  FaChartBar,
  FaFileAlt,
  FaClipboardList,
  FaSearch,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";
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
  const resumeSkillsFromNav = location.state?.resumeSkills || [];

  /**
   * Auto-fills the qualifications textarea with extracted resume text
   * whenever a new `resumeText` prop is passed to the component.
   * This ensures the analyzer starts with the actual parsed content
   * instead of requiring manual copy-paste.
   */
  useEffect(() => {
    if (location.state?.resumeText) {
      setQualifications(location.state.resumeText);
    }
  }, [location.state]);

  /**
   * handleAnalyze()
   *
   * Triggers the analysis process by comparing resume qualifications
   * with the job description using `analyzeMatch()`, then updates the
   * component state with the result.
   */
  const handleAnalyze = async () => {
    if (!jobDescription) return;

    try {
      const analyzeResume = httpsCallable(functions, "analyzeResume");

      const res = await analyzeResume({
        resumeText: "",
        jobText: jobDescription,
      });

      console.log("JOB AI:", res.data);

      const resumeSkills = resumeSkillsFromNav || [];
      const jobSkills = res.data.jobSkills || [];

      const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

      const resumeSet = new Set(resumeSkills.map(normalize));
      const jobSet = new Set(jobSkills.map(normalize));

      const matched = [...resumeSet].filter((s) => jobSet.has(s));
      const missing = [...jobSet].filter((s) => !resumeSet.has(s));

      const matchRate =
        jobSet.size > 0
          ? `${Math.round((matched.length / jobSet.size) * 100)}%`
          : "0%";

      setAnalysis({
        matched,
        missing,
        matchRate,
      });
    } catch (err) {
      console.error("Analysis failed:", err);
    }
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
        "resumeAnalysis",
      );
      const snapshot = await getDocs(analysisRef);
      const saved = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSavedAnalyses(saved);
    };

    fetchSavedAnalyses();
  }, [currentUser]);

  return (
    <div className="resume-parser">
      <h3 className="section-title">
        <FaChartBar />
        Resume Analysis
      </h3>

      <div className="input-section">
        <div className="input-block">
          <label htmlFor="qualifications" className="label-with-icon">
            <FaFileAlt />
            Resume Qualifications
          </label>
          <textarea
            id="qualifications"
            placeholder="Paste Qualifications from Resume"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
          />

          {resumeSkillsFromNav.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <strong>Extracted Skills:</strong>
              <div style={{ marginTop: "6px" }}>
                {resumeSkillsFromNav.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      display: "inline-block",
                      backgroundColor: "#eef2ff",
                      color: "#3730a3",
                      padding: "4px 8px",
                      margin: "4px",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="input-block">
          <label htmlFor="jobDesc" className="label-with-icon">
            <FaClipboardList />
            Job Description
          </label>
          <textarea
            id="jobDesc"
            placeholder="Paste Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleAnalyze}>
        <FaSearch />
        Analyze Match
      </button>

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

          <button className="save-btn" onClick={handleSave}>
            <FaSave />
            Save Analysis
          </button>
        </div>
      )}

      <div className="saved-analyses">
        <h4>Saved Analyses</h4>
        {savedAnalyses.length === 0 ? (
          <div className="empty-state">
            No saved results yet. Start by pasting your resume and a job
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
                className="delete-btn"
                onClick={() => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this analysis?",
                  );
                  if (confirmDelete) handleDelete(item.id);
                }}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ResumeParse;
