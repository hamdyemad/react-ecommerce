import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Country } from '../types/api';
import i18n from '../i18n';

export type Direction = 'ltr' | 'rtl';
export type Language = 'en' | 'ar';

interface DirectionContextValue {
  direction: Direction;
  language: Language;
  country: string;
  selectedCountry: Country | null;
  setDirection: (direction: Direction) => void;
  setLanguage: (language: Language) => void;
  setCountry: (country: string) => void;
  setSelectedCountry: (country: Country) => void;
  toggleDirection: () => void;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

const DIRECTION_STORAGE_KEY = 'ecommerce-ds-direction';
const LANGUAGE_STORAGE_KEY = 'ecommerce-ds-language';
const COUNTRY_STORAGE_KEY = 'ecommerce-ds-country';
const COUNTRY_DATA_KEY = 'ecommerce-ds-country-data';

// Language to direction mapping
const languageDirectionMap: Record<Language, Direction> = {
  en: 'ltr',
  ar: 'rtl',
};

interface DirectionProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function DirectionProvider({ children, defaultLanguage = 'en' }: DirectionProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') {
        return stored as Language;
      }
    }
    return defaultLanguage;
  });

  const [direction, setDirectionState] = useState<Direction>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DIRECTION_STORAGE_KEY);
      if (stored === 'ltr' || stored === 'rtl') {
        return stored as Direction;
      }
    }
    return languageDirectionMap[defaultLanguage];
  });
  
  const [country, setCountryState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
      if (stored) return stored;
    }
    return 'eg'; // Default country code
  });

  const [selectedCountry, setSelectedCountryState] = useState<Country | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COUNTRY_DATA_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const setDirection = (newDirection: Direction) => {
    setDirectionState(newDirection);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DIRECTION_STORAGE_KEY, newDirection);
    }
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    // Automatically update direction based on language
    const newDirection = languageDirectionMap[newLanguage];
    setDirection(newDirection);
    
    // Sync with i18next
    if (i18n.changeLanguage) {
      i18n.changeLanguage(newLanguage);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      // Reload the page to ensure all components and API requests 
      // fetch fresh data using the new language.
      window.location.reload();
    }
  };

  const setCountry = (newCountry: string) => {
    setCountryState(newCountry);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUNTRY_STORAGE_KEY, newCountry);
    }
  };

  const setSelectedCountry = (newCountry: Country) => {
    setSelectedCountryState(newCountry);
    setCountryState(newCountry.code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUNTRY_STORAGE_KEY, newCountry.code);
      localStorage.setItem(COUNTRY_DATA_KEY, JSON.stringify(newCountry));
    }
  };

  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
  };

  // Apply direction to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', direction);
    root.setAttribute('lang', language);
  }, [direction, language]);

  return (
    <DirectionContext.Provider
      value={{ direction, language, country, selectedCountry, setDirection, setLanguage, setCountry, setSelectedCountry, toggleDirection }}
    >
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionContextValue {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
}
