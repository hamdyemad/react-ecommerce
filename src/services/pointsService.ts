import { api } from '../api/client';
import type { ApiResponse } from '../types/api';
import type { PointsSummary, PointsSettings, PointsTransactionsResponse } from '../types/points';

export const pointsService = {
  getMyPoints: async (): Promise<ApiResponse<PointsSummary>> => {
    const response = await api.get('/points/my-points');
    return response.data;
  },

  getSettings: async (): Promise<ApiResponse<PointsSettings>> => {
    const response = await api.get('/points/settings');
    return response.data;
  },

  getTransactions: async (page: number = 1): Promise<ApiResponse<PointsTransactionsResponse>> => {
    const response = await api.get(`/points/transactions?page=${page}`);
    return response.data;
  }
};
