import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wastewise_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return backendBase ? `${backendBase}${url.startsWith('/') ? '' : '/'}${url}` : url;
};

export default api;
