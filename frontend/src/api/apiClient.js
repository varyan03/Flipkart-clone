import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  withCredentials: false
});

// Simple in-memory response cache (GET requests, 60s TTL)
const cache = new Map();

apiClient.interceptors.response.use(
  (res) => {
    // Cache GET responses
    if (res.config.method === 'get') {
      const key = res.config.baseURL + res.config.url + JSON.stringify(res.config.params);
      cache.set(key, { data: res.data, timestamp: Date.now() });
    }
    return res.data;
  },
  (err) => {
    const message = err.response?.data?.error || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
