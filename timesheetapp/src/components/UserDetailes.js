// UserDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Users } from 'lucide-react';
import '../App.css';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State declarations
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState({ id: '', role: '' });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // 👉 మొదట current user fetch చేయాలి
  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Access token దొరకలేదు. దయచేసి login చేయండి.');
        setLoading(false);
        return;
      }

      try {
        // 👉 Current user fetch
        const meResponse = await fetch('http://localhost:8080/api/users/me', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!meResponse.ok) throw new Error('Current user data fetch చేయలేకపోయింది');
        const meData = await meResponse.json();

        const role = meData.profile?.roleName
          ? `ROLE_${meData.profile.roleName.toUpperCase()}`
          : 'ROLE_USER';
        const userId = meData.id || '';

        setCurrentUser({ id: userId, role });

        // 👉 Target user fetch
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          if (role === 'ROLE_USER' && userId !== parseInt(id)) {
            setError('మీ details మాత్రమే చూడవచ్చు.');
            setUserData(null);
          } else {
            setUserData(data);
          }
        } else {
          setError(typeof data === 'string' ? data : 'User details fetch చేయలేకపోయింది');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // 👉 Admin-only: Fetch all users
  const handleGetAllUsers = async () => {
    if (currentUser.role !== 'ROLE_ADMIN') {
      setError('మీకు అన్ని users చూడటానికి permission లేదు.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/users/all', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('All users fetch చేయలేకపోయింది');
      const data = await response.json();

      // 👉 Backend structure check
      const usersArray = Array.isArray(data) ? data : (data.data || []);
      setAllUsers(usersArray);
      setShowAllUsers(true);
    } catch (err) {
      setError('Error fetching all users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Debug log for state changes
  useEffect(() => {
    console.log('✅ Updated allUsers:', allUsers);
    console.log('✅ showAllUsers:', showAllUsers);
  }, [allUsers, showAllUsers]);

  // 👉 UI rendering
  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="message message-error">
            <AlertCircle className="message-icon" />
            <span className="message-text">{error}</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="title">User Details</h1>
        {userData && (
          <>
            <p className="subtitle">ID: {userData.id}</p>
            <p>Email: {userData.email}</p>
            {userData.profile && (
              <div>
                <p>First Name: {userData.profile.firstName}</p>
                <p>Middle Name: {userData.profile.middleName}</p>
                <p>Last Name: {userData.profile.lastName}</p>
                <p>Birth Date: {userData.profile.birthDate}</p>
                <p>Gender: {userData.profile.gender}</p>
                <p>Skills: {userData.profile.skills}</p>
                <p>Address: {userData.profile.address}</p>
                <p>Contact Number: {userData.profile.contactNumber}</p>
                <p>Emergency Contact Name: {userData.profile.emergencyContactName}</p>
                <p>Emergency Contact Number: {userData.profile.emergencyContactNumber}</p>
                <p>Relationship: {userData.profile.relationship}</p>
                <p>Education Qualification: {userData.profile.educationQualification}</p>
              </div>
            )}
          </>
        )}

        {/* 👉 Admin-only button */}
        {currentUser.role === 'ROLE_ADMIN' && (
          <button
            onClick={handleGetAllUsers}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#357abd')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#4a90e2')}
          >
            <Users size={18} />
            <span>Get All Users</span>
          </button>
        )}

        {/* 👉 All users list */}
        {showAllUsers && allUsers.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>All Users <Users size={20} /></h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {allUsers.map((user) => (
                <li
                  key={user.id}
                  style={{
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                  }}
                >
                  <p>ID: {user.id || 'N/A'}</p>
                  <p>Email: {user.email || 'N/A'}</p>
                  {user.profile ? (
                    <p>Name: {`${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()}</p>
                  ) : (
                    <p>Name: N/A</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
