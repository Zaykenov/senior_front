import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';
import logo from '../assets/images/nu_logo.png';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await authService.register(name, email, password, passwordConfirmation);
      navigate('/login'); // Redirect to login after successful registration
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        
        <h1 className="auth-title">{t('register_title')}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <i className="user-icon"></i>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('full_name')}
              required
              maxLength={255}
            />
          </div>
          
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
              minLength={8}
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`eye-icon ${showPassword ? 'visible' : ''}`}></i>
            </button>
          </div>
          
          <div className="input-group">
            <div className="input-icon">
              <i className="password-icon"></i>
            </div>
            <input
              type={showPasswordConfirm ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder={t('confirm_password')}
              required
              minLength={8}
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            >
              <i className={`eye-icon ${showPasswordConfirm ? 'visible' : ''}`}></i>
            </button>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('signing_up') : t('sign_up')}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>{t('have_account')}</span>
          <Link to="/login" className="signup-link">
            {t('sign_in')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 