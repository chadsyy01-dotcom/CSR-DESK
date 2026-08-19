import { Routes, Route, Navigate } from "react-router-dom";
import CSRDesk from "./components/CSRDesk";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function ProtectedShell() {
  const { token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;

  return <CSRDesk />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}
