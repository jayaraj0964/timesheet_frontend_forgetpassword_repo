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
    teamid: ''
  });

  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // user ID from URL

  // 🔄 Fetch teams and roles on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        const [teamRes, roleRes] = await Promise.all([
          fetch('http://localhost:8080/api/getallteams', { headers }),
          fetch('http://localhost:8080/api/roles/getallroles', { headers }),
        ]);

        const teamData = await teamRes.json();
        const roleData = await roleRes.json();

        // ✅ Handle both array and wrapped object responses
        setTeams(teamData.teams || teamData);
        setRoles(roleData.roles || roleData);
      } catch (error) {
        console.error('❌ Dropdown fetch error:', error.message);
      }
    };

    fetchDropdownData();
  }, []);

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
        setMessage({ text: '✅ Profile created successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setMessage({ text: typeof data === 'string' ? data : '❌ Failed to create profile', type: 'error' });
      }
    } catch {
      setMessage({ text: '❌ Network error', type: 'error' });
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
          {[
            { name: 'firstName', placeholder: 'Enter your first name' },
            { name: 'middleName', placeholder: 'Enter your middle name' },
            { name: 'lastName', placeholder: 'Enter your last name' },
            { name: 'birthDate', type: 'date', placeholder: 'Select your birth date' },
            { name: 'skills', placeholder: 'Enter your skills (e.g., Java, React)' },
            { name: 'address', placeholder: 'Enter your address' },
            { name: 'contactNumber', placeholder: 'Enter your contact number' },
            { name: 'emergencyContactName', placeholder: 'Emergency contact name' },
            { name: 'emergencyContactNumber', placeholder: 'Emergency contact number' },
            { name: 'email', type: 'email', placeholder: 'Enter your email' },
          ].map(({ name, placeholder, type = 'text' }) => (
            <div className="input-group" key={name}>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          ))}

          {/* 🔽 Gender Dropdown */}
          <div className="input-group">
            <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
              <option value="" disabled>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* 🔽 Relationship Dropdown */}
          <div className="input-group">
            <select name="relationship" value={formData.relationship} onChange={handleChange} className="input-field">
              <option value="" disabled>Select Relationship</option>
              <option>Father</option>
              <option>Mother</option>
              <option>Sister</option>
              <option>Brother</option>
              <option>Spouse</option>
            </select>
          </div>

          {/* 🔽 Education Dropdown */}
          <div className="input-group">
            <select name="educationQualification" value={formData.educationQualification} onChange={handleChange} className="input-field">
              <option value="" disabled>Select Education</option>
              <option>B.Tech</option>
              <option>Degree</option>
            </select>
          </div>

          {/* 🔽 Role Dropdown */}
          <div className="input-group">
            <select name="roleId" value={formData.roleId} onChange={handleChange} className="input-field">
              <option value="" disabled>Select Role</option>
              {roles.map(role => (
                <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
              ))}
            </select>
          </div>

          {/* 🔽 Team Dropdown */}
          <div className="input-group">
            <select name="teamid" value={formData.teamid} onChange={handleChange} className="input-field">
              <option value="" disabled>Select Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.teamname}</option>
              ))}
            </select>
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
