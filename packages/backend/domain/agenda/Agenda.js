import { logger } from "../../utils/logger.js";

export class Agenda {
  generarTurnosParaEspecialidad(especialidad, medico) {
    // TODO
    logger.debug(`Generando turnos para especialidad ${especialidad} y médico ${medico}`);
    return []; // Retorna un array de Turno[]
  }

  generarTurnosParaPractica(practica, medico) {
    // TODO
    logger.debug(`Generando turnos para práctica ${practica} y médico ${medico}`);
    return []; // Retorna un array de Turno[]
  }

  refrescarTurnosSegunDisponibilidadDe(medico) {
    // TODO
    logger.debug(`Refrescando turnos para médico ${medico}`);
    return []; // Retorna un array de Turno[]
  }
}
