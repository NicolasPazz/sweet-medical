import { logger } from '../../utils/logger.js';

export class Plan {
  id;
  nombre;
  coberturasEspecialidad;
  coberturasPractica;

  constructor(nombre) {
    this.nombre = nombre;
    this.coberturasEspecialidad = [];
    this.coberturasPractica = [];
  }

  obtenerCoberturaPorEspecialidad(especialidad) {
    const especialidadId = especialidad?.id ?? especialidad?._id;
    const cobertura = this.coberturasEspecialidad.find((c) => {
      const actualId = c.especialidad?.id ?? c.especialidad?._id;
      return String(actualId) === String(especialidadId);
    });
    logger.debug(
      `Nivel Cobertura encontrada para la especialidad ${especialidad?.nombre}:`,
      cobertura?.nivel,
    );
    return cobertura?.nivel;
  }

  obtenerCoberturaPorPractica(practica) {
    const practicaId = practica?.id ?? practica?._id;
    const cobertura = this.coberturasPractica.find((c) => {
      const actualId = c.practica?.id ?? c.practica?._id;
      return String(actualId) === String(practicaId);
    });
    logger.debug(`Cobertura encontrada para la práctica ${practica?.nombre}:`, cobertura?.nivel);
    return cobertura?.nivel;
  }

  /**
   * Método polimórfico - delegará el cálculo final dependiendo de la naturaleza del plan.
   * @param {Object} prestacion - Especialidad o Práctica
   * @param {String} tipo - 'especialidad' o 'practica'
   * @returns {Object} { nivel: String, costo: Number }
   */
  calcularCosto() {
    throw new Error('calcularCosto debe ser implementado por subclases');
  }
}
