import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Use the shared AuthContext login so token state/localStorage/api headers
      // all stay in sync (single source of truth: "desk_token").
      await login(email, password);

      // Redirect to home
      navigate("/");
    } catch (err) {
      console.error('Login error:', err.response);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div className="card" style={{ width: 360, padding: 28 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--pine)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          D
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 4px" }}>
          Sign in to CSR Desk
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>
          Your support inbox
        </p>

        <form onSubmit={submit}>
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                background: "var(--danger-soft)",
                color: "var(--danger)",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
          First time? Run <code>npm run seed</code> sa backend para gumawa ng default admin
          (admin@example.com / admin123).
        </p>
      </div>
    </div>
  );
}
