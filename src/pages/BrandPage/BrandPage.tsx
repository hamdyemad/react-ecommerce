import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { ProductCatalog } from '../../components/organisms/ProductCatalog/ProductCatalog';
import { brandService } from '../../services/brandService';
import type { Brand } from '../../types/api';

interface BrandPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function BrandPage({ onAddToCart, onToggleWishlist, wishlistItems }: BrandPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { brandId } = useParams<{ brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      if (!brandId) return;
      try {
        setLoadingBrand(true);
        const response = await brandService.getById(brandId);
        setBrand(response.data);
      } catch (err) {
        console.error('Failed to fetch brand details:', err);
      } finally {
        setLoadingBrand(false);
      }
    };
    fetchBrand();
  }, [brandId]);

  if (loadingBrand) {
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

  if (!brand) return <div className="py-20 text-center font-black" style={{ color: tokens.colors[mode].text.primary }}>{t('common:brandNotFound')}</div>;

  return (
    <div className="min-h-screen py-8 px-6 max-w-7xl mx-auto">
      <SEO title={`${brand.name} | ${t('common:brands')}`} />
      
      <BreadCrumb 
        items={[
          { label: t('common:home'), path: '/' },
          { label: t('common:brands'), path: '/brands' },
          { label: brand.name, path: `/brand/${brand.slug}` }
        ]}
      />

      {/* Brand Hero Banner */}
      <div 
        className="relative rounded-[50px] overflow-hidden mb-16 shadow-2xl"
        style={{
          height: '400px',
          background: brand.cover ? `url(${brand.cover}) center/cover` : tokens.gradients.primary
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative h-full flex items-center px-12">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-32 h-32 rounded-[35px] bg-white flex items-center justify-center p-5 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                {brand.name}
              </h1>
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <span className="px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {brand.products_count} {t('common:products', 'Products')}
                </span>
              </div>
              {/* Social Links */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                {brand.facebook && (
                  <a href={brand.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {brand.instagram && (
                  <a href={brand.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] transition-all duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {brand.x && (
                  <a href={brand.x} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black transition-all duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/></svg>
                  </a>
                )}
                {brand.linkedin && (
                  <a href={brand.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#0077b5] transition-all duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                )}
                {brand.pinterest && (
                  <a href={brand.pinterest} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#bd081c] transition-all duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.93 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.36 11.985-11.987C24.021 5.367 18.624 0 12.017 0z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Description Box */}
      {brand.description && (
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
              ℹ️
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black mb-4 uppercase tracking-widest opacity-60 flex items-center gap-3">
                {t('common:brandDescription', 'About the Brand')}
                <div className="h-px bg-current flex-1 opacity-20" />
              </h3>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none font-bold text-lg leading-relaxed opacity-80"
                style={{ color: tokens.colors[mode].text.primary }}
                dangerouslySetInnerHTML={{ __html: brand.description }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reusable Product Catalog Component */}
      <ProductCatalog 
        initialFilters={{ brand_id: brandId }}
        hideBrandFilter={true}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistItems={wishlistItems}
      />
    </div>
  );
}
