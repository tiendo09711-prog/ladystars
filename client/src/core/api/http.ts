import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000/api`;

export const http = axios.create({ baseURL: apiBaseUrl });
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
