import i18next from 'i18next';
import es from '../../locales/es.json' assert { type: 'json' };
import en from '../../locales/en.json' assert { type: 'json' };

i18next.init({
  lng: 'es', // Por defecto en español
  fallbackLng: 'en',
  resources: {
    es: { translation: es },
    en: { translation: en }
  }
});

export default i18next;