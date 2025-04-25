import React, { useState, useEffect, useRef } from 'react';
import { getUsers, getMessages, sendMessage } from '../services/api';
import { User, Message } from '../types';
import '../styles/Chat.css';
import { Card, List, Avatar, Input, Button, Typography, message as antMessage } from 'antd';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { initializeEcho, terminateEcho } from '../services/echo';

const ChatPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Initializing WebSocket connection with token');
      initializeEcho(token);
    }
    
    return () => {
      terminateEcho();
    };
  }, []);

  // Log the WebSocket connection status
  useEffect(() => {
    console.log('WebSocket status:', window.Echo ? 'Initialized' : 'Not initialized');
    if (window.Echo?.socketId) {
      console.log('Socket ID:', window.Echo.socketId());
    }
  }, []);

  // Fetch current user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User is not authenticated');
          setLoading(false);
          return;
        }
        
        const response = await api.get('/profile', {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        setCurrentUser(response.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(t('fetch_user_error'));
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then(r => {
        setContacts(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setError(t('fetch_users_error'));
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    if (!selected || !currentUser) return;

    setLoading(true);
    getMessages(selected.id)
      .then(r => { 
        setMessages(r.data); 
        scroll();
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch messages for user ${selected.id}:`, err);
        setLoading(false);
        antMessage.error('Could not load messages');
      });

    // Setup websocket connection
    if (window.Echo) {
      console.log(`Subscribing to channel: chat.${currentUser.id}`);
      const channel = window.Echo.private(`chat.${currentUser.id}`);

      channel.listen('MessageSent', (e: { message: Message }) => {
        console.log('Received message via WebSocket:', e);
        if (e.message.sender_id === selected.id) { 
          setMessages(m => [...m, e.message]); 
          scroll(); 
        }
      }).listenForWhisper('typing', (e: { userID: number }) => {
        if (e.userID === selected.id) {
          setTyping(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setTyping(false), 1000);
        }
      });

      return () => { 
        console.log(`Leaving channel: chat.${currentUser.id}`);
        window.Echo.leaveChannel(`chat.${currentUser.id}`); 
      };
    } else {
      console.warn('WebSocket not initialized when trying to subscribe to chat channel');
      // Try to initialize if token exists
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Attempting to initialize WebSocket connection');
        initializeEcho(token);
      }
    }
  }, [selected, currentUser]);

  const scroll = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = async () => {
    if (!text.trim() || !selected || !currentUser) return;
    try {
      setSending(true);
      // Adjust to match the expected backend field names
      const r = await sendMessage(selected.id, text);
      console.log('Message sent successfully:', r.data);
      setMessages(m => [...m, r.data]); 
      setText(''); 
      scroll();
    } catch (err) {
      console.error(`Error sending message to user ${selected.id}:`, err);
      antMessage.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleType = () => {
    if (!selected || !window.Echo || !currentUser) return;
    try {
      window.Echo.private(`chat.${selected.id}`).whisper('typing', { userID: currentUser.id });
    } catch (error) {
      console.error('Error sending typing event:', error);
    }
  };

  // Check if we can load the chat UI
  if (loading) {
    return (
      <div className="chat-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading user data...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{t('chat')}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Card loading={loading}>
        <div style={{ display: 'flex', height: '70vh' }}>
          {/* Users list */}
          <div style={{ width: '30%', borderRight: '1px solid #f0f0f0', overflowY: 'auto', padding: '10px' }}>
            <List
              itemLayout="horizontal"
              dataSource={contacts.filter(c => c.id !== currentUser?.id)}
              renderItem={user => (
                <List.Item 
                  onClick={() => setSelected(user)}
                  className="user-list-item" 
                  style={{ 
                    backgroundColor: selected?.id === user.id ? '#f0f0f0' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>}
                    title={<span className="user-name">{user.name}</span>}
                    description={user.email}
                  />
                </List.Item>
              )}
            />
          </div>

          {/* Chat area */}
          <div style={{ width: '70%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
            {selected ? (
              <>
                <div style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                  <Typography.Title level={4}>
                    {t('message')} {selected.name}
                  </Typography.Title>
                </div>

                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      style={{ 
                        alignSelf: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender_id === currentUser?.id ? '#1890ff' : '#f0f0f0',
                        color: msg.sender_id === currentUser?.id ? 'white' : 'black',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        maxWidth: '70%',
                        margin: '5px 0',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={endRef} />

                  {typing && (
                    <div style={{ fontStyle: 'italic', color: '#888', padding: '5px' }}>
                      {selected.name} is typing...
                    </div>
                  )}
                </div>

                <div style={{ padding: '10px', display: 'flex' }}>
                  <Input
                    value={text}
                    onChange={e => { setText(e.target.value); handleType(); }}
                    onKeyDown={handleType}
                    onPressEnter={handleSend}
                    placeholder="Type a message..."
                    style={{ marginRight: '10px' }}
                    disabled={sending}
                  />
                  <Button 
                    type="primary" 
                    onClick={handleSend} 
                    loading={sending}
                  >
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#888' 
              }}>
                {t('select a user to start chatting')}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;