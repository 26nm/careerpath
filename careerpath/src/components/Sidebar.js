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

function Sidebar({ setActiveView }) {
  return (
    <div className="sidebar">
      <h3>CareerPath</h3>
      <ul>
        <li onClick={() => setActiveView("job-tracker")}>Job Tracker</li>
        <li onClick={() => setActiveView("interview-scheduler")}>Interviews</li>
        <li onClick={() => setActiveView("resume-uploader")}>
          Resume Uploader
        </li>
        <li onClick={() => setActiveView("resume-analysis")}>
          Resume Analyzer
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
