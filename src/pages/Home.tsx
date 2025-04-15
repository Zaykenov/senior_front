import { Link } from 'react-router-dom';
import '../styles/Home.css';

// Icons for feature cards
const NetworkIcon = () => <div className="feature-icon">👥</div>;
const EventsIcon = () => <div className="feature-icon">🎉</div>;
const ResourcesIcon = () => <div className="feature-icon">📚</div>;

const Home = () => {
  return (
    <div className="home-container">
      <main className="home-main">
        <div className="home-content">
          <h1 className="home-title">NU Alumni Management System</h1>
          <p className="home-subtitle">A place for socializing, networking, and growing your professional connections</p>
          
          <div className="cards-container">
            <div className="feature-card">
              <NetworkIcon />
              <h3 className="feature-title">Connect & Network</h3>
              <p className="feature-description">
                Connect with fellow alumni, build valuable relationships and expand your professional network.
              </p>
            </div>
            
            <div className="feature-card">
              <EventsIcon />
              <h3 className="feature-title">Events & Meetups</h3>
              <p className="feature-description">
                Discover and participate in exclusive alumni events, reunions, and professional gatherings.
              </p>
            </div>
            
            <div className="feature-card">
              <ResourcesIcon />
              <h3 className="feature-title">Resources & Support</h3>
              <p className="feature-description">
                Access career resources, mentorship programs, and continuous learning opportunities.
              </p>
            </div>
          </div>
          
          <div className="cta-section">
            <Link to="/dashboard" className="cta-button">
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 