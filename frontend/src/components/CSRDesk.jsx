import React, { useState, useEffect } from 'react';

const CSRDesk = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = 'https://csr-desk-production.up.railway.app/api';

  const getHeaders = () => {
    const token = localStorage.getItem('desk_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      console.log('Fetching from:', `${API_URL}/conversations`);
      const response = await fetch(`${API_URL}/conversations`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Conversations:', data);
      setConversations(data);
      setError(null);
      
      if (data.length > 0) {
        setActiveConversation(data[0].id);
        fetchMessages(data[0].id);
        setCustomer(data[0].contact);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/messages?conversationId=${conversationId}`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Messages:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleConversationClick = (conv) => {
    setActiveConversation(conv.id);
    setCustomer(conv.contact);
    fetchMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          conversationId: activeConversation,
          content: newMessage,
          senderType: 'agent'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      setNewMessage('');
      fetchMessages(activeConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading conversations...</div>;
  }

  if (error && conversations.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-sans)', fontSize: '14px', background: 'var(--surface-0)' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--fill-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-accent)', fontSize: '12px', fontWeight: '500' }}>C</div>
            <span style={{ fontWeight: '500', fontSize: '15px' }}>CSR Desk</span>
          </div>
          <input type="text" placeholder="Search conversations" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '0.5px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }} />
        </div>

        {/* Status */}
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--border)', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--fill-success)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>You are online</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{conversations.length} conversations</div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>No conversations</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv)}
                style={{
                  padding: '12px 12px',
                  margin: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: activeConversation === conv.id ? 'var(--surface-2)' : 'transparent',
                  border: '0.5px solid ' + (activeConversation === conv.id ? 'var(--border-strong)' : 'transparent'),
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--bg-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--text-accent)',
                    flexShrink: 0
                  }}>
                    {conv.contact?.name?.substring(0, 2).toUpperCase() || 'C'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{conv.contact?.name || 'Unknown'}</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessagePreview || 'No messages'}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: '8px' }}>
          <button style={{
            flex: 1,
            padding: '6px 12px',
            border: '0.5px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontWeight: '500'
          }}>⚙️ Settings</button>
          <button style={{
            flex: 1,
            padding: '6px 12px',
            border: '0.5px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontWeight: '500'
          }}>🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{customer?.name || 'Select a conversation'}</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{customer?.email || ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '6px 12px',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface-1)',
              cursor: 'pointer',
              fontSize: '12px'
            }}>📋 Notes</button>
            <button style={{
              padding: '6px 12px',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface-1)',
              cursor: 'pointer',
              fontSize: '12px'
            }}>⋯ More</button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!activeConversation ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              Select a conversation to start
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              No messages yet
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.senderType === 'agent' ? 'flex-end' : 'flex-start',
                  gap: '8px'
                }}
              >
                {msg.senderType === 'contact' && <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--bg-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: 'var(--text-accent)',
                  flexShrink: 0
                }}>{customer?.name?.substring(0, 2).toUpperCase() || 'C'}</div>}
                <div style={{
                  maxWidth: '50%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: msg.senderType === 'agent' ? 'var(--fill-accent)' : 'var(--surface-1)',
                  color: msg.senderType === 'agent' ? 'var(--on-accent)' : 'var(--text-primary)',
                  wordWrap: 'break-word'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>{msg.content}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.7 }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '12px 20px', borderTop: '0.5px solid var(--border)', background: 'var(--surface-1)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '100px'
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: '8px 16px',
                background: 'var(--fill-accent)',
                color: 'var(--on-accent)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '13px'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ width: '320px', borderLeft: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)' }}>
        <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Customer info</h3>
          {customer && (
            <div style={{
              padding: '12px',
              background: 'var(--surface-2)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--bg-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: 'var(--text-accent)'
                }}>{customer.name?.substring(0, 2).toUpperCase() || 'C'}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{customer.name}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Customer</p>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {customer.email && <p style={{ margin: '4px 0' }}>📧 {customer.email}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSRDesk;
