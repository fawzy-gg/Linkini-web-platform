import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";

export default function JobDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const participant = JSON.parse(localStorage.getItem("participant")) || {};
  const [status, setStatus] = useState("idle");

  if (!state) {
    return (
      <div className="discover-page">
        <div className="profile-card center-card">
          <p>Job not found</p>
          <button className="profile-btn" onClick={() => navigate("/jobs")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const {
    id,
    owner_id,
    company_name,
    role,
    description,
    tags,
    matchScore,
    matchReason,
  } = state;

  const sendInterest = async () => {
    if (status === "sent") return;

    try {
      const res = await fetch("http://localhost:5000/api/job-interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          job_id: id,
          user_id: participant.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error");
        return;
      }

      setStatus("sent");
    } catch (err) {
      console.log(err);
      alert("Error sending interest");
    }
  };

  return (
    <div className="user-profile-page">
      <div className="top-bar">
        <button className="mini-btn" onClick={() => navigate(-1)}>
          ←
        </button>

        <h2>Job Details</h2>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-letter">
            {company_name?.charAt(0).toUpperCase() || "C"}
          </div>

          <div className="profile-info">
            <h3>{company_name}</h3>
            <p className="role">{role}</p>
          </div>

          <div className="match-badge">{matchScore}%</div>
        </div>
      </div>

      <div className="profile-card">
        <h4>Description</h4>
        <p>{description || "No description available."}</p>
      </div>

      <div className="profile-card">
        <h4>Skills</h4>

        <div className="tags-row">
          {tags?.map((tag, i) => (
            <span key={i} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="profile-card ai-card">
        <h4>AI Insight</h4>
        <p>{matchReason}</p>
      </div>

      <button
        className="connect-button"
        onClick={sendInterest}
        disabled={status === "sent"}
      >
        {status === "sent" ? "✅ Interest Sent" : "I'm Interested 🚀"}
      </button>

      <button
        className="profile-btn secondary-action"
        onClick={() =>
          navigate("/chat", {
            state: {
              userId: owner_id,
              nickname: company_name,
            },
          })
        }
      >
        Message Company
      </button>
    </div>
  );
}