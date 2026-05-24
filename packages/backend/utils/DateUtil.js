export class DateUtil {
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
}
