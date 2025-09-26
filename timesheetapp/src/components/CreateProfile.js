import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import '../App.css';

const CreateProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    skills: '',
    address: '',
    contactNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    relationship: '',
    educationQualification: '',
    email: '',
    roleId: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get the user ID from the URL

  // Optional: Fetch the user's email to prefill the form
  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setMessage({ text: 'No access token found. Please log in.', type: 'error' });
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      try {
        // Assuming you have an endpoint to fetch user details, e.g., /api/users/me
        const res = await fetch('http://localhost:8080/api/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setFormData((prev) => ({ ...prev, email: data.email }));
        } else {
          setMessage({ text: 'Failed to fetch user data', type: 'error' });
        }
      } catch {
        setMessage({ text: 'Network error', type: 'error' });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage({ text: 'No access token found. Please log in.', type: 'error' });
      setLoading(false);
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/users/postuser/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Profile created successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1500); // Redirect to dashboard after success
      } else {
        setMessage({ text: typeof data === 'string' ? data : 'Failed to create profile', type: 'error' });
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
          <h1 className="title">Create Profile</h1>
          <p className="subtitle">Complete your profile details</p>
        </div>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.type === 'success' ? <CheckCircle className="message-icon" /> : <AlertCircle className="message-icon" />}
            <span className="message-text">{message.text}</span>
          </div>
        )}

        <div className="form-container">
          <div className="input-group">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your first name"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your middle name"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your last name"
            />
          </div>
          <div className="input-group">
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="input-field"
              placeholder="Select your birth date"
            />
          </div>
          <div className="input-group">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your skills (e.g., JavaScript, Python)"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your address"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your contact number"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter emergency contact name"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="emergencyContactNumber"
              value={formData.emergencyContactNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter emergency contact number"
            />
          </div>
          <div className="input-group">
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className="input-field"
            >
              <option value="" disabled>
                Select Relationship
              </option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Spouse">Spouse</option>
            </select>
          </div>
          <div className="input-group">
            <select
              name="educationQualification"
              value={formData.educationQualification}
              onChange={handleChange}
              className="input-field"
            >
              <option value="" disabled>
                Select Education
              </option>
              <option value="B.Tech">B.Tech</option>
              <option value="Degree">Degree</option>
            </select>
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
              disabled
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your role ID"
            />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="submit-button">
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;