import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const links = [
  { to: "/", label: "Inbox", icon: "💬", end: true },
  { to: "/contacts", label: "Contacts", icon: "👥" },
  { to: "/archives", label: "Archives", icon: "🗄️" },
  { to: "/channels", label: "Channels", icon: "🔌" },
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/agents", label: "Agents", icon: "👤" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];
export default function Sidebar() {
  const { agent, logout } = useAuth();
  return (
    <div className="sidebar">
      <div className="sidebar-logo">CSR</div>
      <div className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            title={link.label}
          >
            <span>{link.icon}</span>
          </NavLink>
        ))}
      </div>
      <button
        className="sidebar-link"
        title={agent ? `Log out (${agent.name})` : "Log out"}
        onClick={logout}
        style={{ border: "none", background: "transparent" }}
      >
        <span>🚪</span>
      </button>
    </div>
  );
}
