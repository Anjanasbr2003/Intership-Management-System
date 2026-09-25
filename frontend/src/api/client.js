import axios from 'axios';

// Helper to extract cookies by name
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('interlink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Add CSRF token automatically from double-submit cookie
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 (including password changed revocation)
      localStorage.removeItem('interlink_token');
      localStorage.removeItem('interlink_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

