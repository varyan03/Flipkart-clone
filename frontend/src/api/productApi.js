import apiClient from './apiClient';

/**
 * API service for product-related requests.
 */
export const productApi = {
  /** Fetches products with optional sorting and filtering */
  getProducts: (params) => apiClient.get('/products', { params }),
  
  /** Retrieves a single product by its unique ID */
  getProductById: (id) => apiClient.get(`/products/${id}`),
  
  /** Fetches all available product categories */
  getCategories: () => apiClient.get('/categories')
};
