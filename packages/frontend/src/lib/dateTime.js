/**
 * Utilidades centralizadas de fecha/hora para el frontend.
 *
 * Regla del sistema: el backend persiste y devuelve TODO en UTC (turnos,
 * disponibilidad, slots). Es responsabilidad del frontend convertir a la
 * hora LOCAL del navegador de quien está mirando la pantalla para mostrarla,
 * y de convertir a UTC (usando el offset del propio navegador) antes de
 * enviar datos editables (como la disponibilidad de un médico) al backend.
 */

const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

/**
 * Offset del navegador actual, en minutos, con la misma convención que usa
 * el backend: POSITIVO si la hora local está detrás de UTC (ej. Argentina
 * UTC-3 -> +180). Se manda tal cual al backend al guardar disponibilidad.
 */
export function getOffsetMinutosNavegador() {
  return new Date().getTimezoneOffset();
}

/**
 * Formatea un timestamp (ISO string o Date) usando la fecha LOCAL del
 * navegador de quien lo mira, en formato DD/MM/AAAA. Reemplaza las 3 copias
 * de `formatFecha` que había dando vueltas por el proyecto (todas
 * extraían componentes UTC crudos, no la hora local real de quien miraba).
 */
export function formatFechaLocal(fechaHoraISO) {
  if (!fechaHoraISO) return '';
  const d = new Date(fechaHoraISO);
  if (isNaN(d.getTime())) return '';

  // Sin forzar timeZone: el motor de JS usa el huso horario del entorno
  // (el navegador de quien está mirando), que es exactamente lo que queremos.
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * Formatea la hora LOCAL (HH:MM) de un timestamp, para reemplazar el uso del
 * campo `turno.hora` crudo (que ahora llega en UTC desde el backend). Siempre
 * conviene derivar la hora a mostrar desde `turno.fechaHora` (un timestamp
 * real) y no desde un string de hora suelto, porque el timestamp ya trae
 * toda la información necesaria para la conversión correcta a local.
 */
export function formatHoraLocal(fechaHoraISO) {
  if (!fechaHoraISO) return '';
  const d = new Date(fechaHoraISO);
  if (isNaN(d.getTime())) return '';

  const horas = String(d.getHours()).padStart(2, '0');
  const minutos = String(d.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

/**
 * Convierte una franja de disponibilidad en UTC (tal cual la devuelve el
 * backend) a hora LOCAL del navegador, para mostrarla/editarla en el
 * formulario de disponibilidad del médico.
 *
 * Es la operación inversa a `DateUtil.convertirDisponibilidadAUTC` del
 * backend. Puede devolver 2 franjas si la conversión a local hace que la
 * franja cruce la medianoche (mismo caso límite que en el backend, con la
 * misma pérdida de ~1 minuto de precisión en el corte).
 */
export function convertirDisponibilidadALocal({ diaSemana, horaDesde, horaHasta }) {
  const offsetMinutos = -getOffsetMinutosNavegador(); // invertido: UTC -> local

  const idxDia = DIAS_SEMANA.indexOf(String(diaSemana).toUpperCase());
  if (idxDia === -1) return [{ diaSemana, horaDesde, horaHasta }];

  const aMin = (str) => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  };
  const fmt = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const mod1440 = (n) => ((n % 1440) + 1440) % 1440;
  const diaConDelta = (delta) => DIAS_SEMANA[(((idxDia + delta) % 7) + 7) % 7];

  const desdeAbs = aMin(horaDesde) + offsetMinutos;
  const hastaAbs = aMin(horaHasta) + offsetMinutos;

  const diaDesde = Math.floor(desdeAbs / 1440);
  const diaHasta = Math.floor(hastaAbs / 1440);

  if (diaDesde === diaHasta) {
    return [
      {
        diaSemana: diaConDelta(diaDesde),
        horaDesde: fmt(mod1440(desdeAbs)),
        horaHasta: fmt(mod1440(hastaAbs)),
      },
    ];
  }

  return [
    { diaSemana: diaConDelta(diaDesde), horaDesde: fmt(mod1440(desdeAbs)), horaHasta: '23:59' },
    { diaSemana: diaConDelta(diaHasta), horaDesde: '00:00', horaHasta: fmt(mod1440(hastaAbs)) },
  ];
}
