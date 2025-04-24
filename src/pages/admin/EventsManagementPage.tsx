import { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, message, Tag, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { eventService } from '../../services/api';
import EventForm from '../../components/EventForm'; // Adjusted path
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs'; // Add dayjs import
import '../../styles/AdminPages.css'; // Create/use a common admin style or a specific one

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number | null;
  registration_deadline?: string | null;
  image?: string | null;
  organizer_info?: string | null;
  status: 'draft' | 'published' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface AttendeeData {
  id: string;
  full_name: string;
  email: string;
  pivot: { // Assuming pivot data from Laravel
    created_at: string;
  };
}

const EventsManagementPage = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [currentAttendees, setCurrentAttendees] = useState<AttendeeData[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  // useCallback requires fetchEvents to be stable or included in deps
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventService.getAdminEvents();
      setEvents(response.data.data);
    } catch (error) {
      message.error(t('fetch_events_error'));
    } finally {
      setLoading(false);
    }
  }, [t]); // Added t as dependency for the error message

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Dependency is now stable fetchEvents

  const fetchAttendees = useCallback(async (eventId: string) => { // Wrapped in useCallback
    setAttendeesLoading(true);
    try {
        const response = await eventService.getEventAttendees(eventId);
        setCurrentAttendees(response.data.data);
        setAttendeesModalVisible(true);
    } catch (error) {
        message.error(t('fetch_attendees_error'));
    } finally {
        setAttendeesLoading(false);
    }
  }, [t]); // Added t as dependency

  const handleAdd = () => {
    setEditingEvent(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Wrapped handleEdit in useCallback
  const handleEdit = useCallback((record: EventData) => {
    setEditingEvent(record);
    form.setFieldsValue({
        ...record,
        // Dates need to be Dayjs objects for DatePicker
        date: record.date ? dayjs(record.date) : null,
        registration_deadline: record.registration_deadline ? dayjs(record.registration_deadline) : null,
        // Handle image file list for Upload component
        image: record.image ? [
            { uid: '-1', name: 'image.png', status: 'done', url: record.image }
        ] : [],
    });
    setModalVisible(true);
  }, [form]); // Added form as dependency

  // Wrapped handleDelete in useCallback
  const handleDelete = useCallback((id: string) => {
    try {
      eventService.deleteEvent(id).then(() => {
        message.success(t('event_deleted'));
        fetchEvents();
      });
    } catch (error) {
      message.error(t('delete_event_error'));
    }
  }, [t, fetchEvents]); // Added t and stable fetchEvents as dependencies

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      
      // Prepare JSON payload
      const payload: any = { ...values };

      // Format dates before sending
      if (payload.date) {
        payload.date = dayjs(payload.date).toISOString();
      }
      if (payload.registration_deadline) {
        payload.registration_deadline = dayjs(payload.registration_deadline).toISOString();
      } else {
        // Ensure null is sent if deadline is cleared, adjust if backend expects omission
        payload.registration_deadline = null; 
      }

      // Remove image field as we are not handling file uploads with JSON here
      // If image upload is needed, it requires a different approach (e.g., separate endpoint or base64)
      delete payload.image; 
      // Add logic here if you need to signal image removal for existing events.

      // Remove capacity if it's null or undefined, depending on backend expectations
      if (payload.capacity === null || payload.capacity === undefined) {
           delete payload.capacity;
      }
      // Remove organizer_info if empty or null
      if (!payload.organizer_info) {
          delete payload.organizer_info;
      }

      if (editingEvent) {
        // Use the updated updateEvent service method (sends JSON via PUT)
        await eventService.updateEvent(editingEvent.id, payload);
        message.success(t('event_updated'));
      } else {
         // Use the updated createEvent service method (sends JSON via POST)
        await eventService.createEvent(payload);
        message.success(t('event_created'));
      }
      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      let errorMessage = t('save_event_error');
      if (axios.isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
      } else if (error instanceof Error && 'errorFields' in error) {
           // Catch validation errors from form.validateFields()
           console.error("Validation Failed:", error);
           // Antd form validation errors - no need for generic message
           return; // Exit the function early
      } else {
        console.error("Save Event Error:", error);
      }
      message.error(errorMessage);
    } finally {
        setSubmitLoading(false);
    }
  };
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.location.toLowerCase().includes(search.toLowerCase()) ||
    event.status.toLowerCase().includes(search.toLowerCase())
  );

  const columns = useMemo(() => ([
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      sorter: (a: EventData, b: EventData) => a.title.localeCompare(b.title),
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a: EventData, b: EventData) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: t('location'),
      dataIndex: 'location',
      key: 'location',
    },
     {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'geekblue';
        if (status === 'published') color = 'green';
        if (status === 'cancelled') color = 'volcano';
        return <Tag color={color}>{t(`event_status_${status.toLowerCase()}`)}</Tag>;
      },
      filters: [
        { text: t('draft'), value: 'draft' },
        { text: t('published'), value: 'published' },
        { text: t('cancelled'), value: 'cancelled' },
      ],
      onFilter: (value: any, record: EventData) => record.status === value,
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: EventData) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => fetchAttendees(record.id)} loading={attendeesLoading && editingEvent?.id === record.id}>{t('view_attendees')}</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>{t('edit')}</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>{t('delete')}</Button>
        </Space>
      ),
    },
  ]), [t, fetchAttendees, handleEdit, handleDelete, attendeesLoading, editingEvent]); // Dependencies are now stable callbacks

  const attendeeColumns = useMemo(() => [ // Also wrap attendeeColumns in useMemo
     { title: t('full_name'), dataIndex: 'full_name', key: 'full_name' },
     { title: t('email'), dataIndex: 'email', key: 'email' },
     { title: t('registration_date'), dataIndex: ['pivot', 'created_at'], key: 'registered_at', render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm') },
   ], [t]); // Added t as dependency

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>{t('manage_events')}</h1>
        <Link to="/events">
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
            {t('back_to_events')}
          </Button>
        </Link>
      </div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input 
            placeholder={t('search_events_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('add_event')}
        </Button>
      </Space>
      <Table 
        columns={columns} 
        dataSource={filteredEvents} 
        loading={loading} 
        rowKey="id" 
      />

      {/* Add/Edit Event Modal */}    
      <Modal
        title={editingEvent ? t('edit_event') : t('add_event')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null} // Footer is handled by the form's submit button
        destroyOnClose // Destroy form state when modal closes
        width={720}
      >
        <EventForm 
            form={form} 
            onFinish={handleModalOk} 
            initialValues={editingEvent} 
            submitLoading={submitLoading}
        />
      </Modal>

      {/* View Attendees Modal */}    
      <Modal
        title={t('event_attendees')}
        open={attendeesModalVisible}
        onCancel={() => setAttendeesModalVisible(false)}
        footer={[<Button key="close" onClick={() => setAttendeesModalVisible(false)}>{t('close')}</Button>]}
        width={800}
      >
        <Table 
            columns={attendeeColumns}
            dataSource={currentAttendees}
            loading={attendeesLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  );
};

export default EventsManagementPage; 