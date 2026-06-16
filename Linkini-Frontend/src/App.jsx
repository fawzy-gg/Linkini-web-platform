import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Landing from "./Landing";
import JoinEvent from "./JoinEvent";
import EnterEvent from "./EnterEvent";
import Discover from "./Discover";
import Profile from "./profile";
import UserProfile from "./UserProfile";
import Connections from "./Connections";
import Chat from "./Chat";
import Jobs from "./Jobs";
import CreateJob from "./CreateJob";
import JobDetails from "./JobDetails";
import CompanyDashboard from "./CompanyDashboard";
import Messages from "./Messages";
import PlatformDashboard from "./PlatformDashboard";
import Organizer from "./Organizer";
import BottomNav from "./BottomNav";
import BroadcastListener from "./BroadcastListener";

import ProtectedRoute from "./ProtectedRoute";

function AppContent() {
  const location = useLocation();

  const hideNavRoutes = [
    "/",
    "/join",
    "/enter",
    "/chat",
    "/platform-dashboard",
    "/organizer",
  ];

  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<JoinEvent />} />
          <Route path="/enter" element={<EnterEvent />} />

          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
          <Route path="/job-details" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/company-dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

          <Route path="/organizer" element={<ProtectedRoute><Organizer /></ProtectedRoute>} />
          <Route path="/platform-dashboard" element={<ProtectedRoute><PlatformDashboard /></ProtectedRoute>} />
        </Routes>
      </div>

      <BroadcastListener />

      {showNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;