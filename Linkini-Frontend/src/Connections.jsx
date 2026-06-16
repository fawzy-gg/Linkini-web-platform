import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Connections() {
  const navigate = useNavigate();

  const participant =
    JSON.parse(localStorage.getItem("participant")) || {};

  const myId = participant.id;

  const [connections, setConnections] = useState([]);
  const [activeTab, setActiveTab] = useState("connected");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!myId) return;

    fetch(`http://localhost:5000/api/connections/${myId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConnections(data);
        } else {
          setConnections([]);
        }
      });
  }, [myId]);

  const requests = connections.filter(
    (c) => c.status === "pending" && c.receiver_id === myId
  );

  const connected = connections.filter(
    (c) => c.status === "accepted"
  );

  const filteredRequests = requests.filter((c) =>
    c.requester_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConnected = connected.filter((c) =>
    c.connected_with?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id, status) => {
    fetch(`http://localhost:5000/api/connections/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }).then(() => {
      setConnections((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status } : c
        )
      );
    });
  };

  return (
    <div className="network-page">
      <div className="top-back-wrapper">
        <button
          className="top-back-btn"
          onClick={() => navigate("/discover")}
        >
          ←
        </button>
      </div>

      <div className="network-header">
        <h2>Network</h2>
      </div>

      <input
        className="search-bar"
        placeholder="Search people..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="tabs">
        <span
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          Requests ({requests.length})
        </span>

        <span
          className={activeTab === "connected" ? "active" : ""}
          onClick={() => setActiveTab("connected")}
        >
          Connected ({connected.length})
        </span>
      </div>

      <div className="connection-list">
        {activeTab === "requests" &&
          filteredRequests.map((c) => (
            <div key={c.id} className="connection-item">
              <div className="avatar-letter">
                {c.requester_name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="info">
                <h4>{c.requester_name}</h4>
                <p>Wants to connect</p>
              </div>

              <div className="actions">
                <button
                  className="reject"
                  onClick={() => updateStatus(c.id, "rejected")}
                >
                  ✕
                </button>

                <button
                  className="accept"
                  onClick={() => updateStatus(c.id, "accepted")}
                >
                  ✓
                </button>
              </div>
            </div>
          ))}

        {activeTab === "connected" &&
          filteredConnected.map((c) => (
            <div key={c.id} className="connection-item">
              <div className="avatar-letter">
                {c.connected_with?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="info">
                <h4>{c.connected_with}</h4>
                <p>Connected</p>
              </div>

              <button
                className="msg-btn"
                onClick={() =>
                  navigate("/chat", {
                    state: {
                      userId: c.other_user_id,
                      nickname: c.connected_with,
                    },
                  })
                }
              >
                Message
              </button>
            </div>
          ))}

        {activeTab === "requests" && filteredRequests.length === 0 && (
          <p className="empty">No requests found</p>
        )}

        {activeTab === "connected" && filteredConnected.length === 0 && (
          <p className="empty">No connections found</p>
        )}
      </div>
    </div>
  );
}