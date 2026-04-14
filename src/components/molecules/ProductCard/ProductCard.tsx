import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useTheme } from '../../../hooks/useTheme';
import { useDirection } from '../../../hooks/useDirection';
import { useCatalog } from '../../../hooks/useCatalog';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';


export interface ProductCardProps {
  id: number | string;
  image: string;
  name: string;
  real_price: string | number;
  fake_price?: string | number;
  review_avg_star?: number;
  reviews_count?: number;
  badge?: string;
  is_fav?: boolean;
  slug: string;
  onAddToCart?: (id: string | number) => void;
  onToggleWishlist?: (id: string | number) => void;
  isInWishlist?: boolean;
  className?: string;
  discount?: number | null;
  points?: number;
  showAddToCart?: boolean; // Optional prop to hide Add to Cart button
  vendor?: { id: number; name: string; slug: string } | null;
  brand?: { id: number; title: string | null; slug: string } | null;
  department?: { id: number; name: string; slug: string } | null;
  category?: { id: number; name: string; slug: string } | null;
  sub_category?: { id: number; name: string; slug: string } | null;
  remaining_stock?: number;
}


export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  name,
  slug,
  real_price,
  fake_price,
  review_avg_star,
  reviews_count,
  badge,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  className,
  discount: propDiscount,
  points,
  showAddToCart = true, // Default to true for backward compatibility
  vendor,
  brand,
  department,
  category,
  sub_category,
  remaining_stock: propRemainingStock = 0,
}) => {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const { country, selectedCountry } = useDirection();
  const { countries } = useCatalog();
  const isRTL = i18n.language === 'ar';
  
  // Fallback to 'stock' if 'remaining_stock' is not provided (or 0) but stock exists
  // We use type assertion to check for any legacy or undocumented fields
  const remaining_stock = propRemainingStock > 0 ? propRemainingStock : ((arguments[0] as any).stock || 0);

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isInWishlist);

  React.useEffect(() => {
    setIsFavorited(isInWishlist);
  }, [isInWishlist]);

  const activeCountry = selectedCountry || countries?.find(c => c.code === country) || countries?.[0];
  const currency = activeCountry?.currency || { code: '$', use_image: false, image: '' };

  // Convert string prices to numbers for calculation if possible
  const currentPrice = typeof real_price === 'string' ? parseFloat(real_price) : real_price;
  const originalPrice = (fake_price && typeof fake_price === 'string') ? parseFloat(fake_price) : (fake_price as number);
  
  const discount = propDiscount ?? (
    (originalPrice && currentPrice && originalPrice > currentPrice) 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
      : 0
  );


  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
    if (onToggleWishlist) {
      onToggleWishlist(id);
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-[1.75rem] transition-all duration-500 transform',
        'hover:scale-[1.02] hover:shadow-2xl',
        className
      )}
      style={{
        background: mode === 'light' ? '#ffffff' : '#1e293b',
        boxShadow: mode === 'light' 
          ? '0 10px 40px -10px rgba(0, 0, 0, 0.1)' 
          : '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
        isolation: 'isolate',
        border: mode === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link 
        to={`/product/${slug}`} 
        className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800/50 rounded-t-[1.65rem]"
      >

        <img
          src={image || 'https://via.placeholder.com/500?text=No+Image'}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700"
          style={{
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500?text=No+Image';
          }}
        />
        
        {/* Badges - Top Left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {badge && (
            <div 
              className="transition-all duration-300"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                animation: 'bounceIn 0.6s ease-out 0.2s both'
              }}
            >
              <div
                className="px-4 py-2 rounded-full font-black text-xs shadow-xl backdrop-blur-md"
                style={{
                  background: badge === 'Sale' 
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : badge === 'New'
                    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                    : 'rgba(255, 255, 255, 0.9)',
                  color: badge === 'Sale' || badge === 'New' ? '#ffffff' : '#000000'
                }}
              >
                {badge}
              </div>
            </div>
          )}
          {discount && discount > 0 ? (
            <div 
              className="transition-all duration-300"
              style={{
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <div 
                className="px-3 py-1 rounded-full font-black text-xs text-white shadow-xl backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                }}
              >
                -{discount}%
              </div>
            </div>
          ) : null}
          {points && points > 0 ? (
            <div 
              className="transition-all duration-300"
              style={{
                animation: 'pulse 2s ease-in-out infinite 0.5s'
              }}
            >
              <div 
                className="px-3 py-1 rounded-full font-black text-xs text-white shadow-xl backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#000'
                }}
              >
                💎 {points} {selectedCountry?.code === 'LY' ? 'نقطة' : 'Pts'}

              </div>
            </div>
          ) : null}
        </div>


        {/* Wishlist Button - Top Right */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md hover:scale-110 z-10"
          style={{
            background: isFavorited 
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg 
            className="w-5 h-5 transition-transform duration-300 hover:scale-125" 
            fill={isFavorited ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2}
            style={{ color: isFavorited ? '#ffffff' : '#ef4444' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>


      </Link>

      {/* Content Below Image */}
      <div 
        className="p-5 sm:p-6 rounded-b-[1.65rem]"
        style={{
          background: mode === 'light' 
            ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        }}
      >
        {/* Rating */}
        {(review_avg_star !== undefined && review_avg_star > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= review_avg_star;
                const isHalf = !isFilled && star - 0.5 <= review_avg_star;
                return (
                  <svg
                    key={star}
                    className="w-4 h-4"
                    style={{
                      color: isFilled || isHalf
                        ? '#fbbf24'
                        : mode === 'light' ? '#cbd5e1' : '#475569'
                    }}
                    fill={isFilled ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-sm font-black" style={{ color: mode === 'light' ? '#64748b' : '#94a3b8' }}>
              {review_avg_star.toFixed(1)}
            </span>
            {reviews_count !== undefined && (
              <span className="text-xs font-bold opacity-60 whitespace-nowrap" style={{ color: mode === 'light' ? '#94a3b8' : '#64748b' }}>
                ({reviews_count} {t('common:reviews', 'reviews')})
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link to={`/product/${slug}`}>
          <h3 
            className="text-lg font-bold mb-3 line-clamp-2 transition-colors duration-300 hover:text-blue-500 min-h-[3rem]"
            style={{ color: mode === 'light' ? '#0f172a' : '#ffffff' }}
          >
            {name}
          </h3>
        </Link>

        {/* Taxonomy: Department > Category > Subcategory + Brand */}
        {/* Taxonomy Section */}
        {(department || category || sub_category || brand) && (
          <div className="space-y-2 mb-4">
            {/* Breadcrumb Row: Dept > Cat > Sub */}
            {(department || category || sub_category) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {department && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase shadow-sm"
                    style={{
                      background: mode === 'light' ? '#f5f3ff' : 'rgba(139, 92, 246, 0.1)',
                      color: mode === 'light' ? '#7c3aed' : '#a78bfa',
                      border: `1px solid ${mode === 'light' ? '#ddd6fe' : 'rgba(139, 92, 246, 0.2)'}`
                    }}
                  >
                    <span className="opacity-40 text-[8px] font-bold">{isRTL ? 'قسم:' : 'DEPT:'}</span>
                    {department.name}
                  </span>
                )}
                
                {category && (
                  <>
                    <span className="text-[10px] font-bold opacity-30">›</span>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase shadow-sm"
                      style={{
                        background: mode === 'light' ? '#f0f9ff' : 'rgba(56, 189, 248, 0.1)',
                        color: mode === 'light' ? '#0284c7' : '#38bdf8',
                        border: `1px solid ${mode === 'light' ? '#bae6fd' : 'rgba(56, 189, 248, 0.2)'}`
                      }}
                    >
                      <span className="opacity-40 text-[8px] font-bold">{isRTL ? 'فئة:' : 'CAT:'}</span>
                      {category.name}
                    </span>
                  </>
                )}

                {sub_category && (
                  <>
                    <span className="text-[10px] font-bold opacity-30">›</span>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase shadow-sm"
                      style={{
                        background: mode === 'light' ? '#f0fdf4' : 'rgba(34, 197, 94, 0.1)',
                        color: mode === 'light' ? '#16a34a' : '#4ade80',
                        border: `1px solid ${mode === 'light' ? '#bbf7d0' : 'rgba(34, 197, 94, 0.2)'}`
                      }}
                    >
                      <span className="opacity-40 text-[8px] font-bold">{isRTL ? 'فرعي:' : 'SUB:'}</span>
                      {sub_category.name}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Brand Row */}
            {brand && (brand.title || brand.slug) && (
              <div className="flex items-center">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm"
                  style={{
                    background: mode === 'light' ? '#fffbeb' : 'rgba(245, 158, 11, 0.1)',
                    color: mode === 'light' ? '#d97706' : '#fbbf24',
                    border: `1px solid ${mode === 'light' ? '#fef3c7' : 'rgba(245, 158, 11, 0.2)'}`
                  }}
                >
                  <span className="text-xs">🔖</span>
                  <span className="opacity-40 text-[8px] font-bold">{isRTL ? 'براند:' : 'BRAND:'}</span>
                  {brand.title || brand.slug}
                </span>
              </div>
            )}
            
            {/* Stock Status */}
            <div className="flex items-center pt-1">
              {remaining_stock > 0 ? (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider animate-fadeIn"
                  style={{
                    background: mode === 'light' ? '#f0fdf4' : 'rgba(34, 197, 94, 0.1)',
                    color: mode === 'light' ? '#16a34a' : '#4ade80',
                    border: `1px solid ${mode === 'light' ? '#bbf7d0' : 'rgba(34, 197, 94, 0.2)'}`
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {t('common:inStock', 'In Stock')}
                </span>
              ) : (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider animate-fadeIn"
                  style={{
                    background: mode === 'light' ? '#fef2f2' : 'rgba(239, 68, 68, 0.1)',
                    color: mode === 'light' ? '#dc2626' : '#f87171',
                    border: `1px solid ${mode === 'light' ? '#fecaca' : 'rgba(239, 68, 68, 0.2)'}`
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {t('common:outOfStock', 'Out of Stock')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-2 mb-2">
          <span 
            className="text-xl sm:text-2xl font-black flex items-center gap-1.5"
            style={{ 
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {currentPrice?.toFixed(2) || '0.00'}
          </span>
          {currency && (
            currency.use_image && currency.image ? (
              <img src={currency.image} alt={currency.code} className="w-5 h-5 object-contain inline-block" />
            ) : (
              <span className="text-sm font-black" style={{ color: mode === 'light' ? '#818cf8' : '#c084fc' }}>
                {currency.code}
              </span>
            )
          )}
          {fake_price && (
            <span className="text-sm font-semibold line-through flex items-center gap-1 opacity-70" style={{ color: mode === 'light' ? '#94a3b8' : '#64748b' }}>
              {originalPrice?.toFixed(2)}
              {currency && (
                currency.use_image && currency.image ? (
                  <img src={currency.image} alt={currency.code} className="w-3.5 h-3.5 object-contain inline-block opacity-60" />
                ) : (
                  <span className="text-xs">{currency.code}</span>
                )
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.displayName = 'ProductCard';
