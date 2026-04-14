import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { ProductCatalog } from '../../components/organisms/ProductCatalog/ProductCatalog';
import { SEO } from '../../components/atoms/SEO';

interface AllProductsPageProps {
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

export function AllProductsPage({ onToggleWishlist, wishlistItems }: AllProductsPageProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');

  return (
    <div className="min-h-screen py-8 px-6 max-w-7xl mx-auto">
      <SEO title={t('common:allProducts')} />
      
      <div className="mb-6">
        <BreadCrumb
          items={[
            { label: t('common:home'), path: '/' },
            { label: t('common:allProducts'), path: '/products' }
          ]}
        />
      </div>

      <ProductCatalog 
        title={t('common:allProducts')}
        description={t('common:discoverBestSelection')}
        onToggleWishlist={onToggleWishlist}
        wishlistItems={wishlistItems}
        initialFilters={{ search: searchParam ?? '' }}
      />
    </div>
  );
}
