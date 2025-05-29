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

/**
 * ResumeUploader
 * --------------
 * A React functional component that enables authenticated users to:
 * - Upload resume files to Firebase Storage
 * - Store associated metadata in Firestore under users/{uid}/resumes
 * - Fetch and display previously uploaded resumes
 * - Delete uploaded resumes from both Storage and Firestore
 *
 * Hooks:
 * - useAuth(): Retrieves the currently authenticated user
 * - useState(): Manages selected file and uploaded resumes state
 * - useEffect(): Fetches existing resumes on component mount or user change
 *
 * Notes:
 * - Only authenticated users can interact with this component
 * - Accepts common resume file types (.pdf, .doc, .docx, .txt)
 * - Assumes Firebase Storage and Firestore have appropriate rules set for user access
 */
function ResumeUploader() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  /**
   * useEffect - Resume Fetcher
   * --------------------------
   * Runs when the component mounts or when the currentUser changes.
   * If a user is authenticated, retrieves the list of uploaded resumes
   * from Firestore under the path: users/{uid}/resumes.
   *
   * The retrieved documents are mapped into an array of resume objects,
   * each containing its Firestore document ID and metadata.
   * This array is stored in local component state via setResumes().
   */
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

  /**
   * handleUpload
   * ------------
   * Handles the resume upload process for the current authenticated user.
   * - Uploads the selected file to Firebase Storage under resumes/{uid}/{fileName}
   * - Retrieves the file's download URL after upload
   * - Stores metadata (file name, timestamp, URL) in Firestore under users/{uid}/resumes
   * - Updates local state with the newly uploaded resume
   * - Clears the selected file input after successful upload
   *
   * Preconditions:
   * - A file must be selected
   * - A user must be authenticated (currentUser must be defined)
   */
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

  /**
   * handleDelete
   * ------------
   * Deletes a resume from both Firebase Storage and Firestore for the current user.
   * - Prompts the user to confirm deletion
   * - Deletes the resume file from Storage at resumes/{uid}/{fileName}
   * - Removes the corresponding metadata document from Firestore at users/{uid}/resumes/{resumeId}
   * - Updates local state to remove the deleted resume from the list
   *
   * Preconditions:
   * - User must confirm the deletion
   * - currentUser must be authenticated
   */
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
      <button onClick={handleUpload}>Upload</button>

      <div className="resume-list">
        <h4>Uploaded Resumes</h4>
        {resumes.map((resume) => (
          <div key={resume.id} className="resume-item">
            <a href={resume.url} target="_blank" rel="noopener noreferrer">
              {resume.fileName}
            </a>
            <button onClick={() => handleDelete(resume.id, resume.fileName)}>
              Delete
            </button>
            <button onClick={() => setSelectedResume(resume)}>Analyze</button>
          </div>
        ))}
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
