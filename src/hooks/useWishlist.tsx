import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './useAuth';
import type { WishlistItem } from '../types';
import { toast } from 'react-hot-toast';

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async (signal?: AbortSignal) => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const response = await wishlistService.getWishlist(1, signal);
      if (signal?.aborted) return;
      if (response.status) {
        setWishlist(response.data);
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
    const controller = new AbortController();
    fetchWishlist(controller.signal);
    return () => controller.abort();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      return;
    }

    const isAdded = isInWishlist(productId);

    try {
      const response = isAdded 
        ? await wishlistService.removeFromWishlist(productId)
        : await wishlistService.addToWishlist(productId);
        
      if (response.status) {
        toast.success(response.message);
        // Refresh wishlist after change
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
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await wishlistService.clearWishlist();
      if (response.status) {
        toast.success(response.message);
        setWishlist([]);
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
