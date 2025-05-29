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
import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import "../styles/JobTracker.css";

/**
 * JobTracker Component
 *
 * This component manages a simple job application tracker for authenticated users.
 * It provides a form for users to enter new job applications and displays a list of
 * their existing submissions pulled from Firestore.
 *
 * Features:
 * - Reads current authenticated user from custom AuthContext.
 * - Fetches job applications on mount from Firestore under the user's UID.
 * - Allows adding new applications (position, company, date, and status).
 * - Updates UI in real-time after submitting a new entry.
 *
 * @returns {JSX.Element} A UI form and list of job applications associated with the user.
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
   * useEffect to fetch job applications from Firestore on component mount or when the user changes.
   *
   * - Checks if a user is authenticated.
   * - Accesses the user's 'applications' subcollection in Firestore.
   * - Maps each document to an application object and updates local state.
   * - Ensures the user's job applications are loaded and displayed upon login.
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
   * Handles form submission for adding a new job application.
   *
   * - Prevents default form behavior.
   * - Validates that a user is authenticated and fields are filled.
   * - Constructs a new application object with position, company, current date, and default status.
   * - Saves the new application to the authenticated user's 'applications' subcollection in Firestore.
   * - Clears form inputs and updates local application state to reflect the new entry.
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
   * handleStatusChange
   *
   * Updates the status of a specific job application in Firestore and reflects the change in local state.
   *
   * - Verifies the current user is authenticated.
   * - Locates the specific document using the user's UID and application ID.
   * - Updates the `status` field in Firestore with the new status value.
   * - Updates the local `applications` state to reflect the new status without needing to refetch all data.
   *
   * @param {string} appID - The Firestore document ID of the job application to update.
   * @param {string} newStatus - The new status value to set (e.g., "Interviewing", "Rejected").
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
   * handleEdit
   *
   * Activates edit mode for a specific job application.
   * Sets the editing state by capturing the application's ID,
   * and pre-fills local input fields with the current position and company values.
   * This allows the user to modify the job entry inline before saving.
   *
   * @param {Object} app - The application object selected for editing.
   */
  const handleEdit = (app) => {
    setEditingId(app.id);
    setEditPosition(app.position);
    setEditCompany(app.company);
  };

  /**
   * handleSave
   *
   * Saves the updated job application data (position and company) to Firestore.
   * Checks for an authenticated user and a valid editing ID before proceeding.
   * Updates the corresponding document in the user's "applications" subcollection,
   * and reflects the changes in the local state to immediately update the UI.
   * Once saved, clears the editing state and input fields.
   *
   * @returns {Promise<void>} Asynchronous function that updates Firestore and local application list.
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
   * handleDelete
   *
   * Deletes a specific job application from Firestore after user confirmation
   * and updates the local state to reflect the removal.
   *
   * - Prompts the user for confirmation before proceeding.
   * - Verifies that a user is authenticated and the action was confirmed.
   * - Locates and deletes the specified document from the user's Firestore subcollection.
   * - Updates the local `applications` state by removing the deleted application.
   *
   * @param {string} appID - The Firestore document ID of the application to delete.
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
          <button type="submit">Add</button>
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
                <button onClick={() => handleSave(app.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{app.position}</strong>
                <div>{app.company}</div>
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
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button onClick={() => handleEdit(app)}>Edit</button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    title="Delete application"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#cc0000",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <FaTrash />
                    Delete
                  </button>
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
