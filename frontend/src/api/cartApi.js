import apiClient from './apiClient';

/**
 * API service for cart-related requests.
 */
export const cartApi = {
  /** Initializes a new guest cart */
  createCart: () => apiClient.post('/cart'),
  
  /** Fetches cart contents by its UUID */
  getCart: (cartId) => apiClient.get(`/cart/${cartId}`),
  
  /** Adds a product to a specific cart */
  addItem: (cartId, payload) => apiClient.post(`/cart/${cartId}/items`, payload),
  
  /** Updates the quantity of an item within a cart */
  updateItem: (cartId, productId, payload) => apiClient.patch(`/cart/${cartId}/items/${productId}`, payload),
  
  /** Removes an item from a cart */
  removeItem: (cartId, productId) => apiClient.delete(`/cart/${cartId}/items/${productId}`)
};
