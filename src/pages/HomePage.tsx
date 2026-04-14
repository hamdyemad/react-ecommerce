import React, { useState, useEffect, useRef, useCallback } from 'react';
import { contactService } from '../services';
import { productService, sliderService } from '../services';
import { useTheme } from '../hooks/useTheme';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';
import { useCatalog } from '../hooks/useCatalog';
import { Button } from '../components/atoms/Button';
import { tokens } from '../tokens';
import { SEO } from '../components/atoms/SEO';
import { ProductCarouselSection } from '../components/organisms/ProductCarouselSection';
import { Carousel } from '../components/molecules/Carousel';
import type { Product, Category, Slider } from '../types/api';
import toast from 'react-hot-toast';

interface HomePageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist?: (id: string | number) => void;
  wishlistItems?: (string | number)[];
}

function HeroShimmer({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ 
        height: '100vh', 
        minHeight: '500px',
        background: mode === 'light' 
          ? 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' 
          : 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite linear'
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div 
          className="h-6 w-48 bg-white/20 dark:bg-black/20 rounded-full mb-6" 
          style={{ backdropFilter: 'blur(10px)' }}
        />
        <div 
          className="h-24 w-3/4 bg-white/20 dark:bg-black/20 rounded-3xl mb-12" 
          style={{ backdropFilter: 'blur(10px)' }}
        />
        <div 
          className="h-16 w-64 bg-white/20 dark:bg-black/20 rounded-xl" 
          style={{ backdropFilter: 'blur(10px)' }}
        />
      </div>
    </div>
  );
}

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  link?: string;
}

