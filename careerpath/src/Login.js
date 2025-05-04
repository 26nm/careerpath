/**
 * Login.js
 * 
 * This component provides a simple user login form using Firebase Authentication.
 * It allows users to sign in using an email and password previously registered through Firebase.
 * 
 * Functionality:
 * - Uses React's useState to manage input fields and error messages.
 * - Calls signInWithEmailAndPassword from Firebase Auth to validate user credentials.
 * - Displays a success alert on successful login, or an error message if authentication fails.
 * 
 * This component is intended to be one of the entry points for authenticated access to the CareerPath app.
 * 
 * Nolan Dela Rosa
 * 
 * May 3, 2025
 */
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

/**
 * Login
 * 
 * A React functional component that renders a login form using Firebase Authentication.
 * Allows users to log in with an email and password. Displays an alert on successful login
 * or an error message if authentication fails.
 * 
 * @returns {JSX.Element} The rendered login form component.
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * handleLogin
   * 
   * Handles the user login form submission. Prevents the default form behavior,
   * then attempts to sign in the user using Firebase Authentication with the provided
   * email and password. If login is successful, displays a confirmation alert. 
   * If an error occurs, captures and displays the error message.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
      navigate('/dashboard');

    } catch (err) {
        setError(err.message);
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/signup"> Sign up</a>
      </p>
      {error && <p style={{ color: 'red'}}>{error}</p>}
    </div>
  );
}

export default Login;