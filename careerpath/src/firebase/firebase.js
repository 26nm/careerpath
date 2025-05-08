/**
 * Firebase configuration and initialization file for the CareerPath app.
 * 
 * This file sets up the connection between the React frontend and Firebase services,
 * including Authentication, Firestore (database), and Cloud Storage.
 * 
 * - `initializeApp()` sets up the Firebase instance using the project config.
 * - `getAuth()` provides access to Firebase Authentication (user login/signup).
 * - `getFirestore()` connects to the Firestore database (job tracking data, etc.).
 * - `getStorage()` allows for storing files like resumes in Firebase Cloud Storage.
 * 
 * These services are exported so they can be used throughout the application.
 * 
 * By: Nolan Dela Rosa
 * 
 * May 3, 2025
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyD8OCrnEbXbVPAqeP0xHFNy18iEKx90z0Q",
  authDomain: "careerpath-cad61.firebaseapp.com",
  projectId: "careerpath-cad61",
  storageBucket: "careerpath-cad61.firebasestorage.app",
  messagingSenderId: "42807319364",
  appId: "1:42807319364:web:1e2f2adabe4cc2fc84d511",
  measurementId: "G-HMY25EJMDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);