import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const participant = JSON.parse(localStorage.getItem("participant")) || {};

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!participant.id) return;

    fetch(`http://localhost:5000/api/company-dashboard/${participant.id}`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [participant.id]);

  return (
    <div className="company-dashboard-page">
      <div className="company-dashboard-shell">
        <div className="company-dashboard-header">
          <button className="mini-btn" onClick={() => navigate("/profile")}>
            ←
          </button>

          <div>
            <h2>Dashboard</h2>
            <p>AI ranked interested candidates</p>
          </div>

          <button
            className="dashboard-post-btn"
            onClick={() => navigate("/create-job")}
          >
            + Job
          </button>
        </div>

        {loading && <p className="loading">Loading dashboard...</p>}

        {!loading && jobs.length === 0 && (
          <div className="dashboard-empty-card">
            <div className="dashboard-empty-icon">💼</div>
            <h3>No jobs yet</h3>
            <p>Post your first job to see interested candidates here.</p>
            <button onClick={() => navigate("/create-job")}>Post Job →</button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="dashboard-jobs-list">
            {jobs.map((job) => (
              <div key={job.id} className="dashboard-job-card">
                <div className="dashboard-job-top">
                  <div className="dashboard-job-icon">
                    {job.role?.charAt(0).toUpperCase() || "J"}
                  </div>

                  <div>
                    <h3>{job.role}</h3>
                    <p>{job.interested_users?.length || 0} interested</p>
                  </div>
                </div>

                <div className="dashboard-job-desc">
                  {job.description || "No description available"}
                </div>

                <div className="dashboard-section-title">
                  Interested People
                </div>

                {job.interested_users?.length === 0 && (
                  <p className="dashboard-empty-text">No one interested yet</p>
                )}

                <div className="dashboard-candidates-list">
                  {job.interested_users?.map((user) => (
                    <div key={user.id} className="dashboard-candidate-card">
                      <div className="dashboard-candidate-avatar">
                        {user.nickname?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="dashboard-candidate-info">
                        <h4>{user.nickname}</h4>
                        <p>{user.intention || "Participant"}</p>

                        <div className="dashboard-match">
                          {user.matchScore}% match
                        </div>

                        <small>{user.matchReason}</small>
                      </div>

                      <button
                        className="dashboard-message-btn"
                        onClick={() =>
                          navigate("/chat", {
                            state: {
                              userId: user.id,
                              nickname: user.nickname,
                            },
                          })
                        }
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}