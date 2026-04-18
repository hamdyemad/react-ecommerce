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
  
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
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
    <div className="py-8 px-4 sm:px-6 max-w-[1440px] mx-auto">
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
        <div className="relative">
          <Carousel 
            autoPlay={false} 
            showDots={true} 
            peekAmount={10} 
            variant="standalone"
            onEndReached={handleEndReached}
          >
            {(() => {
              const itemsPerSlide = screenSize === 'mobile' ? 1 : screenSize === 'tablet' ? 2 : 4;
              const gridColsClass = screenSize === 'mobile' ? 'grid-cols-1' : screenSize === 'tablet' ? 'grid-cols-2' : 'grid-cols-4';
              const slides = [];
              for (let i = 0; i < brands.length; i += itemsPerSlide) {
                slides.push(brands.slice(i, i + itemsPerSlide));
              }
              return slides.map((slideBrands, idx) => (
                <div key={idx} className={`grid ${gridColsClass} gap-4 sm:gap-8 px-2 sm:px-4 py-2 sm:py-6`}>
                  {slideBrands.map((brand) => (
                    <Link 
                      key={brand.id}
                      to={`/brand/${brand.slug}`}
                      className="group block h-full"
                    >
                      <div 
                        className="rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl border flex flex-col items-center text-center gap-4 sm:gap-6 group-hover:border-primary/30"
                        style={{
                          background: mode === 'light' 
                            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
                            : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                          borderColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                          boxShadow: mode === 'light' 
                            ? '0 10px 30px -5px rgba(0, 0, 0, 0.05)' 
                            : '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        {/* Logo Container */}
                        <div 
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[30px] flex items-center justify-center p-4 sm:p-6 group-hover:bg-primary/10 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 relative overflow-hidden"
                          style={{
                            background: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div className="absolute inset-0 bg-primary/5 rounded-[24px] sm:rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="w-full h-full object-contain filter transition-all duration-500 relative z-10" 
                          />
                        </div>

                        <div className="w-full flex flex-col items-center">
                          <h3 
                            className="text-lg sm:text-xl font-black mb-2 truncate w-full max-w-[200px]"
                            style={{ color: tokens.colors[mode].text.primary }}
                          >
                            {brand.name}
                          </h3>
                          <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
                             <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                               {brand.products_count} {t('common:products', 'Products')}
                             </span>
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
