import { api } from '../api/client';
import type { Product, ProductDetail, PaginatedResponse, ApiResponse } from '../types/api';

export const productService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { 
      params: { ...params, paginated: 'ok' } 
    });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<ProductDetail>> => {
    const response = await api.get(`/products/product-by-slug/${slug}`);
    return response.data;
  },

  getById: async (id: number | string): Promise<ApiResponse<ProductDetail>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (category: string, params?: any): Promise<PaginatedResponse<Product>> => {
    const response = await api.get(`/products`, { 
      params: { ...params, category, paginated: 'ok' } 
    });
    return response.data;
  },

  getFeatured: async (params?: any): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products/featured', {
      params: { ...params, paginated: 'ok' }
    });
    return response.data;
  }
};

