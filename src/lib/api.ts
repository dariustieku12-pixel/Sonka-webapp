// Axios API client — attaches the JWT on every request, mirrors the
// mobile app's lib/api.ts. Token lives in localStorage (web equivalent
// of the mobile app's SecureStore).
import axios, { AxiosError } from 'axios';
import { API_URL, TOKEN_KEY, USER_KEY } from './constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      // Token expired / invalid — clear it. The auth context picks this
      // up on the next render and bounces the user to the welcome screen.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!location.hash.includes('/welcome')) {
        location.hash = '#/welcome';
      }
    }
    return Promise.reject(err);
  }
);

// Pull a human-readable message out of an axios error.
export function errorMessage(err: unknown, fallback = 'Something went wrong. Try again.'): string {
  const ax = err as AxiosError<{ error?: string; errors?: { msg: string }[] }>;
  const data = ax?.response?.data;
  if (data?.error) return data.error;
  if (data?.errors?.length) return data.errors[0].msg;
  if (ax?.code === 'ECONNABORTED') return 'Network is slow. Check your connection.';
  if (ax?.message === 'Network Error') return 'No connection. Check your internet.';
  return fallback;
}

export default api;
