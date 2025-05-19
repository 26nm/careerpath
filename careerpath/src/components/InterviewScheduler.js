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
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import { formatReminderTag } from "../utils/ReminderManager";
import "../styles/InterviewScheduler.css";

/**
 * InterviewScheduler Component
 *
 * This component allows authenticated users to:
 * - Schedule interviews by entering job position, company name, and date/time.
 * - Store the interview data in Firestore under their personal document.
 * - Retrieve and display scheduled interviews on component mount.
 *
 * @returns {JSX.Element} A form to schedule interviews and a list of upcoming interviews.
 */
function InterviewScheduler() {
  const { currentUser } = useAuth();
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [datetime, setDatetime] = useState("");
  const [interviews, setInterviews] = useState([]);

  /**
   * Fetches previously scheduled interviews from Firestore.
   *
   * - Runs on component mount or when the user changes.
   * - Pulls all interviews stored under the authenticated user’s UID.
   * - Updates local state to reflect retrieved interviews.
   */
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
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInterviews(data);
    };

    fetchInterviews();
  }, [currentUser]);

  /**
   * Handles form submission for scheduling an interview.
   *
   * - Validates that all fields are filled.
   * - Creates a new interview object with position, company, datetime, and status.
   * - Saves the interview to Firestore under the user’s UID.
   * - Updates the UI to reflect the newly added interview.
   */
  const handleAddInterview = async (e) => {
    e.preventDefault();
    if (!currentUser || !position || !company || !datetime) return;

    const newInterview = {
      position,
      company,
      datetime,
      status: "Scheduled",
    };

    const ref = collection(db, "users", currentUser.uid, "interviews");
    await addDoc(ref, newInterview);

    setPosition("");
    setCompany("");
    setDatetime("");

    setInterviews((prev) => [...prev, newInterview]);
  };

  const hasUpcomingInterview = interviews.some((interview) => {
    const interviewDate = new Date(interview.datetime);
    const formattedDate = interviewDate.toLocaleDateString();
    const formattedTime = interviewDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return formatReminderTag(formattedDate, formattedTime);
  });

  return (
    <div className="interview-scheduler">
      <h3> Schedule an Interview</h3>
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
        {hasUpcomingInterview && (
          <div className="reminder-banner">
            You have an interview scheduled within the next 24 hours!
          </div>
        )}

        {interviews.map((interview) => {
          const interviewDate = new Date(interview.datetime);
          const isoDate = interviewDate.toISOString().split("T")[0];
          const isoTime = interviewDate.toTimeString().split(" ")[0];

          const reminder = formatReminderTag(isoDate, isoTime);

          const formattedDate = interviewDate.toLocaleDateString();
          const formattedTime = interviewDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div className="interview-card" key={interview.id}>
              <strong>{interview.company}</strong>
              <div>{interview.position}</div>
              <em>
                Scheduled: {formattedDate} at {formattedTime}
              </em>
              {reminder && <div className="reminder-tag">{reminder}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewScheduler;
