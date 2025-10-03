import React, { Component } from 'react';

class UserPositionManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPositions: [],
      users: [],
      positions: [],
      description: '',
      userId: '',
      positionId: '',
      editingId: null,
      loading: false,
      error: null,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddOrUpdate = this.handleAddOrUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.fetchUserPositions = this.fetchUserPositions.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.fetchPositions = this.fetchPositions.bind(this);
  }

  componentDidMount() {
    this.fetchUsers();
    this.fetchPositions();
    this.fetchUserPositions();
  }

  fetchUserPositions = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken') || 'mock-token'; // Replace with actual token logic
      const response = await fetch('http://localhost:8080/api/user-positions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user positions');
      const userPositions = await response.json();
      this.setState({ userPositions });
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchUsers = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken') || 'mock-token';
      const response = await fetch('http://localhost:8080/api/users', { // Adjust endpoint as per your User controller
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      this.setState({ users });
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchPositions = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken') || 'mock-token';
      const response = await fetch('http://localhost:8080/api/positions', { // Adjust endpoint as per your Position controller
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch positions');
      const positions = await response.json();
      this.setState({ positions });
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const { description, userId, positionId, editingId } = this.state;
    if (!userId || !positionId) {
      this.setState({ error: 'User and Position are required.' });
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken') || 'mock-token';
      const url = editingId
        ? `http://localhost:8080/api/user-positions/${editingId}`
        : 'http://localhost:8080/api/user-positions/postuser_positions';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          userId: parseInt(userId),
          positionId: parseInt(positionId),
        }),
      });
      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} user position`);
      this.setState({
        description: '',
        userId: '',
        positionId: '',
        editingId: null,
      });
      this.fetchUserPositions();
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEdit = (userPosition) => {
    this.setState({
      editingId: userPosition.userPositionId,
      description: userPosition.description,
      userId: userPosition.user?.userId || '',
      positionId: userPosition.position?.positionId || '',
    });
  };

  handleDelete = async (userPositionId) => {
    if (window.confirm('Are you sure you want to delete this user position?')) {
      this.setState({ loading: true, error: null });
      try {
        const accessToken = localStorage.getItem('accessToken') || 'mock-token';
        const response = await fetch(`http://localhost:8080/api/user-positions/${userPositionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete user position');
        this.fetchUserPositions();
      } catch (error) {
        this.setState({ error: error.message });
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  render() {
    const { userPositions, users, positions, description, userId, positionId, editingId, loading, error } = this.state;

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>User Position Management</h2>
        {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}

        <form onSubmit={this.handleAddOrUpdate} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <textarea
              name="description"
              placeholder="Description"
              value={description}
              onChange={this.handleInputChange}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                height: '100px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            <select
              name="userId"
              value={userId}
              onChange={this.handleInputChange}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>{user.username || user.email || `User ${user.userId}`}</option> // Adjust based on User entity
              ))}
            </select>
            <select
              name="positionId"
              value={positionId}
              onChange={this.handleInputChange}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              required
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos.positionId} value={pos.positionId}>{pos.positionName || `Position ${pos.positionId}`}</option> // Adjust based on Position entity
              ))}
            </select>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2ecc71',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#27ae60')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#2ecc71')}
            >
              {editingId ? 'Update User Position' : 'Add User Position'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => this.setState({
                  editingId: null,
                  description: '',
                  userId: '',
                  positionId: '',
                })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginLeft: '10px',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#5a6268')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#6c757d')}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#34495e' }}>Loading user positions...</p>
        ) : userPositions.length > 0 ? (
          <div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>User Positions</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '5px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#ecf0f1' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>ID</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>User</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Position</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Description</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPositions.map((userPosition) => (
                  <tr key={userPosition.userPositionId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{userPosition.userPositionId}</td>
                    <td style={{ padding: '10px' }}>{userPosition.user?.username || userPosition.user?.email || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>{userPosition.position?.positionName || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>{userPosition.description || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => this.handleEdit(userPosition)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#3498db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginRight: '5px',
                          transition: 'background-color 0.3s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#2980b9')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#3498db')}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => this.handleDelete(userPosition.userPositionId)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.3s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#c0392b')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#e74c3c')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#34495e' }}>No user positions found.</p>
        )}
      </div>
    );
  }
}

export default UserPositionManagement;