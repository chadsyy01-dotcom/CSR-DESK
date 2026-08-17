import { useEffect, useState } from "react";
import api from "../api";

const CHANNEL_COLORS = {
  website: "var(--pine)",
  facebook: "#1877F2",
  instagram: "#C13584",
  whatsapp: "#25D366",
  email: "#6B7280",
};

export default function Channels() {
  const [inboxes, setInboxes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", channelType: "website" });
  const [editing, setEditing] = useState(null); // inbox being configured
  const [metaFields, setMetaFields] = useState({});

  const load = async () => {
    const res = await api.get("/inboxes");
    setInboxes(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createInbox = async (e) => {
    e.preventDefault();
    await api.post("/inboxes", form);
    setForm({ name: "", channelType: "website" });
    setShowForm(false);
    load();
  };

  const openConfig = (inbox) => {
    setEditing(inbox);
    setMetaFields(inbox.settings || {});
  };

  const saveMetaConfig = async () => {
    await api.patch(`/inboxes/${editing.id}`, { settings: metaFields });
    setEditing(null);
    load();
  };

  const removeInbox = async (id) => {
    if (!confirm("Delete this channel/inbox?")) return;
    await api.delete(`/inboxes/${id}`);
    load();
  };

  return (
    <>
      <div className="topbar">
        <h1>Channels</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add channel
        </button>
      </div>

      <div className="page-body">
        <div className="stat-grid">
          {inboxes.map((inbox) => (
            <div className="stat-card" key={inbox.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span
                  className="channel-dot"
                  style={{ background: CHANNEL_COLORS[inbox.channelType] }}
                />
                <strong>{inbox.name}</strong>
              </div>
              <div className="label" style={{ marginBottom: 12 }}>{inbox.channelType}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn" onClick={() => openConfig(inbox)}>
                  Configure
                </button>
                <button className="btn" onClick={() => removeInbox(inbox.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {inboxes.length === 0 && (
          <p style={{ color: "var(--muted)" }}>
            Wala pang channel. Gumawa ng "Website Chat" muna para may makonek sa widget mo, o
            "Facebook Page" / "Instagram" / "WhatsApp" para maconnect sa Meta.
          </p>
        )}
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Add a channel">
          <form onSubmit={createInbox}>
            <div className="form-row">
              <label>Channel name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Main Website, FB Page - Store"
              />
            </div>
            <div className="form-row">
              <label>Channel type</label>
              <select
                value={form.channelType}
                onChange={(e) => setForm({ ...form, channelType: e.target.value })}
              >
                <option value="website">Website chat widget</option>
                <option value="facebook">Facebook Messenger</option>
                <option value="instagram">Instagram DM</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Create channel
            </button>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={`Configure: ${editing.name}`}>
          {editing.channelType === "website" && (
            <>
              <p className="hint">
                I-paste ito bago ang closing <code>&lt;/body&gt;</code> tag ng website mo. Awtomatikong
                lalabas ang chat bubble sa kanang-baba ng page.
              </p>
              <pre
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
{`<script>
  window.deskWidgetSettings = {
    inboxId: "${editing.id}",
    baseUrl: "${import.meta.env.VITE_API_URL || "http://localhost:4000"}"
  };
</script>
<script src="${import.meta.env.VITE_API_URL || "http://localhost:4000"}/widget.js" async></script>`}
              </pre>
              <button
                className="btn"
                onClick={() => {
                  const snippet = `<script>\n  window.deskWidgetSettings = {\n    inboxId: "${editing.id}",\n    baseUrl: "${import.meta.env.VITE_API_URL || "http://localhost:4000"}"\n  };\n</script>\n<script src="${import.meta.env.VITE_API_URL || "http://localhost:4000"}/widget.js" async></script>`;
                  navigator.clipboard.writeText(snippet);
                }}
              >
                Copy snippet
              </button>
            </>
          )}

          {(editing.channelType === "facebook" || editing.channelType === "instagram") && (
            <>
              <p className="hint">
                Kunin ang Page Access Token sa Meta App Dashboard (Messenger/Instagram settings).
                I-set din ang webhook callback URL mo sa:
                <br />
                <code>{`{YOUR_BACKEND_URL}/api/integrations/meta/webhook`}</code>
              </p>
              <div className="form-row">
                <label>Page Access Token</label>
                <input
                  type="password"
                  value={metaFields.pageAccessToken || ""}
                  onChange={(e) =>
                    setMetaFields({ ...metaFields, pageAccessToken: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <label>Page ID</label>
                <input
                  value={metaFields.pageId || ""}
                  onChange={(e) => setMetaFields({ ...metaFields, pageId: e.target.value })}
                />
              </div>
            </>
          )}

          {editing.channelType === "whatsapp" && (
            <>
              <p className="hint">
                Galing sa WhatsApp Business API setup (Meta Cloud API). I-set din ang webhook
                callback URL mo sa:
                <br />
                <code>{`{YOUR_BACKEND_URL}/api/integrations/meta/webhook`}</code>
              </p>
              <div className="form-row">
                <label>Phone Number ID</label>
                <input
                  value={metaFields.whatsappPhoneNumberId || ""}
                  onChange={(e) =>
                    setMetaFields({ ...metaFields, whatsappPhoneNumberId: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <label>Access Token</label>
                <input
                  type="password"
                  value={metaFields.whatsappAccessToken || ""}
                  onChange={(e) =>
                    setMetaFields({ ...metaFields, whatsappAccessToken: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {editing.channelType === "email" && (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Email channel config (IMAP/SMTP or forwarding address) — pwede idagdag sa susunod
              na iteration.
            </p>
          )}

          <button className="btn btn-primary" onClick={saveMetaConfig} style={{ marginTop: 8 }}>
            Save configuration
          </button>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,33,29,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 440, padding: 22, maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <strong>{title}</strong>
          <button className="btn btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
