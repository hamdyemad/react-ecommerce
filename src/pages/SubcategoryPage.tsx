import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { tokens } from '../tokens';
import { BreadCrumb } from '../components/molecules/BreadCrumb';
import { SEO } from '../components/atoms/SEO';
import { ProductCatalog } from '../components/organisms/ProductCatalog/ProductCatalog';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/api';

interface SubcategoryPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function SubcategoryPage({ onAddToCart, onToggleWishlist, wishlistItems }: SubcategoryPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { subcategorySlug } = useParams<{ subcategorySlug: string }>();
  const [subcategory, setSubcategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategory = async () => {
      if (!subcategorySlug) return;
      try {
        setLoading(true);
        const response = await categoryService.getSubcategoryBySlug(subcategorySlug);
        setSubcategory(response.data);
      } catch (err) {
        console.error('Failed to fetch subcategory details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategory();
  }, [subcategorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-[50px] mb-12" />
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

  if (!subcategory) return <div className="py-20 text-center font-black" style={{ color: tokens.colors[mode].text.primary }}>{t('common:subcategoryNotFound')}</div>;

  return (
    <div className="min-h-screen py-8 px-6 max-w-7xl mx-auto">
      <SEO title={`${subcategory.name} | ${t('common:categories')}`} />
      
      <BreadCrumb 
        items={[
          { label: t('common:home'), path: '/' },
          ...(subcategory.parent?.department ? [{ label: subcategory.parent.department.name, path: `/department/${subcategory.parent.department.slug}` }] : []),
          ...(subcategory.parent ? [{ label: subcategory.parent.name, path: `/category/${subcategory.parent.slug}` }] : []),
          { label: subcategory.name, path: `/sub-category/${subcategory.slug}` }
        ]}
      />
 
      {/* Hero Banner */}
      <div 
        className="relative rounded-[50px] overflow-hidden mb-16 shadow-2xl"
        style={{
          height: '400px',
          background: subcategory.image ? `url(${subcategory.image}) center/cover` : tokens.gradients.primary
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative h-full flex items-center px-12">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-start w-full">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[35px] bg-white flex items-center justify-center p-6 shadow-2xl transform hover:scale-105 transition-all duration-500 flex-shrink-0">
               {subcategory.icon ? (
                 <img src={subcategory.icon} alt={subcategory.name} className="max-w-full max-h-full object-contain" />
               ) : (
                 <span className="text-6xl">🗂️</span>
               )}
            </div>
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                {subcategory.name}
              </h1>
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <span className="px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {subcategory.products_count} {t('common:products')} {t('common:available')}
                </span>
                {subcategory.parent && (
                  <span className="px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-sm uppercase tracking-wider">
                    📦 {subcategory.parent.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <ProductCatalog 
        initialFilters={{ category_id: subcategory.slug }}
        hideCategoryFilter={true}
        hideDepartmentFilter={true}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistItems={wishlistItems}
      />
    </div>
  );
}
