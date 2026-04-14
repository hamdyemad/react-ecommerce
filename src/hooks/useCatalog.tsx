import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { areaService, categoryService } from '../services';
import type { Country, Category } from '../types/api';
import { useDirection } from './useDirection';

interface CatalogContextValue {
  countries: Country[];
  categories: Category[];
  loadingCountries: boolean;
  loadingCategories: boolean;
  error: string | null;
  refreshCountries: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useDirection();

  const fetchCatalogData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingCountries(true);
      setLoadingCategories(true);
      setError(null);

      const [countriesRes, categoriesRes] = await Promise.all([
        areaService.getCountries(signal),
        categoryService.getAll({ page: 1, per_page: 10, paginated: 'ok' }, signal)
      ]);

      if (signal?.aborted) return;

      setCountries(countriesRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
      console.error('Catalog Fetch Error:', err);
      setError(err.message || 'Failed to fetch catalog data');
    } finally {
      setLoadingCountries(false);
      setLoadingCategories(false);
    }
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalogData(controller.signal);
    return () => controller.abort();
  }, [fetchCatalogData]);

  return (
    <CatalogContext.Provider
      value={{
        countries,
        categories,
        loadingCountries,
        loadingCategories,
        error,
        refreshCountries: fetchCatalogData,
        refreshCategories: fetchCatalogData,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
