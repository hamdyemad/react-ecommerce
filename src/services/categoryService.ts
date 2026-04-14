import { api } from '../api/client';
import type { Category, ApiResponse, PaginatedResponse } from '../types/api';

export const categoryService = {
  getAll: async (params?: any, signal?: AbortSignal): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/categories', { 
      params: { ...params, paginated: 'ok' },
      signal
    });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`, { signal });
    return response.data;
  },
  
  getSubcategories: async (params?: any, signal?: AbortSignal): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/subcategories', { 
      params: { ...params, paginated: 'ok' },
      signal
    });
    return response.data;
  },
  
  getSubcategoryBySlug: async (slug: string, signal?: AbortSignal): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/subcategories/${slug}`, { signal });
    return response.data;
  }
};
