import { useTranslation } from 'react-i18next';
import { tokens } from '../../../tokens';
import { useTheme } from '../../../hooks/useTheme';
import { useDirection } from '../../../hooks/useDirection';
import { Button } from '../../atoms/Button';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  orderData: any;
  onClose: () => void;
}

export function SuccessModal({ orderData, onClose }: SuccessModalProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { selectedCountry } = useDirection();
  const navigate = useNavigate();
  
  const currency = selectedCountry?.currency?.code || 'EGP';
  const stage = orderData.vendors_stages?.[0];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div 
        className="relative w-full max-w-xl bg-[var(--color-surface-elevated)] rounded-[45px] shadow-2xl overflow-hidden border border-[var(--color-border-DEFAULT)] animate-in zoom-in slide-in-from-bottom-12 duration-500 max-h-[90vh] flex flex-col"
        style={{ 
          background: tokens.colors[mode].surface.elevated,
          boxShadow: `0 25px 50px -12px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
        }}
      >
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
          <div className="text-center">
            {/* Animated Success Icon Case */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto relative z-10 animate-bounce">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: tokens.colors[mode].text.primary }}>
              {t('orderConfirmed', 'Order Confirmed!')}
            </h2>
            <p className="text-base sm:text-lg opacity-60 font-bold mb-8">
              {t('orderPlacedSuccess', 'Thank you {{name}}, your order is being processed.', { name: orderData.customer_name || '' })}
            </p>

            {/* Order Status Badge */}
            {stage && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: `${stage.stage_color}15`, border: `1px solid ${stage.stage_color}40` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: stage.stage_color }}></span>
                <span className="text-sm font-black" style={{ color: stage.stage_color }}>
                  {t('orderStatus', 'Order Status')}: {stage.stage_name}
                </span>
              </div>
            )}

            <div 
              className="p-6 sm:p-8 rounded-[40px] mb-8 space-y-6 text-start"
              style={{ background: tokens.colors[mode].surface.base }}
            >
              <div className="flex justify-between items-center px-2">
                <span className="opacity-60 font-bold text-xs uppercase tracking-wider">{t('orderNumber', 'Order ID')}</span>
                <span className="font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full text-sm">#{orderData.order_number}</span>
              </div>
              
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

              {/* Products List */}
              <div className="space-y-4">
                <span className="opacity-60 font-bold text-xs uppercase tracking-wider px-2 block">{t('products', 'Products')}</span>
                <div className="space-y-3">
                  {orderData.products?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-DEFAULT)]">
                      <img src={item.product.image} className="w-14 h-14 rounded-xl object-cover bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs opacity-60 font-bold">Qty: {item.quantity}</span>
                          <span className="text-sm font-black text-primary">{item.total} {currency}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

              <div className="grid grid-cols-2 gap-4 px-2">
                <div>
                  <span className="opacity-60 font-bold text-[10px] uppercase tracking-wider block mb-1">{t('paymentMethod', 'Payment')}</span>
                  <span className="font-black text-sm">{orderData.payment_type === 'cash_on_delivery' ? t('cod', 'COD') : orderData.payment_type}</span>
                </div>
                <div className="text-end">
                  <span className="opacity-60 font-bold text-[10px] uppercase tracking-wider block mb-1">{t('grandTotal', 'Grand Total')}</span>
                  <span className="font-black text-xl text-primary">{orderData.total_price} {currency}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full py-5 rounded-[24px] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                onClick={() => {
                  onClose();
                  navigate(`/track-order/${orderData.order_number}`);
                }}
              >
                🚀 {t('trackMyOrder', 'Track My Order')}
              </Button>
              <button
                className="w-full py-2 text-sm font-black opacity-60 hover:opacity-100 transition-opacity"
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
              >
                🏠 {t('backToHome', 'Back to Home')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
