import { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Skeleton, Tag, List, Button, Modal, Form, Input, message, Upload } from 'antd';
import { UserOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../services/api.ts';
import { useTranslation } from 'react-i18next';

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editForm] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile', {
          headers: {
            'Accept': 'application/json',
          }
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(t('fetch_profile_error'));
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const showChangePasswordModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleChangePassword = async (values: any) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/change-password', values);
      message.success(response.data.message || t('password_changed_successfully'));
      setIsModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      // Handle specific validation errors if available
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
        message.error(errorMessages || t('change_password_validation_error'));
      } else if (err.response && err.response.status === 401) {
         message.error(err.response.data.message || t('incorrect_current_password'));
      }
       else {
        message.error(t('change_password_failed'));
      }
      console.error("Password change failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEditProfileModal = () => {
    if (profile?.alumni_profile) {
      // Prepare social_links as textarea string
      const alumni = profile.alumni_profile;
      editForm.setFieldsValue({
        ...alumni,
        social_links: Array.isArray(alumni.social_links)
          ? alumni.social_links.join('\n')
          : alumni.social_links || '',
        graduation_date: alumni.graduation_date ? alumni.graduation_date.split('T')[0] : '',
      });
      setIsEditModalVisible(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };

  const handleEditProfile = async (values: any) => {
    if (!profile?.alumni_profile) return;
    setIsEditSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'social_links') {
          const links = values[key]?.split('\n').filter((link: string) => link.trim()) || [];
          links.forEach((link: string, index: number) => {
            formData.append(`social_links[${index}]`, link.trim());
          });
        } else if (key === 'profile_photo') {
          if (values[key]?.fileList?.[0]?.originFileObj) {
            formData.append('profile_photo', values[key].fileList[0].originFileObj);
          }
        } else if (values[key] != null) {
          formData.append(key, values[key]);
        }
      });
      formData.append('_method', 'PUT');
      const response = await api.post(`/alumni/${profile.alumni_profile.id}`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success(response.data.message || t('profile_updated'));
      // Refetch profile
      const refreshed = await api.get('/profile', { headers: { 'Accept': 'application/json' } });
      setProfile(refreshed.data);
      setIsEditModalVisible(false);
      editForm.resetFields();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        message.error(err.response.data.message);
      } else {
        message.error(t('update_profile_failed'));
      }
    } finally {
      setIsEditSubmitting(false);
    }
  };

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
      title={<span style={{ fontWeight: 600, fontSize: '1.2rem' }}>{t('alumni_profile')}</span>}
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
          <Typography.Text type="secondary">{alumni.degree} {t('in')} {alumni.major} ({alumni.faculty})</Typography.Text>
          <div style={{ margin: '1rem 0' }}>
            <Tag color="blue">{t('graduation_date')}: {alumni.graduation_date.split("T")[0]}</Tag>
            <Tag color="geekblue">{alumni.country}, {alumni.city}</Tag>
          </div>
          <List size="small" style={{ marginBottom: 12 }}>
            <List.Item>
              <strong>{t('email')}:</strong> <span style={{ marginLeft: 8 }}>{alumni.email}</span>
            </List.Item>
            <List.Item>
              <strong>{t('phone')}:</strong> <span style={{ marginLeft: 8 }}>{alumni.phone}</span>
            </List.Item>
            {alumni.current_job && (
              <List.Item>
                <strong>{t('current_job')}:</strong> <span style={{ marginLeft: 8 }}>{alumni.current_job} {t('at')} {alumni.company}</span>
              </List.Item>
            )}
            {alumni.social_links && (
              <List.Item>
                <strong>{t('social_links')}:</strong> <span style={{ marginLeft: 8 }}>{alumni.social_links}</span>
              </List.Item>
            )}
          </List>
          {alumni.biography && (
            <div style={{ marginTop: 8 }}>
              <Typography.Paragraph>
                <strong>{t('biography')}:</strong> {alumni.biography}
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
        actions={[
          <Button key="change-password" type="primary" onClick={showChangePasswordModal}>
            {t('change_password')}
          </Button>,
          profile?.alumni_profile && (
            <Button key="edit-profile" onClick={showEditProfileModal}>
              {t('edit_profile')}
            </Button>
          )
        ]}
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
              title: t('roles'),
              icon: <KeyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
              content: profile?.roles
            },
            {
              key: 'permissions',
              title: t('permissions'),
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
                            <Typography.Text type="secondary">{t('no_' + item.key)}</Typography.Text>
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

      {/* Change Password Modal */}
      <Modal
        title={t('change_password')}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {t('cancel')}
          </Button>,
          <Button key="submit" type="primary" loading={isSubmitting} onClick={() => form.submit()}>
            {t('submit')}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          name="change_password_form"
        >
          <Form.Item
            name="current_password"
            label={t('current_password')}
            rules={[{ required: true, message: t('please_input_current_password') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label={t('new_password')}
            rules={[
              { required: true, message: t('please_input_new_password') },
              { min: 8, message: t('password_min_8_chars') } // Example minimum length
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password_confirmation"
            label={t('confirm_new_password')}
            dependencies={['new_password']}
            hasFeedback
            rules={[
              { required: true, message: t('please_confirm_new_password') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('passwords_do_not_match')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        title={t('edit_profile')}
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="back" onClick={handleEditCancel}>
            {t('cancel')}
          </Button>,
          <Button key="submit" type="primary" loading={isEditSubmitting} onClick={() => editForm.submit()}>
            {t('submit')}
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditProfile}
          name="edit_profile_form"
        >
          <Form.Item name="first_name" label={t('first_name')} rules={[{ required: true }, { max: 255, message: t('first_name_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label={t('last_name')} rules={[{ required: true }, { max: 255, message: t('last_name_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }, { max: 255, message: t('email_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="graduation_date" label={t('graduation_date')} rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="degree" label={t('degree')} rules={[{ required: true }, { max: 255, message: t('degree_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="faculty" label={t('faculty')} rules={[{ required: true }, { max: 255, message: t('faculty_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="major" label={t('major')} rules={[{ max: 255, message: t('major_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('phone')} rules={[{ max: 20, message: t('phone_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="current_job" label={t('current_job')} rules={[{ max: 255, message: t('current_job_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label={t('company')} rules={[{ max: 255, message: t('company_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label={t('country')} rules={[{ max: 100, message: t('country_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label={t('city')} rules={[{ max: 100, message: t('city_max') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="biography" label={t('biography')}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="social_links" label={t('social_links')} help={t('social_links_help')}>
            <Input.TextArea rows={2} placeholder={t('social_links_placeholder')} />
          </Form.Item>
          <Form.Item name="profile_photo" label={t('profile_photo')} valuePropName="file">
            <Upload maxCount={1} beforeUpload={() => false} accept="image/*">
              <Button icon={<UserOutlined />}>{t('select_photo')}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;