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

/**
 * InterviewScheduler()
 *
 * Renders the UI and manages logic for scheduling, editing, and tracking job interviews.
 *
 * Responsibilities:
 * - Allows users to add interviews with position, company, date, and time
 * - Automatically updates interview status to "Completed" if the scheduled time has passed
 * - Displays a list of interviews sorted chronologically
 * - Supports inline editing and deletion of interviews
 * - Highlights interviews scheduled for today and shows time-sensitive reminders
 *
 * Firebase Integration:
 * - Reads and writes data from `users/{uid}/interviews` in Firestore
 * - Updates status field automatically if an "Upcoming" interview is now in the past
 *
 * State:
 * - Stores all interview entries and input field values for both add/edit modes
 * - Tracks which interview is being edited via `editingID`
 *
 * UI:
 * - Displays upcoming interviews with conditional styling (e.g., highlight for today)
 * - Includes a reminder tag and status label
 * - Form inputs are cleanly styled and conditionally rendered based on edit mode
 */
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

  const [jobOptions, setJobOptions] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  /**
   * useEffect — Fetch and auto-update interviews
   *
   * Runs when `currentUser` becomes available. Fetches all interview entries from
   * Firestore and updates any that are past-due but still marked as "Upcoming".
   *
   * Steps:
   * - Retrieve all documents from the user's `interviews` subcollection
   * - Check each interview's datetime:
   *    - If it's in the past and status is "Upcoming", update it to "Completed"
   * - Sort all interviews chronologically by datetime
   * - Store the sorted results in component state
   */
  useEffect(() => {
    /**
     * fetchInterviews()
     *
     * Retrieves all interview entries for the current user from Firestore,
     * checks if any "Upcoming" interviews have passed, and updates their status to "Completed".
     *
     * Steps:
     * - Query the user's `interviews` subcollection
     * - Convert each interview datetime to a JavaScript Date object
     * - If the datetime is in the past and status is "Upcoming", schedule an update to "Completed"
     * - Apply all necessary status updates in parallel
     * - Sort the full list of interviews by datetime (soonest first)
     * - Update local `interviews` state with the processed and sorted list
     */
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
        const interviewDate =
          data.datetime instanceof Date
            ? data.datetime
            : new Date(
                data.datetime.toDate ? data.datetime.toDate() : data.datetime
              );

        const isPastDue = interviewDate.getTime() < now.getTime();

        if (isPastDue && data.status === "Upcoming") {
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

    /**
     * fetchJobs()
     *
     * Fetches the user's tracked job applications from Firestore to populate
     * the job selection dropdown in the interview scheduling form.
     *
     * Steps:
     * - Verify that the user is authenticated
     * - Query the user's `applications` subcollection in Firestore
     * - Map each document into a job object with an `id` and its data
     * - Store the resulting job list in local state via `setJobOptions`
     *
     * Used to allow users to select an existing job and auto-fill interview details.
     */
    const fetchJobs = async () => {
      if (!currentUser) return;
      const appsRef = collection(db, "users", currentUser.uid, "applications");
      const snapshot = await getDocs(appsRef);
      const jobs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setJobOptions(jobs);
    };

    fetchInterviews();
    fetchJobs();
  }, [currentUser]);

  /**
   * handleAddInterview()
   *
   * Handles the form submission to add a new interview to Firestore and update local state.
   *
   * Steps:
   * - Prevents default form behavior
   * - Validates that the user and all required fields are present
   * - Constructs a new interview object with default status "Upcoming"
   * - Saves the new interview to the user's `interviews` subcollection in Firestore
   * - Clears input fields
   * - Updates local `interviews` state and re-sorts by datetime
   */
  const handleAddInterview = async (e) => {
    e.preventDefault();
    if (!currentUser || !position || !company || !datetime) return;

    const now = new Date();
    const interviewDate = new Date(datetime);
    const computedStatus =
      interviewDate.getTime() <= now.getTime() ? "Completed" : "Upcoming";

    const newInterview = {
      position,
      company,
      datetime,
      status: computedStatus,
      linkedJobId: selectedJobId || null,
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

  /**
   * handleEdit()
   *
   * Prepares the selected interview for editing by populating the edit form fields.
   *
   * - Sets `editingID` to the selected interview's ID
   * - Pre-fills editable fields (company, position, datetime, status) with existing values
   */
  const handleEdit = (interview) => {
    setEditingID(interview.id);
    setEditCompany(interview.company);
    setEditPosition(interview.position);
    setEditDatetime(interview.datetime);
    setEditStatus(interview.status || "Upcoming");
  };

  /**
   * handleSave()
   *
   * Saves changes made to an existing interview by updating Firestore and local state.
   *
   * - Validates that a user is logged in and an interview is being edited
   * - Updates the Firestore document with new company, position, datetime, and status
   * - Updates the corresponding entry in local `interviews` state
   * - Re-sorts the updated list by datetime
   * - Clears the edit form and exits editing mode
   */
  const handleSave = async () => {
    if (!currentUser || !editingID) return;

    const docRef = doc(db, "users", currentUser.uid, "interviews", editingID);

    const now = new Date();
    const interviewDate = new Date(editDatetime);
    const computedStatus =
      interviewDate.getTime() <= now.getTime() ? "Completed" : "Upcoming";

    await updateDoc(docRef, {
      company: editCompany,
      position: editPosition,
      datetime: editDatetime,
      status: computedStatus,
    });

    setInterviews((prev) => {
      const updated = prev.map((i) =>
        i.id === editingID
          ? {
              ...i,
              company: editCompany,
              position: editPosition,
              datetime: editDatetime,
              status: computedStatus,
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

  /**
   * handleDelete()
   *
   * Deletes an interview from Firestore and removes it from local state.
   *
   * Parameters:
   * - id: The Firestore document ID of the interview to delete
   *
   * Steps:
   * - Prompts the user for confirmation
   * - Deletes the interview document from Firestore
   * - Filters out the deleted interview from the local `interviews` state
   */
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this interview?"
    );
    if (!confirm || !currentUser) return;

    const docRef = doc(db, "users", currentUser.uid, "interviews", id);
    await deleteDoc(docRef);

    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  /**
   * isToday()
   *
   * Checks if the provided date string corresponds to today's date.
   *
   * Parameters:
   * - dateString: A date-time string to evaluate
   *
   * Returns:
   * - true if the date is today, false otherwise
   */
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
          <select
            className="job-dropdown"
            value={selectedJobId || ""}
            onChange={(e) => {
              const jobId = e.target.value;
              setSelectedJobId(jobId);
              const job = jobOptions.find((j) => j.id === jobId);
              if (job) {
                setCompany(job.company);
                setPosition(job.position);
              }
            }}
          >
            <option value="">Select from tracked jobs (optional)</option>
            {jobOptions.map((job) => (
              <option key={job.id} value={job.id}>
                {job.position} @ {job.company}
              </option>
            ))}
          </select>
        </div>

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
          const linkedJob = jobOptions.find(
            (job) => job.id === interview.linkedJobId
          );

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
                  <div className="interview-title">
                    <strong>
                      {interview.position} @ {interview.company}
                    </strong>

                    {linkedJob && (
                      <span
                        className="linked-icon"
                        title="From Job Tracker"
                      ></span>
                    )}
                  </div>

                  <div className="interview-date">
                    Scheduled: {dateStr} at {timeStr}
                    {isToday(interview.datetime) && (
                      <span className="today-tag"> - Today</span>
                    )}
                  </div>

                  <div className="status-line">
                    Status:
                    <span
                      className={`status-tag ${interview.status.toLowerCase()}`}
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
