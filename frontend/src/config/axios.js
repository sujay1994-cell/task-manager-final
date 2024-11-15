import axios from 'axios';

const instance = axios.create({
  baseURL: window.location.hostname.includes('repl.co') 
    ? `https://${window.location.hostname}`  // Replit environment
    : 'http://localhost:5000',              // Local development
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance; 