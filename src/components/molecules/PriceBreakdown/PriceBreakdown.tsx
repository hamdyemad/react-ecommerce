import React from 'react';
import { cn } from '@/utils/cn';
import { useDirection } from '@/hooks/useDirection';
import { useTranslation } from 'react-i18next'; // ← added import

export interface PriceBreakdownProps {
  subtotal: number;
  total: number;
  discount?: number;
  shippingCost?: number;
  isCalculatingShipping?: boolean;
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  total,
  discount = 0,
  shippingCost = 0,
  isCalculatingShipping = false,
  className,
}) => {
  const { selectedCountry } = useDirection();
  const { t } = useTranslation();
  const currency = selectedCountry?.currency;

  const renderAmount = (value: number) => {
    const code = currency?.code ?? '$';
    if (currency?.use_image && currency?.image) {
      return (
        <span className="inline-flex items-center gap-1">
          {value.toFixed(2)}
          <img src={currency.image} alt={code} className="w-3.5 h-3.5 object-contain" />
        </span>
      );
    }
    return <span>{value.toFixed(2)} <span className="text-xs font-bold">{code}</span></span>;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Subtotal */}
      <div className="flex items-center justify-between text-text-secondary">
        <span className="text-sm">{t('subtotal')}</span>
        <span className="text-sm font-medium">{renderAmount(subtotal)}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex items-center justify-between text-green-600">
          <span className="text-sm italic">{t('discount')}</span>
          <span className="text-sm font-medium">-{renderAmount(discount)}</span>
        </div>
      )}

      {/* Shipping */}
      {(shippingCost > 0 || isCalculatingShipping) && (
        <div className="flex items-center justify-between text-text-secondary">
          <span className="text-sm">{t('shipping')}</span>
          <span className="text-sm font-medium">
            {isCalculatingShipping ? (
              <span className="animate-pulse opacity-50 italic">{t('calculatingShipping')}</span>
            ) : (
              renderAmount(shippingCost)
            )}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t" />

      {/* Total */}
      <div className="flex items-center justify-between text-text-primary">
        <span className="text-base font-semibold">{t('total')}</span>
        <span className="text-lg font-bold">{renderAmount(total)}</span>
      </div>
    </div>
  );
};