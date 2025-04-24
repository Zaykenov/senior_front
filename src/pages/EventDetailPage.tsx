import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Button, Card, Descriptions, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, InfoCircleOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { eventService } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../styles/EventDetailPage.css'; // Create this file next

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
  status: string;
  is_registered?: boolean; // Added based on potential API response
  attendee_count?: number; // Added based on potential API response
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      fetchEventDetails(id);
    }
  }, [id]);

  const fetchEventDetails = async (eventId: string) => {
    setLoading(true);
    try {
      const response = await eventService.getEvent(eventId);
      setEvent(response.data);
      // Check if the response includes registration status
      setIsRegistered(response.data.is_registered || false);
    } catch (error) {
      message.error(t('fetch_event_details_error'));
      navigate('/events'); // Redirect if event not found or error
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!id) return;
    setRegisterLoading(true);
    try {
      await eventService.registerForEvent(id);
      message.success(t('registration_successful'));
      setIsRegistered(true);
      // Optionally refetch event details to update attendee count if available
      fetchEventDetails(id);
    } catch (error) {
      message.error(t('registration_failed'));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCancelRegistration = () => {
    if (!id) return;
    setRegisterLoading(true);
    try {
      eventService.cancelEventRegistration(id)
        .then(() => {
          message.success(t('registration_cancelled'));
          setIsRegistered(false);
          // Optionally refetch event details
          fetchEventDetails(id);
        })
        .catch(() => {
          message.error(t('cancel_registration_failed'));
        })
        .finally(() => {
          setRegisterLoading(false);
        });
    } catch {
      message.error(t('cancel_registration_failed'));
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
  }

  if (!event) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>{t('event_not_found')}</div>;
  }

  const formattedDate = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const formattedDeadline = event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'N/A';
  const isPastDeadline = event.registration_deadline ? new Date() > new Date(event.registration_deadline) : false;
  const canRegister = !isRegistered && !isPastDeadline && event.status === 'published';

  return (
    <div className="event-detail-container">
      <Card
        cover={event.image ? <img alt={event.title} src={event.image} style={{ maxHeight: '400px', objectFit: 'cover' }} /> : null}
      >
        <h1>{event.title}</h1>
        <Tag color={event.status === 'published' ? 'green' : event.status === 'cancelled' ? 'red' : 'orange'}>
          {t(`event_status_${event.status?.toLowerCase()}`)}
        </Tag>

        <Descriptions bordered column={1} style={{ marginTop: '20px' }}>
          <Descriptions.Item label={<><CalendarOutlined /> {t('date')}</>}>{formattedDate}</Descriptions.Item>
          <Descriptions.Item label={<><ClockCircleOutlined /> {t('time')}</>}>{formattedTime}</Descriptions.Item>
          <Descriptions.Item label={<><EnvironmentOutlined /> {t('location')}</>}>{event.location}</Descriptions.Item>
          <Descriptions.Item label={<><InfoCircleOutlined /> {t('description')}</>}>{event.description}</Descriptions.Item>
          {event.capacity && <Descriptions.Item label={<><UserOutlined /> {t('capacity')}</>}>{event.capacity}</Descriptions.Item>}
          {event.attendee_count !== undefined && <Descriptions.Item label={<><UserOutlined /> {t('registered_attendees')}</>}>{event.attendee_count}</Descriptions.Item>}
          <Descriptions.Item label={<><CalendarOutlined /> {t('registration_deadline')}</>}>{formattedDeadline}</Descriptions.Item>
          {event.organizer_info && <Descriptions.Item label={<><UserOutlined /> {t('organizer')}</>}>{event.organizer_info}</Descriptions.Item>}
        </Descriptions>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          {isRegistered ? (
            <> 
              <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginBottom: '10px' }}>
                {t('you_are_registered')}
              </Tag>
              <Button 
                icon={<CloseCircleOutlined />} 
                onClick={handleCancelRegistration} 
                loading={registerLoading}
                danger
              >
                {t('cancel_registration')}
              </Button>
            </>
          ) : isPastDeadline ? (
            <Tag color="warning">{t('registration_deadline_passed')}</Tag>
          ) : event.status !== 'published' ? (
             <Tag color="red">{t('event_not_published_or_cancelled')}</Tag>
          ) : (
            <Button 
              type="primary" 
              onClick={handleRegister} 
              loading={registerLoading}
              disabled={!canRegister}
            >
              {t('register_for_event')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EventDetailPage; 