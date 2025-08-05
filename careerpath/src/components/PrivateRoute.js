/**
 * PrivateRoute Component
 *
 * Restricts access to routes that require authentication. If a user is
 * authenticated (i.e., `currentUser` exists), it renders the requested
 * child component. Otherwise, it redirects the user to the login page.
 *
 * This component helps protect sensitive routes (e.g., dashboard) from
 * unauthenticated access using Firebase Auth state.
 *
 * @param {Object} props - React props
 * @param {JSX.Element} props.children - The component to render if the user is authenticated
 * @returns {JSX.Element} The child component or a redirect to the login page
 *
 * By: Nolan Dela Rosa
 *
 * May 3, 2025
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PrivateRoute
 *
 * A wrapper component used to protect routes that require authentication.
 * It checks if the current user is logged in via the AuthContext.
 *
 * If the user is authenticated, it renders the specified child component(s).
 * If not, it redirects the user to the login page.
 *
 * @param {Object} props - React props
 * @param {JSX.Element} props.children - The component(s) to render if access is granted
 * @returns {JSX.Element} Either the child components or a redirect to the login route
 */
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return currentUser ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
