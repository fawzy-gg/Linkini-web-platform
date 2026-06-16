import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";

export default function Profile() {
  const navigate = useNavigate();

  const stored = JSON.parse(localStorage.getItem("participant")) || {};

  const [nickname, setNickname] = useState(stored.nickname || "");
  const [intention, setIntention] = useState(stored.intention || "");
  const [bio, setBio] = useState(stored.bio || "");
  const [aiEnabled, setAiEnabled] = useState(stored.ai_enabled || false);
  const [isVisible, setIsVisible] = useState(stored.is_visible ?? true);
  const [alertMsg, setAlertMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const id = stored.id;
  const isCompany = stored.is_company || false;

  const saveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/participants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          intention,
          bio,
          ai_enabled: aiEnabled,
          tags: stored.tags || [],
          is_company: isCompany,
          is_visible: isVisible,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMsg(data.message || "Error");
        return;
      }

      localStorage.setItem("participant", JSON.stringify(data));
      setAlertMsg("Profile updated ✅");
    } catch (err) {
      console.log(err);
      setAlertMsg("Error updating profile");
    }
  };

  const logout = () => {
    localStorage.removeItem("participant");
    navigate("/");
  };

  const deleteMyData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/participants/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setShowDeleteModal(false);
        setAlertMsg(data.message || "Error deleting data");
        return;
      }

      localStorage.removeItem("participant");
      localStorage.removeItem("event");
      localStorage.removeItem("selectedOrganizerEvent");

      setShowDeleteModal(false);
      setAlertMsg("Your data has been deleted successfully");

      setTimeout(() => {
        navigate("/");
      }, 1300);
    } catch (err) {
      console.log(err);
      setShowDeleteModal(false);
      setAlertMsg("Error deleting data");
    }
  };

  return (
    <div className="profile-pro-page">
      <div className="profile-pro-shell">
        <div className="profile-pro-header">
          <button className="mini-btn" onClick={() => navigate("/discover")}>
            ←
          </button>

          <div>
            <h2>Profile</h2>
            <p>Manage your event identity</p>
          </div>
        </div>

        <div className="profile-hero-card">
          <div className="profile-hero-avatar">
            {nickname?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="profile-hero-info">
            <h1>{nickname || "User"}</h1>
            <span>{isCompany ? "Company Account" : "Participant Account"}</span>
          </div>
        </div>

        <div className="profile-form-grid">
          <div className="profile-field-card">
            <label>{isCompany ? "COMPANY NAME" : "NICKNAME"}</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={isCompany ? "Company name" : "Your nickname"}
            />
          </div>

          <div className="profile-field-card">
            <label>{isCompany ? "COMPANY GOAL" : "MY GOAL"}</label>
            <input
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder={isCompany ? "Hiring, Partnership..." : "Networking..."}
            />
          </div>

          <div className="profile-field-card profile-full">
            <label>{isCompany ? "ABOUT COMPANY" : "ABOUT YOU"}</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                isCompany
                  ? "Describe your company..."
                  : "Tell people about yourself..."
              }
            />
          </div>
        </div>

        <div className="profile-smart-card">
          <div>
            <h4>AI Smart Matching</h4>
            <p>Use your profile to improve recommendations.</p>
          </div>

          <label className="kp-switch">
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
            <span className="kp-slider" />
          </label>
        </div>

        <div className="profile-smart-card">
          <div>
            <h4>Profile Visibility</h4>
            <p>Show or hide your profile from Discover and AI Matching.</p>
          </div>

          <label className="kp-switch">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            <span className="kp-slider" />
          </label>
        </div>

        <div className="profile-actions">
          <button className="profile-save-btn" onClick={saveProfile}>
            Save Changes →
          </button>

          {isCompany && (
            <button
              className="profile-action-btn"
              onClick={() => navigate("/create-job")}
            >
              Post Job
            </button>
          )}

          {isCompany && (
            <button
              className="profile-action-btn blue"
              onClick={() => navigate("/company-dashboard")}
            >
              Company Dashboard
            </button>
          )}

          <button className="profile-logout-btn" onClick={logout}>
            Logout / Leave Event
          </button>

          <button
            className="profile-logout-btn"
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            Delete My Data
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            <h3>Delete My Data</h3>
            <p>
              Are you sure? This will permanently delete your profile, messages,
              connections, and interests.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "15px",
              }}
            >
              <button
                onClick={deleteMyData}
                style={{
                  background: "#dc2626",
                  color: "white",
                }}
              >
                Yes, Delete
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
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