/**
 * Dashboard Component
 *
 * This component serves as the landing page after a successful login or signup.
 * It uses `useAuth` to retrieve the current authenticated user's info and
 * displays a personalized welcome message with the user's email.
 *
 * It also includes a logout button that signs the user out via Firebase Authentication
 * and redirects them back to the login page using React Router's `useNavigate`.
 *
 * This is a protected route, only accessible when the user is authenticated.
 *
 * @component
 * @returns {JSX.Element} The user dashboard with a logout option.
 *
 * By: Nolan Dela Rosa
 *
 * May 3, 2025
 */
import React, { useState } from "react";
import JobTracker from "../components/JobTracker";
import InterviewScheduler from "../components/InterviewScheduler";
import ResumeUploader from "../components/ResumeUploader";
import ResumeParse from "../components/ResumeParse";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

/**
 * Dashboard Component
 *
 * Displays a personalized welcome message for the authenticated user,
 * along with a logout button. Uses the `useAuth` hook to access the
 * current user's authentication state and `useNavigate` to handle
 * redirection after logout.
 *
 * @returns {JSX.Element} A dashboard view with user info and a logout button.
 */
function Dashboard() {
  const [activeView, setActiveView] = useState("job-tracker");
  const [parseResumeText, setParsedResumeText] = useState("");

  const renderActiveComponent = () => {
    switch (activeView) {
      case "job-tracker":
        return <JobTracker />;

      case "interview-scheduler":
        return <InterviewScheduler />;

      case "resume-uploader":
        return <ResumeUploader setParsedResumeText={setParsedResumeText} />;

      case "resume-analysis":
        return <ResumeParse resumeText={parseResumeText} />;

      default:
        return <JobTracker />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar setActiveView={setActiveView} activeView={activeView} />
      <div className="dashboard-content">{renderActiveComponent()}</div>
    </div>
  );
}

export default Dashboard;
