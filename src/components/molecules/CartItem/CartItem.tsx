import React from 'react';
import { cn } from '@/utils/cn';
import { QuantitySelector } from '@/components/molecules/QuantitySelector';
import { Price } from '@/components/molecules/Price';
import { useDirection } from '@/hooks/useDirection';

export interface CartItemProps {
  id: string;
  image: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
  maxQuantity?: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const CartItem: React.FC<CartItemProps> = ({
  id,
  image,
  title,
  variant,
  price,
  quantity,
  maxQuantity = 99,
  onQuantityChange,
  onRemove,
  disabled = false,
  loading = false,
  className,
}) => {
  const totalPrice = price * quantity;
  const { selectedCountry } = useDirection();
  const currency = selectedCountry?.currency;

  return (
    <div
      className={cn(
        'flex gap-3 sm:gap-4 bg-surface-base border border-border rounded-xl transition-all shadow-sm hover:shadow-md',
        disabled && 'opacity-50',
        loading && 'animate-pulse',
        className
      )}
    >
      {/* Image and Loading Overlay */}
      <div className="flex-shrink-0 relative">
        <img
          src={image}
          alt={title}
          className={cn(
            "w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg bg-secondary-50 shadow-sm transition-opacity duration-300",
            loading && "opacity-30"
          )}
          loading="lazy"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1 space-y-2 sm:space-y-3">
        {/* Title and Remove Button */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-text-primary truncate">
              {title}
            </h3>
            {variant && (
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">{variant}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(id)}
            disabled={disabled || loading}
            className={cn(
              'flex-shrink-0 p-1.5 sm:p-2 text-text-tertiary hover:text-error hover:bg-error-50 transition-all rounded-lg',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label="Remove item"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <QuantitySelector
            value={quantity}
            onChange={(newQuantity) => onQuantityChange(id, newQuantity)}
            min={1}
            max={maxQuantity}
            disabled={disabled || loading}
          />

          <div className="text-right">
            <Price amount={totalPrice} size="md" />
            {quantity > 1 && (
              <p className="text-xs text-text-tertiary mt-0.5 flex items-center justify-end gap-0.5">
                {price.toFixed(2)}
                {currency && (
                  currency.use_image && currency.image ? (
                    <img src={currency.image} alt={currency.code} className="w-3 h-3 object-contain" />
                  ) : (
                    <span className="font-bold">{currency.code}</span>
                  )
                )}
                {' each'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CartItem.displayName = 'CartItem';
