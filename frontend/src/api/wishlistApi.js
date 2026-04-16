import apiClient from './apiClient';

/**
 * API service for wishlist-related requests.
 */
export const wishlistApi = {
  /** Fetches all products in the user's wishlist */
  getWishlist:        ()          => apiClient.get('/wishlist'),
  
  /** Adds a specific product to the user's wishlist */
  addToWishlist:      (productId) => apiClient.post(`/wishlist/${productId}`),
  
  /** Removes a specific product from the user's wishlist */
  removeFromWishlist: (productId) => apiClient.delete(`/wishlist/${productId}`),
};
