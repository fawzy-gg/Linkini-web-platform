import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./App.css";

export default function EnterEvent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { eventId, eventCode } = location.state || {};
  const finalEventId = eventId || eventCode;

  const [nickname, setNickname] = useState("");
  const [goal, setGoal] = useState("Networking");
  const [customGoal, setCustomGoal] = useState("");
  const [about, setAbout] = useState("");
  const [smartMatching, setSmartMatching] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const chips = useMemo(() => ["SaaS", "Design", "Crypto", "Health", "AI"], []);
  const [selectedChips, setSelectedChips] = useState(["SaaS", "Crypto"]);

  const toggleChip = (c) => {
    setSelectedChips((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  if (!finalEventId) {
    return (
      <div className="container">
        <div className="content">
          <h2 style={{ color: "#7c3aed" }}>Missing event info</h2>
          <button className="primary" onClick={() => navigate("/join")}>
            Go back →
          </button>
        </div>
      </div>
    );
  }

  const handleEnter = async () => {
    if (!nickname.trim()) {
      setAlertMsg(isCompany ? "Company name is required" : "Nickname is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: finalEventId,
          nickname: nickname.trim(),
          intention: customGoal.trim() ? customGoal : goal,
          bio: about,
          ai_enabled: smartMatching,
          tags: selectedChips,
          is_company: isCompany,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMsg(data.message || data.error || "Something went wrong");
        return;
      }

      localStorage.setItem("participant", JSON.stringify(data));

      navigate("/discover", {
        state: {
          participantId: data.id,
          eventId: data.event_id,
          nickname: data.nickname,
          intention: data.intention,
          bio: data.bio,
          selectedTags: selectedChips,
          isCompany: data.is_company,
        },
      });
    } catch (err) {
      console.log(err);
      setAlertMsg("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kp-screen">
      <div className="kp-card">
        <div className="kp-top">
          <button className="kp-back" onClick={() => navigate("/join")}>
            ←
          </button>
          <div className="kp-title">Join Event</div>
        </div>

        <div className="kp-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              padding: "12px 14px",
              background: "#faf5ff",
              borderRadius: "14px",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", color: "#4c1d95" }}>
                I’m joining as a company
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Enable this if you want to post job opportunities
              </div>
            </div>

            <label className="kp-switch">
              <input
                type="checkbox"
                checked={isCompany}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsCompany(checked);

                  if (checked) {
                    setGoal("Hiring");
                  }
                }}
              />
              <span className="kp-slider" />
            </label>
          </div>
        </div>

        <div className="kp-section">
          <div className="kp-q">
            {isCompany ? "1. What’s your company name?" : "1. What’s your name?"}
          </div>

          <input
            className="kp-input"
            placeholder={isCompany ? "e.g TechCorp" : "e.g Alex"}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="kp-section">
          <div className="kp-q">
            {isCompany
              ? "2. What’s your main goal in this event?"
              : "2. What’s your goal today?"}
          </div>

          <div className="kp-grid">
            {(isCompany
              ? ["Hiring", "Networking", "Partnership", "Visibility"]
              : ["Networking", "Hiring", "Collaboration", "Learning"]
            ).map((g) => (
              <button
                key={g}
                className={`kp-tile ${goal === g && !customGoal ? "active" : ""}`}
                onClick={() => {
                  setGoal(g);
                  setCustomGoal("");
                }}
                type="button"
              >
                <div className="kp-txt">{g}</div>
              </button>
            ))}
          </div>

          <input
            className="kp-input"
            placeholder={
              isCompany ? "Write your company goal..." : "Write your custom goal..."
            }
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
          />
        </div>

        <div className="kp-section">
          <div className="kp-q">
            {isCompany ? "3. About your company" : "3. About you"}
          </div>

          <textarea
            className="kp-textarea"
            rows={4}
            placeholder={
              isCompany
                ? "Describe your company, team, or what you’re hiring for..."
                : "Describe yourself..."
            }
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />

          <div className="kp-row">
            <div>
              <div className="kp-row-title">Smart Matching</div>
            </div>

            <label className="kp-switch">
              <input
                type="checkbox"
                checked={smartMatching}
                onChange={(e) => setSmartMatching(e.target.checked)}
              />
              <span className="kp-slider" />
            </label>
          </div>

          <div className="kp-chips">
            {chips.map((c) => (
              <button
                key={c}
                className={`kp-chip ${selectedChips.includes(c) ? "on" : ""}`}
                onClick={() => toggleChip(c)}
                type="button"
              >
                #{c}
              </button>
            ))}
          </div>
        </div>

        <button className="kp-enter" onClick={handleEnter} disabled={loading}>
          {loading ? "Saving..." : "Enter Event →"}
        </button>
      </div>

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