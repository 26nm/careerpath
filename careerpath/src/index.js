/**
 * index.js
 *
 * Entry point of the React application.
 * Wraps the entire app with React Router and AuthProvider context.
 * Ensures routing and authentication are available throughout the app.
 *
 * Nolan Dela Rosa
 *
 * August 4, 2025
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
