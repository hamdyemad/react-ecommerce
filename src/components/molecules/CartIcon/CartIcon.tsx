import React from 'react';
import { cn } from '@/utils/cn';


export interface CartIconProps {
  itemCount?: number;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const CartIcon: React.FC<CartIconProps> = ({
  itemCount = 0,
  onClick,
  className,
  size = 'md',
}) => {
  const hasItems = itemCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-secondary-100 active:bg-secondary-200',
        className
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg
        className={cn('text-text-primary', sizeClasses[size])}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {hasItems && (
        <span
          className={cn(
            'absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center',
            'bg-error text-white text-xs font-bold rounded-full px-1.5',
            'animate-in zoom-in-50 duration-200'
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

CartIcon.displayName = 'CartIcon';
