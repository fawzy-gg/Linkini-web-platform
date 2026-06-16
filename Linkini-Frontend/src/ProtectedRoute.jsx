import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const participant =
    JSON.parse(localStorage.getItem("participant")) || {};

  if (!participant.id) {
    return <Navigate to="/" replace />;
  }

  return children;
}