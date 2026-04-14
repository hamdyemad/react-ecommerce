import { api } from '../api/client';
import type { ApiResponse } from '../types/common';
import type { Slider } from '../types/slider';

export const sliderService = {
  getAll: async (): Promise<ApiResponse<Slider[]>> => {
    const response = await api.get<ApiResponse<Slider[]>>('/sliders');
    return response.data;
  },
};
