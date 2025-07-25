

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';

// Inside Routes:



const App = () => {
  // const isAuth = localStorage.getItem('token');

  return (
    <Routes>
      {/*<Route path="/" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />*/}
      <Route path="/" element={ <Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/users" element={<UserManagement />} />
    </Routes>
  );
};

export default App;
