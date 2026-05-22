import axios from 'axios';
import { getApiBaseUrl } from '@/lib/api-utils';

const TOKEN_KEY = 'token';

function getTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) ?? getTokenFromCookie();
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      console.error('[API] Sesión inválida o expirada (401)');
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/';
      }
    } else if (error.response) {
      console.error('[API] Error HTTP:', status, error.response.data);
    } else {
      console.error('[API] Error de red:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
