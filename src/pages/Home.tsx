import { Link } from 'react-router-dom';
import '../styles/Home.css';
import { useTranslation } from 'react-i18next';

// Icons for feature cards
const NetworkIcon = () => <div className="feature-icon">👥</div>;
const EventsIcon = () => <div className="feature-icon">🎉</div>;

const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="home-container">
      <main className="home-main">
        <div className="home-content">
          <h1 className="home-title">{t('alumni_management')}</h1>
          <p className="home-subtitle">{t('home_subtitle')}</p>
          
            
          <div className="cards-container">
            <Link to="/chat" className="feature-card-link">
              <div className="feature-card">
                <NetworkIcon />
                <h3 className="feature-title">{t('connect_network_title')}</h3>
                <p className="feature-description">
                  {t('connect_network_desc')}
                </p>
              </div>
            </Link>
            
            <Link to="/events" className="feature-card-link">
              <div className="feature-card">
                <EventsIcon />
                <h3 className="feature-title">{t('events_meetups_title')}</h3>
                <p className="feature-description">
                  {t('events_meetups_desc')}
                </p>
              </div>
            </Link>
          </div>
          
          <div className="cta-section">
            <Link to="/dashboard" className="cta-button">
              {t('learn_more')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 