import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30",
          disabled ? '' : 'shimmer',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';
