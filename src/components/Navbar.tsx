import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import nuLogo from '../assets/images/nu_logo.png';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';


const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-container">
          <img src={nuLogo} alt="Nazarbayev University Logo" className="logo" />
        </Link>

        <div>
          <Button onClick={() => i18n.changeLanguage('en')}>EN</Button>
          <Button onClick={() => i18n.changeLanguage('ru')}>RU</Button>
          <Button onClick={() => i18n.changeLanguage('kz')}>KZ</Button>
        </div>
      </div>
      
      <div className="navbar-center">
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">{t('main_page')}</Link>
          </li>
          <li>
            <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-right">
        <div className="user-menu">
          <Link to="/profile" className="user-avatar">
            <div className="avatar-circle">
              <UserOutlined style={{ fontSize: 24 }} />
            </div>
          </Link>
          <Button onClick={handleLogout} style={{ marginLeft: 16 }}>
            {t('logout') || 'Logout'}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 