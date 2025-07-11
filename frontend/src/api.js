


import axios from 'axios';

const API = axios.create({
  baseURL: 'https://task-manager-app-xp9b.onrender.com/api',
});

// Attach JWT token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers['x-auth-token'] = token;
  return req;
});

export default API;
