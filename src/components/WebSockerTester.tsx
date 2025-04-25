import { useState, useEffect } from 'react';
import { Card, Button, Alert, Space, Typography, Divider, List } from 'antd';
import echoService from '../services/echo';

interface WebSocketMessage {
  id: string;
  timestamp: string;
  type: 'connection' | 'event' | 'error';
  message: string;
  details?: any;
}

const WebSocketTester: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [socketId, setSocketId] = useState<string | null>(null);

  // Add a log message to the UI
  const addMessage = (type: WebSocketMessage['type'], message: string, details?: any) => {
    setMessages(prev => [
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type,
        message,
        details
      },
      ...prev
    ]);
  };

  // Initialize WebSocket connection and listeners
  useEffect(() => {
    const echo = echoService.get();
    try {
      // Check if Echo is properly initialized
      if (!echo || !echo.connector || !echo.connector.pusher) {
        addMessage('error', 'Echo not properly initialized', null);
        setConnectionStatus('disconnected');
        return;
      }

      // Set up connection listeners
      echo.connector.pusher.connection.bind('connected', () => {
        setConnectionStatus('connected');
        const sid = echo.socketId();
        setSocketId(sid || null);
        addMessage('connection', 'Connected to WebSocket server', { socketId: sid });
      });

      echo.connector.pusher.connection.bind('connecting', () => {
        setConnectionStatus('connecting');
        addMessage('connection', 'Connecting to WebSocket server...');
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        setConnectionStatus('disconnected');
        addMessage('connection', 'Disconnected from WebSocket server');
        setSocketId(null);
      });

      echo.connector.pusher.connection.bind('error', (error: any) => {
        addMessage('error', 'WebSocket connection error', error);
      });

      // Check initial connection state
      if (echo.connector.pusher.connection.state === 'connected') {
        setConnectionStatus('connected');
        const sid = echo.socketId();
        setSocketId(sid || null);
        addMessage('connection', 'Already connected to WebSocket server', { socketId: sid });
      } else {
        addMessage('connection', `Initial connection state: ${echo.connector.pusher.connection.state}`);
      }

      return () => {
        // Clean up listeners on unmount
        echo.connector.pusher.connection.unbind('connected');
        echo.connector.pusher.connection.unbind('connecting');
        echo.connector.pusher.connection.unbind('disconnected');
        echo.connector.pusher.connection.unbind('error');
      };
    } catch (error) {
      addMessage('error', 'Error setting up WebSocket connection', error);
      console.error('Error setting up WebSocket connection:', error);
      setConnectionStatus('disconnected');
      return () => {};
    }
  }, []);

  // Subscribe to a test channel
  const subscribeToTestChannel = () => {
    const echo = echoService.get();
    if (!echo) {
      addMessage('error', 'Echo is not initialized', null);
      return;
    }
    
    try {
      const channel = echo.channel('test-channel');
      channel.listen('.test-event', (data: any) => {
        addMessage('event', 'Received test event', data);
      });
      addMessage('connection', 'Subscribed to test-channel');
    } catch (error) {
      addMessage('error', 'Failed to subscribe to test channel', error);
    }
  };

  // Subscribe to a private test channel
  const subscribeToPrivateChannel = () => {
    const echo = echoService.get();
    if (!echo) {
      addMessage('error', 'Echo is not initialized', null);
      return;
    }
    
    try {
      const privateChannel = echo.private(`private-user.${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : '1'}`);
      privateChannel.listen('.PrivateMessageEvent', (data: any) => {
        addMessage('event', 'Received private message event', data);
      });
      addMessage('connection', 'Subscribed to private channel');
    } catch (error) {
      addMessage('error', 'Failed to subscribe to private channel', error);
    }
  };

  // Manually attempt to reconnect
  const reconnect = () => {
    const echo = echoService.get();
    if (!echo) {
      addMessage('error', 'Echo is not initialized', null);
      return;
    }
    
    try {
      echo.connector.pusher.disconnect();
      setTimeout(() => {
        echo.connector.pusher.connect();
      }, 1000);
      addMessage('connection', 'Manually attempting to reconnect...');
    } catch (error) {
      addMessage('error', 'Failed to reconnect', error);
    }
  };

  return (
    <Card 
      title="WebSocket Connection Tester" 
      style={{ maxWidth: 800, margin: '20px auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Connection status */}
        <Alert
          message={`WebSocket Status: ${connectionStatus.toUpperCase()}`}
          description={socketId ? `Connected with Socket ID: ${socketId}` : 'Not connected'}
          type={
            connectionStatus === 'connected' ? 'success' : 
            connectionStatus === 'connecting' ? 'info' : 'error'
          }
          showIcon
        />

        {/* Action buttons */}
        <Space wrap>
          <Button onClick={subscribeToTestChannel}>Subscribe to Test Channel</Button>
          <Button onClick={subscribeToPrivateChannel} type="primary">Subscribe to Private Channel</Button>
          <Button onClick={reconnect} danger={connectionStatus === 'disconnected'}>
            {connectionStatus === 'disconnected' ? 'Reconnect' : 'Force Reconnect'}
          </Button>
        </Space>

        <Divider orientation="left">Connection Log</Divider>

        {/* Messages list */}
        <List
          size="small"
          bordered
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{ 
              backgroundColor: 
                msg.type === 'error' ? '#fff1f0' : 
                msg.type === 'event' ? '#f6ffed' : 'inherit' 
            }}>
              <Typography.Text type={msg.type === 'error' ? 'danger' : msg.type === 'event' ? 'success' : 'secondary'} style={{ marginRight: 8 }}>
                [{new Date(msg.timestamp).toLocaleTimeString()}]
              </Typography.Text>
              <Typography.Text>
                {msg.message}
                {msg.details && (
                  <div style={{ marginTop: 4, fontSize: '0.85em' }}>
                    <pre style={{ margin: 0, padding: 4, background: '#f0f0f0', borderRadius: 4 }}>
                      {typeof msg.details === 'object' ? JSON.stringify(msg.details, null, 2) : msg.details}
                    </pre>
                  </div>
                )}
              </Typography.Text>
            </List.Item>
          )}
          style={{ maxHeight: 400, overflow: 'auto' }}
        />

        <Alert
          message="Debugging Tips"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Check if your Laravel backend CORS settings allow requests from your frontend domain.</li>
              <li>Ensure the authentication token is valid when connecting to private channels.</li>
              <li>Verify that Laravel Echo Server/Reverb is running and properly configured.</li>
              <li>Check browser console for additional error details (F12).</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default WebSocketTester;