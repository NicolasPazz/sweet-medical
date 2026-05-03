import { logger } from "../../utils/logger.js";
import { tLog, tNegocio } from "../../utils/i18n/i18n.js";

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
      tLog('LOG_COBERTURA_ENCONTRADA', { 
        especialidad: especialidad.nombre, 
        nivel: cobertura?.nivel 
      })
    );
    return cobertura?.nivel;
  }

  obtenerCoberturaPorPractica(practica) {
    const cobertura = this.coberturasPractica.find((c) => c.practica.id === practica.id);
    logger.debug(tLog('LOG_COBERTURA_ENCONTRADA', { 
      practica: practica.nombre, 
      nivel: cobertura?.nivel 
    }));
    return cobertura?.nivel;
  }
}
