import React, { Component } from 'react';

class TimesheetManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timesheets: [],
      categories: [],
      shifts: [],
      users: [],
      workDate: new Date().toISOString().split('T')[0],
      hoursWorked: '',
      details: '',
      categoryId: '',
      shiftId: '',
      userId: '',
      currentUser: { id: '', role: '', userId: '' },
      editingId: null,
      loading: false,
      error: null,
      successMessage: null,
      timeIn: null,
      timeOut: null,
      isTracking: false,
      elapsedTime: '00:00:00',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddOrUpdate = this.handleAddOrUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.fetchTimesheets = this.fetchTimesheets.bind(this);
    this.fetchCategories = this.fetchCategories.bind(this);
    this.fetchShifts = this.fetchShifts.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.fetchCurrentUser = this.fetchCurrentUser.bind(this);
    this.retryFetchUsers = this.retryFetchUsers.bind(this);
    this.handleTimeIn = this.handleTimeIn.bind(this);
    this.handleTimeOut = this.handleTimeOut.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.timer = null;
  }

  componentDidMount() {
    // Restore timer state from localStorage
    const savedTimeIn = localStorage.getItem('timeIn');
    const savedIsTracking = localStorage.getItem('isTracking') === 'true';
    const savedElapsedTime = localStorage.getItem('elapsedTime') || '00:00:00';

    if (savedTimeIn && savedIsTracking) {
      this.setState({ timeIn: new Date(savedTimeIn), isTracking: true, elapsedTime: savedElapsedTime }, () => {
        if (this.state.isTracking) this.startTimer();
      });
    }

    this.fetchCurrentUser().then(() => {
      this.fetchCategories();
      this.fetchShifts();
      this.fetchUsers();
      this.fetchTimesheets();
    });
  }

  componentWillUnmount() {
    // Clean up timer on unmount
    this.stopTimer();
  }

  componentDidUpdate(prevProps, prevState) {
    // Save timer state to localStorage when it changes
    if (prevState.timeIn !== this.state.timeIn || prevState.isTracking !== this.state.isTracking || prevState.elapsedTime !== this.state.elapsedTime) {
      localStorage.setItem('timeIn', this.state.timeIn ? this.state.timeIn.toISOString() : null);
      localStorage.setItem('isTracking', this.state.isTracking);
      localStorage.setItem('elapsedTime', this.state.elapsedTime);
    }
  }

  fetchCurrentUser = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No authentication token found');
      console.log('Fetching current user with Access Token:', accessToken);

      const response = await fetch('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch current user');
      const userData = await response.json();
      console.log('Raw User Data from /api/users/me:', userData);

      const appUserId = userData.id;
      const role = userData.profile?.roleName
        ? `ROLE_${userData.profile.roleName.toUpperCase()}`
        : 'ROLE_USER';
      const profileUserId = userData.profile?.userid;
      console.log('Extracted profileUserId:', profileUserId);

      if (!profileUserId) {
        console.warn('No valid profile userId found, falling back to AppUser.id:', appUserId);
      }

      this.setState((prevState) => {
        const newCurrentUser = { ...prevState.currentUser, id: appUserId, role, userId: profileUserId.toString() };
        console.log('New currentUser state before set:', newCurrentUser);
        return {
          currentUser: newCurrentUser,
          userId: role === 'ROLE_USER' ? profileUserId.toString() : prevState.userId,
        };
      }, () => {
        console.log('CurrentUser state after update:', this.state.currentUser);
      });
    } catch (error) {
      console.error('Error in fetchCurrentUser:', error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchTimesheets = async () => {
    this.setState({ loading: true, error: null, successMessage: null });
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No authentication token found');
      const response = await fetch('http://localhost:8080/api/timesheets', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch timesheets');
      const timesheets = await response.json();
      console.log('Fetched timesheets from API:', timesheets);
      this.setState({ timesheets });
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchCategories = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No authentication token found');
      const response = await fetch('http://localhost:8080/api/task-categories', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const categories = await response.json();
      this.setState({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchShifts = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No authentication token found');
      const response = await fetch('http://localhost:8080/api/shifts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const shifts = await response.json();
      this.setState({ shifts });
    } catch (error) {
      console.error('Error fetching shifts:', error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchUsers = async () => {
    this.setState({ loading: true, error: null });
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No authentication token found');
      const response = await fetch('http://localhost:8080/api/users/all', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
          throw new Error('Access denied. Please check your authentication token or permissions.');
        }
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }
      const users = await response.json();
      console.log('Fetched all users:', users);
      this.setState({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  retryFetchUsers = async () => {
    this.setState({ loading: true, error: null });
    await this.fetchUsers();
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleTimeIn = () => {
    const { currentUser } = this.state;
    if (!currentUser.userId) {
      this.setState({ error: 'User ID not available. Please log in again.' });
      return;
    }
    if (!this.state.isTracking) {
      const newTimeIn = new Date();
      this.setState({ timeIn: newTimeIn, isTracking: true, elapsedTime: '00:00:00' }, this.startTimer);
    }
  };

  handleTimeOut = async () => {
    const { details, categoryId, shiftId, currentUser, timeIn } = this.state;
    if (!currentUser.userId) {
      this.setState({ error: 'User ID is required. Please log in again.' });
      return;
    }
    if (!details || !categoryId || !shiftId) {
      this.setState({ error: 'Please fill all fields (Details, Category, Shift) before Time Out.' });
      return;
    }
    if (!timeIn) {
      this.setState({ error: 'Please click Time In before Time Out.' });
      return;
    }

    const timeOut = new Date();
    const elapsedMs = timeOut - timeIn;
    const hours = Math.floor(elapsedMs / 3600000);
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const hoursWorked = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    this.setState({ timeOut, hoursWorked, isTracking: false }, this.stopTimer);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      this.setState({ error: 'No authentication token found' });
      return;
    }

    try {
      const userId = this.state.currentUser.userId;
      console.log('Final userId before POST in handleTimeOut:', userId);
      console.log('Full state before POST:', this.state);
      const response = await fetch('http://localhost:8080/api/timesheets/posttimesheet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workDate: this.state.workDate,
          hoursWorked,
          details,
          categoryId: parseInt(categoryId),
          shiftId: parseInt(shiftId),
          userId: parseInt(userId),
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save timesheet: ${response.status} - ${errorText}`);
      }
      this.setState({
        workDate: new Date().toISOString().split('T')[0],
        hoursWorked: '',
        details: '',
        categoryId: '',
        shiftId: '',
        userId: this.state.currentUser.userId,
        timeIn: null,
        timeOut: null,
        isTracking: false,
        elapsedTime: '00:00:00', // Reset elapsedTime to 00:00:00 on Time Out
        successMessage: 'Timesheet saved successfully!',
      });
      await this.fetchTimesheets();
      // Clear localStorage after successful save
      localStorage.removeItem('timeIn');
      localStorage.removeItem('isTracking');
      localStorage.removeItem('elapsedTime');
    } catch (error) {
      console.error('Error in handleTimeOut:', error);
      this.setState({ error: error.message });
    }
  };

  handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const { workDate, hoursWorked, details, categoryId, shiftId, currentUser, editingId } = this.state;
    if (currentUser.role !== 'ROLE_ADMIN') {
      this.setState({ error: 'Only admins can add or update timesheets.' });
      return;
    }
    if (!workDate || !hoursWorked || !details || !categoryId || !shiftId) {
      this.setState({ error: 'All fields are required.' });
      return;
    }

    this.setState({ loading: true, error: null, successMessage: null });
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No authentication token found');
      const userId = this.state.currentUser.role === 'ROLE_USER' ? this.state.currentUser.userId : this.state.userId;
      if (!userId) {
        this.setState({ error: 'User ID is required.' });
        return;
      }
      console.log('Final userId before POST in handleAddOrUpdate:', userId);
      console.log('Full state before POST:', this.state);
      const url = editingId
        ? `http://localhost:8080/api/timesheets/${editingId}`
        : 'http://localhost:8080/api/timesheets/posttimesheet';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workDate,
          hoursWorked: `${hoursWorked}:00`,
          details,
          categoryId: parseInt(categoryId),
          shiftId: parseInt(shiftId),
          userId: parseInt(userId),
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} timesheet: ${response.status} - ${errorText}`);
      }
      this.setState({
        workDate: new Date().toISOString().split('T')[0],
        hoursWorked: '',
        details: '',
        categoryId: '',
        shiftId: '',
        userId: this.state.currentUser.role === 'ROLE_USER' ? this.state.currentUser.userId : '',
        editingId: null,
        successMessage: `Timesheet ${editingId ? 'updated' : 'added'} successfully!`,
      });
      await this.fetchTimesheets();
    } catch (error) {
      console.error('Error in handleAddOrUpdate:', error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEdit = (timesheet) => {
    if (this.state.currentUser.role !== 'ROLE_ADMIN') {
      this.setState({ error: 'Only admins can edit timesheets.' });
      return;
    }
    console.log('Editing timesheet:', timesheet);
    this.setState({
      editingId: timesheet.timesheetId,
      workDate: timesheet.workDate,
      hoursWorked: timesheet.hoursWorked ? timesheet.hoursWorked.substring(0, 5) : '',
      details: timesheet.details,
      categoryId: timesheet.categoryId ? timesheet.categoryId.toString() : '',
      shiftId: timesheet.shiftId ? timesheet.shiftId.toString() : '',
      userId: timesheet.userId ? timesheet.userId.toString() : '',
    });
  };

  handleDelete = async (timesheetId) => {
    if (this.state.currentUser.role !== 'ROLE_ADMIN') {
      this.setState({ error: 'Only admins can delete timesheets.' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      this.setState({ loading: true, error: null, successMessage: null });
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No authentication token found');
        const response = await fetch(`http://localhost:8080/api/timesheets/${timesheetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete timesheet');
        this.setState({ successMessage: 'Timesheet deleted successfully!' });
        await this.fetchTimesheets();
      } catch (error) {
        console.error('Error in handleDelete:', error);
        this.setState({ error: error.message });
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  startTimer = () => {
    this.timer = setInterval(() => {
      const { timeIn, isTracking } = this.state;
      if (isTracking && timeIn) {
        const elapsedMs = new Date() - new Date(timeIn);
        const hours = Math.floor(elapsedMs / 3600000);
        const minutes = Math.floor((elapsedMs % 3600000) / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        this.setState({
          elapsedTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        });
      }
    }, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
    this.timer = null;
  };

  render() {
    const { timesheets, categories, shifts, users, workDate, hoursWorked, details, categoryId, shiftId, userId, currentUser, editingId, loading, error, successMessage, isTracking, elapsedTime } = this.state;

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>
          {currentUser.role === 'ROLE_ADMIN' ? 'All Timesheets' : 'My Timesheet Management'}
        </h2>
        {successMessage && <p style={{ color: '#27ae60', textAlign: 'center', marginBottom: '10px' }}>{successMessage}</p>}
        {error && (
          <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '10px' }}>
            {error}
            {error.includes('Failed to fetch users') && (
              <button onClick={this.retryFetchUsers} style={{ padding: '5px 10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>Retry</button>
            )}
          </p>
        )}

        <form onSubmit={this.handleAddOrUpdate} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="date"
              name="workDate"
              value={workDate}
              onChange={this.handleInputChange}
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={currentUser.role !== 'ROLE_ADMIN'} // Only admins can change date
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={this.handleTimeIn}
                disabled={isTracking || !currentUser.userId}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: (isTracking || !currentUser.userId) ? '#ccc' : '#2ecc71',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (isTracking || !currentUser.userId) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => !(isTracking || !currentUser.userId) && (e.target.style.backgroundColor = '#27ae60')}
                onMouseOut={(e) => !(isTracking || !currentUser.userId) && (e.target.style.backgroundColor = '#2ecc71')}
              >
                Time In
              </button>
              <button
                type="button"
                onClick={this.handleTimeOut}
                disabled={!isTracking || !currentUser.userId}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: (!isTracking || !currentUser.userId) ? '#ccc' : '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (!isTracking || !currentUser.userId) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (isTracking && currentUser.userId) && (e.target.style.backgroundColor = '#c0392b')}
                onMouseOut={(e) => (isTracking && currentUser.userId) && (e.target.style.backgroundColor = '#e74c3c')}
              >
                Time Out
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '10px' }}>Track Time: {elapsedTime}</p>
            <input
              type="time"
              name="hoursWorked"
              value={hoursWorked}
              onChange={this.handleInputChange}
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={true} // Hours worked is calculated automatically for users
            />
            <textarea
              name="details"
              placeholder="Details"
              value={details}
              onChange={this.handleInputChange}
              style={{ display: 'block', width: '100%', padding: '10px', height: '100px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
              required
              disabled={currentUser.role !== 'ROLE_ADMIN' && editingId !== null} // Allow entry for new timesheets, disable for editing
            />
            <select
              name="categoryId"
              value={categoryId}
              onChange={this.handleInputChange}
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={currentUser.role !== 'ROLE_ADMIN' && editingId !== null} // Allow selection for new timesheets, disable for editing
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId.toString()}>{cat.categoryName}</option>
              ))}
            </select>
            <select
              name="shiftId"
              value={shiftId}
              onChange={this.handleInputChange}
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={currentUser.role !== 'ROLE_ADMIN' && editingId !== null} // Allow selection for new timesheets, disable for editing
            >
              <option value="">Select Shift</option>
              {shifts.map((shift) => (
                <option key={shift.shiftId} value={shift.shiftId.toString()}>{shift.shiftName}</option>
              ))}
            </select>
            {currentUser.role === 'ROLE_ADMIN' ? (
              <select
                name="userId"
                value={userId}
                onChange={this.handleInputChange}
                style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box' }}
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId.toString()}>
                    {user.username || user.email || `User ${user.userId}`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="hidden"
                name="userId"
                value={currentUser.userId}
                readOnly
              />
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={loading || isTracking || currentUser.role !== 'ROLE_ADMIN'}
              style={{
                padding: '10px 20px',
                backgroundColor: (loading || isTracking || currentUser.role !== 'ROLE_ADMIN') ? '#ccc' : '#2ecc71',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: (loading || isTracking || currentUser.role !== 'ROLE_ADMIN') ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => !(loading || isTracking || currentUser.role !== 'ROLE_ADMIN') && (e.target.style.backgroundColor = '#27ae60')}
              onMouseOut={(e) => !(loading || isTracking || currentUser.role !== 'ROLE_ADMIN') && (e.target.style.backgroundColor = '#2ecc71')}
            >
              {editingId ? 'Update Timesheet' : 'Add Timesheet'}
            </button>
            {editingId && currentUser.role === 'ROLE_ADMIN' && (
              <button
                type="button"
                onClick={() => this.setState({
                  editingId: null,
                  workDate: new Date().toISOString().split('T')[0],
                  hoursWorked: '',
                  details: '',
                  categoryId: '',
                  shiftId: '',
                  userId: currentUser.role === 'ROLE_USER' ? currentUser.userId : '',
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
          <p style={{ textAlign: 'center', color: '#34495e' }}>Loading timesheets...</p>
        ) : timesheets.length > 0 ? (
          <div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>
              {currentUser.role === 'ROLE_ADMIN' ? 'All Timesheets' : 'My Timesheets'}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '5px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#ecf0f1' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Hours Worked</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Details</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Category</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Shift</th>
                  {currentUser.role === 'ROLE_ADMIN' && <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>User</th>}
                  {currentUser.role === 'ROLE_ADMIN' && <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {timesheets.map((timesheet) => (
                  <tr key={timesheet.timesheetId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{timesheet.workDate}</td>
                    <td style={{ padding: '10px' }}>{timesheet.hoursWorked ? timesheet.hoursWorked.substring(0, 5) : ''}</td>
                    <td style={{ padding: '10px' }}>{timesheet.details}</td>
                    <td style={{ padding: '10px' }}>
                      {categories.find((cat) => cat.categoryId === timesheet.categoryId)?.categoryName || 'N/A'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {shifts.find((shift) => shift.shiftId === timesheet.shiftId)?.shiftName || 'N/A'}
                    </td>
                    {currentUser.role === 'ROLE_ADMIN' && (
                      <td style={{ padding: '10px' }}>
                        {timesheet.userId
                          ? users.find((user) => user.userId === timesheet.userId)?.username ||
                            users.find((user) => user.userId === timesheet.userId)?.email ||
                            `User ${timesheet.userId}`
                          : 'N/A'}
                      </td>
                    )}
                    {currentUser.role === 'ROLE_ADMIN' && (
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => this.handleEdit(timesheet)}
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
                          onClick={() => this.handleDelete(timesheet.timesheetId)}
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#34495e' }}>No timesheets found.</p>
        )}
      </div>
    );
  }
}

export default TimesheetManagement;