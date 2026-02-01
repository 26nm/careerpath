/**
 * Sidebar Component
 *
 * This component provides a vertical navigation menu for switching between different
 * sections of the CareerPath dashboard. It receives `setActiveView` as a prop, which
 * allows the parent Dashboard component to update the current view based on user selection.
 *
 * The sidebar includes clickable list items for:
 * - Job Tracker
 * - Interview Scheduler
 * - Resume Uploader
 * - Resume Analyzer
 *
 * Clicking an item updates the main content area of the dashboard accordingly.
 *
 * Styling is handled via an external CSS file (Sidebar.css).
 *
 * @component
 * @param {function} setActiveView - Function to update the currently active dashboard view
 * @returns {JSX.Element} Sidebar navigation menu
 *
 * By: Nolan Dela Rosa
 * July 12, 2025
 */
import React from "react";
import "../styles/Sidebar.css";
import "../styles/AppLayout.css";
import { auth } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import {
  FaSuitcase,
  FaCalendarAlt,
  FaFileUpload,
  FaChartBar,
} from "react-icons/fa";

function Sidebar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="sidebar">
      <h3>CareerPath 🗺️</h3>
      <ul>
        <li
          className={isActive("/dashboard") ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          <FaSuitcase style={{ marginRight: "8px" }} />
          JobTracker
        </li>
        <li
          className={isActive("/dashboard/interview-scheduler") ? "active" : ""}
          onClick={() => navigate("/dashboard/interview-scheduler")}
        >
          <FaCalendarAlt style={{ marginRight: "8px " }} />
          Interviews
        </li>
        <li
          className={isActive("/dashboard/resume-uploader") ? "active" : ""}
          onClick={() => navigate("/dashboard/resume-uploader")}
        >
          <FaFileUpload style={{ marginRight: "8px " }} />
          Resume Uploader
        </li>
        <li
          className={isActive("/dashboard/resume-analysis") ? "active" : ""}
          onClick={() => navigate("/dashboard/resume-analysis")}
        >
          <FaChartBar style={{ marginRight: "8px " }} />
          Resume Analysis
        </li>
      </ul>

      <div className="logout-area">
        <p>
          Signed in as <strong>{currentUser?.email}</strong>
        </p>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default Sidebar;
