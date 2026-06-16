import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

export default function UserProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    id: profileId,
    nickname,
    intention,
    bio,
    tags = [],
    matchReason,
    matchScore,
  } = location.state || {};

  const participant = JSON.parse(localStorage.getItem("participant")) || {};
  const myId = participant.id;

  const [status, setStatus] = useState("none");

  useEffect(() => {
    if (!myId || !profileId) return;

    fetch(`http://localhost:5000/api/connections/${myId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const existing = data.find(
          (c) =>
            (c.requester_id == myId && c.receiver_id == profileId) ||
            (c.requester_id == profileId && c.receiver_id == myId)
        );

        if (existing) {
          if (existing.status === "pending") setStatus("pending");
          if (existing.status === "accepted") setStatus("connected");
        }
      });
  }, [myId, profileId]);

  const sendRequest = async () => {
    if (myId === profileId) {
      alert("You can't connect to yourself 😅");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: participant.event_id,
          requester_id: myId,
          receiver_id: profileId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error");
        return;
      }

      setStatus("pending");
    } catch (err) {
      console.log(err);
      alert("Error sending request");
    }
  };

  const getButtonText = () => {
    if (status === "pending") return "⏳ Request Sent";
    if (status === "connected") return "✅ Connected";
    return "Request Connection";
  };

  return (
    <div className="user-profile-page">
      <div className="top-bar">
        <button className="mini-btn" onClick={() => navigate("/discover")}>
          ←
        </button>

        <h2>Profile</h2>
      </div>

      <div className="avatar-section">
        <div className="avatar-letter big">
          {nickname?.charAt(0).toUpperCase() || "U"}
        </div>

        <h2 className="user-name">{nickname || "User"}</h2>
        <p className="user-role">{intention || "Participant"}</p>

        {matchScore && <div className="match-badge profile-match">{matchScore}% Match</div>}
      </div>

      <div className="profile-card">
        <h4>About {nickname}</h4>
        <p>{bio || "No bio available."}</p>
      </div>

      <div className="profile-card">
        <h4>Interests</h4>

        <div className="interest-tags">
          {Array.isArray(tags) && tags.length > 0 ? (
            tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))
          ) : (
            <p>No tags available</p>
          )}
        </div>
      </div>

      <button
        className="connect-button"
        onClick={sendRequest}
        disabled={status !== "none"}
      >
        {getButtonText()}
      </button>

      <button
        className="profile-btn secondary-action"
        onClick={() =>
          navigate("/chat", {
            state: {
              userId: profileId,
              nickname,
            },
          })
        }
      >
        Message
      </button>

      <div className="profile-card ai-card">
        <h4>AI Match Insight</h4>
        <p>
          {matchReason ||
            "Potential networking opportunity based on your event profile"}
        </p>
      </div>
    </div>
  );
}