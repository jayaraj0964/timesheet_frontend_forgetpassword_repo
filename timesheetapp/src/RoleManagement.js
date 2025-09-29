import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import './App.css';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ roleName: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setMessage({ text: 'No access token found. Please log in.', type: 'error' });
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:8080/api/roles/getallroles', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRoles(data);
      } else {
        setMessage({ text: 'Failed to fetch roles', type: 'error' });
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
      const url = editingId ? `/api/roles/${editingId}` : '/api/roles/postrole';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(`http://localhost:8080/api/roles${url}`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleName: formData.roleName,
          description: formData.description,
        }),
      });

      if (res.ok) {
        setMessage({ text: `Role ${editingId ? 'updated' : 'created'} successfully!`, type: 'success' });
        setFormData({ roleName: '', description: '' });
        setEditingId(null);
        fetchRoles();
      } else {
        setMessage({ text: `Failed to ${editingId ? 'update' : 'create'} role`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setFormData({ roleName: role.roleName, description: role.description });
    setEditingId(role.roleId);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8080/api/roles/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          setMessage({ text: 'Role deleted successfully!', type: 'success' });
          fetchRoles();
        } else {
          setMessage({ text: 'Failed to delete role', type: 'error' });
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
        <h1 className="title">Role Management</h1>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.type === 'success' ? <CheckCircle className="message-icon" /> : <AlertCircle className="message-icon" />}
            <span className="message-text">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="input-group">
            {/* <label>Role Name</label> */}
            <input
              type="text"
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Role Name"
              required
            />
          </div>
          <div className="input-group">
            {/* <label>Description</label> */}
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Description"
              rows="4"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : (editingId ? 'Update' : 'Add') + ' Role'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ roleName: '', description: '' }); }} className="submit-button cancel-button">
              Cancel
            </button>
          )}
        </form>

        {loading ? (
          <p>Loading roles...</p>
        ) : (
          <table className="position-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Role Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.roleId}>
                  <td>{role.roleId}</td>
                  <td>{role.roleName}</td>
                  <td>{role.description}</td>
                  <td>
                    <button onClick={() => handleEdit(role)} className="action-button edit-button"><Edit /></button>
                    <button onClick={() => handleDelete(role.roleId)} className="action-button delete-button"><Trash2 /></button>
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

export default RoleManagement;