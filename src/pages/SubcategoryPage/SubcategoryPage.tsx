import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useParams } from 'react-router-dom';
import { departments, products } from '../../data/products';
import { ProductCard } from '../../components/molecules/ProductCard';
import { Pagination } from '../../components/molecules/Pagination';

interface SubcategoryPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function SubcategoryPage({ onAddToCart, onToggleWishlist, wishlistItems }: SubcategoryPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);
  
  const itemsPerPage = 12;

  // Find subcategory and its parent category/department
  let subcategory: any = null;
  let category: any = null;
  let department: any = null;

  for (const dept of departments) {
    for (const cat of dept.categories) {
      const sub = cat.subcategories.find((s) => s.id === subcategoryId);
      if (sub) {
        subcategory = sub;
        category = cat;
        department = dept;
        break;
      }
    }
    if (subcategory) break;
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen py-4">
        <BreadCrumb 
          items={[
            { label: t('common:home'), path: '/' },
            { label: t('common:departments'), path: '/departments' },
            { label: t('common:notFound'), path: '#' }
          ]}
        />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">❌</div>
          <h1 
            className="text-4xl font-black mb-4"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('common:subcategoryNotFound')}
          </h1>
        </div>
      </div>
    );
  }

  // Filter and sort products
  let filteredProducts = products.filter(
    (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  if (selectedRating > 0) {
    filteredProducts = filteredProducts.filter((product) => product.rating >= selectedRating);
  }

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen py-4">
      <BreadCrumb 
        items={[
          { label: t('common:home'), path: '/' },
          { label: t('common:departments'), path: '/departments' },
          { label: department.name, path: `/department/${department.id}` },
          { label: category.name, path: `/category/${category.id}` },
          { label: subcategory.name, path: `/subcategory/${subcategory.id}` }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 
          className="text-5xl font-black mb-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {subcategory.name}
        </h1>
        <p 
          className="text-xl font-bold opacity-60"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {subcategory.count} {t('common:productsAvailable')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div 
            className="p-6 rounded-3xl sticky top-24"
            style={{
              background: mode === 'light'
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(26, 34, 53, 0.8)',
              backdropFilter: 'blur(20px)',
              border: mode === 'light'
                ? '1px solid #e2e8f0'
                : '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 
              className="text-2xl font-black mb-6"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {t('common:filters')}
            </h3>

            {/* Sort By */}
            <div className="mb-8">
              <label 
                className="block text-sm font-bold mb-3"
                style={{ color: mode === 'light' ? '#475569' : '#cbd5e1' }}
              >
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: tokens.colors[mode].surface.base,
                  borderColor: tokens.colors[mode].border.DEFAULT,
                  color: tokens.colors[mode].text.primary,
                  '--tw-ring-color': `${tokens.colors[mode].primary.DEFAULT}20`
                } as any}
              >
                <option value="featured">{t('common:featured')}</option>
                <option value="price-low">{t('common:priceLowHigh')}</option>
                <option value="price-high">{t('common:priceHighLow')}</option>
                <option value="rating">{t('common:highestRated')}</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <label 
                className="block text-sm font-bold mb-3"
                style={{ color: mode === 'light' ? '#475569' : '#cbd5e1' }}
              >
                Price Range
              </label>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: tokens.colors[mode].surface.base,
                    borderColor: tokens.colors[mode].border.DEFAULT,
                    color: tokens.colors[mode].text.primary,
                    '--tw-ring-color': `${tokens.colors[mode].primary.DEFAULT}20`
                  } as any}
                  placeholder={t('common:min')}
                />
                <span style={{ color: tokens.colors[mode].text.tertiary }}>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: tokens.colors[mode].surface.base,
                    borderColor: tokens.colors[mode].border.DEFAULT,
                    color: tokens.colors[mode].text.primary,
                    '--tw-ring-color': `${tokens.colors[mode].primary.DEFAULT}20`
                  } as any}
                  placeholder={t('common:max')}
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-8">
              <label 
                className="block text-sm font-bold mb-3"
                style={{ color: mode === 'light' ? '#475569' : '#cbd5e1' }}
              >
                Minimum Rating
              </label>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating === selectedRating ? 0 : rating)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: selectedRating === rating
                        ? `${tokens.colors[mode].primary.DEFAULT}1A`
                        : 'transparent',
                      border: selectedRating === rating
                        ? `2px solid ${tokens.colors[mode].primary.DEFAULT}`
                        : `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                      color: tokens.colors[mode].text.primary
                    }}
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < rating ? 'text-warning' : 'text-slate-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-bold">& {t('common:up')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSortBy('featured');
                setPriceRange([0, 1000]);
                setSelectedRating(0);
              }}
              className="w-full px-6 py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                background: tokens.colors[mode].surface.base,
                color: tokens.colors[mode].text.primary,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
              }}
            >
              {t('common:resetFilters')}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {currentProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h2 
                className="text-3xl font-black mb-4"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {t('common:noProductsFound')}
              </h2>
              <p 
                className="text-lg font-bold opacity-60"
                style={{ color: tokens.colors[mode].text.secondary }}
              >
                {t('common:tryAdjustingFilters')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    name={product.title}
                    real_price={product.price}
                    fake_price={product.originalPrice}
                    review_avg_star={product.rating}
                    isInWishlist={wishlistItems.includes(product.id)}
                    onAddToCart={() => onAddToCart(product.id)}
                    onToggleWishlist={() => onToggleWishlist(product.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
