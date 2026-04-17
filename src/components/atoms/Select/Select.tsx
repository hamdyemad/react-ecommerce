import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  label?: string;
}

export function Select({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
  error = '',
  label,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => searchInputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    // Create a mock synthetic event to match the expected signature
    const mockEvent = {
       target: {
         name,
         value: optionValue
       }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(mockEvent);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-black mb-2 text-[var(--color-text-primary)] uppercase tracking-widest opacity-60">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      {/* Hidden native select for form submission/validation if needed */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="hidden"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all flex items-center justify-between text-left",
          "bg-[var(--color-surface-base)]",
          error ? "border border-red-500" : "border border-[var(--color-border-DEFAULT)]",
          selectedOption ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]",
          disabled ? "opacity-60 cursor-not-allowed" : "opacity-100 cursor-pointer"
        )}
      >
        <span className="truncate pr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
      )}

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl shadow-lg border border-[var(--color-border-DEFAULT)] overflow-hidden bg-[var(--color-surface-elevated)] backdrop-blur-xl animate-in fade-in zoom-in duration-200"
        >
          {/* Search Box */}
          <div className="p-2 border-b border-[var(--color-border-DEFAULT)] bg-[var(--color-surface-base)]/50">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--color-border-DEFAULT)] bg-[var(--color-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                <div className="text-2xl mb-2">🔎</div>
                No results found for "{searchTerm}"
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm transition-colors duration-150 flex items-center justify-between text-[var(--color-text-primary)] hover:bg-[var(--color-surface-base)]"
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                  {String(value) === String(option.value) && (
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
