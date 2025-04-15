import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import nuLogo from '../assets/images/nu_logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-container">
          <img src={nuLogo} alt="Nazarbayev University Logo" className="logo" />
        </Link>
      </div>
      
      <div className="navbar-center">
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">Main Page</Link>
          </li>
          <li>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-right">
        <div className="user-menu">
          <Link to="/profile" className="user-avatar">
            <div className="avatar-circle">
              <span>JD</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 