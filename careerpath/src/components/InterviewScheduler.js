/**
 * InterviewScheduler Component
 *
 * This component allows authenticated users to schedule and view interviews.
 * Users can enter details such as position, company, and datetime, and store this data
 * in their Firestore interview subcollection. The list of upcoming interviews is displayed
 * after submission and persists across sessions.
 *
 * Features:
 * - Form input for scheduling interviews (position, company, datetime).
 * - Stores interviews under: /users/{uid}/interviews in Firebase Firestore.
 * - Displays a list of upcoming interviews for the current user.
 *
 * By: Nolan Dela Rosa
 * Date: May 18, 2025
 */
import React, { useState, useEffect } from "react";
import { collection, doc, addDoc, getDocs } from "firebase/firestore";
import { updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import { formatReminderTag } from "../utils/ReminderManager";
import "../styles/InterviewScheduler.css";

function InterviewScheduler() {
  const { currentUser } = useAuth();
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [datetime, setDatetime] = useState("");
  const [interviews, setInterviews] = useState([]);

  const [editingID, setEditingID] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editDatetime, setEditDatetime] = useState("");
  const [editStatus, setEditStatus] = useState("Upcoming");

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!currentUser) return;
      const interviewsRef = collection(
        db,
        "users",
        currentUser.uid,
        "interviews"
      );
      const snapshot = await getDocs(interviewsRef);

      const now = new Date();
      const updates = [];

      const data = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const interviewDate = new Date(data.datetime);

        if (interviewDate < now && data.status === "Upcoming") {
          updates.push(
            updateDoc(
              doc(db, "users", currentUser.uid, "interviews", docSnap.id),
              {
                status: "Completed",
              }
            )
          );
          return { id: docSnap.id, ...data, status: "Completed" };
        }
        return { id: docSnap.id, ...data };
      });

      if (updates.length > 0) await Promise.all(updates);

      data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      setInterviews(data);
    };
    fetchInterviews();
  }, [currentUser]);

  const handleAddInterview = async (e) => {
    e.preventDefault();
    if (!currentUser || !position || !company || !datetime) return;

    const newInterview = {
      position,
      company,
      datetime,
      status: "Upcoming",
    };

    const ref = collection(db, "users", currentUser.uid, "interviews");
    const docRef = await addDoc(ref, newInterview);

    setPosition("");
    setCompany("");
    setDatetime("");

    setInterviews((prev) => {
      const updated = [...prev, { id: docRef.id, ...newInterview }];
      return updated.sort(
        (a, b) => new Date(a.datetime) - new Date(b.datetime)
      );
    });
  };

  const handleEdit = (interview) => {
    setEditingID(interview.id);
    setEditCompany(interview.company);
    setEditPosition(interview.position);
    setEditDatetime(interview.datetime);
    setEditStatus(interview.status || "Upcoming");
  };

  const handleSave = async () => {
    if (!currentUser || !editingID) return;

    const docRef = doc(db, "users", currentUser.uid, "interviews", editingID);
    await updateDoc(docRef, {
      company: editCompany,
      position: editPosition,
      datetime: editDatetime,
      status: editStatus,
    });

    setInterviews((prev) => {
      const updated = prev.map((i) =>
        i.id === editingID
          ? {
              ...i,
              company: editCompany,
              position: editPosition,
              datetime: editDatetime,
              status: editStatus,
            }
          : i
      );
      return updated.sort(
        (a, b) => new Date(a.datetime) - new Date(b.datetime)
      );
    });

    setEditingID(null);
    setEditCompany("");
    setEditPosition("");
    setEditDatetime("");
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this interview?"
    );
    if (!confirm || !currentUser) return;

    const docRef = doc(db, "users", currentUser.uid, "interviews", id);
    await deleteDoc(docRef);

    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  const isToday = (dateString) => {
    const interviewDate = new Date(dateString);
    const today = new Date();
    return (
      interviewDate.getDate() === today.getDate() &&
      interviewDate.getMonth() === today.getMonth() &&
      interviewDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="interview-scheduler">
      <h3>Schedule an Interview</h3>
      <form onSubmit={handleAddInterview} className="job-form">
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
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
          <button type="submit">Add Interview</button>
        </div>
      </form>

      <div className="application-list">
        <h4>Upcoming Interviews</h4>

        {interviews.length === 0 && (
          <div className="empty-state">
            <p>No interviews scheduled yet.</p>
            <p>Use the form above to add one!</p>
          </div>
        )}

        {interviews.map((interview) => {
          const interviewDate = new Date(interview.datetime);
          const dateStr = interviewDate.toLocaleDateString();
          const timeStr = interviewDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const reminder = formatReminderTag(dateStr, timeStr);

          return (
            <div
              className={`interview-card ${
                isToday(interview.datetime) ? "today-highlight" : ""
              }`}
              key={interview.id}
            >
              {editingID === interview.id ? (
                <>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                  />
                  <input
                    type="datetime-local"
                    value={editDatetime}
                    onChange={(e) => setEditDatetime(e.target.value)}
                  />
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                  <div className="button-group">
                    <button onClick={handleSave}>💾 Save</button>
                    <button onClick={() => setEditingID(null)}>
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong>{interview.position}</strong>
                  <div>{interview.company}</div>
                  <em>
                    Scheduled: {dateStr} at {timeStr}
                    {isToday(interview.datetime) && (
                      <span className="today-tag"> - Today</span>
                    )}
                  </em>
                  <div className="status-label">
                    Status:{" "}
                    <span
                      className={`status ${interview.status.toLowerCase()}`}
                    >
                      {interview.status}
                    </span>
                  </div>
                  {reminder && <div className="reminder-tag">{reminder}</div>}
                  <div className="button-group">
                    <button onClick={() => handleEdit(interview)}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(interview.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewScheduler;
