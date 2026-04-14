import React, { forwardRef, useState } from 'react';
import { cn } from '../../../utils/cn';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  /**
   * When set to 'ltr', the input wrapper is forced to LTR regardless of the
   * page direction. Use this for fields like phone numbers that must always
   * render left-to-right (country code on left, digits flowing left to right).
   * The label above the field keeps the page's natural direction.
   */
  inputDir?: 'ltr' | 'rtl';
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, className, leftElement, rightElement, error, type, inputDir, ...props }, ref) => {
    // Built-in toggle for password fields
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const eyeToggle = isPassword ? (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword(v => !v)}
        className="flex items-center justify-center px-3 opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-text-primary)' }}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          // Eye open
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ) : (
          // Eye closed
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        )}
      </button>
    ) : null;

    // Password fields always get the eye at the logical end (right in LTR, left in RTL).
    // Other fields use whatever rightElement is passed.
    const resolvedRightElement = isPassword ? eyeToggle : rightElement;

    return (
      <div className="w-full">
        {label && (
          // Label always follows the PAGE direction (stays in RTL for Arabic pages)
          <label className="block text-sm font-black mb-2 text-[var(--color-text-primary)] uppercase tracking-widest opacity-60">
            {label}
            {props.required && <span className="text-red-500 ms-1">*</span>}
          </label>
        )}

        {/* The wrapper div can be forced to a specific direction via inputDir.
            When inputDir="ltr", all logical CSS (start/end) resolves to physical left/right,
            making leftElement always appear on the physical left regardless of page RTL. */}
        <div className="relative flex items-center" dir={inputDir}>
          {leftElement && (
            <div className="absolute start-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-full">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={cn(
              'w-full px-5 py-4 rounded-2xl font-bold text-base transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-transparent',
              'bg-[var(--color-surface-base)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
              error ? 'border-2 border-red-500' : 'border border-[var(--color-border-DEFAULT)]',
              // Extra start padding when there's a left element
              leftElement ? 'ps-20' : '',
              // Extra end padding when there's a right element (eye or custom)
              resolvedRightElement ? 'pe-12' : '',
              className
            )}
            {...props}
          />
          {resolvedRightElement && (
            <div className="absolute end-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-full">
              {resolvedRightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-bold">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
