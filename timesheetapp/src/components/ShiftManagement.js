import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import '../App.css';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({ startTime: '', endTime: '', shiftName: '', discription: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setMessage({ text: 'No access token found. Please log in.', type: 'error' });
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:8080/api/shifts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setShifts(data);
      } else if (res.status === 403) {
        setMessage({ text: 'Access denied. Insufficient permissions.', type: 'error' });
      } else {
        setMessage({ text: `Failed to fetch shifts: ${res.status} - ${await res.text()}`, type: 'error' });
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
      const url = editingId ? `/api/shifts/${editingId}` : '/api/shifts/postshifts';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(`http://localhost:8080${url}`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: formData.startTime,
          endTime: formData.endTime,
          shiftName: formData.shiftName,
          discription: formData.discription, // Corrected to match entity field
        }),
      });

      const responseText = await res.text();
      console.log(`Request ${method} to ${url}:`, res.status, responseText);

      if (res.ok) {
        setMessage({ text: `Shift ${editingId ? 'updated' : 'created'} successfully!`, type: 'success' });
        setFormData({ startTime: '', endTime: '', shiftName: '', discription: '' });
        setEditingId(null);
        fetchShifts();
      } else if (res.status === 403) {
        setMessage({ text: `Access denied: ${responseText}`, type: 'error' });
      } else {
        setMessage({ text: `Failed to ${editingId ? 'update' : 'create'} shift: ${res.status} - ${responseText}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
      console.error('Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shift) => {
    setFormData({
      startTime: shift.startTime,
      endTime: shift.endTime,
      shiftName: shift.shiftName,
      discription: shift.discription, // Note: Matches entity typo "discription"
    });
    setEditingId(shift.shiftId);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8080/api/shifts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          setMessage({ text: 'Shift deleted successfully!', type: 'success' });
          fetchShifts();
        } else if (res.status === 403) {
          setMessage({ text: 'Access denied. Insufficient permissions.', type: 'error' });
        } else {
          setMessage({ text: `Failed to delete shift: ${res.status} - ${await res.text()}`, type: 'error' });
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
        <h1 className="title">Shift Management</h1>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.type === 'success' ? <CheckCircle className="message-icon" /> : <AlertCircle className="message-icon" />}
            <span className="message-text">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="input-group">
            {/* <label>Start Time</label> */}
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Start Time"
              required
            />
          </div>
          <div className="input-group">
            {/* <label>End Time</label> */}
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter End Time"
              required
            />
          </div>
          <div className="input-group">
            {/* <label>Shift Name</label> */}
            <input
              type="text"
              name="shiftName"
              value={formData.shiftName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Shift Name"
              required
            />
          </div>
          <div className="input-group">
            {/* <label>Description</label> */}
            <textarea
              name="discription"
              value={formData.discription}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter discription"
              rows="4"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : (editingId ? 'Update' : 'Add') + ' Shift'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ startTime: '', endTime: '', shiftName: '', description: '' }); }} className="submit-button cancel-button">
              Cancel
            </button>
          )}
        </form>

        {loading ? (
          <p>Loading shifts...</p>
        ) : (
          <table className="position-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Shift Name</th>
                <th>discription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.shiftId}>
                  <td>{shift.shiftId}</td>
                  <td>{shift.startTime}</td>
                  <td>{shift.endTime}</td>
                  <td>{shift.shiftName}</td>
                  <td>{shift.discription}</td> {/* Matches entity typo */}
                  <td>
                    <button onClick={() => handleEdit(shift)} className="action-button edit-button"><Edit /></button>
                    <button onClick={() => handleDelete(shift.shiftId)} className="action-button delete-button"><Trash2 /></button>
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

export default ShiftManagement;