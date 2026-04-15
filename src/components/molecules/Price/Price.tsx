import React from 'react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/atoms/Badge';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

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

export const Price: React.FC<PriceProps> = ({
  amount,
  originalAmount,
  size = 'md',
  showDiscount = true,
  className,
}) => {
  const hasDiscount = originalAmount && originalAmount > amount;
  const discountPercentage = hasDiscount
    ? Math.round(((originalAmount - amount) / originalAmount) * 100)
    : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'font-bold text-text-primary flex items-center gap-1',
          sizeClasses[size],
          hasDiscount && 'text-error'
        )}
      >
        <CurrencyDisplay amount={amount} size={size} />
      </span>

      {hasDiscount && originalAmount && (
        <>
          <span
            className={cn(
              'font-medium text-text-tertiary line-through flex items-center gap-0.5',
              originalSizeClasses[size]
            )}
          >
            <CurrencyDisplay amount={originalAmount} size="sm" showCurrency={false} />
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
