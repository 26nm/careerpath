/**
 * AuthContext.js
 *
 * This module creates a global authentication context for the CareerPath app using React Context API.
 * It provides access to the current authenticated user throughout the application and tracks
 * authentication state changes using Firebase Authentication.
 *
 * Key Features:
 * - Initializes a React context for auth-related data.
 * - Exposes a custom hook `useAuth()` for accessing auth context.
 * - Defines an `AuthProvider` component that wraps the app and listens for auth state changes
 *   (login/logout) via Firebase's `onAuthStateChanged`.
 * - Ensures components render only after the auth state has been determined (via `loading` state).
 *
 * Usage:
 * - Wrap the root component (e.g., <App />) in <AuthProvider> to provide auth context.
 * - Use `useAuth()` in any child component to access `currentUser`.
 *
 * This context is essential for implementing protected routes, conditional rendering,
 * and enabling components to react to login/logout events across the application.
 *
 * Author: Nolan Dela Rosa
 *
 * Date: May 3, 2025
 */
import React, { useContext, useEffect, useState, createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const AuthContext = createContext();

/**
 * Custom hook to access the authentication context.
 *
 * Allows components to easily retrieve the current user's authentication state
 * and any related data provided by the AuthProvider.
 *
 * @returns {object} The current authentication context value (e.g., currentUser).
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider Component
 *
 * Wraps the application and provides authentication state (e.g., currentUser)
 * to all child components via React Context. It listens to Firebase's auth state
 * using `onAuthStateChanged`, and updates the `currentUser` state accordingly.
 *
 * The component delays rendering of children until the initial authentication
 * check is complete (i.e., `loading` is false), preventing flickering or incorrect
 * access control during the app's initial load.
 *
 * @param {object} props - React props
 * @param {ReactNode} props.children - The components that require access to auth context
 *
 * @returns {JSX.Element} The provider component wrapping all children with auth context
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * useEffect Hook for Firebase Auth State Tracking
   *
   * Sets up a listener using Firebase's `onAuthStateChanged` to monitor changes
   * in the user's authentication state. When the auth state changes (e.g., user logs in or out),
   * it updates the `currentUser` state and sets `loading` to false once the check is complete.
   *
   * The returned `unsubscribe` function ensures the listener is cleaned up when the component unmounts,
   * preventing memory leaks or multiple listeners being attached.
   *
   * This effect runs only once on component mount due to the empty dependency array.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
