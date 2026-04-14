import { useTheme } from '../../../hooks/useTheme';
import { Link } from 'react-router-dom';
import logoEn from '../../../assets/logos/logo_en.png';
import logoEnWhite from '../../../assets/logos/logo_en_white.png';
import logoAr from '../../../assets/logos/logo_ar.png';
import logoArWhite from '../../../assets/logos/logo_ar_white.png';
import { useSettings } from '../../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../../tokens';

export function Footer() {
  const { mode } = useTheme();
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const footerSections = [
    {
      title: t('common:shop') || 'Shop',
      links: [
        { label: t('common:allProducts') || 'All Products', href: '/products' },
        { label: t('common:categories') || 'Categories', href: '/categories' },
        { label: t('common:hotDeals') || 'Hot Deals', href: '/deals' },
        { label: t('common:brands') || 'Brands', href: '/brands' },
      ]
    },
    {
      title: t('common:support') || 'Support',
      links: [
        { label: t('common:contactUs') || 'Contact Us', href: '/contact' },
        { label: t('common:returnPolicy') || 'Returns & Refunds', href: '/return-policy' },
        { label: t('common:faqs') || 'FAQs', href: '/faqs' },
        { label: t('common:trackOrder') || 'Track Order', href: '/profile/orders' },
      ]
    },
    {
      title: t('common:company') || 'Company',
      links: [
        { label: t('common:aboutUs') || 'About Us', href: '/about-us' },
        { label: t('common:terms') || 'Terms of Service', href: '/terms' },
        { label: t('common:privacy') || 'Privacy Policy', href: '/privacy-policy' },
      ]
    }
  ];

  const socialLinks = [
    { 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>, 
      label: 'Facebook', 
      href: settings?.facebook_url 
    },
    { 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>, 
      label: 'Instagram', 
      href: settings?.instagram_url 
    },
    { 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, 
      label: 'Twitter', 
      href: settings?.twitter_url 
    },
    { 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, 
      label: 'LinkedIn', 
      href: settings?.linkedin_url 
    },
  ].filter(link => link.href);

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '🎴' },
    { name: 'PayPal', icon: '🅿️' },
    { name: 'Apple Pay', icon: '🍎' },
    { name: 'Google Pay', icon: '🤖' },
  ];

  return (
    <footer 
      className="relative mt-20 transition-all duration-500 overflow-hidden"
      style={{
        background: mode === 'light' 
          ? `linear-gradient(180deg, ${tokens.colors.light.surface.base} 0%, ${tokens.colors.light.background.subtle} 100%)`
          : `linear-gradient(180deg, ${tokens.colors.dark.surface.elevated} 0%, ${tokens.colors.dark.background.base} 100%)`,
        borderTop: `1px solid ${tokens.colors[mode].border.DEFAULT}`
      }}
    >
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 py-16 sm:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 lg:gap-12">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-2 space-y-10 flex flex-col items-center lg:items-start text-center lg:text-start">
            <Link to="/" className="inline-block group transform hover:scale-105 transition-all duration-500">
              <img
                src={mode === 'dark'
                  ? (language === 'ar' ? logoArWhite : logoEnWhite)
                  : (language === 'ar' ? logoAr : logoEn)}
                alt="Logo"
                className="h-[110px] w-auto object-contain rounded-2xl shadow-2xl shadow-primary/10"
              />
            </Link>
            
            <p 
              className="text-xl font-bold leading-relaxed max-w-sm opacity-80"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              {t('common:footerDesc', 'Experience the next generation of digital commerce. We curate premium products with a focus on uncompromising quality and exceptional design.')}
            </p>

            <div className="flex justify-center lg:justify-start gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 hover:scale-110 hover:-translate-y-2 group/social shadow-lg hover:shadow-primary/20"
                  style={{
                    background: tokens.colors[mode].surface.elevated,
                    border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                    color: tokens.colors[mode].text.primary,
                  }}
                  aria-label={social.label}
                >
                  <span className="flex items-center justify-center group-hover/social:scale-125 transition-transform duration-500">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-6 sm:space-y-8">
              <h3 
                className="text-lg font-black uppercase tracking-[0.2em]"
                style={{ color: tokens.colors[mode].primary.DEFAULT }}
              >
                {section.title}
              </h3>
              <ul className="space-y-4 sm:space-y-5">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-base font-bold transition-all duration-300 hover:translate-x-2 inline-flex items-center group/link"
                      style={{ color: tokens.colors[mode].text.secondary }}
                    >
                      <span className="w-0 group-hover/link:w-4 h-0.5 bg-primary mr-0 group-hover/link:mr-2 transition-all duration-300 opacity-0 group-hover/link:opacity-100" />
                      <span className="group-hover:text-primary transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / Contact Section */}
          <div className="lg:col-span-1 space-y-8">
            <h3 
              className="text-lg font-black uppercase tracking-[0.2em]"
              style={{ color: tokens.colors[mode].primary.DEFAULT }}
            >
              {t('common:contactUs', 'Contact')}
            </h3>
            <div className="space-y-6">
              {settings?.email && (
                <a 
                  href={`mailto:${settings.email}`} 
                  className="flex items-center gap-4 group/contact"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/contact:bg-primary group-hover/contact:text-white transition-all duration-300">
                    <span className="text-lg">📧</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('common:emailUs', 'Email Us')}</span>
                    <span className="font-bold text-sm" style={{ color: tokens.colors[mode].text.primary }}>{settings.email}</span>
                  </div>
                </a>
              )}
              {settings?.phone_1 && (
                <a 
                  href={`tel:${settings.phone_1}`} 
                  className="flex items-center gap-4 group/contact"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/contact:bg-primary group-hover/contact:text-white transition-all duration-300">
                    <span className="text-lg">📞</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('common:callUs', 'Call Us')}</span>
                    <span className="font-bold text-sm" style={{ color: tokens.colors[mode].text.primary }}>{settings.phone_1}</span>
                  </div>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Premium Divider */}
        <div className="relative h-px w-full my-10 sm:my-16 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: `linear-gradient(90deg, transparent 0%, ${tokens.colors[mode].primary.DEFAULT} 50%, transparent 100%)`
            }}
          />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div 
            className="text-sm font-black uppercase tracking-widest opacity-60"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('common:copyrightNotice', '© {{year}} Bnaia. All Rights Reserved.', { year: new Date().getFullYear() })}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="flex gap-3">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="w-10 h-7 sm:w-12 sm:h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 grayscale hover:grayscale-0 cursor-help"
                  style={{
                    background: tokens.colors[mode].surface.elevated,
                    border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                  }}
                  title={method.name}
                >
                  <span className="text-lg sm:text-xl">{method.icon}</span>
                </div>
              ))}
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
            <div className="flex gap-6 sm:gap-8">
              <Link to="/terms" className="text-[10px] sm:text-xs font-black uppercase tracking-widest hover:text-primary transition-colors" style={{ color: tokens.colors[mode].text.secondary }}>{t('common:terms', 'Terms')}</Link>
              <Link to="/privacy-policy" className="text-[10px] sm:text-xs font-black uppercase tracking-widest hover:text-primary transition-colors" style={{ color: tokens.colors[mode].text.secondary }}>{t('common:privacy', 'Privacy')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
