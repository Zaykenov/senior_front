import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">NU Alumni</h3>
          <p className="footer-description">
            Connecting graduates and building a strong Nazarbayev University community.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-list-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-list-title">Contact</h4>
          <ul className="footer-links">
            <li>Email: alumni@nu.edu.kz</li>
            <li>Phone: +7 (7172) 123-456</li>
            <li>53 Kabanbay Batyr Ave,<br />Astana, Kazakhstan</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Nazarbayev University. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 