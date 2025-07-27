/**
 * ResumeUploader Component
 * ------------------------
 * Allows authenticated users to upload, view, and delete resumes.
 *
 * Functionality:
 * - Uploads resume files (PDF, DOC, DOCX, TXT) to Firebase Storage
 * - Stores file metadata (name, upload timestamp, URL) in Firestore under users/{uid}/resumes
 * - Fetches and displays uploaded resumes in a list
 * - Enables deletion of both the file in Storage and its corresponding Firestore document
 *
 * Dependencies:
 * - Firebase Storage for file uploads and deletions
 * - Firestore for storing and managing resume metadata
 * - useAuth context for accessing the current authenticated user
 *
 * Styling:
 * - Uses styles from ResumeUploader.css for layout and appearance
 *
 * By: Nolan Dela Rosa
 *
 * May 21, 2025
 */
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "../styles/ResumeUploader.css";
import ResumeParse from "./ResumeParse";

function ResumeUploader() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchResumes = async () => {
      const resumeRef = collection(db, "users", currentUser.uid, "resumes");
      const snapshot = await getDocs(resumeRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setResumes(data);
    };

    fetchResumes();
  }, [currentUser]);

  const handleUpload = async () => {
    if (!file || !currentUser) return;

    const storageRef = ref(storage, `resumes/${currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const metadata = {
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      url: downloadURL,
    };

    const docRef = collection(db, "users", currentUser.uid, "resumes");
    const addedDoc = await addDoc(docRef, metadata);
    setResumes((prev) => [...prev, { id: addedDoc.id, ...metadata }]);

    setFile(null);
  };

  const handleDelete = async (resumeId, fileName) => {
    const confirm = window.confirm("Delete this resume?");
    if (!confirm || !currentUser) return;

    const fileRef = ref(storage, `resumes/${currentUser.uid}/${fileName}`);
    await deleteObject(fileRef);

    await deleteDoc(doc(db, "users", currentUser.uid, "resumes", resumeId));
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
  };

  return (
    <div className="resume-uploader">
      <h3>Upload Resume</h3>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={!file}>
        📤 Upload
      </button>

      <div className="resume-list">
        <h4>Uploaded Resumes</h4>
        {resumes.length === 0 ? (
          <p className="empty-state">No resumes uploaded yet.</p>
        ) : (
          resumes.map((resume) => (
            <div key={resume.id} className="resume-item">
              <a href={resume.url} target="_blank" rel="noopener noreferrer">
                {resume.fileName}
              </a>
              <button onClick={() => handleDelete(resume.id, resume.fileName)}>
                🗑 Delete
              </button>
              <button onClick={() => setSelectedResume(resume)}>
                🧠 Analyze
              </button>
            </div>
          ))
        )}
      </div>

      {selectedResume && (
        <ResumeParse
          resumeText={`Simulated resume text for ${selectedResume.fileName}`}
        />
      )}
    </div>
  );
}

export default ResumeUploader;
