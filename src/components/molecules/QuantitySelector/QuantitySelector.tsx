import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  error,
  className,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync internal state with external value prop
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    const numValue = parseInt(inputVal, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (numValue > max) {
      setInputValue(max.toString());
      onChange(max);
    } else {
      setInputValue(numValue.toString());
    }
  };

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <div
        className={cn(
          'inline-flex items-center border rounded-lg',
          error ? 'border-error' : 'border-border',
          disabled && 'opacity-50'
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isMinReached}
          className={cn(
            'h-10 w-10 flex items-center justify-center text-text-primary hover:bg-secondary-100 transition-colors rounded-l-lg disabled:cursor-not-allowed disabled:opacity-50',
            !disabled && !isMinReached && 'active:bg-secondary-200'
          )}
          aria-label="Decrease quantity"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          className={cn(
            'h-10 w-12 text-center border-x border-border bg-transparent text-text-primary font-medium focus:outline-none focus:bg-secondary-50 disabled:cursor-not-allowed'
          )}
          aria-label="Quantity"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || isMaxReached}
          className={cn(
            'h-10 w-10 flex items-center justify-center text-text-primary hover:bg-secondary-100 transition-colors rounded-r-lg disabled:cursor-not-allowed disabled:opacity-50',
            !disabled && !isMaxReached && 'active:bg-secondary-200'
          )}
          aria-label="Increase quantity"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

QuantitySelector.displayName = 'QuantitySelector';
