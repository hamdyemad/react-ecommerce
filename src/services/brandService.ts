import { api } from '../api/client';
import type { Brand, PaginatedResponse, ApiResponse } from '../types/api';

export const brandService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Brand>> => {
    const response = await api.get('/brands', { 
      params: { ...params, paginated: 'ok' } 
    });
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<Brand>> => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  }
};
