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
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('myWishlist'), path: '/wishlist' }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mb-16 relative py-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="text-7xl mb-6 relative z-10 animate-bounce">❤️</div>
        <h1 
          className="text-6xl font-black mb-4 relative z-10"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {t('myWishlist')}
        </h1>
        <p 
          className="text-2xl font-bold opacity-70"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {wishlist.length} {wishlist.length === 1 ? t('item') : t('items')} {t('savedForLater')}
        </p>
      </div>

      {/* Wishlist Content */}
      {wishlist.length === 0 ? (
        /* Empty State */
        <div 
          className="text-center py-24 rounded-[50px] shadow-2xl relative overflow-hidden"
          style={{
            background: tokens.colors[mode].surface.elevated,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
          }}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="text-9xl mb-8 opacity-30">💔</div>
          <h2 
            className="text-4xl font-black mb-6"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('wishlistEmpty')}
          </h2>
          <p 
            className="text-xl mb-12 opacity-60 font-bold max-w-lg mx-auto"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('startAddingProducts')}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="rounded-2xl font-black px-12 py-5 text-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
            onClick={() => navigate('/categories')}
            style={{ background: tokens.gradients.primary }}
          >
            {t('startShopping')} 🛍️
          </Button>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div 
            className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[35px] mb-12 shadow-xl"
            style={{
              background: tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
            }}
          >
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 
                className="text-4xl font-black mb-1"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {wishlist.length} {wishlist.length === 1 ? t('product', 'Product') : t('products', 'Products')}
              </h3>
              <p 
                className="text-lg font-bold opacity-70 uppercase tracking-widest"
                style={{ color: tokens.colors[mode].text.secondary }}
              >
                {wishlist.filter(p => p.remaining_stock > 0).length} {t('inStock')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="destructive"
                size="lg"
                className="rounded-2xl font-black px-8 shadow-xl"
                onClick={clearWishlist}
              >
                {t('clearAll')} 🗑️
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-2xl font-black px-8 shadow-xl"
                style={{ background: tokens.gradients.secondary }}
                onClick={() => console.log('Share wishlist')}
              >
                {t('share')} 📤
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="rounded-2xl font-black px-10 shadow-xl"
                style={{ background: tokens.gradients.primary }}
                onClick={() => {
                  wishlist.forEach(product => {
                    if (product.remaining_stock > 0) {
                      onAddToCart(product.id);
                    }
                  });
                }}
              >
                {t('addAllToCart')} 🛒
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={wishlistItems.includes(product.id)}
                />
                {product.remaining_stock <= 0 && (
                  <div 
                    className="absolute inset-0 rounded-[2rem] flex items-center justify-center p-6"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 20
                    }}
                  >
                    <div className="text-center transform transition-transform group-hover/item:scale-110">
                      <div className="text-5xl mb-4 bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">😔</div>
                      <p className="text-white font-black text-2xl mb-2 tracking-tight">{t('outOfStock')}</p>
                      <button className="text-white/90 text-sm font-black underline underline-offset-4 hover:text-white transition-colors">
                        {t('notifyMe')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="mt-24 pt-16 border-t border-dashed" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
            <div className="text-center mb-12">
              <h2 
                className="text-5xl font-black mb-4"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {t('youMightAlsoLike')}
              </h2>
              <p 
                className="text-xl font-bold opacity-60"
                style={{ color: tokens.colors[mode].text.secondary }}
              >
                Based on your wishlist preferences
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
