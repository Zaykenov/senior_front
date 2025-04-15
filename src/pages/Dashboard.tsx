import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard Coming Soon</h1>
        <p className="dashboard-text">This feature is under development. Please check back later.</p>
        <Link to="/" className="dashboard-button">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 