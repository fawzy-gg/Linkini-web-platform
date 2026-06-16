import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./App.css";

export default function Discover() {
  const navigate = useNavigate();

  const participant =
    JSON.parse(localStorage.getItem("participant")) || {};

  const participantId = participant.id;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!participantId) {
      return;
    }

    let cancelled = false;

    fetch(`http://localhost:5000/api/participants/match/${participantId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matches");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setMatches(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.log(err);
        setError("Something went wrong while loading matches");
        setMatches([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [participantId]);

  const refreshMatches = () => {
    if (!participantId) return;

    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/participants/match/${participantId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matches");
        return res.json();
      })
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log(err);
        setError("Something went wrong while loading matches");
        setMatches([]);
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
        <h2>Linkini</h2>

        <button
          className={`refresh-btn ${loading ? "spin" : ""}`}
          onClick={refreshMatches}
          disabled={loading}
        >
          ⟳
        </button>
      </div>

      <h3 className="discover-title">Discover</h3>
      <p className="ai-text">✨ MATCHES ENHANCED BY AI</p>

      {loading && <p className="loading">Finding matches...</p>}

      {!loading && error && (
        <div className="profile-card center-card">
          <h3 className="error-title">Oops</h3>
          <p>{error}</p>
          <button className="profile-btn" onClick={refreshMatches}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="profile-card center-card">
          <h3>No matches found yet</h3>
          <p>Try updating your profile, goal, or tags.</p>
          <button className="profile-btn" onClick={() => navigate("/profile")}>
            Update Profile
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        matches.map((p) => (
          <div key={p.id} className="profile-card">
            <div className="profile-header">
              <div className="avatar-letter">
                {p.nickname?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="profile-info">
                <h3>{p.nickname}</h3>
                <p className="role">{p.intention}</p>
              </div>

              <div className="match-badge">{p.matchScore}%</div>
            </div>

            <div className="quote">
              {p.bio ? `"${p.bio}"` : "No description available"}
            </div>

            <div className="quote ai-reason-box">
              🤖{" "}
              {p.matchReason ||
                "Potential networking opportunity based on your event profile"}
            </div>

            {Array.isArray(p.tags) && p.tags.length > 0 && (
              <div className="tags-row">
                {p.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <button
              className="profile-btn"
              onClick={() =>
                navigate("/user-profile", {
                  state: {
                    id: p.id,
                    nickname: p.nickname,
                    intention: p.intention,
                    bio: p.bio,
                    tags: p.tags,
                    matchReason: p.matchReason,
                    matchScore: p.matchScore,
                  },
                })
              }
            >
              View Profile
            </button>
          </div>
        ))}


    </div>
  );
}