import React from 'react';
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
  title = 'Your cart is empty',
  message = 'Add items to your cart to get started',
  actionLabel = 'Start Shopping',
  onAction,
  className,
}) => {
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
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

      {/* Message */}
      <p className="text-text-secondary mb-6 max-w-sm">{message}</p>

      {/* Action Button */}
      {onAction && (
        <Button onClick={onAction} variant="primary" size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

EmptyCartState.displayName = 'EmptyCartState';
