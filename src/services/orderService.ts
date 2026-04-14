import { api } from '../api/client';

export interface OrderCheckoutRequest {
  is_guest: boolean;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_country_id?: string;
  guest_city_id?: string;
  payment_method?: string;
  products: Array<{
    vendor_product_id: string | number;
    vendor_product_variant_id: string | number | null;
    quantity: number;
    type: 'product';
  }>;
}

export interface OrderCheckoutResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_price: number;
    shipping: number;
    created_at: string;
    // ... other fields if needed
  };
}

export const orderService = {
  checkout: async (data: OrderCheckoutRequest): Promise<OrderCheckoutResponse> => {
    const response = await api.post<OrderCheckoutResponse>('/orders/checkout', data);
    return response.data;
  },
  trackOrder: async (reference: string): Promise<any> => {
    const response = await api.get(`/orders/track/${reference}`);
    return response.data;
  },
  getOrder: async (orderId: string | number): Promise<any> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  checkPromoCode: async (code: string): Promise<any> => {
    const response = await api.post('/promocode/check', { code });
    return response.data;
  },
};
