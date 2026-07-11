const DEV_FALLBACK_API_URL = 'http://localhost:3001';
const BACKEND_PORT = 3001;

// Patrones de hostname para túneles: capturan el prefijo antes del puerto y
// el sufijo del dominio, para poder reconstruir la URL del backend a partir
// de la URL del frontend cuando ambos se comparten vía VS Code Port
// Forwarding o GitHub Codespaces. Formatos típicos:
//   VS Code Dev Tunnels:  <id>-3000.<region>.devtunnels.ms
//   GitHub Codespaces:    <id>-3000.app.github.dev
const PATRONES_TUNEL = [
  /^(.+)-(\d+)(\.[\w.-]*devtunnels\.ms)$/,
  /^(.+)-(\d+)(\.app\.github\.dev)$/,
];

/**
 * Si la app se está sirviendo desde un túnel (VS Code Port Forwarding o
 * Codespaces), reconstruye la URL del backend reemplazando el puerto del
 * frontend por el del backend en el mismo hostname de túnel. Devuelve `null`
 * si el hostname actual no matchea ninguno de los patrones conocidos.
 */
function detectarApiUrlDeTunel() {
  if (typeof window === 'undefined') return null;

  const { hostname, protocol } = window.location;

  for (const patron of PATRONES_TUNEL) {
    const match = hostname.match(patron);
    if (match) {
      const [, prefijo, , sufijo] = match;
      return `${protocol}//${prefijo}-${BACKEND_PORT}${sufijo}`;
    }
  }

  return null;
}

export function getApiBaseUrl() {
  // 1) Si hay una URL explícita configurada (deploy real, override manual),
  //    esa siempre gana.
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  // 2) Si no hay configuración explícita, intentamos detectar automáticamente
  //    si estamos accediendo vía un túnel compartido y derivar la URL del
  //    backend a partir de la URL del frontend, así dos compañeros pueden
  //    trabajar juntos sin tener que reeditar el .env en cada sesión.
  const apiUrlDeTunel = detectarApiUrlDeTunel();
  if (apiUrlDeTunel) {
    return apiUrlDeTunel;
  }

  // 3) Fallback de desarrollo local de siempre.
  return DEV_FALLBACK_API_URL;
}

export function apiUrl(path) {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
