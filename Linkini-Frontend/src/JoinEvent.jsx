import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./App.css";

export default function JoinEvent() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const navigate = useNavigate();
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        setCode(decodedText);
        setScanning(false);
        scanner.clear().catch(() => {});
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  const handleJoin = async () => {
    if (!code.trim()) {
      setAlertMsg("Please enter your event code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/events/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventCode: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMsg(data.message || "Error joining event");
        return;
      }

      navigate("/enter", {
        state: {
          eventId: data.event?.id,
          eventCode: data.event?.eventCode || code,
        },
      });
    } catch (err) {
      console.error(err);
      setAlertMsg(err?.message || "Connection problem. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <div className="join-brand">LINKINI</div>

        <div className="join-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 4h6v6H4V4Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 4h6v6h-6V4Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 14h6v6H4v-6Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 15h5v5h-5v-5Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        <h1>Join an Event</h1>

        <p className="join-subtitle">
          Enter your event code or scan a QR code to join securely.
        </p>

        <div className="input-group">
          <label>EVENT CODE</label>
          <input
            type="text"
            placeholder="ABCD-123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>

        <button
          className="join-scan-btn"
          onClick={() => setScanning(true)}
          disabled={scanning}
        >
          {scanning ? "Scanning..." : "Scan QR Code"}
        </button>

        {scanning && <div id="reader" className="qr-reader" />}

        <button
          className="join-primary-btn"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? "Joining..." : "Continue →"}
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