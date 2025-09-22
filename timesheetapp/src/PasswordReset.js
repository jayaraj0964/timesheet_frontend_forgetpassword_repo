import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './App.css';

const PasswordReset = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});

  // Extract token from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setFormData(prev => ({ ...prev, token: tokenFromUrl }));
    }
  }, []);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.token.trim()) {
      newErrors.token = 'Reset token is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword
        })
      });

      const responseText = await response.text();

      if (response.ok) {
        setMessage({ 
          text: responseText || 'Password reset successfully! You can now login with your new password.', 
          type: 'success' 
        });
        // Clear form
        setFormData({ token: '', newPassword: '', confirmPassword: '' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setMessage({ 
          text: responseText || 'Failed to reset password. Please try again.', 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: 'Network error. Please check your connection and try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <div className="header-section">
          <div className="icon-wrapper">
            <Lock className="lock-icon" />
          </div>
          <h1 className="title">Reset Password</h1>
          <p className="subtitle">Enter your new password below</p>
        </div>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="message-icon" />
            ) : (
              <AlertCircle className="message-icon" />
            )}
            <span className="message-text">{message.text}</span>
          </div>
        )}

        <div className="form-container">
          {/* Token Input */}
          <div className="input-group">
            <label htmlFor="token" className="input-label">
              Reset Token
            </label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={`input-field ${errors.token ? 'input-error' : ''}`}
              placeholder="Enter reset token"
            />
            {errors.token && (
              <p className="error-text">{errors.token}</p>
            )}
          </div>

          {/* New Password Input */}
          <div className="input-group">
            <label htmlFor="newPassword" className="input-label">
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={`input-field password-input ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="error-text">{errors.newPassword}</p>
            )}

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="password-requirements">
                <p className="requirements-title">Password Requirements:</p>
                <div className="requirements-list">
                  <div className={`requirement ${passwordValidation.minLength ? 'requirement-valid' : 'requirement-invalid'}`}>
                    <div className={`requirement-dot ${passwordValidation.minLength ? 'dot-valid' : 'dot-invalid'}`}></div>
                    At least 8 characters
                  </div>
                  <div className={`requirement ${passwordValidation.hasUppercase ? 'requirement-valid' : 'requirement-invalid'}`}>
                    <div className={`requirement-dot ${passwordValidation.hasUppercase ? 'dot-valid' : 'dot-invalid'}`}></div>
                    One uppercase letter
                  </div>
                  <div className={`requirement ${passwordValidation.hasLowercase ? 'requirement-valid' : 'requirement-invalid'}`}>
                    <div className={`requirement-dot ${passwordValidation.hasLowercase ? 'dot-valid' : 'dot-invalid'}`}></div>
                    One lowercase letter
                  </div>
                  <div className={`requirement ${passwordValidation.hasNumbers ? 'requirement-valid' : 'requirement-invalid'}`}>
                    <div className={`requirement-dot ${passwordValidation.hasNumbers ? 'dot-valid' : 'dot-invalid'}`}></div>
                    One number
                  </div>
                  <div className={`requirement ${passwordValidation.hasSpecialChar ? 'requirement-valid' : 'requirement-invalid'}`}>
                    <div className={`requirement-dot ${passwordValidation.hasSpecialChar ? 'dot-valid' : 'dot-invalid'}`}></div>
                    One special character
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              Confirm New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={`input-field password-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`submit-button ${loading ? 'submit-button-loading' : ''}`}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>

        <div className="footer-section">
          <a href="/login" className="back-link">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;