import i18next from 'i18next';
// Importamos los archivos JSON
import sistemaEs from '../../locales/es/sistema.json' assert { type: 'json' };
import sistemaEn from '../../locales/en/sistema.json' assert { type: 'json' };
import negocioEs from '../../locales/es/negocio.json' assert { type: 'json' };
import negocioEn from '../../locales/en/negocio.json' assert { type: 'json' };

// --- CONFIGURACIÓN MANUAL --- 
const IDIOMA_PARA_LOGS = 'es';    // Puede ser 'es' o 'en'
const IDIOMA_PARA_NEGOCIO = 'es'; // Puede ser 'es' o 'en'
// ----------------------------

i18next.init({
  fallbackLng: 'es',
  ns: ['sistema', 'negocio'],
  resources: {
    es: { sistema: sistemaEs, negocio: negocioEs },
    en: { sistema: sistemaEn, negocio: negocioEn }
  }
});

// Función para traducir logs (usa siempre IDIOMA_PARA_LOGS)
export const tLog = (clave, parametros) => {
  return i18next.t(`sistema:${clave}`, { 
    ...parametros, 
    lng: IDIOMA_PARA_LOGS 
  });
};

// Función para traducir mensajes al usuario (usa siempre IDIOMA_PARA_NEGOCIO)
export const tNegocio = (clave, parametros) => {
  return i18next.t(`negocio:${clave}`, { 
    ...parametros, 
    lng: IDIOMA_PARA_NEGOCIO 
  });
};