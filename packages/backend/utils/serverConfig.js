/** Configuración de servidor leída desde variables de entorno (deploy: cambiar .env o vars en AWS). */

export function getPort() {
  const parsed = parseInt(process.env.PORT, 10);
  return Number.isFinite(parsed) ? parsed : 3001;
}

export function getHost() {
  return process.env.HOST || '0.0.0.0';
}

export function getPublicBaseUrl(port = getPort()) {
  const configured = process.env.API_PUBLIC_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return `http://localhost:${port}`;
}
