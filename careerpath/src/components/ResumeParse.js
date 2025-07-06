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
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

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
  const [savedAnalyses, setSavedAnalyses] = useState([]);

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

  const { currentUser } = useAuth();

  /**
   * useEffect - Fetch Saved Resume Analyses
   * ---------------------------------------
   * Runs when the component mounts or when the authenticated user changes.
   *
   * Preconditions:
   * - A user must be authenticated (currentUser must exist)
   *
   * Process:
   * - Queries Firestore for all saved resume analysis documents under:
   *   users/{uid}/resumeAnalysis
   * - Maps the results into an array of objects with Firestore document IDs and data
   * - Updates local state with the list of saved analyses for rendering
   *
   * Notes:
   * - Ensures users see their previously saved analyses upon visiting or refreshing the page
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

  /**
   * handleSave
   * ----------
   * Saves the current resume analysis result to Firestore under the user's document.
   *
   * Preconditions:
   * - User must be authenticated (currentUser must exist)
   * - An analysis result must already be generated
   *
   * Process:
   * - Creates a reference to the collection: users/{uid}/resumeAnalysis
   * - Adds a new document containing the analysis result along with a timestamp
   * - Notifies the user with an alert once saved successfully
   *
   * Notes:
   * - Data is stored under each user to ensure privacy and user-specific access
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
          <button onClick={handleSave}>Save Analysis</button>
        </div>
      )}

      <div className="saved-analyses">
        <h4>Saved Analyses</h4>
        {savedAnalyses.length === 0 ? (
          <p>No saved results yet.</p>
        ) : (
          savedAnalyses.map((item) => (
            <div key={item.id} className="saved-analysis-item">
              <strong>Match Rate:</strong> {item.matchRate}
              <br />
              <strong>Matched Skills:</strong> {item.matched.join(",")}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * analyzeMatch
 * ------------
 * Compares a user's resume qualifications and a job description to calculate skill overlap.
 *
 * Inputs:
 * - qualifications: A comma-separated string of skills from the user's resume
 * - jobDescription: A comma-separated string of skills required in a job posting
 *
 * Processing:
 * - Splits each input string into an array of lowercase skills
 * - Trims whitespace and filters out empty entries
 * - Identifies matching skills between resume and job requirements
 * - Calculates a match rate based on the proportion of matched skills in the job description
 *
 * Output:
 * Returns an object containing:
 * - foundSkills: parsed array of skills from the resume
 * - jobSkills: parsed array of skills from the job description
 * - matched: array of overlapping skills
 * - matchRate: string representation of match percentage (e.g., "80%")
 */
const analyzeMatch = (qualifications, jobDescription) => {
  const resumeSkills = qualifications
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter((skill) => skill.length > 0);

  const jobSkills = jobDescription
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter((skill) => skill.length > 0);

  const matched = resumeSkills.filter((skill) => jobSkills.includes(skill));

  const matchRate =
    jobSkills.length > 0
      ? ((matched.length / jobSkills.length) * 100).toFixed(0) + "%"
      : "0%";

  return {
    foundSkills: resumeSkills,
    jobSkills: jobSkills,
    matched: matched,
    matchRate: matchRate,
  };
};

export default ResumeParse;
