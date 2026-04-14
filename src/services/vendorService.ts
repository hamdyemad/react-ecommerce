import { api } from '../api/client';
import type { ApiResponse } from '../types/api';

export const vendorService = {
  getBySlug: async (slug: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/vendors/${slug}`);
    return response.data;
  }
};
