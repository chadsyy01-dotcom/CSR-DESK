import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("desk_token"));
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api
      .get("/auth/me")
      .then((res) => setAgent(res.data))
      .catch(() => {
        setToken(null);
        localStorage.removeItem("desk_token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("desk_token", res.data.token);
    api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setAgent(res.data.agent);
  };

  const logout = () => {
    localStorage.removeItem("desk_token");
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ token, agent, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
