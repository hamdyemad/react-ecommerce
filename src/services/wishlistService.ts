import { api } from '../api/client';
import type { PaginatedResponse, ApiResponse, WishlistItem } from '../types';

export const wishlistService = {
  /**
   * Get all wishlist items
   * GET /wishlist
   */
  getWishlist: async (page = 1, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<WishlistItem>>('/wishlist', {
      params: { page },
      signal
    });
    return response.data;
  },

  /**
   * Add a product to the wishlist
   * POST /wishlist/add
   */
  addToWishlist: async (productId: number, signal?: AbortSignal) => {
    const response = await api.post<ApiResponse<any>>('/wishlist/add', {
      product_id: productId
    }, { signal });
    return response.data;
  },

  /**
   * Remove a product from the wishlist
   * POST /wishlist/remove
   */
  removeFromWishlist: async (productId: number, signal?: AbortSignal) => {
    const response = await api.post<ApiResponse<any>>('/wishlist/remove', {
      product_id: productId
    }, { signal });
    return response.data;
  },

  /**
   * Clear the wishlist
   * POST /wishlist/clear
   */
  clearWishlist: async (signal?: AbortSignal) => {
    const response = await api.post<ApiResponse<any>>('/wishlist/clear', {}, { signal });
    return response.data;
  },

  /**
   * Get wishlist items count
   * GET /wishlist/count
   */
  getWishlistCount: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<{ count: number }>>('/wishlist/count', { signal });
    return response.data;
  },
};
