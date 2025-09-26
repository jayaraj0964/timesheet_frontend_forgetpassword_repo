import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import '../App.css';

const UserDetails = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('No access token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUserData(data);
        } else {
          setError(typeof data === 'string' ? data : 'Failed to fetch user details');
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return (
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
      </div>
    </div>
  );
};

export default UserDetails;