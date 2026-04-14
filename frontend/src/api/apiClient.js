import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  withCredentials: true
});

const cache = new Map();

apiClient.interceptors.request.use((config) => {
  if (config.method === 'get') {
    const url = axios.getUri(config);
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < 60000) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      });
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    if (res.config.method === 'get') {
      const url = axios.getUri(res.config);
      cache.set(url, { data: res.data, timestamp: Date.now() });
    }
    return res.data;
  },
  (err) => {
    const message = err.response?.data?.error || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
