import { useEffect, useState } from "react";
import api from "../api";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "agent", password: "" });

  const load = async () => {
    const res = await api.get("/agents");
    setAgents(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createAgent = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    await api.post("/agents", form);
    setForm({ name: "", email: "", role: "agent", password: "" });
    load();
  };

  const removeAgent = async (id) => {
    if (!confirm("Remove this agent?")) return;
    await api.delete(`/agents/${id}`);
    load();
  };

  return (
    <>
      <div className="topbar">
        <h1>Agents</h1>
      </div>
      <div className="page-body">
        <div className="card" style={{ padding: 18, marginBottom: 20, maxWidth: 480 }}>
          <div className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>
            Add agent
          </div>
          <form onSubmit={createAgent} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div className="form-row" style={{ flex: 1, marginBottom: 0 }}>
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-row" style={{ flex: 1, marginBottom: 0 }}>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-row" style={{ flex: 1, marginBottom: 0 }}>
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="agent">Agent</option>
                <option value="administrator">Admin</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Add
            </button>
          </form>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.role}</td>
                  <td>
                    <button className="btn" onClick={() => removeAgent(a.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>
                    Wala pang agent.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
