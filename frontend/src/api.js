import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("desk_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
export { API_URL };
