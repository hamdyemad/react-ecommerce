import { type Product } from '../../../types/api';
import { ProductCard } from '../../molecules/ProductCard';
import { Badge } from '../../atoms/Badge';

interface ProductGridProps {
  title?: string;
  products: Product[] | any[];
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
  onAddToCart: (id: string | number) => void;
  onToggleWishlist?: (id: string | number) => void;
  wishlistItems?: (string | number)[];

}

export function ProductGrid({
  title = 'Featured Products',
  products,
  badge,
  onAddToCart,
  onToggleWishlist,

  wishlistItems = [],
}: ProductGridProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        {title && (
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        )}
        {badge && (
          <Badge variant={badge.variant || 'success'}>
            {badge.text}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          // Handle both old and new product structures for backward compatibility during migration
          const displayPrice = product.real_price || product.price;
          const oldPrice = product.fake_price || product.originalPrice;
          const name = product.name || product.title;
          const rating = product.review_avg_star || product.rating;

          return (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug || String(product.id)}
              image={product.image}
              name={name}
              real_price={displayPrice}
              fake_price={oldPrice}
              review_avg_star={rating}
              reviews_count={product.reviews_count}
              remaining_stock={product.remaining_stock || product.stock}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlistItems.includes(product.id)}
            />

          );
        })}
      </div>
    </section>
  );
}
