import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";

function JobTracker() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;

      const appsRef = collection(db, "users", currentUser.uid, "applications");
      const snapshot = await getDocs(appsRef);
      const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
    };

    fetchApplications();
  }, [currentUser]);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!currentUser || !position || !company) return;

    const newApp = {
      position,
      company,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Applied",
    };

    const appsRef = collection(db, "users", currentUser.uid, "applications");
    await addDoc(appsRef, newApp);

    setPosition("");
    setCompany("");
    setApplications((prev) => [...prev, newApp]);
  };

  return (
    <div>
      <h2>Job Application Tracker</h2>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
        <button type="submit">Add Application</button>
      </form>

      <ul>
        {applications.map((app, index) => (
          <li key={index}>
            {app.position} @ {app.company} - {app.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobTracker;
