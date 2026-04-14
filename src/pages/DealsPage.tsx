import { ProductGrid } from '../components/organisms/ProductGrid';
import { Badge } from '../components/atoms/Badge';
import { products } from '../data/products';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { tokens } from '../tokens';

interface DealsPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist?: (id: string | number) => void;
  wishlistItems?: (string | number)[];
}

export function DealsPage({ onAddToCart, onToggleWishlist, wishlistItems = [] }: DealsPageProps) {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const saleProducts = products.filter(p => p.originalPrice);

  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <div 
        className="rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl"
        style={{
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)' 
            : 'linear-gradient(135deg, #450a0a 0%, #431407 100%)',
          border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)]" />
        
        <Badge variant="error" className="mb-6 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-lg transform hover:scale-110 transition-transform">
          {t('limitedTimeOffer') || "Limited Time Offer"}
        </Badge>
        
        <h1 
          className="text-6xl font-black mb-6 relative z-10"
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🔥 {t('hotDealsTitle') || "Hot Deals & Special Offers"}
        </h1>
        
        <p 
          className="text-2xl font-bold opacity-80 max-w-2xl mx-auto relative z-10"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('hotDealsSubtitle') || "Save up to 50% on selected items. Don't miss out!"}
        </p>
      </div>

      {/* Sale Products */}
      <div className="px-2">
        <ProductGrid
          title={t('saleItems') || "Sale Items"}
          products={saleProducts}
          badge={{ text: t('saveBig') || 'Save Big', variant: 'error' }}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistItems={wishlistItems}
        />
      </div>
    </div>
  );
}
