import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Messages() {
  const navigate = useNavigate();
  const participant = JSON.parse(localStorage.getItem("participant")) || {};

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!participant.id) return;

    fetch(`http://localhost:5000/api/messages/conversations/${participant.id}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.log(err));
  }, [participant.id]);

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.nickname?.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  return (
    <div className="messages-page">
      <div className="messages-shell">
        <div className="messages-header">
          <button className="mini-btn" onClick={() => navigate(-1)}>
            ←
          </button>

          <div>
            <h2>Messages</h2>
            <p>All your conversations</p>
          </div>
        </div>

        <div className="messages-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredConversations.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start a conversation from a profile, job, or dashboard.</p>
          </div>
        ) : (
          <div className="messages-list">
            {filteredConversations.map((c) => {
              const isMe = Number(c.sender_id) === Number(participant.id);
              const unreadCount = Number(c.unread_count || 0);

              return (
                <div
                  key={c.id}
                  className={`messenger-row ${
                    unreadCount > 0 ? "has-unread" : ""
                  }`}
                  onClick={() =>
                    navigate("/chat", {
                      state: {
                        userId: c.id,
                        nickname: c.nickname,
                      },
                    })
                  }
                >
                  <div className="messenger-avatar">
                    {c.nickname?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="messenger-content">
                    <div className="messenger-top">
                      <h4>{c.nickname || "Unknown user"}</h4>
                      <span>{formatTime(c.created_at)}</span>
                    </div>

                    <div className="messenger-bottom">
                      <p>
                        {isMe ? "You: " : ""}
                        {c.content || "No message yet"}
                      </p>

                      {unreadCount > 0 && (
                        <strong className="messenger-badge">
                          {unreadCount}
                        </strong>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}