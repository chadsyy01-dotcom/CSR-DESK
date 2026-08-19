import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import Contacts from "./pages/Contacts";
import Archives from "./pages/Archives";
import Channels from "./pages/Channels";
import Agents from "./pages/Agents";
import Reports from "./pages/Reports";
import WidgetSettings from "./pages/WidgetSettings";
import Settings from "./pages/Settings";
import { useAuth } from "./context/AuthContext";

function ProtectedShell() {
  const { token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;

  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedShell />}>
        <Route index element={<Inbox />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="archives" element={<Archives />} />
        <Route path="channels" element={<Channels />} />
        <Route path="agents" element={<Agents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="widget-settings" element={<WidgetSettings />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
