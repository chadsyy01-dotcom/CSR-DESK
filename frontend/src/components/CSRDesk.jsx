import React, { useState } from 'react';

const CSRDesk = () => {
  const [activeConversation, setActiveConversation] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'customer', text: 'Hi, I need help with my order', time: '10:42 AM' },
    { id: 2, sender: 'agent', text: 'Hello! I\'d be happy to help. What\'s your order number?', time: '10:43 AM' },
    { id: 3, sender: 'customer', text: 'It\'s #ORD-2024-15847', time: '10:44 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    { id: 1, customer: 'Sarah Mitchell', status: 'online', unread: 2, avatar: 'SM' },
    { id: 2, customer: 'James Chen', status: 'offline', unread: 0, avatar: 'JC' },
    { id: 3, customer: 'Emily Rodriguez', status: 'online', unread: 1, avatar: 'ER' },
    { id: 4, customer: 'Michael Torres', status: 'online', unread: 0, avatar: 'MT' },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'agent',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

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
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>8 active chats • 3 awaiting</div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
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
                  position: 'relative',
                  flexShrink: 0
                }}>
                  {conv.avatar}
                  {conv.status === 'online' && <div style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--fill-success)',
                    border: '2px solid var(--surface-1)',
                    bottom: 0,
                    right: 0
                  }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{conv.customer}</span>
                    {conv.unread > 0 && <span style={{
                      fontSize: '11px',
                      background: 'var(--fill-accent)',
                      color: 'var(--on-accent)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '500'
                    }}>{conv.unread}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Order inquiry</div>
                </div>
              </div>
            </div>
          ))}
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
          }}>👤 Profile</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>Sarah Mitchell</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Customer since Jan 2024 • 3 chats</p>
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
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'agent' ? 'flex-end' : 'flex-start',
                gap: '8px'
              }}
            >
              {msg.sender === 'customer' && <div style={{
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
              }}>SM</div>}
              <div style={{
                maxWidth: '50%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: msg.sender === 'agent' ? 'var(--fill-accent)' : 'var(--surface-1)',
                color: msg.sender === 'agent' ? 'var(--on-accent)' : 'var(--text-primary)',
                wordWrap: 'break-word'
              }}>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>{msg.text}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.7 }}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: '12px 20px', borderTop: '0.5px solid var(--border)', background: 'var(--surface-1)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button style={{
              padding: '4px 8px',
              fontSize: '11px',
              border: '0.5px solid var(--border)',
              borderRadius: '4px',
              background: 'var(--surface-2)',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}>Quick reply</button>
            <button style={{
              padding: '4px 8px',
              fontSize: '11px',
              border: '0.5px solid var(--border)',
              borderRadius: '4px',
              background: 'var(--surface-2)',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}>Attach</button>
          </div>
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
              placeholder="Type your message... (Shift+Enter for new line)"
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

      {/* Right Sidebar - Customer Info */}
      <div style={{ width: '320px', borderLeft: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)' }}>
        <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Customer info</h3>
          <div style={{
            padding: '12px',
            background: 'var(--surface-2)',
            borderRadius: '8px',
            marginBottom: '12px'
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
              }}>SM</div>
              <div>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>Sarah Mitchell</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Premium customer</p>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '4px 0' }}>📧 sarah@example.com</p>
              <p style={{ margin: '4px 0' }}>📱 +1 (555) 123-4567</p>
              <p style={{ margin: '4px 0' }}>📍 San Francisco, CA</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>Recent orders</h4>
          {[
            { id: '#ORD-2024-15847', status: 'Delivered', date: '2 days ago' },
            { id: '#ORD-2024-15721', status: 'Delivered', date: '1 week ago' },
            { id: '#ORD-2024-15604', status: 'Delivered', date: '2 weeks ago' }
          ].map(order => (
            <div key={order.id} style={{
              padding: '8px',
              background: 'var(--surface-2)',
              borderRadius: '6px',
              marginBottom: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{order.id}</p>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-success)' }}>{order.status}</p>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '11px' }}>{order.date}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)' }}>
          <button style={{
            width: '100%',
            padding: '8px',
            background: 'var(--fill-accent)',
            color: 'var(--on-accent)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '12px'
          }}>View full profile</button>
        </div>
      </div>
    </div>
  );
};

export default CSRDesk;
