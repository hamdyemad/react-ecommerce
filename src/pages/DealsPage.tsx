import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { ProductCatalog } from '../components/organisms/ProductCatalog/ProductCatalog';

interface DealsPageProps {
  onAddToCart: (id: string | number) => void;
  onToggleWishlist?: (id: string | number) => void;
  wishlistItems?: (string | number)[];
}

export function DealsPage({ onAddToCart, onToggleWishlist, wishlistItems = [] }: DealsPageProps) {
  const { t, i18n } = useTranslation();
  const { mode } = useTheme();

  return (
    <div className="space-y-12 py-8">
      {/* Header - Premium Redesign */}
      <div 
        className="relative min-h-[400px] flex items-center justify-center rounded-[3rem] sm:rounded-[4rem] overflow-hidden shadow-2xl group mx-2 sm:mx-4"
        style={{
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)' 
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: mode === 'light' ? '1px solid rgba(239, 68, 68, 0.1)' : 'none'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className={`absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px] animate-pulse ${
              mode === 'light' ? 'bg-red-200/50' : 'bg-red-600/30'
            }`} 
          />
          <div 
            className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] animate-pulse delay-700 ${
              mode === 'light' ? 'bg-orange-200/50' : 'bg-orange-500/20'
            }`} 
          />
          <div 
            className={`absolute top-1/2 left-1/4 w-40 h-40 rounded-full blur-[80px] animate-bounce delay-1000 ${
              mode === 'light' ? 'bg-blue-200/30' : 'bg-blue-500/10'
            }`} 
          />
          
          {/* Animated Particles/Icons */}
          <div className={`absolute inset-0 ${mode === 'light' ? 'opacity-40' : 'opacity-20'}`}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute text-2xl animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 5}s`
                }}
              >
                {['🔥', '✨', '💎', '🏷️'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>

        {/* Glassmorphic Card */}
        <div className="relative z-10 w-full max-w-4xl px-6 py-12 text-center">
          <div 
            className="inline-block mb-8 px-6 py-2 rounded-full backdrop-blur-xl border shadow-xl"
            style={{ 
              background: mode === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: mode === 'light' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className={`text-sm font-black uppercase tracking-[0.3em] ${mode === 'light' ? 'text-red-600' : 'text-orange-400'}`}>
              {t('limitedTimeOffer')}
            </span>
          </div>
          
          <h1 className={`text-5xl sm:text-8xl font-black mb-8 tracking-tighter ${mode === 'light' ? 'text-slate-900' : 'text-white'}`}>
            <span className="block opacity-50 text-2xl sm:text-4xl mb-2 sm:mb-4 tracking-[0.2em] font-normal uppercase">
              {t('discoverBestSelection')}
            </span>
            <span className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
               {i18n.language === 'ar' ? t('hotDeals') : t('hotDeals').toUpperCase()}
            </span>
          </h1>
          
          <p className={`text-lg sm:text-2xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed ${mode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            {t('hotDealsSubtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
             <div className="px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all cursor-default"
                style={{ 
                  background: mode === 'light' ? '#0f172a' : '#ffffff',
                  color: mode === 'light' ? '#ffffff' : '#0f172a'
                }}
             >
                {t('upTo')} 50% {i18n.language === 'en' ? t('offCount') : ''}
             </div>
             <div className="px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all cursor-default border border-red-500/50">
                {t('saveBig')} 🔥
             </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}} />

      {/* Sale Products */}
      <div className="px-4">
        <ProductCatalog
          title={t('saleItems') || "Sale Items"}
          description={t('hotDealsSubtitle') || "Save up to 50% on selected items. Don't miss out!"}
          initialFilters={{ has_discount: true }}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist || (() => {})}
          wishlistItems={wishlistItems}
        />
      </div>
    </div>
  );
}
