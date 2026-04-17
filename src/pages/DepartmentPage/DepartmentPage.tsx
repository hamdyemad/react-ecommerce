import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { ProductCatalog } from '../../components/organisms/ProductCatalog/ProductCatalog';
import { departmentService } from '../../services/departmentService';
import { categoryService } from '../../services/categoryService';
import { Carousel } from '../../components/molecules/Carousel/Carousel';
import { Link } from 'react-router-dom';
import type { Department, Category } from '../../types/api';

interface DepartmentPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function DepartmentPage({ onAddToCart, onToggleWishlist, wishlistItems }: DepartmentPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { departmentId } = useParams<{ departmentId: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(false);
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
    const fetchDept = async () => {
      if (!departmentId) return;
      try {
        setLoading(true);
        const response = await departmentService.getById(departmentId);
        setDepartment(response.data);

        // Fetch categories for this department
        setLoadingCats(true);
        const catsResponse = await categoryService.getAll({ department_id: response.data.id, per_page: 40 });
        setCategories(catsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch department details:', err);
      } finally {
        setLoading(false);
        setLoadingCats(false);
      }
    };
    fetchDept();
  }, [departmentId]);

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

  if (!department) return <div className="py-20 text-center font-black" style={{ color: tokens.colors[mode].text.primary }}>{t('common:departmentNotFound')}</div>;

  return (
    <div className="py-4 sm:py-8 w-full">
      <SEO title={`${department.name} | ${t('common:departments')}`} />
      
      <BreadCrumb 
        items={[
          { label: t('common:home'), path: '/' },
          { label: t('common:departments'), path: '/departments' },
          { label: department.name, path: `/department/${department.slug}` }
        ]}
      />

      {/* Hero Banner */}
      <div 
        className="relative rounded-[24px] sm:rounded-[50px] overflow-hidden mb-8 sm:mb-16 shadow-2xl"
        style={{
          minHeight: '260px',
          background: department.image ? `url(${department.image}) center/cover` : tokens.gradients.primary
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative h-full flex items-center px-6 sm:px-12 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 text-center md:text-left w-full">
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-[20px] sm:rounded-[35px] bg-white/20 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-5 shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-500 flex-shrink-0">
              <img src={department.icon} alt={department.name} className="max-w-[70%] max-h-[70%] object-contain brightness-0 invert" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-2 sm:mb-4 tracking-tighter">
                {department.name}
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center md:justify-start">
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {department.products_count} {t('common:products', 'Products')}
                </span>
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  🏷️ {department.categories_count} {t('common:categories', 'Categories')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Description Box (only if not '-') */}
      {department.description && department.description !== '-' && (
        <div 
          className="mb-16 p-8 rounded-[35px] border relative overflow-hidden group"
          style={{
            background: mode === 'light' ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
          }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" style={{ background: tokens.gradients.primary }} />
          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-primary/10" style={{ background: `${tokens.colors[mode].primary.DEFAULT}10` }}>
              ℹ️
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black mb-4 uppercase tracking-widest opacity-60 flex items-center gap-3">
                {t('common:aboutDepartment', 'About Department')}
                <div className="h-px bg-current flex-1 opacity-20" />
              </h3>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none font-bold text-lg leading-relaxed opacity-80"
                style={{ color: tokens.colors[mode].text.primary }}
                dangerouslySetInnerHTML={{ __html: department.description }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Explore Categories Carousel */}
      {!loadingCats && categories.length > 0 && (
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-10 text-center sm:text-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3" style={{ color: tokens.colors[mode].text.primary }}>
                {t('common:exploreCategories', 'Explore Categories')}
              </h2>
              <p className="font-bold opacity-60 text-sm sm:text-lg max-w-sm sm:max-w-none mx-auto sm:mx-0" style={{ color: tokens.colors[mode].text.secondary }}>
                {t('common:browseCategoriesDesc', 'Discovery our range of products in this department')}
              </p>
            </div>
            <Link 
              to="/categories" 
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg transition-all duration-300 hover:scale-105 active:scale-95 text-center mt-2 sm:mt-0"
              style={{
                background: tokens.colors[mode].background.subtle,
                color: tokens.colors[mode].text.primary,
                border: `2px solid ${tokens.colors[mode].border.DEFAULT}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              {t('common:seeAll', 'See All')}
            </Link>
          </div>
          
          <Carousel autoPlay={false} showDots={true} peekAmount={10} variant="standalone">
            {(() => {
              const itemsPerSlide = screenSize === 'mobile' ? 1 : screenSize === 'tablet' ? 2 : 4;
              const gridColsClass = screenSize === 'mobile' ? 'grid-cols-1' : screenSize === 'tablet' ? 'grid-cols-2' : 'grid-cols-4';
              const slides = [];
              for (let i = 0; i < categories.length; i += itemsPerSlide) {
                slides.push(categories.slice(i, i + itemsPerSlide));
              }
              return slides.map((slideCats, idx) => (
                <div key={idx} className={`grid ${gridColsClass} gap-4 sm:gap-6 px-2 sm:px-4 py-6 sm:py-10`}>
                  {slideCats.map((cat) => (
                    <Link 
                      key={cat.id}
                      to={`/category/${cat.slug}`}
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
                          {cat.icon ? (
                            <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain relative z-10" />
                          ) : (
                            <span className="text-4xl sm:text-5xl relative z-10">🗂️</span>
                          )}
                        </div>
                        <div className="flex flex-col items-center">
                          <h4 className="font-black text-lg sm:text-xl mb-2 truncate w-full max-w-[200px]" style={{ color: tokens.colors[mode].text.primary }}>{cat.name}</h4>
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                            {cat.products_count || 0} {t('common:products')}
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
        initialFilters={{ department_id: departmentId }}
        hideDepartmentFilter={true}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistItems={wishlistItems}
      />
    </div>
  );
}
