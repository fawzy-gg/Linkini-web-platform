
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Users,
  MessageCircle,
  Briefcase,
  User,
} from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();


  const participant = JSON.parse(localStorage.getItem("participant") || "{}");
  const isCompany = participant.is_company;

  const items = [
    {
      label: "Discover",
      path: "/discover",
      icon: Sparkles,
      show: true,
    },
    {
      label: "Connections",
      path: "/connections",
      icon: Users,
      show: !isCompany, //only users
    },
    {
      label: "Messages",
      path: "/messages",
      icon: MessageCircle,
      show: true,
    },
    {
      label: "Jobs",
      path: "/jobs",
      icon: Briefcase,
      show: true,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
      show: true,
    },
  ];

  return (
    <div className="bottom-nav pro-nav">
      {items
        .filter((item) => item.show)
        .map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.path}
              className={`nav-btn ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={20} strokeWidth={2.4} />
              <span>{item.label}</span>
            </button>
          );
        })}
    </div>
  );
}
