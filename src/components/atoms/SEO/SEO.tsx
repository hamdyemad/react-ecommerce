import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  type?: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  type = 'website', 
  image = '/og-image.jpg', 
  url 
}) => {
  const { t } = useTranslation('common');
  
  const { language } = useTranslation().i18n;
  
  const siteName = language === 'ar' ? 'أنيبال' : 'Anibal';
  const fullTitle = title ? `${siteName} | ${title}` : siteName;
  const metaDescription = description || t('defaultDescription', 'Anibal is your premier destination for high-quality electronics, smart home devices, and modern lifestyle accessories. Shop the best deals online.');
  const metaKeywords = keywords || t('defaultKeywords', 'electronics, smart home, online shopping, mobile phones, gadgets, anibal, انيال');
  const currentUrl = url || typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={image} />
      
      {/* Search Engine specific meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Theme color based on system/user preference */}
      <meta name="theme-color" content="#667eea" />

      {/* JSON-LD Structured Data for Sitelinks & Search */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "url": "https://anibal.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://anibal.com/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};
