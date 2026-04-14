import { api } from '../api/client';
import type { ApiResponse } from '../types/api';

export interface CartBulkItem {
  vendor_product_id: number;
  vendor_product_variant_id: number | null;
  quantity: number;
  type: 'product' | 'bundle';
  bundle_id?: number;
}

export interface CartBulkRequest {
  items: CartBulkItem[];
}

export const cartService = {
  getCart: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/cart');
    return response.data;
  },

  getCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get('/cart/count');
    return response.data;
  },

  addBulk: async (data: CartBulkRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/cart/add-bulk', data);
    return response.data;
  },

  updateQuantity: async (itemId: number, quantity: number): Promise<ApiResponse<any>> => {
    // Note: If the API uses /cart/update/{itemId} or similar, update here
    const response = await api.post(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  removeItem: async (itemId: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clear: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/cart/clear');
    return response.data;
  }
};
