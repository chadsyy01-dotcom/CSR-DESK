import { useEffect, useRef, useState } from "react";
import api from "../api";

function initials(name = "?") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function Archives() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get("/conversations", { params: { status: "resolved" } }).then((res) => {
      setConversations(res.data);
    });
  }, []);

  const openConversation = async (id) => {
    setActiveId(id);
    const res = await api.get(`/conversations/${id}`);
    setActiveConv(res.data);
    setMessages(res.data.Messages || []);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="inbox-layout">
      <div className="conversation-list">
        <div className="topbar">
          <h1>Archives</h1>
        </div>
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conversation-item ${activeId === c.id ? "active" : ""}`}
            onClick={() => openConversation(c.id)}
          >
            <div className="avatar">{initials(c.Contact?.name)}</div>
            <div className="conversation-preview">
              <div className="conversation-name">{c.Contact?.name || "Unknown"}</div>
              <div className="conversation-last-message">
                {c.Messages?.[c.Messages.length - 1]?.content || ""}
              </div>
              <div className="conversation-meta">
                <span className="badge resolved">Resolved</span>
                <span>{c.Inbox?.name}</span>
              </div>
            </div>
            <div className="conversation-time">{timeAgo(c.updatedAt)}</div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div style={{ padding: 20, color: "var(--muted)" }}>
            Wala pang na-resolve na conversation.
          </div>
        )}
      </div>

      <div className="conversation-detail">
        {activeConv ? (
          <>
            <div className="topbar">
              <h1>{activeConv.Contact?.name || "Unknown"}</h1>
              <span className="badge resolved">Resolved</span>
            </div>
            <div className="messages-pane">
              {messages.map((m) => (
                <div key={m.id} className={`message-bubble ${m.direction}`}>
                  {m.senderType === "ai" && <div className="sender-label">AI AGENT</div>}
                  {m.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="empty-state">Pumili ng conversation sa kaliwa.</div>
        )}
      </div>
    </div>
  );
}
