import { api } from '../api/client';
import type { ApiResponse } from '../types/api';
import type { Address, AddressCreateData } from '../types/address';

export const addressService = {
  getAddresses: async (params?: { keyword?: string; is_primary?: string }): Promise<ApiResponse<Address[]>> => {
    const response = await api.get('/addresses', { params });
    return response.data;
  },

  getAddress: async (id: number): Promise<ApiResponse<Address>> => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  createAddress: async (data: AddressCreateData): Promise<ApiResponse<Address>> => {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  updateAddress: async (id: number, data: AddressCreateData): Promise<ApiResponse<Address>> => {
    const response = await api.post(`/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  setPrimary: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/addresses/${id}/set-primary`);
    return response.data;
  }
};
