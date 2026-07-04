export class DateUtil {
  static DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  /**
   * Convierte una franja de disponibilidad expresada en hora LOCAL del navegador
   * (diaSemana + horaDesde + horaHasta) a hora UTC, usando el offset que reporta
   * el propio navegador (`new Date().getTimezoneOffset()`, en minutos).
   *
   * Convención de `getTimezoneOffset()`: es POSITIVO cuando la hora local está
   * DETRÁS de UTC (ej: Argentina UTC-3 -> +180). Por lo tanto:
   *   UTC = local + offsetMinutos
   *
   * Si el offset hace que la franja cruce la medianoche (empieza en un día
   * calendario UTC y termina en el siguiente), se devuelve un ARRAY con la
   * franja partida en dos, contiguas, para que el resto del sistema (que
   * asume que cada franja vive en un único día) siga funcionando sin cambios.
   * Nota: la partición usa 23:59/00:00 como límite (no existe '24:00' en
   * formato HH:MM), por lo que en el caso límite de un cruce de medianoche se
   * pierde 1 minuto de precisión en el corte. Es un trade-off aceptado dado
   * que los inputs de hora del front tampoco permiten cargar '24:00'.
   *
   * @param {{diaSemana: string, horaDesde: string, horaHasta: string}} disponibilidad
   * @param {number} offsetMinutos
   * @returns {Array<{diaSemana: string, horaDesde: string, horaHasta: string}>}
   */
  static convertirDisponibilidadAUTC({ diaSemana, horaDesde, horaHasta }, offsetMinutos) {
    const diasArr = DateUtil.DIAS_SEMANA;
    const idxDia = diasArr.indexOf(String(diaSemana).toUpperCase());
    if (idxDia === -1) throw new Error(`Día de la semana inválido: ${diaSemana}`);

    const offset = Number(offsetMinutos) || 0;

    const aMin = (str) => {
      const [h, m] = str.split(':').map(Number);
      return h * 60 + m;
    };
    const fmt = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
    const mod1440 = (n) => ((n % 1440) + 1440) % 1440;
    const diaConDelta = (delta) => diasArr[(((idxDia + delta) % 7) + 7) % 7];

    const desdeAbs = aMin(horaDesde) + offset;
    const hastaAbs = aMin(horaHasta) + offset;

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

  /**
   * Extrae la fecha en formato YYYY-MM-DD de un Date o String
   * sin riesgo de desfase por Timezone si la entrada ya es una fecha local.
   * Si es un Date, se asume que su UTC interno representa la fecha correcta (ej: mediodía UTC).
   * @param {Date|string} dateInput
   * @returns {string|null}
   */
  static toYYYYMMDD(dateInput) {
    if (!dateInput) return null;

    // Si ya es un string YYYY-MM-DD, lo retornamos tal cual (previniendo cortes)
    if (typeof dateInput === 'string') {
      const match = dateInput.match(/^\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : null;
    }

    // Si es un objeto Date válido
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput.toISOString().split('T')[0];
    }

    return null;
  }

  /**
   * Extrae la hora en formato HH:MM
   * @param {Date|string} dateInput
   * @returns {string|null}
   */
  static toHHMM(dateInput) {
    if (!dateInput) return null;

    if (typeof dateInput === 'string') {
      // Si viene con formato extendido, ej: 2026-05-24T09:30:00Z
      const timeMatch = dateInput.match(/T(\d{2}:\d{2})/);
      if (timeMatch) return timeMatch[1];
      // Si viene solo hora: 09:30
      if (/^\d{2}:\d{2}$/.test(dateInput)) return dateInput;
    }

    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput.toISOString().split('T')[1].substring(0, 5);
    }

    return null;
  }

  /**
   * Calcula el límite superior (fechaHasta) sumando N días a una fecha base.
   * Retorna formato YYYY-MM-DD.
   * @param {string|Date} baseDate
   * @param {number} daysToAdd
   * @returns {string}
   */
  static addDaysToYYYYMMDD(baseDate, daysToAdd) {
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) return null;

    d.setDate(d.getDate() + daysToAdd);
    return this.toYYYYMMDD(d);
  }

  /**
   * Formatea una fecha/hora en el timezone de Argentina, para mostrar en
   * mensajes de notificaciones (evita el desfase de día por diferencia UTC-3).
   * @param {Date|string} dateInput
   * @param {object} [opts]
   * @param {boolean} [opts.conHora] - si es true, incluye "a las HH:MM"
   * @returns {string}
   */
  static formatearFechaAR(dateInput, { conHora = false } = {}) {
    if (!dateInput) return '';

    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const fecha = date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    if (!conHora) return fecha;

    const hora = date.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${fecha} a las ${hora}`;
  }

}
