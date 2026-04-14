import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import registerEn from './locales/en/register.json';

import commonAr from './locales/ar/common.json';
import registerAr from './locales/ar/register.json';

// Get current language from local storage, default to 'en'
const currentLanguage = localStorage.getItem('ecommerce-ds-language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        register: registerEn,
      },
      ar: {
        common: commonAr,
        register: registerAr,
      },
    },
    lng: currentLanguage, // initial language
    fallbackLng: 'en',
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
