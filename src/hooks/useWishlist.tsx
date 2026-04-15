import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './useAuth';
import type { WishlistItem, ProductListItem } from '../types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggleWishlist: (product: ProductListItem | number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_WISHLIST_KEY = 'ecommerce-ds-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load from local storage on initial mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse local wishlist');
      }
    }
  }, []);

  const fetchWishlist = useCallback(async (signal?: AbortSignal) => {
    // Only fetch from API if authenticated
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await wishlistService.getWishlist(1, signal);
      if (signal?.aborted) return;
      if (response.status) {
        const remoteData = response.data || [];
        setWishlist(remoteData);
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(remoteData));
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error('Failed to fetch wishlist', error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const controller = new AbortController();
      fetchWishlist(controller.signal);
      return () => controller.abort();
    }
  }, [fetchWishlist, isAuthenticated]);

  const { t } = useTranslation();

  const toggleWishlist = async (productData: ProductListItem | number) => {
    const productId = typeof productData === 'number' ? productData : productData.id;
    const isAdded = isInWishlist(productId);

    // Guest Mode: Store full details if provided
    if (!isAuthenticated) {
      let newWishlist;
      if (isAdded) {
        newWishlist = wishlist.filter(item => Number(item.id) !== Number(productId));
        toast.success(t('common:removedFromWishlist', 'Removed from wishlist'));
      } else {
        const newItem = (typeof productData === 'object' 
          ? { ...productData as WishlistItem, wishlist_id: Date.now() }
          : { 
              id: productId, 
              wishlist_id: Date.now(),
              name: 'Product', 
              image: '', 
              real_price: 0,
              slug: String(productId),
              review_avg_star: 0,
              reviews_count: 0,
              remaining_stock: 1
            }) as WishlistItem;
        newWishlist = [...wishlist, newItem];
        toast.success(t('common:addedToWishlist', 'Added to wishlist'));
      }
      setWishlist(newWishlist);
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(newWishlist));
      return;
    }

    // Authenticated path
    try {
      const response = isAdded 
        ? await wishlistService.removeFromWishlist(productId)
        : await wishlistService.addToWishlist(productId);
        
      if (response.status) {
        toast.success(response.message);
        await fetchWishlist();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error(error);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some((item) => Number(item.id) === Number(productId) || (item as any).product_id === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      localStorage.removeItem(LOCAL_WISHLIST_KEY);
      toast.success('Wishlist cleared');
      return;
    }
    
    setLoading(true);
    try {
      const response = await wishlistService.clearWishlist();
      if (response.status) {
        toast.success(response.message);
        setWishlist([]);
        localStorage.removeItem(LOCAL_WISHLIST_KEY);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to clear wishlist');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
