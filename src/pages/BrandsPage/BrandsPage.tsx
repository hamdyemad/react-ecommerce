import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { Link } from 'react-router-dom';
import { Carousel } from '../../components/molecules/Carousel/Carousel';
import { brandService } from '../../services';
import type { Brand } from '../../types/api';
import { SEO } from '../../components/atoms/SEO';

export function BrandsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const itemsPerSlide = isMobile ? 4 : 8;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBrands = async (pageNum: number, append: boolean = false, currentSearch: string = searchTerm) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const response = await brandService.getAll({ 
        page: pageNum, 
        per_page: 12,
        paginated: 'ok',
        search: currentSearch || undefined
      });
      
      const newItems = response.data || [];
      if (append) {
        setBrands(prev => [...prev, ...newItems]);
      } else {
        setBrands(newItems);
      }
      
      setHasMore(response.pagination?.current_page < response.pagination?.last_page);
    } catch (err: any) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBrands(1, false, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEndReached = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBrands(nextPage, true);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-[1440px] mx-auto">
      <SEO title={t('common:brands', 'Brands')} />
      <BreadCrumb 
        items={[
          { label: t('common:home', 'Home'), path: '/' },
          { label: t('common:brands', 'Brands'), path: '/brands' }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mt-4 mb-6 relative py-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-500 cursor-default">🏷️</div>
        <h1 
          className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {t('common:exploreBrands', 'Explore Our Brands')}
        </h1>
        <p 
          className="text-lg md:text-xl max-w-2xl mx-auto font-bold opacity-60"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('common:browseBrandsDesc', 'Shop from the world most trusted and popular labels.')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-12 px-4 sm:px-10">
        <div className="relative w-full md:max-w-2xl group">
          <input 
            type="text"
            placeholder={t('common:searchBrands', 'Search brands...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-8 rounded-[25px] border transition-all duration-300 outline-none focus:ring-4 focus:ring-primary/10 text-lg sm:text-xl font-bold"
            style={{
              background: tokens.colors[mode].surface.base,
              borderColor: tokens.colors[mode].border.DEFAULT,
              color: tokens.colors[mode].text.primary,
            }}
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl opacity-40 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all duration-300">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 px-4 shadow-sm">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="h-64 sm:h-80 rounded-[40px] animate-pulse"
              style={{ background: mode === 'light' ? '#f1f5f9' : '#1e293b' }}
            />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-24 px-6 rounded-[50px] border border-dashed mb-12" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
          <div className="text-8xl mb-8 grayscale opacity-50">🔎</div>
          <h3 className="text-3xl font-black mb-4" style={{ color: tokens.colors[mode].text.primary }}>{t('common:noResults', 'No Results Found')}</h3>
          <p className="max-w-md mx-auto font-bold opacity-60 text-lg" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('common:searchBrandsNoResultsDesc', "We couldn't find any brands matching your search. Try different keywords.")}
          </p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-10 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest"
          >
            {t('common:clearSearch', 'Clear Search')}
          </button>
        </div>
      ) : (
        <div className="mb-2 relative">
          <Carousel 
            autoPlay={false} 
            showDots={true} 
            peekAmount={0} 
            variant="standalone"
            onEndReached={handleEndReached}
          >
            {(() => {
              const slides = [];
              for (let i = 0; i < brands.length; i += itemsPerSlide) {
                slides.push(brands.slice(i, i + itemsPerSlide));
              }
              return slides.map((slideBrands, idx) => (
                <div key={idx} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 px-4 sm:px-10 py-4 sm:py-8">
                  {slideBrands.map((brand) => (
                    <Link 
                      key={brand.id}
                      to={`/brand/${brand.slug}`}
                      className="group block h-full"
                    >
                      <div 
                        className="rounded-[40px] sm:rounded-[60px] p-8 sm:p-12 h-full transition-all duration-700 hover:scale-[1.05] hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] border flex flex-col items-center justify-center text-center gap-6 sm:gap-10 hover:border-primary/20"
                        style={{
                          background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                          borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                          boxShadow: mode === 'light' ? '0 15px 45px rgba(0,0,0,0.03)' : '0 15px 45px rgba(0,0,0,0.25)'
                        }}
                      >
                        {/* Logo Container with Shadow */}
                        <div 
                          className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-white flex items-center justify-center p-6 sm:p-8 transition-all duration-700 group-hover:scale-110 shadow-xl group-hover:shadow-primary/30 relative overflow-hidden"
                        >
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="w-full h-full object-contain filter group-hover:drop-shadow-lg transition-all duration-700" 
                          />
                        </div>

                        <div className="w-full">
                          <h3 
                            className="text-xl sm:text-3xl font-black mb-3 sm:mb-5 group-hover:text-primary transition-colors duration-500 px-2 line-clamp-2"
                            style={{ color: tokens.colors[mode].text.primary }}
                          >
                            {brand.name}
                          </h3>
                          <div className="flex flex-col items-center gap-2">
                             <div className="flex gap-2">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                                  {brand.products_count} {t('common:products', 'Products')}
                                </span>
                             </div>
                             <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{t('common:officialStore', 'Official Store')}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ));
            })()}
          </Carousel>
          {loadingMore && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[2px] z-[50] rounded-[60px]">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl" />
            </div>
          )}
        </div>
      )}
      
      {/* Decorative background elements */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </div>
  );
}
