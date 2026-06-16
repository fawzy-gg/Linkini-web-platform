import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  ArrowLeft,
  Users,
  Building2,
  Briefcase,
  MessageCircle,
  Network,
} from "lucide-react";
import "./App.css";

const socket = io("http://localhost:5000");

export default function PlatformDashboard() {
  const navigate = useNavigate();

  const selectedEvent = JSON.parse(
    localStorage.getItem("selectedOrganizerEvent")
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    if (!selectedEvent?.id) {
      navigate("/organizer");
      return;
    }

    fetch(`http://localhost:5000/api/events/${selectedEvent.id}/stats`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [navigate, selectedEvent?.id]);

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) {
      setAlertMsg("Please write a notification message");
      return;
    }

    socket.emit("send_broadcast", {
      event_id: selectedEvent.id,
      message: broadcastMsg.trim(),
    });

    setBroadcastMsg("");
    setAlertMsg("Notification sent ✅");
  };

  const cards = [
    {
      label: "Participants",
      value: data?.totalParticipants || 0,
      icon: Users,
    },
    {
      label: "Companies",
      value: data?.totalCompanies || 0,
      icon: Building2,
    },
    {
      label: "Jobs",
      value: data?.totalJobs || 0,
      icon: Briefcase,
    },
    {
      label: "Messages",
      value: data?.totalMessages || 0,
      icon: MessageCircle,
    },
    {
      label: "Connections",
      value: data?.totalConnections || 0,
      icon: Network,
    },
  ];

  return (
    <div className="platform-dashboard-page">
      <div className="top-bar">
        <button className="mini-btn" onClick={() => navigate("/organizer")}>
          <ArrowLeft size={19} />
        </button>

        <h2>{selectedEvent?.title || "Event Dashboard"}</h2>
      </div>

      <p className="ai-text">EVENT CODE: {selectedEvent?.code}</p>

      {loading && <p className="loading">Loading dashboard...</p>}

      {!loading && (
        <>
          <div className="platform-stats-grid">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.label} className="platform-stat-card">
                  <div className="platform-icon">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3>{card.value}</h3>
                    <p>{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="profile-card">
            <div className="section-title-row">
              <h3>Broadcast Notification</h3>
              <MessageCircle size={18} />
            </div>

            <p className="ai-text">
              Send a real-time announcement to all participants in this event.
            </p>

            <textarea
              rows={4}
              className="kp-textarea"
              placeholder="Write your announcement..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
            />

            <button className="profile-btn" onClick={sendBroadcast}>
              Send Notification
            </button>
          </div>

          <div className="profile-card">
            <div className="section-title-row">
              <h3>Recent Jobs</h3>
              <Briefcase size={18} />
            </div>

            {data?.recentJobs?.length === 0 && (
              <p className="empty">No jobs yet</p>
            )}

            {data?.recentJobs?.map((job) => (
              <div key={job.id} className="dashboard-row">
                <div>
                  <h4>{job.role}</h4>
                  <p>{job.company_name}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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