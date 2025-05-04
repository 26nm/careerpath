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
import React from 'react';
import { useAuth } from './AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles user logout by signing out of Firebase Authentication.
   * On success, navigates the user back to the login screen.
   * Logs an error to the console if logout fails.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');

    } catch (err) {
        console.error('Logout failed:', err);
    }
  };

  return (
    <div>
      <h2>Welcome to CareerPath!</h2>
      <p>You're logged in as: {currentUser?.email}</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default Dashboard;