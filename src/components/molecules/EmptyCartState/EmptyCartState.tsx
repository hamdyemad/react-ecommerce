import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms/Button';

export interface EmptyCartStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyCartState: React.FC<EmptyCartStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  className,
}) => {
  const { t } = useTranslation();
  
  const displayTitle = title || t('cartEmptyTitle', 'Your cart is empty');
  const displayMessage = message || t('cartEmptyMessage', 'Add items to your cart to get started');
  const displayActionLabel = actionLabel || t('startShopping', 'Start Shopping');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Empty Cart Icon */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-text-primary mb-2">{displayTitle}</h3>

      {/* Message */}
      <p className="text-text-secondary mb-6 max-w-sm">{displayMessage}</p>

      {/* Action Button */}
      {onAction && (
        <Button onClick={onAction} variant="primary" size="lg">
          {displayActionLabel}
        </Button>
      )}
    </div>
  );
};

EmptyCartState.displayName = 'EmptyCartState';
