import { api } from '../api/client';
import type { Department, PaginatedResponse, ApiResponse } from '../types/api';

export const departmentService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Department>> => {
    const response = await api.get('/departments', { 
      params: { ...params, paginated: 'ok' } 
    });
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<Department>> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  }
};
