import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Inbox from "./pages/Inbox";
import Channels from "./pages/Channels";
import Reports from "./pages/Reports";
import Agents from "./pages/Agents";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function ProtectedShell() {
  const { token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}
