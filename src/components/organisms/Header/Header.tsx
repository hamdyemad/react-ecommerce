import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logoEn from '../../../assets/logos/logo_en.png';
import logoEnWhite from '../../../assets/logos/logo_en_white.png';
import logoAr from '../../../assets/logos/logo_ar.png';
import logoArWhite from '../../../assets/logos/logo_ar_white.png';
import type { Country } from '../../../types/api';
import { useCatalog } from '../../../hooks/useCatalog';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../../hooks/useDirection';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '../../../tokens';
import { productService } from '../../../services';
import type { Product } from '../../../types/api';

interface HeaderProps {
  mode: 'light' | 'dark';
  language: string;
  country: string;
  cartCount: number;
  wishlistCount?: number;
  onToggleMode: () => void;
  onToggleLanguage: () => void;
  onCountryChange: (country: Country) => void;
  onCartClick: () => void;
  onMenuClick?: () => void;
}

export function Header({
  mode,
  language,
  country,
  cartCount,
  wishlistCount = 2,
  onToggleMode,
  onToggleLanguage,
  onCountryChange,
  onCartClick,
  onMenuClick,
}: HeaderProps) {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { countries, loadingCountries } = useCatalog();
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchResultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      if (scrollPos > 100) {
        setIsScrolled(true);
      } else if (scrollPos < 10) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountrySelect(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSearchResults = async (page: number, append: boolean = false) => {
    if (!headerSearchTerm.trim()) {
      setSearchResults([]);
      setSearchHasMore(false);
      setShowSearchDropdown(false);
      return;
    }

    try {
      if (append) setSearchLoadingMore(true);
      else setSearchLoading(true);

      const response = await productService.getAll({
        search: headerSearchTerm,
        page,
        per_page: 5,
        paginated: 'ok'
      });

      const newItems = response.data || [];
      if (append) {
        setSearchResults(prev => [...prev, ...newItems]);
      } else {
        setSearchResults(newItems);
        setShowSearchDropdown(true);
      }
      setSearchHasMore(response.pagination?.current_page < response.pagination?.last_page);
    } catch (err) {
      console.error('Failed to fetch search results:', err);
    } finally {
      setSearchLoading(false);
      setSearchLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (headerSearchTerm.trim()) {
        setSearchPage(1);
        fetchSearchResults(1, false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [headerSearchTerm]);

  const handleScrollSearchResults = () => {
    const el = searchResultsContainerRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      if (!searchLoadingMore && searchHasMore) {
        const nextPage = searchPage + 1;
        setSearchPage(nextPage);
        fetchSearchResults(nextPage, true);
      }
    }
  };

  const activeCountry = countries.find(c => c.code === country) || countries[0];

  return (
    <header className="sticky top-0 z-[100] w-full">
      <div className={`transition-all duration-300 w-full ${isScrolled ? 'py-3 px-4 sm:px-6' : 'py-0 px-0'}`}>
        <div 
          className={`w-full transition-all duration-300 mx-auto ${
            isScrolled 
              ? 'max-w-7xl rounded-2xl md:rounded-full shadow-2xl border border-white/20' 
              : 'max-w-none rounded-none shadow-sm'
          }`}
          style={{ 
            backgroundColor: tokens.colors[mode].surface.base,
            backdropFilter: 'blur(20px)', 
            borderColor: tokens.colors[mode].border.DEFAULT,
            borderBottomWidth: isScrolled ? '1px' : '0px'
          }}
        >
          {/* Top Info Bar */}
          <div 
            className={`hidden lg:block transition-all duration-300 overflow-hidden ${
              isScrolled ? 'max-h-0 opacity-0' : 'max-h-[40px] opacity-100'
            }`}
            style={{ 
              backgroundColor: tokens.colors[mode].background.subtle, 
              borderBottom: isScrolled ? 'none' : `1px solid ${tokens.colors[mode].border.DEFAULT}` 
            }}
          >
          <div className={`max-w-7xl mx-auto transition-all duration-300 ${isScrolled ? 'px-4 sm:px-6 lg:px-12' : 'px-6'} py-2.5`}>
          <div className="flex items-center justify-between text-xs font-bold tracking-tight uppercase">
            <div className="flex items-center gap-6" style={{ color: tokens.colors[mode].text.secondary }}>
                <Link to="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span>📞</span> {t('common:contactUs')}
              </Link>
              <Link to="/track-order" className="hover:text-primary transition-colors flex items-center gap-2">
                <span>🚚</span> {t('common:trackOrder', 'Track Order')}
              </Link>
              <Link to="/store-locator" className="hover:text-primary transition-colors flex items-center gap-2">
                <span>📍</span> {t('common:storeLocator')}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleMode}
                style={{ 
                  color: tokens.colors[mode].text.secondary
                }}
                className={`cursor-pointer hover:text-primary transition-all px-3 py-1 rounded-full ${
                  mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                }`}
              >
                {mode === 'light' ? `🌙 ${t('common:dark')}` : `☀️ ${t('common:light')}`}
              </button>
              <button
                onClick={onToggleLanguage}
                style={{ 
                  color: tokens.colors[mode].text.secondary
                }}
                className={`cursor-pointer hover:text-primary transition-all px-3 py-1 rounded-full ${
                  mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                }`}
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>

              <div className="relative" ref={countryDropdownRef}>
                <button
                  onClick={() => setShowCountrySelect(!showCountrySelect)}
                  style={{ 
                    color: tokens.colors[mode].text.secondary
                  }}
                  className={`flex items-center gap-2 cursor-pointer hover:text-primary transition-all px-3 py-1 rounded-full ${
                    mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                  }`}
                >
                  {activeCountry ? (
                    <>
                      <span className="text-sm font-black">{language === 'en' ? activeCountry.name : (activeCountry.name_ar || activeCountry.name)}</span>
                      <svg className={`w-3 h-3 transition-transform ${showCountrySelect ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : '...'}
                </button>

                {showCountrySelect && (
                  <div 
                    className={`absolute top-full ${direction === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-48 rounded-2xl shadow-2xl border animate-fadeInScale z-[110] ${direction === 'rtl' ? 'origin-top-left' : 'origin-top-right'}`}
                    style={{ 
                      backgroundColor: tokens.colors[mode].surface.base,
                      borderColor: tokens.colors[mode].border.DEFAULT
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {countries.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            onCountryChange(c);
                            setShowCountrySelect(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-sm ${
                            country === c.code 
                              ? 'bg-primary text-white' 
                              : mode === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex flex-col items-start gap-0.5">
                            <span>{language === 'en' ? c.name : (c.name_ar || c.name)}</span>
                            <span className="text-[10px] opacity-70">{c.currency.code}</span>
                          </div>
                          {country === c.code && (
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                          )}
                        </button>
                      ))}
                      {loadingCountries && (
                        <div className="p-4 text-center text-xs font-bold text-slate-400">{t('common:loading')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`max-w-7xl mx-auto transition-all duration-500 ${isScrolled ? 'px-4 sm:px-6 lg:px-12 py-1 sm:py-2' : 'px-4 sm:px-6 py-3 sm:py-5'}`}>
        <div className="flex items-center justify-between gap-2 sm:gap-8">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={onMenuClick}
              className={`cursor-pointer p-2 sm:p-3 rounded-2xl transition-all active:scale-95 ${
                mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
              }`}
              style={{ color: tokens.colors[mode].text.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="hover:scale-105 transition-transform active:scale-100 shrink-0">
              <img
                src={mode === 'dark'
                  ? (language === 'ar' ? logoArWhite : logoEnWhite)
                  : (language === 'ar' ? logoAr : logoEn)}
                alt="Logo"
                className={`transition-all duration-500 object-contain rounded-xl ${
                  isScrolled ? 'h-[35px] sm:h-[45px] min-w-[80px] sm:min-w-[100px]' : 'h-[45px] sm:h-[70px] min-w-[100px] sm:min-w-[140px]'
                }`}
              />
            </Link>
          </div>

          <div className={`hidden lg:block transition-all duration-500 relative group ${isScrolled ? 'flex-1 max-w-lg' : 'flex-1 max-w-2xl'}`} ref={searchDropdownRef}>
            <input
              type="text"
              placeholder={t('common:searchProducts', 'Search products...')}
              value={headerSearchTerm}
              onChange={(e) => setHeaderSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/products?search=${headerSearchTerm}`);
                  setHeaderSearchTerm('');
                  setShowSearchDropdown(false);
                }
              }}
              style={{
                backgroundColor: tokens.colors[mode].surface.elevated,
                color: tokens.colors[mode].text.primary
              }}
              className="w-full px-8 py-4 pr-14 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 border-none"
            />
            <button 
              onClick={() => {
                navigate(`/products?search=${headerSearchTerm}`);
                setHeaderSearchTerm('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors cursor-pointer hover:scale-110 active:scale-90"
            >
              <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Live Search Dropdown */}
            {showSearchDropdown && (headerSearchTerm.trim() || searchLoading) && (
              <div 
                ref={searchResultsContainerRef}
                onScroll={handleScrollSearchResults}
                className={`absolute top-full left-0 right-0 mt-3 max-h-[450px] overflow-y-auto rounded-[25px] shadow-2xl border backdrop-blur-3xl animate-fadeInScale z-[120] custom-scrollbar`}
                style={{
                  backgroundColor: `${tokens.colors[mode].surface.base}F2`,
                  borderColor: tokens.colors[mode].border.DEFAULT,
                  boxShadow: mode === 'light' ? '0 25px 50px rgba(0,0,0,0.1)' : '0 25px 50px rgba(0,0,0,0.4)'
                }}
              >
                <div className="p-2 space-y-1">
                  {searchLoading && searchPage === 1 ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700" />
                          <div className="flex-1 space-y-2 py-2">
                            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <Link 
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={() => {
                            setHeaderSearchTerm('');
                            setShowSearchDropdown(false);
                          }}
                          className="flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-primary/5 group"
                        >
                          <div className="w-16 h-16 rounded-xl bg-white p-1 border overflow-hidden flex-shrink-0 relative group-hover:scale-110 transition-transform">
                            <img src={product.image} alt="" className="w-full h-full object-contain" />
                            {(product.discount ?? 0) > 0 && (
                              <div className="absolute top-0 right-0 bg-error text-white text-[8px] font-black px-1 rounded-bl-lg">
                                -{product.discount}%
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm truncate group-hover:text-primary transition-colors" style={{ color: tokens.colors[mode].text.primary }}>
                              {product.name}
                            </h4>
                            
                            {/* Compact Taxonomy */}
                            {(product.department || product.category) && (
                              <div className="flex items-center gap-1 mt-0.5 opacity-60 text-[9px] font-bold uppercase tracking-tighter overflow-hidden">
                                {product.department && <span className="truncate">{product.department.name}</span>}
                                {product.category && (
                                  <>
                                    <span className="shrink-0 opacity-40">›</span>
                                    <span className="truncate">{product.category.name}</span>
                                  </>
                                )}
                                {product.sub_category && (
                                  <>
                                    <span className="shrink-0 opacity-40">›</span>
                                    <span className="truncate">{product.sub_category.name}</span>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-black text-sm">
                                  {product.real_price.toLocaleString()} {t('common:currency', 'EGP')}
                                </span>
                                {product.fake_price && (
                                  <span className="text-xs line-through opacity-40 font-bold" style={{ color: tokens.colors[mode].text.tertiary }}>
                                    {product.fake_price.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Compact Rating */}
                              {(product.review_avg_star ?? 0) > 0 && (
                                <div className="flex items-center gap-1 bg-amber-400/10 px-1.5 py-0.5 rounded-lg">
                                  <span className="text-amber-500 text-[10px]">★</span>
                                  <span className="text-[10px] font-black text-amber-600">{product.review_avg_star.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xl opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">✨</div>
                        </Link>
                      ))}
                      
                      {searchLoadingMore && (
                        <div className="p-4 flex justify-center">
                          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                      )}

                      {!searchHasMore && searchResults.length > 3 && (
                        <div className="p-4 text-center opacity-40 font-bold text-[10px] uppercase tracking-widest border-t border-dashed mt-2">
                          {t('common:reachedEnd', "That's all for now ✨")}
                        </div>
                      )}
                    </>
                  ) : !searchLoading && headerSearchTerm.trim() && (
                    <div className="p-12 text-center">
                      <div className="text-5xl mb-4 grayscale opacity-30">🔍</div>
                      <p className="font-black text-sm opacity-50" style={{ color: tokens.colors[mode].text.primary }}>
                        {t('common:noResults', 'No products found')}
                      </p>
                    </div>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                   <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50">
                      <button 
                        onClick={() => {
                          navigate(`/products?search=${headerSearchTerm}`);
                          setHeaderSearchTerm('');
                          setShowSearchDropdown(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-[0.98]"
                      >
                        {t('common:viewAllResults', 'View All Results')} ({searchResults.length}+)
                      </button>
                   </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/wishlist" 
              className={`relative p-2 sm:p-3 rounded-2xl transition-all group ${
                mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
              }`}
            >
              <svg className="w-6 h-6" style={{ color: tokens.colors[mode].text.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className={`absolute top-2 right-2 w-5 h-5 bg-error text-white text-[10px] rounded-full flex items-center justify-center font-black animate-bounce shadow-lg shadow-error/30 ring-2 ${
                  mode === 'light' ? 'ring-white' : 'ring-slate-900'
                }`}>
                  {wishlistCount}
                </span>
              )}
            </Link>
            <div className="relative" ref={userDropdownRef}>
              {!user ? (
                <Link 
                  to="/login"
                  className={`p-1.5 sm:p-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
                    mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-primary/10">
                    <svg className="w-6 h-6" style={{ color: tokens.colors[mode].primary.DEFAULT }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`p-1.5 sm:p-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
                    mode === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center border-2 border-primary/5">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={user.full_name} 
                        className="w-full h-full object-cover animate-fadeIn"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <svg className="w-6 h-6" style={{ color: tokens.colors[mode].primary.DEFAULT }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <span className="hidden md:block font-black text-sm max-w-[120px] truncate" style={{ color: tokens.colors[mode].text.primary }}>
                    {user.full_name.split(' ')[0]}
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} style={{ color: tokens.colors[mode].text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {showUserDropdown && user && (
                <div 
                  className={`absolute top-full ${direction === 'rtl' ? 'left-0' : 'right-0'} mt-3 w-56 rounded-[25px] shadow-2xl border animate-fadeInScale z-[110] overflow-hidden ${direction === 'rtl' ? 'origin-top-left' : 'origin-top-right'}`}
                  style={{ 
                    backgroundColor: tokens.colors[mode].surface.base,
                    borderColor: tokens.colors[mode].border.DEFAULT,
                    boxShadow: mode === 'light' ? '0 20px 40px rgba(0,0,0,0.1)' : '0 20px 40px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="p-3">
                    <div className="px-4 py-3 mb-2 rounded-2xl bg-primary/5">
                      <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1" style={{ color: tokens.colors[mode].text.primary }}>{t('common:hello')}</p>
                      <p className="font-black truncate" style={{ color: tokens.colors[mode].text.primary }}>{user.full_name}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all hover:bg-primary/10 hover:text-primary group"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">👤</span>
                      <span className="font-bold text-sm">{t('profile')}</span>
                    </Link>

                    <Link 
                      to="/profile/orders" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all hover:bg-primary/10 hover:text-primary group"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">📦</span>
                      <span className="font-bold text-sm">{t('orders')}</span>
                    </Link>

                    <Link 
                      to="/profile/points" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all hover:bg-primary/10 hover:text-primary group"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">💰</span>
                      <span className="font-bold text-sm">{t('myPoints', 'My Points')}</span>
                    </Link>

                    <div className="my-2 h-px w-full" style={{ backgroundColor: tokens.colors[mode].border.DEFAULT }} />

                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all hover:bg-error/10 hover:text-error group text-left cursor-pointer"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">🚪</span>
                      <span className="font-bold text-sm">{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={onCartClick} className="relative p-2.5 sm:p-3 bg-primary text-white rounded-2xl transition-all shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 group cursor-pointer">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-primary text-[11px] rounded-full flex items-center justify-center font-black shadow-xl ring-2 ring-primary">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Navigation Menu */}
      <div className={`hidden lg:block transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-[100px] opacity-100 border-t border-slate-100 dark:border-slate-800'}`}>
        <div className={`max-w-7xl mx-auto transition-all duration-300 ${isScrolled ? 'px-16' : 'px-6'}`}>
          <nav className={`flex items-center w-full gap-2 transition-all duration-300 ${isScrolled ? 'py-1' : 'py-3'}`}>
            <Link 
              to="/" 
              style={{ color: tokens.colors[mode].text.primary }}
              className="px-5 py-2.5 text-sm font-black hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center gap-2 group"
            >
              <span className="group-hover:scale-125 transition-transform">🏠</span> {t('common:home')}
            </Link>

            {/* Departments Link */}
            <Link 
              to="/departments" 
              style={{ color: tokens.colors[mode].text.primary }}
              className="px-5 py-2.5 text-sm font-black hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center gap-2 group"
            >
              <span className="group-hover:scale-125 transition-transform">📦</span> {t('departments')}
            </Link>

            <Link 
              to="/categories" 
              style={{ color: tokens.colors[mode].text.primary }}
              className="px-5 py-2.5 text-sm font-black hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center gap-2 group"
            >
              <span className="group-hover:scale-125 transition-transform">🗂️</span> {t('categories')}
            </Link>

            <Link 
              to="/sub-categories" 
              style={{ color: tokens.colors[mode].text.primary }}
              className="px-5 py-2.5 text-sm font-black hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center gap-2 group"
            >
              <span className="group-hover:scale-125 transition-transform">📁</span> {t('subCategories', 'Sub Categories')}
            </Link>

            {/* Brands Link */}
            <Link 
              to="/brands" 
              style={{ color: tokens.colors[mode].text.primary }}
              className="px-5 py-2.5 text-sm font-black hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center gap-2 group"
            >
              <span>🏷️</span> {t('common:brands')}
            </Link>


            <Link 
              to="/products" 
              style={{ 
                color: tokens.colors[mode].text.primary
              }}
              className="px-5 py-2.5 text-sm font-black hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center gap-2"
            >
              <span>✨</span> {t('common:allProducts')}
            </Link>
            <Link to="/deals" className="ml-auto px-5 py-2.5 text-sm font-black bg-error text-white hover:bg-error/90 transition-all rounded-xl flex items-center gap-2 active:scale-95 shadow-lg shadow-error/20 group">
              <span className="group-hover:animate-bounce">🔥</span>
              <span>{t('common:hotSale')}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] backdrop-blur-sm">70% {t('common:offCount')}</span>
            </Link>
          </nav>
        </div>
      </div>
      </div>
     </div>
    </header>
  );
}
