import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Jobs() {
  const navigate = useNavigate();

  const participant = JSON.parse(localStorage.getItem("participant")) || {};
  const participantId = participant.id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!participantId) {
      return;
    }

    let cancelled = false;

    fetch(`http://localhost:5000/api/jobs/match/${participantId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setJobs(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.log(err);
        setError("Something went wrong while loading jobs");
        setJobs([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [participantId]);

  const refreshJobs = () => {
    if (!participantId) return;

    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/jobs/match/${participantId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log(err);
        setError("Something went wrong while loading jobs");
        setJobs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!participantId) {
    return (
      <div className="discover-page">
        <div className="profile-card center-card">
          <h3>Participant not found</h3>
          <button className="profile-btn" onClick={() => navigate("/join")}>
            Go to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <div className="top-bar">
        <h2>Jobs</h2>

        <button
          className={`refresh-btn ${loading ? "spin" : ""}`}
          onClick={refreshJobs}
          disabled={loading}
        >
          ⟳
        </button>
      </div>

      <h3 className="discover-title">Career Opportunities</h3>
      <p className="ai-text">✨ JOBS MATCHED BY AI</p>

      {loading && <p className="loading">Finding job matches...</p>}

      {!loading && error && (
        <div className="profile-card center-card">
          <h3 className="error-title">Oops</h3>
          <p>{error}</p>
          <button className="profile-btn" onClick={refreshJobs}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="profile-card center-card">
          <h3>No jobs yet</h3>
          <p>No company has posted a job in this event yet.</p>
        </div>
      )}

      {!loading &&
        !error &&
        jobs.map((job) => (
          <div key={job.id} className="profile-card">
            <div className="profile-header">
              <div className="avatar-letter">
                {job.company_name?.charAt(0).toUpperCase() || "C"}
              </div>

              <div className="profile-info">
                <h3>{job.company_name}</h3>
                <p className="role">{job.role}</p>
              </div>

              <div className="match-badge">{job.matchScore}%</div>
            </div>

            <div className="quote">
              {job.description || "No description available"}
            </div>

            <div className="quote ai-reason-box">
              🤖{" "}
              {job.matchReason ||
                "Potential opportunity based on your event profile"}
            </div>

            {Array.isArray(job.tags) && job.tags.length > 0 && (
              <div className="tags-row">
                {job.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <button
              className="profile-btn"
              onClick={() =>
                navigate("/job-details", {
                  state: job,
                })
              }
            >
              View Job
            </button>
          </div>
        ))}

    </div>
  );
}