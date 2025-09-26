import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Login request
      const loginRes = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setMessage({ text: typeof loginData === 'string' ? loginData : 'Login failed', type: 'error' });
        setLoading(false);
        return;
      }

      // Store tokens
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);

      // Fetch user data
      const userRes = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        setMessage({ text: 'Login successful!', type: 'success' });
        // Redirect based on profile existence
        if (userData.profile) {
          setTimeout(() => navigate(`/users/${userData.id}`), 1500);
        } else {
          setTimeout(() => navigate(`/create-profile/${userData.id}`), 1500);
        }
      } else {
        setMessage({ text: 'Failed to fetch user data', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="header-section">
          <Lock className="lock-icon" />
          <h1 className="title">Login</h1>
          <p className="subtitle">Access your account</p>
        </div>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.type === 'success' ? <CheckCircle className="message-icon" /> : <AlertCircle className="message-icon" />}
            <span className="message-text">{message.text}</span>
          </div>
        )}

        <div className="form-container">
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input-field" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="submit-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="footer-section">
          <a href="/forgot-password" className="back-link">Forgot Password?</a>
          <p className="toggle-text">New user? <a href="/register" className="toggle-link">Register here</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;