import axios from 'axios';

/**
 * Axios instance configured with a base URL and credentials support.
 * Used for all authenticated API communication.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.PROD 
    ? '/api/v1' 
    : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'),
  withCredentials: true,  // sends httpOnly cookies automatically
});

// 401 auto-refresh interceptor
let isRefreshing = false;
let failedQueue = [];

/**
 * Processes the queue of failed requests that were waiting for a token refresh.
 * 
 * @param {Error|null} error - The error encountered during refresh, if any
 */
const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve());
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res.data,  // unwrap to res.data for convenience
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const message = err.response?.data?.error || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
