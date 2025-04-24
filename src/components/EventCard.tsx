import { Card, Button } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string; // Assuming ISO string format
  location: string;
  image?: string | null;
  registration_deadline?: string | null;
}

interface EventCardProps {
  event: EventData;
}

const EventCard = ({ event }: EventCardProps) => {
  const { t } = useTranslation();
  const formattedDate = event.date ? new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD';
  const formattedTime = event.date ? new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
  const formattedDeadline = event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : null;

  return (
    <Card
      hoverable
      style={{ width: 300, margin: '16px' }}
      cover={event.image ? <img alt={event.title} src={event.image} style={{ height: '150px', objectFit: 'cover' }} /> : <div style={{ height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>{t('no_image')}</div>}
    >
      <Card.Meta title={event.title} description={event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '')} />
      <div style={{ marginTop: '16px' }}>
        <p><CalendarOutlined /> {formattedDate}</p>
        {formattedTime && <p><ClockCircleOutlined /> {formattedTime}</p>}
        <p><EnvironmentOutlined /> {event.location}</p>
        {formattedDeadline && <p><strong>{t('register_by')}:</strong> {formattedDeadline}</p>}
      </div>
      <Link to={`/events/${event.id}`} relative="path">
        <Button type="primary" style={{ marginTop: '16px' }}>{t('view_details')}</Button>
      </Link>
    </Card>
  );
};

export default EventCard; 