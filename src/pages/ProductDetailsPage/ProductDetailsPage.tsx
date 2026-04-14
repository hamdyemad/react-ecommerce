import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { CurrencyDisplay } from '../../components/atoms/CurrencyDisplay';
import { SEO } from '../../components/atoms/SEO';
import { Carousel } from '../../components/molecules/Carousel';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { reviewService } from '../../services/reviewService';
import type { ProductDetail } from '../../types/product';
import type { Review } from '../../types/review';
import { tokens } from '../../tokens';

interface ProductDetailsPageProps {
  onAddToCart: (data: { 
    vendor_product_id: number; 
    variant_id: number | null; 
    quantity: number;
    product_data?: {
      id: string | number;
      image: string;
      title: string;
      price: number;
      variant_name?: string | null;
    }
  }) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
  isLoading?: boolean;
}

export function ProductDetailsPage({ onAddToCart, onToggleWishlist, wishlistItems, isLoading }: ProductDetailsPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // High-end zoom state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Review Form State
  const [reviewText, setReviewText] = useState('');
  const [reviewStar, setReviewStar] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Reviews List State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPerPage] = useState(12);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  // Variant selection state: { [keyId: number]: valueId: number }
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const response = await productService.getBySlug(slug);
        if (response.status && response.data) {
          setProduct(response.data);
          
           // Initialize hierarchical default choices
           const mainVendorProduct = response.data.vendors[0]?.vendor_product;
           if (mainVendorProduct?.configuration_tree?.length > 0) {
             const initialOptions: Record<number, number> = {};
             
             const walkAndSelectDefaults = (currentLevel: any[]) => {
               const keyNode = currentLevel.find(item => item.type === 'key');
               if (!keyNode || !keyNode.children?.length) return;
               
               const firstChild = keyNode.children[0];
               initialOptions[keyNode.id] = firstChild.id;
               
               if (firstChild.children) walkAndSelectDefaults(firstChild.children);
             };
 
             walkAndSelectDefaults(mainVendorProduct.configuration_tree);
             setSelectedOptions(initialOptions);
           }
        } else {
          setError(response.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const mainVendorWrap = product?.vendors[0];
  const mainVendorProduct = mainVendorWrap?.vendor_product;

  // Fetch reviews function
  const fetchReviews = async (page: number = 1) => {
    if (!mainVendorProduct) return;

    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await reviewService.getReviews('products', mainVendorProduct.id, {
        page,
        per_page: reviewsPerPage
      });
      if (response.status) {
        setReviews(response.data);
        setReviewsTotal(response.pagination.total);
        setReviewsPage(page);
      } else {
        setReviewsError(response.message || 'Failed to load reviews');
      }
    } catch (err) {
      setReviewsError('Failed to load reviews');
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch reviews when mainVendorProduct changes
  useEffect(() => {
    if (mainVendorProduct) {
      fetchReviews(1);
    }
  }, [mainVendorProduct]);

  // Hierarchical Variant Selection Logic
  const currentVariant = useMemo(() => {
    if (!mainVendorProduct?.configuration_tree) return null;
    
    let currentPath: any[] = mainVendorProduct.configuration_tree;
    let leafVariant: any = null;

    while (currentPath && currentPath.length > 0) {
      // Look for key level or just take the first level if it's a simple product structure
      const keyLevel = currentPath.find(item => item.type === 'key' || item.type === 'simple');
      if (!keyLevel) break;

      const selectedValueId = selectedOptions[keyLevel.id];
      // If we have a selected option, use it; otherwise just take the first child (common for simple items)
      const selectedValue = keyLevel.children?.find((c: any) => c.id === selectedValueId) || keyLevel.children?.[0];

      if (!selectedValue) break;

      if (selectedValue.variant) {
        leafVariant = selectedValue.variant;
        break;
      }

      currentPath = selectedValue.children || [];
    }
    
    return leafVariant;
  }, [mainVendorProduct, selectedOptions]);

  // Price range calculation - now deep scans the full tree
  const priceRange = useMemo(() => {
    if (!mainVendorProduct?.configuration_tree) return null;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let hasVariants = false;

    const scanForVariants = (items: any[]) => {
      items.forEach(item => {
        if (item.variant) {
          const price = parseFloat(item.variant.real_price);
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
          hasVariants = true;
        }
        if (item.children) scanForVariants(item.children);
      });
    };

    scanForVariants(mainVendorProduct.configuration_tree);

    if (!hasVariants) return null;
    return { min: minPrice, max: maxPrice };
  }, [mainVendorProduct]);

  // Derived price and stock values (computed before early returns)
  const currentPrice = currentVariant ? currentVariant.real_price : null;
  const currentFake = currentVariant ? currentVariant.fake_price : null;

  // SAFE STOCK DETECTION: Check variant first, then main product, with fallbacks to 'stock' fields
  const currentStock = currentVariant
    ? (currentVariant.remaining_stock !== undefined ? currentVariant.remaining_stock : (currentVariant as any).stock ?? 0)
    : (mainVendorProduct?.remaining_stock !== undefined ? mainVendorProduct.remaining_stock : (mainVendorProduct as any)?.stock ?? 0);

  // Auto-adjust quantity based on stock - placed before early returns
  useEffect(() => {
    // Only adjust after product data is loaded
    if (!mainVendorProduct) return;

    const stock = currentStock;

    if (stock <= 0) {
      // Out of stock
      if (quantity !== 0) setQuantity(0);
    } else if (quantity === 0) {
      // In stock and quantity is 0 (maybe from previous state), set to 1
      setQuantity(1);
    } else if (quantity > stock) {
      // Quantity exceeds available stock, reduce to max available
      setQuantity(stock);
    }
  }, [currentVariant, mainVendorProduct, quantity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product || !mainVendorProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-6 animate-bounce">⚠️</div>
        <h2 className="text-4xl font-black mb-6" style={{ color: tokens.colors[mode].text.primary }}>
          {error || 'Product Not Found'}
        </h2>
        <Link 
          to="/products" 
          className="px-10 py-4 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: tokens.gradients.primary, color: '#fff' }}
        >
          Explore All Products
        </Link>
      </div>
    );
  }

  const images = (currentVariant?.images && currentVariant.images.length > 0)
    ? currentVariant.images
    : (mainVendorProduct.images && mainVendorProduct.images.length > 0) 
    ? mainVendorProduct.images 
    : (product.images && product.images.length > 0)
    ? product.images
    : [mainVendorProduct.image || product.image || 'https://via.placeholder.com/600?text=No+Image'];

  const tabs = [
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'instructions', label: 'Instructions', icon: '📖' },
    { id: 'material', label: 'Material', icon: '🧶' },
    { id: 'extras', label: 'Extras', icon: '➕' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ].filter(tab => {
    if (tab.id === 'details') return !!mainVendorProduct.details || !!product.details;
    if (tab.id === 'summary') return !!mainVendorProduct.summary || !!product.summary;
    if (tab.id === 'features') return !!mainVendorProduct.features || !!product.features;
    if (tab.id === 'instructions') return !!mainVendorProduct.instructions || !!product.instructions;
    if (tab.id === 'material') return !!mainVendorProduct.material || !!product.material;
    if (tab.id === 'extras') return !!mainVendorProduct.extras || !!product.extras;
    return true;
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewText.trim()) return;
    
    setSubmittingReview(true);
    setReviewSuccess(false);
    try {
      await reviewService.postReview('products', mainVendorProduct.id, {
        review: reviewText,
        star: reviewStar
      });
      setReviewSuccess(true);
      setReviewText('');
      setReviewStar(5);
    } catch (err) {
      console.error('Failed to post review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    // Resolve version/variant names from IDs
    const variantLabels: string[] = [];
    const findLabels = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.type === 'key') {
          const selectedId = selectedOptions[node.id];
          const valNode = node.children?.find((c: any) => c.id === selectedId);
          if (valNode) {
            variantLabels.push(valNode.name);
            if (valNode.children) findLabels(valNode.children);
          }
        }
      });
    };
    if (mainVendorProduct.configuration_tree) findLabels(mainVendorProduct.configuration_tree);

    onAddToCart({
      vendor_product_id: mainVendorProduct.id,
      variant_id: currentVariant?.id || null,
      quantity: quantity,
      product_data: {
        id: currentVariant?.id || mainVendorProduct.id,
        image: images[0],
        title: mainVendorProduct.name,
        price: parseFloat(currentPrice || priceRange?.min || '0'),
        variant_name: variantLabels.length > 0 ? variantLabels.join(' / ') : null
      }
    });
  };

  return (
    <div className="min-h-screen py-10 transition-colors duration-300" style={{ background: tokens.colors[mode].background.base }}>
      {(() => {
        const stripHtml = (html: string) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          return doc.body.textContent || "";
        };

        const rawDesc = mainVendorProduct.meta_description || mainVendorProduct.summary || mainVendorProduct.description || '';
        const cleanDesc = stripHtml(rawDesc).substring(0, 160);

        return (
          <SEO 
            title={mainVendorProduct.name} 
            description={cleanDesc}
            keywords={Array.isArray(mainVendorProduct.meta_keywords) ? mainVendorProduct.meta_keywords.join(', ') : mainVendorProduct.meta_keywords || ''}
            image={images[0]}
            type="product"
          />
        );
      })()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadCrumb 
          items={[
            { label: t('common:home'), path: '/' },
            { label: mainVendorProduct.department.name, path: `/department/${mainVendorProduct.department.slug}` },
            { label: mainVendorProduct.category.name, path: `/category/${mainVendorProduct.category.slug}` },
            ...(mainVendorProduct.sub_category ? [{ label: mainVendorProduct.sub_category.name, path: `/sub-category/${mainVendorProduct.sub_category.slug}` }] : []),
            { label: mainVendorProduct.name, path: `/product/${product.slug}` }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20 mt-4 sm:mt-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="rounded-[24px] sm:rounded-[40px] overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative">
              <Carousel 
                autoPlay={false} 
                showDots={false} 
                showArrows={true}
                activeSlide={selectedImage}
                onSlideChange={(idx) => setSelectedImage(idx)}
                variant="standalone"
              >
                {images.map((img: string, idx: number) => (
                  <div 
                    key={idx}
                    className="relative aspect-square rounded-[40px] overflow-hidden group/main cursor-zoom-in"
                    style={{ backgroundColor: tokens.colors[mode].surface.elevated }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setZoomPos({ x, y });
                    }}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onClick={() => { setShowGallery(true); setGalleryIndex(idx); }}
                  >
                    <img 
                      src={img}
                      alt={mainVendorProduct.name}
                      className="w-full h-full object-contain p-8 lg:p-12 transition-transform duration-300"
                      style={{
                        transform: isZoomed && selectedImage === idx ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />

                    {/* Lens UI */}
                    {isZoomed && selectedImage === idx && (
                      <div 
                        className="absolute pointer-events-none border-2 border-white/40 shadow-2xl bg-white/10 backdrop-blur-[2px] z-20"
                        style={{
                          width: '180px',
                          height: '180px',
                          left: `${zoomPos.x}%`,
                          top: `${zoomPos.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </Carousel>
              
              <div className="absolute top-6 left-6 flex flex-col gap-3 z-10 pointer-events-none">
                {mainVendorProduct.points > 0 && (
                  <div className="px-4 py-2 rounded-xl font-black bg-yellow-400 text-black shadow-lg shadow-yellow-400/30 text-sm">
                    ✨ {mainVendorProduct.points} {t('common:points')}
                  </div>
                )}
                {currentVariant?.discount && (
                  <div className="px-4 py-2 rounded-xl font-black bg-rose-500 text-white shadow-lg shadow-rose-500/30 text-sm">
                    -{currentVariant.discount}% {t('common:off')}
                  </div>
                )}
              </div>

              {/* Side Zoom Preview Container */}
              <AnimatePresence>
                {isZoomed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    className="fixed top-1/2 -translate-y-1/2 left-[calc(50%+20px)] w-[600px] h-[600px] rounded-[48px] z-[100] border-8 border-white dark:border-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden hidden lg:block"
                    style={{ backgroundColor: tokens.colors[mode].surface.base }}
                  >
                    <div 
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${images[selectedImage]})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '400%',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-white"
                    style={{
                      borderColor: selectedImage === idx ? tokens.colors[mode].primary.DEFAULT : 'transparent',
                      opacity: selectedImage === idx ? 1 : 0.6
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link 
                  to={`/department/${mainVendorProduct.department.slug}`}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300 border border-transparent hover:border-primary/20"
                >
                  <span className="opacity-40">{t('common:department')}:</span>
                  <span className="flex items-center gap-1.5">🏢 {mainVendorProduct.department.name}</span>
                </Link>
                <Link 
                  to={`/category/${mainVendorProduct.category.slug}`}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300 border border-transparent hover:border-primary/20"
                >
                  <span className="opacity-40">{t('common:category')}:</span>
                  <span className="flex items-center gap-1.5">🗂️ {mainVendorProduct.category.name}</span>
                </Link>
                {mainVendorProduct.sub_category && (
                  <Link 
                    to={`/sub-category/${mainVendorProduct.sub_category.slug}`}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300 border border-transparent hover:border-primary/20"
                  >
                    <span className="opacity-40">{t('common:subcategory')}:</span>
                    <span className="flex items-center gap-1.5">🔖 {mainVendorProduct.sub_category.name}</span>
                  </Link>
                )}
                {mainVendorProduct.brand && (
                  <Link 
                    to={`/brand/${mainVendorProduct.brand.slug}`}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black bg-primary/10 text-primary uppercase tracking-widest border border-primary/20 hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    <span className="opacity-60">{t('common:brand')}:</span>
                    <span className="flex items-center gap-1.5">🏷️ {mainVendorProduct.brand.title}</span>
                  </Link>
                )}
                {mainVendorProduct.status && (
                  <span className="px-4 py-2 rounded-xl text-[11px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {mainVendorProduct.status}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight" style={{ color: tokens.colors[mode].text.primary }}>
                  {mainVendorProduct.name}
                </h1>
                
                {(mainVendorProduct.review_avg_star > 0 || (mainVendorProduct.reviews?.avg_star || 0) > 0) && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-400 font-black text-black shadow-lg shadow-yellow-400/20 animate-fadeIn">
                    <span className="text-sm">⭐</span>
                    <span className="text-lg">{mainVendorProduct.review_avg_star || mainVendorProduct.reviews?.avg_star}</span>
                    <span className="opacity-40 text-xs">
                      ({mainVendorProduct.reviews_count || mainVendorProduct.reviews?.total_reviews} {t('common:reviews')})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <p className="px-3 py-1 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-500" style={{ fontFamily: 'monospace' }}>
                  SKU: {currentVariant?.sku || mainVendorProduct.sku}
                </p>
              </div>
            </div>

            <div 
              className="p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] border relative overflow-hidden group shadow-xl"
              style={{
                background: tokens.colors[mode].surface.base,
                borderColor: tokens.colors[mode].border.DEFAULT
              }}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {currentPrice ? t('common:priceForSelection') : t('common:startingFrom')}
                  </span>
                  
                  {currentStock > 0 ? (
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-tighter flex items-center gap-1.5 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {currentStock} {t('common:unitsLeft', 'Units In Stock')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-rose-500/10 text-rose-500 uppercase tracking-tighter flex items-center gap-1.5 border border-rose-500/20">
                      ❌ {t('common:outOfStock', 'Out of Stock')}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
                    <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <CurrencyDisplay amount={currentPrice || priceRange?.min || 0} size="lg" />
                    </span>
                    {(currentFake || (priceRange?.max && priceRange.max > priceRange.min)) && (
                      <span className="text-xl font-bold text-slate-400 line-through opacity-60">
                        <CurrencyDisplay amount={currentFake || priceRange?.max || 0} size="md" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {(() => {
              const nodesToRender = [];
              let currentPath: any[] = mainVendorProduct.configuration_tree;

              while (currentPath && currentPath.length > 0) {
                const keyNode = currentPath.find(item => item.type === 'key');
                if (!keyNode) break;

                nodesToRender.push(keyNode);

                const selectedId = selectedOptions[keyNode.id];
                const selectedVal = keyNode.children?.find((c: any) => c.id === selectedId);
                
                if (!selectedVal || !selectedVal.children) break;
                currentPath = selectedVal.children;
              }

              return nodesToRender.map((key) => (
                <div key={key.id} className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: tokens.colors[mode].text.secondary }}>
                    {t('common:select')} {key.name}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {key.children.map((child: any) => {
                      const isSelected = selectedOptions[key.id] === child.id;
                      const isColor = child.type === 'color' || !!child.color;
                      
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setSelectedOptions(prev => {
                              const next = { ...prev, [key.id]: child.id };
                              
                              const selectDeepDefaults = (level: any[]) => {
                                const nextKey = level.find(item => item.type === 'key');
                                if (!nextKey || !nextKey.children?.length) return;

                                const first = nextKey.children[0];
                                next[nextKey.id] = first.id;
                                if (first.children) selectDeepDefaults(first.children);
                              };

                              if (child.children) selectDeepDefaults(child.children);
                              return next;
                            });
                          }}
                          className={`group relative flex items-center justify-center transition-all duration-300 ${isColor ? 'w-12 h-12 rounded-full' : 'px-6 py-3 rounded-2xl min-w-[3rem]'}`}
                          style={{
                            background: isSelected 
                              ? (isColor ? tokens.colors[mode].surface.base : tokens.gradients.primary)
                              : tokens.colors[mode].surface.elevated,
                            border: `2px solid ${isSelected ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].border.DEFAULT}`,
                            color: isSelected && !isColor ? '#fff' : tokens.colors[mode].text.primary,
                            boxShadow: isSelected ? `0 8px 24px ${tokens.colors[mode].primary.DEFAULT}30` : 'none'
                          }}
                        >
                          {isColor ? (
                            <span 
                              className="w-8 h-8 rounded-full border border-white/20 shadow-inner block"
                              style={{ background: child.color || child.value || '' }}
                            />
                          ) : (
                            <span className="font-bold">{child.name}</span>
                          )}
                          {isColor && (
                            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {child.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}

            <Link 
              to={`/vendors/${mainVendorWrap.vendor.slug}`}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center gap-3 sm:gap-4 transition-all hover:border-primary/30 group/vendor"
              style={{
                background: tokens.colors[mode].surface.elevated,
                borderColor: tokens.colors[mode].border.DEFAULT
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-sm border border-slate-100 flex items-center justify-center">
                <img src={mainVendorWrap.vendor.logo} alt="" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-500 uppercase tracking-tighter mb-1">Authentic Product From</p>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-lg underline decoration-primary/30 underline-offset-4 group-hover/vendor:text-primary transition-colors">{mainVendorWrap.vendor.name}</h4>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-400/10 text-yellow-500">
                    <span className="text-xs font-black">{mainVendorWrap.vendor.star || 0}</span>
                    <span>⭐</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-2 pt-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 dark:bg-slate-800/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={currentStock <= 0}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-slate-700 font-bold transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: tokens.colors[mode].text.primary }}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-lg sm:text-xl font-black" style={{ color: tokens.colors[mode].text.primary }}>{quantity}</span>
                  <button
                    onClick={() => {
                      if (quantity < currentStock) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={currentStock <= 0 || quantity >= currentStock}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-slate-700 font-bold transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: tokens.colors[mode].text.primary }}
                  >
                    +
                  </button>
                </div>
                
                <div className="flex-1 flex gap-2 sm:gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0 || isLoading}
                    className="flex-[3] py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg shadow-xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                    style={{ background: tokens.gradients.primary, color: '#fff' }}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>🛒 {t('common:addToCart', 'Add to Cart')}</span>
                    )}
                  </button>
                  <button
                    onClick={() => onToggleWishlist(mainVendorProduct.id)}
                    className="w-12 sm:flex-1 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg"
                    style={{
                      background: wishlistItems.includes(mainVendorProduct.id) ? tokens.gradients.primary : 'transparent',
                      borderColor: tokens.colors[mode].border.DEFAULT,
                      color: wishlistItems.includes(mainVendorProduct.id) ? '#fff' : 'inherit'
                    }}
                  >
                    {wishlistItems.includes(mainVendorProduct.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>

              {quantity > 1 && (
                <div className="px-2 flex items-center gap-2 text-slate-500 animate-fadeIn">
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">
                    {t('common:totalPrice', 'Selection Total')}:
                  </span>
                  <span className="text-base font-black text-primary">
                    <CurrencyDisplay 
                      amount={parseFloat(currentPrice || priceRange?.min || '0') * quantity} 
                      size="sm" 
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {tabs.length > 0 && (
          <div className="mb-12 sm:mb-20">
            <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-8 py-3 sm:py-5 font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
                >
                  {t(`common:${tab.id}`)}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_-4px_10px_rgba(99,102,241,0.5)] z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div 
              className="p-5 sm:p-10 rounded-[20px] sm:rounded-[40px] border shadow-2xl relative overflow-hidden min-h-[200px]"
              style={{
                background: tokens.colors[mode].surface.base,
                borderColor: tokens.colors[mode].border.DEFAULT
              }}
            >
              <div className="absolute top-0 right-0 p-8 text-8xl grayscale opacity-10 dark:opacity-5 pointer-events-none select-none">
                {tabs.find(t => t.id === activeTab)?.icon}
              </div>
              
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {activeTab === 'details' && (
                      <div className="prose dark:prose-invert max-w-none prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: mainVendorProduct.details || product.details || '' }} />
                    )}
                    {activeTab === 'summary' && (
                      <div className="prose dark:prose-invert max-w-none prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: mainVendorProduct.summary || product.summary || '' }} />
                    )}
                    {activeTab === 'features' && (
                      <div className="prose dark:prose-invert max-w-none prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: mainVendorProduct.features || product.features || '' }} />
                    )}
                    {activeTab === 'instructions' && (
                      <div className="prose dark:prose-invert max-w-none prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: mainVendorProduct.instructions || product.instructions || '' }} />
                    )}
                    {activeTab === 'material' && (
                      <div className="prose dark:prose-invert max-w-none prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: mainVendorProduct.material || product.material || '' }} />
                    )}
                    {activeTab === 'extras' && (
                      <div className="prose dark:prose-invert max-w-none prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: mainVendorProduct.extras || product.extras || '' }} />
                    )}
                    {activeTab === 'reviews' && (
                      <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                          <h3 className="text-2xl font-black mb-2" style={{ color: tokens.colors[mode].text.primary }}>
                            {t('common:writeReview', 'Write a Review')}
                          </h3>
                          <p className="opacity-60 font-bold" style={{ color: tokens.colors[mode].text.secondary }}>
                            {t('common:shareExperience', 'Share your experience with this product')}
                          </p>
                        </div>
                        
                        {authLoading ? (
                          <div className="space-y-6 animate-pulse">
                            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-1/3"></div>
                            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full"></div>
                            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl w-48"></div>
                          </div>
                        ) : isAuthenticated ? (
                          <>
                            {reviewSuccess && (
                              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black flex items-center gap-3 animate-fadeIn">
                                <span className="text-xl">✅</span>
                                {t('common:reviewSubmitted', 'Thank you! Your review has been submitted successfully.')}
                              </div>
                            )}

                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                              <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest opacity-60" style={{ color: tokens.colors[mode].text.primary }}>
                                  {t('common:rating', 'Rating')}
                                </label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewStar(star)}
                                      className={`text-4xl transition-all hover:scale-110 active:scale-90 ${reviewStar >= star ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-300 dark:text-slate-700 grayscale'}`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest opacity-60" style={{ color: tokens.colors[mode].text.primary }}>
                                  {t('common:yourReview', 'Your Review')}
                                </label>
                                <textarea
                                  required
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  rows={5}
                                  className="w-full rounded-2xl p-6 border focus:ring-4 outline-none transition-all font-bold resize-none"
                                  style={{
                                    background: tokens.colors[mode].surface.base,
                                    borderColor: tokens.colors[mode].border.DEFAULT,
                                    color: tokens.colors[mode].text.primary,
                                    '--tw-ring-color': `${tokens.colors[mode].primary.DEFAULT}30`
                                  } as React.CSSProperties}
                                  placeholder={t('common:reviewPlaceholder', 'What do you think about this product?')}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={submittingReview || !reviewText.trim()}
                                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
                                style={{ background: tokens.gradients.primary, color: '#fff' }}
                              >
                                {submittingReview ? t('common:submitting', 'Submitting...') : t('common:submitReview', 'Submit Review')}
                              </button>
                            </form>
                          </>
                        ) : (
                          <div 
                            className="p-8 sm:p-12 rounded-[32px] border-2 border-dashed text-center space-y-6 sm:space-y-8 animate-fadeIn"
                            style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: `${tokens.colors[mode].primary.DEFAULT}05` }}
                          >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-4xl sm:text-5xl animate-bounce">
                              🔒
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="text-xl sm:text-3xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                                {t('common:loginToReview', 'Register or Login to Write a Review')}
                              </h3>
                              <p className="max-w-md mx-auto font-bold opacity-60 text-sm sm:text-base" style={{ color: tokens.colors[mode].text.secondary }}>
                                {t('common:loginToReviewDesc', 'Join our community to share your thoughts and help others make better decisions.')}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                              <Link 
                                to="/login"
                                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm uppercase tracking-widest"
                                style={{ background: tokens.gradients.primary, color: '#fff' }}
                              >
                                {t('common:login', 'Login Now')}
                              </Link>
                              <Link 
                                to="/register"
                                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black border-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-sm uppercase tracking-widest"
                                style={{ borderColor: tokens.colors[mode].border.DEFAULT, color: tokens.colors[mode].text.primary }}
                              >
                                {t('common:signUp', 'Create Account')}
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                              {t('common:customerReviews', 'Customer Reviews')} ({reviewsTotal})
                            </h3>
                          </div>

                        {reviewsLoading ? (
                          <div className="space-y-6 animate-pulse">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-6 rounded-3xl border" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
                                  </div>
                                </div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                              </div>
                            ))}
                          </div>
                        ) : reviewsError ? (
                          <div className="p-8 rounded-3xl text-center border-2" style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: `${tokens.colors[mode].primary.DEFAULT}05` }}>
                            <div className="text-4xl mb-4">❌</div>
                            <p className="font-black" style={{ color: tokens.colors[mode].text.primary }}>{reviewsError}</p>
                            <button
                              onClick={() => fetchReviews(reviewsPage)}
                              className="mt-4 px-6 py-2 rounded-xl font-black"
                              style={{ background: tokens.gradients.primary, color: '#fff' }}
                            >
                              {t('common:retry', 'Retry')}
                            </button>
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="p-12 rounded-3xl text-center border-2" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
                            <div className="text-6xl mb-4">📝</div>
                            <h4 className="text-xl font-black mb-2" style={{ color: tokens.colors[mode].text.primary }}>
                              {t('common:noReviewsYet', 'No Reviews Yet')}
                            </h4>
                            <p className="opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>
                              {t('common:noReviewsDesc', 'Be the first to share your thoughts!')}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {reviews.map((review, index) => (
                              <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-3xl border hover:shadow-lg transition-all"
                                style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: tokens.gradients.surface[mode] }}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Customer Avatar */}
                                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: tokens.colors[mode].primary.DEFAULT + '40' }}>
                                    {review.customer?.image ? (
                                      <img src={review.customer.image} alt={review.customer.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: tokens.gradients.primary, color: '#fff' }}>
                                        {review.customer?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h5 className="font-black text-lg mb-1 truncate" style={{ color: tokens.colors[mode].text.primary }}>
                                          {review.customer?.full_name || 'Anonymous'}
                                        </h5>
                                        <div className="flex items-center gap-2">
                                          <div className="text-lg">
                                            {'★'.repeat(review.star)}{'☆'.repeat(5 - review.star)}
                                          </div>
                                          <span className="text-xs opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>
                                            {review.created_at}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <p className="font-medium leading-relaxed" style={{ color: tokens.colors[mode].text.secondary }}>
                                      {review.review}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Pagination */}
                        {reviewsTotal > reviewsPerPage && (
                          <div className="flex items-center justify-center gap-2 pt-6">
                            <button
                              onClick={() => fetchReviews(reviewsPage - 1)}
                              disabled={reviewsPage === 1 || reviewsLoading}
                              className="px-4 py-2 rounded-xl font-black border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                              style={{ borderColor: tokens.colors[mode].border.DEFAULT, color: tokens.colors[mode].text.primary }}
                            >
                              ← {t('common:previous', 'Previous')}
                            </button>
                            <div className="flex gap-2">
                              {Array.from({ length: Math.ceil(reviewsTotal / reviewsPerPage) }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === reviewsTotal || Math.abs(page - reviewsPage) <= 1)
                                .map((page, idx, arr) => (
                                  <div key={page} style={{ display: 'contents' }}>
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                      <span className="px-2" style={{ color: tokens.colors[mode].text.secondary }}>...</span>
                                    )}
                                    <button
                                      onClick={() => fetchReviews(page)}
                                      className={`px-4 py-2 rounded-xl font-black transition-all hover:scale-105 active:scale-95 ${reviewsPage === page ? 'shadow-lg' : ''}`}
                                      style={{
                                        background: reviewsPage === page ? tokens.gradients.primary : tokens.colors[mode].surface.base,
                                        color: reviewsPage === page ? '#fff' : tokens.colors[mode].text.primary,
                                        border: reviewsPage === page ? 'none' : `2px solid ${tokens.colors[mode].border.DEFAULT}`
                                      }}
                                    >
                                      {page}
                                    </button>
                                  </div>
                                ))}
                            </div>
                            <button
                              onClick={() => fetchReviews(reviewsPage + 1)}
                              disabled={reviewsPage >= Math.ceil(reviewsTotal / reviewsPerPage) || reviewsLoading}
                              className="px-4 py-2 rounded-xl font-black border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                              style={{ borderColor: tokens.colors[mode].border.DEFAULT, color: tokens.colors[mode].text.primary }}
                            >
                              {t('common:next', 'Next')} →
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {mainVendorProduct.video_link && (
          <div className="mb-20">
            <h2 className="text-3xl font-black mb-8 px-4" style={{ color: tokens.colors[mode].text.primary }}>
              📺 {t('common:productVideo')}
            </h2>
            <div className="aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <iframe 
                src={mainVendorProduct.video_link.replace('watch?v=', 'embed/')} 
                className="w-full h-full"
                allowFullScreen
                title={mainVendorProduct.name}
              />
            </div>
          </div>
        )}
      </div>

      {showGallery && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fadeIn p-4"
          onClick={() => setShowGallery(false)}
        >
          <button className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-all z-[1100]">✕</button>
          
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Carousel 
              autoPlay={false} 
              showDots={true} 
              showArrows={true}
              activeSlide={galleryIndex}
              onSlideChange={(idx) => setGalleryIndex(idx)}
            >
              {images.map((img: string, idx: number) => (
                <div key={idx} className="flex items-center justify-center p-4">
                  <img 
                    src={img} 
                    alt="Gallery Full" 
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
}
