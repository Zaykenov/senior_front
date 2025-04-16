import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Avatar, Typography, Skeleton, Tag, List } from 'antd';
import { UserOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';


interface UserData {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  user: UserData;
  roles: string[];
  permissions: string[];
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://85.202.192.67/api/profile', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <Typography.Text type="danger">{error}</Typography.Text>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <Card
        loading={loading}
        className="profile-card"
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <Typography.Title level={2} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
            {loading ? <Skeleton.Input style={{ width: 200 }} active size="small" /> : profile?.user.name}
          </Typography.Title>
          <Typography.Text type="secondary">
            {profile?.user.email}
          </Typography.Text>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={[
            {
              key: 'roles',
              title: 'Roles',
              icon: <KeyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
              content: profile?.roles
            },
            {
              key: 'permissions',
              title: 'Permissions',
              icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
              content: profile?.permissions
            }
          ]}
          renderItem={(item) => (
            <List.Item key={item.key}>
              <Card
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.icon}
                  <div style={{ width: '100%' }}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <div style={{ marginTop: '0.5rem' }}>
                      {loading ? (
                        <Skeleton.Input style={{ width: 300 }} active size="small" />
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Array.isArray(item.content) && item.content.length > 0 ? (
                            item.content.map((val: string) => (
                              <Tag color={item.key === 'roles' ? 'blue' : 'green'} key={val}>
                                {val}
                              </Tag>
                            ))
                          ) : (
                            <Typography.Text type="secondary">No {item.title.toLowerCase()}</Typography.Text>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ProfilePage; 