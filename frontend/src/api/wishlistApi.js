import apiClient from './apiClient';

export const wishlistApi = {
  getWishlist:        ()          => apiClient.get('/wishlist'),
  addToWishlist:      (productId) => apiClient.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => apiClient.delete(`/wishlist/${productId}`),
};
