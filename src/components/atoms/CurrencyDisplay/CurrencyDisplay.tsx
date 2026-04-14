import React from 'react';
import { useDirection } from '../../../hooks/useDirection';

interface CurrencyDisplayProps {
  amount: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCurrency?: boolean;
}

/**
 * Renders a price amount with the active country's currency.
 * If the currency uses an image (use_image: true), it renders the image.
 * Otherwise, it renders the currency code text (e.g. EGP, SAR).
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  size = 'md',
  className = '',
  showCurrency = true,
}) => {
  const { selectedCountry } = useDirection();
  // Fallback to a default if selectedCountry or currency is missing
  const currency = selectedCountry?.currency || { code: '$', use_image: false, image: '' };

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formattedAmount = isNaN(numericAmount) ? '0.00' : numericAmount.toFixed(2);

  const imgSizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {formattedAmount}
      {showCurrency && (
        currency.use_image && currency.image ? (
          <img
            src={currency.image}
            alt={currency.code}
            className={`${imgSizeMap[size]} object-contain inline-block`}
          />
        ) : (
          <span className={`${textSizeMap[size]} font-bold`}>
            {currency.code || '$'}
          </span>
        )
      )}
    </span>
  );
};

CurrencyDisplay.displayName = 'CurrencyDisplay';
