import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

class ApiClient {
  private static instance: AxiosInstance;

  public static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: API_URL,
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Request Interceptor
      ApiClient.instance.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('auth_token');
          const lang = localStorage.getItem('ecommerce-ds-language') || 'en';
          const country = localStorage.getItem('ecommerce-ds-country') || 'eg';

          if (config.headers) {
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            config.headers['lang'] = lang;
            config.headers['X-Country-Code'] = country;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response Interceptor
      ApiClient.instance.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            // Handle Unauthorized - e.g., redirect to login
            localStorage.removeItem('auth_token');
            // window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    }

    return ApiClient.instance;
  }
}

export const api = ApiClient.getInstance();
