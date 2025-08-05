/**
 * App Component
 *
 * Serves as the main entry point for the CareerPath application.
 * Renders both the Signup and Login components side by side,
 * allowing users to either register a new account or log in to an existing one.
 *
 * This setup is primarily for development and testing purposes,
 * providing easy access to both authentication forms simultaneously.
 *
 * @component
 * @returns {JSX.Element} The main application component displaying authentication forms.
 *
 * By: Nolan Dela Rosa
 *
 * May 3, 2025
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import JobTracker from "./components/JobTracker";
import InterviewScheduler from "./components/InterviewScheduler";
import ResumeUploader from "./components/ResumeUploader";
import ResumeParse from "./components/ResumeParse";
import "./App.css";

/**
 * The App component serves as the main container for the CareerPath authentication interface.
 * It renders both the Signup and Login components side by side using a flex layout.
 * This setup allows users to either create a new account or log into an existing one.
 * It is primarily intended for testing and early-stage development of authentication features.
 *
 * @returns {JSX.Element} A UI layout displaying both Signup and Login forms.
 */
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<JobTracker />} />
          <Route path="resume-uploader" element={<ResumeUploader />} />
          <Route path="interview-scheduler" element={<InterviewScheduler />} />
          <Route path="resume-analysis" element={<ResumeParse />} />
        </Route>

        <Route
          path="/resume-analysis"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ResumeParse />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
