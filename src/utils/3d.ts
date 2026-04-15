export const is3DFile = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.obj') || cleanUrl.endsWith('.glb');
};

export const prepare3DUrl = (url: string): string => {
  if (!url) return '';
  // Force relative path for anything in /storage to hit Vite Proxy and bypass CORS
  if (url.includes('/storage')) {
    const parts = url.split('/storage');
    const relative = '/storage' + parts[1];
    return relative;
  }
  return url;
};
