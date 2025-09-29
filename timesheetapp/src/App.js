import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CreateProfile from './components/CreateProfile';
import Dashboard from './components/Dashboard';
import UserDetails from './components/UserDetailes';
import PositionManagement from './PositionManagement';
import RoleManagement from './RoleManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-profile/:id" element={<CreateProfile />} />
        <Route path="/users/:id" element={<UserDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/position_management" element={<PositionManagement />} />
        <Route path="/roles" element={<RoleManagement />} />
      </Routes>
    </Router>
  );
}

export default App;