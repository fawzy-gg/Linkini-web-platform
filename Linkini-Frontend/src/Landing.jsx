import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="container">
      <div className="content">
        <div className="badge">✨ EVENT NETWORKING PLATFORM</div>

        <h1>
          Meet smarter, <span>connect faster.</span>
        </h1>

        <p>
          Discover people, companies, and job opportunities inside your event.
          Use AI-powered matching to build meaningful connections, chat with
          participants, and explore new opportunities in real time.
        </p>

        <div className="card">
          <strong>Smart Event Connections</strong>
          <p>
            AI matching, messaging, networking, and company opportunities.
          </p>
        </div>

        <button className="primary" onClick={() => navigate("/join")}>
          Join an Event
        </button>

        <button
          className="secondary"
          onClick={() => setShowModal(true)}
        >
          Organizer
        </button>

        <div className="footer">Powered by AI Matching</div>
      </div>

      {showModal && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h2>Organizer Access</h2>

            <p>Please enter organizer password</p>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
            />

            {error && (
              <div className="errorBox">
                Wrong password
              </div>
            )}

            <button
              className="modalBtn"
              onClick={() => {
                if (password === "linkini2026") {
                  setShowModal(false);
                  navigate("/organizer");
                } else {
                  setError(true);
                }
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}