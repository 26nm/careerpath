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

function JobTracker() {
  const { currentUser } = useAuth();

  const [applications, setApplications] = useState([]);
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("Applied");

  const [editingId, setEditingId] = useState(null);
  const [editPosition, setEditPosition] = useState("");
  const [editCompany, setEditCompany] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;

      const appsRef = collection(db, "users", currentUser.uid, "applications");
      const snapshot = await getDocs(appsRef);
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setApplications(apps);
    };

    fetchApplications();
  }, [currentUser]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!currentUser || !position || !company) return;

    const newApp = {
      position,
      company,
      status,
      appliedDate: new Date().toISOString().split("T")[0],
    };

    const appsRef = collection(db, "users", currentUser.uid, "applications");
    const docRef = await addDoc(appsRef, newApp);

    setApplications((prev) => [...prev, { id: docRef.id, ...newApp }]);
    setPosition("");
    setCompany("");
  };

  const handleStatusChange = async (appID, newStatus) => {
    if (!currentUser) return;

    const appRef = doc(db, "users", currentUser.uid, "applications", appID);
    await updateDoc(appRef, { status: newStatus });

    setApplications((prev) =>
      prev.map((app) =>
        app.id === appID ? { ...app, status: newStatus } : app,
      ),
    );
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setEditPosition(app.position);
    setEditCompany(app.company);
  };

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
          : app,
      ),
    );

    setEditingId(null);
    setEditPosition("");
    setEditCompany("");
  };

  const handleDelete = async (appID) => {
    if (!currentUser) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?",
    );
    if (!confirmDelete) return;

    const appRef = doc(db, "users", currentUser.uid, "applications", appID);

    await deleteDoc(appRef);
    setApplications((prev) => prev.filter((app) => app.id !== appID));
  };

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes("interview")) return "scheduled";
    if (s.includes("offer")) return "offer";
    if (s.includes("rejected")) return "rejected";
    return "applied";
  };

  return (
    <div className="job-tracker">
      <h3>Job Application Tracker 💼</h3>

      {/* Add Job Section */}
      <div className="job-form-container">
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
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interviewed">Interviewed</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button type="submit">➕ Add</button>
          </div>
        </form>
      </div>

      {/* Application Section */}
      <div className="application-section">
        {applications.length === 0 ? (
          <div className="empty-state">
            <p>No applications yet</p>
            <span>Add your first job to start tracking!</span>
          </div>
        ) : (
          <div className="application-list">
            {applications.map((app) => (
              <div className="app-card" key={app.id}>
                {editingId === app.id ? (
                  <>
                    <input
                      type="text"
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                    />
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                    />
                    <div className="button-group">
                      <button onClick={handleSave}>💾 Save</button>
                      <button onClick={() => setEditingId(null)}>
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* LEFT: Job Info */}
                    <div className="app-info">
                      <strong>{app.position}</strong>
                      <div className="company-label">@ {app.company}</div>
                      <div
                        className={`status-tag ${getStatusClass(app.status)}`}
                      >
                        {app.status}
                      </div>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="app-actions">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview Scheduled">
                          Interview Scheduled
                        </option>
                        <option value="Interviewed">Interviewed</option>
                        <option value="Offer Received">Offer Received</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(app)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(app.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobTracker;
