import { useTranslation } from 'react-i18next';
import { ProductCatalog } from '../components/organisms/ProductCatalog/ProductCatalog';

interface NewArrivalsPageProps {
  onAddToCart?: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function NewArrivalsPage({ onAddToCart, onToggleWishlist, wishlistItems }: NewArrivalsPageProps) {
  const { t } = useTranslation();

  return (
    <div className="py-12">
      <ProductCatalog
        title={t('newArrivalsTitle', '🆕 New Arrivals')}
        description={t('newArrivalsSubtitle', 'Check out our latest collection of amazing products')}
        initialFilters={{ 
          sort_by: 'created_at', 
          sort_type: 'desc' 
        }}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistItems={wishlistItems}
        hideAddToCart={true}
      />
    </div>
  );
}
