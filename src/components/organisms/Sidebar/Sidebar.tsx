import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../../hooks/useDirection';
import { tokens } from '../../../tokens';
import { useAuth } from '@/hooks/useAuth';
import { useCatalog } from '../../../hooks/useCatalog';
import type { Country } from '../../../types/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { mode, toggleMode } = useTheme();
  const { t } = useTranslation();
  const { direction, language, setLanguage, country, setSelectedCountry } = useDirection();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { countries, loadingCountries } = useCatalog();
  const [showCountrySelect, setShowCountrySelect] = useState(false);

  const activeCountry = countries.find(c => c.code === country) || countries[0];

  const menuSections = [
    {
      title: t('main'),
      icon: '🏠',
      links: [
        { label: t('home'), path: '/', icon: '🏠' },
        { label: t('departments'), path: '/departments', icon: '📦' },
        { label: t('categories'), path: '/categories', icon: '🗂️' },
        { label: t('subCategories', 'Sub Categories'), path: '/sub-categories', icon: '📁' },
        { label: t('common:brands'), path: '/brands', icon: '🏷️' },
        { label: t('hotDeals'), path: '/deals', icon: '💰' },
        { label: t('newArrivalsTitle', 'New Arrivals'), path: '/new-arrivals', icon: '🆕' },
        { label: t('bestSellers', 'Best Sellers'), path: '/products', icon: '⭐' },
      ]
    },
    {
      title: t('account'),
      icon: '👤',
      links: [
        ...(!isAuthenticated ? [
          { label: t('signIn'), path: '/login', icon: '🔐' },
          { label: t('signUp'), path: '/register', icon: '📝' },
        ] : [
          { label: t('profile'), path: '/profile', icon: '👤' },
          { label: t('myOrders'), path: '/profile/orders', icon: '📦' },
          { label: t('myPoints', 'My Points'), path: '/profile/points', icon: '💰' },
          { label: t('logout'), path: '#', icon: '🚪', onClick: () => { logout(); navigate('/'); onClose(); } },
        ]),
        { label: t('wishlist'), path: '/wishlist', icon: '❤️' },
      ]
    },
    {
      title: t('information'),
      icon: 'ℹ️',
      links: [
        { label: t('aboutUs'), path: '/about-us', icon: '🏢' },
        { label: t('blog'), path: '/blogs', icon: '📝' },
        { label: t('returnPolicy'), path: '/return-policy', icon: '↩️' },
        { label: t('termsSubtitle'), path: '/terms', icon: '📋' },
        { label: t('contactUs'), path: '/contact', icon: '📞' },
        { label: t('common:storeLocator', 'Store Locator'), path: '/store-locator', icon: '📍' },
      ]
    }
  ];

  if (!isOpen) return null;

  const isRtl = direction === 'rtl';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]"
        style={{
          background: tokens.colors[mode].surface.overlay,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-full max-w-sm z-[9999] overflow-y-auto flex flex-col`}
        style={{
          background: tokens.gradients.surface[mode],
          boxShadow: isRtl 
            ? `-10px 0 40px ${tokens.colors[mode].primary[500]}26` 
            : `10px 0 40px ${tokens.colors[mode].primary[500]}26`,
          animation: isRtl ? 'slideInRight 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
          borderLeft: isRtl ? 'none' : `1px solid ${tokens.colors[mode].border.DEFAULT}`,
          borderRight: isRtl ? `1px solid ${tokens.colors[mode].border.DEFAULT}` : 'none'
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 p-6 flex items-center justify-between shrink-0"
          style={{
            background: `${tokens.colors[mode].surface.base}F2`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${tokens.colors[mode].border.DEFAULT}`
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300"
              style={{
                background: tokens.gradients.primary
              }}
            >
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <h2 
                className="text-2xl font-black"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {t('menu')}
              </h2>
              <p 
                className="text-xs"
                style={{ color: tokens.colors[mode].text.tertiary }}
              >
                {t('browseStore')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90"
            style={{
              background: tokens.colors[mode].surface.elevated,
              color: tokens.colors[mode].text.primary
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Content */}
        <div className="p-6 space-y-6 flex-1">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{section.icon}</span>
                <h3 
                  className="text-sm font-black uppercase tracking-wider"
                  style={{ color: tokens.colors[mode].text.tertiary }}
                >
                  {section.title}
                </h3>
              </div>

              {/* Section Links */}
              {section.links && (
                <div className="space-y-1">
                  {section.links.map((link: any, linkIndex: number) => (
                    <Link
                      key={linkIndex}
                      to={link.path}
                      onClick={(e) => {
                        if (link.onClick) {
                          e.preventDefault();
                          link.onClick();
                        }
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group"
                      style={{
                        color: tokens.colors[mode].text.secondary
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${tokens.colors[mode].primary.DEFAULT}1A`;
                        e.currentTarget.style.color = tokens.colors[mode].primary.DEFAULT;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = tokens.colors[mode].text.secondary;
                      }}
                    >
                      <span className="text-xl transition-transform group-hover:scale-125">{link.icon}</span>
                      <span className="font-bold">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Preferences Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚙️</span>
              <h3 
                className="text-sm font-black uppercase tracking-wider"
                style={{ color: tokens.colors[mode].text.tertiary }}
              >
                {t('common:preferences', 'Preferences')}
              </h3>
            </div>
            <div className="space-y-2 relative">
              <button
                onClick={toggleMode}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: `${tokens.colors[mode].surface.elevated}`,
                  color: tokens.colors[mode].text.secondary
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{mode === 'light' ? '🌙' : '☀️'}</span>
                  <span className="font-bold">{mode === 'light' ? t('common:dark') : t('common:light')}</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setLanguage(language === 'en' ? 'ar' : 'en');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: `${tokens.colors[mode].surface.elevated}`,
                  color: tokens.colors[mode].text.secondary
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <span className="font-bold">{language === 'en' ? 'العربية' : 'English'}</span>
                </div>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowCountrySelect(!showCountrySelect)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: `${tokens.colors[mode].surface.elevated}`,
                    color: tokens.colors[mode].text.secondary
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌍</span>
                    <span className="font-bold text-sm truncate max-w-[150px]">
                      {activeCountry ? (language === 'en' ? activeCountry.name : (activeCountry.name_ar || activeCountry.name)) : '...'}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${showCountrySelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCountrySelect && (
                  <div 
                    className="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto rounded-xl shadow-lg border p-2 z-[100]"
                    style={{
                      background: tokens.colors[mode].surface.base,
                      borderColor: tokens.colors[mode].border.DEFAULT
                    }}
                  >
                    {!loadingCountries ? countries.map((c: Country) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountrySelect(false);
                          window.location.reload();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold mb-1 ${
                          country === c.code ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        style={{
                           color: country === c.code ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].text.primary
                        }}
                      >
                        {language === 'en' ? c.name : (c.name_ar || c.name)}
                      </button>
                    )) : (
                      <div className="p-2 text-center text-xs font-bold" style={{color: tokens.colors[mode].text.tertiary}}>{t('common:loading')}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 p-6 shrink-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${tokens.colors[mode].surface.base}F2 20%)`,
            backdropFilter: 'blur(20px)',
            borderTop: `1px solid ${tokens.colors[mode].border.DEFAULT}`
          }}
        >
          <div 
            className="p-4 rounded-2xl text-center shadow-lg"
            style={{
              background: tokens.gradients.secondary
            }}
          >
            <p className="text-white font-bold mb-2">{t('needHelp')}</p>
            <p className="text-white/80 text-sm mb-3">{t('contactSupport')}</p>
            <Link
              to="/contact"
              onClick={onClose}
              className="inline-block px-6 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
              style={{
                background: '#ffffff',
                color: '#ec4899'
              }}
            >
              📞 {t('contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
