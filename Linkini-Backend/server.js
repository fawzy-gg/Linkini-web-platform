const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

// ROUTES
const eventRoutes = require("./routes/event-routes");
const participantRoutes = require("./routes/participant-routes");
const connectionRoutes = require("./routes/connection-routes");
const messageRoutes = require("./routes/message-routes");
const jobRoutes = require("./routes/job-routes");
const jobInterestRoutes = require("./routes/jobInterest-routes");
const companyDashboardRoutes = require("./routes/company-dashboard-routes");
const platformDashboardRoutes = require("./routes/platform-dashboard-routes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join personal room for chat
  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log("User joined room:", userId);
  });

  // Join event room for broadcast notifications
  socket.on("join_event", (eventId) => {
    socket.join(`event_${eventId}`);
    console.log("Socket joined event room:", `event_${eventId}`);
  });

  // Private message
  socket.on("send_message", (data) => {
    const { receiver_id } = data;
    io.to(receiver_id.toString()).emit("receive_message", data);
  });

  // Organizer broadcast notification
  socket.on("send_broadcast", (data) => {
    const { event_id, message } = data;

    if (!event_id || !message) return;

    io.to(`event_${event_id}`).emit("broadcast_notification", {
      event_id,
      message,
      created_at: new Date(),
    });

    console.log("Broadcast sent to:", `event_${event_id}`, message);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { receiver_id } = data;
    io.to(receiver_id.toString()).emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    const { receiver_id } = data;
    io.to(receiver_id.toString()).emit("stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-interests", jobInterestRoutes);
app.use("/api/company-dashboard", companyDashboardRoutes);
app.use("/api/platform-dashboard", platformDashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API working" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});