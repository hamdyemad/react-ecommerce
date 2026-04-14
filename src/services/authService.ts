import { api } from '../api/client';
import type { ApiResponse } from '../types/api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  image: string;
  lang: string;
  gender: string;
  status: boolean;
  verified: boolean;
  country?: any;
  addresses?: any[];
  created_at: string;
  updated_at: string;
}

export interface TokenInfo {
  token: string;
  expires_at: string;
}

export interface LoginData extends User {
  access_token: TokenInfo;
  refresh_token: TokenInfo;
  fcm_token: string | null;
  device_id: string;
}

export const authService = {
  login: async (credentials: any, signal?: AbortSignal): Promise<ApiResponse<LoginData>> => {
    const response = await api.post('/auth/login', credentials, { signal });
    const result = response.data;
    if (result.status && result.data?.access_token?.token) {
      localStorage.setItem('auth_token', result.data.access_token.token);
    }
    return result;
  },

  register: async (data: any, signal?: AbortSignal): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/register', data, { signal });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (signal?: AbortSignal): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/profile', { signal });
    return response.data;
  },

  updateProfile: async (data: FormData, signal?: AbortSignal): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/update-profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal
    });
    return response.data;
  },

  requestPasswordReset: async (email: string, signal?: AbortSignal): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/request-password-reset', { email }, { signal });
    return response.data;
  },

  verifyResetOtp: async (email: string, otp: string, signal?: AbortSignal): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/verify-reset-otp', { email, otp }, { signal });
    return response.data;
  },

  resetPassword: async (data: any, signal?: AbortSignal): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/reset-password', data, { signal });
    return response.data;
  }
};
