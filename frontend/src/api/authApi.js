import apiClient from './apiClient';

/**
 * API service for authentication-related requests.
 */
export const authApi = {
  /** Registers a new user */
  signup:  (data) => apiClient.post('/auth/signup', data),
  
  /** Authenticates a user and starts a session */
  login:   (data) => apiClient.post('/auth/login', data),
  
  /** Refreshes current session tokens */
  refresh: ()     => apiClient.post('/auth/refresh'),
  
  /** Ends the current session and clears cookies */
  logout:  ()     => apiClient.post('/auth/logout'),
  
  /** Fetches the current logged-in user profile */
  me:      ()     => apiClient.get('/auth/me'),
};
