import { useEffect, useRef, useState } from "react";
import api from "../api";
import socket from "../socket";

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

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    const params = statusFilter ? { status: statusFilter } : {};
    const res = await api.get("/conversations", { params });
    setConversations(res.data);
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    function onConvUpdated() {
      loadConversations();
    }
    function onNewConv() {
      loadConversations();
    }
    socket.on("conversation_updated", onConvUpdated);
    socket.on("new_conversation", onNewConv);
    return () => {
      socket.off("conversation_updated", onConvUpdated);
      socket.off("new_conversation", onNewConv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openConversation = async (id) => {
    setActiveId(id);
    socket.emit("join_conversation", id);
    const res = await api.get(`/conversations/${id}`);
    setActiveConv(res.data);
    setMessages(res.data.Messages || []);
  };

  useEffect(() => {
    function onNewMessage(msg) {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, msg]);
      }
    }
    socket.on("new_message", onNewMessage);
    return () => socket.off("new_message", onNewMessage);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    const content = draft;
    setDraft("");
    await api.post(`/messages/conversation/${activeId}`, {
      content,
      senderType: "agent",
      senderName: "You",
    });
  };

  const updateStatus = async (status) => {
    await api.patch(`/conversations/${activeId}`, { status });
    setActiveConv((prev) => ({ ...prev, status }));
    loadConversations();
  };

  return (
    <>
      <div className="topbar">
        <h1>Inbox</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["", "open", "pending", "resolved"].map((s) => (
            <button
              key={s}
              className="btn"
              style={{
                background: statusFilter === s ? "var(--pine-soft)" : undefined,
                borderColor: statusFilter === s ? "var(--pine)" : undefined,
              }}
              onClick={() => setStatusFilter(s)}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="inbox-layout">
        <div className="conv-list">
          {conversations.length === 0 && (
            <div style={{ padding: 20, color: "var(--muted)", fontSize: 13 }}>
              Walang conversations pa. Gagawa ka ng test conversation via Settings → seed data, o
              maghintay ng incoming message mula sa connected channel.
            </div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={"conv-item" + (c.id === activeId ? " active" : "")}
              onClick={() => openConversation(c.id)}
            >
              <div className="avatar">{initials(c.Contact?.name)}</div>
              <div className="conv-item-body">
                <div className="conv-item-top">
                  <span className="conv-item-name">{c.Contact?.name || "Guest"}</span>
                  <span className="conv-item-time">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <div className="conv-item-preview">{c.lastMessagePreview || "..."}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--muted)" }}>
                    {c.Inbox?.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!activeConv && <div className="empty-state">Pumili ng conversation sa kaliwa.</div>}

        {activeConv && (
          <div className="chat-pane">
            <div className="chat-header">
              <div>
                <div style={{ fontWeight: 600 }}>{activeConv.Contact?.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {activeConv.Inbox?.name} · {activeConv.Inbox?.channelType}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["open", "pending", "resolved"].map((s) => (
                  <button
                    key={s}
                    className="btn"
                    style={{
                      background: activeConv.status === s ? "var(--pine)" : undefined,
                      color: activeConv.status === s ? "#fff" : undefined,
                    }}
                    onClick={() => updateStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((m) => (
                <div key={m.id} className={"msg-row" + (m.senderType !== "contact" ? " out" : "")}>
                  <div className={`msg-bubble ${m.senderType}`}>
                    {m.senderType !== "contact" && (
                      <div className="msg-sender">{m.senderName}</div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-composer" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Type a reply..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
