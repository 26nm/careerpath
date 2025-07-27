/**
 * ResumeParse Component
 * Updated for labeled input blocks and styled layout
 */

import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import "../styles/ResumeAnalyzer.css";

function ResumeParse({ resumeText }) {
  const [qualifications, setQualifications] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const { currentUser } = useAuth();

  const handleAnalyze = () => {
    const result = analyzeMatch(qualifications, jobDescription);
    setAnalysis(result);
  };

  const handleSave = async () => {
    if (!currentUser || !analysis) return;

    const docRef = collection(db, "users", currentUser.uid, "resumeAnalysis");
    await addDoc(docRef, {
      ...analysis,
      savedAt: new Date().toISOString(),
    });

    alert("Analysis saved!");
  };

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
      <h3>Resume Analyzer</h3>

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
          <h4>Analysis Result</h4>
          <div>
            <strong>Match Rate:</strong>{" "}
            <span className="match-score">{analysis.matchRate}</span>
          </div>
          <div>
            <strong>Matched Skills:</strong>
            {analysis.matched.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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
