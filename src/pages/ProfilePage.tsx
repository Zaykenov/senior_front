import { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Skeleton, Tag, List } from 'antd';
import { UserOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../services/api.ts';


interface UserData {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AlumniProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  graduation_date: string;
  degree: string;
  faculty: string;
  major: string;
  email: string;
  phone: string;
  current_job: string;
  company: string;
  social_links: string;
  biography: string;
  profile_photo: string;
  country: string;
  city: string;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  user: UserData;
  roles: string[];
  permissions: string[];
  alumni_profile?: AlumniProfile | null;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('http://85.202.192.67/api/profile', {
          headers: {
            'Accept': 'application/json',
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

  // Helper to render alumni profile
  const renderAlumniProfile = (alumni: AlumniProfile) => (
    <Card
      title={<span style={{ fontWeight: 600, fontSize: '1.2rem' }}>Alumni Profile</span>}
      style={{
        borderRadius: '12px',
        marginTop: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: '#fafcff',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <Avatar
            size={100}
            src={alumni.profile_photo || undefined}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#e6f7ff', marginBottom: 16 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Title level={4} style={{ marginBottom: 0 }}>{alumni.full_name}</Typography.Title>
          <Typography.Text type="secondary">{alumni.degree} in {alumni.major} ({alumni.faculty})</Typography.Text>
          <div style={{ margin: '1rem 0' }}>
            <Tag color="blue">Graduation: {alumni.graduation_date}</Tag>
            <Tag color="geekblue">{alumni.country}, {alumni.city}</Tag>
          </div>
          <List size="small" style={{ marginBottom: 12 }}>
            <List.Item>
              <strong>Email:</strong> <span style={{ marginLeft: 8 }}>{alumni.email}</span>
            </List.Item>
            <List.Item>
              <strong>Phone:</strong> <span style={{ marginLeft: 8 }}>{alumni.phone}</span>
            </List.Item>
            <List.Item>
              <strong>Current Job:</strong> <span style={{ marginLeft: 8 }}>{alumni.current_job} at {alumni.company}</span>
            </List.Item>
            {alumni.social_links && (
              <List.Item>
                <strong>Social Links:</strong> <span style={{ marginLeft: 8 }}>{alumni.social_links}</span>
              </List.Item>
            )}
          </List>
          {alumni.biography && (
            <div style={{ marginTop: 8 }}>
              <Typography.Paragraph>
                <strong>Biography:</strong> {alumni.biography}
              </Typography.Paragraph>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

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
            {loading ? <Skeleton.Input style={{ width: 200 }} active size="small" /> : (profile?.user.name || '-')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {/* Email is now in alumni_profile or not available */}
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
        {/* Alumni Profile Section */}
        {!loading && profile?.alumni_profile && renderAlumniProfile(profile.alumni_profile)}
      </Card>
    </div>
  );
};

export default ProfilePage; 