import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import './App.css';

const PositionManagement = () => {
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState({ positionName: '', rolesResponsblities: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setMessage({ text: 'No access token found. Please log in.', type: 'error' });
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:8080/api/positions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPositions(data);
      } else {
        setMessage({ text: 'Failed to fetch positions', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = editingId ? `/api/positions/${editingId}` : '/api/positions/postpositions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(`http://localhost:8080/api/positions${url}`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionName: formData.positionName,
          rolesResponsblities: formData.rolesResponsblities,
        }),
      });

      if (res.ok) {
        setMessage({ text: `Position ${editingId ? 'updated' : 'created'} successfully!`, type: 'success' });
        setFormData({ positionName: '', rolesResponsblities: '' });
        setEditingId(null);
        fetchPositions();
      } else {
        setMessage({ text: `Failed to ${editingId ? 'update' : 'create'} position`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (position) => {
    setFormData({ positionName: position.positionName, rolesResponsblities: position.rolesResponsblities });
    setEditingId(position.positionId);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8080/api/positions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          setMessage({ text: 'Position deleted successfully!', type: 'success' });
          fetchPositions();
        } else {
          setMessage({ text: 'Failed to delete position', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'Network error', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="title">Position Management</h1>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.type === 'success' ? <CheckCircle className="message-icon" /> : <AlertCircle className="message-icon" />}
            <span className="message-text">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="input-group">
            {/* <label>Position Name</label> */}
            <input
              type="text"
              name="positionName"
              value={formData.positionName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Position Name"
              required
            />
          </div>
          <div className="input-group">
            {/* <label>Roles & Responsibilities</label> */}
            <textarea
              name="rolesResponsblities"
              value={formData.rolesResponsblities}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Roles & Responsibilities"
              rows="4"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : (editingId ? 'Update' : 'Add') + ' Position'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ positionName: '', rolesResponsblities: '' }); }} className="submit-button cancel-button">
              Cancel
            </button>
          )}
        </form>

        {loading ? (
          <p>Loading positions...</p>
        ) : (
          <table className="position-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Position Name</th>
                <th>Roles & Responsibilities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.positionId}>
                  <td>{position.positionId}</td>
                  <td>{position.positionName}</td>
                  <td>{position.rolesResponsblities}</td>
                  <td>
                    <button onClick={() => handleEdit(position)} className="action-button edit-button"><Edit /></button>
                    <button onClick={() => handleDelete(position.positionId)} className="action-button delete-button"><Trash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PositionManagement;