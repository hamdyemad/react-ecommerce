import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { ProductCard } from '../../components/molecules/ProductCard';
import { Button } from '../../components/atoms/Button';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useWishlist } from '../../hooks/useWishlist';
import { useNavigate } from 'react-router-dom';

interface WishlistPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function WishlistPage({ onAddToCart, onToggleWishlist, wishlistItems }: WishlistPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { wishlist, loading, clearWishlist } = useWishlist();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('myWishlist'), path: '/wishlist' }
          ]}
        />

        {/* Improved Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-6 sm:mt-10">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <h1 
              className="text-4xl sm:text-5xl font-black mb-2 relative z-10 flex items-center gap-4"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              <span className="text-3xl sm:text-4xl">❤️</span>
              {t('myWishlist')}
            </h1>
            <p 
              className="text-lg sm:text-xl font-bold opacity-60 ml-1"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              {wishlist.length} {wishlist.length === 1 ? t('item') : t('items')} {t('savedForLater')}
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="destructive"
                size="md"
                className="rounded-xl font-black px-6 py-3 shadow-lg shadow-red-500/10 hover:scale-105 transition-all text-sm uppercase tracking-wide"
                onClick={clearWishlist}
              >
                {t('clearAll')} 🗑️
              </Button>
              <Button
                variant="primary"
                size="md"
                className="rounded-xl font-black px-8 py-3 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm uppercase tracking-wide"
                style={{ background: tokens.gradients.primary }}
                onClick={() => {
                  wishlist.forEach(product => {
                    if (product.remaining_stock > 0 && product.department?.slug !== 'construction-chemicals') {
                      onAddToCart(product.id as any);
                    }
                  });
                }}
              >
                {t('addAllToCart')} 🛒
              </Button>
            </div>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          /* Refined Empty State */
          <div 
            className="text-center py-20 sm:py-32 rounded-[30px] sm:rounded-[40px] shadow-xl relative overflow-hidden"
            style={{
              background: tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="text-8xl mb-6 grayscale opacity-20">🛒</div>
            <h2 
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {t('wishlistEmpty')}
            </h2>
            <p 
              className="text-lg mb-10 opacity-60 font-medium max-w-md mx-auto px-6"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              {t('startAddingProducts')}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="rounded-xl font-black px-10 py-4 shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={() => navigate('/products')}
              style={{ background: tokens.gradients.primary }}
            >
              {t('startShopping')} 🛍️
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-fadeInScale">
            {wishlist.map((product) => (
              <div key={product.id} className="relative group/item">
                <ProductCard
                  id={product.id}
                  image={product.image}
                  name={product.name}
                  slug={product.slug}
                  real_price={product.real_price}
                  fake_price={product.fake_price || undefined}
                  review_avg_star={product.review_avg_star}
                  reviews_count={product.reviews_count}
                  brand={product.brand}
                  department={product.department}
                  category={product.category}
                  sub_category={product.sub_category}
                  remaining_stock={product.remaining_stock}
                   onAddToCart={onAddToCart as any}
                   onToggleWishlist={onToggleWishlist as any}
                   isInWishlist={wishlistItems.includes(product.id)}
                 />
                
                {product.remaining_stock <= 0 && (
                  <div 
                    className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md rounded-b-[2rem] p-3 text-center border-t border-white/10"
                    style={{ zIndex: 10 }}
                  >
                    <p className="text-white font-black text-sm uppercase tracking-widest">{t('outOfStock')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
