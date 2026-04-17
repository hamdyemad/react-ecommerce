import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { useDirection } from '../../../hooks/useDirection';
import { tokens } from '../../../tokens';
import { PriceBreakdown } from '../../molecules/PriceBreakdown';
import { orderService } from '../../../services/orderService';
import { toast } from 'react-hot-toast';

import { ProductThumbnail } from '../../molecules/ProductThumbnail';

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  total: number;
  appliedPromo?: any;
  setAppliedPromo: (promo: any) => void;
  onAction: () => void;
  actionLabel: string;
  actionLoading?: boolean;
  shippingCost?: number;
  isCalculatingShipping?: boolean;
  showItems?: boolean;
  isCheckout?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  total,
  appliedPromo,
  setAppliedPromo,
  onAction,
  actionLabel,
  actionLoading = false,
  shippingCost = 0,
  isCalculatingShipping = false,
  showItems = false,
  isCheckout = false,
}) => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { selectedCountry } = useDirection();
  const currency = selectedCountry?.currency;

  const [promoInput, setPromoInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplying(true);
    try {
      const res = await orderService.checkPromoCode(promoInput);
      if (res.status) {
        setAppliedPromo(res.data);
        toast.success(t('promoAppliedSuccess', 'Promo code applied successfully!'));
        setPromoInput('');
      } else {
        toast.error(res.message || t('invalidPromoCode', 'Invalid promo code'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('promoCodeError', 'Error applying promo code'));
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success(t('promoRemoved', 'Promo code removed'));
  };

  return (
    <div 
      className="rounded-[24px] sm:rounded-[38px] md:rounded-[45px] p-4 sm:p-7 md:p-10 sticky top-24 shadow-xl md:shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: tokens.colors[mode].surface.elevated,
        backdropFilter: 'blur(30px)',
        border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
      }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24" />
      
      <h2 
        className="text-lg sm:text-xl md:text-2xl font-black mb-5 md:mb-8 relative z-10 flex items-center gap-3"
        style={{ color: tokens.colors[mode].text.primary }}
      >
        🧾 {t('orderSummary')}
      </h2>

      {/* Items List (Optional - usually for Checkout sidebar) */}
      {showItems && items.length > 0 && (
        <div className="space-y-3 mb-5 md:mb-8 max-h-[250px] overflow-y-auto pr-2 no-scrollbar border-b border-slate-100 dark:border-slate-800 pb-4 md:pb-6 relative z-10">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <ProductThumbnail 
                 image={item.image} 
                 name={item.title} 
                 size="sm" 
                 className="w-14 h-14 bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                {item.variant && (
                  <p className="text-[10px] font-bold opacity-60 mb-1 leading-tight line-clamp-1">
                    {item.variant}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-60 font-bold">{t('qty', 'Qty')}: {item.quantity}</p>
                  <p className="text-sm font-black text-primary">
                    {(item.price * item.quantity).toFixed(2)} {shippingCost > 0 || isCheckout ? currency?.code : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="mb-5 md:mb-8 relative z-10">
        <PriceBreakdown
          subtotal={subtotal}
          discount={Math.max(0, subtotal - total)}
          tax={Math.max(0, total - subtotal)}
          shippingCost={shippingCost}
          total={total + shippingCost}
          isCalculatingShipping={isCalculatingShipping}
        />
      </div>

      {/* Promo Code Section — BEFORE the action button */}
      <div className="relative z-10 mb-4 md:mb-6">
        <label 
          className="block text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-3 px-1"
          style={{ color: tokens.colors[mode].text.tertiary }}
        >
          {t('promoCode')}
        </label>
        
        {appliedPromo ? (
          <div 
            className="p-3 sm:p-4 rounded-2xl flex items-center justify-between animate-fadeIn"
            style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <p className="font-black text-xs uppercase tracking-widest text-green-600">{appliedPromo.code}</p>
                <p className="text-[10px] font-bold opacity-60">
                  {appliedPromo.discount_type === 'percent' 
                    ? `${appliedPromo.discount_value}% OFF`
                    : `${appliedPromo.discount_value} OFF`}
                </p>
              </div>
            </div>
            <button 
              onClick={handleRemovePromo}
              className="p-1.5 sm:p-2 hover:bg-black/5 rounded-lg transition-colors"
              title={t('remove')}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="relative group">
            <input
              type="text"
              placeholder={t('enterCode')}
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
              className="w-full pl-4 sm:pl-6 pr-24 sm:pr-32 py-3 sm:py-4 rounded-[16px] sm:rounded-[20px] font-black transition-all focus:ring-8 outline-none shadow-md sm:shadow-xl text-sm"
              style={{
                background: tokens.colors[mode].surface.base,
                color: tokens.colors[mode].text.primary,
                border: `2px solid ${tokens.colors[mode].border.DEFAULT}`,
                '--tw-ring-color': `${tokens.colors[mode].primary.DEFAULT}10`
              } as any}
            />
            <button
              onClick={handleApplyPromo}
              disabled={isApplying || !promoInput.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-6 rounded-xl font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md text-sm disabled:opacity-50"
              style={{
                background: tokens.gradients.primary,
                color: '#ffffff'
              }}
            >
              {isApplying ? '...' : t('apply')}
            </button>
          </div>
        )}
      </div>

      {isCheckout && (
        <p className="text-[10px] sm:text-xs text-center mb-4 opacity-60 font-medium px-4 leading-relaxed relative z-10">
          {t('common:agreeTerms').split(t('common:termsAndConditions')).map((part, index, array) => (
            <React.Fragment key={index}>
              {part}
              {index < array.length - 1 && (
                <Link 
                  to="/terms" 
                  className="text-primary hover:underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('common:termsAndConditions')}
                </Link>
              )}
            </React.Fragment>
          ))}
        </p>
      )}

      {/* Action Button (Checkout or Place Order) — AFTER promo code */}
      <button
        onClick={onAction}
        disabled={actionLoading}
        className="w-full py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-xl hover:shadow-primary/40 relative z-10 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: tokens.gradients.primary,
          color: '#ffffff',
        }}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="relative z-10 flex items-center justify-center gap-3">
          {actionLoading ? '...' : actionLabel}
        </span>
      </button>
    </div>
  );
};
