/**
 * JobTracker Component
 *
 * This component allows authenticated users to track their job applications.
 * Users can add new applications by entering a job position and company name,
 * and the component fetches and displays a list of previously submitted applications
 * from their personal Firestore subcollection.
 *
 * Features:
 * - Uses Firebase Firestore to store and retrieve job applications.
 * - Organizes data under each user’s UID for secure and personal data separation.
 * - Tracks authentication state via a custom AuthContext hook.
 * - Stores form state locally using React's useState hook.
 * - Automatically fetches applications on component mount via useEffect.
 *
 * By: Nolan Dela Rosa
 * Date: May 7, 2025
 */
/**
 * JobTracker Component
 * Updated with polished visual layout and styled status tags
 */

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import "../styles/JobTracker.css";

/**
 * JobTracker()
 *
 * Renders the Job Application Tracker UI and manages all logic for creating,
 * updating, editing, and deleting job applications.
 *
 * Responsibilities:
 * - Fetches the user's applications from Firestore on load
 * - Allows the user to add a new job application with position, company, and status
 * - Supports inline editing of application fields (position & company)
 * - Allows status updates via dropdown and applies color-coded styling
 * - Handles deletion of applications with confirmation
 *
 * Firebase Integration:
 * - Reads/writes data to `users/{uid}/applications` in Firestore
 *
 * State:
 * - applications: all job applications for the current user
 * - position / company / status: values used to add a new application
 * - editingId / editPosition / editCompany: used for editing an existing application
 *
 * UI:
 * - Styled input form for adding new applications
 * - Dynamic card layout for each application with buttons for edit/delete
 * - Select dropdown for updating application status
 * - CSS class mapping based on status for visual feedback
 */
function JobTracker() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("Applied");
  const [editingId, setEditingId] = useState(null);
  const [editPosition, setEditPosition] = useState("");
  const [editCompany, setEditCompany] = useState("");

  /**
   * Fetches the user's job applications from Firestore when `currentUser` is available.
   *
   * - Queries the `applications` subcollection under the logged-in user's document
   * - Maps the retrieved documents to include their IDs
   * - Updates `applications` state with the result
   */
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;
      const appsRef = collection(db, "users", currentUser.uid, "applications");
      const snapshot = await getDocs(appsRef);
      const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
    };
    fetchApplications();
  }, [currentUser]);

  /**
   * handleAdd()
   *
   * Handles the submission of a new job application.
   *
   * - Prevents default form behavior
   * - Validates that user is logged in and fields are filled
   * - Constructs a new application object with current date and status
   * - Adds the application to Firestore under the user's "applications" subcollection
   * - Updates local `applications` state with the new entry
   * - Clears the input fields
   */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!currentUser || !position || !company) return;
    const newApp = {
      position,
      company,
      appliedDate: new Date().toISOString().split("T")[0],
      status,
    };
    const appsRef = collection(db, "users", currentUser.uid, "applications");
    const docRef = await addDoc(appsRef, newApp);
    setApplications((prev) => [...prev, { id: docRef.id, ...newApp }]);
    setPosition("");
    setCompany("");
  };

  /**
   * handleStatusChange()
   *
   * Updates the status of a specific job application in Firestore and local state.
   *
   * Parameters:
   * - appID: ID of the application to update
   * - newStatus: The new status value selected by the user
   *
   * - Locates the document in Firestore and updates the `status` field
   * - Updates the corresponding application in local `applications` state
   */
  const handleStatusChange = async (appID, newStatus) => {
    if (!currentUser) return;
    const appRef = doc(db, "users", currentUser.uid, "applications", appID);
    await updateDoc(appRef, { status: newStatus });
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appID ? { ...app, status: newStatus } : app
      )
    );
  };

  /**
   * handleEdit()
   *
   * Prepares the selected job application for editing.
   *
   * - Sets `editingId` to the ID of the application being edited
   * - Prefills input fields with the current position and company values
   */
  const handleEdit = (app) => {
    setEditingId(app.id);
    setEditPosition(app.position);
    setEditCompany(app.company);
  };

  /**
   * handleSave()
   *
   * Saves edits made to a job application's position and company fields.
   *
   * - Verifies that a user is logged in and an application is being edited
   * - Updates the corresponding Firestore document with new values
   * - Updates the application in local state to reflect the changes
   * - Clears edit mode and resets edit input fields
   */
  const handleSave = async () => {
    if (!currentUser || !editingId) return;
    const appRef = doc(db, "users", currentUser.uid, "applications", editingId);
    await updateDoc(appRef, {
      position: editPosition,
      company: editCompany,
    });
    setApplications((prev) =>
      prev.map((app) =>
        app.id === editingId
          ? { ...app, position: editPosition, company: editCompany }
          : app
      )
    );
    setEditingId(null);
    setEditPosition("");
    setEditCompany("");
  };

  /**
   * handleDelete()
   *
   * Deletes a job application from Firestore and removes it from local state.
   *
   * Parameters:
   * - appID: ID of the application to delete
   *
   * - Prompts the user for confirmation
   * - Deletes the corresponding Firestore document
   * - Updates local `applications` state to remove the deleted entry
   */
  const handleDelete = async (appID) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this application?"
    );
    if (!confirm || !currentUser) return;
    const appDocRef = doc(db, "users", currentUser.uid, "applications", appID);
    await deleteDoc(appDocRef);
    setApplications((prev) => prev.filter((app) => app.id !== appID));
  };

  /**
   * getStatusClass()
   *
   * Maps a status string to a corresponding CSS class for styling.
   *
   * Parameters:
   * - status: The status label of a job application (e.g., "Interviewed")
   *
   * Returns:
   * - A string representing the CSS class name to apply (e.g., "scheduled", "offer")
   */
  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes("interview")) return "scheduled";
    if (s.includes("offer")) return "offer";
    if (s.includes("rejected")) return "rejected";
    return "applied";
  };

  return (
    <div className="job-tracker">
      <h3>Job Application Tracker</h3>
      <form onSubmit={handleAdd} className="job-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Offer Received">Offer Received</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="submit">➕ Add</button>
        </div>
      </form>

      <div className="application-list">
        {applications.map((app) => (
          <div className="app-card" key={app.id}>
            {editingId === app.id ? (
              <>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  placeholder="Edit position"
                />
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Edit company"
                />
                <div className="button-group">
                  <button onClick={handleSave}>💾 Save</button>
                  <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                </div>
              </>
            ) : (
              <>
                <strong>{app.position}</strong>
                <div className="company-label">@ {app.company}</div>
                <div className={`status-tag ${getStatusClass(app.status)}`}>
                  {app.status}
                </div>
                <div className="button-group">
                  <button onClick={() => handleEdit(app)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(app.id)}>🗑 Delete</button>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview Scheduled">
                      Interview Scheduled
                    </option>
                    <option value="Interviewed">Interviewed</option>
                    <option value="Offer Received">Offer Received</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobTracker;
