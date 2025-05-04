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
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import PrivateRoute from "./PrivateRoute";
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
      <h1>CareerPath</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
