import { useEffect, useState } from 'react';
import { Spin, message, Row, Col, Empty, Button } from 'antd';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard'; // Reuse the event card
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../styles/MyEventsPage.css'; // Create this file next

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string | null;
  registration_deadline?: string | null;
  status: string; // Include status
}

const MyEventsPage = () => {
  const [myEvents, setMyEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getMyEvents();
      setMyEvents(response.data.data);
    } catch (error) {
      message.error(t('fetch_my_events_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-events-page-container">
      <div className="my-events-header">
        <h1>{t('my_registered_events')}</h1>
        <Link to="/events">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            {t('back_to_events')}
          </Button>
        </Link>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[16, 16]}>
          {myEvents.length > 0 ? (
            myEvents.map(event => (
              <Col key={event.id} xs={24} sm={12} md={8} lg={6}>
                <EventCard event={event} />
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: 'center' }}>
              <Empty description={t('no_registered_events')} />
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default MyEventsPage; 