/**
 * Utilidades centralizadas de fecha/hora para el frontend.
 **/

const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

/**
 * Formatea un timestamp (ISO string o Date) usando los componentes UTC,
 * en formato DD/MM/AAAA. Todo el proyecto muestra fecha/hora en UTC (no en
 * el huso horario local del navegador) para evitar inconsistencias entre
 * usuarios en distintas zonas horarias. Ver también `formatHoraUTC`.
 */
export function formatFechaUTC(fechaHoraISO) {
  if (!fechaHoraISO) return '';
  const d = new Date(fechaHoraISO);
  if (isNaN(d.getTime())) return '';

  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const anio = d.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

export function formatHoraUTC(fechaHoraISO) {
  if (!fechaHoraISO) return '';
  const d = new Date(fechaHoraISO);
  if (isNaN(d.getTime())) return '';

  const horas = String(d.getUTCHours()).padStart(2, '0');
  const minutos = String(d.getUTCMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}
