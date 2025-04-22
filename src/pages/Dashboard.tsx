import { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import api from '../services/api.ts';
import '../styles/Dashboard.css';
import { useTranslation } from 'react-i18next';

interface AlumniData {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  graduation_date: string;
  degree: string;
  faculty: string;
  major: string | null;
  email: string;
  phone: string | null;
  current_job: string | null;
  company: string | null;
  social_links: string[];
  biography: string | null;
  profile_photo: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniData | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  // Permissions from localStorage
  const [permissions, setPermissions] = useState<string[]>([]);
  useEffect(() => {
    const perms = localStorage.getItem('permissions');
    if (perms) {
      try {
        setPermissions(JSON.parse(perms));
      } catch {
        setPermissions([]);
      }
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAlumni(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchAlumni = async (searchQuery = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/alumni${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );
      setAlumni(response.data.data);
    } catch (error) {
      message.error(t('fetch_alumni_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleAdd = () => {
    setEditingAlumni(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: AlumniData) => {
    setEditingAlumni(record);
    form.setFieldsValue({
      ...record,
      social_links: record.social_links?.join('\n')
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/alumni/${id}`, {
        headers: { 
          'Accept': 'application/json',
        }
      });
      message.success(t('alumni_deleted'));
      fetchAlumni();
    } catch (error) {
      message.error(t('delete_alumni_error'));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Create FormData object
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(values).forEach(key => {
        if (key === 'social_links') {
          // Split social links by newline and filter empty lines
          const links = values[key]?.split('\n').filter((link: string) => link.trim()) || [];
          links.forEach((link: string, index: number) => {
            formData.append(`social_links[${index}]`, link.trim());
          });
        } else if (key === 'profile_photo') {
          // Handle file upload
          if (values[key]?.fileList?.[0]?.originFileObj) {
            formData.append('profile_photo', values[key].fileList[0].originFileObj);
          }
        } else if (values[key] != null) {
          formData.append(key, values[key]);
        }
      });

      formData.append('password', 'qwerty123');
      formData.append('password_confirmation', 'qwerty123');

      if (editingAlumni) {
        // For update, we need to use multipart/form-data
        formData.append('_method', 'PUT');
        await api.post(`/alumni/${editingAlumni.id}`, formData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          }
        });
        message.success(t('alumni_updated'));
      } else {
        // For create, we also use multipart/form-data
        await api.post('/alumni', formData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          }
        });
        message.success(t('alumni_created'));
      }
      setModalVisible(false);
      fetchAlumni();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || t('save_alumni_error'));
      } else {
        message.error(t('save_alumni_error'));
      }
    }
  };

  const columns = useMemo(() => ([
    {
      title: t('full_name'),
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: AlumniData, b: AlumniData) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('degree'),
      dataIndex: 'degree',
      key: 'degree',
      filters: Array.from(new Set(alumni.map(a => a.degree))).map(degree => ({
        text: degree,
        value: degree,
      })),
      onFilter: (value: any, record: AlumniData) => record.degree === value,
    },
    {
      title: t('faculty'),
      dataIndex: 'faculty',
      key: 'faculty',
    },
    {
      title: t('major'),
      dataIndex: 'major',
      key: 'major',
    },
    (permissions.includes('alumni:edit') || permissions.includes('alumni:delete')) ? {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: AlumniData) => (
        <Space>
          {permissions.includes('alumni:edit') && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              {t('edit_alumni')}
            </Button>
          )}
          {permissions.includes('alumni:delete') && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              {t('delete')}
            </Button>
          )}
        </Space>
      ),
    } : undefined,
  ].filter(Boolean) as any), [alumni, t, permissions]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('alumni_management')}</h1>
        {permissions.includes('alumni:create') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('add_alumni')}
          </Button>
        )}
      </div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
        <Input.Search
          placeholder={t('search_placeholder')}
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={alumni}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => t('total_alumni', { count: total }),
        }}
      />

      <Modal
        title={editingAlumni ? t('edit_alumni') : t('add_alumni')}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="first_name"
            label={t('first_name')}
            rules={[
              { required: true },
              { max: 255, message: t('first_name_max') }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={t('last_name')}
            rules={[
              { required: true },
              { max: 255, message: t('last_name_max') }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('email')}
            rules={[
              { required: true, type: 'email' },
              { max: 255, message: t('email_max') }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="graduation_date"
            label={t('graduation_date')}
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="degree"
            label={t('degree')}
            rules={[
              { required: true },
              { max: 255, message: t('degree_max') }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="faculty"
            label={t('faculty')}
            rules={[
              { required: true },
              { max: 255, message: t('faculty_max') }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="major"
            label={t('major')}
            rules={[{ max: 255, message: t('major_max') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label={t('phone')}
            rules={[{ max: 20, message: t('phone_max') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="current_job"
            label={t('current_job')}
            rules={[{ max: 255, message: t('current_job_max') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="company"
            label={t('company')}
            rules={[{ max: 255, message: t('company_max') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label={t('country')}
            rules={[{ max: 100, message: t('country_max') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label={t('city')}
            rules={[{ max: 100, message: t('city_max') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="biography"
            label={t('biography')}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="social_links"
            label={t('social_links')}
            help={t('social_links_help')}
          >
            <Input.TextArea 
              rows={2} 
              placeholder={t('social_links_placeholder')}
            />
          </Form.Item>
          <Form.Item
            name="profile_photo"
            label={t('profile_photo')}
            valuePropName="file"
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>{t('select_photo')}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard; 