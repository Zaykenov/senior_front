import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">{t('nu_alumni')}</h3>
          <p className="footer-description">
            {t('alumni_management')}.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-list-title">{t('quick_links')}</h4>
          <ul className="footer-links">
            <li><Link to="/">{t('home')}</Link></li>
            <li><Link to="/dashboard">{t('dashboard')}</Link></li>
            <li><Link to="/login">{t('login')}</Link></li>
            <li><Link to="/register">{t('register')}</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-list-title">{t('contact')}</h4>
          <ul className="footer-links">
            <li>{t('email')}: nu@nu.edu.kz</li>
            <li>{t('phone')}: 8 (7172) 70-66-88</li>
            <li>{t('address')},<br />{t('city')}</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>{t('footer_bottom', { currentYear: currentYear })}</p>
      </div>
    </footer>
  );
};

export default Footer; 