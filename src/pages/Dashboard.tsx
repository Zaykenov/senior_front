import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/Dashboard.css';

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

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://85.202.192.67/api/alumni', {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAlumni(response.data.data);
    } catch (error) {
      message.error('Failed to fetch alumni data');
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
      await axios.delete(`http://85.202.192.67/api/alumni/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Alumni deleted successfully');
      fetchAlumni();
    } catch (error) {
      message.error('Failed to delete alumni');
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

      if (editingAlumni) {
        // For update, we need to use multipart/form-data
        await axios.put(`http://85.202.192.67/api/alumni/${editingAlumni.id}`, formData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        message.success('Alumni updated successfully');
      } else {
        // For create, we also use multipart/form-data
        await axios.post('http://85.202.192.67/api/alumni', formData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        message.success('Alumni created successfully');
      }
      setModalVisible(false);
      fetchAlumni();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || 'Failed to save alumni data');
      } else {
        message.error('Failed to save alumni data');
      }
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: AlumniData, b: AlumniData) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Degree',
      dataIndex: 'degree',
      key: 'degree',
      filters: Array.from(new Set(alumni.map(a => a.degree))).map(degree => ({
        text: degree,
        value: degree,
      })),
      onFilter: (value: any, record: AlumniData) => record.degree === value,
    },
    {
      title: 'Current Job',
      dataIndex: 'current_job',
      key: 'current_job',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AlumniData) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Alumni Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Alumni
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={alumni}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} alumni`,
        }}
      />

      <Modal
        title={editingAlumni ? 'Edit Alumni' : 'Add Alumni'}
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
            label="First Name"
            rules={[
              { required: true },
              { max: 255, message: 'First name cannot exceed 255 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[
              { required: true },
              { max: 255, message: 'Last name cannot exceed 255 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: 'email' },
              { max: 255, message: 'Email cannot exceed 255 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="graduation_date"
            label="Graduation Date"
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="degree"
            label="Degree"
            rules={[
              { required: true },
              { max: 255, message: 'Degree cannot exceed 255 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="faculty"
            label="Faculty"
            rules={[
              { required: true },
              { max: 255, message: 'Faculty cannot exceed 255 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="major"
            label="Major"
            rules={[{ max: 255, message: 'Major cannot exceed 255 characters' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ max: 20, message: 'Phone number cannot exceed 20 characters' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="current_job"
            label="Current Job"
            rules={[{ max: 255, message: 'Current job cannot exceed 255 characters' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="company"
            label="Company"
            rules={[{ max: 255, message: 'Company name cannot exceed 255 characters' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ max: 100, message: 'Country name cannot exceed 100 characters' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="City"
            rules={[{ max: 100, message: 'City name cannot exceed 100 characters' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="biography"
            label="Biography"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="social_links"
            label="Social Links"
            help="Enter one link per line"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Enter social media links (one per line)"
            />
          </Form.Item>
          <Form.Item
            name="profile_photo"
            label="Profile Photo"
            valuePropName="file"
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select Photo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard; 