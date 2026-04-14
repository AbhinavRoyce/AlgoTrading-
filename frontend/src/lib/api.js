import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api', withCredentials: true, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

api.interceptors.response.use((r) => r, async (error) => {
  const orig = error.config;
  if (error.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try { const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/refresh`, {}, { withCredentials: true }); localStorage.setItem('accessToken', data.accessToken); orig.headers.Authorization = `Bearer ${data.accessToken}`; return api(orig); }
    catch { localStorage.removeItem('accessToken'); if (typeof window !== 'undefined') window.location.href = '/login'; }
  }
  return Promise.reject(error);
});

export default api;
