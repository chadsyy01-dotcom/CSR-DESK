import { useEffect, useState } from "react";
import api from "../api";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/overview").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="page-body">Loading...</div>;

  const { totals, conversationsByInbox, volumeByDay } = data;
  const maxVolume = Math.max(1, ...Object.values(volumeByDay));
  const days = Object.entries(volumeByDay).reverse();

  return (
    <>
      <div className="topbar">
        <h1>Reports</h1>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="value">{totals.conversations}</div>
            <div className="label">Total conversations</div>
          </div>
          <div className="stat-card">
            <div className="value">{totals.open}</div>
            <div className="label">Open</div>
          </div>
          <div className="stat-card">
            <div className="value">{totals.pending}</div>
            <div className="label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="value">{totals.resolved}</div>
            <div className="label">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="value">{totals.messages}</div>
            <div className="label">Messages</div>
          </div>
          <div className="stat-card">
            <div className="value">{totals.agents}</div>
            <div className="label">Agents</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Conversation volume — last 7 days
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 120 }}>
            {days.map(([day, count]) => (
              <div key={day} style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    height: `${(count / maxVolume) * 90 + 4}px`,
                    background: "var(--pine)",
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                  title={`${count} conversation(s)`}
                />
                <div style={{ fontSize: 10, color: "var(--muted)" }}>{day.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Type</th>
                <th>Conversations</th>
              </tr>
            </thead>
            <tbody>
              {conversationsByInbox.map((row, i) => (
                <tr key={i}>
                  <td>{row.Inbox?.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{row.Inbox?.channelType}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
              {conversationsByInbox.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: "var(--muted)" }}>
                    Wala pang data.
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
