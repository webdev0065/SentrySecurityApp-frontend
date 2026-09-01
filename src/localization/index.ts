import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import hi from './hi';
import pa from './pa';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',

  resources: {
    en,
    hi,
    pa,
  },

  lng: 'en',
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
