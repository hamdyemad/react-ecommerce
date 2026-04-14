import { api } from '../api/client';

export interface ShippingCalculateResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: {
    shipping_cost: number;
    breakdown: Array<{
      type: string;
      type_id: number;
      type_name: string;
      city_id: string;
      city_name: string;
      shipping_id: number;
      shipping_name: string;
      cost: number;
      items_count: number;
      cost_per_product: number;
    }>;
    address: {
      id: number | null;
      title: string | null;
      city_id: string;
      city_name: string;
    };
  };
}

export const shippingService = {
  calculate: async (cityId: number | string): Promise<ShippingCalculateResponse> => {
    const response = await api.post<ShippingCalculateResponse>('/shipping/calculate', { city_id: cityId });
    return response.data;
  },
};
