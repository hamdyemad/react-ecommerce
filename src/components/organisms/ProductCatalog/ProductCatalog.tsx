import { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { useDirection } from '../../../hooks/useDirection';
import { useDebounce } from '../../../hooks/useDebounce';
import { tokens } from '../../../tokens';
import { Select } from '../../atoms/Select/Select';
import { RangeSlider } from '../../atoms/RangeSlider';
import { ProductCard } from '../../molecules/ProductCard';
import { productService, categoryService, brandService, departmentService } from '../../../services';
import type { Product, PaginatedResponse, Category, Brand, Department } from '../../../types/api';

interface ProductFilters {
  search: string;
  category_id: string;
  subcategory_id: string;
  brand_id: string;
  department_id: string;
  min_price: string;
  max_price: string;
  sort_by: string;
  sort_type: string;
  per_page: number;
  vendor_id?: string | number;
  has_discount?: boolean;
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'newest' },
  { value: 'name', label: 'name' },
  { value: 'price', label: 'price' },
  { value: 'rating', label: 'rating' },
  { value: 'views', label: 'mostViewed' },
  { value: 'sale', label: 'bestSelling' },
];

interface ProductCatalogProps {
  initialFilters?: Partial<ProductFilters>;
  title?: string;
  description?: string;
  hideBrandFilter?: boolean;
  hideCategoryFilter?: boolean;
  hideDepartmentFilter?: boolean;
  hideAddToCart?: boolean;
  onAddToCart?: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function ProductCatalog({ 
  initialFilters = {}, 
  title, 
  description,
  hideBrandFilter = false,
  hideCategoryFilter = false,
  hideDepartmentFilter = false,
  hideAddToCart = false,
  onAddToCart,
  onToggleWishlist,
  wishlistItems
}: ProductCatalogProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const isRtl = direction === 'rtl';

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const loaderRef = useRef<HTMLDivElement>(null);

  const defaultFilters: ProductFilters = {
    search: '',
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    department_id: '',
    min_price: '',
    max_price: '',
    sort_by: 'created_at',
    sort_type: 'desc',
    per_page: 12,
    has_discount: false,
  };

  const [filters, setFilters] = useState<ProductFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  // Local state for expensive/typing filters - initialize from filters (which now includes initialFilters)
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    Number(filters.min_price) || 0,
    Number(filters.max_price) || 10000
  ]);
  // Track whether the user has interacted with the price slider
  const priceChangedRef = useRef(false);

  const debouncedSearch = useDebounce(localSearch, 500);
  const debouncedPrice = useDebounce(localPriceRange, 500);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsPage, setCatsPage] = useState(1);
  const [catsHasMore, setCatsHasMore] = useState(false);
  const [loadingMoreCats, setLoadingMoreCats] = useState(false);

  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [subcatsPage, setSubcatsPage] = useState(1);
  const [subcatsHasMore, setSubcatsHasMore] = useState(false);
  const [loadingMoreSubcats, setLoadingMoreSubcats] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandsPage, setBrandsPage] = useState(1);
  const [brandsHasMore, setBrandsHasMore] = useState(false);
  const [loadingMoreBrands, setLoadingMoreBrands] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [deptsPage, setDeptsPage] = useState(1);
  const [deptsHasMore, setDeptsHasMore] = useState(false);
  const [loadingMoreDepts, setLoadingMoreDepts] = useState(false);

  const deptsScrollRef = useRef<HTMLDivElement>(null);
  const catsScrollRef = useRef<HTMLDivElement>(null);
  const subcatsScrollRef = useRef<HTMLDivElement>(null);
  const brandsScrollRef = useRef<HTMLDivElement>(null);
  const hasUserScrolledRef = useRef(false);

  // Synchronize local states with debounced values
  useEffect(() => {
    setFilters(prev => {
      const newSearch = debouncedSearch;
      // Only apply price filters if user has actually interacted with the slider
      const newMin = priceChangedRef.current ? String(debouncedPrice[0]) : prev.min_price;
      const newMax = priceChangedRef.current ? String(debouncedPrice[1]) : prev.max_price;

      // Only update if values actually changed
      if (prev.search === newSearch && prev.min_price === newMin && prev.max_price === newMax) {
        return prev;
      }
      return { ...prev, search: newSearch, min_price: newMin, max_price: newMax };
    });
  }, [debouncedSearch, debouncedPrice]);

  // Sync with prop changes (e.g. from header search)
  useEffect(() => {
    if (initialFilters.search !== undefined && initialFilters.search !== filters.search) {
      setLocalSearch(initialFilters.search);
      setFilters(prev => ({ ...prev, search: initialFilters.search || '' }));
    }
  }, [initialFilters.search]);

  const fetchSidebarData = useCallback(async () => {
    try {
      setLoadingDepts(true);
      setLoadingBrands(!hideBrandFilter);

      const PER = 10;
      const promises: any[] = [
        departmentService.getAll({ page: 1, per_page: PER, paginated: 'ok' }),
      ];
      if (!hideBrandFilter) {
        promises.push(brandService.getAll({ page: 1, per_page: PER, paginated: 'ok' }));
      }

      const results = await Promise.all(promises);

      const deptRes = results[0];
      setDepartments(deptRes.data || []);
      setDeptsHasMore(deptRes.pagination?.current_page < deptRes.pagination?.last_page);
      setDeptsPage(1);

      if (!hideBrandFilter && results[1]) {
        const brandRes = results[1];
        setBrands(brandRes.data || []);
        setBrandsHasMore(brandRes.pagination?.current_page < brandRes.pagination?.last_page);
        setBrandsPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch catalog sidebar data:', err);
    } finally {
      setLoadingDepts(false);
      setLoadingBrands(false);
    }
  }, [hideBrandFilter]);

  // Fetch categories only when a department is selected
  useEffect(() => {
    if (!filters.department_id) {
      // No department selected → clear categories
      setCategories([]);
      setCatsPage(1);
      setCatsHasMore(false);
      setLoadingCats(false);
      return;
    }
    const fetchCats = async () => {
      setLoadingCats(true);
      setCategories([]);
      setCatsPage(1);
      try {
        const res = await categoryService.getAll({ department_id: filters.department_id, page: 1, per_page: 10, paginated: 'ok' });
        setCategories(res.data || []);
        setCatsHasMore(res.pagination?.current_page < res.pagination?.last_page);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    if (!hideCategoryFilter) fetchCats();
  }, [filters.department_id, hideCategoryFilter]);

  // Fetch subcategories when category_id changes
  useEffect(() => {
    if (!filters.category_id) {
      setSubcategories([]);
      setSubcatsPage(1);
      setSubcatsHasMore(false);
      return;
    }
    const fetchSubs = async () => {
      setLoadingSubcats(true);
      setSubcategories([]);
      try {
        const res = await categoryService.getSubcategories({ category_id: filters.category_id, page: 1, per_page: 10 });
        setSubcategories(res.data || []);
        setSubcatsHasMore(res.pagination?.current_page < res.pagination?.last_page);
        setSubcatsPage(1);
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
      } finally {
        setLoadingSubcats(false);
      }
    };
    fetchSubs();
  }, [filters.category_id]);

  const loadMoreDepts = useCallback(async () => {
    if (loadingMoreDepts || !deptsHasMore) return;
    setLoadingMoreDepts(true);
    try {
      const next = deptsPage + 1;
      const res = await departmentService.getAll({ page: next, per_page: 10, paginated: 'ok' });
      setDepartments(prev => [...prev, ...(res.data || [])]);
      setDeptsHasMore(res.pagination?.current_page < res.pagination?.last_page);
      setDeptsPage(next);
    } catch {} finally {
      setLoadingMoreDepts(false);
    }
  }, [loadingMoreDepts, deptsHasMore, deptsPage]);

  const loadMoreCats = useCallback(async () => {
    if (loadingMoreCats || !catsHasMore) return;
    setLoadingMoreCats(true);
    try {
      const next = catsPage + 1;
      const params: any = { page: next, per_page: 10, paginated: 'ok' };
      if (filters.department_id) params.department_id = filters.department_id;
      const res = await categoryService.getAll(params);
      setCategories(prev => [...prev, ...(res.data || [])]);
      setCatsHasMore(res.pagination?.current_page < res.pagination?.last_page);
      setCatsPage(next);
    } catch {} finally {
      setLoadingMoreCats(false);
    }
  }, [loadingMoreCats, catsHasMore, catsPage, filters.department_id]);

  const loadMoreSubcats = useCallback(async () => {
    if (loadingMoreSubcats || !subcatsHasMore || !filters.category_id) return;
    setLoadingMoreSubcats(true);
    try {
      const next = subcatsPage + 1;
      const res = await categoryService.getSubcategories({ category_id: filters.category_id, page: next, per_page: 10 });
      setSubcategories(prev => [...prev, ...(res.data || [])]);
      setSubcatsHasMore(res.pagination?.current_page < res.pagination?.last_page);
      setSubcatsPage(next);
    } catch {} finally {
      setLoadingMoreSubcats(false);
    }
  }, [loadingMoreSubcats, subcatsHasMore, subcatsPage, filters.category_id]);

  const loadMoreBrands = useCallback(async () => {
    if (loadingMoreBrands || !brandsHasMore) return;
    setLoadingMoreBrands(true);
    try {
      const next = brandsPage + 1;
      const res = await brandService.getAll({ page: next, per_page: 10, paginated: 'ok' });
      setBrands(prev => [...prev, ...(res.data || [])]);
      setBrandsHasMore(res.pagination?.current_page < res.pagination?.last_page);
      setBrandsPage(next);
    } catch {} finally {
      setLoadingMoreBrands(false);
    }
  }, [loadingMoreBrands, brandsHasMore, brandsPage]);

  // Scroll listeners for sidebar sections
  useEffect(() => {
    const el = deptsScrollRef.current;
    if (!el) return;
    const onScroll = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreDepts(); };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMoreDepts]);

  useEffect(() => {
    const el = catsScrollRef.current;
    if (!el) return;
    const onScroll = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreCats(); };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMoreCats]);

  useEffect(() => {
    const el = subcatsScrollRef.current;
    if (!el) return;
    const onScroll = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreSubcats(); };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMoreSubcats]);

  useEffect(() => {
    const el = brandsScrollRef.current;
    if (!el) return;
    const onScroll = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreBrands(); };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMoreBrands]);

  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params: any = { ...filters, page, paginated: 'ok' };
      // Don't send empty price params to the API
      if (!params.min_price) delete params.min_price;
      if (!params.max_price) delete params.max_price;
      const response: PaginatedResponse<Product> = await productService.getAll(params);
      
      if (append) {
        setProductsList(prev => [...prev, ...(response.data || [])]);
      } else {
        setProductsList(response.data || []);
      }

      setHasMore(response.pagination.current_page < response.pagination.last_page);
      setTotalProducts(response.pagination.total);
    } catch (err) {
      console.error('Failed to fetch products in catalog:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  // Reset and fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1, false);
  }, [filters, fetchProducts]);

  // Handle intersection for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && hasUserScrolledRef.current) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchProducts(nextPage, true);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, currentPage, fetchProducts]);

  // Track user scroll to enable infinite scroll only after manual scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        hasUserScrolledRef.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateFilter = (key: keyof ProductFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setLocalPriceRange([0, 10000]);
    priceChangedRef.current = false;
    setFilters({
      search: '',
      category_id: '',
      subcategory_id: '',
      brand_id: initialFilters.brand_id || '',
      department_id: '',
      min_price: '',
      max_price: '',
      sort_by: 'created_at',
      sort_type: 'desc',
      per_page: 12,
    });
  };

  const hasActiveFilters = filters.search || filters.category_id || (filters.brand_id && !initialFilters.brand_id) || filters.department_id || filters.min_price || filters.max_price || (filters.has_discount && !initialFilters.has_discount);

  // These are now handled in local state: productsList and totalProducts

  const sidebarContent = (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl p-5 border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: tokens.colors[mode].text.primary }}>
          🔍 {t('common:search')}
        </h3>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('common:searchProducts')}
          className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ background: tokens.colors[mode].surface.elevated, color: tokens.colors[mode].text.primary, borderColor: tokens.colors[mode].border.DEFAULT }}
        />
      </div>

      {/* Price Filter */}
      <div className="rounded-2xl p-5 border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: tokens.colors[mode].text.primary }}>
          💰 {t('common:priceFilter')}
        </h3>
        <div className="space-y-6 px-1 py-4">
          <RangeSlider
            min={0}
            max={10000}
            step={50}
            minDistance={50}
            value={localPriceRange}
            onChange={(val) => { priceChangedRef.current = true; setLocalPriceRange(val as [number, number]); }}
          />
          <div className="flex items-center gap-3 text-xs font-black">
            <div className="flex-1">
              <input
                type="number"
                value={localPriceRange[0]}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  priceChangedRef.current = true;
                  setLocalPriceRange([val, localPriceRange[1]]);
                }}
                placeholder={t('common:min', 'Min')}
                className="w-full px-2 py-2 rounded-xl border text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                style={{ 
                  background: tokens.colors[mode].surface.elevated, 
                  color: tokens.colors[mode].text.primary, 
                  borderColor: tokens.colors[mode].border.DEFAULT 
                }}
              />
            </div>
            <span style={{ color: tokens.colors[mode].text.secondary }}>-</span>
            <div className="flex-1">
              <input
                type="number"
                value={localPriceRange[1]}
                onChange={(e) => {
                  const val = Math.max(localPriceRange[0], Number(e.target.value));
                  priceChangedRef.current = true;
                  setLocalPriceRange([localPriceRange[0], val]);
                }}
                placeholder={t('common:max', 'Max')}
                className="w-full px-2 py-2 rounded-xl border text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                style={{ 
                  background: tokens.colors[mode].surface.elevated, 
                  color: tokens.colors[mode].text.primary, 
                  borderColor: tokens.colors[mode].border.DEFAULT 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      {!hideDepartmentFilter && (
        <div className="rounded-2xl p-5 border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: tokens.colors[mode].text.primary }}>
            📦 {t('common:departments')}
          </h3>
          {loadingDepts ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div ref={deptsScrollRef} className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => {
                    const newVal = filters.department_id === String(dept.id) ? '' : String(dept.id);
                    // Clear category and subcategory when department changes
                    setFilters(prev => ({ ...prev, department_id: newVal, category_id: '', subcategory_id: '' }));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-start"
                  style={{
                    background: filters.department_id === String(dept.id) ? `${tokens.colors[mode].primary.DEFAULT}15` : 'transparent',
                    color: filters.department_id === String(dept.id) ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].text.secondary,
                  }}
                >
                  {dept.icon && <img src={dept.icon} alt="" className="w-5 h-5 object-contain" />}
                  <span className="flex-1 truncate">{dept.name}</span>
                </button>
              ))}
              {loadingMoreDepts && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Categories - only shown when a department is selected */}
      {!hideCategoryFilter && !!filters.department_id && (
        <div className="rounded-2xl p-5 border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: tokens.colors[mode].text.primary }}>
            🗂️ {t('common:categories')}
          </h3>
          {loadingCats ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div ref={catsScrollRef} className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const newVal = filters.category_id === cat.slug ? '' : cat.slug;
                    // Clear subcategory when category changes
                    setFilters(prev => ({ ...prev, category_id: newVal, subcategory_id: '' }));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-start"
                  style={{
                    background: filters.category_id === cat.slug ? `${tokens.colors[mode].primary.DEFAULT}15` : 'transparent',
                    color: filters.category_id === cat.slug ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].text.secondary,
                  }}
                >
                  {cat.image && <img src={cat.image} alt="" className="w-5 h-5 rounded object-cover" />}
                  <span className="flex-1 truncate">{cat.name}</span>
                </button>
              ))}
              {loadingMoreCats && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub Categories - shown only when a category is selected */}
      {!hideCategoryFilter && filters.category_id && (
        <div className="rounded-2xl p-5 border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: tokens.colors[mode].text.primary }}>
            🔖 {t('common:subcategories', 'Sub Categories')}
          </h3>
          {loadingSubcats ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <p className="text-sm font-bold opacity-50 py-2" style={{ color: tokens.colors[mode].text.secondary }}>
              {t('common:noSubcategories', 'No subcategories found')}
            </p>
          ) : (
            <div ref={subcatsScrollRef} className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => updateFilter('subcategory_id', filters.subcategory_id === sub.slug ? '' : sub.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-start"
                  style={{
                    background: filters.subcategory_id === sub.slug ? `${tokens.colors[mode].primary.DEFAULT}15` : 'transparent',
                    color: filters.subcategory_id === sub.slug ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].text.secondary,
                  }}
                >
                  {sub.image && <img src={sub.image} alt="" className="w-5 h-5 rounded object-cover" />}
                  <span className="flex-1 truncate">{sub.name}</span>
                </button>
              ))}
              {loadingMoreSubcats && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Brands (Optional) */}
      {!hideBrandFilter && (
        <div className="rounded-2xl p-5 border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: tokens.colors[mode].text.primary }}>
            🏷️ {t('common:brands')}
          </h3>
          {loadingBrands ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div ref={brandsScrollRef} className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilter('brand_id', filters.brand_id === b.slug ? '' : b.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-start"
                  style={{
                    background: filters.brand_id === b.slug ? `${tokens.colors[mode].primary.DEFAULT}15` : 'transparent',
                    color: filters.brand_id === b.slug ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].text.secondary,
                  }}
                >
                  {b.logo && <img src={b.logo} alt="" className="w-5 h-5 rounded object-contain bg-white" />}
                  <span className="flex-1 truncate">{b.name}</span>
                </button>
              ))}
              {loadingMoreBrands && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {hasActiveFilters && (
        <button onClick={clearAllFilters} className="w-full py-3 rounded-xl font-black text-sm border-2 border-error/30 text-error hover:bg-error/10">
          ✕ {t('common:clearAllFilters')}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex gap-8">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        {sidebarContent}
      </aside>

      {/* Main Area */}
      <div className="flex-1 min-w-0">
        <div className="mb-8 sm:mb-12 relative">
          {title && (
            <div className="flex items-center gap-4 mb-3">
              <div className="w-2 h-10 rounded-full bg-primary" />
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: tokens.colors[mode].text.primary }}>
                {title}
              </h1>
            </div>
          )}
          {description && (
            <p className="text-lg font-bold opacity-60 max-w-2xl mb-4" style={{ color: tokens.colors[mode].text.secondary }}>
              {description}
            </p>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-black uppercase tracking-widest opacity-80" style={{ color: tokens.colors[mode].text.primary }}>
              {totalProducts} {t('common:products')} {t('common:available')}
            </p>
          </div>
        </div>

        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl border" style={{ background: tokens.colors[mode].surface.base, borderColor: tokens.colors[mode].border.DEFAULT }}>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Select
              name="sort"
              value={filters.sort_by}
              onChange={(e) => updateFilter('sort_by', e.target.value)}
              options={SORT_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(`common:sort_${opt.label}`, opt.label),
              }))}
              className="w-32 sm:w-48"
            />
            <button 
              onClick={() => updateFilter('sort_type', filters.sort_type === 'asc' ? 'desc' : 'asc')} 
              className="px-4 py-2 sm:py-2.5 rounded-xl border transition-all flex-shrink-0 flex items-center gap-2 group" 
              style={{ 
                background: tokens.colors[mode].surface.elevated, 
                color: tokens.colors[mode].text.primary, 
                borderColor: tokens.colors[mode].border.DEFAULT 
              }}
            >
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden xs:inline-block">
                {filters.sort_type === 'asc' ? t('common:ascending') : t('common:descending')}
              </span>
              <span className="text-lg leading-none transition-transform group-active:scale-90">
                {filters.sort_type === 'asc' ? '↑' : '↓'}
              </span>
            </button>
          </div>
          <button 
            onClick={() => setShowMobileFilters(true)} 
            className="lg:hidden px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-white flex-shrink-0 flex items-center gap-1.5" 
            style={{ background: tokens.gradients.primary }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('common:filters')}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[450px] bg-slate-100 dark:bg-slate-800 rounded-[35px] animate-pulse overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
              </div>
            ))}
          </div>
        ) : productsList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-6 sm:mb-10">
              {productsList.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  image={product.image}
                  name={product.name}
                  real_price={product.real_price}
                  fake_price={product.fake_price || undefined}
                  review_avg_star={product.review_avg_star}
                  reviews_count={product.reviews_count}
                  discount={product.discount}
                  points={product.points}
                  vendor={product.vendor}
                  brand={product.brand}
                  department={product.department}
                  category={product.category}
                  sub_category={product.sub_category}
                  remaining_stock={product.remaining_stock}
                  onAddToCart={onAddToCart as any}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={wishlistItems.includes(product.id)}
                  showAddToCart={!hideAddToCart}
                />
              ))}
            </div>

            {/* Infinite Scroll Loader Sentinel */}
            <div ref={loaderRef} className="py-4 flex justify-center w-full">
              {hasMore && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-black opacity-50 uppercase tracking-widest">{t('common:loadingMore', 'Loading more products...')}</p>
                </div>
              )}
              {!hasMore && productsList.length > 0 && (
                <div className="py-2 text-center w-full opacity-40">
                  <div className="h-px bg-current w-1/4 mx-auto mb-3" />
                  <p className="font-black text-[10px] sm:text-xs uppercase tracking-widest">{t('common:allProductsLoaded', 'You have reached the end')}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-black mb-2" style={{ color: tokens.colors[mode].text.primary }}>{t('common:noProductsFound')}</h3>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay - rendered via portal for proper z-index */}
      {showMobileFilters && ReactDOM.createPortal(
        <>
          <div 
            className="lg:hidden fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" 
            style={{ animation: 'fadeIn 0.3s ease-out' }}
            onClick={() => setShowMobileFilters(false)} 
          />
          <div 
            className={`lg:hidden fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-[85vw] max-w-sm z-[9999] overflow-y-auto p-6`} 
            style={{ 
              background: tokens.colors[mode].background.base,
              boxShadow: isRtl ? '-10px 0 40px rgba(0,0,0,0.3)' : '10px 0 40px rgba(0,0,0,0.3)',
              animation: isRtl ? 'slideInRight 0.3s ease-out' : 'slideInLeft 0.3s ease-out'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                <span className="mr-2">🔍</span>{t('common:filters')}
              </h2>
              <button 
                onClick={() => setShowMobileFilters(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: tokens.colors[mode].surface.elevated, color: tokens.colors[mode].text.primary }}
              >
                ✕
              </button>
            </div>
            {sidebarContent}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
