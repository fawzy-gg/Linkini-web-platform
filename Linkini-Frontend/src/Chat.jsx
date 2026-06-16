import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();

  const { userId, nickname } = location.state || {};

  const participant = JSON.parse(localStorage.getItem("participant")) || {};
  const savedEvent = JSON.parse(localStorage.getItem("event")) || {};
  const selectedEvent =
    JSON.parse(localStorage.getItem("selectedOrganizerEvent")) || {};

  const myId = Number(participant.id);
  const otherUserId = Number(userId);

  const eventId = Number(
    participant.event_id || savedEvent.id || selectedEvent.id
  );

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef();
  const typingTimeoutRef = useRef(null);

  const markAsRead = useCallback(() => {
    if (!myId || !otherUserId) return;

    fetch(`http://localhost:5000/api/messages/read/${myId}/${otherUserId}`, {
      method: "PUT",
    }).catch((err) => console.log(err));
  }, [myId, otherUserId]);

  const fetchMessages = useCallback(() => {
    if (!myId || !otherUserId) return;

    fetch(`http://localhost:5000/api/messages/${myId}/${otherUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        markAsRead();
      })
      .catch((err) => console.log(err));
  }, [myId, otherUserId, markAsRead]);

  useEffect(() => {
    if (!myId) return;
    socket.emit("join", myId);
  }, [myId]);

  useEffect(() => {
    fetchMessages();

    socket.on("receive_message", (newMessage) => {
      const sender = Number(newMessage.sender_id);
      const receiver = Number(newMessage.receiver_id);
      const messageEventId = Number(newMessage.event_id);

      const belongsToThisChat =
        messageEventId === eventId &&
        ((sender === myId && receiver === otherUserId) ||
          (sender === otherUserId && receiver === myId));

      if (belongsToThisChat) {
        setMessages((prev) => [...prev, newMessage]);
        markAsRead();
      }
    });

    socket.on("typing", (data) => {
      if (
        Number(data.sender_id) === otherUserId &&
        Number(data.event_id) === eventId
      ) {
        setIsTyping(true);
      }
    });

    socket.on("stop_typing", (data) => {
      if (
        Number(data.sender_id) === otherUserId &&
        Number(data.event_id) === eventId
      ) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [fetchMessages, markAsRead, myId, otherUserId, eventId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (value) => {
    setText(value);

    if (!myId || !otherUserId || !eventId) return;

    socket.emit("typing", {
      event_id: eventId,
      sender_id: myId,
      receiver_id: otherUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        event_id: eventId,
        sender_id: myId,
        receiver_id: otherUserId,
      });
    }, 900);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    if (!eventId || !myId || !otherUserId) {
      alert("Missing event or user information");
      console.log({
        event_id: eventId,
        sender_id: myId,
        receiver_id: otherUserId,
        participant,
        savedEvent,
        selectedEvent,
      });
      return;
    }

    try {
      socket.emit("stop_typing", {
        event_id: eventId,
        sender_id: myId,
        receiver_id: otherUserId,
      });

      const messageData = {
        event_id: eventId,
        sender_id: myId,
        receiver_id: otherUserId,
        content: text,
      };

      console.log("SEND MESSAGE DATA:", messageData);

      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Message error");
        console.log("MESSAGE ERROR:", data);
        return;
      }

      socket.emit("send_message", data);
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (err) {
      console.log(err);
      alert("Error sending message");
    }
  };

  if (!otherUserId) {
    return (
      <div className="chat-page">
        <div className="profile-card center-card">
          <h3>Chat user missing</h3>
          <button className="profile-btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ←
        </button>

        <div className="avatar-letter">
          {nickname?.charAt(0).toUpperCase() || "U"}
        </div>

        <div>
          <h4>{nickname || "User"}</h4>
          <p className="status">🟢 Active now</p>
        </div>
      </div>

      <div className="chat-box">
        {messages.length === 0 && <p className="empty">No messages yet</p>}

        {messages.map((m, index) => (
          <div
            key={m.id || index}
            className={Number(m.sender_id) === myId ? "msg me" : "msg other"}
          >
            <div>{m.content}</div>

            <span className="time">
              {new Date(m.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            {nickname || "User"} is typing...
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}