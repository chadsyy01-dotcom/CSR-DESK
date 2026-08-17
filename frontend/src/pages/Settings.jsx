import { useEffect, useState } from "react";
import api from "../api";

export default function Settings() {
  const [inboxes, setInboxes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [aiConfig, setAiConfig] = useState({
    provider: "none",
    endpoint: "",
    apiKey: "",
    autoReply: false,
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api.get("/inboxes").then((res) => {
      setInboxes(res.data);
      if (res.data.length > 0) setSelectedId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    const inbox = inboxes.find((i) => i.id === selectedId);
    if (inbox) setAiConfig(inbox.aiConfig);
    setTestResult(null);
  }, [selectedId, inboxes]);

  const save = async () => {
    await api.patch(`/inboxes/${selectedId}`, { aiConfig });
    const res = await api.get("/inboxes");
    setInboxes(res.data);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post("/integrations/dify/test", aiConfig);
      setTestResult({ ok: true, reply: res.data.reply });
    } catch (err) {
      setTestResult({ ok: false, error: err.response?.data?.error || err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <h1>Settings</h1>
      </div>
      <div className="page-body" style={{ maxWidth: 640 }}>
        <div className="settings-section">
          <h2>AI Agent (Dify / custom)</h2>
          <p className="hint">
            Ikonekta ang Dify chatbot mo (o sarili mong AI agent endpoint) sa isang channel.
            Kapag naka-on ang "Auto-reply", awtomatikong sasagutin ng AI agent ang bagong mensahe
            ng customer bago pa man makasagot ang human agent.
          </p>

          <div className="form-row">
            <label>Channel to configure</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {inboxes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.channelType})
                </option>
              ))}
            </select>
          </div>

          {selectedId && (
            <div className="card" style={{ padding: 16 }}>
              <div className="form-row">
                <label>Provider</label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                >
                  <option value="none">None (walang AI agent)</option>
                  <option value="dify">Dify</option>
                  <option value="custom">Custom AI agent (webhook)</option>
                </select>
              </div>

              {aiConfig.provider !== "none" && (
                <>
                  <div className="form-row">
                    <label>
                      {aiConfig.provider === "dify" ? "Dify API URL" : "Webhook endpoint URL"}
                    </label>
                    <input
                      value={aiConfig.endpoint}
                      onChange={(e) => setAiConfig({ ...aiConfig, endpoint: e.target.value })}
                      placeholder={
                        aiConfig.provider === "dify"
                          ? "https://api.dify.ai/v1"
                          : "https://your-agent.example.com/webhook"
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label>API Key</label>
                    <input
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    />
                  </div>
                  <div className="toggle-row" style={{ marginBottom: 14 }}>
                    <input
                      type="checkbox"
                      id="autoReply"
                      checked={aiConfig.autoReply}
                      onChange={(e) =>
                        setAiConfig({ ...aiConfig, autoReply: e.target.checked })
                      }
                    />
                    <label htmlFor="autoReply">
                      Auto-reply gamit ang AI agent para sa bagong customer messages
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <button className="btn" onClick={testConnection} disabled={testing}>
                      {testing ? "Testing..." : "Test connection"}
                    </button>
                  </div>

                  {testResult && (
                    <div
                      style={{
                        fontSize: 13,
                        padding: 10,
                        borderRadius: 8,
                        background: testResult.ok ? "var(--pine-soft)" : "var(--danger-soft)",
                        color: testResult.ok ? "var(--pine)" : "var(--danger)",
                        marginBottom: 10,
                      }}
                    >
                      {testResult.ok
                        ? `OK — sample reply: "${testResult.reply}"`
                        : `Error: ${JSON.stringify(testResult.error)}`}
                    </div>
                  )}
                </>
              )}

              <button className="btn btn-primary" onClick={save}>
                Save
              </button>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2>Connect to Meta (Facebook / Instagram / WhatsApp)</h2>
          <p className="hint">
            Gawa ka muna ng channel na "Facebook", "Instagram", o "WhatsApp" sa Channels page,
            tapos ikonekta ang credentials doon. Kailangan mo rin ng publicly-reachable backend
            URL (hindi localhost) para ma-set as webhook sa Meta App Dashboard — pwede gamitin
            ang ngrok habang nagte-test, o i-deploy sa Render/Railway kapag ready na.
          </p>
          <a
            className="btn"
            href="/channels"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Pumunta sa Channels →
          </a>
        </div>
      </div>
    </>
  );
}
