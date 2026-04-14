import apiClient from './apiClient';

export const productApi = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  getCategories: () => apiClient.get('/categories')
};
