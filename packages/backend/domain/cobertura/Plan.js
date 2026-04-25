import { logger } from "../../utils/logger.js";

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
    const cobertura = this.coberturasEspecialidad.find(
      (c) => c.especialidad.id === especialidad.id
    );
    logger.debug(
      `Nivel Cobertura encontrada para la especialidad ${especialidad.nombre}:`,
      cobertura?.nivel
    );
    return cobertura?.nivel;
  }

  obtenerCoberturaPorPractica(practica) {
    const cobertura = this.coberturasPractica.find((c) => c.practica.id === practica.id);
    logger.debug(`Cobertura encontrada para la práctica ${practica.nombre}:`, cobertura?.nivel);
    return cobertura?.nivel;
  }
}
