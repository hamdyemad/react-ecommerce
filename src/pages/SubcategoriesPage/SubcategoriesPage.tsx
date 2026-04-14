import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { Link } from 'react-router-dom';
import { Carousel } from '../../components/molecules/Carousel/Carousel';
import { categoryService } from '../../services';
import type { Category } from '../../types/api';
import { SEO } from '../../components/atoms/SEO';

export function SubcategoriesPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [subcategories, setSubcategories] = useState<Category[]>([]);
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

  const fetchSubcategories = async (pageNum: number, append: boolean = false, currentSearch: string = searchTerm) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const response = await categoryService.getSubcategories({ 
        page: pageNum, 
        per_page: 12,
        paginated: 'ok',
        search: currentSearch || undefined
      });
      
      const newItems = response.data || [];
      if (append) {
        setSubcategories(prev => [...prev, ...newItems]);
      } else {
        setSubcategories(newItems);
      }
      
      setHasMore(response.pagination?.current_page < response.pagination?.last_page);
    } catch (err: any) {
      console.error('Failed to fetch subcategories:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSubcategories(1, false, searchTerm);
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
      fetchSubcategories(nextPage, true);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-[1440px] mx-auto">
      <SEO title={t('common:subcategories', 'Sub Categories')} />
      <BreadCrumb 
        items={[
          { label: t('common:home', 'Home'), path: '/' },
          { label: t('common:subcategories', 'Sub Categories'), path: '/sub-categories' }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mt-4 mb-6 relative py-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-500 cursor-default">📁</div>
        <h1 
          className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {t('common:exploreSubcategories', 'Explore Sub Categories')}
        </h1>
        <p 
          className="text-lg md:text-xl max-w-2xl mx-auto font-bold opacity-60"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('common:browseSubcategoriesDesc', 'Dive deeper into our specialized collections.')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-12 px-4 sm:px-10">
        <div className="relative w-full md:max-w-2xl group">
          <input 
            type="text"
            placeholder={t('common:searchSubcategories', 'Search sub categories...')}
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
      ) : subcategories.length === 0 ? (
        <div className="text-center py-24 px-6 rounded-[50px] border border-dashed mb-12" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
          <div className="text-8xl mb-8 grayscale opacity-50">🔎</div>
          <h3 className="text-3xl font-black mb-4" style={{ color: tokens.colors[mode].text.primary }}>{t('common:noResults', 'No Results Found')}</h3>
          <p className="max-w-md mx-auto font-bold opacity-60 text-lg" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('common:searchNoResultsDesc', "We couldn't find any sub categories matching your search. Try different keywords.")}
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
              for (let i = 0; i < subcategories.length; i += itemsPerSlide) {
                slides.push(subcategories.slice(i, i + itemsPerSlide));
              }
              return slides.map((slideSubs, idx) => (
                <div key={idx} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 px-4 sm:px-10 py-4 sm:py-8">
                  {slideSubs.map((sub) => (
                    <Link 
                      key={sub.id}
                      to={`/sub-category/${sub.slug}`}
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
                        {/* Icon Container with Gradient Background */}
                        <div 
                          className="w-24 h-24 sm:w-36 sm:h-36 rounded-[30px] sm:rounded-[45px] flex items-center justify-center p-6 sm:p-10 transition-all duration-700 group-hover:-rotate-12 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${tokens.colors[mode].primary.DEFAULT}12 0%, ${tokens.colors[mode].primary.DEFAULT}05 100%)`
                          }}
                        >
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          {sub.icon ? (
                            <img 
                              src={sub.icon} 
                              alt={sub.name} 
                              className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-115 transition-transform duration-700" 
                            />
                          ) : (
                            <span className="text-5xl sm:text-7xl group-hover:scale-115 transition-transform duration-700">📁</span>
                          )}
                        </div>

                        <div className="w-full">
                          <h4 
                            className="text-xl sm:text-3xl font-black mb-3 sm:mb-5 group-hover:text-primary transition-colors duration-500 px-2 line-clamp-2"
                            style={{ color: tokens.colors[mode].text.primary }}
                          >
                            {sub.name}
                          </h4>
                          <div className="flex flex-col items-center gap-2">
                             <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                               {sub.products_count || 0} {t('common:products', 'Products')}
                             </span>
                             {sub.parent && (
                               <span className="text-xs font-bold opacity-40 uppercase tracking-widest">📦 {sub.parent.name}</span>
                             )}
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
