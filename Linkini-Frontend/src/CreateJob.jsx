import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function CreateJob() {
  const navigate = useNavigate();
  const participant = JSON.parse(localStorage.getItem("participant")) || {};

  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const handleCreate = async () => {
    if (!role.trim()) {
      setAlertMsg("Role is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: participant.event_id,
          owner_id: participant.id,
          role,
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMsg(data.message || "Error");
        return;
      }

      setAlertMsg("Job created ✅");

      setTimeout(() => {
        navigate("/jobs");
      }, 900);
    } catch (err) {
      console.log(err);
      setAlertMsg("Error creating job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">
      <div className="create-job-card">
        <div className="create-job-header">
          <button className="mini-btn" onClick={() => navigate("/profile")}>
            ←
          </button>

          <div>
            <h2>Create Job</h2>
            <p>Post a new opportunity for event participants</p>
          </div>
        </div>

        <div className="job-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 7V6a3 3 0 0 1 3-3 3 3 0 0 1 3 3v1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4 8h16v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M4 13h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="create-job-form">
          <div className="job-field">
            <label>ROLE</label>
            <input
              type="text"
              placeholder="e.g Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="job-field">
            <label>JOB DESCRIPTION</label>
            <textarea
              rows={5}
              placeholder="Describe the opportunity, mission, responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="job-field">
            <label>SKILLS / TAGS</label>
            <input
              type="text"
              placeholder="React, JS, UI"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <button
            className="create-job-btn"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Job →"}
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            <h3>Notice</h3>
            <p>{alertMsg}</p>
            <button onClick={() => setAlertMsg("")}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}