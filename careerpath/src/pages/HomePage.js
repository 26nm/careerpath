import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

/**
 * HomePage Component
 *
 * Serves as the public landing page for the CareerPath application.
 * This component introduces users to the platform’s core features
 * and provides entry points for authentication (signup and login).
 *
 * Features:
 * - Displays a hero section with the app title and value proposition
 * - Provides primary call-to-action buttons for account creation and login
 * - Highlights key features of the platform (Resume Analysis, Job Tracker, Interview Scheduler)
 *
 * Responsibilities:
 * - Acts as the default route ("/") for first-time or logged-out users
 * - Guides users toward authentication flows
 * - Establishes a clear overview of the application's purpose
 *
 * Navigation:
 * - "Get Started" → redirects to "/signup"
 * - "Log In" → redirects to "/login"
 *
 * Styling:
 * - Uses external CSS from HomePage.css
 * - Organized into two main sections: hero and features
 *
 * @component
 * @returns {JSX.Element} The landing page UI for CareerPath
 *
 * By: Nolan Dela Rosa
 * (Updated for homepage implementation)
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero">
        <h1>CareerPath</h1>
        <p>
          Track your job search, analyze your resume, and manage interviews, all
          in one place.
        </p>

        <div className="hero-buttons">
          <button onClick={() => navigate("/signup")}>Get Started</button>
          <button onClick={() => navigate("/login")}>Log In</button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="feature-card">
          <h3> 📊 Resume Analysis</h3>
          <p>
            Compare you resume with job descriptions to identify gaps and
            improve your chances of getting hired.
          </p>
        </div>

        <div className="feature-card">
          <h3>💼 Job Tracker</h3>
          <p> Keep all your applications organized in one place.</p>
        </div>

        <div className="feature-card">
          <h3>🗓️ Interview Scheduler</h3>
          <p> Track interviews and never miss an important date.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
