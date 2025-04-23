import { useEffect, useState } from 'react';
import { List, Avatar, Typography, Divider, Tabs } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../services/api';
import '../styles/Chat.css';
import { useTranslation } from 'react-i18next';
import WebSocketTester from '../components/WebSocketTester';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo?: string;
}

const { TabPane } = Tabs;

const Chat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users', {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Make sure response.data is an array or use a fallback structure
        const usersData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.data || response.data?.users || []);
        
        // Filter out the current user from the users list
        const filteredUsers = usersData.filter((user: User) => user.id !== currentUser.id);
        
        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(t('fetch_users_error') || 'Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [t]);

  return (
    <div className="chat-container">
      <Tabs defaultActiveKey="users">
        <TabPane tab={t('users')} key="users">
          <div className="chat-header">
            <Typography.Title level={2}>{t('users')}</Typography.Title>
          </div>

          <Divider />
          
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={users}
              renderItem={(user) => (
                <List.Item 
                  className="user-list-item"
                  key={user.id}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={user.profile_photo} 
                        icon={<UserOutlined />} 
                        size={48}
                      />
                    }
                    title={<span className="user-name">{user.name}</span>}
                    description={user.email}
                  />
                  <div>
                    <button className="chat-button">
                      {t('message')}
                    </button>
                  </div>
                </List.Item>
              )}
            />
          )}
        </TabPane>
        
        <TabPane tab="WebSocket Debug" key="websocket">
          <WebSocketTester />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Chat;