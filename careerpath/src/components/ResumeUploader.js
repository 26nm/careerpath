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
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import "../styles/ResumeUploader.css";
// import ResumeParse from "./ResumeParse";

/**
 * ResumeUploader()
 *
 * Handles resume upload functionality for the user.
 * Allows users to upload files to Firebase Storage, save metadata to Firestore,
 * view a list of uploaded resumes, delete resumes, and trigger resume analysis.
 *
 * Returns:
 * - A JSX layout containing the upload form, resume list, and conditional analysis view.
 */
function ResumeUploader() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  // const [selectedResume, setSelectedResume] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetches uploaded resumes from Firestore when the current user is available.
   *
   * - Listens for changes to `currentUser`
   * - Retrieves resume documents from the user's subcollection in Firestore
   * - Updates local state (`resumes`) with the fetched data
   */
  useEffect(() => {
    if (!currentUser) return;

    const resumeRef = collection(db, "users", currentUser.uid, "resumes");

    const unsubscribe = onSnapshot(resumeRef, (snapshot) => {
      const updated = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data.fileName,
          uploadedAt: data.uploadedAt,
          url: data.url,
          matchedSkills: data.matchedSkills || "",
        };
      });

      setResumes(updated);
    });

    return () => unsubscribe();
  }, [currentUser]);

  /**
   * handleUpload()
   *
   * Uploads the selected resume file to Firebase Storage,
   * saves its metadata to Firestore, and updates the local resume list.
   *
   * Steps:
   * - Aborts if no file is selected or user is not authenticated
   * - Uploads file to a user-specific path in Firebase Storage
   * - Retrieves the download URL and constructs a metadata object
   * - Stores metadata in the user's Firestore "resumes" subcollection
   * - Updates local `resumes` state to reflect the newly added file
   */
  const handleUpload = async () => {
    if (!file || !currentUser) return;

    setIsUploading(true);

    try {
      const storageRef = ref(
        storage,
        `resumes/${currentUser.uid}/${file.name}`
      );
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      const resumeRef = collection(db, "users", currentUser.uid, "resumes");

      let attempts = 0;
      const maxAttempts = 10;
      let resumeDetected = false;

      while (attempts < maxAttempts && !resumeDetected) {
        const snapshot = await getDocs(resumeRef);
        const found = snapshot.docs.find(
          (doc) => doc.data().fileName === file.name
        );

        if (found) {
          const docRef = doc(resumeRef, found.id);

          const currentData = found.data();
          if (!currentData.url || currentData.url !== downloadURL) {
            await updateDoc(docRef, { url: downloadURL });
          }

          resumeDetected = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
    } catch (error) {
      console.error("Upload or resume detection failed:", error);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  /**
   * handleDelete()
   *
   * Deletes a resume file from Firebase Storage and removes its metadata from Firestore.
   *
   * Parameters:
   * - resumeId: Firestore document ID of the resume metadata
   * - fileName: File name used to locate the file in Firebase Storage
   *
   * Steps:
   * - Prompts user for confirmation before proceeding
   * - Deletes the file from Firebase Storage
   * - Deletes the corresponding metadata document from Firestore
   * - Updates local `resumes` state to reflect the removal
   */
  const handleDelete = async (resumeId, fileName) => {
    const confirm = window.confirm("Delete this resume?");
    if (!confirm || !currentUser) return;

    const storageRef = ref(storage, `resumes/${currentUser.uid}/${fileName}`);
    const docRef = doc(db, "users", currentUser.uid, "resumes", resumeId);

    try {
      await deleteObject(storageRef);
    } catch (err) {
      console.warn(
        "Storage file already missing or failed to delete:",
        err.message
      );
    }

    try {
      await deleteDoc(docRef);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      console.error("Error deleting Firestore doc:", err);
    }
  };

  return (
    <div className="resume-uploader">
      <h3>Upload Resume 📄</h3>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => setFile(e.target.files[0])}
      />
      {isUploading && <p>Uploading resume...</p>}
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
              <button
                onClick={() => {
                  navigate("/dashboard/resume-analysis", {
                    state: { resumeText: resume.matchedSkills },
                  });
                }}
              >
                🧠 Analyze
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ResumeUploader;