function HeroSlideItem({ slide, t }: { slide: HeroSlide; t: (key: string, fallback?: string) => string }) {
  return (
    <div
      className="relative w-full select-none group overflow-hidden"
      style={{ height: '100vh', minHeight: '500px', userSelect: 'none' }}
    >
      <style>{`
        @keyframes heroRevealUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes heroZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-hero-reveal {
          animation: heroRevealUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-hero-fade {
          animation: heroFadeIn 1.5s ease-out forwards;
        }
      `}</style>

      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 w-full h-full transform transition-transform duration-[12s] ease-out scale-100 group-hover:scale-110">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full pointer-events-none"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          draggable={false}
        />
      </div>

      {/* Luxurious Overlay Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1,
        }}
      />

      {/* Decorative center line or frame could go here - keeping it clean for now */}

      {/* Centered text + CTA */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{ zIndex: 2 }}
      >
        <div className="overflow-hidden mb-6">
          <p
            className="animate-hero-reveal"
            style={{
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '0.4em',
              fontSize: 'min(3.5vw, 1.1rem)',
              fontWeight: 600,
              textTransform: 'uppercase',
              animationDelay: '0.2s',
              opacity: 0,
            }}
          >
            {slide.subtitle}
          </p>
        </div>

        <div className="mb-12">
          <h1
            className="animate-hero-reveal font-black tracking-tighter"
            style={{
              color: '#fff',
              fontSize: 'clamp(2rem, 8vw, 6.5rem)',
              textTransform: 'uppercase',
              lineHeight: 0.95,
              animationDelay: '0.4s',
              opacity: 0,
              textShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            {slide.title}
          </h1>
        </div>

        <div className="opacity-0 animate-hero-fade" style={{ animationDelay: '0.9s' }}>
          <HeroShopButton t={t} link={slide.link} />
        </div>
      </div>
    </div>
  );
}

function HeroShopButton({ t, link }: { t: (key: string, fallback?: string) => string, link?: string }) {
  const [hovered, setHovered] = useState(false);
  
  // Custom logic to handle external vs internal links
  const isExternal = link?.startsWith('http');
  const targetLink = link || '/products';

  if (isExternal) {
    return (
      <a
        href={targetLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          display: 'inline-block',
          padding: '18px 64px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '2px',
          backgroundColor: hovered ? '#fff' : 'transparent',
        }}
      >
        <span style={{ 
          position: 'relative', 
          zIndex: 1, 
          color: hovered ? '#000' : '#fff',
          transition: 'color 0.4s'
        }}>
          {t('shopNow', 'SHOP NOW')}
        </span>
        {/* Hover reveal background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: hovered ? '100%' : '0%',
          height: '100%',
          background: '#fff',
          transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }} />
      </a>
    );
  }

  return (
    <Link
      to={targetLink}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        padding: '18px 64px',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.85rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '2px',
        backgroundColor: hovered ? '#fff' : 'transparent',
      }}
    >
      <span style={{ 
        position: 'relative', 
        zIndex: 1, 
        color: hovered ? '#000' : '#fff',
        transition: 'color 0.4s'
      }}>
        {t('shopNow', 'SHOP NOW')}
      </span>
      {/* Hover reveal background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: hovered ? '100%' : '0%',
        height: '100%',
        background: '#fff',
        transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }} />
    </Link>
  );
}

export function HomePage({ onAddToCart, onToggleWishlist, wishlistItems = [] }: HomePageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const { categories: catalogCategories, loadingCategories } = useCatalog();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Use categories from catalog instead of local state
  const [categories, setCategories] = useState<Category[]>(catalogCategories);
  const [loadingCats, setLoadingCats] = useState(loadingCategories);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [hasMoreCategories, setHasMoreCategories] = useState(false);
  const [loadingMoreCats, setLoadingMoreCats] = useState(false);

  // Products state with pagination
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsPage, setProductsPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  
  // Sliders state
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loadingSliders, setLoadingSliders] = useState(true);

  // Scroll animations
  const featuresAnim = useScrollAnimation();
  const newsletterAnim = useScrollAnimation();

  
  const hasFetchedRef = React.useRef(false);

  // Fetch featured products with pagination
  const fetchFeaturedProducts = React.useCallback(async (page: number, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoadingProducts(true);
      } else {
        setLoadingMoreProducts(true);
      }

      const response = await productService.getFeatured({ per_page: 10, page });
      const newProducts = response.data || [];

      setFeaturedProducts(prev => append ? [...prev, ...newProducts] : newProducts);

      if (response.pagination) {
        const { current_page, last_page } = response.pagination;
        setProductsPage(current_page);
        setHasMoreProducts(current_page < last_page);
      } else {
        setHasMoreProducts(newProducts.length >= 10);
        if (append) setProductsPage(prev => prev + 1);
        else setProductsPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoadingProducts(false);
      setLoadingMoreProducts(false);
    }
  }, []);

  // Fetch sliders
  const fetchSliders = useCallback(async () => {
    try {
      setLoadingSliders(true);
      const response = await sliderService.getAll();
      if (response.status) {
        setSliders(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setLoadingSliders(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchFeaturedProducts(1, false);
      fetchSliders();
    }
  }, [fetchFeaturedProducts, fetchSliders]);

  useEffect(() => {
    // Use categories from catalog instead of fetching
    setCategories(catalogCategories);
    setLoadingCats(loadingCategories);

    // Set initial hasMore state based on current categories count
    setHasMoreCategories(catalogCategories.length >= 10);
  }, [catalogCategories, loadingCategories]);

  const handleLoadMoreCategories = async () => {
    if (hasMoreCategories && !loadingMoreCats) {
      try {
        setLoadingMoreCats(true);
        const nextPage = categoriesPage + 1;
        const response = await categoryService.getAll({ page: nextPage, per_page: 10, paginated: 'ok' });
        const newCategories = response.data || [];

        if (newCategories.length > 0) {
          setCategories(prev => [...prev, ...newCategories]);
          setCategoriesPage(nextPage);

          if (response.pagination) {
            const currentPage = response.pagination.current_page;
            const lastPage = response.pagination.last_page;
            setHasMoreCategories(currentPage < lastPage);
          } else {
            setHasMoreCategories(newCategories.length >= 10);
          }
        }
      } catch (error) {
        console.error('Failed to fetch more categories:', error);
      } finally {
        setLoadingMoreCats(false);
      }
    }
  };

  const handleLoadMoreProducts = () => {
    if (hasMoreProducts && !loadingMoreProducts) {
      fetchFeaturedProducts(productsPage + 1, true);
    }
  };

  const handleSubscribe = async () => {
    if (!newsletterEmail) {
      toast.error(t('common:pleaseEnterEmail', 'Please enter your email address'));
      return;
    }

    setNewsletterLoading(true);
    try {
      const res = await contactService.subscribe({ email: newsletterEmail });
      if (res.status) {
        toast.success(res.message || t('newsletterSuccess', 'Successfully subscribed!'));
        setNewsletterEmail('');
      } else {
        toast.error(res.message || t('newsletterError', 'Subscription failed'));
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors && Object.keys(errorData.errors).length > 0) {
        Object.values(errorData.errors).flat().forEach((msg: any) => toast.error(msg));
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error(t('common:somethingWentWrong', 'Something went wrong. Please try again.'));
      }
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Map API sliders to heroSlides format
  const heroSlides = sliders.map(slider => ({
    image: slider.image,
    title: slider.title || '',
    subtitle: slider.description || '',
    link: slider.slider_link
  }));

  return (
    <div>
      <SEO title={t('home')} />

      {/* ── Hero Carousel ─────────────────────────────────────────────── */}
      {/*
        We wrap with a class that removes the Carousel molecule's default
        rounded-3xl on the overflow container, giving a truly edge-to-edge look.
      */}
      <style>{`
        .hero-carousel-wrapper {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
        }
        .hero-carousel-wrapper .overflow-hidden {
          border-radius: 0 !important;
        }
        .hero-carousel-wrapper .flex-shrink-0 {
          height: 100vh;
          min-height: 500px;
        }
      `}</style>
      <section className="hero-carousel-wrapper" style={{ marginTop: 0 }}>
        <style>{`
          .hero-carousel-wrapper {
            margin-bottom: 1.5rem;
          }
          @media (min-width: 640px) {
            .hero-carousel-wrapper {
              margin-bottom: 3rem;
            }
          }
        `}</style>
        {loadingSliders ? (
          <HeroShimmer mode={mode} />
        ) : heroSlides.length > 0 ? (
          <Carousel
            autoPlay={true}
            interval={5500}
            showDots={true}
            showArrows={true}
            peekAmount={0}
            variant="overlay"
          >
            {heroSlides.map((slide, i) => (
              <HeroSlideItem key={i} slide={slide as any} t={t as any} />
            ))}
          </Carousel>
        ) : null}
      </section>

      {/* ── Categories Carousel ───────────────────────────────────────── */}
      <div className="py-10 sm:py-16">
        {loadingCats && categories.length === 0 ? (
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-6" />
            <div className="h-6 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[40px] animate-pulse" />
              ))}
            </div>
          </div>
        ) : categories.length > 0 && (
          <ProductCarouselSection
            title={t('common:shopByCategory', 'Shop by Category')}
            description={t('common:exploreDiverseCollection', 'Explore a diverse collection of products')}
            items={categories}
            type="categories"
            viewAllLink="/categories"
            isLoading={loadingMoreCats}
            hasMore={hasMoreCategories}
            onLoadMore={handleLoadMoreCategories}
          />
        )}
      </div>

      {/* ── Featured Products Carousel ────────────────────────────────── */}
      <div className="py-10 sm:py-16">
        <ProductCarouselSection
          title={t('common:featuredProducts', 'Featured Products')}
          description={t('common:handpickedProducts', 'Discover our top picks just for you')}
          items={featuredProducts}
          type="products"
          viewAllLink="/products"
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistItems={wishlistItems}
          isLoading={loadingProducts || loadingMoreProducts}
          hasMore={hasMoreProducts}
          onLoadMore={handleLoadMoreProducts}
        />
      </div>

      {/* ── Features Section ──────────────────────────────────────────── */}
      <section
        ref={featuresAnim.ref}
        className={`relative py-16 sm:py-24 fade-in-up ${featuresAnim.isVisible ? 'visible' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-5xl font-black text-center mb-16"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('whyShopWithUs')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '💳', title: t('freeShipping'), desc: t('freeShippingDesc'), gradient: 'from-blue-500 to-cyan-500' },
              { icon: '✅', title: t('qualityGuarantee'), desc: t('qualityGuaranteeDesc'), gradient: 'from-green-500 to-emerald-500' },
              { icon: '🔄', title: t('easyReturns'), desc: t('easyReturnsDesc'), gradient: 'from-orange-500 to-red-500' },
              { icon: '💬', title: t('support247'), desc: t('support247Desc'), gradient: 'from-purple-500 to-pink-500' },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative rounded-3xl p-10 text-center hover:scale-105 transition-all duration-500 ${featuresAnim.isVisible ? 'visible' : ''}`}
                style={{
                  background: `${tokens.colors[mode].surface.base}B3`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${tokens.colors[mode].border.DEFAULT}33`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  opacity: 0,
                  transform: 'translateY(20px) scale(0.95)',
                  transitionDelay: `${index * 0.1}s`,
                  ...(featuresAnim.isVisible ? {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)'
                  } : {})
                }}
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 text-5xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                  style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)' }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="text-2xl font-black mb-4"
                  style={{ color: tokens.colors[mode].text.primary }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-lg"
                  style={{ color: tokens.colors[mode].text.secondary }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter Section ────────────────────────────────────────── */}
      <section
        ref={newsletterAnim.ref}
        className={`relative max-w-7xl mx-4 sm:mx-6 lg:mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden fade-in-up ${newsletterAnim.isVisible ? 'visible' : ''}`}
        style={{
          background: mode === 'light'
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: `2px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
          marginBottom: '4rem',
        }}
      >
        <div className="relative z-10 pt-12 pb-16 px-8 sm:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              📧 {t('newsletterTitle')}
            </h2>
            <p
              className="text-lg sm:text-2xl mb-8 sm:mb-12 font-medium"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              {t('newsletterSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                className="flex-1 px-8 py-5 rounded-2xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all"
                style={{
                  backgroundColor: tokens.colors[mode].surface.base,
                  color: tokens.colors[mode].text.primary,
                  border: `2px solid ${tokens.colors[mode].border.DEFAULT}`,
                  minHeight: '60px'
                }}
              />
              <Button
                variant="primary"
                loading={newsletterLoading}
                onClick={handleSubscribe}
                className="px-8 py-5 rounded-2xl text-lg font-black transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{
                  background: tokens.gradients.primary,
                  color: tokens.colors[mode].text.inverse,
                  boxShadow: `0 10px 40px ${tokens.colors[mode].primary[500]}40`,
                  minHeight: '60px'
                }}
              >
                {newsletterLoading ? t('subscribing') : t('subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
