import axios from 'axios';

// Determine API URL (prefer explicit env var; fallback to local dev)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

// Log the API URL being used (helpful for debugging)
console.log('API URL:', API_URL);
console.log('Environment:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  HOSTNAME: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
});

// Token management
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const getTokens = () => ({
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
});

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // Only set Content-Type if not FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  console.log('📤 API Request:', {
    method: config.method.toUpperCase(),
    url: config.url,
    headers: config.headers,
    data: config.data,
  });
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = getTokens();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔄 Token refresh failed:', refreshError);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, setTokens, getTokens, clearTokens, API_URL };
