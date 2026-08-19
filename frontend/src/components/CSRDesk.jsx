import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Use environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'https://csr-desk-production.up.railway.app/api';

const CSRDesk = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);

  // Create axios instance with auth
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      console.log('Conversations loaded:', response.data);
      setConversations(response.data);
      setError(null);
      if (response.data.length > 0) {
        setActiveConversation(response.data[0].id);
        fetchMessages(response.data[0].id);
        setCustomer(response.data[0].contact);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error.response?.data || error.message);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages?conversationId=${conversationId}`);
      console.log('Messages loaded:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
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
      await api.post('/messages', {
        conversationId: activeConversation,
        content: newMessage,
        senderType: 'agent'
      });
      setNewMessage('');
      fetchMessages(activeConversation);
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading conversations...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }
