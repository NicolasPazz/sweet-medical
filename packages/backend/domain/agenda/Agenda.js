import { logger } from "../../utils/logger.js";
const { crearFechaDesdeAtributos, horaAMinutos, sumarMinutosADate } = require('../utils/functions');

export class Agenda {
  generarTurnosParaEspecialidad(especialidad, medico) {
    
    logger.debug(`Generando turnos para especialidad ${especialidad} y médico ${medico}`);

    return this.generarTurno(especialidad, medico); // Retorna un array de Turno[]
  }

  generarTurnosParaPractica(practica, medico) {
  
    logger.debug(`Generando turnos para práctica ${practica} y médico ${medico}`);

    return this.generarTurno(practica, medico); // Retorna un array de Turno[]
  }

  refrescarTurnosSegunDisponibilidadDe(medico) {
    // TODO
    logger.debug(`Refrescando turnos para médico ${medico}`);
    return []; // Retorna un array de Turno[]
  }

   generarTurno(servicio, medico){

    const turnos = [];

    const offset = servicio.duracionTurnoEnMins;

    for(const disponibilidad of medico.disponibilidades){

      let actualMinutos = horaAMinutos(disponibilidad.horaDesde);
      const tiempoLimite = horaAMinutos(disponibilidad.horaHasta);

      while(actualMinutos + offset <= tiempoLimite){

      const fechaHora = crearFechaDesdeAtributos(disponibilidad.diaSemana, actualMinutos);

      //no se el criterio de eleccion de sede, agarro la primera
      const turno = new Turno(medico, null, fechaHora, null, servicio, servicio.costo);

      turnos.push(turno);

      actualMinutos += offset;
      }
    
    }

    return turnos; // Retorna un array de Turno[]
  }
}
