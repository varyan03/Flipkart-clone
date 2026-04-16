import apiClient from './apiClient';

/**
 * API service for order-related requests.
 */
export const orderApi = {
  /** Places a new order from the current cart and address data */
  placeOrder:      (data) => apiClient.post('/orders', data),
  
  /** Fetches specific order details by ID */
  getOrder:        (id)   => apiClient.get(`/orders/${id}`),
  
  /** Retrieves the full order history for the authenticated user */
  getOrderHistory: ()     => apiClient.get('/orders'),
};
