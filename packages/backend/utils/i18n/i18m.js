import i18next from 'i18next';
import negocioEs from './locales/es/negocio.json' with { type: 'json' };
import negocioEn from './locales/en/negocio.json' with { type: 'json' };

// Configuración de idioma por defecto para la lógica de negocio
const IDIOMA_DEFAULT = 'es';

i18next.init({
  lng: IDIOMA_DEFAULT,
  fallbackLng: 'es',
  resources: {
    es: { translation: negocioEs },
    en: { translation: negocioEn }
  }
});

// Función única para traducir mensajes del negocio (notificaciones, errores, etc.)
export const t = (clave, parametros) => {
  return i18next.t(clave, parametros);
};

export default i18next;