/**
 * Signup.js
 *
 * This component handles user registration using Firebase Authentication.
 *
 * Features:
 * - Accepts email and password input from the user
 * - Uses Firebase's `createUserWithEmailAndPassword` to create a new account
 * - Displays an alert upon successful registration or an error message if it fails
 *
 * Notes:
 * - Relies on the `auth` object exported from `firebase.js`
 * - This is one of the first steps in enabling user-specific features within the CareerPath app
 *
 * By: Nolan Dela Rosa
 *
 * May 3, 2025
 */
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AuthForm.css";

/**
 * Signup component
 *
 * This React function component allows users to register for a new account using Firebase Authentication.
 * It includes:
 * - Email and password input fields with controlled state
 * - Form submission handler that creates a new user with `createUserWithEmailAndPassword`
 * - Basic error handling to display Firebase-auth errors to the user
 *
 * A success alert confirms account creation, and the component is intended to be
 * the first step in the user flow for CareerPath.
 */
function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * handleSignup
   *
   * Handles the user signup form submission. Prevents the default form behavior,
   * then attempts to create a new user account using Firebase Authentication with the provided
   * email and password. If successful, displays a success alert. If an error occurs,
   * it captures and displays the error message.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p className="auth-error">{error}</p>}
      <div className="auth-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}

export default Signup;
