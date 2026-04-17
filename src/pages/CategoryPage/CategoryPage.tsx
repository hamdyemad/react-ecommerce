import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { ProductCatalog } from '../../components/organisms/ProductCatalog/ProductCatalog';
import { categoryService } from '../../services/categoryService';
import { Carousel } from '../../components/molecules/Carousel/Carousel';
import { Link } from 'react-router-dom';
import type { Category } from '../../types/api';

interface CategoryPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function CategoryPage({ onAddToCart, onToggleWishlist, wishlistItems }: CategoryPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
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

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      try {
        setLoading(true);
        const response = await categoryService.getById(categoryId);
        setCategory(response.data);
        
        // Fetch subcategories
        setLoadingSubs(true);
        const subsResponse = await categoryService.getSubcategories({ parent_id: response.data.id });
        setSubcategories(subsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch category details:', err);
      } finally {
        setLoading(false);
        setLoadingSubs(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-6 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl mb-12" />
        <div className="flex gap-8">
          <div className="hidden lg:block w-72 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) return <div className="py-20 text-center font-black" style={{ color: tokens.colors[mode].text.primary }}>{t('common:categoryNotFound')}</div>;

  return (
    <div className="min-h-screen py-8 px-6 max-w-7xl mx-auto">
      <SEO title={`${category.name} | ${t('common:categories')}`} />
      
      <BreadCrumb 
        items={[
          { label: t('common:home'), path: '/' },
          ...(category.department ? [{ label: category.department.name, path: `/department/${category.department.slug}` }] : []),
          { label: category.name, path: `/category/${category.slug}` }
        ]}
      />

      {/* Hero Banner */}
      <div 
        className="relative rounded-[24px] sm:rounded-[50px] overflow-hidden mb-8 sm:mb-16 shadow-2xl"
        style={{
          minHeight: '260px',
          background: category.image ? `url(${category.image}) center/cover` : tokens.gradients.primary
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative h-full flex items-center px-6 sm:px-12 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-start w-full">
            <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[20px] sm:rounded-[35px] bg-white flex items-center justify-center p-4 sm:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500 flex-shrink-0">
              <img src={category.icon} alt={category.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-2 sm:mb-4 tracking-tighter">
                {category.name}
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center md:justify-start">
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {category.products_count} {t('common:products')} {t('common:available')}
                </span>
                {category.department && (
                  <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-[11px] sm:text-sm uppercase tracking-wider">
                    📦 {category.department.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Summary Box */}
      {category.summary && category.summary !== '-' && (
        <div 
          className="mb-16 p-8 rounded-[35px] border relative overflow-hidden group"
          style={{
            background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
            borderColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
            boxShadow: mode === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" style={{ background: tokens.gradients.primary }} />
          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-primary/10" style={{ background: `${tokens.colors[mode].primary.DEFAULT}10` }}>
              🗂️
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black mb-4 uppercase tracking-widest opacity-60 flex items-center gap-3">
                {t('common:aboutCategory', 'About Category')}
                <div className="h-px bg-current flex-1 opacity-20" />
              </h3>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none font-bold text-lg leading-relaxed opacity-80"
                style={{ color: tokens.colors[mode].text.primary }}
                dangerouslySetInnerHTML={{ __html: category.summary }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Explore Subcategories */}
      {!loadingSubs && subcategories.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2" style={{ color: tokens.colors[mode].text.primary }}>
                {t('common:exploreSubcategories', 'Explore Subcategories')}
              </h2>
              <p className="font-bold opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>
                {t('common:browseSubcategoriesDesc', 'Find exactly what you need in this category')}
              </p>
            </div>
          </div>
          
          <Carousel autoPlay={false} showDots={true} peekAmount={10} variant="standalone">
            {(() => {
              const itemsPerSlide = screenSize === 'mobile' ? 1 : screenSize === 'tablet' ? 2 : 4;
              const gridColsClass = screenSize === 'mobile' ? 'grid-cols-1' : screenSize === 'tablet' ? 'grid-cols-2' : 'grid-cols-4';
              const slides = [];
              for (let i = 0; i < subcategories.length; i += itemsPerSlide) {
                slides.push(subcategories.slice(i, i + itemsPerSlide));
              }
              return slides.map((slideSubs, idx) => (
                <div key={idx} className={`grid ${gridColsClass} gap-4 sm:gap-6 px-2 sm:px-4 py-6 sm:py-10`}>
                  {slideSubs.map((sub) => (
                    <Link 
                      key={sub.id}
                      to={`/sub-category/${sub.slug}`}
                      className="group block"
                    >
                      <div 
                        className="rounded-[20px] sm:rounded-[35px] p-6 sm:p-8 h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl border flex flex-col items-center text-center gap-4 sm:gap-6 group-hover:border-primary/30"
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
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[30px] flex items-center justify-center p-4 sm:p-6 group-hover:bg-primary/10 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 relative"
                          style={{
                            background: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div className="absolute inset-0 bg-primary/5 rounded-[24px] sm:rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          {sub.icon ? (
                            <img src={sub.icon} alt={sub.name} className="w-full h-full object-contain relative z-10" />
                          ) : (
                            <span className="text-4xl sm:text-5xl relative z-10">🗂️</span>
                          )}
                        </div>
                        <div className="flex flex-col items-center">
                          <h4 className="font-black text-lg sm:text-xl mb-2 truncate w-full max-w-[200px]" style={{ color: tokens.colors[mode].text.primary }}>{sub.name}</h4>
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                            {sub.products_count || 0} {t('common:products')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ));
            })()}
          </Carousel>
        </div>
      )}

      {/* Catalog */}
      <ProductCatalog 
        initialFilters={{ category_id: category.slug }}
        hideCategoryFilter={true}
        hideDepartmentFilter={true}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistItems={wishlistItems}
      />
    </div>
  );
}
