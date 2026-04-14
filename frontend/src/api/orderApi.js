import apiClient from './apiClient';

export const orderApi = {
  placeOrder:      (data) => apiClient.post('/orders', data),
  getOrder:        (id)   => apiClient.get(`/orders/${id}`),
  getOrderHistory: ()     => apiClient.get('/orders'),
};
