import apiClient from './apiClient';

export const cartApi = {
  createCart: () => apiClient.post('/cart'),
  getCart: (cartId) => apiClient.get(`/cart/${cartId}`),
  addItem: (cartId, payload) => apiClient.post(`/cart/${cartId}/items`, payload),
  updateItem: (cartId, productId, payload) => apiClient.patch(`/cart/${cartId}/items/${productId}`, payload),
  removeItem: (cartId, productId) => apiClient.delete(`/cart/${cartId}/items/${productId}`)
};
