import React from 'react';
import { cn } from '@/utils/cn';
import { useDirection } from '@/hooks/useDirection';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border bg-white text-text-primary placeholder:text-text-tertiary',
        filled: 'border-transparent bg-secondary-100 text-text-primary placeholder:text-text-tertiary',
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
      },
      hasError: {
        true: 'border-error focus:ring-error-500',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      hasError: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const { direction } = useDirection();
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-tertiary',
                direction === 'rtl' ? 'right-3' : 'left-3'
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, inputSize, hasError: !!error }),
              leftIcon && (direction === 'rtl' ? 'pr-10' : 'pl-10'),
              rightIcon && (direction === 'rtl' ? 'pl-10' : 'pr-10'),
              className
            )}
            aria-invalid={!!error}
            aria-describedby={cn(errorId, helperId)}
            {...props}
          />
          
          {rightIcon && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-tertiary',
                direction === 'rtl' ? 'left-3' : 'right-3'
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
