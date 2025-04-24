import { useEffect, useState } from 'react';
import { Spin, message, Input, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import { useTranslation } from 'react-i18next';
import '../styles/EventsPage.css'; // We'll create this file next

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string | null;
  registration_deadline?: string | null;
  status: string; // Ensure status is included
}

const EventsPage = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchEvents();
    checkAdminPermission();
  }, []);

  const checkAdminPermission = () => {
    const roles = localStorage.getItem('roles');
    if (!roles) return;
    try {
      const parsedRoles = JSON.parse(roles);
      setIsAdmin(parsedRoles[0].includes('admin'));
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getEvents();
      // Filter only published events for alumni view
      setEvents(response.data.data.filter((event: EventData) => event.status === 'published'));
    } catch (error) {
      message.error(t('fetch_events_error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-page-container">
      <div className="events-header">
        <h1>{t('upcoming_events')}</h1>
        <div className="events-nav-buttons">
          <Link to="/my-events">
            <Button type="primary" style={{ marginRight: '10px' }}>
              {t('my_events')}
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin/events">
              <Button type="primary">
                {t('manage_events')}
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Input
        placeholder={t('search_events_placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', width: '300px' }}
      />
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <Col key={event.id} xs={24} sm={12} md={8} lg={6}>
                <EventCard event={event} />
              </Col>
            ))
          ) : (
            <p>{t('no_events_found')}</p>
          )}
        </Row>
      )}
    </div>
  );
};

export default EventsPage; 