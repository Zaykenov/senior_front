import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';
import logo from '../assets/images/nu_logo.png';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      // Store user data and token in localStorage based on response
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // If your API returns roles and permissions, store them too
      if (response.data.roles) {
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
      }
      if (response.data.permissions) {
        localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
      }
      
      // Redirect to dashboard after successful login
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        
        <h1 className="auth-title">{t('login_title')}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <i className="user-icon"></i>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              required
              maxLength={255}
            />
          </div>
          
          <div className="input-group">
            <div className="input-icon">
              <i className="password-icon"></i>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`eye-icon ${showPassword ? 'visible' : ''}`}></i>
            </button>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('signing_in') : t('sign_in')}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>{t('no_account')}</span>
          <Link to="/register" className="signup-link">
            {t('sign_up')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 