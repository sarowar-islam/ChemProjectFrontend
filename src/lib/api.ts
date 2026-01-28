import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for API calls
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const response = await api(config);
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      console.error('API Error:', message);
      return { success: false, error: message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export default api;
