import React from 'react';
import { cn } from '@/utils/cn';
import { useDirection } from '@/hooks/useDirection';
import { Badge } from '@/components/atoms/Badge';

export interface PriceProps {
  amount: number;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const originalSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const imgSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Price: React.FC<PriceProps> = ({
  amount,
  originalAmount,
  size = 'md',
  showDiscount = true,
  className,
}) => {
  const { selectedCountry } = useDirection();
  const currency = selectedCountry?.currency;

  const hasDiscount = originalAmount && originalAmount > amount;
  const discountPercentage = hasDiscount
    ? Math.round(((originalAmount - amount) / originalAmount) * 100)
    : 0;

  const renderCurrencySymbol = (small = false) => {
    if (!currency) return <span className="text-xs font-bold">$</span>;
    if (currency.use_image && currency.image) {
      return (
        <img
          src={currency.image}
          alt={currency.code}
          className={cn('object-contain inline-block', small ? imgSizeClasses.sm : imgSizeClasses[size])}
        />
      );
    }
    return (
      <span className={cn('font-bold', small ? 'text-[10px]' : 'text-xs')}>
        {currency.code}
      </span>
    );
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'font-bold text-text-primary flex items-center gap-1',
          sizeClasses[size],
          hasDiscount && 'text-error'
        )}
      >
        {amount.toFixed(2)} {renderCurrencySymbol()}
      </span>

      {hasDiscount && (
        <>
          <span
            className={cn(
              'font-medium text-text-tertiary line-through flex items-center gap-0.5',
              originalSizeClasses[size]
            )}
          >
            {originalAmount.toFixed(2)} {renderCurrencySymbol(true)}
          </span>

          {showDiscount && discountPercentage > 0 && (
            <Badge variant="error" size="sm">
              -{discountPercentage}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

Price.displayName = 'Price';
