import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { tokens } from '../tokens';
import { BreadCrumb } from '../components/molecules/BreadCrumb';
import { SEO } from '../components/atoms/SEO';
import { ProductCatalog } from '../components/organisms/ProductCatalog/ProductCatalog';
import { vendorService } from '../services/vendorService';

interface VendorPageProps {
  onAddToCart: (data: any) => void;
  onToggleWishlist: (id: string | number) => void;
  wishlistItems: (string | number)[];
}

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const PinterestIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

const socialIconMap: Record<string, React.ReactNode> = {
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
  x: <XIcon />,
  linkedin: <LinkedInIcon />,
  pinterest: <PinterestIcon />,
};

export function VendorPage({ onAddToCart, onToggleWishlist, wishlistItems }: VendorPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const { mode } = useTheme();
  const { t } = useTranslation();

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const response = await vendorService.getBySlug(slug);
        if (response.status) setVendor(response.data);
      } catch (err) {
        console.error('Failed to load vendor', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="h-[260px] w-full bg-slate-200 dark:bg-slate-800 rounded-[50px] mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="py-20 text-center font-black" style={{ color: tokens.colors[mode].text.primary }}>
        {t('common:vendorNotFound', 'Vendor not found')}
      </div>
    );
  }

  const socialLinks = [
    { key: 'facebook', url: vendor.facebook },
    { key: 'instagram', url: vendor.instagram },
    { key: 'x', url: vendor.x },
    { key: 'linkedin', url: vendor.linkedin },
    { key: 'pinterest', url: vendor.pinterest },
  ].filter(s => !!s.url);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-7xl mx-auto pb-16">
      <SEO
        title={vendor.seo?.title || vendor.name}
        description={vendor.seo?.description || vendor.description}
        keywords={vendor.seo?.keywsords?.join(', ')}
      />

      {/* Breadcrumb */}
      <BreadCrumb
        items={[
          { label: t('common:home'), path: '/' },
          { label: vendor.name, path: `/vendors/${vendor.slug}` }
        ]}
      />

      {/* Hero Banner - same style as CategoryPage */}
      <div
        className="relative rounded-[24px] sm:rounded-[50px] overflow-hidden mb-8 sm:mb-16 shadow-2xl"
        style={{
          minHeight: '260px',
          background: vendor.banner
            ? `url(${vendor.banner}) center/cover`
            : tokens.gradients.primary,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative h-full flex items-center px-6 sm:px-12 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 text-center md:text-start w-full">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[20px] sm:rounded-[35px] bg-white flex items-center justify-center p-3 sm:p-5 shadow-2xl transform hover:scale-105 transition-all duration-500 flex-shrink-0">
              <img src={vendor.logo} alt={vendor.name} className="max-w-full max-h-full object-contain" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3 justify-center md:justify-start">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter">
                  {vendor.name}
                </h1>
                {vendor.active && (
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-green-500/20 border border-green-500/40 text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    {t('common:active', 'Active')}
                  </span>
                )}
              </div>

              {vendor.description && (
                <p className="text-sm sm:text-base text-white/80 mb-4 max-w-2xl mx-auto md:mx-0">{vendor.description}</p>
              )}

              <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center md:justify-start">
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {vendor.products_count} {t('common:products', 'Products')}
                </span>
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black text-[11px] sm:text-sm uppercase tracking-wider">
                  🌍 {vendor.country_name}
                </span>
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-yellow-400/20 backdrop-blur-xl border border-yellow-400/30 rounded-full text-yellow-300 font-black text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  ⭐ {vendor.star || 0} ({vendor.num_of_user_review} {t('common:reviews', 'reviews')})
                </span>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex md:flex-col gap-2 flex-shrink-0">
                {socialLinks.map(({ key, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 border border-white/30 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900"
                    title={key}
                  >
                    {socialIconMap[key]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: tokens.colors[mode].text.primary }}>
          {t('common:vendorProducts', "Vendor's Products")}
        </h2>
        <div className="h-1 w-16 sm:w-20 rounded-full" style={{ background: tokens.gradients.primary }} />
      </div>

      {vendor.id && (
        <ProductCatalog
          initialFilters={{ vendor_id: vendor.id }}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistItems={wishlistItems}
        />
      )}
    </div>
  );
}
