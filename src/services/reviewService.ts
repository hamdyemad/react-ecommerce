import { api } from '../api/client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { Review } from '../types/review';

export const reviewService = {
  postReview: async (reviewableType: string, reviewableId: number | string, data: { review: string; star: number }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/${reviewableType}/${reviewableId}/reviews`, data);
    return response.data;
  },

  getReviews: async (reviewableType: 'products' | 'vendors', reviewableId: number | string, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Review>> => {
    const response = await api.get(`/${reviewableType}/${reviewableId}/reviews`, {
      params: { ...params, paginated: 'ok' }
    });
    return response.data;
  },

  getMyReviews: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  }
};
