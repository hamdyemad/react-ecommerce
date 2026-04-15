export const is3DFile = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.obj') || cleanUrl.endsWith('.glb');
};

export const prepare3DUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already an absolute URL starting with http, leave it alone unless specifically handling local proxy
  if (url.startsWith('http')) {
    // In local development, we might want to proxy /storage to avoid CORS
    if (import.meta.env.DEV && url.includes('/storage')) {
      const parts = url.split('/storage');
      return '/storage' + parts[1];
    }
    return url;
  }

  // Handle case where URL might already be relative but missing backend domain in production
  if (url.startsWith('/storage')) {
    if (import.meta.env.DEV) {
      return url; // Local proxy handles it
    }
    // Production: We need the backend domain for storage. 
    // Usually stored as VITE_API_URL or a separate VITE_STORAGE_URL
    const baseUrl = import.meta.env.VITE_API_URL || 'https://ecommerce.elghad.tech/api';
    const domain = baseUrl.split('/api')[0];
    return `${domain}${url}`;
  }

  return url;
};
