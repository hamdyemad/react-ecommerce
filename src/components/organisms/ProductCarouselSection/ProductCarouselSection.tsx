import { Carousel } from '../../molecules/Carousel';
import { useTheme } from '../../../hooks/useTheme';
import { tokens } from '../../../tokens';
import type { Product } from '../../../types/api';
import { ProductCard } from '../../molecules/ProductCard';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface Category {
  id: string | number;
  slug: string;
  name: string;
  icon?: string;
  products_count?: number;
}

interface ProductCarouselProps {
  title: string;
  description: string;
  items: Category[] | Product[];
  type: 'categories' | 'products';
  onAddToCart?: (id: string | number) => void;
  onToggleWishlist?: (id: string | number) => void;
  wishlistItems?: (string | number)[];
  viewAllLink?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function ProductCarouselSection({
  title,
  description,
  items,
  type,
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  viewAllLink,
  isLoading = false,
  hasMore = false,
  onLoadMore
}: ProductCarouselProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Split items based on screen size
  const getItemsPerSlide = () => {
    if (screenSize === 'mobile') return type === 'categories' ? 2 : 1;
    if (screenSize === 'tablet') return type === 'categories' ? 2 : 2;
    return 4;
  };
  const itemsPerSlide = getItemsPerSlide();
  
  const gridColsClass = type === 'categories' 
    ? 'grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  const slides = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    slides.push(items.slice(i, i + itemsPerSlide));
  }

  // Show shimmer loading skeletons for initial load
  if (isLoading && items.length === 0) {
    return (
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-3" />
              <div className="h-6 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className={`grid ${gridColsClass} gap-4 sm:gap-8 px-2 sm:px-4 py-4`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 bg-slate-100 dark:bg-slate-800 rounded-[40px] animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent -translate-x-full animate-shimmer" />
                <div className="absolute top-4 left-4 right-4 h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl" />
                <div className="absolute bottom-6 left-4 right-4 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-10 text-center sm:text-start">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {title}
            </h2>
            <p
              className="font-bold opacity-60 text-sm sm:text-lg max-w-sm sm:max-w-none mx-auto sm:mx-0"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              {description}
            </p>
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg transition-all duration-300 hover:scale-105 active:scale-95 text-center mt-2 sm:mt-0"
              style={{
                background: tokens.colors[mode].background.subtle,
                color: tokens.colors[mode].text.primary,
                border: `2px solid ${tokens.colors[mode].border.DEFAULT}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              {t('common:viewAll', 'View All')}
            </Link>
          )}
        </div>

        {/* Carousel container with relative positioning for overlay loader */}
        <div className="relative">
          <Carousel
            autoPlay={false}
            showDots={true}
            peekAmount={10}
            variant="standalone"
            onEndReached={hasMore ? onLoadMore : undefined}
          >
            {slides.map((slideItems, idx) => (
              <div 
                key={idx} 
                className={`grid ${gridColsClass} gap-4 sm:gap-8 px-2 sm:px-4 py-2 sm:py-6`}
              >
                {slideItems.map((item) => {
                  if (type === 'categories') {
                    const category = item as Category;
                    return (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="group block"
                      >
                        <div
                          className="rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 h-full transition-all duration-500 hover:scale-105 hover:shadow-xl border flex flex-col items-center text-center gap-3 sm:gap-6"
                          style={{
                            background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                            borderColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-[16px] sm:rounded-[30px] bg-primary/5 flex items-center justify-center p-3 sm:p-6 group-hover:bg-primary/10 transition-all duration-300 group-hover:-rotate-6">
                            {category.icon ? (
                              <img src={category.icon} alt={category.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-2xl sm:text-5xl">🗂️</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-xs sm:text-lg mb-1 sm:mb-2 truncate w-full max-w-[120px] sm:max-w-[180px]" style={{ color: tokens.colors[mode].text.primary }}>{category.name}</h4>
                            <span className="inline-block px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                              {category.products_count || 0} {t('common:products')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  } else {
                    const product = item as Product;
                    return (
                      <div key={product.id} className="h-full">
                        <ProductCard
                          id={product.id}
                          image={product.image}
                          name={product.name}
                          real_price={product.real_price}
                          fake_price={product.fake_price || undefined}
                          review_avg_star={product.review_avg_star}
                          reviews_count={product.reviews_count}
                          badge={product.discount && product.discount > 0 ? 'Sale' : undefined}
                          slug={product.slug}
                          onAddToCart={onAddToCart}
                          onToggleWishlist={onToggleWishlist}
                          isInWishlist={wishlistItems.includes(product.id)}
                          discount={product.discount}
                          points={product.points}
                          brand={product.brand}
                          department={product.department}
                          category={product.category}
                          sub_category={product.sub_category}
                          remaining_stock={product.remaining_stock}
                          showAddToCart={false}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            ))}
          </Carousel>

          {/* Glassy overlay loader for pagination */}
          {isLoading && hasMore && items.length > 0 && (
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-20">
              <div className="px-10 py-8 rounded-3xl bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
