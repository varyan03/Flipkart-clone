import apiClient from './apiClient';

export const authApi = {
  signup:  (data) => apiClient.post('/auth/signup', data),
  login:   (data) => apiClient.post('/auth/login', data),
  refresh: ()     => apiClient.post('/auth/refresh'),
  logout:  ()     => apiClient.post('/auth/logout'),
  me:      ()     => apiClient.get('/auth/me'),
};
