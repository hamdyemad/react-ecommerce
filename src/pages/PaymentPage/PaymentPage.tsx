import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { Button } from '../../components/atoms/Button';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';

export function PaymentPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();

  const cards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true, brandColor: '#1a1f71' },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26', isDefault: false, brandColor: '#eb001b' }
  ];

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('account'), path: '/profile' },
          { label: t('myPaymentMethods'), path: '/profile/payment' }
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 px-2">
        <div>
          <h1 
            className="text-5xl font-black mb-4 flex items-center gap-4"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            💳 {t('myPaymentMethods')}
          </h1>
          <p 
            className="text-xl font-bold opacity-70"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('managePaymentCards')}
          </p>
        </div>
        <Button variant="primary" size="lg" className="rounded-2xl font-black px-8 shadow-xl hover:scale-105 active:scale-95 transition-all">
          + {t('addNewCard')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 max-w-5xl">
        {cards.map((card) => (
          <div
            key={card.id}
            className="p-10 rounded-[45px] transition-all duration-500 hover:scale-[1.02] relative group overflow-hidden shadow-2xl"
            style={{
              background: card.isDefault
                ? `linear-gradient(135deg, ${card.brandColor} 0%, #2a3eb1 100%)`
                : tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(30px)',
              border: card.isDefault ? 'none' : `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              color: card.isDefault ? '#ffffff' : tokens.colors[mode].text.primary
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div 
                className={`text-4xl w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl ${card.isDefault ? 'bg-white/10' : ''}`}
                style={{ background: !card.isDefault ? `${tokens.colors[mode].primary.DEFAULT}15` : '' }}
              >
                {card.type === 'Visa' ? '💳' : '💳'}
              </div>
              {card.isDefault && (
                <span className="px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md shadow-lg animate-pulse">
                  {t('setDefault')}
                </span>
              )}
            </div>

            <div className="mb-10 relative z-10">
              <p className="text-3xl font-black mb-3 tracking-[0.1em] drop-shadow-md">
                •••• •••• •••• {card.last4}
              </p>
              <p className={`text-lg font-black opacity-80 ${card.isDefault ? 'text-white' : ''}`} style={{ color: !card.isDefault ? tokens.colors[mode].text.tertiary : '' }}>
                {t('expires')} {card.expiry}
              </p>
            </div>

            <div className="flex gap-4 relative z-10">
              <button 
                className="flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md"
                style={{
                  background: card.isDefault ? 'rgba(255, 255, 255, 0.15)' : mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                  color: card.isDefault ? '#ffffff' : tokens.colors[mode].text.primary,
                  border: card.isDefault ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${tokens.colors[mode].border.DEFAULT}`
                }}
              >
                {t('edit')}
              </button>
              <button 
                className="px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl bg-red-500/10 hover:bg-red-500 hover:text-white"
                style={{
                  color: '#ef4444'
                }}
              >
                {t('remove')} 🗑️
              </button>
            </div>

            {/* Premium Card Texture */}
            {card.isDefault && (
                <div className="absolute bottom-4 right-8 opacity-10 pointer-events-none">
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="40" fill="white"/>
                        <circle cx="80" cy="40" r="40" fill="white"/>
                    </svg>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
