import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "My Inbox", icon: "📥", end: true },
  { to: "/contacts", label: "Contacts", icon: "👥" },
  { to: "/archives", label: "Archives", icon: "🗄️" },
  { to: "/channels", label: "Channels", icon: "🔌" },
  { to: "/agents", label: "Agents", icon: "👤" },
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/widget-settings", label: "Widget Settings", icon: "🎨" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { agent, logout } = useAuth();

  return (
    <div className="sidebar-wide">
      <div className="sidebar-wide-header">
        <div className="sidebar-wide-logo">C</div>
        <span className="sidebar-wide-title">CSR Desk</span>
      </div>

      <div className="sidebar-wide-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              "sidebar-wide-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-wide-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-wide-footer">
        <div className="sidebar-wide-avatar">
          {(agent?.name || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="sidebar-wide-profile-text">
          <div className="sidebar-wide-name">{agent?.name || "Agent"}</div>
          <div className="sidebar-wide-email">{agent?.email || ""}</div>
        </div>
        <button
          className="sidebar-wide-logout"
          title="Log out"
          onClick={logout}
        >
          🚪
        </button>
      </div>
    </div>
  );
}
