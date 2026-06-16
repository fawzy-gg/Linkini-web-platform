import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import "./App.css";

export default function Organizer() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const fetchEvents = () => {
    fetch("http://localhost:5000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async () => {
    if (!title.trim()) {
      setFormError("Event title is required");
      return;
    }

    await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    setFormError("");
    setShowCreate(false);
    fetchEvents();
  };

  const toggleEvent = async (id) => {
    await fetch(`http://localhost:5000/api/events/${id}/toggle`, {
      method: "PUT",
    });

    fetchEvents();
  };

  const deleteEvent = async () => {
    if (!eventToDelete) return;

    await fetch(`http://localhost:5000/api/events/${eventToDelete}`, {
      method: "DELETE",
    });

    setShowDeleteModal(false);
    setEventToDelete(null);
    fetchEvents();
  };

  const openEventDashboard = (event) => {
    localStorage.setItem("selectedOrganizerEvent", JSON.stringify(event));
    navigate("/platform-dashboard");
  };

  return (
    <div className="platform-dashboard-page">
      <div className="top-bar">
        <button className="mini-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={19} />
        </button>

        <h2>Organizer Events</h2>

        <button className="mini-btn" onClick={() => setShowCreate(true)}>
          <Plus size={19} />
        </button>
      </div>

      <p className="ai-text">MANAGE YOUR EVENTS</p>

      {loading && <p className="loading">Loading events...</p>}

      {!loading && events.length === 0 && <p className="empty">No events yet</p>}

      {!loading && events.length > 0 && (
        <div className="events-list-simple">
          {events.map((event) => (
            <div
              key={event.id}
              className="dashboard-row event-clickable"
              onClick={() => openEventDashboard(event)}
            >
              <div>
                <h4>{event.name || event.title}</h4>
                <p>Code: {event.code}</p>
                <p>Status: {event.is_active ? "🟢 Active" : "🔴 Inactive"}</p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEvent(event.id);
                  }}
                >
                  {event.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventToDelete(event.id);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h2>Create Event</h2>

            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormError("");
              }}
            />

            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              The access code will be generated automatically.
            </p>

            {formError && <div className="errorBox">{formError}</div>}

            <button className="modalBtn" onClick={createEvent}>
              Create
            </button>

            <button
              className="cancelBtn"
              onClick={() => {
                setShowCreate(false);
                setFormError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            <h3>Delete Event</h3>

            <p>
              Are you sure you want to permanently delete this event and all its
              related data?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                onClick={deleteEvent}
                style={{
                  background: "#dc2626",
                  color: "white",
                }}
              >
                Delete
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEventToDelete(null);
                }}
                style={{
                  background: "#e5e7eb",
                  color: "#111827",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}