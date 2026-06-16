import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

export default function BroadcastListener() {
  const location = useLocation();
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const participant = JSON.parse(localStorage.getItem("participant") || "{}");

    if (!participant.event_id) return;

    socket.emit("join_event", participant.event_id);

    socket.off("broadcast_notification");

    socket.on("broadcast_notification", (data) => {
      if (Number(data.event_id) === Number(participant.event_id)) {
        setNotification(data.message);
      }
    });

    return () => {
      socket.off("broadcast_notification");
    };
  }, [location.pathname]);

  if (!notification) return null;

  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-box">
        <h3>📢 Organizer Announcement</h3>
        <p>{notification}</p>
        <button onClick={() => setNotification("")}>OK</button>
      </div>
    </div>
  );
}