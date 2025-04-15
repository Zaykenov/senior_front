import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';
import logo from '../assets/images/nu_logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

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
        
        <h1 className="auth-title">Login</h1>
        
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
              placeholder="Email"
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
              placeholder="Password"
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register" className="signup-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 